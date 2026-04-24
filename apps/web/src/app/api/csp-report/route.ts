import { NextResponse } from 'next/server';

/**
 * CSP violation sink. Browsers POST here whenever a request violates
 * the Content-Security-Policy-Report-Only header in next.config.ts.
 *
 * Minimum viable collector: log to stderr so Vercel's log drain picks
 * it up (and Sentry, once wired). We don't persist reports — the
 * interesting data is "what hosts fail the policy I wrote" which we
 * read once per tuning pass and then promote the CSP to enforcing.
 *
 * The schema is defined by the W3C CSP spec. Two common shapes:
 *   1. Legacy `report-uri` → `{ "csp-report": { ... } }`
 *   2. New `report-to` via Reporting API → array of `{ type, body }`
 * We accept both and log each row.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface LegacyReport {
  'csp-report': Record<string, unknown>;
}
interface ReportingApiEntry {
  type?: string;
  body?: Record<string, unknown>;
}

export async function POST(req: Request): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const rows: Record<string, unknown>[] = [];
  if (Array.isArray(payload)) {
    for (const entry of payload as ReportingApiEntry[]) {
      if (entry?.body) rows.push(entry.body);
    }
  } else if (payload && typeof payload === 'object' && 'csp-report' in payload) {
    rows.push((payload as LegacyReport)['csp-report']);
  } else if (payload && typeof payload === 'object') {
    rows.push(payload as Record<string, unknown>);
  }

  for (const row of rows) {
    // `console.error` rather than `log` so the violation shows up in
    // Vercel's error channel, where it's actually watched.
    console.error('[csp-violation]', JSON.stringify(row));
  }

  return NextResponse.json({ ok: true, count: rows.length });
}
