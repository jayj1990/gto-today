import { describe, expect, it } from 'vitest';
import { formatTodayKR, isoDateKR } from './date';

/**
 * Date helpers MUST always evaluate in Asia/Seoul so SSR (Vercel
 * region varies) renders the same dateKey the client persists. Pin
 * the timezone behaviour to catch regressions where someone
 * accidentally drops the `timeZone` option and falls back to the
 * server's local TZ.
 */

describe('isoDateKR', () => {
  it('returns YYYY-MM-DD format', () => {
    const out = isoDateKR(new Date('2026-04-30T12:00:00Z'));
    expect(out).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('rolls to next day when UTC is late evening but Seoul is past midnight', () => {
    // 2026-04-30 16:00 UTC == 2026-05-01 01:00 Asia/Seoul (UTC+9).
    // The challenge "today" must reflect the user's local Seoul date,
    // not the server's UTC date — otherwise users in Korea see
    // yesterday's quiz after midnight.
    const out = isoDateKR(new Date('2026-04-30T16:00:00Z'));
    expect(out).toBe('2026-05-01');
  });

  it('stays on same day when UTC is early but still same Seoul day', () => {
    // 2026-04-30 03:00 UTC == 2026-04-30 12:00 Seoul.
    const out = isoDateKR(new Date('2026-04-30T03:00:00Z'));
    expect(out).toBe('2026-04-30');
  });

  it('rolls back when UTC is just past midnight but Seoul is still previous day', () => {
    // 2026-05-01 00:30 UTC == 2026-05-01 09:30 Seoul — same day actually.
    // Better test: 2026-04-30 14:00 UTC == 2026-04-30 23:00 Seoul (still 4/30).
    const out = isoDateKR(new Date('2026-04-30T14:00:00Z'));
    expect(out).toBe('2026-04-30');
  });

  it('handles year + month boundaries via Seoul time', () => {
    // 2025-12-31 16:00 UTC == 2026-01-01 01:00 Seoul.
    const out = isoDateKR(new Date('2025-12-31T16:00:00Z'));
    expect(out).toBe('2026-01-01');
  });

  it('default arg uses now() — output is a valid ISO date string', () => {
    const out = isoDateKR();
    expect(out).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Sanity: parsing back yields a real date.
    expect(Number.isNaN(new Date(out + 'T00:00:00').getTime())).toBe(false);
  });
});

describe('formatTodayKR', () => {
  it('returns Korean "M월 D일" form', () => {
    // 2026-04-30 12:00 UTC == 2026-04-30 21:00 Seoul.
    const out = formatTodayKR(new Date('2026-04-30T12:00:00Z'));
    expect(out).toContain('4월');
    expect(out).toContain('30일');
  });

  it('uses Seoul time for the date — not UTC', () => {
    // 2026-04-30 16:00 UTC == 2026-05-01 Seoul → should read "5월 1일".
    const out = formatTodayKR(new Date('2026-04-30T16:00:00Z'));
    expect(out).toContain('5월');
    expect(out).toContain('1일');
  });
});
