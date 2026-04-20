/**
 * BB defending vs a single opener — BETA approximations.
 *
 * Each combo has three frequencies that must sum to ~1:
 *   call  — flat the raise
 *   raise — 3-bet (value + bluff mix)
 *   fold  — muck
 *
 *   Accuracy tier    : BETA
 *   Cross-checked    : Upswing Lab 3-bet charts, GTOWizard Free MTT
 *                      100BB BB-defence samples, published GTO guides.
 *   Known fix log    :
 *     - 2026-04-21 ATs/AJs/KQs vs CO were call=100%; corrected to
 *       3-bet-dominant mixes matching consensus (~65-80% 3-bet).
 *     - 2026-04-21 ATs/AJs/KQs vs UTG also given real 3-bet freqs
 *       instead of pure-flat.
 *   Replacement plan : TexasSolver local pipeline OR licensed export.
 *   User feedback    : flag combos as errors in-app → patched by hand.
 *
 * Missing combos default to fold 100% (same convention as RFI ranges).
 */

type Mix = { call: number; raise: number; fold: number };
type BbRange = Record<string, Mix>;

/* ─────────────── vs UTG open (tightest opener, BB defends narrow) ──────
 * UTG opens ~15%. BB is out of position postflop. 3-bet for value with
 * JJ+/AK; mix 3-bet with AQs/AJs/ATs/KQs for blocker+equity; bluff 3-bet
 * low suited aces. Pocket pairs below JJ mostly flat. */
export const BB_VS_UTG: BbRange = {
  // Value 3bets
  AA: { call: 0, raise: 1, fold: 0 },
  KK: { call: 0, raise: 1, fold: 0 },
  QQ: { call: 0.05, raise: 0.95, fold: 0 },
  JJ: { call: 0.4, raise: 0.6, fold: 0 },
  AKs: { call: 0.15, raise: 0.85, fold: 0 },
  AKo: { call: 0.35, raise: 0.65, fold: 0 },
  AQs: { call: 0.55, raise: 0.45, fold: 0 },
  AJs: { call: 0.65, raise: 0.35, fold: 0 },
  ATs: { call: 0.7, raise: 0.3, fold: 0 },
  KQs: { call: 0.6, raise: 0.4, fold: 0 },
  // Bluff 3bets (polarized, small suited aces / kings)
  A5s: { call: 0.25, raise: 0.6, fold: 0.15 },
  A4s: { call: 0.2, raise: 0.55, fold: 0.25 },
  A3s: { call: 0.15, raise: 0.4, fold: 0.45 },
  K5s: { call: 0.4, raise: 0.25, fold: 0.35 },
  // Calls (pocket pairs + medium broadway)
  TT: { call: 1, raise: 0, fold: 0 },
  '99': { call: 1, raise: 0, fold: 0 },
  '88': { call: 1, raise: 0, fold: 0 },
  '77': { call: 1, raise: 0, fold: 0 },
  '66': { call: 1, raise: 0, fold: 0 },
  '55': { call: 0.9, raise: 0, fold: 0.1 },
  '44': { call: 0.7, raise: 0, fold: 0.3 },
  '33': { call: 0.5, raise: 0, fold: 0.5 },
  '22': { call: 0.4, raise: 0, fold: 0.6 },
  A9s: { call: 0.85, raise: 0, fold: 0.15 },
  A8s: { call: 0.55, raise: 0, fold: 0.45 },
  A7s: { call: 0.35, raise: 0, fold: 0.65 },
  KJs: { call: 1, raise: 0, fold: 0 },
  KTs: { call: 0.9, raise: 0, fold: 0.1 },
  QJs: { call: 1, raise: 0, fold: 0 },
  QTs: { call: 0.8, raise: 0, fold: 0.2 },
  JTs: { call: 1, raise: 0, fold: 0 },
  T9s: { call: 0.8, raise: 0, fold: 0.2 },
  '98s': { call: 0.6, raise: 0, fold: 0.4 },
  '87s': { call: 0.4, raise: 0, fold: 0.6 },
  AJo: { call: 0.6, raise: 0, fold: 0.4 },
  ATo: { call: 0.3, raise: 0, fold: 0.7 },
  KQo: { call: 0.9, raise: 0, fold: 0.1 },
  KJo: { call: 0.4, raise: 0, fold: 0.6 },
};

/* ─────────────── vs CO open ─────────────── *
 * CO opens ~25%. BB is out of position postflop so 3-bet to realise
 * equity and charge CO's dominated hands. ATs / AJs / KQs 3-bet heavy
 * for blocker + equity + fold equity. Low suited aces as polar bluffs. */
