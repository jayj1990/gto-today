import { NextResponse } from 'next/server';

/**
 * Env-presence probe (redacted). Tells us which env vars the runtime
 * actually sees in production — critical when NextAuth surfaces a
 * generic 500 and we need to rule out missing/typo'd env.
 *
 * Returns length + last 4 chars of each — never the full secret.
 *
 * Also pings Prisma with a trivial query so we can see if the adapter
 * can reach Neon at all.
 *
 * Access gate: Vercel preview + local dev only, OR a matching
 * `?token=$DEBUG_ENV_TOKEN` in production. Even a redacted "last 4
 * chars" readout is cheap reconnaissance for an attacker; require a
 * shared secret before answering on prod.
 */
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAllowed(req: Request): boolean {
  const env = process.env['VERCEL_ENV'];
  // Preview + dev builds are trusted (only Jay sees those URLs).
  if (env !== 'production') return true;
  const token = process.env['DEBUG_ENV_TOKEN'];
  if (!token) return false; // misconfigured → fail closed
  const url = new URL(req.url);
  return url.searchParams.get('token') === token;
}

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

export async function GET(req: Request) {
  if (!isAllowed(req)) {
    return new NextResponse('Not Found', { status: 404 });
  }
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
