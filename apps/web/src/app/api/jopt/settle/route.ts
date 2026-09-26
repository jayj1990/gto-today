import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// /api/jopt/settle — 삿포로 정산 공유 상태(보냈어요 체크). Postgres KvBlob 한 행. 환율은 코드에 고정, 모드는 없앰(2026-09-26).
// 인증 없음: jopt.gto.today 는 검색 노출 금지된 비공개 링크이고 참가자 11명이 각자 폰에서 체크만 한다.
// 처음엔 Upstash 였는데 프로덕션 Redis 호스트가 사라져(2026-09-25) Prisma 로 바꿨다.
// DB 가 안 닿으면 shared:false 를 돌려주고 화면은 localStorage 로 대신한다.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KEY = 'jopt:settle:sapporo-2026';

export interface PaidMark {
  amount: number;
  at: number;
}
/** 받는 사람 송금처 — 토스 아이디·은행·계좌. 스크립트(scripts/jopt-settle-pay.mjs)로만 넣고 클라이언트는 못 바꾼다. */
export interface PayInfo {
  toss?: string;
  kakao?: string;
  bank?: string;
  acct?: string;
}
export interface SettleState {
  paid: Record<string, PaidMark>;
  /** 이름 → 송금처. 없으면 버튼이 안 뜬다. */
  pay?: Record<string, PayInfo>;
  updatedAt: number;
}

const EMPTY: SettleState = { paid: {}, updatedAt: 0 };

async function load(): Promise<SettleState> {
  const row = await prisma.kvBlob.findUnique({ where: { key: KEY } });
  const raw = row?.value;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...EMPTY };
  const st = raw as Partial<SettleState>;
  return { ...EMPTY, ...st, paid: st.paid ?? {} };
}

async function save(state: SettleState): Promise<void> {
  // Prisma Json 컬럼은 InputJsonValue 만 받는다 — 인터페이스 그대로는 인덱스 시그니처가 없어 캐스팅
  const value = JSON.parse(JSON.stringify(state)) as Prisma.InputJsonValue;
  await prisma.kvBlob.upsert({
    where: { key: KEY },
    create: { key: KEY, value },
    update: { value },
  });
}

export async function GET() {
  try {
    const state = await load();
    return NextResponse.json({ shared: true, state });
  } catch (err) {
    console.error('[jopt/settle] db read failed', err);
    return NextResponse.json({ shared: false, state: null });
  }
}

interface Patch {
  /** key → 표시(amount) 또는 null(해제) */
  paid?: Record<string, { amount: number } | null>;
}

export async function PUT(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Patch;
  let state: SettleState;
  try {
    state = await load();
  } catch (err) {
    console.error('[jopt/settle] db read failed', err);
    return NextResponse.json({ shared: false, state: null }, { status: 503 });
  }
  // 🔴 body.pay 는 받지 않는다 — 인증이 없어서 누구나 남의 계좌를 자기 것으로 바꿀 수 있게 된다.
  if (body.paid && typeof body.paid === 'object') {
    for (const [key, v] of Object.entries(body.paid)) {
      if (!/^[^>]+>[^>]+>(JPY|KRW)$/.test(key)) continue;
      if (v === null) delete state.paid[key];
      else if (typeof v?.amount === 'number' && Number.isFinite(v.amount))
        state.paid[key] = { amount: Math.round(v.amount), at: Date.now() };
    }
  }
  state.updatedAt = Date.now();
  try {
    await save(state);
  } catch (err) {
    console.error('[jopt/settle] db write failed', err);
    return NextResponse.json({ shared: false, state: null }, { status: 503 });
  }
  return NextResponse.json({ shared: true, state });
}
