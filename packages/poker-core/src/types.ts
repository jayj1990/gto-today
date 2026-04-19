// Branded primitive types — zero runtime cost, compile-time safety.
declare const brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export type Suit = 's' | 'h' | 'd' | 'c';

export type CardCode = Brand<string, 'CardCode'>; // e.g. "As", "Td"
export type HandCode = Brand<string, 'HandCode'>; // canonical 2-card "AsKd"
export type ComboKey = Brand<string, 'ComboKey'>; // 169 preflop buckets e.g. "AKs"

export type Position = 'UTG' | 'UTG1' | 'MP' | 'LJ' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

export type Street = 'preflop' | 'flop' | 'turn' | 'river';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise';

export interface Action {
  readonly player: 'hero' | 'villain';
  readonly type: ActionType;
  readonly size?: number; // in BB, when applicable
}

export interface BoardState {
  readonly flop: readonly [CardCode, CardCode, CardCode] | null;
  readonly turn: CardCode | null;
  readonly river: CardCode | null;
}

export interface Spot {
  readonly id: string;
  readonly hero: readonly [CardCode, CardCode];
  readonly board: BoardState;
  readonly position: Position;
  readonly stackBB: number;
  readonly potBB: number;
  readonly history: readonly Action[];
  readonly street: Street;
}

export interface MixedStrategy {
  readonly fold: number;
  readonly check?: number;
  readonly call?: number;
  readonly bet?: Record<string, number>; // keyed by size bucket, e.g. "33%", "75%", "pot"
  readonly raise?: Record<string, number>;
}

export interface EquityResult {
  readonly heroEquity: number; // 0..1
  readonly tieEquity: number;
  readonly iterations: number;
}