export const BB_VS_CO: BbRange = {
  AA: { call: 0, raise: 1, fold: 0 },
  KK: { call: 0, raise: 1, fold: 0 },
  QQ: { call: 0, raise: 1, fold: 0 },
  JJ: { call: 0.1, raise: 0.9, fold: 0 },
  TT: { call: 0.35, raise: 0.65, fold: 0 },
  AKs: { call: 0.05, raise: 0.95, fold: 0 },
  AKo: { call: 0.2, raise: 0.8, fold: 0 },
  AQs: { call: 0.2, raise: 0.8, fold: 0 },
  AQo: { call: 0.5, raise: 0.5, fold: 0 },
  AJs: { call: 0.3, raise: 0.7, fold: 0 },
  ATs: { call: 0.3, raise: 0.7, fold: 0 },
  KQs: { call: 0.35, raise: 0.65, fold: 0 },
  KJs: { call: 0.55, raise: 0.45, fold: 0 },
  KTs: { call: 0.7, raise: 0.3, fold: 0 },
  // Bluff 3bets (polar bluffs with wheel-ace / small king blockers)
  A5s: { call: 0.15, raise: 0.7, fold: 0.15 },
  A4s: { call: 0.15, raise: 0.6, fold: 0.25 },
  A3s: { call: 0.2, raise: 0.5, fold: 0.3 },
  A2s: { call: 0.25, raise: 0.4, fold: 0.35 },
  K5s: { call: 0.25, raise: 0.4, fold: 0.35 },
  '54s': { call: 0.45, raise: 0.25, fold: 0.3 },
  // Calls
  '99': { call: 1, raise: 0, fold: 0 },
  '88': { call: 1, raise: 0, fold: 0 },
  '77': { call: 1, raise: 0, fold: 0 },
  '66': { call: 1, raise: 0, fold: 0 },
  '55': { call: 1, raise: 0, fold: 0 },
  '44': { call: 0.9, raise: 0, fold: 0.1 },
  '33': { call: 0.8, raise: 0, fold: 0.2 },
  '22': { call: 0.7, raise: 0, fold: 0.3 },
  A9s: { call: 0.85, raise: 0.15, fold: 0 },
  A8s: { call: 0.85, raise: 0, fold: 0.15 },
  A7s: { call: 0.7, raise: 0, fold: 0.3 },
  A6s: { call: 0.5, raise: 0, fold: 0.5 },
  K9s: { call: 0.7, raise: 0, fold: 0.3 },
  K8s: { call: 0.4, raise: 0, fold: 0.6 },
  QJs: { call: 0.75, raise: 0.25, fold: 0 },
  QTs: { call: 0.85, raise: 0.15, fold: 0 },
  Q9s: { call: 0.7, raise: 0, fold: 0.3 },
  JTs: { call: 0.85, raise: 0.15, fold: 0 },
  J9s: { call: 0.6, raise: 0, fold: 0.4 },
  T9s: { call: 1, raise: 0, fold: 0 },
  T8s: { call: 0.5, raise: 0, fold: 0.5 },
  '98s': { call: 0.9, raise: 0, fold: 0.1 },
  '87s': { call: 0.8, raise: 0, fold: 0.2 },
  '76s': { call: 0.7, raise: 0, fold: 0.3 },
  '65s': { call: 0.5, raise: 0, fold: 0.5 },
  AJo: { call: 0.7, raise: 0.3, fold: 0 },
  ATo: { call: 0.7, raise: 0, fold: 0.3 },
  A9o: { call: 0.4, raise: 0, fold: 0.6 },
  KQo: { call: 0.7, raise: 0.3, fold: 0 },
  KJo: { call: 0.8, raise: 0, fold: 0.2 },
  KTo: { call: 0.5, raise: 0, fold: 0.5 },
  QJo: { call: 0.7, raise: 0, fold: 0.3 },
  QTo: { call: 0.4, raise: 0, fold: 0.6 },
  JTo: { call: 0.5, raise: 0, fold: 0.5 },
};

