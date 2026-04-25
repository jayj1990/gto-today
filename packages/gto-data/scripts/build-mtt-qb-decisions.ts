/**
 * Generate mtt_6max_100bb_qb_decisions.json by widening the cash qb
 * decision tree with the same MULTIPLICATIVE raise/call factors the
 * defense charts use (build-mtt-heuristic.ts → DEF_ADJ). The old
 * additive-from-FOLD widening overstated MTT aggression by ~5 %
 * absolute compared to ground-truth GTO Wizard outputs (e.g. 88 on
 * MP vs UTG 2.5x showed 27.9 % raise here vs 22.5 % in Wizard).
 *
 * Algorithm per node:
 *   1. Figure out which actor is facing which prior bet at this node.
 *      `opener` = the position whose last action we're responding to.
 *   2. Look up DEF_ADJ[opener] for callMul / raiseMul.
 *   3. For every combo:
 *        - non-fold actions: multiply by the appropriate factor
 *          (sizing branches like "8.5bb" and "AllIn" are treated as
 *          raises; "Call" gets callMul)
 *        - FOLD absorbs the residual (1 − Σ non-fold)
 *   4. RFI nodes (no prior action) fall back to the additive RFI_WIDEN
 *      bump from build-mtt-heuristic.ts — opening ranges do get
 *      genuinely wider with ante money even on the first action.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const DATA_DIR = join(REPO_ROOT, 'apps', 'web', 'public', 'data', 'preflop');

/** RFI widening bump — same values + rationale as build-mtt-heuristic.ts.
 *  Applied additively at nodes where the acting position is the first
 *  to act (no prior raise to respond to). */
const RFI_WIDEN: Record<string, number> = {
  UTG: 0.05,
  MP: 0.08,
  CO: 0.12,
  BTN: 0.06,
  SB: 0.18,
  BB: 0.22,
};

/** Defense multipliers — same values as build-mtt-heuristic.ts DEF_ADJ,
 *  indexed by the OPENER (i.e. who we're responding to). Matches the
 *  mtt_*_vs_*.json generation so the two data sources agree combo-for-
 *  combo. BB defender values ride the BB_DEF_ADJ curve which has
 *  slightly larger multipliers than non-BB defenders. */
const DEF_ADJ: Record<string, { callMul: number; raiseMul: number }> = {
  UTG: { callMul: 1.08, raiseMul: 1.03 },
  MP: { callMul: 1.1, raiseMul: 1.03 },
  CO: { callMul: 1.12, raiseMul: 1.05 },
  BTN: { callMul: 1.15, raiseMul: 1.08 },
  SB: { callMul: 1.18, raiseMul: 1.08 },
};

const BB_DEF_ADJ: Record<string, { callMul: number; raiseMul: number }> = {
  UTG: { callMul: 1.15, raiseMul: 1.05 },
  MP: { callMul: 1.18, raiseMul: 1.05 },
  CO: { callMul: 1.2, raiseMul: 1.08 },
  BTN: { callMul: 1.2, raiseMul: 1.1 },
  SB: { callMul: 1.25, raiseMul: 1.1 },
};

const POSITIONS = new Set(['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB']);

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function actingPosition(key: string): string | null {
  const parts = key.split('_');
  for (let i = parts.length - 1; i >= 0; i--) {
    if (POSITIONS.has(parts[i] ?? '')) return parts[i]!;
  }
  return null;
}

/** Walk the key backwards: starting just before the acting position,
 *  find the position whose last *action* the actor is now responding
 *  to. For `UTG_2.5bb_MP` the acting position is MP and the opener
 *  is UTG (whose 2.5bb open we're facing). For `UTG_2.5bb_BTN_8.5bb_MP`
 *  MP is facing BTN's 8.5bb 3bet → opener=BTN for DEF_ADJ purposes. */
function previousActor(key: string): string | null {
  const parts = key.split('_');
  // Last position token is the actor. Walk backward from one-before-it.
  let actorIdx = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (POSITIONS.has(parts[i] ?? '')) {
      actorIdx = i;
      break;
    }
  }
  if (actorIdx <= 0) return null;
  for (let i = actorIdx - 1; i >= 0; i--) {
    if (POSITIONS.has(parts[i] ?? '')) return parts[i]!;
  }
  return null;
}

/** "Call" / "FOLD" are fixed labels. Sizing strings like "8.5bb",
 *  "21.0bb", "AllIn" are raises for our purposes. */
