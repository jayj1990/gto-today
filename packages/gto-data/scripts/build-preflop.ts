#!/usr/bin/env -S node --loader tsx
/**
 * Build pre-flop GTO JSON from the handcrafted seed ranges.
 * Emits one JSON file per (format × stack × scenario × position) under
 * apps/web/public/data/preflop/.
 *
 * Run via `pnpm --filter @gto/gto-data build`.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RFI_BTN, RFI_CO, RFI_MP, RFI_SB, RFI_UTG } from '../src/ranges/rfi-100bb';
import {
  RFI9_BTN,
  RFI9_CO,
  RFI9_HJ,
  RFI9_LJ,
  RFI9_MP,
  RFI9_SB,
  RFI9_UTG,
  RFI9_UTG1,
} from '../src/ranges/rfi-9max-100bb';
import { allCombos } from '../src/combos';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', '..', '..', 'apps', 'web', 'public', 'data', 'preflop');

const SEEDS: Record<string, Record<string, number>> = {
  '6max_100bb_rfi_UTG': RFI_UTG,
  '6max_100bb_rfi_MP': RFI_MP,
  '6max_100bb_rfi_CO': RFI_CO,
  '6max_100bb_rfi_BTN': RFI_BTN,
  '6max_100bb_rfi_SB': RFI_SB,

  '9max_100bb_rfi_UTG': RFI9_UTG,
  '9max_100bb_rfi_UTG1': RFI9_UTG1,
  '9max_100bb_rfi_MP': RFI9_MP,
  '9max_100bb_rfi_LJ': RFI9_LJ,
  '9max_100bb_rfi_HJ': RFI9_HJ,
  '9max_100bb_rfi_CO': RFI9_CO,
  '9max_100bb_rfi_BTN': RFI9_BTN,
  '9max_100bb_rfi_SB': RFI9_SB,
};

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const combos = allCombos();

  for (const [key, raiseFreq] of Object.entries(SEEDS)) {
    const out: Record<string, { raise: number; fold: number }> = {};
    for (const combo of combos) {
      const raise = raiseFreq[combo] ?? 0;
      out[combo] = { raise, fold: 1 - raise };
    }
    const file = join(OUT_DIR, `${key}.json`);
    await writeFile(file, JSON.stringify(out));
    const nonZero = Object.values(out).filter((v) => v.raise > 0).length;
    console.log(`✓ ${key}.json — ${nonZero}/169 combos play`);
  }

  const manifest = {
    version: 2,
    generated: new Date().toISOString(),
    entries: Object.keys(SEEDS),
  };
  await writeFile(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`✓ manifest.json (${manifest.entries.length} entries)`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
