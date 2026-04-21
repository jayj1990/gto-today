import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 300; // Vercel Fluid Compute — up to 300s

/**
 * Live postflop solver endpoint.
 *
 * Runs the WASM build of postflop-solver when available. The WASM
 * package lives in a separate AGPL-licensed repo (solver-wasm/) and
 * is distributed via GitHub Packages; if it can't be loaded (local
 * dev without the package installed, or the dynamic import fails)
 * we fall back to a texture-based mock so the UI stays functional.
 *
 * The fallback is logged server-side so we notice if prod ever
 * silently degrades.
 */

let wasmSolveFlop:
  | ((input: unknown) => { actions: string[]; mix: Record<string, number[]>; exploitability: number; iterations: number })
  | null = null;

async function loadWasm() {
  if (wasmSolveFlop !== null) return wasmSolveFlop;
  try {
    // Direct import so Next.js bundles the WASM package into the
    // Vercel Function output. Earlier we had /* webpackIgnore */ to
    // let the build succeed before the package was published, but
    // that also prevented it from being bundled at runtime — WASM
    // silently fell back to mock. Package now lives at
    // @jayj1990/gto-today-solver-wasm via GitHub Packages.
    const mod = (await import('@jayj1990/gto-today-solver-wasm').catch(
      () => null,
    )) as
      | { solve_flop: (input: unknown) => ReturnType<NonNullable<typeof wasmSolveFlop>> }
      | null;
    if (mod && typeof mod.solve_flop === 'function') {
      wasmSolveFlop = mod.solve_flop;
      return wasmSolveFlop;
    }
  } catch (e) {
    console.warn('[live-solve] WASM load failed, using mock:', e);
  }
  return null;
}

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
  const wasm = await loadWasm();
  if (wasm) {
    try {
      const out = wasm({
        board: body.board,
        oop_range: body.oopRange,
        ip_range: body.ipRange,
        pot: body.pot,
        eff_stack: body.effStack,
        accuracy: 0.5,
        max_iter: 150,
      });
      return NextResponse.json({
        actions: out.actions,
        mix: out.mix,
        exploitability: out.exploitability,
        iterations: out.iterations,
        elapsedMs: Date.now() - start,
      });
    } catch (e) {
      console.error('[live-solve] WASM solve threw:', e);
      // Fall through to mock below.
    }
  }

  const result = mockSolve(body);
  result.elapsedMs = Date.now() - start;
  result.note = (result.note ?? '') + ' (WASM unavailable — using mock)';
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
