/**
 * qb-tree-closure.ts — close a qb_decisions tree over every line the
 * ChartNavigator walk can produce.
 *
 * The TexasSolver export ships only the first responder's node after
 * each raise: once anyone folds out of turn order the next player's
 * decision node is missing (e.g. CO open → BTN 3bet → CO 4bet 22bb had
 * NO "..._22.0bb_BTN" node), so the UI dead-ended into a bogus
 * 플랍 도달 screen on every 4bet/5bet line (caught 2026-07-11).
 *
 * closeTree() replays each line with a minimal preflop state machine
 * (bets, implied folds, pending actors), enumerates every decision
 * node the UI can request, and synthesises missing ones from the most
 * similar existing node: same decider seat + same facing size first,
 * then nearest size, then any seat facing the same bet. Donor mixes
 * are copied verbatim — same approximation level as the MTT/9-max
 * derivations.
 */

export type ComboFreqs = Record<string, number>;
export type ActionMap = Record<string, ComboFreqs>;
export type Tree = Record<string, ActionMap>;

const ALL_POSITIONS = new Set([
  'UTG',
  'UTG1',
  'UTG2',
  'UTG3',
  'MP',
  'LJ',
  'HJ',
  'CO',
  'BTN',
  'SB',
  'BB',
]);

interface LineStep {
  seat: string;
  action: string;
}

/** Key = (seat, action)* + decider. FOLD pairs are dropped — the UI
 *  never puts them in lookup keys. */
export function parseKey(key: string): { line: LineStep[]; decider: string } | null {
  const tokens = key.split('_');
  const line: LineStep[] = [];
  for (let i = 0; i < tokens.length - 1; i += 2) {
    const seat = tokens[i]!;
    const action = tokens[i + 1]!;
    if (!ALL_POSITIONS.has(seat) || ALL_POSITIONS.has(action)) return null;
    if (action !== 'FOLD') line.push({ seat, action });
  }
  const decider = tokens[tokens.length - 1]!;
  if (!ALL_POSITIONS.has(decider)) return null;
  return { line, decider };
}

function keyOf(line: LineStep[], decider: string): string {
  return [...line.flatMap((s) => [s.seat, s.action]), decider].join('_');
}

function sizeOf(action: string): number {
  if (action === 'AllIn') return 100;
  if (action.endsWith('bb')) return Number(action.slice(0, -2));
  return NaN;
}

interface SimState {
  bets: Map<string, number>;
  acted: Set<string>;
  folded: Set<string>;
  topBet: number;
  lastActor: string | null;
  sawAllIn: boolean;
}

/** Replay a fold-stripped line, inferring the folds of every seat that
 *  was skipped while owing a decision. */
function simulate(line: LineStep[], order: readonly string[]): SimState {
  const st: SimState = {
    bets: new Map(order.map((p) => [p, p === 'SB' ? 0.5 : p === 'BB' ? 1 : 0])),
    acted: new Set(),
    folded: new Set(),
    topBet: 1,
    lastActor: null,
    sawAllIn: false,
  };
  const owes = (p: string) =>
    !st.folded.has(p) && (!st.acted.has(p) || (st.bets.get(p) ?? 0) < st.topBet);

  for (const step of line) {
    // Fold every in-hand seat whose turn came before this actor.
    const startIdx = st.lastActor == null ? 0 : (order.indexOf(st.lastActor) + 1) % order.length;
    for (let off = 0; off < order.length; off++) {
      const p = order[(startIdx + off) % order.length]!;
      if (p === step.seat) break;
      if (owes(p)) {
        st.folded.add(p);
        st.acted.add(p);
      }
    }
    st.acted.add(step.seat);
    st.lastActor = step.seat;
    if (step.action === 'Call') {
      st.bets.set(step.seat, st.topBet);
    } else {
      const size = sizeOf(step.action);
      if (!Number.isNaN(size)) {
        st.bets.set(step.seat, size);
        st.topBet = Math.max(st.topBet, size);
        if (step.action === 'AllIn') st.sawAllIn = true;
      }
    }
  }
  return st;
}

