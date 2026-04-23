import type { TrainingSpot } from '@gto/gto-data';
import { POSITIONS_BY_FORMAT } from '@gto/poker-core';
import type { Format, Seat, SeatState } from '@gto/ui';

export interface BuildSeatsResult {
  seats: Partial<Record<Seat, SeatState>>;
  foldedSeats: Seat[];
  pot: number;
  lastBet: number;
}

/**
 * Reconstruct a seat map from a TrainingSpot so the poker-table view
 * matches the pre-action trace.
 *
 * Pure function — no React, no motion, no DOM. Lives here instead of
 * inside hand-card.tsx so we can regression-test every scenario
 * without mounting the component.
 *
 * The scenario field is NOT used to pick the reconstruction strategy.
 * Any spot carrying preActions is replayed generically — that keeps
 * vs_3bet / vs_4bet / vs_squeeze / vs_allin from silently falling
 * through to "all fold" when a new scenario is added to the union.
 */
export function buildSeats(spot: TrainingSpot): BuildSeatsResult {
  const order = POSITIONS_BY_FORMAT[spot.format as Format];
  const out: Partial<Record<Seat, SeatState>> = {};
  const stack = spot.stackBB;

  for (const seat of order) {
    out[seat as Seat] = { stack, showBacks: true };
  }

  out['SB'] = { stack: stack - 0.5, action: { kind: 'post', bb: 0.5 }, showBacks: true };
  out['BB'] = { stack: stack - 1, action: { kind: 'post', bb: 1 }, showBacks: true };

  const foldedSeats: Seat[] = [];
  let pot = 1.5;
  let lastBet = 1;

  const heroIdx = order.indexOf(spot.position);

  if (spot.preActions && spot.preActions.length > 0) {
    const acted = new Set<string>();
    // Per-actor contribution — SB/BB have posts pre-loaded so the
    // incremental pot math stays correct when they later act.
    const contributed = new Map<Seat, number>([
      ['SB', 0.5],
      ['BB', 1],
    ]);
    let runningPot = 1.5;
    let facing = 1;

    const addContribution = (seat: Seat, total: number): number => {
      const prev = contributed.get(seat) ?? 0;
      const delta = total - prev;
      contributed.set(seat, total);
      return delta;
    };

    for (const pre of spot.preActions) {
      const seat = pre.actor as Seat;
      acted.add(seat);
      if (pre.action === 'FOLD') {
        out[seat] = { stack, action: { kind: 'fold' }, showBacks: false };
        foldedSeats.push(seat);
        continue;
      }
      if (pre.action === 'Call') {
        out[seat] = {
          stack: stack - facing,
          action: { kind: 'call', bb: facing },
          showBacks: true,
        };
        runningPot += addContribution(seat, facing);
        continue;
      }
      if (pre.action === 'AllIn') {
        out[seat] = {
          stack: 0,
          action: { kind: 'raise', bb: stack },
          showBacks: true,
        };
        runningPot += addContribution(seat, stack);
        facing = stack;
        continue;
      }
      const m = pre.action.match(/^([\d.]+)bb$/);
      if (m) {
        const size = parseFloat(m[1]!);
        out[seat] = {
          stack: stack - size,
          action: { kind: 'raise', bb: size },
          showBacks: true,
        };
        runningPot += addContribution(seat, size);
        facing = size;
      }
    }

    for (let i = 0; i < heroIdx; i++) {
      const seat = order[i] as Seat;
      if (acted.has(seat)) continue;
      if (seat === 'SB' || seat === 'BB') continue;
      out[seat] = { stack, action: { kind: 'fold' }, showBacks: false };
      foldedSeats.push(seat);
    }
    pot = runningPot;
    lastBet = facing;
  } else if (spot.scenario === 'vs_open' && spot.opener) {
    // Legacy path for defense charts (bb_vs_CO.json etc.) that don't
    // carry preActions.
    const openSize = spot.openSize ?? 2.5;
    const openerIdx = order.indexOf(spot.opener);

    for (let i = 0; i < openerIdx; i++) {
      const seat = order[i] as Seat;
      if (seat === 'BB') continue;
      out[seat] = { stack, action: { kind: 'fold' }, showBacks: false };
      foldedSeats.push(seat);
    }
    const openerSeat = spot.opener as Seat;
    out[openerSeat] = {
      stack: stack - openSize,
      action: { kind: 'raise', bb: openSize },
      showBacks: true,
    };
    pot = 1.5 + openSize;
    lastBet = openSize;
    for (let i = openerIdx + 1; i < heroIdx; i++) {
      const seat = order[i] as Seat;
      if (seat === 'BB') continue;
      out[seat] = { stack, action: { kind: 'fold' }, showBacks: false };
      foldedSeats.push(seat);
    }
  } else {
    for (let i = 0; i < heroIdx; i++) {
      const seat = order[i] as Seat;
      if (seat === 'SB' || seat === 'BB') continue;
      out[seat] = { stack, action: { kind: 'fold' }, showBacks: false };
      foldedSeats.push(seat);
    }
  }

  out[spot.position as Seat] = { ...(out[spot.position as Seat] ?? {}), showBacks: false };

  return { seats: out, foldedSeats, pot, lastBet };
}
