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
  /** Seat currently held by the hero. Highlights that position with a golden glow. */
  hero?: Seat;
  /** Seats that already folded this street — rendered dim with a line through. */
  folded?: Seat[];
  /** Show SB / BB chip markers. Defaults to true. */
  showBlinds?: boolean;
  /** Render the dealer (BTN) chip marker. Defaults to true. */
  showButton?: boolean;
  /** Diameter override for the base size. Defaults to responsive. */
  size?: 'sm' | 'md' | 'lg';
}

const SEATS: Record<Format, Seat[]> = {
  '6max': ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'],
  '9max': ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  '10max': ['UTG', 'UTG1', 'UTG2', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  '11max': ['UTG', 'UTG1', 'UTG2', 'UTG3', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
};

const SIZE_CLASS: Record<NonNullable<PokerTableProps['size']>, string> = {
  sm: 'aspect-[16/10] w-full max-w-[320px]',
  md: 'aspect-[16/10] w-full max-w-[460px]',
  lg: 'aspect-[16/10] w-full',
};

/**
 * Overhead view of a poker table.
 *
 * The hero seat gets:
 *  - A larger, brighter marker with a golden outer ring
 *  - A "나" label above
 * Folded seats get:
 *  - Reduced opacity
 *  - A diagonal strike-through
 * BTN, SB, BB get small chip markers inside the felt for clarity.
 */
export function PokerTable({
  format = '9max',
  hero,
  folded = [],
  showBlinds = true,
  showButton = true,
  size = 'md',
  className,
  ...rest
}: PokerTableProps) {
  const seats = SEATS[format];
  const count = seats.length;
  const foldedSet = new Set(folded);

  return (
    <div
      className={cn('relative', SIZE_CLASS[size], className)}
      role="img"
      aria-label={`${format} poker table — hero on ${hero ?? 'none'}`}
      {...rest}
    >
      <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="pt-felt" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#1B6B4A" />
            <stop offset="60%" stopColor="#0E3B2E" />
            <stop offset="100%" stopColor="#072218" />
          </radialGradient>
          <filter id="pt-inner" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="1" />
          </filter>
        </defs>
        {/* rail */}
        <rect x="0" y="6" width="320" height="188" rx="94" fill="#0A0A0A" />
        {/* rail highlight */}
        <rect
          x="2"
          y="8"
          width="316"
          height="184"
          rx="92"
          fill="none"
          stroke="rgba(212,175,55,0.18)"
          strokeWidth="1"
        />
        {/* felt */}
        <rect
          x="12"
          y="18"
          width="296"
          height="164"
          rx="82"
          fill="url(#pt-felt)"
          stroke="rgba(212,175,55,0.3)"
          strokeWidth="1"
        />
        {/* subtle center line */}
        <ellipse
          cx="160"
          cy="100"
          rx="118"
          ry="58"
          fill="none"
          stroke="rgba(255,255,255,0.03)"
        />
        {/* center pot marker */}
        <circle cx="160" cy="100" r="10" fill="rgba(212,175,55,0.12)" />
        <circle cx="160" cy="100" r="3" fill="rgba(212,175,55,0.4)" />
      </svg>

      {seats.map((seat, i) => {
        const { x, y } = seatPosition(i, count);
        const isHero = seat === hero;
        const isFolded = foldedSet.has(seat);

        return (
          <div
            key={seat}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {isHero && (
              <span
                className="absolute left-1/2 -top-5 -translate-x-1/2 rounded-full bg-[color:var(--color-gold)] px-2 py-[2px] text-[10px] font-bold text-noir shadow-[0_2px_6px_rgba(212,175,55,0.5)]"
                aria-hidden
              >
                나
              </span>
            )}

            <div
              className={cn(
                'relative flex items-center justify-center rounded-full font-mono font-semibold tracking-[0.08em] transition-all',
                isHero
                  ? 'h-12 w-14 bg-gold-gradient text-noir ring-[3px] ring-[color:var(--color-gold)] ring-offset-2 ring-offset-[#0A2A20] text-[12px]'
                  : 'h-9 w-12 bg-[color:var(--color-charcoal)] text-ivory/85 border border-[color:var(--color-graphite)] text-[11px]',
                isFolded && 'opacity-35',
              )}
              style={
                isHero
                  ? { boxShadow: '0 0 0 4px rgba(212,175,55,0.18), 0 4px 14px rgba(0,0,0,0.4)' }
                  : undefined
              }
            >
              {seat}
              {isFolded && (
                <span
                  aria-hidden
                  className="absolute inset-x-1 top-1/2 h-[1px] -translate-y-1/2 rotate-[18deg] bg-[color:var(--color-raise)]"
                />
              )}
            </div>

            {/* chip marker for BTN / SB / BB */}
            {(showButton && seat === 'BTN') || (showBlinds && (seat === 'SB' || seat === 'BB')) ? (
              <div
                className={cn(
                  'absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full px-1.5 py-[1px] font-mono text-[9px] font-bold',
                  seat === 'BTN' && 'bg-ivory text-noir',
                  seat === 'SB' && 'bg-[color:var(--color-gold)]/85 text-noir',
                  seat === 'BB' && 'bg-[color:var(--color-gold)] text-noir',
                )}
                aria-hidden
              >
                {seat === 'BTN' ? 'D' : seat}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Place seats along an ellipse, starting from bottom-center (hero's usual
 * seat in a poker UI) and going clockwise.
 */
function seatPosition(index: number, total: number): { x: number; y: number } {
  const offset = Math.PI / 2; // start at bottom
  const angle = offset + (index / total) * Math.PI * 2;
  const cx = 50;
  const cy = 52;
  const rx = 42;
  const ry = 36;
  const x = cx + rx * Math.cos(angle);
  const y = cy + ry * Math.sin(angle);
  return { x, y };
}