/** Every seat the UI may hand the next decision to: pending seats in
 *  turn order — each one reachable when those before it fold. */
function nextDeciders(st: SimState, order: readonly string[]): string[] {
  if (st.lastActor == null) return [];
  const owes = (p: string) =>
    !st.folded.has(p) && (!st.acted.has(p) || (st.bets.get(p) ?? 0) < st.topBet);
  const out: string[] = [];
  const startIdx = (order.indexOf(st.lastActor) + 1) % order.length;
  for (let off = 0; off < order.length - 1; off++) {
    const p = order[(startIdx + off) % order.length]!;
    if (p !== st.lastActor && owes(p)) out.push(p);
  }
  return out;
}

interface DonorIndexEntry {
  key: string;
  decider: string;
  facing: string;
  raises: number;
  actions: ActionMap;
}

function buildDonorIndex(tree: Tree): DonorIndexEntry[] {
  const out: DonorIndexEntry[] = [];
  for (const [key, actions] of Object.entries(tree)) {
    const parsed = parseKey(key);
    if (!parsed || parsed.line.length === 0) continue;
    const facing = parsed.line[parsed.line.length - 1]!.action;
    const raises = parsed.line.filter((s) => s.action !== 'Call').length;
    out.push({ key, decider: parsed.decider, facing, raises, actions });
  }
  return out;
}

function pickDonor(
  index: DonorIndexEntry[],
  decider: string,
  facing: string,
  raises: number,
): ActionMap | null {
  let best: DonorIndexEntry | null = null;
  let bestScore = -Infinity;
  const want = sizeOf(facing);
  for (const d of index) {
    let score = 0;
    if (d.decider === decider) score += 8;
    if (d.facing === facing) score += 8;
    else if (!Number.isNaN(want) && !Number.isNaN(sizeOf(d.facing)))
      score += Math.max(0, 4 - Math.abs(sizeOf(d.facing) - want) / 4);
    else continue;
    if (d.raises === raises) score += 2;
    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }
  return best ? best.actions : null;
}

/** Add every missing decision node until the tree is closed under the
 *  ChartNavigator walk. Returns synthesis stats. */
export function closeTree(
  tree: Tree,
  order: readonly string[],
): { synthesized: number; unresolved: string[] } {
  const donorIndex = buildDonorIndex(tree);
  const unresolved: string[] = [];
  let synthesized = 0;

  const queue = Object.keys(tree);
  const seen = new Set(queue);
  let guard = 0;

  while (queue.length > 0) {
    if (++guard > 200000) throw new Error('closeTree: fixpoint guard tripped');
    const key = queue.pop()!;
    const parsed = parseKey(key);
    if (!parsed) continue;
    const actions = tree[key];
    if (!actions) continue;

    for (const act of Object.keys(actions)) {
      if (act === 'FOLD' || act === 'AllIn') continue; // AllIn tails are UI-synthesised
      const line = [...parsed.line, { seat: parsed.decider, action: act }];
      const st = simulate(line, order);
      if (st.sawAllIn) continue;
      for (const next of nextDeciders(st, order)) {
        const k2 = keyOf(line, next);
        if (tree[k2] || seen.has(k2)) continue;
        seen.add(k2);
        // A truly closed action never reaches here — nextDeciders is
        // empty once every in-hand seat has matched the top bet. Any
        // pending seat needs a real decision node.
        const facing = line[line.length - 1]!.action;
        const raises = line.filter((s) => s.action !== 'Call').length;
        const donor = pickDonor(donorIndex, next, facing, raises);
        if (!donor) {
          unresolved.push(k2);
          continue;
        }
        tree[k2] = donor;
        synthesized++;
        queue.push(k2);
      }
    }
  }
  return { synthesized, unresolved };
}
