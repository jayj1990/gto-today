'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AnswerGrade, TrainingSpot } from '@gto/gto-data';

export interface AnswerRecord {
  readonly spotId: string;
  readonly answer: 'raise' | 'fold';
  readonly grade: AnswerGrade;
  readonly at: number; // epoch ms
}

interface ChallengeState {
  /** ISO date string this session belongs to (e.g. "2026-04-19"). */
  dateKey: string;
  /** Cached spots for the day. */
  spots: TrainingSpot[];
  /** Index of the next spot to play (0..spots.length). */
  cursor: number;
  /** Answers logged in order. */
  answers: AnswerRecord[];
  /** Longest ever streak (consecutive days completed). */
  bestStreak: number;
  /** Current streak — rolls over when user plays on consecutive days. */
  currentStreak: number;
  /** Last completed ISO date, used to compute streak continuity. */
  lastCompletedDate: string | null;

  /** Start (or resume) a day — no-op if already started for `dateKey`. */
  startDay: (dateKey: string, spots: TrainingSpot[]) => void;
  /** Submit an answer for the current spot. */
  submit: (answer: 'raise' | 'fold', grade: AnswerGrade) => void;
  /** Advance past the current result modal to the next spot. */
  advance: () => void;
  /** Mark today complete and update streak. */
  completeDay: () => void;
  /** Wipe session (debug / "start over"). */
  reset: () => void;
}

function daysBetween(a: string, b: string): number {
  const ms = Date.parse(b) - Date.parse(a);
  return Math.round(ms / 86_400_000);
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      dateKey: '',
      spots: [],
      cursor: 0,
      answers: [],
      bestStreak: 0,
      currentStreak: 0,
      lastCompletedDate: null,

      startDay: (dateKey, spots) => {
        const state = get();
        if (state.dateKey === dateKey && state.spots.length > 0) return;
        set({ dateKey, spots, cursor: 0, answers: [] });
      },

      submit: (answer, grade) => {
        const { spots, cursor, answers } = get();
        const current = spots[cursor];
        if (!current) return;
        const record: AnswerRecord = { spotId: current.id, answer, grade, at: Date.now() };
        set({ answers: [...answers, record] });
      },

      advance: () => {
        set((s) => ({ cursor: Math.min(s.cursor + 1, s.spots.length) }));
      },

      completeDay: () => {
        const { dateKey, lastCompletedDate, currentStreak, bestStreak } = get();
        if (!dateKey || lastCompletedDate === dateKey) return;
        let nextStreak = 1;
        if (lastCompletedDate) {
          const gap = daysBetween(lastCompletedDate, dateKey);
          if (gap === 1) nextStreak = currentStreak + 1;
          else if (gap === 0) nextStreak = currentStreak; // same day, shouldn't happen
        }
        set({
          currentStreak: nextStreak,
          bestStreak: Math.max(bestStreak, nextStreak),
          lastCompletedDate: dateKey,
        });
      },

      reset: () => set({ dateKey: '', spots: [], cursor: 0, answers: [] }),
    }),
    {
      name: 'gto.challenge',
      storage: createJSONStorage(() => localStorage),
      // Only persist streak + progress — spot data regenerates deterministically.
      partialize: (state) => ({
        dateKey: state.dateKey,
        cursor: state.cursor,
        answers: state.answers,
        bestStreak: state.bestStreak,
        currentStreak: state.currentStreak,
        lastCompletedDate: state.lastCompletedDate,
      }),
      version: 1,
    },
  ),
);
