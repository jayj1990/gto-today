import { describe, expect, it } from 'vitest';
import { deriveRanges, freqsToRangeString } from './range-derive';

type DecisionsJson = Record<string, Record<string, Record<string, number>>>;

// Canonical SRP fixture: CO opens 2.5bb, BB calls.
const DECISIONS: DecisionsJson = {
  CO: {
    '2.5bb': { AKs: 1, AQs: 1, AKo: 0.8, '77': 0.5 },
    FOLD: { AKs: 0, AQs: 0, AKo: 0.2, '77': 0.5 },
  },
  CO_2_5bb_BB: {
    Call: { AKs: 0.6, AQs: 1, '77': 1 },
    '11bb': { AKs: 0.4, AQs: 0, '77': 0 },
    FOLD: { AKs: 0, AQs: 0, '77': 0 },
  },
  // Alias used by deriveRanges: it builds keys from the path tokens
  // verbatim, so include the `.` form too.
  'CO_2.5bb_BB': {
    Call: { AKs: 0.6, AQs: 1, '77': 1 },
    '11bb': { AKs: 0.4, AQs: 0, '77': 0 },
    FOLD: { AKs: 0, AQs: 0, '77': 0 },
  },
};

describe('deriveRanges', () => {
  it('handles CO open + BB call as SRP with BB OOP', () => {
    const r = deriveRanges(DECISIONS, [
      'UTG_FOLD',
      'MP_FOLD',
      'CO_2.5bb',
      'BTN_FOLD',
      'SB_FOLD',
      'BB_Call',
    ]);
    expect(r).not.toBeNull();
    expect(r!.oopPos).toBe('BB');
    expect(r!.ipPos).toBe('CO');
    expect(r!.ipRange).toContain('AKs');
    expect(r!.oopRange).toContain('AQs');
  });

  it('returns null for 3bet pots (3+ non-fold actions)', () => {
    const decisions: DecisionsJson = {
      ...DECISIONS,
      'CO_2.5bb_BB': {
        '11bb': { AKs: 1 },
      },
      'CO_2.5bb_BB_11bb_CO': {
        Call: { AKs: 0.5 },
      },
    };
    const r = deriveRanges(decisions, ['CO_2.5bb', 'BB_11bb', 'CO_Call']);
    expect(r).toBeNull();
  });

  it('returns null if the path references a node missing from the JSON', () => {
    const r = deriveRanges(DECISIONS, ['SB_2.5bb', 'BB_Call']);
    expect(r).toBeNull();
  });

  it('returns null if there is no caller at all', () => {
    const r = deriveRanges(DECISIONS, ['CO_2.5bb']);
    expect(r).toBeNull();
  });
});

describe('freqsToRangeString', () => {
  it('omits zero-weight combos, uses bare label for 1.0, else label:weight', () => {
    const s = freqsToRangeString({ AA: 1, AKs: 0.6, '22': 0 });
    expect(s.split(',').sort()).toEqual(['AA', 'AKs:0.600'].sort());
  });

  it('rounds 1.0 and near-1.0 the same way (>=0.999)', () => {
    const s = freqsToRangeString({ AA: 0.9995, KK: 0.998 });
    const parts = s.split(',');
    expect(parts).toContain('AA');
    expect(parts.find((p) => p.startsWith('KK'))).toBe('KK:0.998');
  });

  it('returns empty string when every combo has freq 0', () => {
    expect(freqsToRangeString({ AA: 0, KK: 0 })).toBe('');
  });
});