/* ─────────────── vs BTN open (widest, most varied) ─────────────── */
export const BB_VS_BTN: BbRange = {
  AA: { call: 0, raise: 1, fold: 0 },
  KK: { call: 0, raise: 1, fold: 0 },
  QQ: { call: 0, raise: 1, fold: 0 },
  JJ: { call: 0, raise: 1, fold: 0 },
  TT: { call: 0.3, raise: 0.7, fold: 0 },
  '99': { call: 0.6, raise: 0.4, fold: 0 },
  AKs: { call: 0.05, raise: 0.95, fold: 0 },
  AKo: { call: 0.2, raise: 0.8, fold: 0 },
  AQs: { call: 0.2, raise: 0.8, fold: 0 },
  AQo: { call: 0.4, raise: 0.6, fold: 0 },
  AJs: { call: 0.2, raise: 0.8, fold: 0 },
  AJo: { call: 0.5, raise: 0.5, fold: 0 },
  ATs: { call: 0.25, raise: 0.75, fold: 0 },
  KQs: { call: 0.3, raise: 0.7, fold: 0 },
  KQo: { call: 0.8, raise: 0.2, fold: 0 },
  KJs: { call: 0.7, raise: 0.3, fold: 0 },
  KTs: { call: 0.9, raise: 0.1, fold: 0 },
  // Heavy 3bet bluffs vs wide opener
  A5s: { call: 0.1, raise: 0.8, fold: 0.1 },
  A4s: { call: 0.1, raise: 0.7, fold: 0.2 },
  A3s: { call: 0.2, raise: 0.6, fold: 0.2 },
  A2s: { call: 0.3, raise: 0.4, fold: 0.3 },
  K5s: { call: 0.3, raise: 0.4, fold: 0.3 },
  K4s: { call: 0.3, raise: 0.3, fold: 0.4 },
  Q5s: { call: 0.3, raise: 0.3, fold: 0.4 },
  J8s: { call: 0.4, raise: 0.2, fold: 0.4 },
  T7s: { call: 0.3, raise: 0.2, fold: 0.5 },
  '97s': { call: 0.4, raise: 0.2, fold: 0.4 },
  '86s': { call: 0.3, raise: 0.2, fold: 0.5 },
  '75s': { call: 0.3, raise: 0.2, fold: 0.5 },
  '64s': { call: 0.3, raise: 0.2, fold: 0.5 },
  '54s': { call: 0.5, raise: 0.3, fold: 0.2 },
  '53s': { call: 0.3, raise: 0.3, fold: 0.4 },
  '43s': { call: 0.2, raise: 0.2, fold: 0.6 },
  // Bulk calls
  '88': { call: 1, raise: 0, fold: 0 },
  '77': { call: 1, raise: 0, fold: 0 },
  '66': { call: 1, raise: 0, fold: 0 },
  '55': { call: 1, raise: 0, fold: 0 },
  '44': { call: 1, raise: 0, fold: 0 },
  '33': { call: 0.9, raise: 0, fold: 0.1 },
  '22': { call: 0.8, raise: 0, fold: 0.2 },
  A9s: { call: 1, raise: 0, fold: 0 },
  A8s: { call: 1, raise: 0, fold: 0 },
  A7s: { call: 0.9, raise: 0, fold: 0.1 },
  A6s: { call: 0.7, raise: 0, fold: 0.3 },
  K9s: { call: 1, raise: 0, fold: 0 },
  K8s: { call: 0.9, raise: 0, fold: 0.1 },
  K7s: { call: 0.7, raise: 0, fold: 0.3 },
  K6s: { call: 0.5, raise: 0, fold: 0.5 },
  QJs: { call: 1, raise: 0, fold: 0 },
  QTs: { call: 1, raise: 0, fold: 0 },
  Q9s: { call: 1, raise: 0, fold: 0 },
  Q8s: { call: 0.7, raise: 0, fold: 0.3 },
  JTs: { call: 1, raise: 0, fold: 0 },
  J9s: { call: 1, raise: 0, fold: 0 },
  T9s: { call: 1, raise: 0, fold: 0 },
  T8s: { call: 0.9, raise: 0, fold: 0.1 },
  '98s': { call: 1, raise: 0, fold: 0 },
  '87s': { call: 1, raise: 0, fold: 0 },
  '76s': { call: 1, raise: 0, fold: 0 },
  '65s': { call: 1, raise: 0, fold: 0 },
  ATo: { call: 1, raise: 0, fold: 0 },
  A9o: { call: 0.9, raise: 0, fold: 0.1 },
  A8o: { call: 0.6, raise: 0, fold: 0.4 },
  A7o: { call: 0.4, raise: 0, fold: 0.6 },
  KJo: { call: 1, raise: 0, fold: 0 },
  KTo: { call: 0.9, raise: 0, fold: 0.1 },
  K9o: { call: 0.5, raise: 0, fold: 0.5 },
  QJo: { call: 1, raise: 0, fold: 0 },
  QTo: { call: 0.8, raise: 0, fold: 0.2 },
  Q9o: { call: 0.4, raise: 0, fold: 0.6 },
  JTo: { call: 0.9, raise: 0, fold: 0.1 },
  J9o: { call: 0.5, raise: 0, fold: 0.5 },
  T9o: { call: 0.6, raise: 0, fold: 0.4 },
  '98o': { call: 0.3, raise: 0, fold: 0.7 },
};
