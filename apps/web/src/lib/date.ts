/**
 * Date helpers — always use Asia/Seoul so SSR and client render identically
 * regardless of server region. Prevents hydration mismatches.
 */

export function formatTodayKR(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  }).format(now);
}

export function isoDateKR(now: Date = new Date()): string {
  // "2026-04-19" in Asia/Seoul, regardless of server TZ.
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(now);
  return parts;
}
