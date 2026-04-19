import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

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

const CHIP_PX = 52;

/**
 * Overhead poker table — rebuild round 4.
 *
 * Fixes user feedback:
 *  1. Chip size no longer depends on stack text length (was causing 99.5 chip
 *     to look wider than 99). Chip is a fixed 52×52 box positioned directly
 *     at its ellipse coordinate, content clipped with overflow-hidden.
 *  2. Cards render as a SEPARATE absolutely-positioned element offset
 *     inward from the chip — they can never overlap the chip.
 *  3. Real felt restored — radial green gradient inside an elliptical rail.
 *  4. Center pot block uses a single flex column pinned to 50/50, so the
 *     pot number always lands on the visual center.
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
      className={cn('relative w-full', className)}
      style={{ aspectRatio: '16 / 10', minHeight: 280, ...style }}
      role="img"
      aria-label={`${format} table — hero on ${hero ?? '-'}`}
      {...rest}
    >
      <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full" aria-hidden>
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
        <ellipse
          cx="160"
          cy="100"
          rx="118"
          ry="60"
          fill="none"
          stroke="rgba(255,255,255,0.035)"
          strokeWidth="0.6"
        />
      </svg>

      {/* Center pot block, precisely centered at 50/50 */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[3px]">
        {effectiveStack !== undefined && (
          <span className="font-mono text-[10px] font-medium text-ivory/55 tabular-nums">
            {effectiveStack}bb
          </span>
        )}
        {pot !== undefined && (
          <span className="font-mono text-[22px] font-bold leading-none text-ivory tabular-nums">
            {fmt(pot)} bb
          </span>
        )}
        {lastBet !== undefined && (
          <span className="font-mono text-[11px] font-medium text-ivory/55 tabular-nums">
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

        // Cards render on the side of the chip facing the table center.
        // Using a pixel offset (not a percentage) guarantees the cards clear
        // the 52px chip regardless of viewport width — previously a 16%
        // horizontal offset collapsed to ~60px on mobile, causing the
        // colored card rectangles to sit under the chip so the user only
        // saw overlapping numbers.
        const cardsGoLeft = x > 50;

        const betX = x + inward.x * 22;
        const betY = y + inward.y * 22;

        const showingHeroCards = isHero && heroCards;
        const showingVillainCards =
          !isHero && !isFolded && (state.cards || state.showBacks);

        return (
          <div key={seat}>
            {/* Chip — fixed 52x52, centered exactly on (x, y) */}
            <div
              className="absolute"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: CHIP_PX,
                height: CHIP_PX,
                marginLeft: -CHIP_PX / 2,
                marginTop: -CHIP_PX / 2,
              }}
            >
              <SeatChip
                seat={seat}
                stack={state.stack}
                variant={isFolded ? 'folded' : isHero ? 'hero' : isToAct ? 'toAct' : 'idle'}
                showDealerBadge={showMarkers && seat === 'BTN'}
              />
            </div>

            {/* Cards — anchored to the seat point via a 0×0 wrapper, then
                laid out in pixels so they always clear the chip. */}
            {(showingHeroCards || showingVillainCards) && (
              <div
                className="absolute"
                style={{ left: `${x}%`, top: `${y}%`, width: 0, height: 0 }}
              >
                <div
                  className="absolute top-1/2 -translate-y-1/2"
                  style={cardsGoLeft ? { right: '32px' } : { left: '32px' }}
                >
                {showingHeroCards && renderCard && (
                  <div className="flex gap-0.5">
                    {renderCard(heroCards![0], 'sm')}
                    {renderCard(heroCards![1], 'sm')}
                  </div>
                )}
                {showingVillainCards && state.cards && renderCard && (
                  <div className="flex gap-0.5">
                    {renderCard(state.cards[0], 'xs')}
                    {renderCard(state.cards[1], 'xs')}
                  </div>
                )}
                {showingVillainCards && !state.cards && state.showBacks && (
                  <div className="flex gap-0.5">
                    <CardBack />
                    <CardBack />
                  </div>
                )}
                </div>
              </div>
            )}

            {/* Bet chip between seat and center */}
            {state.action && state.action.kind !== 'fold' && (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${betX}%`, top: `${betY}%` }}
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
    <div className="relative h-full w-full">
      <div
        className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-full"
        style={{
          background: 'rgb(24, 24, 28)',
          border: `${ringWidth}px solid ${ringColor}`,
          boxShadow:
            variant === 'hero'
              ? '0 0 0 1px rgba(31,157,85,0.4), 0 4px 14px rgba(0,0,0,0.55), 0 0 20px rgba(31,157,85,0.3)'
              : variant === 'toAct'
                ? '0 4px 14px rgba(0,0,0,0.55), 0 0 16px rgba(230,168,23,0.4)'
                : '0 3px 10px rgba(0,0,0,0.5)',
          opacity: variant === 'folded' ? 0.4 : 1,
        }}
      >
        <span
          className="whitespace-nowrap font-mono text-[10px] font-bold leading-none tracking-[0.03em]"
          style={{ color: positionColor }}
        >
          {seat}
        </span>
        {stack !== undefined && (
          <span className="mt-[3px] whitespace-nowrap font-mono text-[12px] font-bold leading-none text-ivory tabular-nums">
            {formatStack(stack)}
          </span>
        )}
      </div>
      {variant === 'folded' && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[1.5px] w-[70%] -translate-x-1/2 -translate-y-1/2 -rotate-12 bg-[color:var(--color-raise)]"
        />
      )}
      {showDealerBadge && (
        <span
          title="딜러"
          aria-label="딜러"
          className="absolute -right-1.5 -bottom-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-ivory font-mono text-[10px] font-bold text-noir shadow-[0_2px_6px_rgba(0,0,0,0.6)] ring-1 ring-black/20"
        >
          D
        </span>
      )}
    </div>
  );
}

/* ══════════════════════════ BET CHIP ══════════════════════════ */

function BetChip({ action }: { action: SeatAction }) {
  if (action.kind === 'fold') return null;
  const s = chipStyle(action);
  const isBlind = action.kind === 'post';
  return (
    <div className="flex items-center gap-1">
      <div
        className={cn('rounded-full', isBlind ? 'h-3 w-3' : 'h-4 w-4')}
        style={{
          background: s.gradient,
          border: `1px solid ${s.rim}`,
          boxShadow: '0 2px 5px rgba(0,0,0,0.55)',
        }}
      />
      <span
        className={cn(
          'whitespace-nowrap font-mono text-[11px] font-semibold tabular-nums',
          isBlind ? 'text-ivory/60' : 'text-ivory',
        )}
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
      // Display blinds as casino-style small/big chips (SB 1, BB 2) instead
      // of the academic "0.5 BB / 1 BB" — matches Korean live convention.
      return {
        gradient: 'radial-gradient(circle at 35% 30%, rgba(140,160,200,0.9), rgba(80,100,130,0.9))',
        rim: 'rgba(255,255,255,0.2)',
        label: `${fmt(action.bb * 2)}`,
      };
  }
}

/* ══════════════════════════ CARD BACK ══════════════════════════ */

function CardBack() {
  return (
    <div
      className="h-[32px] w-[22px] rounded-[3px]"
      style={{
        background: 'linear-gradient(135deg, rgba(60,60,68,0.95), rgba(38,38,46,0.95))',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
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
  const offset = Math.PI / 2;
  const angle = offset + (index / total) * Math.PI * 2;
  const rx = 44;
  const ry = 38;
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
