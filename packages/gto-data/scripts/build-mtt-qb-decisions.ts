/**
 * Generate mtt_6max_100bb_qb_decisions.json by widening the cash qb
 * decision tree with the same per-position MTT bumps as the RFI
 * heuristic. Each node has an `actions` map like:
 *   { FOLD: {combo: freq}, "2.5bb": {combo: freq}, Call: {...} }
 *
 * We shift weight from FOLD into the non-fold actions, proportional to
 * the bump for the position currently acting. The last underscore-
 * separated token of a node key is the acting position.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const DATA_DIR = join(REPO_ROOT, 'apps', 'web', 'public', 'data', 'preflop');

/** Per-position widening — matches build-mtt-heuristic.ts. */
const BUMP: Record<string, number> = {
  UTG: 0.05,
  MP: 0.08,
  CO: 0.12,
  BTN: 0.06,
  SB: 0.18,
  BB: 0.22, // BB defends more widely with ante pot odds
};

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/** The acting player at a node = last position token in the key. */
function actingPosition(key: string): string | null {
  const parts = key.split('_');
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (p && ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'].includes(p)) return p;
  }
  return null;
}

async function main() {
  const inputPath = join(DATA_DIR, '6max_100bb_qb_decisions.json');
  const outputPath = join(DATA_DIR, 'mtt_6max_100bb_qb_decisions.json');
  const raw = await readFile(inputPath, 'utf8');
  const data: Record<string, Record<string, Record<string, number>>> = JSON.parse(raw);

  let widened = 0;
  let skipped = 0;
  const out: typeof data = {};
  for (const [key, actions] of Object.entries(data)) {
    const pos = actingPosition(key);
    const bump = pos ? (BUMP[pos] ?? 0.05) : 0.05;

    // Shift fold → non-fold. For each combo in FOLD action, reduce by
    // bump * current_fold_weight, and distribute the shifted weight
    // into non-fold actions in proportion to their existing freq.
    const foldBranch = actions['FOLD'];
    if (!foldBranch) {
      out[key] = actions;
      skipped++;
      continue;
    }

    const nonFoldKeys = Object.keys(actions).filter((a) => a !== 'FOLD');
    if (nonFoldKeys.length === 0) {
      out[key] = actions;
      skipped++;
      continue;
    }

    const newActions: Record<string, Record<string, number>> = {};
    for (const a of Object.keys(actions)) newActions[a] = {};

    const allCombos = new Set<string>();
    for (const a of Object.keys(actions)) {
      for (const c of Object.keys(actions[a]!)) allCombos.add(c);
    }

    for (const combo of allCombos) {
      const oldFold = foldBranch[combo] ?? 0;
      const shift = oldFold * bump;
      newActions['FOLD']![combo] = clamp01(oldFold - shift);

      // Total non-fold weight currently for this combo
      let totalNonFold = 0;
      for (const a of nonFoldKeys) {
        totalNonFold += actions[a]?.[combo] ?? 0;
      }

      for (const a of nonFoldKeys) {
        const cur = actions[a]?.[combo] ?? 0;
        // Distribute shift: if combo already has some non-fold weight,
        // add proportionally. Otherwise dump into first non-fold action
        // (usually the call / smallest raise).
        const share = totalNonFold > 0 ? cur / totalNonFold : (a === nonFoldKeys[0] ? 1 : 0);
        newActions[a]![combo] = clamp01(cur + shift * share);
      }
    }

    out[key] = newActions;
    widened++;
  }

  await writeFile(outputPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`✓ wrote ${outputPath}`);
  console.log(`  widened: ${widened} nodes, skipped: ${skipped} (no FOLD branch)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
