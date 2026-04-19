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

export interface PokerTableProps extends HTMLAttributes<HTMLDivElement> {
  format?: Format;
  /** Seat currently held by the hero. Highlighted in gold. */
  hero?: Seat;
  /** Seats that already folded on this street. Rendered with strong dim + strike. */
  folded?: Seat[];
  /** Element rendered inside the hero seat (e.g. two hole cards). */
  heroContent?: ReactNode;
  /** Element rendered at the center of the table (e.g. board cards / pot label). */
  centerContent?: ReactNode;
  /** Show the little D/SB/BB blinds chips. Defaults true. */
  showMarkers?: boolean;
}

const SEATS: Record<Format, Seat[]> = {
  '6max': ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'],
  '9max': ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  '10max': ['UTG', 'UTG1', 'UTG2', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  '11max': ['UTG', 'UTG1', 'UTG2', 'UTG3', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
};

/**
 * Overhead poker table — GTO Wizard-inspired flat layout.
 *
 * Uses explicit inline aspect-ratio + min-height so seat positioning math
 * always has real pixels to work with (the previous `aspect-[16/10]` class
 * silently collapsed inside some flex containers, smashing all seats into
 * a horizontal strip).
 *
 * Design:
 *  - Ellipse *outline*, no filled felt. Lets the surrounding panel breathe
 *    and keeps the seat labels legible on mobile.
 *  - Hero seat: gold ring + optional `heroContent` (typically hole cards)
 *    docked to the right of the chip, so the player sees their hand exactly
 *    where it would sit at a real table.
 *  - Villain seats: pill-sized label, no chip border. Folded seats get a
 *    diagonal strike + 40% opacity so the action history reads at a glance.
 */
export function PokerTable({
  format = '9max',
  hero,
  folded = [],
  heroContent,
  centerContent,
  showMarkers = true,
  className,
  style,
  ...rest
}: PokerTableProps) {
  const seats = SEATS[format];
  const count = seats.length;
  const foldedSet = new Set(folded);

  return (
    <div
      className={cn('relative w-full', className)}
      style={{ aspectRatio: '16 / 10', minHeight: 220, ...style }}
      role="img"
      aria-label={`${format} poker table${hero ? ` — hero on ${hero}` : ''}`}
      {...rest}
    >
      <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full" aria-hidden>
        {/* Table outline only — no heavy felt fill. */}
        <ellipse
          cx="160"
          cy="100"
          rx="150"
          ry="86"
          fill="rgba(14, 59, 46, 0.12)"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.2"
        />
        <ellipse
          cx="160"
          cy="100"
          rx="128"
          ry="68"
          fill="none"
          stroke="rgba(212, 175, 55, 0.1)"
          strokeWidth="0.8"
        />
      </svg>

      {/* Center content (board cards / pot marker for postflop). */}
      {centerContent && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: '56%' }}
        >
          <div className="pointer-events-auto">{centerContent}</div>
        </div>
      )}

      {seats.map((seat, i) => {
        const { x, y } = seatPosition(i, count);
        const isHero = seat === hero;
        const isFolded = foldedSet.has(seat);
        const marker =
          showMarkers && (seat === 'BTN' ? 'D' : seat === 'SB' ? 'SB' : seat === 'BB' ? 'BB' : null);

        return (
          <div
            key={seat}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {isHero ? (
              <div className="flex items-center gap-2">
                <div
                  className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-gradient font-mono text-[11px] font-bold text-noir"
                  style={{ boxShadow: '0 0 0 3px var(--color-gold), 0 0 16px rgba(212,175,55,0.5)' }}
                >
                  {seat}
                </div>
                {heroContent}
              </div>
            ) : (
              <div
                className={cn(
                  'relative flex h-8 min-w-10 items-center justify-center rounded-full border px-2 font-mono text-[11px] tracking-[0.04em]',
                  isFolded
                    ? 'border-[color:var(--color-border)] text-fg-muted/60 opacity-40'
                    : 'border-[color:var(--color-border)] text-fg-muted',
                )}
              >
                {seat}
                {isFolded && (
                  <span
                    aria-hidden
                    className="absolute inset-x-1 top-1/2 h-[1px] -translate-y-1/2 -rotate-12 bg-[color:var(--color-raise)]"
                  />
                )}
              </div>
            )}

            {marker && !isHero && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full px-1.5 py-[1px] font-mono text-[9px] font-bold',
                  seat === 'BTN' && 'bg-ivory text-noir',
                  seat === 'SB' && 'bg-[color:var(--color-gold)]/90 text-noir',
                  seat === 'BB' && 'bg-[color:var(--color-gold)] text-noir',
                )}
              >
                {marker}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Place seats along an ellipse whose radii are tuned for the SVG viewBox
 * aspect. Start at bottom-center (hero's classic seat) and go clockwise.
 * Result: seats are distributed around the outline evenly, not bunched on
 * any single side.
 */
function seatPosition(index: number, total: number): { x: number; y: number } {
  const offset = Math.PI / 2; // 0 = bottom
  const angle = offset + (index / total) * Math.PI * 2;
  const cx = 50;
  const cy = 50;
  // Seat chips sit on the rail, just inside the outer ellipse.
  const rx = 46;
  const ry = 40;
  const x = cx + rx * Math.cos(angle);
  const y = cy + ry * Math.sin(angle);
  return { x, y };
}
