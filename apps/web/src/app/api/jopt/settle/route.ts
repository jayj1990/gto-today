import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// /api/jopt/settle — 삿포로 정산 공유 상태(보냈어요 체크·환율·모드).
// 인증 없음: jopt.gto.today 는 검색 노출 금지된 비공개 링크이고 참가자 11명이 각자 폰에서 체크만 한다.
// Upstash 가 없으면(로컬) shared:false 를 돌려주고 화면은 localStorage 로 대신한다.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KEY = 'jopt:settle:sapporo-2026';

export interface PaidMark {
  amount: number;
  at: number;
}
export interface SettleState {
  paid: Record<string, PaidMark>;
  rate?: number;
  mode?: 'krw' | 'split';
  updatedAt: number;
}

// explain-cache.ts 와 같은 이유로 URL 형태까지 확인한다 — Vercel Sensitive 값이 빌드 때 자리표시자로
// 들어오면 Redis.fromEnv() 가 UrlError 를 던져 라우트 수집 단계에서 빌드가 깨진다.
function getRedis(): Redis | null {
  const url = process.env['UPSTASH_REDIS_REST_URL'];
  const token = process.env['UPSTASH_REDIS_REST_TOKEN'];
  if (!url?.startsWith('https://') || !token) return null;
  try {
    return Redis.fromEnv();
  } catch {
    return null;
  }
}

const EMPTY: SettleState = { paid: {}, updatedAt: 0 };

async function load(redis: Redis): Promise<SettleState> {
  const raw = await redis.get<SettleState>(KEY);
  if (!raw || typeof raw !== 'object') return { ...EMPTY };
  return { ...EMPTY, ...raw, paid: raw.paid ?? {} };
}

// Upstash 호스트가 죽어 있거나(로컬 .env 의 옛 DB) 네트워크가 막히면 500 대신 shared:false 로 —
// 화면은 이 기기 저장으로 넘어가고, 체크 자체는 계속 된다.
export async function GET() {
  const redis = getRedis();
  if (!redis) return NextResponse.json({ shared: false, state: null });
  try {
    const state = await load(redis);
    return NextResponse.json({ shared: true, state });
  } catch (err) {
    console.error('[jopt/settle] redis get failed', err);
    return NextResponse.json({ shared: false, state: null });
  }
}

interface Patch {
  /** key → 표시(amount) 또는 null(해제) */
  paid?: Record<string, { amount: number } | null>;
  rate?: number;
  mode?: 'krw' | 'split';
}

export async function PUT(req: Request) {
  const redis = getRedis();
  if (!redis) return NextResponse.json({ shared: false, state: null }, { status: 503 });
  const body = (await req.json().catch(() => ({}))) as Patch;
  let state: SettleState;
  try {
    state = await load(redis);
  } catch (err) {
    console.error('[jopt/settle] redis get failed', err);
    return NextResponse.json({ shared: false, state: null }, { status: 503 });
  }
  if (body.paid && typeof body.paid === 'object') {
    for (const [key, v] of Object.entries(body.paid)) {
      if (!/^[^>]+>[^>]+>(JPY|KRW)$/.test(key)) continue;
      if (v === null) delete state.paid[key];
      else if (typeof v?.amount === 'number' && Number.isFinite(v.amount))
        state.paid[key] = { amount: Math.round(v.amount), at: Date.now() };
    }
  }
  if (typeof body.rate === 'number' && body.rate >= 500 && body.rate <= 1500)
    state.rate = Math.round(body.rate * 10) / 10;
  if (body.mode === 'krw' || body.mode === 'split') state.mode = body.mode;
  state.updatedAt = Date.now();
  try {
    await redis.set(KEY, state);
  } catch (err) {
    console.error('[jopt/settle] redis set failed', err);
    return NextResponse.json({ shared: false, state: null }, { status: 503 });
  }
  return NextResponse.json({ shared: true, state });
}
