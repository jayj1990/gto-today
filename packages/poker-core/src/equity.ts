import type { EquityResult } from './types.js';

/**
 * Placeholder for Monte Carlo equity calculation.
 * Real implementation lives in apps/web/src/workers/equity.worker.ts (Phase 3),
 * using pokersolver + a typed-array RNG. This export exists so consumers can
 * import the type contract before Phase 3.
 */
export interface EquityRequest {
  readonly heroCards: readonly [string, string];
  readonly villainRange: readonly string[];
  readonly board: readonly string[];
  readonly iterations: number;
}

export type EquityWorkerFn = (req: EquityRequest) => Promise<EquityResult>;
