import type { HTMLAttributes } from 'react';
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
  /** Seat currently held by the hero. Highlights that position. */
  hero?: Seat;
  /** Seats already acted on this street — rendered dim. */
  folded?: Seat[];
  /** Render SB + BB position indicators. Defaults to true. */
  showBlinds?: boolean;
}

const SEATS: Record<Format, Seat[]> = {
  '6max': ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'],
  '9max': ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  '10max': ['UTG', 'UTG1', 'UTG2', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  '11max': ['UTG', 'UTG1', 'UTG2', 'UTG3', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
};

/**
 * Overhead view of a poker table.
 * Plain SVG — no motion, no state, no client boundary. Drop onto any page.
 */
export function PokerTable({
  format = '6max',
  hero,
  folded = [],
  showBlinds = true,
  className,
  ...rest
}: PokerTableProps) {
  const seats = SEATS[format];
  const count = seats.length;

  return (
    <div
      className={cn('relative aspect-[16/10] w-full', className)}
      role="img"
      aria-label={`${format} poker table`}
      {...rest}
    >
      <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="pt-felt" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#17543F" />
            <stop offset="100%" stopColor="#0A2A20" />
          </radialGradient>
        </defs>
        {/* rail */}
        <rect x="4" y="14" width="312" height="172" rx="86" fill="#1C1C1E" />
        {/* felt */}
        <rect
          x="14"
          y="24"
          width="292"
          height="152"
          rx="76"
          fill="url(#pt-felt)"
          stroke="rgba(212,175,55,0.25)"
          strokeWidth="1"
        />
        {/* center pot marker */}
        <circle cx="160" cy="100" r="8" fill="rgba(212,175,55,0.14)" />
      </svg>

      {seats.map((seat, i) => {
        const { x, y } = seatPosition(i, count);
        const isHero = seat === hero;
        const isFolded = folded.includes(seat);
        return (
          <div
            key={seat}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div
              className={cn(
                'flex h-9 w-12 items-center justify-center rounded-full border text-[11px] font-semibold font-mono tracking-[0.1em]',
                isHero
                  ? 'bg-[color:var(--color-gold)] text-noir border-[color:var(--color-gold-deep)] shadow-[0_0_0_3px_rgba(212,175,55,0.2)]'
                  : 'bg-[color:var(--color-surface-raised)] text-fg border-[color:var(--color-border)]',
                isFolded && 'opacity-40',
              )}
            >
              {seat}
            </div>
            {showBlinds && (seat === 'SB' || seat === 'BB') && !isHero && (
              <span className="mt-1 block text-center text-[10px] font-mono text-[color:var(--color-gold)]">
                {seat === 'SB' ? 'SB' : 'BB'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Ellipse-based placement so seats sit on the felt edge. */
function seatPosition(index: number, total: number): { x: number; y: number } {
  // Start at bottom center (where the hero usually sits) and go counter-clockwise.
  const offset = Math.PI / 2;
  const angle = offset + (index / total) * Math.PI * 2;
  const cx = 50;
  const cy = 50;
  const rx = 42;
  const ry = 34;
  const x = cx + rx * Math.cos(angle);
  const y = cy + ry * Math.sin(angle);
  return { x, y };
}
