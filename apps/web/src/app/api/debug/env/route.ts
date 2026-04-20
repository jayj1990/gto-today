import { NextResponse } from 'next/server';

/**
 * Env-presence probe (redacted). Tells us which env vars the runtime
 * actually sees in production — critical when NextAuth surfaces a
 * generic 500 and we need to rule out missing/typo'd env.
 *
 * Returns length + last 4 chars of each — never the full secret. Safe
 * to leave deployed; an attacker learns nothing useful.
 *
 * Also pings Prisma with a trivial query so we can see if the adapter
 * can reach Neon at all.
 */
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KEYS = [
  'AUTH_SECRET',
  'AUTH_GOOGLE_ID',
  'AUTH_GOOGLE_SECRET',
  'AUTH_TRUST_HOST',
  'DATABASE_URL',
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'VERCEL',
  'VERCEL_URL',
  'VERCEL_ENV',
] as const;

export async function GET() {
  const env: Record<string, string | null> = {};
  for (const k of KEYS) {
    const v = process.env[k];
    env[k] = v ? `${v.length} chars, ends with ...${v.slice(-4)}` : null;
  }

  let dbStatus: string;
  try {
    const t = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = `ok (${Date.now() - t}ms)`;
  } catch (err) {
    dbStatus = `FAIL: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json({ env, db: dbStatus, ts: new Date().toISOString() });
}
