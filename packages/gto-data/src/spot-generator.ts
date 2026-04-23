import type { CardCode, ComboKey, Position, TableFormat } from '@gto/poker-core';
import { RANKS, SUITS } from '@gto/poker-core';
import { allCombos } from './combos';
import { getPreflopChart, type PreflopStrategyJson } from './preflop';
import {
  DEFENSE_PAIRINGS,
  getDefenseChart,
  type BbDefenseStrategyJson,
  type DefensePairing,
} from './bb-defense';
import { listPostflopSpots, type PostflopSpot } from './postflop';
import {
  availableActionsFromNode,
  callSizeFromPreActions,
  collapseForCombo,
  getQbTree,
  parseNodeKey,
  raiseSizeFromNode,
  type ParsedNode,
} from './qb-tree';

export type AvailableAction = 'fold' | 'check' | 'call' | 'raise' | 'allin';

export type Scenario =
  | 'rfi' // open-raise first in
  | 'vs_open' // defending vs opener (BB, SB, etc.)
  | 'vs_3bet' // opener facing a 3bet (4bet/call/fold decision)
  | 'vs_4bet' // 3bettor facing a 4bet (5bet/call/fold)
  | 'vs_squeeze' // caller facing a squeeze from a later seat
  | 'vs_allin'; // facing an all-in shove (call/fold only)

/** A single action taken before the hero's decision. Lets the UI
 *  render a "CO 2.5bb · BTN 8.5bb" ribbon so 3bet/4bet pots read
 *  coherently. */
export interface PreAction {
  readonly actor: Position;
  readonly action: string; // "2.5bb" | "Call" | "8.5bb" | "AllIn" | "FOLD"
}

export interface TrainingSpot {
  readonly id: string;
  readonly combo: ComboKey;
  readonly hero: readonly [CardCode, CardCode];
  readonly position: Position;
  readonly format: TableFormat;
  readonly stackBB: number;
  readonly scenario: Scenario;
  /** For vs_open scenarios: who opened, and to what size. */
  readonly opener?: Position;
  readonly openSize?: number;
  /** Size (BB) to display on the "raise" button — defaults to a
   *  scenario-appropriate number when omitted. Set for deep nodes
   *  (4bet / 5bet) so the label reads "레이즈 21bb" instead of
   *  a hardcoded default. */
  readonly raiseSize?: number;
  /** Every action prior to hero's decision. Empty for RFI. */
  readonly preActions?: readonly PreAction[];
  /** Pot before hero acts (BB). Used by 3bet/4bet/allin scenarios
   *  to show "pot 22BB · invest 19BB" style headers. */
  readonly potBB?: number;
  readonly gtoRaise: number;
  readonly gtoFold: number;
  /** For vs_open and deeper scenarios: call frequency. */
  readonly gtoCall?: number;
  /** Deeper reraise lines include a non-trivial all-in option. */
  readonly gtoAllIn?: number;
  readonly correctAnswer: 'raise' | 'call' | 'fold' | 'allin' | 'mixed';
  /** Which action buttons the UI should offer the user. */
  readonly availableActions: readonly AvailableAction[];
}

const POSITIONS_9MAX: Position[] = ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB'];
const POSITIONS_6MAX: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB'];

