declare module 'pokersolver' {
  export interface SolvedHand {
    readonly name: string;
    readonly descr: string;
    readonly rank: number;
    readonly cards: Array<{ value: string; suit: string; toString(): string }>;
    toString(): string;
  }
  export class Hand {
    static solve(cards: string[], game?: string, canDisqualify?: boolean): SolvedHand;
    static winners(hands: SolvedHand[]): SolvedHand[];
  }
}
