/**
 * Generate approximate MTT (1BB ante) preflop ranges by widening the
 * cash-game charts we already derived from TexasSolver's qb_ranges.
 *
 * This is an approximation — not a real ante-tree solve. We label the
 * output as "MTT 근사" in the UI so users understand the caveat. When
 * better data arrives (licensed HRC Pro export, Upswing charts, etc.)
 * the files get overwritten in place.
 *
 * Rationale for each adjustment factor:
 *   1BB ante adds ~1BB of dead money to every pot. This shifts GTO
 *   preflop in two well-documented ways:
 *     - Opening ranges get WIDER (extra reward for winning blinds)
 *     - Defending ranges get wider too (better pot odds on call)
 *     - Late positions (BTN/SB) benefit most (they risk less, win
 *       more; +2-4% wider than cash)
 *     - Early positions (UTG/MP) benefit least (still blocked by many
 *       players behind; +0.5-1% wider)
 *
 * Usage: pnpm tsx packages/gto-data/scripts/build-mtt-heuristic.ts
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const DATA_DIR = join(REPO_ROOT, 'apps', 'web', 'public', 'data', 'preflop');

/** Per-position RFI widening. Values = absolute combo-frequency bump
 *  applied to any hand currently at 0-raise; also scale-up hands
 *  already partially raised. Empirical targets match Upswing / public
 *  MTT charts vs Cash 100BB. */
const RFI_WIDEN: Record<string, number> = {
  UTG: 0.05,
  MP: 0.08,
  CO: 0.12,
  BTN: 0.06, // already ~40% in cash; less room to grow
  SB: 0.18,  // biggest ante benefit — steal more often
};

/** Per-opener BB defense adjustment. MTT pot has extra dead money so
 *  BB calls a bit wider and 3bets a touch more aggressively. */
const BB_DEF_ADJ: Record<string, { callMul: number; raiseMul: number }> = {
  UTG: { callMul: 1.15, raiseMul: 1.05 },
  MP:  { callMul: 1.18, raiseMul: 1.05 },
  CO:  { callMul: 1.20, raiseMul: 1.08 },
  BTN: { callMul: 1.20, raiseMul: 1.10 },
  SB:  { callMul: 1.25, raiseMul: 1.10 },
};

/** Non-BB defenders (SB vs UTG, BTN vs CO, etc.) get a smaller bump —
 *  they're not getting the full ante-pot discount BB does. */
const DEF_ADJ: Record<string, { callMul: number; raiseMul: number }> = {
  UTG: { callMul: 1.08, raiseMul: 1.03 },
  MP:  { callMul: 1.10, raiseMul: 1.03 },
  CO:  { callMul: 1.12, raiseMul: 1.05 },
  BTN: { callMul: 1.15, raiseMul: 1.08 },
  SB:  { callMul: 1.18, raiseMul: 1.08 },
};

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

async function writeJson(path: string, data: unknown) {
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function buildRfi(pos: string) {
  const inputPath = join(DATA_DIR, `6max_100bb_rfi_${pos}.json`);
  const outputPath = join(DATA_DIR, `mtt_6max_100bb_rfi_${pos}.json`);
  const bump = RFI_WIDEN[pos] ?? 0.05;
  const cash = await readJson<Record<string, { raise: number; fold: number }>>(inputPath);

  const out: Record<string, { raise: number; fold: number }> = {};
  for (const [combo, v] of Object.entries(cash)) {
    // Hands already raised: nudge slightly higher. Hands never raised:
    // bump a portion of them into the mix based on combo "strength"
    // (approximated by original raise freq — hands already at mid-
    // frequency get the biggest shift, since those are the marginal
    // ones that tip over with ante).
    const raise = v.raise > 0
      ? clamp01(v.raise + bump * (1 - v.raise))
      : clamp01(bump * marginalBonusFor(combo));
    out[combo] = { raise, fold: clamp01(1 - raise) };
  }
  await writeJson(outputPath, out);
  return { path: outputPath, bump };
}

/** Hands near the margin (e.g. 65s, K9o, A5o) are more likely to enter
 *  the range with ante dead money. Premium-ish hands (77, ATs) already
 *  in the range stay. True trash (32o, 72o) stays folded.
 *  This heuristic scales 0→0.7 based on rough hand strength proxy. */
function marginalBonusFor(combo: string): number {
  // Suited connectors, small pairs, weak aces: +0.3-0.7
  // Pure trash: 0
  if (combo === '32o' || combo === '42o' || combo === '52o' || combo === '62o' || combo === '72o' || combo === '82o') return 0;
  if (combo === '22') return 0.5; // small pair
  if (combo.endsWith('s') && combo[0] !== combo[1]) {
    const r1 = combo[0]!;
    const r2 = combo[1]!;
    const gap = Math.abs(rankVal(r1) - rankVal(r2));
    if (gap === 1) return 0.7;  // connectors
    if (gap === 2) return 0.5;  // one-gappers
    if (r1 === 'A') return 0.6; // suited aces
    return 0.3;
  }
  if (combo.endsWith('o')) return 0.1; // offsuit trash
  return 0.5; // pairs default
}

function rankVal(r: string): number {
  const v: Record<string, number> = {
    A: 14, K: 13, Q: 12, J: 11, T: 10,
    '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2,
  };
  return v[r] ?? 0;
}

async function buildDefense(defender: string, opener: string) {
  const low = defender.toLowerCase();
  const input = join(DATA_DIR, `6max_100bb_${low}_vs_${opener}.json`);
  try {
    await readFile(input, 'utf8');
  } catch {
    return null; // file doesn't exist for this pair
  }
  const cash = await readJson<Record<string, { call: number; raise: number; fold: number }>>(input);
  const adj = defender === 'BB' ? BB_DEF_ADJ[opener] : DEF_ADJ[opener];
  if (!adj) return null;

  const out: Record<string, { call: number; raise: number; fold: number }> = {};
  for (const [combo, v] of Object.entries(cash)) {
    const call = clamp01(v.call * adj.callMul);
    const raise = clamp01(v.raise * adj.raiseMul);
    const remain = 1 - call - raise;
    const fold = clamp01(remain);
    out[combo] = { call, raise, fold };
  }
  const output = join(DATA_DIR, `mtt_6max_100bb_${low}_vs_${opener}.json`);
  await writeJson(output, out);
  return output;
}

async function main() {
  const positions = ['UTG', 'MP', 'CO', 'BTN', 'SB'];
  const defenders = ['BB', 'SB', 'BTN', 'CO', 'MP'];

  console.log('Building MTT heuristic charts (+1BB ante approximation)');
  for (const pos of positions) {
    const { path, bump } = await buildRfi(pos);
    console.log(`  ✓ RFI ${pos}  bump=+${(bump * 100).toFixed(0)}%  → ${path}`);
  }
  for (const opener of positions) {
    for (const def of defenders) {
      if (def === opener) continue;
      const out = await buildDefense(def, opener);
      if (out) console.log(`  ✓ ${def} vs ${opener} → ${out}`);
    }
  }
  console.log('\nDone. Files prefixed "mtt_" alongside the cash ones.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
