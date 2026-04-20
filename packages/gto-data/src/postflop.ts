import type { CardCode, Position } from '@gto/poker-core';
import { POSTFLOP_SEEDS } from './ranges/postflop-seeds';

/**
 * Postflop action space. Bet/raise sizes are expressed as a fraction of
 * pot so they map cleanly across stack depths.
 *
 *   check          — no bet faced, hero passes
 *   bet33 / 50 / 75 / pot / overbet   — hero leads with that %-of-pot size
 *   call           — match the facing bet
 *   fold           — give up when facing a bet
 *   raise_small    — raise-to ~2.5x the facing bet
 *   raise_big      — raise-to ~3.5x+ or all-in
 *
 * A single spot uses only the subset that's legal given the facing action
 * (e.g. you can't check when someone has bet into you). The UI reads
 * `spot.availableActions` to know which buttons to render.
 */
export type PostflopAction =
  | 'check'
  | 'bet33'
  | 'bet50'
  | 'bet75'
  | 'bet_pot'
  | 'bet_overbet'
  | 'call'
  | 'fold'
  | 'raise_small'
  | 'raise_big';

export type Street = 'flop' | 'turn' | 'river';

/** Broad board-texture label used for grouping & explanation hints. */
export type BoardTexture =
  | 'dry_high'      // K72r, A83r — static, one overcard, no draws
  | 'dry_mid'       // 865r, 974r — low-mid, rainbow
  | 'semi_wet'      // JT5hh, Q98ss — one two-tone / straight-draw heavy
  | 'wet_draw'      // 987ss, T98hh — connected + flush-draw
  | 'paired'        // KK4, 773 — paired board
  | 'monotone'      // 9h7h3h — all one suit
  | 'ace_high'      // A72r, A84r — ace-high static
  | 'low_connected' // 765r, 543r
  | 'broadway';     // KQJ / QJT

/** A frequency distribution over postflop actions. Sums to ~1.0. */
export type PostflopMix = Partial<Record<PostflopAction, number>>;

/**
 * Preflop context that led into the postflop spot. Kept flat (no nested
 * action log yet) because the UI only needs to render "BTN raised 2.5x,
 * BB called" as a single ribbon of context above the board.
 *
 * `potType` is a convenience label — derived from `preflopActions` but
 * stored explicitly so the UI can color-code without re-deriving.
 */
export type PotType = 'srp' | '3bp' | '4bp' | 'limped';

export interface PostflopContext {
  readonly heroPos: Position;
  readonly villainPos: Position;
  readonly potType: PotType;
  /** Stack-to-pot ratio at the start of the street. Drives sizing choices. */
  readonly spr: number;
  /** Pot size in big blinds at start of the street. */
  readonly potBB: number;
  /** Effective stack remaining (BB) at start of the street. */
  readonly effStackBB: number;
  /** Short Korean ribbon shown above the table (e.g. "BTN 오픈 · BB 콜"). */
  readonly preflopSummary: string;
}

export interface PostflopSpot {
  readonly id: string;
  readonly street: Street;
  readonly board: readonly CardCode[];
  /** Hero's hole cards (always exactly 2). */
  readonly hero: readonly [CardCode, CardCode];
  readonly texture: BoardTexture;
  readonly context: PostflopContext;
  /** Has villain bet into hero this street? 0 = no (check to hero). */
  readonly facingBetBB: number;
  /** GTO action mix at this decision point. */
  readonly mix: PostflopMix;
  /** Which action buttons the UI should offer. */
  readonly availableActions: readonly PostflopAction[];
  /** 1-line Korean hint for the AI-explanation prompt (why the mix looks so). */
  readonly teachingNote: string;
}

/** Returns a cloned, deterministic list of all seeded postflop spots. */
export function listPostflopSpots(): PostflopSpot[] {
  return POSTFLOP_SEEDS.map((s) => ({ ...s, board: [...s.board] }));
}

/** Look up a single seed spot by id. Returns null if not found. */
export function getPostflopSpot(id: string): PostflopSpot | null {
  const found = POSTFLOP_SEEDS.find((s) => s.id === id);
  return found ? { ...found, board: [...found.board] } : null;
}

/** Grade a user's action against the spot's GTO mix. Same thresholds as
 *  preflop: within 5% of top → sharp; within 15% → acceptable; else wrong.
 *  Actions not in the mix are treated as 0% frequency. */
export function gradePostflopAction(
  spot: PostflopSpot,
  action: PostflopAction,
): 'sharp' | 'acceptable' | 'wrong' {
  const userFreq = spot.mix[action] ?? 0;
  const maxFreq = Math.max(...Object.values(spot.mix).filter((v): v is number => typeof v === 'number'));
  if (maxFreq === 0) return 'wrong';
  const ratio = userFreq / maxFreq;
  if (ratio >= 0.8) return 'sharp';
  if (ratio >= 0.4) return 'acceptable';
  return 'wrong';
}

/** Human-readable Korean label for each action. Used by the result sheet. */
export const POSTFLOP_ACTION_LABEL: Record<PostflopAction, string> = {
  check: '체크',
  bet33: '벳 33%',
  bet50: '벳 50%',
  bet75: '벳 75%',
  bet_pot: '팟사이즈 벳',
  bet_overbet: '오버벳',
  call: '콜',
  fold: '폴드',
  raise_small: '레이즈 (스몰)',
  raise_big: '레이즈 (빅)',
};

/** Color token for each action — used by mix bars & action buttons. */
export const POSTFLOP_ACTION_COLOR: Record<PostflopAction, string> = {
  check: 'var(--color-info)',
  bet33: 'var(--color-raise)',
  bet50: 'var(--color-raise)',
  bet75: 'var(--color-raise)',
  bet_pot: 'var(--color-raise)',
  bet_overbet: 'var(--color-raise)',
  call: 'var(--color-call)',
  fold: 'var(--color-fold)',
  raise_small: 'var(--color-raise)',
  raise_big: 'var(--color-raise)',
};
