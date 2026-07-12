#!/usr/bin/env -S node --loader tsx
/**
 * build-9max-qb-decisions.ts — derive 9max_100bb_qb_decisions.json
 * from the solver-backed 6-max tree (6max_100bb_qb_decisions.json).
 *
 * TexasSolver ships no 9-max preflop solve, so the 9-max tree is a
 * seat-mapped derivation — the same trust level as the MTT tree
 * (build-mtt-qb-decisions.ts) and the curated preflop charts:
 *
 *   1. Every 6-max line (RFI → 3bet → 4bet → AllIn chains, plus the
 *      multiway open+call → squeeze lines) is re-instantiated for every
 *      order-preserving assignment of its non-blind seats into the
 *      seven 9-max non-blind seats. SB/BB map to themselves. This
 *      reproduces the full 6-max line grammar over 9 seats, so the
 *      ChartNavigator walk (folds excluded from node keys) stays closed.
 *   2. When several 6-max nodes produce the same 9-max key, the source
 *      whose seats sit closest in fractional table position wins
 *      (UTG+1 borrows UTG/MP behaviour, HJ borrows CO, …). Ties prefer
 *      the later-seat source, which keeps flat-call (multiway) lines.
 *   3. The eight RFI roots are replaced with the real 9-max open
 *      charts (9max_100bb_rfi_*.json) so the tree agrees combo-for-
 *      combo with /mtt/preflop.
 *
 * A random-walk validator replays the exact ChartNavigator node
 * resolution over the generated tree and fails the build if any line
 * can dead-end while a raise is still unanswered.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { closeTree, type ActionMap, type ComboFreqs, type Tree } from './qb-tree-closure';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const DATA_DIR = join(REPO_ROOT, 'apps', 'web', 'public', 'data', 'preflop');

const NB6 = ['UTG', 'MP', 'CO', 'BTN'] as const;
const NB9 = ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN'] as const;
const POS6 = new Set<string>([...NB6, 'SB', 'BB']);
const ORDER9: readonly string[] = [...NB9, 'SB', 'BB'];

const frac6 = (p: string): number => NB6.indexOf(p as (typeof NB6)[number]) / (NB6.length - 1);
const frac9 = (p: string): number => NB9.indexOf(p as (typeof NB9)[number]) / (NB9.length - 1);

function* combinations<T>(arr: readonly T[], k: number): Generator<T[]> {
  if (k === 0) {
    yield [];
    return;
  }
  for (let i = 0; i <= arr.length - k; i++) {
    for (const rest of combinations(arr.slice(i + 1), k - 1)) {
      yield [arr[i]!, ...rest];
    }
  }
}

interface Candidate {
  actions: ActionMap;
  score: number;
  seatSum: number;
  source: string;
  /** frac9(decider) − frac6(source decider): how far the deciding seat
   *  sits from its borrowed 6-max analog. Negative = earlier seat. */
  deciderShift: number;
}

/** Tighten/loosen a borrowed node by the decider's seat distance so
 *  adjacent 9-max seats never share a byte-identical strategy
 *  (UTG+1 was == MP, LJ == HJ — Jay's 2026-07-11 report). Non-fold
 *  frequencies are raised to a power: earlier-than-analog seats fold
 *  their marginal tail (f^1.37 at one seat step), later seats loosen
 *  symmetrically. Pure 0/1 entries are fixed points, so premium hands
 *  and Nash jams are untouched.  */
