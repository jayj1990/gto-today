import type { HTMLAttributes, ReactNode } from 'react';

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
  renderCard?: (code: string, size: 'xs' | 'sm' | 'md') => ReactNode;
  showMarkers?: boolean;
}

const SEATS: Record<Format, Seat[]> = {
  '6max': ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'],
  '9max': ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  '10max': ['UTG', 'UTG1', 'UTG2', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  '11max': ['UTG', 'UTG1', 'UTG2', 'UTG3', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
};

const CHIP_PX = 50;

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
  effectiveStack,
  lastBet,
  renderCard,
  showMarkers = true,
  className,
  style,
  ...rest
}: PokerTableProps) {
  const seats = SEATS[format];
  const count = seats.length;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 10',
        minHeight: 300,
        ...style,
      }}
      role="img"
      aria-label={`${format} table — hero on ${hero ?? '-'}`}
      {...rest}
    >
      {/* Felt */}
      <svg
        viewBox="0 0 320 200"
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
        <ellipse cx="160" cy="100" rx="152" ry="88" fill="#080808" />
        <ellipse
          cx="160"
          cy="100"
          rx="150"
          ry="86"
          fill="none"
          stroke="rgba(212,175,55,0.22)"
          strokeWidth="1"
        />
        <ellipse
          cx="160"
          cy="100"
          rx="140"
          ry="78"
          fill="url(#pt-felt)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      </svg>

      {/* Center pot block — precisely centered */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          pointerEvents: 'none',
          textAlign: 'center',
        }}
      >
        {effectiveStack !== undefined && (
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 11,
              color: 'rgba(244, 239, 230, 0.6)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {fmt(effectiveStack)}bb
          </span>
        )}
        {pot !== undefined && (
          <span
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
        )}
        {lastBet !== undefined && (
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 11,
              color: 'rgba(244, 239, 230, 0.6)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {fmt(lastBet)} bb
          </span>
        )}
      </div>

      {/* Seats */}
      {seats.map((seat, i) => {
        const { x, y, inward } = seatGeom(i, count);
        const state = seatStates[seat] ?? {};
        const isHero = seat === hero;
        const isFolded = state.action?.kind === 'fold';
        const isToAct = !isHero && seat === toAct;

        const betX = x + inward.x * 20;
        const betY = y + inward.y * 20;

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
              {/* Cards on top */}
              {hasHeroCards && renderCard && (
                <div style={{ display: 'flex', gap: 2 }}>
                  {renderCard(heroCards![0], 'sm')}
                  {renderCard(heroCards![1], 'sm')}
                </div>
              )}
              {hasVillainCards && state.cards && renderCard && (
                <div style={{ display: 'flex', gap: 2 }}>
                  {renderCard(state.cards[0], 'xs')}
                  {renderCard(state.cards[1], 'xs')}
                </div>
              )}
              {hasVillainCards && !state.cards && state.showBacks && (
                <div style={{ display: 'flex', gap: 2 }}>
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

            {/* Bet chip on the radial line between seat and center */}
            {state.action && state.action.kind !== 'fold' && (
              <div
                style={{
                  position: 'absolute',
                  left: `${betX}%`,
                  top: `${betY}%`,
                  transform: 'translate(-50%, -50%)',
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
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/ai-assets/markers/dealer-button.png"
          alt=""
          aria-label="딜러"
          title="딜러"
          width={22}
          height={22}
          style={{
            position: 'absolute',
            right: -12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 22,
            height: 22,
            borderRadius: '50%',
            objectFit: 'cover',
            boxShadow: '0 2px 5px rgba(0,0,0,0.6)',
          }}
        />
      )}
    </div>
  );
}

/* ══════════════════════════ BET CHIP ══════════════════════════ */

function BetChip({ action }: { action: SeatAction }) {
  if (action.kind === 'fold') return null;
  const s = chipStyle(action);
  const isBlind = action.kind === 'post';
  const blindSrc =
    isBlind && action.bb <= 0.5
      ? '/ai-assets/markers/small-blind-chip.png'
      : isBlind
        ? '/ai-assets/markers/big-blind-chip.png'
        : null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {blindSrc ? (
        /* SB / BB blind chips use the DALL·E HD markers (ivory+green for
           SB, ivory+wine for BB) — reads more like a real casino chip
           than a flat radial-gradient circle. */
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={blindSrc}
          alt=""
          width={14}
          height={14}
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
            boxShadow: '0 2px 5px rgba(0,0,0,0.55)',
          }}
        />
      ) : (
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: s.gradient,
            border: `1px solid ${s.rim}`,
            boxShadow: '0 2px 5px rgba(0,0,0,0.55)',
            flexShrink: 0,
          }}
        />
      )}
      <span
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 11,
          fontWeight: 600,
          color: isBlind ? 'rgba(244,239,230,0.65)' : '#F4EFE6',
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
  // G3 chip watermark at ~35% opacity replaces the old 'T' letter.
  // Using the transparent variant so the chip silhouette blends with
  // the dark gradient felt without a rectangular PNG edge.
  return (
    <div
      style={{
        width: 22,
        height: 30,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #3A3A42 0%, #1E1E24 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/mark-g3-transparent.png"
        alt=""
        width={16}
        height={16}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 16,
          height: 16,
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

/* ══════════════════════════ GEOMETRY ══════════════════════════ */

function seatGeom(
  index: number,
  total: number,
): { x: number; y: number; inward: { x: number; y: number } } {
  const offset = Math.PI / 2;
  const angle = offset + (index / total) * Math.PI * 2;
  const rx = 44;
  const ry = 36;
  const x = 50 + rx * Math.cos(angle);
  const y = 50 + ry * Math.sin(angle);
  const dx = 50 - x;
  const dy = 50 - y;
  const mag = Math.hypot(dx, dy) || 1;
  return { x, y, inward: { x: dx / mag, y: dy / mag } };
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
