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
    const nbSeats = NB6.filter((p) => tokens.includes(p));
    if (nbSeats.length === 0) {
      // Blind-only lines (SB open vs BB) carry over verbatim.
      consider(key, { actions, score: 0, seatSum: 0, source: key });
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
      consider(newKey, { actions, score, seatSum, source: key });
    }
  }

  const out: Tree = {};
  for (const [key, cand] of best) out[key] = cand.actions;

  // ── RFI roots: real 9-max open charts, matching /mtt/preflop ──
  for (const pos of [...NB9, 'SB']) {
    const chart: Record<string, { raise: number; fold: number }> = JSON.parse(
      await readFile(join(DATA_DIR, `9max_100bb_rfi_${pos}.json`), 'utf8'),
    );
    const size = pos === 'SB' ? '3.0bb' : '2.5bb';
    const raiseMap: ComboFreqs = {};
    const foldMap: ComboFreqs = {};
    for (const [combo, m] of Object.entries(chart)) {
      if (m.raise > 0) raiseMap[combo] = m.raise;
      if (m.fold > 0) foldMap[combo] = m.fold;
    }
    out[pos] = { [size]: raiseMap, FOLD: foldMap };
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