/** Mulberry32 — tiny deterministic PRNG. */
function seeded(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Turn a YYYY-MM-DD string into a 32-bit seed. Stable across clients. */
export function seedFromDate(date: Date | string): number {
  const iso = typeof date === 'string' ? date : date.toISOString().slice(0, 10);
  let h = 2166136261;
  for (let i = 0; i < iso.length; i++) {
    h ^= iso.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Pick two concrete cards that instantiate a combo key (e.g. "AKs" → [As, Ks]). */
function comboToCards(combo: ComboKey, rng: () => number): readonly [CardCode, CardCode] {
  const r1 = combo[0];
  const r2 = combo[1];
  const suffix = combo.length === 3 ? combo[2] : undefined;
  if (!r1 || !r2) throw new Error(`Invalid combo: ${combo}`);

  // Pair: two distinct suits
  if (!suffix) {
    const suits = [...SUITS];
    const i1 = Math.floor(rng() * suits.length);
    const s1 = suits.splice(i1, 1)[0]!;
    const i2 = Math.floor(rng() * suits.length);
    const s2 = suits[i2]!;
    return [`${r1}${s1}` as CardCode, `${r2}${s2}` as CardCode];
  }

  // Suited: shared suit
  if (suffix === 's') {
    const suit = SUITS[Math.floor(rng() * SUITS.length)]!;
    return [`${r1}${suit}` as CardCode, `${r2}${suit}` as CardCode];
  }

  // Offsuit: two different suits
  const s1 = SUITS[Math.floor(rng() * SUITS.length)]!;
  const others = SUITS.filter((s) => s !== s1);
  const s2 = others[Math.floor(rng() * others.length)]!;
  return [`${r1}${s1}` as CardCode, `${r2}${s2}` as CardCode];
}

/**
 * Classify a raise frequency into "primary" decision classes.
 * Only the narrow 50/50 band counts as truly mixed — any clear lean
 * (e.g. 70/30) has a dominant action and should not be graded as "both OK".
 */
export function classifyAnswer(raise: number): 'raise' | 'fold' | 'mixed' {
  if (Math.abs(raise - 0.5) <= 0.05) return 'mixed';
  return raise > 0.5 ? 'raise' : 'fold';
}

/**
 * Combos that are trivial everywhere — any player above beginner level
 * raises these from any position. Excluded from the daily lineup because
 * they teach nothing.
 */
const UNIVERSAL_RAISES: ReadonlySet<string> = new Set(['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo']);

/**
 * "Mixedness" score — how close is the raise frequency to a 50/50 coin flip?
 *   raise=0.5  → 1.0  (maximally educational, true mixed strategy)
 *   raise=0.75 → 0.5  (borderline, still teachable)
 *   raise=1.0  → 0.0  (trivial raise)
 *   raise=0.0  → 0.0  (trivial fold)
 */
function mixedness(raise: number): number {
  return 1 - Math.abs(raise - 0.5) * 2;
}

/**
 * Pick an educational combo. Excludes universal trivials (AA, 72o, etc.)
 * and samples the remaining pool nearly uniformly so the player sees the
 * full spectrum of ratios — 20/80, 50/50, 80/20 all have comparable odds.
 *
 * Previously we weighted 50/50 spots 14× harder, which caused the lineup
 * to feel monotone ("everything is always mixed"). Flat sampling exposes
 * the true shape of the range instead.
 */
function pickCombo(
  chart: PreflopStrategyJson,
  rng: () => number,
  difficulty: 'normal' | 'hard' = 'hard',
): ComboKey {
  const scored: Array<{ combo: ComboKey; weight: number }> = [];
  for (const c of allCombos()) {
    if (UNIVERSAL_RAISES.has(c)) continue;
    const r = chart[c]?.raise ?? 0;
    // Skip universal-fold combos: raise=0 hands are free-decision noise.
    if (r === 0) continue;
    // Also skip near-100% combos that aren't universal but are still trivial
    // at this position (e.g. AQs UTG is 100% — nothing to learn).
    if (r >= 0.97) continue;
    const m = mixedness(r);
    // Hard mode: strong bias toward genuinely mixed ratios (40–60%
    // raise) where memorisation fails and you have to understand why.
    // Normal mode: gentle 1.3× nudge so 50/50 spots don't get drowned.
    const weight = difficulty === 'hard' ? 1 + m * 3 : 1 + m * 0.3;
    scored.push({ combo: c, weight });
  }
  if (scored.length === 0) {
    const any = allCombos()[0]!;
    return any;
  }
  const total = scored.reduce((acc, s) => acc + s.weight, 0);
  let roll = rng() * total;
  for (const item of scored) {
    roll -= item.weight;
    if (roll <= 0) return item.combo;
  }
  return scored[scored.length - 1]!.combo;
}

/**
 * True if a spot is worth explaining (and caching AI explanations for).
 * Exported so Phase 5 warmup jobs can skip trivial combos.
 */
export function isEducational(raise: number, combo: string): boolean {
  if (UNIVERSAL_RAISES.has(combo)) return false;
  if (raise === 0) return false; // universal fold
  if (raise >= 0.97) return false; // effectively auto-raise
  return true;
}

export interface GenerateOptions {
  readonly count?: number;
  readonly dateSeed?: string;
  readonly format?: TableFormat;
  /** 'mtt' pulls heuristic ante-adjusted charts; default 'cash'. */
  readonly gameType?: 'cash' | 'mtt';
}

/** Classify a 3-way BB-defense mix into a dominant action. */
function classifyDefense(mix: {
  call: number;
  raise: number;
  fold: number;
}): TrainingSpot['correctAnswer'] {
  const max = Math.max(mix.call, mix.raise, mix.fold);
  const ties = [mix.call, mix.raise, mix.fold].filter((v) => Math.abs(v - max) <= 0.05).length;
  if (ties > 1) return 'mixed';
  if (max === mix.raise) return 'raise';
  if (max === mix.call) return 'call';
  return 'fold';
}

function pickDefenseCombo(
  chart: BbDefenseStrategyJson,
  rng: () => number,
  difficulty: 'normal' | 'hard' = 'hard',
): ComboKey {
  const pool: Array<{ combo: ComboKey; weight: number }> = [];
  for (const c of allCombos()) {
    const entry = chart[c];
    if (!entry) continue;
    // Skip auto-folds (97%+ fold) — trivial.
    if (entry.fold >= 0.97) continue;
    // Skip auto-3bets (AA/KK) — already excluded elsewhere but gate here too.
    if (UNIVERSAL_RAISES.has(c)) continue;
    const top = Math.max(entry.call, entry.raise, entry.fold);
    // "interesting" = lower top-action frequency → more balanced → harder.
    const interesting = 1 - top;
    // In hard mode bias much more strongly toward mixed decisions.
    const weight = difficulty === 'hard' ? 1 + interesting * 4 : 1 + interesting * 0.5;
    pool.push({ combo: c, weight });
  }
  if (pool.length === 0) return allCombos()[0]!;
  const total = pool.reduce((a, b) => a + b.weight, 0);
  let roll = rng() * total;
  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) return item.combo;
  }
  return pool[pool.length - 1]!.combo;
}

// Legacy export kept so earlier call-sites (if any import from the
// index) still resolve. pickBbCombo is now just a thin alias.
function pickBbCombo(chart: BbDefenseStrategyJson, rng: () => number): ComboKey {
  return pickDefenseCombo(chart, rng, 'hard');
}
void pickBbCombo;

const OPENER_SIZE: Record<Position, number> = {
  UTG: 2.5,
  UTG1: 2.5,
  UTG2: 2.5,
  UTG3: 2.5,
  MP: 2.5,
  LJ: 2.5,
  HJ: 2.5,
  CO: 2.5,
  BTN: 2.5,
  SB: 3,
  BB: 0,
};

/**
 * Generate today's challenge lineup with a mix of scenarios.
 *
 * Distribution (default): 60% RFI + 40% BB-vs-open defense so the user
 * gets 콜 / 3벳 buttons as well as fold / raise.
 *
 * Deterministic: same date on any device → same 10 spots.
 */
export async function generateDailySpots(opts: GenerateOptions = {}): Promise<TrainingSpot[]> {
  const count = opts.count ?? 10;
  const format: TableFormat = opts.format ?? '6max';
  const dateKey = opts.dateSeed ?? new Date().toISOString().slice(0, 10);
  const rng = seeded(seedFromDate(dateKey));
  const positions = format === '6max' ? POSITIONS_6MAX : POSITIONS_9MAX;

  const gameType = opts.gameType ?? 'cash';

  // Pre-load RFI charts per position.
  const rfiCharts = new Map<Position, PreflopStrategyJson>();
  for (const p of positions) {
    const chart = await getPreflopChart(format, p, { gameType });
    if (chart) rfiCharts.set(p, chart);
  }

  // Pre-load every defender × opener defense chart we ship. The daily
  // lineup samples uniformly across this matrix so the user sees BB
  // defense, BTN 3bet, SB squeeze, CO flat etc. — not just BB.
  const defenseCharts = new Map<
    string,
    { pairing: DefensePairing; chart: BbDefenseStrategyJson }
  >();
  for (const pairing of DEFENSE_PAIRINGS) {
    if (format !== '6max') continue; // 9max defense charts aren't shipped
    const chart = await getDefenseChart(pairing.defender, pairing.opener, format, gameType);
    if (chart) {
      defenseCharts.set(`${pairing.defender}-${pairing.opener}`, { pairing, chart });
    }
  }
  const defenseKeys = Array.from(defenseCharts.keys());

  // Pre-load qb tree — carries every 3bet / 4bet / squeeze / allin
  // node for the same format + stack. Only applies to 6max 100bb
  // (other formats don't ship a qb export).
  const qbTree = format === '6max' ? await getQbTree(format, 100) : null;
  const qbNodes: ParsedNode[] = qbTree
    ? Object.keys(qbTree)
        .map(parseNodeKey)
        .filter((n): n is ParsedNode => !!n && n.scenario !== 'rfi' && n.scenario !== 'vs_open')
    : [];

  const out: TrainingSpot[] = [];
  for (let i = 0; i < count; i++) {
    // Lineup mix:
    //   25% RFI   (2-way fold/raise — baseline decision-making)
    //   45% defense (BB/SB/BTN/CO/MP vs open — core study)
    //   30% advanced (3bet/4bet/squeeze/allin) when qb tree loaded
    const roll = rng();
    const useAdvanced = qbNodes.length > 0 && roll < 0.3;
    const useDefense = !useAdvanced && defenseCharts.size > 0 && roll < 0.75;

    if (useAdvanced) {
      const node = qbNodes[Math.floor(rng() * qbNodes.length)]!;
      const spot = buildAdvancedSpot(qbTree!, node, dateKey, i, rng);
      if (spot) out.push(spot);
      continue;
    }

    if (useDefense) {
      const key = defenseKeys[Math.floor(rng() * defenseKeys.length)]!;
      const { pairing, chart } = defenseCharts.get(key)!;
      const combo = pickDefenseCombo(chart, rng, 'hard');
      const entry = chart[combo] ?? { call: 0, raise: 0, fold: 1 };
      const hero = comboToCards(combo, rng);
      out.push({
        id: `${dateKey}-${i}-${combo}-${pairing.defender}-vs-${pairing.opener}`,
        combo,
        hero,
        position: pairing.defender,
        format,
        stackBB: 100,
        scenario: 'vs_open',
        opener: pairing.opener,
        openSize: OPENER_SIZE[pairing.opener],
        gtoRaise: entry.raise,
        gtoFold: entry.fold,
        gtoCall: entry.call,
        correctAnswer: classifyDefense(entry),
        availableActions: ['fold', 'call', 'raise'],
      });
    } else {
      const position = positions[i % positions.length]!;
      const chart = rfiCharts.get(position);
      if (!chart) continue;
      const combo = pickCombo(chart, rng, 'hard');
      const entry = chart[combo] ?? { raise: 0, fold: 1 };
      const hero = comboToCards(combo, rng);
      out.push({
        id: `${dateKey}-${i}-${combo}-${position}`,
        combo,
        hero,
        position,
        format,
        stackBB: 100,
        scenario: 'rfi',
        gtoRaise: entry.raise,
        gtoFold: entry.fold,
        correctAnswer: classifyAnswer(entry.raise),
        availableActions: ['fold', 'raise'],
      });
    }
  }
  return out;
}

/** Build an advanced-scenario (3bet / 4bet / squeeze / allin)
 *  TrainingSpot from a qb tree node. Picks an educational combo
 *  (non-trivial mix), collapses the tree's raise-size breakdown
 *  into our 5-way action space, and fills the pre-action trace so
 *  the UI can render "CO 2.5bb · BTN 8.5bb → BB" style headers. */
function buildAdvancedSpot(
  qbTree: Record<string, Record<string, Record<string, number>>>,
  node: ParsedNode,
  dateKey: string,
  idx: number,
  rng: () => number,
): TrainingSpot | null {
  const raw = qbTree[node.nodeKey];
  if (!raw) return null;

  // Pool candidate combos whose decision is educational (top action
  // frequency < 97%).
  const pool: Array<{ combo: ComboKey; weight: number; mix: ReturnType<typeof collapseForCombo> }> =
    [];
  for (const c of allCombos()) {
    if (UNIVERSAL_RAISES.has(c)) continue;
    const mix = collapseForCombo(raw, c);
    if (!mix) continue;
    const top = Math.max(mix.fold, mix.call, mix.raise, mix.allin);
    if (top >= 0.97) continue;
    const interesting = 1 - top;
    pool.push({ combo: c, weight: 1 + interesting * 4, mix });
  }
  if (pool.length === 0) return null;

  const total = pool.reduce((a, b) => a + b.weight, 0);
  let roll = rng() * total;
  let picked = pool[pool.length - 1]!;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) {
      picked = entry;
      break;
    }
  }
  const mix = picked.mix!;
  const hero = comboToCards(picked.combo, rng);

  // Correct-answer classification — top action wins unless a close
  // tie (≤5%) puts us in 'mixed'.
  const entries: Array<['fold' | 'call' | 'raise' | 'allin', number]> = [
    ['fold', mix.fold],
    ['call', mix.call],
    ['raise', mix.raise],
    ['allin', mix.allin],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  const [topAction, topFreq] = entries[0]!;
  const ties = entries.filter(([, v]) => Math.abs(v - topFreq) <= 0.05).length;
  const correctAnswer: TrainingSpot['correctAnswer'] = ties > 1 ? 'mixed' : topAction;

  const openerPair = node.preActions[0];
  const opener = openerPair?.actor as Position | undefined;
  // openSize for the ActionBar "call" button — for vs_open this is the
  // opener's 2.5bb; for vs_3bet it should be the facing 3bet size
  // (e.g. 8.5bb), etc. Pull the most recent bb-size from the trace.
  const callSize = callSizeFromPreActions(node.preActions);
  const raiseSize = raiseSizeFromNode(raw);

  return {
    id: `${dateKey}-${idx}-${picked.combo}-${node.nodeKey}`,
    combo: picked.combo,
    hero,
    position: node.decider,
    format: '6max',
    stackBB: 100,
    scenario: node.scenario,
    ...(opener ? { opener } : {}),
    ...(callSize !== undefined ? { openSize: callSize } : {}),
    ...(raiseSize !== undefined ? { raiseSize } : {}),
    preActions: node.preActions,
    potBB: node.potBB,
    gtoRaise: mix.raise,
    gtoFold: mix.fold,
    gtoCall: mix.call,
    gtoAllIn: mix.allin,
    correctAnswer,
    // Trust the actual node's action set over the scenario default —
    // BB cold-4bet nodes have no "call" option, for instance.
    availableActions: availableActionsFromNode(raw),
  };
}

