'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TableFormat } from '@gto/poker-core';

export type GameType = 'cash' | 'mtt';

/** Cash game specific settings. */
export interface CashConfig {
  readonly rakePct: number; // 0–0.10
  readonly rakeCapBB: number; // e.g. 3BB
  readonly ante: 'none' | 'bb-ante' | 'straddle';
}

/** Tournament specific settings. */
export interface MttConfig {
  readonly anteBB: number; // 0 = off, common 0.125 / 0.25
  readonly icmAwareness: boolean;
  readonly bubbleFactor: number; // 1.0 = chipEV, >1.0 more ICM pressure
}

export interface LiveConfig {
  readonly gameType: GameType;
  readonly format: TableFormat;
  readonly stackBB: number;
  readonly openSize: number; // default open size in BB
  readonly cash: CashConfig;
  readonly mtt: MttConfig;
}

interface LiveStore {
  config: LiveConfig;
  setGameType: (type: GameType) => void;
  setFormat: (format: TableFormat) => void;
  setStackBB: (stack: number) => void;
  setOpenSize: (size: number) => void;
  setCash: (update: Partial<CashConfig>) => void;
  setMtt: (update: Partial<MttConfig>) => void;
  reset: () => void;
}

const DEFAULTS: LiveConfig = {
  gameType: 'cash',
  format: '6max',
  stackBB: 100,
  openSize: 2.5,
  cash: {
    rakePct: 0.05,
    rakeCapBB: 3,
    ante: 'none',
  },
  mtt: {
    anteBB: 0,
    icmAwareness: false,
    bubbleFactor: 1,
  },
};

export const useLiveStore = create<LiveStore>()(
  persist(
    (set) => ({
      config: DEFAULTS,
      setGameType: (type) =>
        set((s) => ({ config: { ...s.config, gameType: type } })),
      setFormat: (format) => set((s) => ({ config: { ...s.config, format } })),
      setStackBB: (stack) => set((s) => ({ config: { ...s.config, stackBB: stack } })),
      setOpenSize: (size) => set((s) => ({ config: { ...s.config, openSize: size } })),
      setCash: (update) =>
        set((s) => ({ config: { ...s.config, cash: { ...s.config.cash, ...update } } })),
      setMtt: (update) =>
        set((s) => ({ config: { ...s.config, mtt: { ...s.config.mtt, ...update } } })),
      reset: () => set({ config: DEFAULTS }),
    }),
    {
      name: 'gto.live',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
