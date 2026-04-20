/**
 * Parse TexasSolver's pre-solved 6-max 100BB range tree (found in
 * TexasSolver-v0.2.0-Windows/ranges/6max_range/) into the two JSON
 * shapes our app consumes:
 *
 *   apps/web/public/data/preflop/6max_100bb_rfi_{POS}.json        (RFI)
 *   apps/web/public/data/preflop/6max_100bb_bb_vs_{OPENER}.json   (BB def)
 *
 * The solver writes each decision node as a `_range.txt` file whose
 * contents are `combo:weight,combo:weight,...` where weight is the
 * conditional probability the player takes that action with that
 * combo. We combine the Call + 3-bet branch weights to synthesise a
 * {call, raise, fold} mix per combo, with fold = 1 − call − raise.
 *
 * Usage: pnpm tsx packages/gto-data/scripts/parse-texassolver.ts
 *   [optional: path to TexasSolver-v0.2.0-Windows/ranges/6max_range]
 */

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');

const DEFAULT_SOURCE =
  'C:\\Users\\Jay\\Desktop\\GTO-Today\\TexasSolver-v0.2.0-Windows\\ranges\\6max_range';

const SOURCE = process.argv[2] ?? DEFAULT_SOURCE;

const OUT_DIR = join(REPO_ROOT, 'apps', 'web', 'public', 'data', 'preflop');

/** 6-max position → TexasSolver folder name. */
const POSITIONS: readonly string[] = ['UTG', 'MP', 'CO', 'BTN', 'SB'];

/** Parse a `combo:weight,combo:weight,...` file into a Record. */
async function parseRangeFile(
  path: string,
): Promise<Record<string, number> | null> {
  if (!existsSync(path)) return null;
  const raw = (await readFile(path, 'utf8')).trim();
  const out: Record<string, number> = {};
  for (const chunk of raw.split(',')) {
    const [combo, w] = chunk.split(':');
    if (!combo) continue;
    const weight = Number(w);
    if (!Number.isFinite(weight) || weight <= 0) continue;
    out[combo.trim()] = weight;
  }
  return out;
}

/** Walk a TexasSolver position subtree to find the opener's own range
 *  (e.g. UTG_range.txt anywhere inside UTG/2.5bb/...). All such files
 *  hold the same opening range; we grab the first one we find. */
async function findOpenerRange(openerDir: string, opener: string): Promise<Record<string, number>> {
  async function walk(d: string): Promise<Record<string, number> | null> {
    const entries = await readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const p = join(d, e.name);
      if (e.isDirectory()) {
        const found = await walk(p);
        if (found) return found;
      } else if (e.name === `${opener}_range.txt`) {
        const r = await parseRangeFile(p);
        if (r) return r;
      }
    }
    return null;
  }
  const r = await walk(openerDir);
  if (!r) throw new Error(`opener range not found in ${openerDir}`);
  return r;
}

/** Find the BB's 3-bet size branch dir. TexasSolver names it like
 *  "11.0bb" or "9.0bb" — the only child whose name ends in 'bb'. */
async function findThreeBetSizeDir(bbDir: string): Promise<string | null> {
  const entries = await readdir(bbDir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory() && e.name.endsWith('bb')) {
      return join(bbDir, e.name);
    }
  }
  return null;
}

/** For a given opener, produce:
 *     rfiChart    — raise freq per combo (keys: combo, values: 0-1)
 *     bbMixChart  — full BB defence mix per combo
 */
