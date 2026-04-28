'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * /sim session counters — sharp / acceptable / wrong tallies for the
 * infinite-drill mode. Persisted so navigating to /review or any other
 * page and back doesn't reset the user's progress.
 *
 * Why a dedicated store instead of in-component useState: /sim is the
 * "endless practice" surface, and a session can run hundreds of hands
 * over an evening. Dropping the count on every navigation events
 * (intentional, like "view this mistake") was breaking the gamification
 * loop — users would lose their accuracy meter mid-grind.
 */
interface SimStore {
  sharp: number;
  acceptable: number;
  wrong: number;
  /** Epoch ms of the last reset / first answer in the current session. */
  startedAt: number | null;
  /** Epoch ms of the most recent answer. Used for idle detection. */
  lastAnsweredAt: number | null;

  recordSharp: () => void;
  recordAcceptable: () => void;
  recordWrong: () => void;
  /** Used by retry — undo the last increment without losing session age. */
  undoLast: (grade: 'sharp' | 'acceptable' | 'wrong') => void;
  reset: () => void;
}

const INITIAL = {
  sharp: 0,
  acceptable: 0,
  wrong: 0,
  startedAt: null,
  lastAnsweredAt: null,
};

export const useSimStore = create<SimStore>()(
  persist(
    (set) => ({
      ...INITIAL,
      recordSharp: () =>
        set((s) => ({
          sharp: s.sharp + 1,
          startedAt: s.startedAt ?? Date.now(),
          lastAnsweredAt: Date.now(),
        })),
      recordAcceptable: () =>
        set((s) => ({
          acceptable: s.acceptable + 1,
          startedAt: s.startedAt ?? Date.now(),
          lastAnsweredAt: Date.now(),
        })),
      recordWrong: () =>
        set((s) => ({
          wrong: s.wrong + 1,
          startedAt: s.startedAt ?? Date.now(),
          lastAnsweredAt: Date.now(),
        })),
      undoLast: (grade) =>
        set((s) => ({
          sharp: grade === 'sharp' ? Math.max(0, s.sharp - 1) : s.sharp,
          acceptable: grade === 'acceptable' ? Math.max(0, s.acceptable - 1) : s.acceptable,
          wrong: grade === 'wrong' ? Math.max(0, s.wrong - 1) : s.wrong,
        })),
      reset: () => set(INITIAL),
    }),
    {
      name: 'gto.sim',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
