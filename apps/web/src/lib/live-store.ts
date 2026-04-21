'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TableFormat } from '@gto/poker-core';

export type GameType = 'cash' | 'mtt';
export type StackSetting = number | 'any';
export type OpenSetting = number | 'any' | 'gto';

export interface CashConfig {
  readonly rakePct: number;
  readonly rakeCapBB: number;
  readonly ante: 'none' | 'bb-ante' | 'straddle';
}

/**
 * Tournament-specific settings. Note: the BB ante is intentionally not a
 * user-facing knob — modern solver output (GTO Wizard, PioSolver MTT
 * bundles, etc.) bakes a 1BB ante into the MTT solutions, so exposing it
 * would only confuse players while not changing the displayed ranges.
 */
export interface MttConfig {
  readonly format: 'chipEV' | 'ICM';
  /** Only applied when format === 'ICM'. 1.0 = chipEV-equivalent, higher = bubble pressure. */
  readonly bubbleFactor: number;
}

export interface LiveConfig {
  readonly gameType: GameType;
  readonly format: TableFormat;
  /** Stack depth in BB, or 'any' to aggregate across depths. */
  readonly stackBB: StackSetting;
  /** Open size: a literal BB value, 'any' (aggregate), or 'gto' (let solver pick). */
  readonly openSize: OpenSetting;
  readonly cash: CashConfig;
  readonly mtt: MttConfig;
}

interface LiveStore {
  config: LiveConfig;
  setGameType: (type: GameType) => void;
  setFormat: (format: TableFormat) => void;
  setStackBB: (stack: StackSetting) => void;
  setOpenSize: (size: OpenSetting) => void;
  setCash: (update: Partial<CashConfig>) => void;
  setMtt: (update: Partial<MttConfig>) => void;
  reset: () => void;
}

const DEFAULTS: LiveConfig = {
  gameType: 'mtt',
  format: '6max',
  stackBB: 100,
  openSize: 'gto',
  cash: {
    rakePct: 0.05,
    rakeCapBB: 3,
    ante: 'none',
  },
  mtt: {
    format: 'chipEV',
    bubbleFactor: 1,
  },
};

export const useLiveStore = create<LiveStore>()(
  persist(
    (set) => ({
      config: DEFAULTS,
      setGameType: (type) => set((s) => ({ config: { ...s.config, gameType: type } })),
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
      version: 2,
    },
  ),
);

/* ─────────────── helpers ─────────────── */

export function stackLabel(s: StackSetting): string {
  return s === 'any' ? 'Any' : `${s}BB`;
}

export function openLabel(o: OpenSetting): string {
  if (o === 'any') return 'Any';
  if (o === 'gto') return 'GTO';
  return `${o}x`;
}

export function resolveStackBB(s: StackSetting): number {
  return s === 'any' ? 100 : s;
}

export function resolveOpenSize(o: OpenSetting): number {
  if (o === 'any' || o === 'gto') return 2.5;
  return o;
}
