'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AnswerGrade,
  GradedAction,
  PostflopAction,
  PostflopSpot,
  TrainingSpot,
} from '@gto/gto-data';

export interface PreflopMistake {
  readonly kind: 'preflop';
  readonly spotId: string;
  readonly dateKey: string;
  readonly userAnswer: GradedAction;
  readonly grade: AnswerGrade;
  readonly at: number;
  /** Snapshot of the spot so the review UI can render without regen. */
  readonly spot: TrainingSpot;
}

export interface PostflopMistake {
  readonly kind: 'postflop';
  readonly spotId: string;
  readonly dateKey: string;
  readonly userAnswer: PostflopAction;
  readonly grade: AnswerGrade;
  readonly at: number;
  readonly spot: PostflopSpot;
}

export type MistakeRecord = PreflopMistake | PostflopMistake;

interface MistakesState {
  mistakes: MistakeRecord[];

  /** Record a mistake. No-op if the same spot is already in the queue
   *  (prevents the same spot flooding the queue on repeated retries). */
  recordMistake: (record: Omit<PreflopMistake, 'at'> | Omit<PostflopMistake, 'at'>) => void;
  /** Mark a mistake as resolved — remove it from the queue. */
  resolveMistake: (kind: 'preflop' | 'postflop', spotId: string) => void;
  /** Clear every stored mistake (debug / reset flow). */
  clearAll: () => void;
}

const MAX_MISTAKES = 200;

export const useMistakesStore = create<MistakesState>()(
  persist(
    (set, get) => ({
      mistakes: [],

      recordMistake: (rec) => {
        const current = get().mistakes;
        const exists = current.some((m) => m.kind === rec.kind && m.spotId === rec.spotId);
        if (exists) return;
        const full = { ...rec, at: Date.now() } as MistakeRecord;
        // Keep the queue bounded — drop oldest when over cap.
        const next = [full, ...current].slice(0, MAX_MISTAKES);
        set({ mistakes: next });
      },

      resolveMistake: (kind, spotId) => {
        set((s) => ({
          mistakes: s.mistakes.filter((m) => !(m.kind === kind && m.spotId === spotId)),
        }));
      },

      clearAll: () => set({ mistakes: [] }),
    }),
    {
      name: 'gto.mistakes',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
