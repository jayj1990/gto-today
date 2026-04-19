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

/** One seat's live info at the moment we render. */
export interface SeatState {
  /** Current stack in BB (after any committed chips for this street). */
  stack?: number;
  /** Most recent action on the current street — drives the bet chip. */
  action?: SeatAction;
  /** Hole cards to reveal (e.g. villain at showdown). */
  cards?: readonly [string, string];
}

export interface PokerTableProps extends HTMLAttributes<HTMLDivElement> {
  format?: Format;
  hero?: Seat;
  /** Per-seat runtime state — stack, action, revealed cards. */
  seats?: Partial<Record<Seat, SeatState>>;
  /** The seat that is currently to act. Gets a pulsing accent ring. */
  toAct?: Seat;
  /** Hero's hole cards, rendered inline to the right of the hero chip. */
  heroCards?: readonly [string, string];
  /** Center content (pot / board cards / equity). */
  centerContent?: ReactNode;
  /** Show D / SB / BB micro markers. Defaults true. */
  showMarkers?: boolean;
  /** Render a card for a seat. Consumers pass their own <CardView />. */
  renderCard?: (code: string, size: 'xs' | 'sm') => ReactNode;
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
 * Every seat is a *circular* chip with two stacked lines:
 *   POSITION  (top, small caps)
 *   STACK     (bottom, bold monospace)
 * Border color tells the story:
 *   • hero  → thick teal/green ring + gold badge
 *   • to-act → orange ring
 *   • folded → heavy dim + strike
 *   • idle   → neutral border
 *
 * Hero hole cards dock inline to the right of the hero chip.
 * Bet chips appear *between* a seat and the pot, on a line toward center.
 */
export function PokerTable({
  format = '6max',
  hero,
  seats: seatStates = {},
  toAct,
  heroCards,
  centerContent,
  showMarkers = true,
  renderCard,
  className,
  style,
  ...rest
}: PokerTableProps) {
  const seats = SEATS[format];
  const count = seats.length;

  return (
    <div
      className={cn('relative w-full', className)}
      style={{ aspectRatio: '16 / 10', minHeight: 260, ...style }}
      role="img"
      aria-label={`${format} table — hero on ${hero ?? '-'}`}
      {...rest}
    >
      {/* Table outline */}
      <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full" aria-hidden>
        <ellipse
          cx="160"
          cy="100"
          rx="150"
          ry="86"
          fill="rgba(14, 59, 46, 0.14)"
          stroke="rgba(255, 255, 255, 0.14)"
          strokeWidth="1.2"
        />
        <ellipse
          cx="160"
          cy="100"
          rx="126"
          ry="66"
          fill="none"
          stroke="rgba(212, 175, 55, 0.08)"
          strokeWidth="0.6"
        />
      </svg>

      {/* Center — pot / board / equity */}
      {centerContent && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: 'auto' }}
        >
          <div className="pointer-events-auto">{centerContent}</div>
        </div>
      )}

      {/* Seats */}
      {seats.map((seat, i) => {
        const { x, y } = seatPosition(i, count);
        const state = seatStates[seat] ?? {};
        const isHero = seat === hero;
        const isFolded = state.action?.kind === 'fold';
        const isToAct = !isHero && seat === toAct;

        // The bet chip lives between this seat and the center of the table.
        const betPos = seatToCenter(x, y, 22);

        return (
          <div key={seat}>
            {/* Bet / action chip */}
            {state.action && state.action.kind !== 'fold' && (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${betPos.x}%`, top: `${betPos.y}%` }}
              >
                <ActionChip action={state.action} />
              </div>
            )}

            {/* Seat chip */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {isHero ? (
                <HeroSeat
                  seat={seat}
                  stack={state.stack}
                  heroCards={heroCards}
                  renderCard={renderCard}
                />
              ) : (
                <VillainSeat
                  seat={seat}
                  stack={state.stack}
                  isFolded={isFolded}
                  isToAct={isToAct}
                  cards={state.cards}
                  renderCard={renderCard}
                  showMarker={showMarkers}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═════════════════════════════ HERO ═════════════════════════════ */

function HeroSeat({
  seat,
  stack,
  heroCards,
  renderCard,
}: {
  seat: Seat;
  stack: number | undefined;
  heroCards: readonly [string, string] | undefined;
  renderCard: PokerTableProps['renderCard'];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <PositionChip seat={seat} stack={stack} variant="hero" />
      {heroCards && renderCard && (
        <div className="flex shrink-0 items-center gap-0.5">
          {renderCard(heroCards[0], 'sm')}
          {renderCard(heroCards[1], 'sm')}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ VILLAIN ═══════════════════════════ */

function VillainSeat({
  seat,
  stack,
  isFolded,
  isToAct,
  cards,
  renderCard,
  showMarker,
}: {
  seat: Seat;
  stack: number | undefined;
  isFolded: boolean;
  isToAct: boolean;
  cards: readonly [string, string] | undefined;
  renderCard: PokerTableProps['renderCard'];
  showMarker: boolean;
}) {
  const marker =
    showMarker && (seat === 'BTN' ? 'D' : seat === 'SB' ? 'SB' : seat === 'BB' ? 'BB' : null);
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <PositionChip
          seat={seat}
          stack={stack}
          variant={isFolded ? 'folded' : isToAct ? 'toAct' : 'idle'}
        />
        {marker && (
          <span
            aria-hidden
            className={cn(
              'absolute -top-1 -left-2 flex h-4 w-4 items-center justify-center rounded-full font-mono text-[8px] font-bold',
              marker === 'D' && 'bg-ivory text-noir',
              marker === 'SB' && 'bg-[color:var(--color-gold)]/85 text-noir',
              marker === 'BB' && 'bg-[color:var(--color-gold)] text-noir',
            )}
          >
            {marker === 'D' ? 'D' : marker === 'SB' ? 'S' : 'B'}
          </span>
        )}
      </div>
      {/* Villain cards (revealed post-showdown) */}
      {cards && renderCard && !isFolded && (
        <div className="flex shrink-0 items-center gap-0.5">
          {renderCard(cards[0], 'xs')}
          {renderCard(cards[1], 'xs')}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ POSITION CHIP ═══════════════════════════ */

function PositionChip({
  seat,
  stack,
  variant,
}: {
  seat: Seat;
  stack: number | undefined;
  variant: 'hero' | 'toAct' | 'folded' | 'idle';
}) {
  return (
    <div
      className={cn(
        'relative flex h-[52px] w-[52px] flex-col items-center justify-center rounded-full font-mono',
        'transition-colors',
        variant === 'hero' && 'bg-[color:var(--color-charcoal)] text-fg',
        variant === 'toAct' && 'bg-[color:var(--color-charcoal)] text-fg',
        variant === 'idle' && 'bg-[color:var(--color-charcoal)]/70 text-fg-muted',
        variant === 'folded' && 'bg-[color:var(--color-charcoal)]/40 text-fg-muted/60',
      )}
      style={{
        border:
          variant === 'hero'
            ? '2.5px solid var(--color-call)'
            : variant === 'toAct'
              ? '2px solid var(--color-warning)'
              : variant === 'folded'
                ? '1px solid var(--color-border)'
                : '1px solid var(--color-border)',
        boxShadow:
          variant === 'hero'
            ? '0 0 0 1px rgba(31,157,85,0.35), 0 0 14px rgba(31,157,85,0.25)'
            : variant === 'toAct'
              ? '0 0 12px rgba(230,168,23,0.35)'
              : undefined,
        opacity: variant === 'folded' ? 0.45 : 1,
      }}
    >
      <span
        className={cn(
          'font-mono text-[10px] leading-none tracking-[0.06em]',
          variant === 'hero' || variant === 'toAct' ? 'text-fg' : 'text-fg-muted',
        )}
      >
        {seat}
      </span>
      {stack !== undefined && (
        <span className="mt-0.5 font-mono text-[13px] font-bold leading-none text-fg">
          {formatStack(stack)}
        </span>
      )}
      {variant === 'folded' && (
        <span
          aria-hidden
          className="absolute inset-x-2 top-1/2 h-[1.2px] -translate-y-1/2 -rotate-12 bg-[color:var(--color-raise)]"
        />
      )}
    </div>
  );
}

function formatStack(stack: number): string {
  if (stack >= 1000) return `${(stack / 1000).toFixed(1)}K`;
  if (stack % 1 !== 0) return stack.toFixed(1);
  return String(stack);
}

/* ═══════════════════════════ ACTION CHIP ═══════════════════════════ */

function ActionChip({ action }: { action: SeatAction }) {
  if (action.kind === 'fold') return null;
  const { color, label, textColor } = actionStyle(action);
  return (
    <span
      className="flex items-center gap-1 rounded-full px-2 py-[2px] font-mono text-[10px] font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
      style={{ background: color, color: textColor }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}

function actionStyle(action: Exclude<SeatAction, { kind: 'fold' }>): {
  color: string;
  textColor: string;
  label: string;
} {
  switch (action.kind) {
    case 'raise':
      return { color: 'var(--color-raise)', textColor: 'white', label: `${action.bb}BB` };
    case '3bet':
      return { color: 'var(--color-warning)', textColor: 'var(--color-noir)', label: `3bet ${action.bb}` };
    case 'call':
      return { color: 'var(--color-call)', textColor: 'white', label: `call ${action.bb}` };
    case 'bet':
      return { color: 'var(--color-raise)', textColor: 'white', label: `${action.bb}BB` };
    case 'check':
      return { color: 'var(--color-info)', textColor: 'white', label: 'check' };
    case 'post':
      return {
        color: 'var(--color-gold-soft)',
        textColor: 'var(--color-noir)',
        label: `${action.bb}BB`,
      };
  }
}

/* ═══════════════════════════ GEOMETRY ═══════════════════════════ */

/** Seat position on the ellipse, starting bottom-center, going clockwise. */
function seatPosition(index: number, total: number): { x: number; y: number } {
  const offset = Math.PI / 2;
  const angle = offset + (index / total) * Math.PI * 2;
  const cx = 50;
  const cy = 50;
  const rx = 46;
  const ry = 40;
  return {
    x: cx + rx * Math.cos(angle),
    y: cy + ry * Math.sin(angle),
  };
}

/** Point between a seat and the center, used for the bet chip. */
function seatToCenter(seatX: number, seatY: number, pullPercent: number): { x: number; y: number } {
  const cx = 50;
  const cy = 50;
  const dx = cx - seatX;
  const dy = cy - seatY;
  const t = pullPercent / 100;
  return { x: seatX + dx * t, y: seatY + dy * t };
}
