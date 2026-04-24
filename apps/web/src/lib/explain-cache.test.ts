import { describe, expect, it } from 'vitest';
import { fingerprint } from './explain-cache';

/**
 * The fingerprint is the cache key for Claude Haiku explanations. Two
 * users on the same spot/answer/locale must land on the same key — if
 * the function ever starts emitting different hashes for equivalent
 * inputs, every explanation becomes a cache miss and Anthropic cost
 * balloons without warning.
 */
describe('fingerprint', () => {
  it('returns a stable 16-char hex string', () => {
    const fp = fingerprint({ spot: { id: 'pre_xyz' }, userAnswer: 'raise', locale: 'ko' });
    expect(fp).toMatch(/^[0-9a-f]{16}$/);
  });

  it('is deterministic across equivalent inputs', () => {
    const a = fingerprint({ spot: { id: 'pre_xyz' }, userAnswer: 'raise', locale: 'ko' });
    const b = fingerprint({ spot: { id: 'pre_xyz' }, userAnswer: 'raise', locale: 'ko' });
    expect(a).toBe(b);
  });

  it('ignores property insertion order', () => {
    const a = fingerprint({ spot: { id: 'x' }, userAnswer: 'call', locale: 'ko' });
    // Same logical payload, different key ordering. Object.keys(...).sort()
    // in the implementation canonicalizes this.
    const b = fingerprint({ locale: 'ko', userAnswer: 'call', spot: { id: 'x' } });
    expect(a).toBe(b);
  });

  it('differentiates on userAnswer', () => {
    const raise = fingerprint({ spot: { id: 'x' }, userAnswer: 'raise', locale: 'ko' });
    const fold = fingerprint({ spot: { id: 'x' }, userAnswer: 'fold', locale: 'ko' });
    expect(raise).not.toBe(fold);
  });

  it('differentiates on locale', () => {
    const ko = fingerprint({ spot: { id: 'x' }, userAnswer: 'raise', locale: 'ko' });
    const en = fingerprint({ spot: { id: 'x' }, userAnswer: 'raise', locale: 'en' });
    expect(ko).not.toBe(en);
  });
});