/**
 * Score a user's answer against the GTO ground truth.
 * - sharp: picked the dominant action (raise >= 0.75 or fold >= 0.75)
 * - acceptable: picked a legit minority action in a mixed spot
 * - wrong: picked the clearly wrong action
 */
export type AnswerGrade = 'sharp' | 'acceptable' | 'wrong';
export type GradedAction = 'fold' | 'call' | 'raise' | 'check' | 'allin';

/**
 * Grade the user's action against the spot's GTO mix.
 *
 * RFI (2-way fold/raise):
 *   • |raise − 0.5| ≤ 0.05 → true 50/50 → either action = 'acceptable'
 *   • Otherwise → picking the higher-frequency action = 'sharp', the other = 'wrong'
 *
 * vs_open (3-way fold/call/raise):
 *   • The action with the highest frequency is the dominant answer
 *   • If picked → 'sharp' (or 'acceptable' when there's a close tie)
 *   • Otherwise → 'wrong'
 */
export function gradeAnswer(spot: TrainingSpot, answer: GradedAction): AnswerGrade {
  // RFI (2-way fold / raise)
  if (spot.scenario === 'rfi') {
    const r = spot.gtoRaise;
    if (Math.abs(r - 0.5) <= 0.05) return 'acceptable';
    const dominant: 'raise' | 'fold' = r > 0.5 ? 'raise' : 'fold';
    return answer === dominant ? 'sharp' : 'wrong';
  }

  // All other scenarios share a freq-max-tie structure with a variable
  // action space — just score against whichever actions exist.
  const mix: Partial<Record<Exclude<GradedAction, 'check'>, number>> = {
    fold: spot.gtoFold,
    call: spot.gtoCall ?? 0,
    raise: spot.gtoRaise,
    allin: spot.gtoAllIn ?? 0,
  };
  const chosen = answer === 'check' ? 0 : (mix[answer as Exclude<GradedAction, 'check'>] ?? 0);
  const max = Math.max(mix.fold ?? 0, mix.call ?? 0, mix.raise ?? 0, mix.allin ?? 0);
  if (max === 0) return 'acceptable';
  if (Math.abs(chosen - max) <= 0.05) {
    return chosen === max && chosen > 0.55 ? 'sharp' : 'acceptable';
  }
  return 'wrong';
}