function seatShift(actions: ActionMap, d: number): ActionMap {
  if (d === 0) return actions;
  const gamma = d < 0 ? 1 + 2.2 * -d : 1 / (1 + 2.2 * d);
  const combos = new Set<string>();
  for (const m of Object.values(actions)) for (const c of Object.keys(m)) combos.add(c);
  const out: ActionMap = {};
  for (const a of Object.keys(actions)) out[a] = {};
  const r4 = (x: number) => Math.round(x * 10000) / 10000;
  for (const c of combos) {
    let nonFold = 0;
    for (const a of Object.keys(actions)) {
      if (a === 'FOLD') continue;
      const f = actions[a]?.[c] ?? 0;
      const shifted = f > 0 ? r4(Math.pow(f, gamma)) : 0;
      if (shifted > 0) out[a]![c] = shifted;
      nonFold += shifted;
    }
    if ('FOLD' in actions || nonFold < 1) {
      const fold = r4(Math.max(0, 1 - nonFold));
      if (fold > 0) out['FOLD'] = out['FOLD'] ?? {};
      if (fold > 0) out['FOLD']![c] = fold;
    }
  }
  for (const a of Object.keys(out)) {
    if (Object.keys(out[a]!).length === 0) delete out[a];
  }
  return out;
}

async function main() {
  const raw = await readFile(join(DATA_DIR, '6max_100bb_qb_decisions.json'), 'utf8');
  const tree6: Tree = JSON.parse(raw);

  const best = new Map<string, Candidate>();
  const consider = (key: string, cand: Candidate) => {
    const cur = best.get(key);
    if (
      !cur ||
      cand.score < cur.score ||
      (cand.score === cur.score && cand.seatSum > cur.seatSum)
    ) {
      best.set(key, cand);
    }
  };

  for (const [key, actions] of Object.entries(tree6)) {
    const tokens = key.split('_');
    const decider = tokens[tokens.length - 1]!;
    const nbSeats = NB6.filter((p) => tokens.includes(p));
    if (nbSeats.length === 0) {
      // Blind-only lines (SB open vs BB) carry over verbatim.
      consider(key, { actions, score: 0, seatSum: 0, source: key, deciderShift: 0 });
      continue;
    }
    const seatSum = nbSeats.reduce((s, p) => s + NB6.indexOf(p), 0);
    for (const target of combinations(NB9, nbSeats.length)) {
      const phi = new Map<string, string>();
      let score = 0;
      nbSeats.forEach((p, i) => {
        phi.set(p, target[i]!);
        score += Math.abs(frac9(target[i]!) - frac6(p));
      });
      const newKey = tokens.map((t) => (POS6.has(t) ? (phi.get(t) ?? t) : t)).join('_');
      const deciderShift = phi.has(decider) ? frac9(phi.get(decider)!) - frac6(decider) : 0;
      consider(newKey, { actions, score, seatSum, source: key, deciderShift });
    }
  }

  const out: Tree = {};
  for (const [key, cand] of best) out[key] = seatShift(cand.actions, cand.deciderShift);

  // ── RFI roots: real 9-max open charts, matching /mtt/preflop ──
  for (const pos of [...NB9, 'SB']) {
    out[pos] = await rfiNode(pos, 100);
  }

  // Close over every UI-reachable decision (fills fold-branch nodes the
  // seat mapping alone can't cover, e.g. squeeze lines whose 6-max
  // source never existed for that seat combination).
  const { synthesized, unresolved } = closeTree(out, ORDER9);
  if (unresolved.length > 0) {
    console.error(`✗ ${unresolved.length} nodes without donors, e.g. ${unresolved[0]}`);
    process.exit(1);
  }
  console.log(`  closure synthesized ${synthesized} nodes`);

  const dangling = validate(out);
  if (dangling.length > 0) {
    console.error(`✗ ${dangling.length} dangling raise lines, e.g.:`);
    for (const d of dangling.slice(0, 10)) console.error(`  ${d}`);
    process.exit(1);
  }

  const json = JSON.stringify(out);
  await writeFile(join(DATA_DIR, '9max_100bb_qb_decisions.json'), json);
  console.log(
    `✓ 9max_100bb_qb_decisions.json — ${Object.keys(out).length} nodes (from ${Object.keys(tree6).length} 6-max), ${(json.length / 1024 / 1024).toFixed(2)} MB`,
  );

  // ── 60/40BB: mapped tree + depth-correct open ranges + a defense
  //    tilt. Shallower MTT stacks flat less and 3bet/commit more, so
  //    the 100BB defense mixes get call×/raise× multipliers (FOLD
  //    absorbs the residual) — the same machinery as the MTT widen.
  const DEPTH_ADJ: Record<number, { callMul: number; raiseMul: number }> = {
    60: { callMul: 0.9, raiseMul: 1.05 },
    40: { callMul: 0.7, raiseMul: 1.15 },
  };
  for (const depth of [60, 40] as const) {
    const adj = DEPTH_ADJ[depth]!;
    const t: Tree = {};
    for (const [key, actions] of Object.entries(out)) {
      t[key] = key.includes('_') ? depthTilt(actions, adj) : actions;
    }
    for (const pos of [...NB9, 'SB']) {
      t[pos] = await rfiNode(pos, depth);
    }
    const bad = validate(t);
    if (bad.length > 0) {
      console.error(`✗ ${depth}bb tree: ${bad.length} dangling lines`);
      process.exit(1);
    }
    const j = JSON.stringify(t);
    await writeFile(join(DATA_DIR, `9max_${depth}bb_qb_decisions.json`), j);
    console.log(`✓ 9max_${depth}bb_qb_decisions.json — ${(j.length / 1024 / 1024).toFixed(2)} MB`);
  }

  // ── 20/10BB: play collapses to jam-or-fold. Open nodes come from
  //    the Nash jam charts; calling ranges are synthesised as the top
  //    slice of a hand-strength order derived from the jam-chart
  //    nesting (caller needs a tighter range than the jammer — BB 60%,
  //    SB 55%, others 45% of the jam width; overcalls 60% of that).
  const strength = await buildStrengthOrder();
  for (const depth of [20, 10] as const) {
    const t = await buildJamTree(depth, strength);
    const bad = validate(t);
    if (bad.length > 0) {
      console.error(`✗ ${depth}bb jam tree: ${bad.length} dangling lines`);
      process.exit(1);
    }
    const j = JSON.stringify(t);
    await writeFile(join(DATA_DIR, `9max_${depth}bb_qb_decisions.json`), j);
    console.log(
      `✓ 9max_${depth}bb_qb_decisions.json — ${Object.keys(t).length} nodes, ${(j.length / 1024).toFixed(0)} KB`,
    );
  }
}

