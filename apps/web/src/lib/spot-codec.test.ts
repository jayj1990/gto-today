import { describe, expect, it } from 'vitest';
import type { PostflopSpot, TrainingSpot } from '@gto/gto-data';
import { decodeSharedSpot, encodeSharedSpot, type SharedSpot } from './spot-codec';

/**
 * Spot-codec invariants. The codec carries the friend-share payload
 * end-to-end; if round-trip drops a field or chokes on Korean text or
 * unicode, the recipient's quiz page goes blank with no diagnostic.
 */

const samplePreflop: TrainingSpot = {
  id: '2026-04-30-3-K4s-BB-vs-CO',
  combo: 'K4s',
  hero: ['Kh', '4h'],
  position: 'BB',
  format: '6max',
  stackBB: 100,
  scenario: 'vs_open',
  opener: 'CO',
  openSize: 2.5,
  gtoRaise: 0,
  gtoFold: 1,
  gtoCall: 0,
  correctAnswer: 'fold',
  availableActions: ['fold', 'call'],
} as TrainingSpot;

const samplePostflop: PostflopSpot = {
  id: 'pf-srp-bb-vs-co-T76r',
  street: 'flop',
  board: ['Th', '7d', '6c'],
  hero: ['2s', '2c'],
  texture: 'wet_draw',
  context: {
    heroPos: 'BB',
    villainPos: 'CO',
    potType: 'srp',
    spr: 17.7,
    potBB: 5.5,
    effStackBB: 97.5,
    preflopSummary: 'CO 오픈 · BB 콜',
  },
  facingBetBB: 0,
  mix: { check: 0.68, bet33: 0.32 },
  availableActions: ['check', 'bet33', 'bet75'],
  teachingNote: '혼합 전략 — 체크가 빈번하지만 1/3 벳도 충분.',
} as PostflopSpot;

describe('spot-codec', () => {
  it('preflop spot survives base64 round-trip', () => {
    const encoded = encodeSharedSpot({ kind: 'preflop', spot: samplePreflop });
    const decoded = decodeSharedSpot(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.kind).toBe('preflop');
    expect(decoded?.spot).toEqual(samplePreflop);
  });

  it('postflop spot with Korean teachingNote survives round-trip', () => {
    // The earlier btoa-only path would mangle anything outside Latin-1.
    // Postflop seeds carry Hangul teaching notes — the codec must
    // preserve them byte-for-byte.
    const encoded = encodeSharedSpot({ kind: 'postflop', spot: samplePostflop });
    const decoded = decodeSharedSpot(encoded);
    expect(decoded?.kind).toBe('postflop');
    expect(decoded?.spot).toEqual(samplePostflop);
    expect((decoded?.spot as PostflopSpot).teachingNote).toContain('혼합 전략');
  });

  it('produces URL-safe output (no + / =)', () => {
    const encoded = encodeSharedSpot({ kind: 'preflop', spot: samplePreflop });
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it('returns null for malformed base64', () => {
    expect(decodeSharedSpot('!!!not-base64!!!')).toBeNull();
  });

  it('returns null when payload kind is missing', () => {
    // Encode JSON that lacks a `kind` discriminator — caller mustn't
    // accidentally render an arbitrary object as a quiz.
    const bogus = encodeSharedSpot({ kind: 'preflop', spot: samplePreflop } as SharedSpot);
    // Mutate the encoded payload to drop the kind field.
    const json = JSON.stringify({ spot: samplePreflop });
    const tampered = Buffer.from(json, 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    expect(decodeSharedSpot(tampered)).toBeNull();
    // Sanity: the well-formed encode is fine.
    expect(decodeSharedSpot(bogus)).not.toBeNull();
  });

  it('returns null on truncated payload', () => {
    const encoded = encodeSharedSpot({ kind: 'preflop', spot: samplePreflop });
    // Drop the last 30% of the string — likely to hit invalid JSON
    // after base64 decode; codec should swallow and return null.
    const truncated = encoded.slice(0, Math.floor(encoded.length * 0.7));
    expect(decodeSharedSpot(truncated)).toBeNull();
  });

  it('encoded length stays under typical URL limits', () => {
    const encoded = encodeSharedSpot({ kind: 'postflop', spot: samplePostflop });
    // Rough sanity check — we want the share URL to fit in the 2 kB
    // ceiling that conservative messaging apps still respect. The
    // postflop sample is on the larger side of what we ship.
    expect(encoded.length).toBeLessThan(2000);
  });
});
