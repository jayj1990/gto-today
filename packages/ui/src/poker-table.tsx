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
  /** Reveal villain's cards (showdown). */
  cards?: readonly [string, string];
  /** If true, show face-down card backs beside the seat (opponent is still in). */
  showBacks?: boolean;
}

export interface PokerTableProps extends HTMLAttributes<HTMLDivElement> {
  format?: Format;
  hero?: Seat;
  seats?: Partial<Record<Seat, SeatState>>;
  /** The seat currently to act. Gets a pulsing amber ring. */
  toAct?: Seat;
  /** Hero's hole cards (rank+suit string pair), rendered big beside hero chip. */
  heroCards?: readonly [string, string];
  /** Pot displayed in the big center number. */
  pot?: number | undefined;
  /** Effective stack for tooltip/display above pot. */
  effectiveStack?: number | undefined;
  /** Last bet amount shown below pot. */
  lastBet?: number | undefined;
  /** Consumer-provided card renderer. */
  renderCard?: (code: string, size: 'xs' | 'sm' | 'md') => ReactNode;
  /** Show D / SB / BB position markers. Defaults true. */
  showMarkers?: boolean;
}

const SEATS: Record<Format, Seat[]> = {
  '6max': ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'],
  '9max': ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  '10max': ['UTG', 'UTG1', 'UTG2', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  '11max': ['UTG', 'UTG1', 'UTG2', 'UTG3', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
};

/**
 * GTO-Wizard-style overhead table.
 *
 * Each seat is rendered as a row of three elements, oriented away from the
 * table center: [card1][card2][chip]  for right-side seats, reversed for
 * left-side seats, and centered for top/bottom seats. This layout was
 * designed to mirror exactly what a player sees from above a felt table.
 *
 * - Chip = circular disc with POSITION on top, STACK on bottom
 * - Hero chip gets a 2.5px teal ring
 * - To-act seat gets a 2px amber ring
 * - Cards beside chip: big front-face for hero, "W" face-downs for villains
 *   who still have a hand, nothing for folded
 * - Bet chip (colored disc + amount) sits between seat and center on the
 *   imaginary chord-to-center line
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
      {/* Oval outline — no felt fill; just a thin line defining the rail. */}
      <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full" aria-hidden>
        <ellipse
          cx="160"
          cy="100"
          rx="140"
          ry="78"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
      </svg>

      {/* Center info block: effective stack / pot / last bet */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        {effectiveStack !== undefined && (
          <p className="font-mono text-[11px] text-fg-muted/70 tabular-nums">
            {effectiveStack}bb
          </p>
        )}
        {pot !== undefined && (
          <p className="font-mono text-[22px] font-bold leading-tight text-fg tabular-nums">
            {formatNumber(pot)} bb
          </p>
        )}
        {lastBet !== undefined && (
          <p className="font-mono text-[11px] text-fg-muted/70 tabular-nums">
            {lastBet} bb
          </p>
        )}
      </div>

      {seats.map((seat, i) => {
        const { x, y, orientation } = seatLayout(i, count);
        const state = seatStates[seat] ?? {};
        const isHero = seat === hero;
        const isFolded = state.action?.kind === 'fold';
        const isToAct = !isHero && seat === toAct;
        const betPos = chipPos(x, y, 30);

        return (
          <div key={seat}>
            {/* Betting chip between seat and center */}
            {state.action && state.action.kind !== 'fold' && (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${betPos.x}%`, top: `${betPos.y}%` }}
              >
                <BetChip action={state.action} />
              </div>
            )}

            {/* Seat cluster (chip + cards, arranged by side) */}
            <div
              className={cn(
                'absolute -translate-x-1/2 -translate-y-1/2',
                'flex items-center',
                orientation === 'row-reverse' && 'flex-row-reverse',
                orientation === 'col' && 'flex-col',
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <SeatChip
                seat={seat}
                stack={state.stack}
                variant={isFolded ? 'folded' : isHero ? 'hero' : isToAct ? 'toAct' : 'idle'}
                showDealerBadge={showMarkers && seat === 'BTN'}
              />

              {/* Cards beside chip */}
              {isHero && heroCards && renderCard && (
                <div
                  className={cn(
                    'flex shrink-0 items-center',
                    orientation === 'col' ? 'mt-1 gap-0.5' : 'gap-0.5',
                    orientation === 'row' ? 'ml-1.5' : orientation === 'row-reverse' ? 'mr-1.5' : '',
                  )}
                >
                  {renderCard(heroCards[0], 'sm')}
                  {renderCard(heroCards[1], 'sm')}
                </div>
              )}
              {!isHero && state.cards && renderCard && !isFolded && (
                <div
                  className={cn(
                    'flex shrink-0 items-center',
                    orientation === 'col' ? 'mt-1 gap-0.5' : 'gap-0.5',
                    orientation === 'row' ? 'ml-1' : orientation === 'row-reverse' ? 'mr-1' : '',
                  )}
                >
                  {renderCard(state.cards[0], 'xs')}
                  {renderCard(state.cards[1], 'xs')}
                </div>
              )}
              {!isHero && !state.cards && state.showBacks && !isFolded && (
                <div
                  className={cn(
                    'flex shrink-0 items-center',
                    orientation === 'col' ? 'mt-1 gap-0.5' : 'gap-0.5',
                    orientation === 'row' ? 'ml-1' : orientation === 'row-reverse' ? 'mr-1' : '',
                  )}
                >
                  <CardBack />
                  <CardBack />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═════════════════════════════ SEAT CHIP ═════════════════════════════ */

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
  const fill = 'rgb(28, 28, 32)';
  const ringColor =
    variant === 'hero'
      ? 'var(--color-call)'
      : variant === 'toAct'
        ? 'var(--color-warning)'
        : 'rgba(255,255,255,0.25)';
  const ringWidth = variant === 'hero' ? '2.5px' : variant === 'toAct' ? '2px' : '1.5px';

  const positionColor =
    variant === 'hero'
      ? 'text-[color:var(--color-call)]'
      : variant === 'toAct'
        ? 'text-[color:var(--color-warning)]'
        : 'text-ivory/80';

  return (
    <div className="relative">
      <div
        className="flex h-14 w-14 flex-col items-center justify-center rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.5)]"
        style={{
          background: fill,
          border: `${ringWidth} solid ${ringColor}`,
          opacity: variant === 'folded' ? 0.35 : 1,
        }}
      >
        <span
          className={cn(
            'font-mono text-[11px] font-bold leading-none tracking-[0.04em]',
            positionColor,
          )}
        >
          {seat}
        </span>
        {stack !== undefined && (
          <span className="mt-1 font-mono text-[14px] font-bold leading-none text-ivory tabular-nums">
            {formatStack(stack)}
          </span>
        )}
      </div>
      {variant === 'folded' && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-2 top-1/2 h-[1.5px] -translate-y-1/2 -rotate-12 bg-[color:var(--color-raise)]"
        />
      )}
      {showDealerBadge && (
        <span
          title="딜러"
          aria-label="딜러"
          className="absolute -right-1.5 -bottom-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ivory font-mono text-[10px] font-bold text-noir shadow-[0_2px_6px_rgba(0,0,0,0.6)] ring-1 ring-black/20"
        >
          D
        </span>
      )}
    </div>
  );
}

/* ═════════════════════════════ BET CHIP ═════════════════════════════ */

function BetChip({ action }: { action: SeatAction }) {
  if (action.kind === 'fold') return null;
  const style = chipStyle(action);
  const isBlind = action.kind === 'post';
  return (
    <div className="flex items-center gap-1">
      <div
        className={cn(
          'flex items-center justify-center rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.55)]',
          isBlind ? 'h-3 w-3' : 'h-4 w-4',
        )}
        style={{ background: style.gradient, border: `1px solid ${style.rim}` }}
      />
      <span
        className={cn(
          'font-mono text-[11px] font-semibold tabular-nums',
          isBlind ? 'text-fg-muted' : 'text-fg',
        )}
      >
        {style.label}
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
        label: `${action.bb}`,
      };
    case '3bet':
      return {
        gradient: 'radial-gradient(circle at 35% 30%, #F0C857, #D4AF37 60%, #8C6F1F)',
        rim: 'rgba(255,255,255,0.3)',
        label: `${action.bb}`,
      };
    case 'call':
      return {
        gradient: 'radial-gradient(circle at 35% 30%, #2EBE6F, #1F9D55 60%, #0F5D33)',
        rim: 'rgba(255,255,255,0.3)',
        label: `${action.bb}`,
      };
    case 'check':
      return {
        gradient: 'radial-gradient(circle at 35% 30%, #6FB2FF, #4A9EFF 60%, #1E6BCC)',
        rim: 'rgba(255,255,255,0.3)',
        label: 'chk',
      };
    case 'post':
      return {
        gradient: 'radial-gradient(circle at 35% 30%, rgba(120,140,180,0.9), rgba(70,90,120,0.9))',
        rim: 'rgba(255,255,255,0.2)',
        label: `${action.bb}`,
      };
  }
}

/* ═════════════════════════════ CARD BACK ═════════════════════════════ */

function CardBack() {
  return (
    <div
      className="h-[28px] w-[20px] rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
      style={{
        background:
          'linear-gradient(135deg, rgba(60,60,68,0.9) 0%, rgba(40,40,48,0.9) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
      aria-hidden
    >
      <div className="flex h-full items-center justify-center">
        <span className="font-mono text-[9px] text-ivory/40">W</span>
      </div>
    </div>
  );
}

/* ═════════════════════════════ GEOMETRY ═════════════════════════════ */

/**
 * Given a seat index and a total seat count, return its position on the
 * ellipse and the best flex orientation for the chip + cards cluster.
 *
 * The cluster orientation is picked so cards point *away* from the center
 * of the table (matching GTO Wizard), keeping them readable and not
 * overlapping the pot.
 */
function seatLayout(
  index: number,
  total: number,
): { x: number; y: number; orientation: 'row' | 'row-reverse' | 'col' } {
  const offset = Math.PI / 2; // start at bottom-center
  const angle = offset + (index / total) * Math.PI * 2;
  const rx = 44;
  const ry = 38;
  const x = 50 + rx * Math.cos(angle);
  const y = 50 + ry * Math.sin(angle);

  // Orientation: which side the cards sit on, so they extend outward from
  // the table, not across it.
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let orientation: 'row' | 'row-reverse' | 'col';
  if (Math.abs(sin) > 0.7) {
    orientation = 'col'; // top or bottom seats → stack vertically
  } else if (cos > 0) {
    orientation = 'row'; // right side of table → cards on left of chip? wait — we want them outside
    // cos > 0 means seat is to the right of center; chip should be OUTSIDE (right), cards closer to center
    // Actually GTO Wizard puts cards BESIDE chip, same row; we just keep consistent flow
    orientation = 'row-reverse'; // cards to the right (outside), chip closer to center on right-side seats... actually simpler: left side of screen
  } else {
    orientation = 'row';
  }
  return { x, y, orientation };
}

function chipPos(seatX: number, seatY: number, pullPercent: number): { x: number; y: number } {
  const cx = 50;
  const cy = 50;
  const dx = cx - seatX;
  const dy = cy - seatY;
  const t = pullPercent / 100;
  return { x: seatX + dx * t, y: seatY + dy * t };
}

function formatStack(stack: number): string {
  if (stack >= 1000) return `${(stack / 1000).toFixed(1)}K`;
  if (stack % 1 !== 0) return stack.toFixed(1);
  return String(stack);
}

function formatNumber(n: number): string {
  if (n % 1 === 0) return String(n);
  return n.toFixed(1);
}
