import type { ComboKey, Rank } from '@gto/poker-core';

/**
 * Canonical ordering for the 169 combo grid.
 * Rows from A (high) to 2 (low), columns likewise.
 * Upper triangle (row > col) = suited, lower triangle = offsuit, diagonal = pairs.
 */
export const RANK_ORDER: readonly Rank[] = [
  'A',
  'K',
  'Q',
  'J',
  'T',
  '9',
  '8',
  '7',
  '6',
  '5',
  '4',
  '3',
  '2',
];

export function gridKey(row: number, col: number): ComboKey {
  const hi = RANK_ORDER[row];
  const lo = RANK_ORDER[col];
  if (!hi || !lo) throw new Error(`gridKey out of bounds: ${row},${col}`);
  if (row === col) return `${hi}${lo}` as ComboKey;
  // upper triangle = suited
  if (row < col) return `${hi}${lo}s` as ComboKey;
  // lower triangle = offsuit (but we flip so the canonical key still has hi first)
  return `${lo}${hi}o` as ComboKey;
}

export function allCombos(): ComboKey[] {
  const out: ComboKey[] = [];
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      out.push(gridKey(r, c));
    }
  }
  return out;
}

export function isPair(key: ComboKey): boolean {
  return key.length === 2;
}

export function isSuited(key: ComboKey): boolean {
  return key.endsWith('s');
}