/** Depth tilt for defense nodes: scale Call and raise branches, FOLD
 *  takes the residual; overshoot renormalises like the MTT widen. */
function depthTilt(actions: ActionMap, adj: { callMul: number; raiseMul: number }): ActionMap {
  const nonFoldKeys = Object.keys(actions).filter((a) => a !== 'FOLD');
  if (!('FOLD' in actions) || nonFoldKeys.length === 0) return actions;
  const combos = new Set<string>();
  for (const m of Object.values(actions)) for (const c of Object.keys(m)) combos.add(c);
  const out: ActionMap = {};
  for (const a of Object.keys(actions)) out[a] = {};
  const r4 = (x: number) => Math.round(x * 10000) / 10000;
  for (const c of combos) {
    let sum = 0;
    for (const a of nonFoldKeys) {
      const mul = a === 'Call' ? adj.callMul : adj.raiseMul;
      const v = Math.min(1, (actions[a]?.[c] ?? 0) * mul);
      out[a]![c] = v;
      sum += v;
    }
    const setSparse = (a: string, v: number) => {
      if (v > 0) out[a]![c] = v;
      else delete out[a]![c];
    };
    if (sum > 1) {
      for (const a of nonFoldKeys) setSparse(a, r4((out[a]![c] ?? 0) / sum));
      setSparse('FOLD', 0);
    } else {
      for (const a of nonFoldKeys) setSparse(a, r4(out[a]![c] ?? 0));
      setSparse('FOLD', r4(1 - sum));
    }
  }
  for (const a of Object.keys(out)) {
    if (Object.keys(out[a]!).length === 0) delete out[a];
  }
  return out;
}

