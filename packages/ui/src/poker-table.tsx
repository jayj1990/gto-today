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
  | { kind: 'post'; bb: number }; // blind

export interface PokerTableProps extends HTMLAttributes<HTMLDivElement> {
  format?: Format;
  hero?: Seat;
  /** Per-seat action history. Keyed by seat. Omitted seats are "yet to act". */
  actions?: Partial<Record<Seat, SeatAction>>;
  /** Content (typically two cards) anchored to the right of the hero chip. */
  heroContent?: ReactNode;
  /** Content at the center of the table — e.g. "Preflop · Pot 2.5BB". */
  centerContent?: ReactNode;
  /** Show D / SB / BB markers under the respective seats. Defaults true. */
  showMarkers?: boolean;
}

const SEATS: Record<Format, Seat[]> = {
  '6max': ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'],
  '9max': ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  '10max': ['UTG', 'UTG1', 'UTG2', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
  '11max': ['UTG', 'UTG1', 'UTG2', 'UTG3', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
};

/**
 * GTO-Wizard-inspired overhead poker table.
 *
 * - Flat ellipse outline (no filled felt) keeps seat labels readable.
 * - Hero seat: gold chip + `heroContent` (hole cards) rendered inline so
 *   the player sees their hand right where it would be at a real table.
 * - Other seats: quiet pill labels. If an action is supplied via `actions`,
 *   a color-coded chip below the seat shows fold / call / raise / post.
 * - Seats still to act (no action entry) glow faintly so the flow reads
 *   left-to-right.
 */
export function PokerTable({
  format = '6max',
  hero,
  actions = {},
  heroContent,
  centerContent,
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
      style={{ aspectRatio: '16 / 10', minHeight: 240, ...style }}
      role="img"
      aria-label={`${format} poker table${hero ? ` — hero on ${hero}` : ''}`}
      {...rest}
    >
      <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full" aria-hidden>
        <ellipse
          cx="160"
          cy="100"
          rx="150"
          ry="86"
          fill="rgba(14, 59, 46, 0.15)"
          stroke="rgba(255, 255, 255, 0.14)"
          strokeWidth="1.2"
        />
        <ellipse
          cx="160"
          cy="100"
          rx="126"
          ry="66"
          fill="none"
          stroke="rgba(212, 175, 55, 0.1)"
          strokeWidth="0.8"
        />
      </svg>

      {centerContent && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="pointer-events-auto">{centerContent}</div>
        </div>
      )}

      {seats.map((seat, i) => {
        const { x, y } = seatPosition(i, count);
        const isHero = seat === hero;
        const action = actions[seat];
        const isFolded = action?.kind === 'fold';
        const yetToAct = !isHero && !action;
        const marker =
          showMarkers && (seat === 'BTN' ? 'D' : seat === 'SB' ? 'SB' : seat === 'BB' ? 'BB' : null);

        return (
          <div
            key={seat}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {isHero ? (
              <HeroSeat seat={seat} heroContent={heroContent} />
            ) : (
              <VillainSeat seat={seat} action={action} isFolded={isFolded} yetToAct={yetToAct} />
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

function HeroSeat({ seat, heroContent }: { seat: Seat; heroContent: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-gradient font-mono text-[11px] font-bold text-noir"
        style={{ boxShadow: '0 0 0 3px var(--color-gold), 0 0 18px rgba(212,175,55,0.55)' }}
      >
        {seat}
        <span
          aria-hidden
          className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[color:var(--color-gold)] px-1.5 py-[1px] text-[9px] font-bold text-noir"
        >
          나
        </span>
      </div>
      {heroContent}
    </div>
  );
}

function VillainSeat({
  seat,
  action,
  isFolded,
  yetToAct,
}: {
  seat: Seat;
  action: SeatAction | undefined;
  isFolded: boolean;
  yetToAct: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'relative flex h-8 min-w-[2.5rem] items-center justify-center rounded-full border px-2 font-mono text-[11px] tracking-[0.04em] transition-colors',
          isFolded
            ? 'border-[color:var(--color-border)] text-fg-muted/60 opacity-40'
            : yetToAct
              ? 'border-[color:var(--color-accent)]/60 text-fg'
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
      {action && action.kind !== 'fold' && <ActionChip action={action} />}
    </div>
  );
}

function ActionChip({ action }: { action: SeatAction }) {
  if (action.kind === 'fold') return null;
  const { color, label } = actionStyle(action);
  return (
    <span
      className="rounded-full px-1.5 py-[1px] font-mono text-[9px] font-semibold"
      style={{ background: color, color: 'var(--color-noir)' }}
    >
      {label}
    </span>
  );
}

function actionStyle(action: Exclude<SeatAction, { kind: 'fold' }>): {
  color: string;
  label: string;
} {
  switch (action.kind) {
    case 'raise':
      return { color: 'var(--color-raise)', label: `${action.bb}BB` };
    case '3bet':
      return { color: 'var(--color-warning)', label: `3BET ${action.bb}BB` };
    case 'call':
      return { color: 'var(--color-call)', label: `${action.bb}BB` };
    case 'check':
      return { color: 'var(--color-info)', label: 'CHECK' };
    case 'post':
      return { color: 'var(--color-gold-soft)', label: `${action.bb}BB` };
  }
}

/** Ellipse placement — start bottom-center (hero), go clockwise. */
function seatPosition(index: number, total: number): { x: number; y: number } {
  const offset = Math.PI / 2;
  const angle = offset + (index / total) * Math.PI * 2;
  const cx = 50;
  const cy = 50;
  const rx = 46;
  const ry = 38;
  const x = cx + rx * Math.cos(angle);
  const y = cy + ry * Math.sin(angle);
  return { x, y };
}
