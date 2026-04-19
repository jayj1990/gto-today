import type { BoardState } from './types';

export const emptyBoard: BoardState = { flop: null, turn: null, river: null };

export function boardStreet(board: BoardState): 'preflop' | 'flop' | 'turn' | 'river' {
  if (board.river !== null) return 'river';
  if (board.turn !== null) return 'turn';
  if (board.flop !== null) return 'flop';
  return 'preflop';
}
