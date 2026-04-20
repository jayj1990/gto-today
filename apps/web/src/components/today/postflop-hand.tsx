'use client';

import { motion } from 'framer-motion';
import { CardView, PokerTable, cn, type SeatState } from '@gto/ui';
import type { Format, Seat } from '@gto/ui';
import type { PostflopSpot } from '@gto/gto-data';

export interface PostflopHandProps {
  spot: PostflopSpot;
  className?: string;
}

const STREET_LABEL: Record<PostflopSpot['street'], string> = {
  flop: '플랍',
  turn: '턴',
  river: '리버',
};

const POT_LABEL: Record<PostflopSpot['context']['potType'], string> = {
  srp: 'SRP',
  '3bp': '3-bet 팟',
  '4bp': '4-bet 팟',
  limped: '림프',
};

/**
 * Postflop hand visualizer — reuses PokerTable from @gto/ui but configures
 * seats for a heads-up postflop scene: only hero + villain active, all
 * other seats folded, pot already built, effective stack reduced, board
 * cards rendered above the pot.
 */
export function PostflopHand({ spot, className }: PostflopHandProps) {
  const format: Format = '6max';
  const hero = spot.context.heroPos as Seat;
  const villain = spot.context.villainPos as Seat;
  const effStack = spot.context.effStackBB;

  // Build seat states — hero + villain alive, others folded away.
  const order: Seat[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
  const seats: Partial<Record<Seat, SeatState>> = {};
  for (const seat of order) {
    if (seat === hero) {
      seats[seat] = { stack: effStack, showBacks: false };
    } else if (seat === villain) {
      const villainSeat: SeatState =
        spot.facingBetBB > 0
          ? { stack: effStack, showBacks: true, action: { kind: 'bet', bb: spot.facingBetBB } }
          : { stack: effStack, showBacks: true };
      seats[seat] = villainSeat;
    } else {
      seats[seat] = {
        stack: effStack,
        action: { kind: 'fold' },
        showBacks: false,
      };
    }
  }

  const [h1, h2] = spot.hero;

  return (
    <motion.div
      key={spot.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={cn(
        'rounded-[var(--radius-panel)] border-hair surface px-3 pt-4 pb-5 sm:px-5 sm:pt-5 sm:pb-6',
        className,
      )}
    >
      {/* Context ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
          {STREET_LABEL[spot.street]} · {POT_LABEL[spot.context.potType]}
        </span>
        <div className="flex items-center gap-1.5">
          <Pill>{spot.context.heroPos}</Pill>
          <Pill>SPR {spot.context.spr.toFixed(1)}</Pill>
          <Pill tone="accent">팟 {spot.context.potBB}BB</Pill>
        </div>
      </div>

      <p className="mt-2 text-[12px] text-fg-muted">{spot.context.preflopSummary}</p>

      {/* Table with heads-up layout */}
      <div className="mt-4">
        <PokerTable
          format={format}
          hero={hero}
          toAct={hero}
          seats={seats}
          heroCards={[h1, h2]}
          pot={spot.context.potBB}
          effectiveStack={effStack}
          lastBet={spot.facingBetBB > 0 ? spot.facingBetBB : undefined}
          renderCard={(code, size) => {
            const rank = code.charAt(0);
            const suit = code.charAt(1) as 's' | 'h' | 'd' | 'c';
            return <CardView rank={rank} suit={suit} size={size} deckScheme="four-color" />;
          }}
        />
      </div>

      {/* Board cards — rendered below the table since PokerTable doesn't
          know about community cards. */}
      <div className="mt-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
          보드
        </p>
        <div className="flex gap-1.5">
          {spot.board.map((code, i) => {
            const rank = code.charAt(0);
            const suit = code.charAt(1) as 's' | 'h' | 'd' | 'c';
            return <CardView key={i} rank={rank} suit={suit} size="md" deckScheme="four-color" />;
          })}
        </div>
      </div>

      {/* Facing-action hint */}
      <p className="mt-4 text-center text-[13px] text-fg-muted">
        {spot.facingBetBB > 0 ? (
          <>
            <span className="text-fg/80">{villain}</span> {spot.facingBetBB.toFixed(1)}BB 벳 — 당신 차례.
          </>
        ) : (
          <>체크가 돌아왔어요 — 당신 차례.</>
        )}
      </p>
    </motion.div>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone?: 'accent' }) {
  return (
    <span
      className={cn(
        'rounded-full border px-2.5 py-[3px] font-mono text-[11px] tracking-[0.06em]',
        tone === 'accent'
          ? 'border-[color:var(--color-accent)]/50 bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)]'
          : 'border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] text-fg',
      )}
    >
      {children}
    </span>
  );
}
