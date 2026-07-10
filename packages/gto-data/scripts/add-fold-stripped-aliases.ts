#!/usr/bin/env -S node --loader tsx
/**
 * add-fold-stripped-aliases.ts — make qb_decisions trees reachable by
 * the ChartNavigator key scheme.
 *
 * TexasSolver's exported node keys spell out mid-line folds
 * ("CO_2.5bb_BTN_Call_BB_13.0bb_CO_FOLD_BTN" — opener folds to the
 * squeeze, BTN to act) but resolveNode builds keys with every FOLD
 * token stripped ("CO_2.5bb_BTN_Call_BB_13.0bb_BTN"). 119 of the 304
 * 6-max nodes carried mid-line folds, so every squeeze/4bet line where
 * a participant folded dead-ended into a bogus 플랍 도달 screen
 * (caught 2026-07-11 by the 9-max tree validator).
 *
 * Fix at the data layer: for every key containing X_FOLD pairs, also
 * emit the fold-stripped key pointing at the same action map. An
 * existing exact (fold-free) node is never overwritten; when two fold
 * placements strip to the same key the fewest-folds source wins.
 * Idempotent — safe to re-run after any tree rebuild.
 *
 * Usage: tsx scripts/add-fold-stripped-aliases.ts <file.json> [...]
 */
import { readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

const POSITIONS = new Set([
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

type Tree = Record<string, Record<string, Record<string, number>>>;

/** Drop every `<pos>_FOLD` pair from a node key; null if none present. */
function stripFolds(key: string): string | null {
  const tokens = key.split('_');
  const out: string[] = [];
  let stripped = false;
  for (let i = 0; i < tokens.length; i++) {
    if (POSITIONS.has(tokens[i]!) && tokens[i + 1] === 'FOLD') {
      i++; // skip the FOLD token too
      stripped = true;
      continue;
    }
    out.push(tokens[i]!);
  }
  return stripped ? out.join('_') : null;
}

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('usage: tsx add-fold-stripped-aliases.ts <qb_decisions.json> [...]');
    process.exit(1);
  }
  for (const file of files) {
    const tree: Tree = JSON.parse(await readFile(file, 'utf8'));
    const foldCount = (k: string) => k.split('_FOLD').length - 1;
    let added = 0;
    for (const key of Object.keys(tree).sort((a, b) => foldCount(a) - foldCount(b))) {
      const alias = stripFolds(key);
      if (alias && !tree[alias]) {
        tree[alias] = tree[key]!;
        added++;
      }
    }
    await writeFile(file, JSON.stringify(tree));
    console.log(`✓ ${basename(file)} — +${added} aliases → ${Object.keys(tree).length} nodes`);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