/** RFI decision node straight from the emitted chart JSON so the tree
 *  agrees combo-for-combo with /mtt/preflop. */
async function rfiNode(pos: string, depth: number): Promise<ActionMap> {
  const scenario = depth <= 20 ? 'jam' : 'rfi';
  const chart: Record<string, { raise: number; fold: number }> = JSON.parse(
    await readFile(join(DATA_DIR, `9max_${depth}bb_${scenario}_${pos}.json`), 'utf8'),
  );
  const size = scenario === 'jam' ? 'AllIn' : pos === 'SB' ? '3.0bb' : '2.5bb';
  const raiseMap: ComboFreqs = {};
  const foldMap: ComboFreqs = {};
  for (const [combo, m] of Object.entries(chart)) {
    if (m.raise > 0) raiseMap[combo] = m.raise;
    if (m.fold > 0) foldMap[combo] = m.fold;
  }
  return { [size]: raiseMap, FOLD: foldMap };
}

function allCombos(): string[] {
  const R = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const out: string[] = [];
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      if (i === j) out.push(R[i]! + R[j]!);
      else if (i < j) out.push(R[i]! + R[j]! + 's');
      else out.push(R[j]! + R[i]! + 'o');
    }
  }
  return out;
}

/** Hand-strength order from the 16 Nash jam charts: a combo scores the
 *  sum of 1/|chart| over every chart containing it, so hands that
 *  survive the tightest ranges rank highest. */
async function buildStrengthOrder(): Promise<string[]> {
  const score = new Map<string, number>();
  // Tiny hand-rank prior — only breaks ties between combos that sit in
  // the exact same set of charts (QQ must outrank AQs for calling).
  const V: Record<string, number> = {
    A: 14,
    K: 13,
    Q: 12,
    J: 11,
    T: 10,
    '9': 9,
    '8': 8,
    '7': 7,
    '6': 6,
    '5': 5,
    '4': 4,
    '3': 3,
    '2': 2,
  };
  const prior = (c: string): number => {
    const hi = V[c[0]!]!;
    const lo = V[c[1]!]!;
    const base = hi === lo ? 20 + hi : hi + lo / 14 + (c.endsWith('s') ? 0.3 : 0);
    return base * 1e-4;
  };
  for (const combo of allCombos()) score.set(combo, prior(combo));
  for (const depth of [20, 10]) {
    for (const pos of [...NB9, 'SB']) {
      const chart: Record<string, { raise: number }> = JSON.parse(
        await readFile(join(DATA_DIR, `9max_${depth}bb_jam_${pos}.json`), 'utf8'),
      );
      const inChart = Object.entries(chart).filter(([, m]) => m.raise > 0);
      for (const [combo] of inChart) {
        score.set(combo, (score.get(combo) ?? 0) + 1 / inChart.length);
      }
    }
  }
  return allCombos().sort((a, b) => (score.get(b) ?? 0) - (score.get(a) ?? 0));
}

