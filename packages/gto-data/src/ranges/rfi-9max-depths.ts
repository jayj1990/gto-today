/**
 * 9-max RFI ranges at 40BB and 60BB, derived from the 100BB seeds.
 *
 * Open-raise ranges are famously depth-INSENSITIVE above ~50BB — every
 * published chart set (tournament or cash) uses one open range for
 * 60–100BB+ and only adjusts the 3bet/call trees. So 60BB re-exports
 * the 100BB seeds verbatim rather than inventing fake differences.
 *
 * At 40BB the early seats trim their marginal tail (low pairs, weak
 * suited gappers open worse when stack-off thresholds drop and 3bets
 * commit more of the stack), while the steal seats (CO/BTN/SB) stay
 * essentially unchanged. The drop lists below encode that standard
 * adjustment explicitly so it's reviewable.
 */

import {
  RFI9_BTN,
  RFI9_CO,
  RFI9_HJ,
  RFI9_LJ,
  RFI9_MP,
  RFI9_SB,
  RFI9_UTG,
  RFI9_UTG1,
} from './rfi-9max-100bb';

type ComboFreq = Record<string, number>;

/** New object without the listed combos (i.e. they become pure folds). */
function drop(base: ComboFreq, combos: readonly string[]): ComboFreq {
  const gone = new Set(combos);
  const out: ComboFreq = {};
  for (const [k, v] of Object.entries(base)) {
    if (!gone.has(k)) out[k] = v;
  }
  return out;
}

/* ───────── 60BB — identical to 100BB (see header) ───────── */

export const RFI9_60_UTG = RFI9_UTG;
export const RFI9_60_UTG1 = RFI9_UTG1;
export const RFI9_60_MP = RFI9_MP;
export const RFI9_60_LJ = RFI9_LJ;
export const RFI9_60_HJ = RFI9_HJ;
export const RFI9_60_CO = RFI9_CO;
export const RFI9_60_BTN = RFI9_BTN;
export const RFI9_60_SB = RFI9_SB;

/* ───────── 40BB — early seats trim the marginal tail ───────── */

export const RFI9_40_UTG = drop(RFI9_UTG, ['66', 'QTs', 'T9s']);
export const RFI9_40_UTG1 = drop(RFI9_UTG1, ['55', 'A4s', 'T9s', 'ATo']);
export const RFI9_40_MP = drop(RFI9_MP, ['44', 'A3s', 'Q9s', 'J9s', '98s', 'KJo']);
export const RFI9_40_LJ = drop(RFI9_LJ, ['22', '33', 'A2s', '76s', 'T8s', 'Q9s', 'KTo']);
export const RFI9_40_HJ = drop(RFI9_HJ, ['22', '33', '65s', 'Q8s', 'J8s', 'K8s', 'A9o', 'KTo']);
// Steal seats keep their 100BB shape — late-position opens don't
// meaningfully tighten until stacks drop into jam territory.
export const RFI9_40_CO = RFI9_CO;
export const RFI9_40_BTN = RFI9_BTN;
export const RFI9_40_SB = RFI9_SB;
