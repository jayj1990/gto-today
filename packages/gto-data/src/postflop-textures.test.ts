import { describe, expect, it } from 'vitest';
import type { CardCode } from '@gto/poker-core';
import { classifyBoardTexture } from './postflop-textures';

const flop = (a: string, b: string, c: string) =>
  [a, b, c] as unknown as readonly [CardCode, CardCode, CardCode];

describe('classifyBoardTexture', () => {
  it('labels monotone above everything else', () => {
    expect(classifyBoardTexture(flop('Ah', '7h', '2h'))).toBe('monotone');
    expect(classifyBoardTexture(flop('Qs', '8s', '4s'))).toBe('monotone');
  });

  it('labels paired rainbow as paired', () => {
    expect(classifyBoardTexture(flop('Kh', 'Kd', '2s'))).toBe('paired');
    expect(classifyBoardTexture(flop('7h', '7d', '3s'))).toBe('paired');
  });

  it('labels all-broadway as broadway', () => {
    expect(classifyBoardTexture(flop('Kh', 'Qs', 'Jd'))).toBe('broadway');
    expect(classifyBoardTexture(flop('Ah', 'Ks', 'Qd'))).toBe('broadway');
  });

  it('labels A-high dry rainbow as ace_high', () => {
    expect(classifyBoardTexture(flop('Ah', '7s', '2d'))).toBe('ace_high');
  });

  it('labels K/Q-high dry rainbow as dry_high', () => {
    expect(classifyBoardTexture(flop('Kh', '7s', '2d'))).toBe('dry_high');
    expect(classifyBoardTexture(flop('Qh', '8s', '3d'))).toBe('dry_high');
  });

  it('labels low connected rainbow as low_connected', () => {
    expect(classifyBoardTexture(flop('7h', '6s', '5d'))).toBe('low_connected');
    expect(classifyBoardTexture(flop('5h', '4s', '3d'))).toBe('low_connected');
  });

  it('labels connected two-tone as wet_draw', () => {
    expect(classifyBoardTexture(flop('Th', '9h', '8d'))).toBe('wet_draw');
    expect(classifyBoardTexture(flop('Jh', 'Th', '9s'))).toBe('wet_draw');
  });

  it('labels mid rainbow disconnected as dry_mid', () => {
    expect(classifyBoardTexture(flop('9h', '6s', '3d'))).toBe('dry_mid');
  });
});
