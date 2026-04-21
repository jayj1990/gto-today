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

/** qb_ranges root — flat files with real action-probability weights.
 *  Supersedes the old 6max_range walk which only gave 0/1 "in tree"
 *  flags, producing wrong RFI mixes for solver-mixed combos like 65s. */
const QB_ROOT_DEFAULT =
  'C:\\Users\\Jay\\Desktop\\GTO-Today\\TexasSolver-v0.2.0-Windows\\ranges\\qb_ranges\\100bb 2.5x 500rake';

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

/** Find the 3-bet size dir for a given defender (subdirectory whose
 *  name ends with 'bb'). */
async function findDefenderThreeBetDir(defenderDir: string): Promise<string | null> {
  const entries = await readdir(defenderDir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory() && e.name.endsWith('bb')) {
      return join(defenderDir, e.name);
    }
  }
  return null;
}

/** Extract a full defence mix for a single (opener, defender) pair. */
async function extractDefence(
  sizeDir: string,
  opener: string,
  defender: string,
): Promise<Record<string, { call: number; raise: number; fold: number }> | null> {
  const defenderDir = join(sizeDir, defender);
  if (!existsSync(defenderDir)) return null;

  const callRange =
    (await parseRangeFile(join(defenderDir, 'Call', `${defender}_range.txt`))) ?? {};
  const threeBetDir = await findDefenderThreeBetDir(defenderDir);
  let raiseRange: Record<string, number> = {};
  if (threeBetDir) {
    const callBack = join(threeBetDir, opener, 'Call', `${defender}_range.txt`);
    raiseRange = (await parseRangeFile(callBack)) ?? {};
  }

  const mix: Record<string, { call: number; raise: number; fold: number }> = {};
  for (const combo of allCombos()) {
    const call = Math.min(1, callRange[combo] ?? 0);
    const raise = Math.min(1, raiseRange[combo] ?? 0);
    const fold = Math.max(0, 1 - call - raise);
    mix[combo] = { call, raise, fold };
  }
  return mix;
}

/** For a given opener, produce:
 *     rfiChart      — opener's raise freq per combo
 *     defenceCharts — mix per combo for every defender (BB, SB, BTN, …)
 */
async function extractOpener(opener: string) {
  const openerDir = join(SOURCE, opener);
  const sizeDirs = (await readdir(openerDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && e.name.endsWith('bb'));
  if (sizeDirs.length === 0) throw new Error(`no open size for ${opener}`);
  const sizeDir = join(openerDir, sizeDirs[0].name);

  const rfi = await findOpenerRange(sizeDir, opener);

  // Every subdirectory of sizeDir that isn't a range file is a
  // defender (BB / SB / BTN / CO / MP depending on opener).
  const defenceCharts: Record<string, Record<string, { call: number; raise: number; fold: number }>> = {};
  const entries = await readdir(sizeDir, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const chart = await extractDefence(sizeDir, opener, e.name);
    if (chart) defenceCharts[e.name] = chart;
  }

  return { rfi, defenceCharts };
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

/* ==================================================================
 *  qb_ranges parser — a deeper, flat-file corpus that covers vs-3bet,
 *  vs-4bet, and 3-way squeeze scenarios that 6max_range/ doesn't.
 *
 *  File naming pattern (inside qb_ranges/100bb 2.5x 500rake/<POS>/):
 *
 *    <P1>_<A1>_<P2>_<A2>_..._<PK>_<AK>.txt
 *
 *  where the LAST segment is the action the owning player took at
 *  their decision node. Sibling files differing only in that last
 *  action describe the same node — we group them and synthesise a
 *  {action → freq} mix for every combo.
 * ================================================================== */

interface DecisionMix {
  actions: Record<string, Record<string, number>>; // action label → combo → freq
}

function parseActionToken(token: string): 'FOLD' | 'Call' | 'AllIn' | { size: number } | null {
  if (token === 'FOLD' || token === 'Call' || token === 'AllIn') return token;
  if (token.endsWith('bb')) {
    const n = Number(token.slice(0, -2));
    if (Number.isFinite(n)) return { size: n };
  }
  return null;
}

/** Read every .txt file under `dir` recursively, ignoring non-range files. */
async function collectRangeFiles(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await collectRangeFiles(p)));
    } else if (e.name.endsWith('.txt')) {
      out.push(p);
    }
  }
  return out;
}

