'use client';

import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { playChip, playDeal } from './sound';

export type Seat =
  | 'UTG'
  | 'UTG1'
  | 'UTG2'
  | 'UTG3'
  | 'MP'
  | 'LJ'
  | 'HJ'
  | 'CO'
  | 'BTN'
  | 'SB'
  | 'BB';
export type Format = '6max' | '9max' | '10max' | '11max';

export type SeatAction =
  | { kind: 'fold' }
  | { kind: 'call'; bb: number }
  | { kind: 'raise'; bb: number }
  | { kind: '3bet'; bb: number }
  | { kind: 'check' }
  | { kind: 'bet'; bb: number }
  | { kind: 'post'; bb: number };

export interface SeatState {
  stack?: number;
  /** Voluntary action this seat took (raise / call / check / fold). Posts
   *  are NOT a voluntary action — use the `post` field instead so the
   *  voluntary chip can stack on top of the posted blind chip. */
  action?: SeatAction;
  /** Posted blind (BB units). Always 0.5 for SB and 1 for BB; rendered
   *  on the felt before the deal starts and persists through any
   *  voluntary action — when SB 3-bets, the 0.5 post chip stays AND
   *  the raise chip flies in beside it. */
  post?: number;
  cards?: readonly [string, string];
  showBacks?: boolean;
}

export interface PokerTableProps extends HTMLAttributes<HTMLDivElement> {
  format?: Format;
  hero?: Seat;
  seats?: Partial<Record<Seat, SeatState>>;
  toAct?: Seat;
  heroCards?: readonly [string, string];
  pot?: number | undefined;
  effectiveStack?: number | undefined;
  lastBet?: number | undefined;
  /** Community board — array of 0..5 card codes. Slots for flop (3) +
   *  turn (1) + river (1) always render; dealt cards fill from left,
   *  remaining slots show as empty placeholders. */
  board?: readonly string[];
  renderCard?: (code: string, size: 'xs' | 'sm' | 'md') => ReactNode;
  showMarkers?: boolean;
  /** When it flips true, the pot number runs a one-shot gold-pulse
   *  so the result screen reads as "pot collected". */
  pulsePot?: boolean;
  /** Play synthesized deal/chip SFX timed with the deal sweep + bet
   *  cascade. Off by default because explorer surfaces (/charts) don't
   *  want sound. Daily quiz / sim / review opt in. */
  playSfx?: boolean;
}

