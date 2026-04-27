import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
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
  action?: SeatAction;
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
 * The dealer sweeps the table, dropping one card per seat in this
 * order, then sweeps again for the second card. We don't separate the
 * two passes (each seat's two cards animate together with a small
 * gap), so seats just need a single slot index here.
 */
const DEAL_ORDER: Seat[] = [
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

function dealSlot(seat: Seat): number {
  const idx = DEAL_ORDER.indexOf(seat);
  return idx >= 0 ? idx : 0;
}

/**
 * Chronological order chips should appear on the felt:
 *   SB post → BB post → UTG voluntary → MP → CO → BTN → SB voluntary → BB voluntary
 *
 * Posts go first because in real poker the blinds are on the felt
 * before any voluntary action happens. Voluntary actions then sweep
 * UTG → BB in normal preflop turn order. Returns a slot index used
 * downstream as `slot * stepMs` so the animation reads like the deal.
 */
function chipOrderSlot(seat: Seat, action: SeatAction): number {
  if (action.kind === 'post') {
    return seat === 'SB' ? 0 : 1; // SB before BB
  }
  const voluntaryOrder: Seat[] = [
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
  const idx = voluntaryOrder.indexOf(seat);
  return 2 + (idx >= 0 ? idx : 0);
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
    // Deal sweep — one swoosh per dealt seat, matches dealSlot * 90ms.
    for (const seat of seats) {
      const st = seatStates[seat];
      if (!st || (!st.cards && !st.showBacks)) continue;
      const t = window.setTimeout(playDeal, dealSlot(seat) * 90);
      timers.push(t);
    }
    // Bet cascade — one chip clink per non-fold action, base offset
    // matches the chip animation start ((count-1)*90 + 140 + 250).
    const betBase = (count - 1) * 90 + 140 + 250;
    for (const seat of seats) {
      const st = seatStates[seat];
      if (!st?.action || st.action.kind === 'fold') continue;
      const t = window.setTimeout(playChip, betBase + chipOrderSlot(seat, st.action) * 80);
      timers.push(t);
    }
    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [playSfx, seats, seatStates, count]);

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

        const hasVillainCards = !isHero && !isFolded && (state.cards || state.showBacks);
        const hasHeroCards = isHero && heroCards;

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
              {/* Dealing order — real poker (clockwise from SB):
                  SB → BB → UTG → MP → CO → BTN. Each seat's cards
                  arrive at slot * 90ms; hero gets the same slot so a
                  BB hero sees their cards 2nd (right after SB), a BTN
                  hero last. The 140ms inter-card gap on the hero is
                  the visual cue for "your cards being placed face-up". */}
              {hasHeroCards && renderCard && (
                <div style={{ display: 'flex', gap: 2 }}>
                  <span
                    className="animate-card-slide-in"
                    style={{ ['--anim-delay' as string]: `${dealSlot(seat) * 90}ms` }}
                  >
                    {renderCard(heroCards![0], 'sm')}
                  </span>
                  <span
                    className="animate-card-slide-in"
                    style={{ ['--anim-delay' as string]: `${dealSlot(seat) * 90 + 140}ms` }}
                  >
                    {renderCard(heroCards![1], 'sm')}
                  </span>
                </div>
              )}
              {hasVillainCards && state.cards && renderCard && (
                <div
                  className="animate-card-slide-in"
                  style={{
                    display: 'flex',
                    gap: 2,
                    ['--anim-delay' as string]: `${dealSlot(seat) * 90}ms`,
                  }}
                >
                  {renderCard(state.cards[0], 'xs')}
                  {renderCard(state.cards[1], 'xs')}
                </div>
              )}
              {hasVillainCards && !state.cards && state.showBacks && (
                <div
                  className="animate-card-slide-in"
                  style={{
                    display: 'flex',
                    gap: 2,
                    ['--anim-delay' as string]: `${dealSlot(seat) * 90}ms`,
                  }}
                >
                  <CardBack />
                  <CardBack />
                </div>
              )}

              {/* Chip below */}
              <SeatChip
                seat={seat}
                stack={state.stack}
                variant={isFolded ? 'folded' : isHero ? 'hero' : isToAct ? 'toAct' : 'idle'}
                showDealerBadge={showMarkers && seat === 'BTN'}
              />
            </div>

            {/* Bet chip on the radial line between seat and center.
                `key` keyed on the action kind+size so changing the
                action (e.g. raise → 3bet) remounts and replays the
                spring-in animation. The --throw-x/y vars start the
                chip biased toward the seat (~16px outward) so it
                visually travels across the felt to its bet position
                instead of just popping into place. Bet chips land
                after the deal in poker order: SB post → BB post →
                voluntary actions UTG→BB. */}
            {state.action && state.action.kind !== 'fold' && (
              <div
                key={`bet-${seat}-${actionKey(state.action)}`}
                className="animate-chip-bet-in"
                style={{
                  position: 'absolute',
                  left: `${betX}%`,
                  top: `${betY}%`,
                  ['--throw-x' as string]: `${-inward.x * 16}px`,
                  ['--throw-y' as string]: `${-inward.y * 16}px`,
                  // Deal sequence finishes at (count - 1) * 90 + 140
                  // (last seat slot + hero 2nd-card stagger). Chips
                  // start 250ms after that so the deal settles first.
                  ['--anim-delay' as string]: `${(count - 1) * 90 + 140 + 250 + chipOrderSlot(seat, state.action) * 80}ms`,
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
      style={{
        position: 'relative',
        width: CHIP_PX,
        height: CHIP_PX,
        borderRadius: '50%',
        background: 'rgb(24, 24, 28)',
        border: `${ringWidth}px solid ${ringColor}`,
        boxShadow:
          variant === 'hero'
            ? '0 0 0 1px rgba(31,157,85,0.4), 0 4px 14px rgba(0,0,0,0.55), 0 0 20px rgba(31,157,85,0.3)'
            : variant === 'toAct'
              ? '0 4px 14px rgba(0,0,0,0.55), 0 0 16px rgba(230,168,23,0.4)'
              : '0 3px 10px rgba(0,0,0,0.5)',
        opacity: variant === 'folded' ? 0.35 : 1,
        overflow: 'visible',
      }}
    >
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
