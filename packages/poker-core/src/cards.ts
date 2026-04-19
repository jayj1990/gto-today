import type { CardCode, ComboKey, Rank, Suit } from './types';

export const RANKS: readonly Rank[] = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'T',
  'J',
  'Q',
  'K',
  'A',
];

export const SUITS: readonly Suit[] = ['s', 'h', 'd', 'c'];

const RANK_VALUE: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

export function rankValue(rank: Rank): number {
  return RANK_VALUE[rank];
}

export function card(rank: Rank, suit: Suit): CardCode {
  return `${rank}${suit}` as CardCode;
}

export function parseCard(code: string): CardCode {
  if (code.length !== 2) throw new Error(`Invalid card code: ${code}`);
  const r = code[0] as Rank;
  const s = code[1] as Suit;
  if (!(r in RANK_VALUE) || !SUITS.includes(s)) {
    throw new Error(`Invalid card code: ${code}`);
  }
  return code as CardCode;
}

/**
 * Canonical 169-combo key, e.g. "AKs", "AKo", "QQ".
 * Higher rank first; suffix 's' for suited, 'o' for offsuit.
 */
export function comboKey(a: CardCode, b: CardCode): ComboKey {
  const [r1, s1] = [a[0] as Rank, a[1] as Suit];
  const [r2, s2] = [b[0] as Rank, b[1] as Suit];
  const [hi, lo] = rankValue(r1) >= rankValue(r2) ? [r1, r2] : [r2, r1];
  if (r1 === r2) return `${hi}${lo}` as ComboKey;
  const suffix = s1 === s2 ? 's' : 'o';
  return `${hi}${lo}${suffix}` as ComboKey;
}

export function fullDeck(): readonly CardCode[] {
  const deck: CardCode[] = [];
  for (const r of RANKS) {
    for (const s of SUITS) {
      deck.push(card(r, s));
    }
  }
  return deck;
}
