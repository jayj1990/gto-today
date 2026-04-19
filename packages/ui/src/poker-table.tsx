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
  // Only BTN gets a dealer-button marker. SB / BB positions already read
  // "SB" / "BB" on the chip itself — adding "S" / "B" badges next to them
  // was redundant and invisible on dark backgrounds.
  const isDealer = showMarker && seat === 'BTN';
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <PositionChip
          seat={seat}
          stack={stack}
          variant={isFolded ? 'folded' : isToAct ? 'toAct' : 'idle'}
        />
        {isDealer && (
          <span
            title="딜러"
            aria-label="딜러"
            className="absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-ivory font-mono text-[10px] font-bold text-noir shadow-[0_2px_6px_rgba(0,0,0,0.6)] ring-1 ring-black/20"
          >
            D
          </span>
        )}
      </div>
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
  // Solid near-black fill (not semi-transparent) so the chip reads as a
  // distinct object against the dark table background instead of floating
  // text. In light mode the same classes still flip correctly via CSS vars.
  const fill = 'rgb(28, 28, 32)';
  const border =
    variant === 'hero'
      ? '2.5px solid var(--color-call)'
      : variant === 'toAct'
        ? '2px solid var(--color-warning)'
        : '1.5px solid rgba(255,255,255,0.22)';
  const shadow =
    variant === 'hero'
      ? '0 0 0 1px rgba(31,157,85,0.4), 0 4px 14px rgba(0,0,0,0.5), 0 0 18px rgba(31,157,85,0.28)'
      : variant === 'toAct'
        ? '0 4px 14px rgba(0,0,0,0.5), 0 0 14px rgba(230,168,23,0.4)'
        : '0 3px 10px rgba(0,0,0,0.45)';

  return (
    <div
      className={cn(
        'relative flex h-[52px] w-[52px] flex-col items-center justify-center rounded-full font-mono',
        'transition-colors',
      )}
      style={{
        background: fill,
        border,
        boxShadow: shadow,
        opacity: variant === 'folded' ? 0.4 : 1,
      }}
    >
      <span
        className={cn(
          'font-mono text-[10px] font-semibold leading-none tracking-[0.06em]',
          variant === 'hero'
            ? 'text-[color:var(--color-call)]'
            : variant === 'toAct'
              ? 'text-[color:var(--color-warning)]'
              : 'text-ivory/75',
        )}
      >
        {seat}
      </span>
      {stack !== undefined && (
        <span className="mt-0.5 font-mono text-[13px] font-bold leading-none text-ivory">
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

/**
 * Real-casino-chip look for betting: radial gradient + inner ring + drop
 * shadow so the chip reads as a physical object sitting on the felt.
 * Blind posts use a muted variant so they recede — a player should feel
 * that SB/BB posts are *ambient* and raises are *events*.
 */
function ActionChip({ action }: { action: SeatAction }) {
  if (action.kind === 'fold') return null;
  const style = chipStyle(action);
  const isBlind = action.kind === 'post';
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          'flex items-center justify-center rounded-full text-[9px] font-bold font-mono tabular-nums',
          isBlind ? 'h-4 w-4' : 'h-6 w-6',
        )}
        style={{
          background: style.gradient,
          color: style.textColor,
          border: `1px solid ${style.rim}`,
          boxShadow: isBlind
            ? '0 1px 3px rgba(0,0,0,0.4)'
            : '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      >
        {isBlind ? '' : '●'}
      </div>
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
  textColor: string;
  label: string;
} {
  switch (action.kind) {
    case 'raise':
    case 'bet':
      return {
        gradient: 'radial-gradient(circle at 35% 30%, #E23B56, #C8102E 60%, #7F0A1B)',
        rim: 'rgba(255,255,255,0.25)',
        textColor: 'rgba(255,255,255,0.95)',
        label: `${action.bb} BB`,
      };
    case '3bet':
      return {
        gradient: 'radial-gradient(circle at 35% 30%, #F0C857, #D4AF37 60%, #8C6F1F)',
        rim: 'rgba(255,255,255,0.3)',
        textColor: 'var(--color-noir)',
        label: `3BET ${action.bb}`,
      };
    case 'call':
      return {
        gradient: 'radial-gradient(circle at 35% 30%, #2EBE6F, #1F9D55 60%, #0F5D33)',
        rim: 'rgba(255,255,255,0.25)',
        textColor: 'rgba(255,255,255,0.95)',
        label: `${action.bb} BB`,
      };
    case 'check':
      return {
        gradient: 'radial-gradient(circle at 35% 30%, #6FB2FF, #4A9EFF 60%, #1E6BCC)',
        rim: 'rgba(255,255,255,0.25)',
        textColor: 'rgba(255,255,255,0.95)',
        label: 'CHECK',
      };
    case 'post':
      // Muted grey so blinds recede visually.
      return {
        gradient: 'linear-gradient(160deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
        rim: 'rgba(255,255,255,0.18)',
        textColor: 'var(--color-fg-muted)',
        label: `${action.bb} BB`,
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