const SEATS: Record<Format, Seat[]> = {
  '6max': ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'],
  '9max': ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  '10max': ['UTG', 'UTG1', 'UTG2', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  '11max': ['UTG', 'UTG1', 'UTG2', 'UTG3', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
};

const CHIP_PX = 50;

/**
 * Real-poker dealing order (clockwise starting at SB):
 *   SB → BB → UTG → MP → … → BTN
 * Used as a sort key — each format keeps only the seats it actually
 * has, but the relative order matches a real dealer sweep.
 */
const DEAL_PRIORITY: readonly Seat[] = [
  'SB',
  'BB',
  'UTG',
  'UTG1',
  'UTG2',
  'UTG3',
  'MP',
  'LJ',
  'HJ',
  'CO',
  'BTN',
];

// Per-card gap. Tuned with the slide-in animation duration so
// adjacent cards feel sequential (each one fully lands before the
// next starts) instead of all sliding in at once.
const DEAL_STEP_MS = 280;

/**
 * Slot index of `seat` within the format's actual seats — NOT the
 * global 11-seat list. Earlier versions used the full DEAL_PRIORITY
 * directly, which left 280ms gaps for non-existent seats (e.g. 6max
 * has no UTG1/UTG2/UTG3/LJ/HJ, so MP got slot 6 and CO slot 9, with
 * pass 2 starting at slot 6 — overlapping pass 1). Computing the
 * slot relative to the actual format keeps the sweep tight and
 * non-overlapping regardless of table size.
 */
function dealSlot(seat: Seat, formatSeats: readonly Seat[]): number {
  const ordered = [...formatSeats].sort(
    (a, b) => DEAL_PRIORITY.indexOf(a) - DEAL_PRIORITY.indexOf(b),
  );
  const idx = ordered.indexOf(seat);
  return idx >= 0 ? idx : 0;
}

/**
 * Delay for seat's nth card (0-indexed). Pass 1 lays one card on every
 * seat in deal order, then pass 2 sweeps again. Total deal duration =
 * 2 * count * DEAL_STEP_MS.
 */
function dealDelayMs(seat: Seat, cardIdx: 0 | 1, formatSeats: readonly Seat[]): number {
  return (cardIdx * formatSeats.length + dealSlot(seat, formatSeats)) * DEAL_STEP_MS;
}

function dealEndMs(count: number): number {
  // Last card's start time + the slide-in animation tail (~320ms).
  return (2 * count - 1) * DEAL_STEP_MS + 320;
}

/**
 * Voluntary preflop action order, used both for the chip-bet cascade
 * and the fold-muck sequence. Mirrors real poker betting order.
 */
const VOLUNTARY_ORDER: readonly Seat[] = [
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
];

/**
 * Slot index of `seat` within the format's voluntary-action order.
 * 6max → UTG(0) MP(1) CO(2) BTN(3) SB(4) BB(5). Same idea as
 * dealSlot but with the betting-order priority list.
 */
function voluntarySlot(seat: Seat, formatSeats: readonly Seat[]): number {
  const ordered = [...formatSeats].sort(
    (a, b) => VOLUNTARY_ORDER.indexOf(a) - VOLUNTARY_ORDER.indexOf(b),
  );
  const idx = ordered.indexOf(seat);
  return idx >= 0 ? idx : 0;
}

/**
 * Single post-deal action timeline. Folds AND bets share the same
 * cascade in real betting order — UTG fold → MP fold → CO open →
 * BTN 3bet → SB 4bet → BB fold → hero acts. Each event fires at:
 *   dealEnd + ACTION_BUFFER_MS + voluntarySlot * ACTION_STEP_MS
 *
 * Step is wider than the previous fold-only cascade (90ms) and
 * narrower than the previous bet-only cascade (250ms) — each event
 * registers visually before the next starts but the scene doesn't
 * drag. Posts are NOT in this timeline; they render statically
 * before the deal begins (real-poker convention).
 */
const ACTION_BUFFER_MS = 600;
const ACTION_STEP_MS = 350;

function actionDelayMs(seat: Seat, count: number, formatSeats: readonly Seat[]): number {
  return dealEndMs(count) + ACTION_BUFFER_MS + voluntarySlot(seat, formatSeats) * ACTION_STEP_MS;
}

/**
 * GTO-Wizard-inspired overhead table — vertical cluster layout.
 *
 * For every active seat we render a vertical group:
 *   [two cards on top] → [chip below]
 * Hero cards are larger + colorful; villain cards are small face-down "W"
 * backs. Folded seats skip the cards entirely and render a single chip at
 * ~35% opacity, so "alive vs dead" is immediately readable.
 *
 * The cluster's chip sits exactly at the seat's ellipse coordinate; the
 * cards float above it via a fixed pixel distance. Because the chip is a
 * fixed 50×50 disc and cards live in a separately-sized container, stack
 * text length can never distort the chip.
 */
export function PokerTable({
  format = '6max',
  hero,
  seats: seatStates = {},
  toAct,
  heroCards,
  pot,
  effectiveStack: _effectiveStack,
  lastBet,
  board = [],
  renderCard,
  showMarkers = true,
  pulsePot = false,
  playSfx = false,
  className,
  style,
  ...rest
}: PokerTableProps) {
  const seats = SEATS[format];
  const count = seats.length;
  // When the table already has a flop on it, the hole cards have
  // logically been received before this scene started — running the
  // two-pass deal cascade now would re-deal cards that should already
  // be sitting at each seat. Postflop spots skip the seat-deal step
  // entirely; only the community cards animate (left-to-right flop
  // reveal handled by the board section below).
  const skipSeatDeal = board.length > 0;

  // Track which (seats, actions) signature we last announced so a
  // re-render that doesn't actually change the table doesn't re-fire
  // the deal/chip cascade. The signature changes when the user moves
  // to a new spot (different seat states, different actions).
  const lastSigRef = useRef<string>('');
  useEffect(() => {
    if (!playSfx) return;
    const sig = seats
      .map((s) => `${s}:${seatStates[s]?.action ? actionKey(seatStates[s]!.action!) : '_'}`)
      .join('|');
    if (sig === lastSigRef.current) return;
    lastSigRef.current = sig;

    const timers: number[] = [];
    if (!skipSeatDeal) {
      // Two-pass deal sweep: one swoosh per card. SB[0] BB[0] UTG[0] …
      // BTN[0] then SB[1] BB[1] … BTN[1]. Postflop spots skip this
      // entirely so the only audio is the flop reveal.
      for (const seat of seats) {
        const st = seatStates[seat];
        if (!st || (!st.cards && !st.showBacks)) continue;
        timers.push(window.setTimeout(playDeal, dealDelayMs(seat, 0, seats)));
        timers.push(window.setTimeout(playDeal, dealDelayMs(seat, 1, seats)));
      }
    }
    // Bet cascade fires in the same unified action timeline as folds
    // (UTG fold → MP fold → CO open → BTN 3bet → SB 4bet → BB fold).
    // Postflop scenes have no preflop action to play — chips are in
    // the pot before the spot starts.
    if (!skipSeatDeal) {
      for (const seat of seats) {
        const st = seatStates[seat];
        if (!st?.action || st.action.kind === 'fold') continue;
        const t = window.setTimeout(playChip, actionDelayMs(seat, count, seats));
        timers.push(t);
      }
    }
    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [playSfx, seats, seatStates, count, skipSeatDeal]);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '10 / 14',
        minHeight: 380,
        ...style,
      }}
      role="img"
      aria-label={`${format} table — hero on ${hero ?? '-'}`}
      {...rest}
    >
      {/* Felt — portrait-oriented ellipse. Hero sits at the bottom,
          villain at the top; the tall shape leaves room for 5 community
          card slots dead-centre. */}
      <svg
        viewBox="0 0 200 280"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden
      >
        <defs>
          <radialGradient id="pt-felt" cx="50%" cy="50%" r="62%">
            <stop offset="0%" stopColor="#177046" />
            <stop offset="55%" stopColor="#0E3B2E" />
            <stop offset="100%" stopColor="#061C14" />
          </radialGradient>
        </defs>
        <ellipse cx="100" cy="140" rx="92" ry="130" fill="#080808" />
        <ellipse
          cx="100"
          cy="140"
          rx="90"
          ry="128"
          fill="none"
          stroke="rgba(212,175,55,0.22)"
          strokeWidth="1"
        />
        <ellipse
          cx="100"
          cy="140"
          rx="82"
          ry="120"
          fill="url(#pt-felt)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      </svg>

      {/* Effective-stack readout intentionally omitted from the table —
          it's already shown next to the hero seat chip. Leaving it here
          duplicated with the hero info. */}

      {/* Community board — 5 slots, fills from left. Dead centre.
          `perspective` on the row parent makes the flip keyframes
          read as a real 3D rotation rather than a flat skew. */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          gap: 4,
          pointerEvents: 'none',
          perspective: '900px',
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const code = board[i];
          if (code && renderCard) {
            // Stagger each dealt community card so flop lands 1→2→3
            // and turn/river land one-by-one. Flop cards use the 3D
            // flip animation; turn/river slide-in so they read as a
            // single new street rather than "three flops again".
            const isFlop = i < 3;
            // Bigger stagger so users see each flop card land one at a
            // time rather than in a single blur. 180ms lands plainly
            // readable without feeling slow (total flop sequence
            // ~1.2s from first card → third card upright).
            const streetDelay = isFlop ? i * 180 : 0;
            const animClass = isFlop ? 'animate-card-flip-in' : 'animate-board-deal-in';
            return (
              <div
                key={`${i}-${code}`}
                className={animClass}
                style={{ animationDelay: `${streetDelay}ms`, transformStyle: 'preserve-3d' }}
              >
                {renderCard(code, 'sm')}
              </div>
            );
          }
          return (
            <BoardSlot key={`slot-${i}`} street={i < 3 ? 'flop' : i === 3 ? 'turn' : 'river'} />
          );
        })}
      </div>

      {/* Pot — just below the board */}
      {pot !== undefined && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '62%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'rgba(212, 175, 55, 0.7)',
              textTransform: 'uppercase',
            }}
          >
            pot
          </span>
          <span
            key={pulsePot ? `pot-${pot}-pulse` : `pot-${pot}`}
            className={pulsePot ? 'animate-pot-pulse' : undefined}
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 22,
              fontWeight: 700,
              color: '#F4EFE6',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {fmt(pot)} bb
          </span>
          {lastBet !== undefined && (
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 11,
                color: 'rgba(244, 239, 230, 0.6)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              last bet {fmt(lastBet)}bb
            </span>
          )}
        </div>
      )}

      {/* Seats */}
      {seats.map((seat, i) => {
        const { x, y, inward } = seatGeom(i, count);
        const state = seatStates[seat] ?? {};
        const isHero = seat === hero;
        const isFolded = state.action?.kind === 'fold';
        const isToAct = !isHero && seat === toAct;

        // 15pp was the goldilocks — 20 pulled the chip too close to
        // the board, 10 let the label overlap the seat. 15 clears the
        // seat + villain cards while still reading as 'that player's'.
        const betX = x + inward.x * 15;
        const betY = y + inward.y * 15;

        // Folded seats DO get cards dealt (in the preflop scene) — they
        // arrive with the regular sweep, then muck back away in
        // betting order. In postflop scenes the deal already happened
        // off-screen, so folded seats render bare (no cards).
        const hasVillainCardsBase = !isHero && (state.cards || state.showBacks);
        const hideMuckedCards = isFolded && skipSeatDeal;
        const hasVillainCards = hasVillainCardsBase && !hideMuckedCards;
        const hasHeroCards = isHero && heroCards;
        const isMucking = isFolded && !skipSeatDeal;

        // Cards: standard slide-in for active seats; deal-then-muck
        // chain for seats that fold preflop. Muck delay matches the
        // chip-fade so the seat dies as a single beat (cards thrown +
        // chip dims).
        const cardClass = skipSeatDeal
          ? undefined
          : isMucking
            ? 'animate-card-muck'
            : 'animate-card-slide-in';
        const cardStyle = (cardIdx: 0 | 1): CSSProperties | undefined => {
          if (skipSeatDeal) return undefined;
          const base: Record<string, string> = {
            '--anim-delay': `${dealDelayMs(seat, cardIdx, seats)}ms`,
          };
          if (isMucking) {
            // Muck fires in the unified action timeline, exactly when
            // it's this seat's turn to act in real betting order. So
            // BB's muck happens AFTER SB's raise chip lands, not
            // before — same cadence as the bet cascade.
            base['--muck-delay'] = `${actionDelayMs(seat, count, seats)}ms`;
          }
          return base as CSSProperties;
        };

        // Post + voluntary chip layout. When both exist (SB/BB raise),
        // stack them along the radial line — post toward the pot
        // (already "committed"), voluntary toward the seat ("their
        // current move"). When only one exists, sit at the bet
        // position. Offset is small (~2pp) so the chips read as a
        // pair, not separate piles.
        const hasPost = state.post !== undefined;
        const hasVoluntaryAction =
          !!state.action && state.action.kind !== 'fold' && state.action.kind !== 'post';
        const stackChips = hasPost && hasVoluntaryAction;
        const postOffset = stackChips ? 2.4 : 0;
        const postChipX = betX + inward.x * postOffset;
        const postChipY = betY + inward.y * postOffset;
        const voluntaryChipX = betX - inward.x * postOffset;
        const voluntaryChipY = betY - inward.y * postOffset;

        return (
          <div key={seat}>
            {/* Vertical cluster: cards above, chip below — anchored at seat */}
            <div
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
              }}
            >
              {/* Two-pass dealing — real poker (clockwise from SB).
                  Pass 1: each seat gets card[0] in deal order. Pass 2:
                  same sweep again for card[1]. Each card is a separate
                  animated element with its own --anim-delay so cards
                  appear one at a time, not pair at a time.

                  Folded seats also get cards (they were dealt before
                  the player chose to fold) — those cards then run the
                  muck animation and disappear in betting order.

                  Postflop spots (board.length > 0) skip this entirely:
                  the hole cards have logically been received before
                  the scene begins, so re-dealing them now would feel
                  like a rewind. The animation classes drop in that
                  case — only the community board cards animate. */}
              {hasHeroCards && renderCard && (
                <div style={{ display: 'flex', gap: 2 }}>
                  <span className={cardClass} style={cardStyle(0)}>
                    {renderCard(heroCards![0], 'sm')}
                  </span>
                  <span className={cardClass} style={cardStyle(1)}>
                    {renderCard(heroCards![1], 'sm')}
                  </span>
                </div>
              )}
              {hasVillainCards && state.cards && renderCard && (
                <div style={{ display: 'flex', gap: 2 }}>
                  <span className={cardClass} style={cardStyle(0)}>
                    {renderCard(state.cards[0], 'xs')}
                  </span>
                  <span className={cardClass} style={cardStyle(1)}>
                    {renderCard(state.cards[1], 'xs')}
                  </span>
                </div>
              )}
              {hasVillainCards && !state.cards && state.showBacks && (
                <div style={{ display: 'flex', gap: 2 }}>
                  <span className={cardClass} style={cardStyle(0)}>
                    <CardBack />
                  </span>
                  <span className={cardClass} style={cardStyle(1)}>
                    <CardBack />
                  </span>
                </div>
              )}

              {/* Chip below — folded seats dim in the unified action
                  cascade (folds and bets share the same timeline so
                  events fire in real betting order). Postflop folds
                  are dim from frame 0 (the muck happened off-screen
                  before this scene started). */}
              <span
                className={isMucking ? 'animate-fold-fade' : undefined}
                style={
                  isMucking
                    ? { ['--anim-delay' as string]: `${actionDelayMs(seat, count, seats)}ms` }
                    : isFolded
                      ? { opacity: 0.35, display: 'inline-block' }
                      : undefined
                }
              >
                <SeatChip
                  seat={seat}
                  stack={state.stack}
                  variant={isFolded ? 'folded' : isHero ? 'hero' : isToAct ? 'toAct' : 'idle'}
                  showDealerBadge={showMarkers && seat === 'BTN'}
                />
              </span>
            </div>

            {/* Posted blind — appears instantly with the table, BEFORE
                the deal. Real-poker convention: blinds are on the felt
                before any cards are dealt. No animation, no delay. */}
            {hasPost && (
              <div
                key={`post-${seat}-${state.post}`}
                style={{
                  position: 'absolute',
                  left: `${postChipX}%`,
                  top: `${postChipY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <BetChip action={{ kind: 'post', bb: state.post! }} />
              </div>
            )}

            {/* Voluntary action chip — flies in at the seat's slot in
                the unified action timeline, so the cascade reads as
                real preflop order: UTG fold → MP fold → CO open →
                BTN 3bet → SB 4bet → BB fold. SB/BB raises stack on
                top of the post chip. */}
            {hasVoluntaryAction && state.action && (
              <div
                key={`bet-${seat}-${actionKey(state.action)}`}
                className="animate-chip-bet-in"
                style={{
                  position: 'absolute',
                  left: `${voluntaryChipX}%`,
                  top: `${voluntaryChipY}%`,
                  ['--throw-x' as string]: `${-inward.x * 16}px`,
                  ['--throw-y' as string]: `${-inward.y * 16}px`,
                  ['--anim-delay' as string]: `${actionDelayMs(seat, count, seats)}ms`,
                }}
              >
                <BetChip action={state.action} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════ SEAT CHIP ══════════════════════════ */

function SeatChip({
  seat,
  stack,
  variant,
  showDealerBadge,
}: {
  seat: Seat;
  stack: number | undefined;
  variant: 'hero' | 'toAct' | 'folded' | 'idle';
  showDealerBadge: boolean;
}) {
  const ringColor =
    variant === 'hero'
      ? 'var(--color-call)'
      : variant === 'toAct'
        ? 'var(--color-warning)'
        : 'rgba(255,255,255,0.28)';
  const ringWidth = variant === 'hero' ? 2.5 : variant === 'toAct' ? 2 : 1.5;
  const positionColor =
    variant === 'hero'
      ? 'var(--color-call)'
      : variant === 'toAct'
        ? 'var(--color-warning)'
        : 'rgba(244, 239, 230, 0.75)';

  return (
    <div
      className={variant === 'hero' ? 'animate-hero-pulse' : undefined}
      style={{
        position: 'relative',
        width: CHIP_PX,
        height: CHIP_PX,
        borderRadius: '50%',
        background: 'rgb(24, 24, 28)',
        border: `${ringWidth}px solid ${ringColor}`,
        // Non-hero variants get static box-shadow; the hero's shadow is
        // animated via .animate-hero-pulse so we omit the inline value
        // (it would override the keyframe).
        ...(variant === 'hero'
          ? {}
          : {
              boxShadow:
                variant === 'toAct'
                  ? '0 4px 14px rgba(0,0,0,0.55), 0 0 16px rgba(230,168,23,0.4)'
                  : '0 3px 10px rgba(0,0,0,0.5)',
            }),
        // Opacity for folded seats is owned by the wrapper span (via
        // animate-fold-fade in preflop, or a static opacity 0.35 in
        // postflop). Hardcoding 0.35 here would override the
        // wrapper's 1→0.35 fade keyframe and the chip would look
        // dim from frame 0 — which is what made BB read as "already
        // folded" before SB even raised.
        overflow: 'visible',
      }}
    >
      {variant === 'hero' && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: -16,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: 'var(--color-call)',
            textTransform: 'uppercase',
            textShadow: '0 1px 4px rgba(0,0,0,0.7)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          내 자리
        </span>
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: '50%',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 10,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '0.03em',
            color: positionColor,
            whiteSpace: 'nowrap',
          }}
        >
          {seat}
        </span>
        {stack !== undefined && (
          <span
            style={{
              marginTop: 3,
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 12,
              fontWeight: 700,
              lineHeight: 1,
              color: '#F4EFE6',
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
            }}
          >
            {formatStack(stack)}
          </span>
        )}
      </div>
      {showDealerBadge && (
        <span
          aria-label="딜러"
          title="딜러"
          style={{
            position: 'absolute',
            right: -14,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 26,
            height: 26,
            borderRadius: '50%',
            backgroundImage: "url('/ai-assets/markers/dealer-button.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display, Inter), system-ui, sans-serif',
            fontWeight: 900,
            fontSize: 13,
            color: '#1A1A1F',
            textShadow: '0 0 4px rgba(244,239,230,0.9)',
            letterSpacing: '-0.02em',
          }}
        >
          D
        </span>
      )}
    </div>
  );
}

/* ══════════════════════════ BET CHIP ══════════════════════════ */

// Chip colour maps to DENOMINATION like a real casino — not to the
// action kind. Every value bucket gets a distinct chip so 0.5 (SB),
// 1 (BB), and 2.5 (open) all look different even though they're all
// "bet-in-the-pot" actions.
//
// Buckets (BB):  ≤0.5 / ≤1 / ≤3 / ≤6 / ≤15 / ≤50 / >50
function chipSrcFor(action: Exclude<SeatAction, { kind: 'fold' }>): string {
  if (action.kind === 'check') {
    return '/ai-assets/chip-set-v4/grey-transparent.png';
  }
  const bb = action.bb;
  if (bb <= 0.5) return '/ai-assets/chip-set-v4/green-transparent.png'; // SB
  if (bb <= 1) return '/ai-assets/chip-set-v4/red-transparent.png'; // BB
  if (bb <= 3) return '/ai-assets/chip-set-v4/blue-transparent.png'; // std open 2-2.5-3
  if (bb <= 6) return '/ai-assets/chip-set-v4/emerald-transparent.png'; // small raise / call of raise
  if (bb <= 15) return '/ai-assets/chip-set-v4/gold-transparent.png'; // 3-bet (9-12 BB)
  if (bb <= 50) return '/ai-assets/chip-set-v4/purple-transparent.png'; // 4-bet / big postflop
  return '/ai-assets/chip-set-v4/black-transparent.png'; // all-in territory
}

function actionKey(action: SeatAction): string {
  if (action.kind === 'fold' || action.kind === 'check') return action.kind;
  return `${action.kind}-${action.bb}`;
}

function BetChip({ action }: { action: SeatAction }) {
  if (action.kind === 'fold') return null;
  const s = chipStyle(action);
  const src = chipSrcFor(action);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <img
        src={src}
        alt=""
        width={18}
        height={18}
        style={{
          width: 18,
          height: 18,
          flexShrink: 0,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.55))',
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 11,
          fontWeight: 600,
          color: '#F4EFE6',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {s.label}
      </span>
    </div>
  );
}

function chipStyle(action: Exclude<SeatAction, { kind: 'fold' }>): {
  gradient: string;
  rim: string;
  label: string;
} {
  switch (action.kind) {
    case 'raise':
    case 'bet':
      return {
        gradient: 'radial-gradient(circle at 35% 30%, #E23B56, #C8102E 60%, #7F0A1B)',
        rim: 'rgba(255,255,255,0.3)',
        label: `${fmt(action.bb)}`,
      };
    case '3bet':
      return {
        gradient: 'radial-gradient(circle at 35% 30%, #F0C857, #D4AF37 60%, #8C6F1F)',
        rim: 'rgba(255,255,255,0.3)',
        label: `${fmt(action.bb)}`,
      };
    case 'call':
      return {
        gradient: 'radial-gradient(circle at 35% 30%, #2EBE6F, #1F9D55 60%, #0F5D33)',
        rim: 'rgba(255,255,255,0.3)',
        label: `${fmt(action.bb)}`,
      };
    case 'check':
      return {
        gradient: 'radial-gradient(circle at 35% 30%, #6FB2FF, #4A9EFF 60%, #1E6BCC)',
        rim: 'rgba(255,255,255,0.3)',
        label: 'chk',
      };
    case 'post':
      return {
        gradient: 'radial-gradient(circle at 35% 30%, rgba(140,160,200,0.9), rgba(80,100,130,0.9))',
        rim: 'rgba(255,255,255,0.2)',
        label: `${fmt(action.bb)}`,
      };
  }
}

/* ══════════════════════════ CARD BACK ══════════════════════════ */

function CardBack() {
  // DALL·E-designed green double-border card back at 28×38 (the version
  // right before the too-loud burgundy variant).
  return (
    <div
      style={{
        width: 28,
        height: 38,
        borderRadius: 4,
        backgroundImage: "url('/ai-assets/card-back/double-border.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
        flexShrink: 0,
      }}
      aria-hidden
    />
  );
}

/* ══════════════════════════ GEOMETRY ══════════════════════════ */

function seatGeom(
  index: number,
  total: number,
): { x: number; y: number; inward: { x: number; y: number } } {
  // Portrait-oriented table — seats run around a tall ellipse. First
  // seat (index 0 = the seat we want at the bottom, which maps to the
  // hero in our arrangement) sits at the 6-o'clock position.
  const offset = Math.PI / 2;
  const angle = offset + (index / total) * Math.PI * 2;
  const rx = 30;
  const ry = 42;
  const x = 50 + rx * Math.cos(angle);
  const y = 50 + ry * Math.sin(angle);
  const dx = 50 - x;
  const dy = 50 - y;
  const mag = Math.hypot(dx, dy) || 1;
  return { x, y, inward: { x: dx / mag, y: dy / mag } };
}

function BoardSlot({ street }: { street: 'flop' | 'turn' | 'river' }) {
  // Empty placeholder for undealt community cards. Size matches
  // CardView 'sm' (42×60) so dealt + undealt align perfectly.
  const label = street === 'flop' ? 'F' : street === 'turn' ? 'T' : 'R';
  return (
    <div
      aria-hidden
      style={{
        width: 42,
        height: 60,
        borderRadius: 6,
        border: '1.5px dashed rgba(212,175,55,0.35)',
        background: 'rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: 11,
        fontWeight: 600,
        color: 'rgba(212,175,55,0.45)',
        letterSpacing: '0.1em',
      }}
    >
      {label}
    </div>
  );
}

function formatStack(stack: number): string {
  if (stack >= 1000) return `${(stack / 1000).toFixed(1)}K`;
  if (stack % 1 !== 0) return stack.toFixed(1);
  return String(stack);
}

function fmt(n: number): string {
  if (n % 1 === 0) return String(n);
  return n.toFixed(1);
}