async function buildJamTree(depth: number, strength: string[]): Promise<Tree> {
  const t: Tree = {};
  const combos = allCombos();
  const pure = (set: ReadonlySet<string>): { yes: ComboFreqs; no: ComboFreqs } => {
    const yes: ComboFreqs = {};
    const no: ComboFreqs = {};
    for (const c of combos) (set.has(c) ? yes : no)[c] = 1;
    return { yes, no };
  };
  const callRatio = (seat: string, overcall: boolean): number => {
    const base = seat === 'BB' ? 0.6 : seat === 'SB' ? 0.55 : 0.45;
    return overcall ? base * 0.6 : base;
  };

  const jammers = [...NB9, 'SB'];
  for (const J of jammers) {
    t[J] = await rfiNode(J, depth);
    const jamWidth = Object.keys(t[J]!['AllIn'] ?? {}).length;
    const jIdx = ORDER9.indexOf(J);
    for (let x = jIdx + 1; x < ORDER9.length; x++) {
      const X = ORDER9[x]!;
      const k = Math.max(1, Math.round(jamWidth * callRatio(X, false)));
      const callSet = new Set(strength.slice(0, k));
      const m = pure(callSet);
      t[`${J}_AllIn_${X}`] = { Call: m.yes, FOLD: m.no };
      for (let y = x + 1; y < ORDER9.length; y++) {
        const Y = ORDER9[y]!;
        const k2 = Math.max(1, Math.round(jamWidth * callRatio(Y, true)));
        const over = pure(new Set(strength.slice(0, k2)));
        t[`${J}_AllIn_${X}_Call_${Y}`] = { Call: over.yes, FOLD: over.no };
      }
    }
  }
  return t;
}

/* ── validator: mirrors ChartNavigator resolveNode/nextActor ── */

function nextActor(path: string[]): string | null {
  const folded = new Set<string>();
  let lastActor: string | null = null;
  for (const tok of path) {
    const us = tok.indexOf('_');
    if (us < 0) continue;
    lastActor = tok.slice(0, us);
    if (tok.slice(us + 1) === 'FOLD') folded.add(lastActor);
  }
  const startIdx = lastActor == null ? 0 : (ORDER9.indexOf(lastActor) + 1) % ORDER9.length;
  for (let off = 0; off < ORDER9.length; off++) {
    const cand = ORDER9[(startIdx + off) % ORDER9.length];
    if (cand && !folded.has(cand)) return cand;
  }
  return null;
}

function validate(tree: Tree): string[] {
  const dangling = new Set<string>();
  let rng = 0x9e3779b9;
  const rand = () => {
    rng ^= rng << 13;
    rng ^= rng >>> 17;
    rng ^= rng << 5;
    rng >>>= 0;
    return rng / 2 ** 32;
  };

  for (let walk = 0; walk < 60000; walk++) {
    const path: string[] = [];
    for (let step = 0; step < 40; step++) {
      const actor = nextActor(path);
      if (!actor) break;
      const folds = path.filter((t) => t.endsWith('_FOLD')).length;
      const hasAggr = path.some((t) => !t.endsWith('_FOLD'));
      if (actor === 'BB' && !hasAggr && folds >= ORDER9.length - 1) break; // BB wins
      const active = path.filter((t) => !t.endsWith('_FOLD'));
      const key = [...active, actor].join('_');
      const node = tree[key];
      let legal: string[];
      if (node) {
        legal = Object.keys(node);
      } else {
        const allInTok = path.find((t) => t.slice(t.indexOf('_') + 1) === 'AllIn');
        if (allInTok) break; // UI synthesises Call/FOLD or showdown — always safe
        // Missing node: fine when action is closed (last act a Call) or
        // everyone folded back to the aggressor. A missing node while a
        // raise awaits response would strand the UI — that's a bug.
        const nonFold = path.filter((t) => !t.endsWith('_FOLD'));
        const last = nonFold[nonFold.length - 1];
        const lastAct = last ? last.slice(last.indexOf('_') + 1) : '';
        const lastActor = last ? last.slice(0, last.indexOf('_')) : '';
        if (path.length > 0 && lastAct !== 'Call' && lastActor !== actor) {
          dangling.add(key);
        }
        break;
      }
      if (legal.length === 0) break;
      // Fold-biased sampling — fold patterns are what shift nextActor.
      const pick =
        legal.includes('FOLD') && rand() < 0.45
          ? 'FOLD'
          : legal[Math.floor(rand() * legal.length)]!;
      path.push(`${actor}_${pick}`);
    }
  }
  return [...dangling].sort();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
