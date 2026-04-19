import { describe, expect, it, beforeEach } from 'vitest';
import { RFI_BTN, RFI_CO, RFI_MP, RFI_SB, RFI_UTG } from './ranges/rfi-100bb';
import {
  clearPreflopCache,
  getPreflopChart,
  getPreflopStrategy,
  setPreflopLoader,
  type PreflopStrategyJson,
} from './preflop';
import { allCombos, gridKey } from './combos';
import type { ComboKey } from '@gto/poker-core';

// Build a synthetic dataset matching the build script output.
function buildDataset(raiseFreq: Record<string, number>): PreflopStrategyJson {
  const out: PreflopStrategyJson = {};
  for (const combo of allCombos()) {
    const r = raiseFreq[combo] ?? 0;
    out[combo] = { raise: r, fold: 1 - r };
  }
  return out;
}

const DATA: Record<string, PreflopStrategyJson> = {
  '6max_100bb_rfi_UTG': buildDataset(RFI_UTG),
  '6max_100bb_rfi_MP': buildDataset(RFI_MP),
  '6max_100bb_rfi_CO': buildDataset(RFI_CO),
  '6max_100bb_rfi_BTN': buildDataset(RFI_BTN),
  '6max_100bb_rfi_SB': buildDataset(RFI_SB),
  '9max_100bb_rfi_UTG': buildDataset(RFI_UTG),
  '9max_100bb_rfi_UTG1': buildDataset(RFI_UTG),
};

beforeEach(() => {
  clearPreflopCache();
  setPreflopLoader(async (key: string) => DATA[key] ?? null);
});

describe('getPreflopStrategy', () => {
  it('AA from UTG is always a raise', async () => {
    const r = await getPreflopStrategy({
      combo: 'AA' as ComboKey,
      position: 'UTG',
      format: '6max',
    });
    expect(r).not.toBeNull();
    expect(r?.raise).toBe(1);
    expect(r?.primary).toBe('raise');
    expect(r?.approximated).toBe(false);
  });

  it('72o is always a fold (missing from range = implicit 0)', async () => {
    const r = await getPreflopStrategy({
      combo: '72o' as ComboKey,
      position: 'BTN',
      format: '6max',
    });
    expect(r?.raise).toBe(0);
    expect(r?.primary).toBe('fold');
  });

  it('primary is "mixed" when 0.25 < raise < 0.75', async () => {
    // A9s from UTG = 0.5 raise frequency
    const r = await getPreflopStrategy({
      combo: 'A9s' as ComboKey,
      position: 'UTG',
      format: '6max',
    });
    expect(r?.raise).toBe(0.5);
    expect(r?.primary).toBe('mixed');
  });

  it('BTN opens wider than UTG', async () => {
    let btnOpens = 0;
    let utgOpens = 0;
    for (const combo of allCombos()) {
      const btn = await getPreflopStrategy({
        combo,
        position: 'BTN',
        format: '6max',
      });
      const utg = await getPreflopStrategy({
        combo,
        position: 'UTG',
        format: '6max',
      });
      if ((btn?.raise ?? 0) > 0) btnOpens++;
      if ((utg?.raise ?? 0) > 0) utgOpens++;
    }
    expect(btnOpens).toBeGreaterThan(utgOpens);
    expect(btnOpens).toBeGreaterThan(80); // BTN plays ~50%+ of hands
    expect(utgOpens).toBeLessThan(40); // UTG plays ~15-20%
  });

  it('9-max UTG2 falls back to 9-max UTG1 and flags approximated', async () => {
    const r = await getPreflopStrategy({
      combo: 'AA' as ComboKey,
      position: 'UTG2',
      format: '9max',
    });
    expect(r).not.toBeNull();
    expect(r?.approximated).toBe(true);
  });

  it('10-max pushes through 9-max with approximation flag', async () => {
    const r = await getPreflopStrategy({
      combo: 'AA' as ComboKey,
      position: 'UTG',
      format: '10max',
    });
    expect(r).not.toBeNull();
    expect(r?.approximated).toBe(true);
  });

  it('returns null when data is missing entirely', async () => {
    setPreflopLoader(async () => null);
    const r = await getPreflopStrategy({
      combo: 'AA' as ComboKey,
      position: 'BTN',
      format: '6max',
    });
    expect(r).toBeNull();
  });
});

describe('getPreflopChart', () => {
  it('returns full 169-combo map', async () => {
    const chart = await getPreflopChart('6max', 'BTN');
    expect(chart).not.toBeNull();
    expect(Object.keys(chart ?? {}).length).toBe(169);
  });

  it('contains AA = raise 100%', async () => {
    const chart = await getPreflopChart('6max', 'UTG');
    expect(chart?.['AA']).toEqual({ raise: 1, fold: 0 });
  });
});

describe('combo grid', () => {
  it('diagonal positions map to pairs', () => {
    expect(gridKey(0, 0)).toBe('AA');
    expect(gridKey(12, 12)).toBe('22');
  });

  it('upper triangle = suited', () => {
    expect(gridKey(0, 1)).toBe('AKs'); // row A col K
  });

  it('lower triangle = offsuit', () => {
    expect(gridKey(1, 0)).toBe('AKo');
  });

  it('169 unique combos total', () => {
    expect(new Set(allCombos()).size).toBe(169);
  });
});
