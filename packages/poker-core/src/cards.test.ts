import { describe, expect, it } from 'vitest';
import { card, comboKey, fullDeck, parseCard, rankValue } from './cards';

describe('cards', () => {
  it('rankValue orders 2..A', () => {
    expect(rankValue('2')).toBe(2);
    expect(rankValue('T')).toBe(10);
    expect(rankValue('J')).toBe(11);
    expect(rankValue('A')).toBe(14);
  });

  it('card() composes a code', () => {
    expect(card('A', 's')).toBe('As');
    expect(card('7', 'h')).toBe('7h');
  });

  it('parseCard validates rank+suit', () => {
    expect(parseCard('Ks')).toBe('Ks');
    expect(() => parseCard('Xx')).toThrow();
    expect(() => parseCard('A')).toThrow();
    expect(() => parseCard('Axs')).toThrow();
  });

  it('fullDeck yields 52 unique cards', () => {
    const d = fullDeck();
    expect(d).toHaveLength(52);
    expect(new Set(d).size).toBe(52);
  });

  describe('comboKey', () => {
    it('pairs collapse', () => {
      expect(comboKey('As' as never, 'Ah' as never)).toBe('AA');
      expect(comboKey('2d' as never, '2c' as never)).toBe('22');
    });
    it('suited gets "s" suffix', () => {
      expect(comboKey('As' as never, 'Ks' as never)).toBe('AKs');
      expect(comboKey('Ts' as never, '9s' as never)).toBe('T9s');
    });
    it('offsuit gets "o" suffix', () => {
      expect(comboKey('As' as never, 'Kh' as never)).toBe('AKo');
      expect(comboKey('7c' as never, '2d' as never)).toBe('72o');
    });
    it('always puts higher rank first', () => {
      expect(comboKey('5s' as never, 'As' as never)).toBe('A5s');
      expect(comboKey('2d' as never, 'Tc' as never)).toBe('T2o');
    });
  });
});
