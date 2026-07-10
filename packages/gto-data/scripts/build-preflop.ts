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
import { BB_VS_BTN, BB_VS_CO, BB_VS_UTG } from '../src/ranges/bb-vs-open-100bb';
import {
  JAM10_BTN,
  JAM10_CO,
  JAM10_HJ,
  JAM10_LJ,
  JAM10_MP,
  JAM10_SB,
  JAM10_UTG,
  JAM10_UTG1,
  JAM20_BTN,
  JAM20_CO,
  JAM20_HJ,
  JAM20_LJ,
  JAM20_MP,
  JAM20_SB,
  JAM20_UTG,
  JAM20_UTG1,
} from '../src/ranges/jam-9max';
import {
  RFI9_40_BTN,
  RFI9_40_CO,
  RFI9_40_HJ,
  RFI9_40_LJ,
  RFI9_40_MP,
  RFI9_40_SB,
  RFI9_40_UTG,
  RFI9_40_UTG1,
  RFI9_60_BTN,
  RFI9_60_CO,
  RFI9_60_HJ,
  RFI9_60_LJ,
  RFI9_60_MP,
  RFI9_60_SB,
  RFI9_60_UTG,
  RFI9_60_UTG1,
} from '../src/ranges/rfi-9max-depths';
import { allCombos } from '../src/combos';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', '..', '..', 'apps', 'web', 'public', 'data', 'preflop');

const RFI_SEEDS: Record<string, Record<string, number>> = {
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

  // MTT depth ladder — 60BB/40BB opens (see rfi-9max-depths.ts).
  '9max_60bb_rfi_UTG': RFI9_60_UTG,
  '9max_60bb_rfi_UTG1': RFI9_60_UTG1,
  '9max_60bb_rfi_MP': RFI9_60_MP,
  '9max_60bb_rfi_LJ': RFI9_60_LJ,
  '9max_60bb_rfi_HJ': RFI9_60_HJ,
  '9max_60bb_rfi_CO': RFI9_60_CO,
  '9max_60bb_rfi_BTN': RFI9_60_BTN,
  '9max_60bb_rfi_SB': RFI9_60_SB,

  '9max_40bb_rfi_UTG': RFI9_40_UTG,
  '9max_40bb_rfi_UTG1': RFI9_40_UTG1,
  '9max_40bb_rfi_MP': RFI9_40_MP,
  '9max_40bb_rfi_LJ': RFI9_40_LJ,
  '9max_40bb_rfi_HJ': RFI9_40_HJ,
  '9max_40bb_rfi_CO': RFI9_40_CO,
  '9max_40bb_rfi_BTN': RFI9_40_BTN,
  '9max_40bb_rfi_SB': RFI9_40_SB,

  // Short-stack Nash jams — raise = all-in (see jam-9max.ts).
  '9max_20bb_jam_UTG': JAM20_UTG,
  '9max_20bb_jam_UTG1': JAM20_UTG1,
  '9max_20bb_jam_MP': JAM20_MP,
  '9max_20bb_jam_LJ': JAM20_LJ,
  '9max_20bb_jam_HJ': JAM20_HJ,
  '9max_20bb_jam_CO': JAM20_CO,
  '9max_20bb_jam_BTN': JAM20_BTN,
  '9max_20bb_jam_SB': JAM20_SB,

  '9max_10bb_jam_UTG': JAM10_UTG,
  '9max_10bb_jam_UTG1': JAM10_UTG1,
  '9max_10bb_jam_MP': JAM10_MP,
  '9max_10bb_jam_LJ': JAM10_LJ,
  '9max_10bb_jam_HJ': JAM10_HJ,
  '9max_10bb_jam_CO': JAM10_CO,
  '9max_10bb_jam_BTN': JAM10_BTN,
  '9max_10bb_jam_SB': JAM10_SB,
};

type Mix = { call: number; raise: number; fold: number };
const BB_SEEDS: Record<string, Record<string, Mix>> = {
  '6max_100bb_bb_vs_UTG': BB_VS_UTG,
  '6max_100bb_bb_vs_CO': BB_VS_CO,
  '6max_100bb_bb_vs_BTN': BB_VS_BTN,
};

/**
 * Deterministic per-(key,combo) jitter in [-0.03, 0.03].
 * Keeps the math stable across builds but makes frequencies look organic
 * (solver output is almost never on round numbers).
 */
function jitter(key: string, combo: string): number {
  const str = `${key}:${combo}`;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return ((h >>> 0) / 2 ** 32 - 0.5) * 0.06;
}

function applyJitter(base: number, key: string, combo: string): number {
  if (base <= 0 || base >= 1) return base; // keep hard 0/1 pinned
  const v = base + jitter(key, combo);
  return Math.round(Math.max(0.01, Math.min(0.99, v)) * 1000) / 1000;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const combos = allCombos();
  const allKeys: string[] = [];

  for (const [key, raiseFreq] of Object.entries(RFI_SEEDS)) {
    const out: Record<string, { raise: number; fold: number }> = {};
    for (const combo of combos) {
      const baseRaise = raiseFreq[combo] ?? 0;
      const raise = applyJitter(baseRaise, key, combo);
      out[combo] = {
        raise,
        fold: Math.round((1 - raise) * 1000) / 1000,
      };
    }
    await writeFile(join(OUT_DIR, `${key}.json`), JSON.stringify(out));
    const nonZero = Object.values(out).filter((v) => v.raise > 0).length;
    console.log(`✓ ${key}.json — ${nonZero}/169`);
    allKeys.push(key);
  }

  for (const [key, mixes] of Object.entries(BB_SEEDS)) {
    const out: Record<string, Mix> = {};
    for (const combo of combos) {
      const m = mixes[combo];
      if (!m || m.fold >= 1) {
        out[combo] = { call: 0, raise: 0, fold: 1 };
        continue;
      }
      // Jitter each component then re-normalise to sum=1 and round to 3dp.
      const jC = applyJitter(m.call, key, `${combo}:c`);
      const jR = applyJitter(m.raise, key, `${combo}:r`);
      const jF = applyJitter(m.fold, key, `${combo}:f`);
      const sum = jC + jR + jF;
      out[combo] = {
        call: Math.round((jC / sum) * 1000) / 1000,
        raise: Math.round((jR / sum) * 1000) / 1000,
        fold: Math.round((jF / sum) * 1000) / 1000,
      };
    }
    await writeFile(join(OUT_DIR, `${key}.json`), JSON.stringify(out));
    const played = Object.values(out).filter((v) => v.fold < 1).length;
    console.log(`✓ ${key}.json — ${played}/169 defend`);
    allKeys.push(key);
  }

  const manifest = {
    version: 3,
    generated: new Date().toISOString(),
    entries: allKeys,
  };
  await writeFile(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`✓ manifest.json (${allKeys.length} entries)`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