/** Parse a qb_ranges folder into keyed decision mixes. Key format:
 *    "UTG_2.5bb_BB"                  — BB decides after UTG opens
 *    "UTG_2.5bb_BB_11.0bb_UTG"       — UTG decides after BB 3-bet
 *  Values: { [actionLabel]: { [combo]: freq } } — flat, no wrapper. */
async function extractQbRanges(qbRoot: string) {
  const files = await collectRangeFiles(qbRoot);
  const groups = new Map<string, { files: { path: string; lastToken: string }[] }>();

  for (const full of files) {
    const relRaw = full.slice(qbRoot.length + 1).replace(/\\/g, '/');
    // Strip position subfolder ("BB/" / "BTN/vs_3bet/" etc.) — the
    // action-path segments in the filename already carry the full
    // context we need. Splitting on '/' and taking the last part
    // drops those folders.
    const noFolders = relRaw.split('/').pop()!;
    const rel = noFolders.replace(/\.txt$/, '');
    const lastSep = rel.lastIndexOf('_');
    if (lastSep < 0) continue;
    const prefix = rel.slice(0, lastSep);
    const lastToken = rel.slice(lastSep + 1);
    if (!parseActionToken(lastToken)) continue;
    const bucket = groups.get(prefix) ?? { files: [] };
    bucket.files.push({ path: full, lastToken });
    groups.set(prefix, bucket);
  }

  // Flat { key: { action: { combo: freq } } } — no wrapper object.
  const decisions: Record<string, Record<string, Record<string, number>>> = {};
  let dropped = 0;
  for (const [prefix, { files: group }] of groups) {
    const actions: Record<string, Record<string, number>> = {};
    for (const { path, lastToken } of group) {
      const range = await parseRangeFile(path);
      if (!range) continue;
      actions[lastToken] = range;
    }
    if (Object.keys(actions).length === 0) continue;
    if (!isSaneNode(actions)) {
      dropped++;
      continue;
    }
    decisions[prefix] = { ...(decisions[prefix] ?? {}), ...actions };
  }
  if (dropped > 0) console.log(`  (dropped ${dropped} unconverged nodes)`);
  return decisions;
}

/** Reject solver nodes whose output is visibly unconverged — deep
 *  vs_5bet branches sometimes ship with AA folding or KK folding at
 *  rates that are never correct GTO. We only accept a node where the
 *  top-of-range hands behave sanely (AA never folds more than 5%, KK
 *  never folds more than 25%). */
function isSaneNode(actions: Record<string, Record<string, number>>): boolean {
  const foldBranch = actions['FOLD'];
  if (!foldBranch) return true;
  const aaFold = foldBranch['AA'] ?? 0;
  const kkFold = foldBranch['KK'] ?? 0;
  if (aaFold > 0.05) return false;
  if (kkFold > 0.25) return false;
  return true;
}

/** Opening sizes TexasSolver ships per position. UTG/MP/CO/BTN raise
 *  2.5x; SB opens 3x (different tree). Used to find the right action
 *  probability file. */
const OPEN_SIZE: Record<string, string> = {
  UTG: '2.5bb',
  MP: '2.5bb',
  CO: '2.5bb',
  BTN: '2.5bb',
  SB: '3.0bb',
};

/** Read `<POS>/<POS>_<openSize>.txt` → probability POS opens each combo.
 *  This is the REAL mix (e.g. 65s = 0.442 for CO). */
async function extractRfiFromQb(qbRoot: string, pos: string) {
  const size = OPEN_SIZE[pos]!;
  const raiseFile = join(qbRoot, pos, `${pos}_${size}.txt`);
  const raiseRange = (await parseRangeFile(raiseFile)) ?? {};

  const rfiOut: Record<string, PreflopCombo> = {};
  for (const combo of allCombos()) {
    const raise = Math.min(1, raiseRange[combo] ?? 0);
    rfiOut[combo] = { raise, fold: 1 - raise };
  }
  return rfiOut;
}