// Re-export so consumers don't need to import RANKS from poker-core separately.
export { RANKS };

/**
 * Daily training lineup — mix of preflop + postflop. Preflop spots come
 * from `generateDailySpots`; postflop spots are drawn from the five
 * handcrafted seeds in ranges/postflop-seeds.ts.
 *
 * Deterministic per-date: same date = same 10 items on every device.
 *
 * DailyItem is a discriminated union so consumers can branch on
 * `kind === 'preflop' | 'postflop'` to pick the right renderer.
 */
export type DailyItem =
  | { readonly kind: 'preflop'; readonly spot: TrainingSpot }
  | { readonly kind: 'postflop'; readonly spot: PostflopSpot };

export async function generateDailyItems(
  opts: GenerateOptions & { preflopCount?: number; postflopCount?: number } = {},
): Promise<DailyItem[]> {
  const preflopCount = opts.preflopCount ?? 6;
  const postflopCount = opts.postflopCount ?? 4;
  const dateKey = opts.dateSeed ?? new Date().toISOString().slice(0, 10);
  const rng = seeded(seedFromDate(dateKey));

  // Preflop half — reuse existing generator.
  const preflop = await generateDailySpots({ ...opts, count: preflopCount });
  const items: DailyItem[] = preflop.map((s) => ({ kind: 'preflop', spot: s }));

  // Postflop half — shuffle the 5 seeds deterministically, take first N
  // (repeat if postflopCount > 5).
  const pool = listPostflopSpots();
  const shuffled = [...pool].sort(() => rng() - 0.5);
  for (let i = 0; i < postflopCount; i++) {
    const spot = shuffled[i % shuffled.length]!;
    items.push({ kind: 'postflop', spot });
  }

  // Interleave: spread postflop spots across the lineup instead of
  // all at the end. Deterministic Fisher-Yates with the date-seeded rng.
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }

  return items;
}