async function extractOpener(opener: string) {
  const openerDir = join(SOURCE, opener);
  const sizeDirs = (await readdir(openerDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && e.name.endsWith('bb'));
  if (sizeDirs.length === 0) throw new Error(`no open size for ${opener}`);
  const sizeDir = join(openerDir, sizeDirs[0].name);

  // --- RFI range: opener's own raising frequencies ---
  const rfi = await findOpenerRange(sizeDir, opener);

  // --- BB defence mix (only meaningful if BB is in this tree) ---
  const bbDir = join(sizeDir, 'BB');
  let bbMix: Record<string, { call: number; raise: number; fold: number }> | null = null;
  if (existsSync(bbDir)) {
    const callRange = (await parseRangeFile(join(bbDir, 'Call', 'BB_range.txt'))) ?? {};
    const threeBetDir = await findThreeBetSizeDir(bbDir);
    // BB's 3-bet range sits inside any leaf of threeBetDir/<opener>/... —
    // BB_range.txt is invariant across those leaves so we take the first.
    let raiseRange: Record<string, number> = {};
    if (threeBetDir) {
      // BB's 3-bet range sits at {threeBetDir}/{opener}/Call/BB_range.txt
      // — i.e. the node where opener just called BB's 3-bet. BB's range
      // doesn't change based on opener's post-3-bet decision, so this
      // Call branch has the pure 3-bet range. Deeper branches (4-bet
      // etc.) filter BB further and give smaller numbers.
      const callBack = join(threeBetDir, opener, 'Call', 'BB_range.txt');
      raiseRange = (await parseRangeFile(callBack)) ?? {};
    }

    const combos = new Set<string>([...Object.keys(callRange), ...Object.keys(raiseRange)]);
    // Include all 169 combos for completeness (folded ones = fold:1)
    for (const c of allCombos()) combos.add(c);

    bbMix = {};
    for (const combo of combos) {
      const call = Math.min(1, callRange[combo] ?? 0);
      const raise = Math.min(1, raiseRange[combo] ?? 0);
      const fold = Math.max(0, 1 - call - raise);
      bbMix[combo] = { call, raise, fold };
    }
  }

  return { rfi, bbMix };
}

/** Produce every 169 preflop combo key in the canonical form. */
function allCombos(): string[] {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const out: string[] = [];
  for (let i = 0; i < ranks.length; i++) {
    for (let j = 0; j < ranks.length; j++) {
      if (i === j) {
        out.push(ranks[i] + ranks[i]);
      } else if (i < j) {
        out.push(ranks[i] + ranks[j] + 's');
      } else {
        out.push(ranks[j] + ranks[i] + 'o');
      }
    }
  }
  return out;
}

/** Shape expected by PreflopStrategyJson consumers. */
interface PreflopCombo {
  raise: number;
  fold: number;
}
interface BbCombo {
  call: number;
  raise: number;
  fold: number;
}

async function writeJson(path: string, data: unknown) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function main() {
  console.log(`source: ${SOURCE}`);
  if (!existsSync(SOURCE)) {
    console.error('✗ source folder not found — pass it as argv[2]');
    process.exit(1);
  }

  let wrote = 0;
  for (const pos of POSITIONS) {
    const { rfi, bbMix } = await extractOpener(pos);

    // RFI JSON — raise freq per combo (missing = 0 fold).
    const rfiOut: Record<string, PreflopCombo> = {};
    for (const combo of allCombos()) {
      const raise = Math.min(1, rfi[combo] ?? 0);
      rfiOut[combo] = { raise, fold: 1 - raise };
    }
    const rfiPath = join(OUT_DIR, `6max_100bb_rfi_${pos}.json`);
    await writeJson(rfiPath, rfiOut);
    console.log(`  ✓ RFI ${pos}  → ${rfiPath}`);
    wrote++;

    // BB defence JSON (only if opener has a BB branch, which is all
    // except when BB IS the opener — not applicable in 6max).
    if (bbMix) {
      const bbPath = join(OUT_DIR, `6max_100bb_bb_vs_${pos}.json`);
      const bbOut: Record<string, BbCombo> = bbMix;
      await writeJson(bbPath, bbOut);
      console.log(`  ✓ BB vs ${pos} → ${bbPath}`);
      wrote++;
    }
  }

  console.log(`\nwrote ${wrote} charts to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
