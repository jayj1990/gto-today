import { describe, expect, it } from 'vitest';
import type { TrainingSpot } from '@gto/gto-data';
import { buildSeats } from './build-seats';

/**
 * Regression battery for the quiz-table reconstruction. Each test
 * pins down a scenario that previously rendered wrong because
 * buildSeats branched on scenario name. If a new scenario is added
 * and the generic preActions replay is bypassed, at least one of
 * these will fail.
 */

function baseSpot(overrides: Partial<TrainingSpot>): TrainingSpot {
  return {
    id: 'test',
    combo: '88',
    hero: ['8h', '8d'],
    position: 'BB',
    format: '6max',
    stackBB: 100,
    scenario: 'rfi',
    gtoRaise: 0,
    gtoFold: 1,
    correctAnswer: 'fold',
    availableActions: ['fold'],
    ...overrides,
  } as TrainingSpot;
}

describe('buildSeats', () => {
  it('RFI: every seat before hero folds, no preActions needed', () => {
    const { seats, foldedSeats, pot, lastBet } = buildSeats(
      baseSpot({ position: 'BTN', scenario: 'rfi' }),
    );
    expect(foldedSeats).toEqual(['UTG', 'MP', 'CO']);
    expect(seats.UTG?.action?.kind).toBe('fold');
    expect(seats.SB?.action?.kind).toBe('post');
    expect(seats.BB?.action?.kind).toBe('post');
    expect(pot).toBe(1.5);
    expect(lastBet).toBe(1);
  });

  it('vs_open legacy (no preActions): folds before opener, opener raises', () => {
    const { seats, foldedSeats, pot, lastBet } = buildSeats(
      baseSpot({
        position: 'BB',
        scenario: 'vs_open',
        opener: 'CO',
        openSize: 2.5,
      }),
    );
    expect(seats.CO?.action).toEqual({ kind: 'raise', bb: 2.5 });
    // Seats before opener + seats between opener and hero all fold
    // (SB is included because it's the legacy path; BB is hero).
    expect(foldedSeats).toEqual(['UTG', 'MP', 'BTN', 'SB']);
    expect(pot).toBe(4);
    expect(lastBet).toBe(2.5);
  });

  it('vs_3bet: MP opens 2.5bb, CO 3bets 8.5bb, hero BB faces 3bet', () => {
    // This was the exact spot that rendered as "all fold" before the
    // generic replay fix.
    const { seats, foldedSeats, pot, lastBet } = buildSeats(
      baseSpot({
        position: 'BB',
        scenario: 'vs_3bet',
        preActions: [
          { actor: 'MP', action: '2.5bb' },
          { actor: 'CO', action: '8.5bb' },
        ],
      }),
    );
    expect(seats.MP?.action).toEqual({ kind: 'raise', bb: 2.5 });
    expect(seats.CO?.action).toEqual({ kind: 'raise', bb: 8.5 });
    expect(foldedSeats).toEqual(expect.arrayContaining(['UTG']));
    expect(foldedSeats).not.toContain('MP');
    expect(foldedSeats).not.toContain('CO');
    expect(pot).toBe(1.5 + 2.5 + 8.5);
    expect(lastBet).toBe(8.5);
  });

  it('vs_4bet: opener re-raises over a 3bet, size escalates', () => {
    const { seats, pot, lastBet } = buildSeats(
      baseSpot({
        position: 'CO',
        scenario: 'vs_4bet',
        preActions: [
          { actor: 'CO', action: '2.5bb' },
          { actor: 'BTN', action: '8.5bb' },
          { actor: 'CO', action: '21bb' },
        ],
      }),
    );
    expect(seats.BTN?.action).toEqual({ kind: 'raise', bb: 8.5 });
    // Final CO action should be the 21bb 4bet (later override wins)
    expect(seats.CO?.action).toEqual({ kind: 'raise', bb: 21 });
    expect(lastBet).toBe(21);
    // CO contributes 2.5, then tops up to 21 (+18.5). BTN contributes 8.5.
    expect(pot).toBe(1.5 + 21 + 8.5);
  });

  it('vs_squeeze: opener, caller, then squeezer', () => {
    const { seats, foldedSeats, pot, lastBet } = buildSeats(
      baseSpot({
        position: 'CO',
        scenario: 'vs_squeeze',
        preActions: [
          { actor: 'UTG', action: '2.5bb' },
          { actor: 'MP', action: 'Call' },
          { actor: 'BTN', action: '11bb' },
        ],
      }),
    );
    expect(seats.UTG?.action).toEqual({ kind: 'raise', bb: 2.5 });
    expect(seats.MP?.action).toEqual({ kind: 'call', bb: 2.5 });
    expect(seats.BTN?.action).toEqual({ kind: 'raise', bb: 11 });
    expect(foldedSeats).not.toContain('UTG');
    expect(foldedSeats).not.toContain('MP');
    expect(lastBet).toBe(11);
    // 1.5 (blinds) + 2.5 (open) + 2.5 (call) + 11 (squeeze from facing 2.5)
    expect(pot).toBe(1.5 + 2.5 + 2.5 + 11);
  });

  it('vs_allin: opener shoves, hero facing the shove', () => {
    const { seats, lastBet } = buildSeats(
      baseSpot({
        position: 'BB',
        scenario: 'vs_allin',
        stackBB: 20,
        preActions: [{ actor: 'SB', action: 'AllIn' }],
      }),
    );
    expect(seats.SB?.action).toEqual({ kind: 'raise', bb: 20 });
    expect(seats.SB?.stack).toBe(0);
    expect(lastBet).toBe(20);
  });

  it('hero seat never shows card backs', () => {
    const { seats } = buildSeats(baseSpot({ position: 'BTN', scenario: 'rfi' }));
    expect(seats.BTN?.showBacks).toBe(false);
  });

  it('never contradicts preActions — raisers are NOT rendered as folded', () => {
    // Guard against any future branch that marks acted seats as folded.
    const { seats, foldedSeats } = buildSeats(
      baseSpot({
        position: 'BB',
        scenario: 'vs_3bet',
        preActions: [
          { actor: 'MP', action: '2.5bb' },
          { actor: 'CO', action: '8.5bb' },
        ],
      }),
    );
    for (const pre of [{ actor: 'MP' }, { actor: 'CO' }] as const) {
      expect(seats[pre.actor]?.action?.kind).not.toBe('fold');
      expect(foldedSeats).not.toContain(pre.actor);
    }
  });
});
