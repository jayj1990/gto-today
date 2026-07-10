#!/usr/bin/env -S node --loader tsx
/**
 * close-qb-trees.ts — run the fold-alias + closure passes over the
 * shipped qb_decisions trees (see qb-tree-closure.ts for the why).
 *
 * Usage: tsx scripts/close-qb-trees.ts <file.json> [...]
 *   9-max files (name contains "9max") close over the 9-seat order.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { closeTree, type Tree } from './qb-tree-closure';

const ORDER6 = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'] as const;
const ORDER9 = ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'] as const;

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('usage: tsx close-qb-trees.ts <qb_decisions.json> [...]');
    process.exit(1);
  }
  for (const file of files) {
    const tree: Tree = JSON.parse(await readFile(file, 'utf8'));
    const order = basename(file).includes('9max') ? ORDER9 : ORDER6;
    const before = Object.keys(tree).length;
    const { synthesized, unresolved } = closeTree(tree, order);
    if (unresolved.length > 0) {
      console.error(`✗ ${basename(file)} — ${unresolved.length} nodes without donors:`);
      for (const k of unresolved.slice(0, 10)) console.error(`  ${k}`);
      process.exit(1);
    }
    await writeFile(file, JSON.stringify(tree));
    console.log(
      `✓ ${basename(file)} — ${before} → ${Object.keys(tree).length} nodes (+${synthesized} synthesized)`,
    );
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