function classifyAction(a: string): 'fold' | 'call' | 'raise' {
  if (a === 'FOLD') return 'fold';
  if (a === 'Call') return 'call';
  return 'raise';
}

async function main() {
  const inputPath = join(DATA_DIR, '6max_100bb_qb_decisions.json');
  const outputPath = join(DATA_DIR, 'mtt_6max_100bb_qb_decisions.json');
  const raw = await readFile(inputPath, 'utf8');
  const data: Record<string, Record<string, Record<string, number>>> = JSON.parse(raw);

  let rfiWidened = 0;
  let defenseWidened = 0;
  let skipped = 0;
  const out: typeof data = {};

  for (const [key, actions] of Object.entries(data)) {
    const actor = actingPosition(key);
    const opener = previousActor(key);

    const nonFoldKeys = Object.keys(actions).filter((a) => a !== 'FOLD');
    const foldBranch = actions['FOLD'];

    // Collect the combo set union — the same combo might appear under
    // FOLD only, non-fold only, or both. We emit freqs for every combo
    // seen anywhere under this node.
    const allCombos = new Set<string>();
    for (const a of Object.keys(actions)) {
      for (const c of Object.keys(actions[a]!)) allCombos.add(c);
    }

    if (!foldBranch || nonFoldKeys.length === 0 || allCombos.size === 0) {
      out[key] = actions;
      skipped++;
      continue;
    }

    const newActions: Record<string, Record<string, number>> = {};
    for (const a of Object.keys(actions)) newActions[a] = {};

    // --- Defense / multi-level nodes: multiplicative widen ----------
    if (opener && actor && opener !== actor) {
      const adj = actor === 'BB' ? (BB_DEF_ADJ[opener] ?? null) : (DEF_ADJ[opener] ?? null);
      if (!adj) {
        out[key] = actions;
        skipped++;
        continue;
      }

      for (const combo of allCombos) {
        // Multiply each non-fold branch by its kind-specific factor.
        let nonFoldSum = 0;
        for (const a of nonFoldKeys) {
          const cur = actions[a]?.[combo] ?? 0;
          const mul = classifyAction(a) === 'call' ? adj.callMul : adj.raiseMul;
          const next = clamp01(cur * mul);
          newActions[a]![combo] = next;
          nonFoldSum += next;
        }
        // FOLD absorbs the residual. If the widened non-fold total
        // overshoots 1 (can happen for combos already at 90%+ non-fold),
        // proportionally renormalize down to fit under fold=0.
        if (nonFoldSum > 1) {
          const scale = 1 / nonFoldSum;
          for (const a of nonFoldKeys) {
            newActions[a]![combo] = clamp01((newActions[a]![combo] ?? 0) * scale);
          }
          newActions['FOLD']![combo] = 0;
        } else {
          newActions['FOLD']![combo] = clamp01(1 - nonFoldSum);
        }
      }

      out[key] = newActions;
      defenseWidened++;
      continue;
    }

    // --- RFI (no opener in path): additive fold→non-fold shift -------
    const bump = actor ? (RFI_WIDEN[actor] ?? 0.05) : 0.05;
    for (const combo of allCombos) {
      const oldFold = foldBranch[combo] ?? 0;
      let totalNonFold = 0;
      for (const a of nonFoldKeys) totalNonFold += actions[a]?.[combo] ?? 0;

      // Pure-fold combos stay pure fold — trash like K2s shouldn't
      // start raising out of thin air under an ante.
      if (totalNonFold === 0) {
        newActions['FOLD']![combo] = clamp01(oldFold);
        for (const a of nonFoldKeys) newActions[a]![combo] = actions[a]?.[combo] ?? 0;
        continue;
      }

      const shift = oldFold * bump;
      newActions['FOLD']![combo] = clamp01(oldFold - shift);
      for (const a of nonFoldKeys) {
        const cur = actions[a]?.[combo] ?? 0;
        newActions[a]![combo] = clamp01(cur + shift * (cur / totalNonFold));
      }
    }

    out[key] = newActions;
    rfiWidened++;
  }

  await writeFile(outputPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`✓ wrote ${outputPath}`);
  console.log(`  defense nodes (multiplicative): ${defenseWidened}`);
  console.log(`  RFI nodes (additive bump): ${rfiWidened}`);
  console.log(`  skipped (no FOLD / non-fold actions): ${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