/** Read defender's call + 3bet + fold files for a given opener.
 *  File pattern: `<DEFENDER>/<opener>_<openSize>_<DEFENDER>_<action>.txt`
 *  where action ∈ { Call, FOLD, <3bet size> }. */
async function extractDefenseFromQb(qbRoot: string, opener: string, defender: string) {
  const openSize = OPEN_SIZE[opener]!;
  const defDir = join(qbRoot, defender);
  if (!existsSync(defDir)) return null;

  const prefix = `${opener}_${openSize}_${defender}_`;
  const entries = await readdir(defDir);
  let callFile: string | null = null;
  let foldFile: string | null = null;
  let raiseFile: string | null = null;
  for (const name of entries) {
    if (!name.startsWith(prefix) || !name.endsWith('.txt')) continue;
    const action = name.slice(prefix.length, -4);
    if (action === 'Call') callFile = join(defDir, name);
    else if (action === 'FOLD') foldFile = join(defDir, name);
    else if (action.endsWith('bb')) raiseFile = join(defDir, name);
  }
  if (!callFile && !foldFile && !raiseFile) return null;

  const callRange = callFile ? ((await parseRangeFile(callFile)) ?? {}) : {};
  const foldRange = foldFile ? ((await parseRangeFile(foldFile)) ?? {}) : {};
  const raiseRange = raiseFile ? ((await parseRangeFile(raiseFile)) ?? {}) : {};

  const mix: Record<string, { call: number; raise: number; fold: number }> = {};
  for (const combo of allCombos()) {
    const call = Math.min(1, callRange[combo] ?? 0);
    const raise = Math.min(1, raiseRange[combo] ?? 0);
    // Prefer the solver's own fold weight if present; fall back to
    // 1 − call − raise (should equal the recorded fold exactly).
    const foldRaw = foldRange[combo];
    const fold =
      foldRaw !== undefined
        ? Math.max(0, Math.min(1, foldRaw))
        : Math.max(0, 1 - call - raise);
    mix[combo] = { call, raise, fold };
  }
  return mix;
}

async function main() {
  const qbRoot = process.argv[3] ?? QB_ROOT_DEFAULT;
  console.log(`source: ${qbRoot}`);
  if (!existsSync(qbRoot)) {
    console.error('✗ qb_ranges folder not found');
    process.exit(1);
  }

  let wrote = 0;
  for (const pos of POSITIONS) {
    // RFI chart — real mix frequencies from <POS>/<POS>_<size>.txt.
    const rfiOut = await extractRfiFromQb(qbRoot, pos);
    const rfiPath = join(OUT_DIR, `6max_100bb_rfi_${pos}.json`);
    await writeJson(rfiPath, rfiOut);
    console.log(`  ✓ RFI ${pos}  → ${rfiPath}`);
    wrote++;

    // Defense charts for every defender that has files for this opener.
    for (const defender of [...POSITIONS, 'BB']) {
      if (defender === pos) continue;
      const mix = await extractDefenseFromQb(qbRoot, pos, defender);
      if (!mix) continue;
      const low = defender.toLowerCase();
      const path = join(OUT_DIR, `6max_100bb_${low}_vs_${pos}.json`);
      await writeJson(path, mix);
      console.log(`  ✓ ${defender} vs ${pos} → ${path}`);
      wrote++;
    }
  }

  console.log(`\nwrote ${wrote} primary charts to ${OUT_DIR}`);

  // ============ qb_ranges decision tree (for /charts navigator) ============
  console.log(`\nparsing qb_ranges decisions: ${qbRoot}`);
  const decisions = await extractQbRanges(qbRoot);
  const qbOut = join(OUT_DIR, '6max_100bb_qb_decisions.json');
  await writeJson(qbOut, decisions);
  console.log(
    `  ✓ qb_ranges → ${qbOut} (${Object.keys(decisions).length} decision nodes)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
