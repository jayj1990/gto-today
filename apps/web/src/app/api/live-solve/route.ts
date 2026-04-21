import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 300; // Vercel Fluid Compute — up to 300s

/**
 * Live postflop solver endpoint.
 *
 * Phase 1 (this file today): mock strategy based on board texture so
 * the UI can be built and tested end-to-end.
 * Phase 2: replace `mockSolve()` with a call into @gto-today/solver-
 * wasm (postflop-solver Rust crate → WASM). The request / response
 * shape is frozen now so the WASM swap is a 1-line change.
 */

export interface SolveRequest {
  /** Three flop cards, e.g. ['As','Kh','7d']. */
  board: [string, string, string];
  /** Pio-style range strings. */
  oopRange: string;
  ipRange: string;
  /** Pot in BB at flop, effective stack in BB. */
  pot: number;
  effStack: number;
  /** 'cash' (no ante) or 'mtt' (ante baked into pot). */
  scenario: 'cash' | 'mtt';
}

export interface SolveResponse {
  /** Action labels in order — matches PostflopAction enum. */
  actions: string[];
  /** Per-169 hand mix across actions. Sums to ~1 per combo. */
  mix: Record<string, number[]>;
  exploitability: number;
  iterations: number;
  elapsedMs: number;
  note?: string;
}

export async function POST(req: Request): Promise<NextResponse<SolveResponse | { error: string }>> {
  let body: SolveRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });
  }

  if (!body.board || body.board.length !== 3) {
    return NextResponse.json({ error: 'board must be 3 cards' }, { status: 400 });
  }

  const start = Date.now();
  const result = mockSolve(body);
  result.elapsedMs = Date.now() - start;
  return NextResponse.json(result);
}

/** Placeholder postflop strategy generator driven by board texture.
 *  Values are plausible (A-high → cbet-heavy, paired → check-heavy,
 *  monotone → small-bet only) but NOT GTO-accurate. Swap with real
 *  WASM call once solver-wasm package is ready. */
function mockSolve(req: SolveRequest): SolveResponse {
  const { board } = req;
  const ranks = board.map((c) => c[0]!);
  const suits = board.map((c) => c[1]!);
  const monotone = new Set(suits).size === 1;
  const paired = new Set(ranks).size < 3;
  const hasAce = ranks.includes('A');

  // Action set depends on who's acting OOP first. Phase 1: always show
  // OOP check/bet33/bet75 — BB's typical flop decision tree.
  const actions = ['check', 'bet33', 'bet75'];

  // Baseline mix per board texture.
  let base: [number, number, number];
  if (monotone) base = [0.75, 0.2, 0.05]; // mostly check, some small bet
  else if (paired) base = [0.8, 0.15, 0.05]; // check-heavy, rare bet
  else if (hasAce) base = [0.35, 0.4, 0.25]; // cbet-heavy, A-high dry
  else base = [0.55, 0.3, 0.15]; // mixed

  // Populate mix for all 169 hand types. Strong hands (pairs, AK, AQ)
  // lean more toward bets; weak hands toward checks.
  const mix: Record<string, number[]> = {};
  const ranksOrder = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      const hi = ranksOrder[i]!;
      const lo = ranksOrder[j]!;
      let combo: string;
      if (i === j) combo = hi + lo;
      else if (i < j) combo = hi + lo + 's';
      else combo = lo + hi + 'o';

      const strength = handStrength(combo, hasAce);
      const bias = (strength - 0.5) * 0.3; // ±0.15 shift
      const c = clamp01(base[0] - bias);
      const b33 = clamp01(base[1] + bias * 0.5);
      const b75 = clamp01(base[2] + bias * 0.5);
      const total = c + b33 + b75;
      mix[combo] = [c / total, b33 / total, b75 / total];
    }
  }

  return {
    actions,
    mix,
    exploitability: 0.5, // mock — real solver would converge here
    iterations: 100,
    elapsedMs: 0,
    note: 'Mock strategy — WASM solver integration pending',
  };
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/** Very rough hand-strength proxy for mock mix — scale 0..1. */
function handStrength(combo: string, hasAceBoard: boolean): number {
  if (combo === 'AA' || combo === 'KK') return 0.95;
  if (combo === 'QQ' || combo === 'JJ') return 0.85;
  if (combo === 'TT' || combo === '99') return 0.75;
  if (combo.startsWith('A')) return hasAceBoard ? 0.8 : 0.55;
  if (combo.startsWith('K')) return 0.6;
  if (combo.endsWith('s') && combo[0] === combo[1]) return 0.7; // pair
  if (combo.endsWith('s')) return 0.45; // suited
  if (combo.endsWith('o')) return 0.3; // offsuit
  return 0.4;
}
