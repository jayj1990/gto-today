import { NextResponse } from 'next/server';

/**
 * Env-presence probe. Tells us which env vars the runtime actually sees
 * in production — critical when NextAuth surfaces a generic 500 and we
 * need to rule out missing/typo'd env. Also pings Prisma so we can see
 * if the adapter can reach Neon at all.
 *
 * Access gate (tightened 2026-04-24):
 *   - Vercel preview + local dev → open (only Jay sees those URLs)
 *   - Production → requires `Authorization: Bearer $DEBUG_ENV_TOKEN`
 *     header. Query-string auth was replaced because Vercel logs URL
 *     params; a leaked prod log shouldn't expose the token.
 *   - If `DEBUG_ENV_TOKEN` isn't set in production, the route fails
 *     closed with 404 (defense-in-depth against misconfig).
 *
 * What we return: presence + length only. The old response leaked the
 * last 4 characters of each secret — small recon for an attacker and
 * a Vercel log-retention liability.
 */
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAllowed(req: Request): boolean {
  const env = process.env['VERCEL_ENV'];
  if (env !== 'production') return true;
  const token = process.env['DEBUG_ENV_TOKEN'];
  if (!token) return false;
  const header = req.headers.get('authorization') ?? '';
  const match = /^Bearer (.+)$/.exec(header.trim());
  return match?.[1] === token;
}

const KEYS = [
  'AUTH_SECRET',
  'AUTH_GOOGLE_ID',
  'AUTH_GOOGLE_SECRET',
  'AUTH_TRUST_HOST',
  'DATABASE_URL',
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'VERCEL',
  'VERCEL_URL',
  'VERCEL_ENV',
] as const;

export async function GET(req: Request) {
  if (!isAllowed(req)) {
    return new NextResponse('Not Found', { status: 404 });
  }
  const env: Record<string, { present: boolean; length: number }> = {};
  for (const k of KEYS) {
    const v = process.env[k];
    env[k] = { present: typeof v === 'string' && v.length > 0, length: v?.length ?? 0 };
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
