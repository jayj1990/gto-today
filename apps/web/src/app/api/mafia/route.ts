import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  cleanGames,
  cleanName,
  cleanPay,
  cleanPlayers,
  cleanPrizes,
  cleanRounds,
  meetUrl,
  mergePlayers,
  normalize,
  parseMeetCode,
  type EventInfo,
  type GameDef,
  type MafiaState,
  type MeetSummary,
  type PayInfo,
  type Round,
} from '@/app/mafia/calc';

// /api/mafia — 마피아 나이트 점수판 상태. Postgres KvBlob 한 행(jopt/settle 과 같은 방식).
// 읽기는 누구나(참가자가 폰으로 순위를 본다). 쓰기는 MAFIA_ADMIN_KEY 를 x-mafia-key 헤더로
// 보낸 관리자(Jay)만 — 점수·상금·송금 완료를 아무나 못 바꾸게. 송금처(pay)도 관리자에게만 내려간다.
// 모집은 포커투데이 모집 페이지(poker.gto.today/meet/{code})가 맡는다 — 여기 서버가 그 공개 API 를
// 읽어 참석자(정원 안)를 응답에 실어 주고, 관리자가 "게임 시작"을 누르면 참가자 명단으로 옮긴다(syncMeet).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KEY = 'mafia:night:2026';

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function isAdmin(req: Request): boolean {
  const want = process.env['MAFIA_ADMIN_KEY'];
  if (!want) return false;
  const got = req.headers.get('x-mafia-key') ?? '';
  return got.length === want.length && got === want;
}

async function load(): Promise<MafiaState> {
  const row = await prisma.kvBlob.findUnique({ where: { key: KEY } });
  return normalize(row?.value);
}

async function save(state: MafiaState): Promise<void> {
  const value = JSON.parse(JSON.stringify(state)) as Prisma.InputJsonValue;
  await prisma.kvBlob.upsert({
    where: { key: KEY },
    create: { key: KEY, value },
    update: { value },
  });
}

const MEET_API = 'https://poker.gto.today/api/poker/meetup';
interface MeetRsvpRaw {
  name?: unknown;
  st?: unknown;
  at?: unknown;
}
/** 모집 페이지 요약. 포커투데이가 안 닿으면 null — 점수판은 그대로 뜬다. */
async function fetchMeet(code: string): Promise<MeetSummary | null> {
  if (!code) return null;
  try {
    const r = await fetch(`${MEET_API}?code=${encodeURIComponent(code)}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { data?: unknown };
    const d = j.data;
    if (!isObj(d)) return null;
    const rsvps = Array.isArray(d['rsvps']) ? (d['rsvps'] as MeetRsvpRaw[]) : [];
    const cap = typeof d['cap'] === 'number' && d['cap'] > 0 ? Math.round(d['cap']) : 0;
    const names = (st: string) =>
      rsvps
        .filter((x) => x.st === st && typeof x.name === 'string')
        .sort((a, b) => Number(a.at ?? 0) - Number(b.at ?? 0))
        .map((x) => String(x.name).trim())
        .filter(Boolean);
    const yesAll = names('yes');
    return {
      code,
      url: meetUrl(code),
      title: typeof d['title'] === 'string' ? d['title'] : '',
      at: typeof d['at'] === 'number' ? d['at'] : 0,
      place: typeof d['place'] === 'string' ? d['place'] : '',
      cap,
      closed: d['closed'] === true,
      yes: cap ? yesAll.slice(0, cap) : yesAll,
      wait: cap ? yesAll.slice(cap) : [],
      maybe: names('maybe'),
      noCount: rsvps.filter((x) => x.st === 'no').length,
    };
  } catch (err) {
    console.error('[mafia] meet fetch failed', err);
    return null;
  }
}

function publicView(state: MafiaState, admin: boolean): MafiaState {
  if (admin) return state;
  const { pay: _pay, ...rest } = state;
  return rest;
}

export async function GET(req: Request) {
  const admin = isAdmin(req);
  try {
    const state = await load();
    const meet = await fetchMeet(state.meet.code);
    return NextResponse.json({ shared: true, admin, state: publicView(state, admin), meet });
  } catch (err) {
    console.error('[mafia] db read failed', err);
    return NextResponse.json({ shared: false, admin, state: null, meet: null });
  }
}

interface Patch {
  event?: Partial<EventInfo>;
  players?: string[];
  games?: GameDef[];
  /** gameId → 그 게임의 라운드 전체(통째로 교체) */
  rounds?: Record<string, Round[]>;
  prizes?: number[];
  tiebreak?: string[];
  /** 이름 → 송금처 또는 null(삭제) */
  pay?: Record<string, PayInfo | null>;
  /** 이름 → 완료 표시 또는 null(해제) */
  paid?: Record<string, { amount: number } | null>;
  /** 모집 페이지 링크나 코드. '' 이면 연결 해제 */
  meet?: { code: string };
  /** 모집 페이지 참석자(정원 안)를 참가자 명단에 합친다 */
  syncMeet?: boolean;
  started?: boolean;
}

export async function PUT(req: Request) {
  const admin = isAdmin(req);
  if (!admin) {
    return NextResponse.json(
      { shared: true, admin: false, state: null, error: '관리자만 바꿀 수 있습니다.' },
      { status: 401 },
    );
  }
  const body = (await req.json().catch(() => ({}))) as Patch;
  let state: MafiaState;
  try {
    state = await load();
  } catch (err) {
    console.error('[mafia] db read failed', err);
    return NextResponse.json({ shared: false, admin, state: null }, { status: 503 });
  }

  if (isObj(body.event)) {
    state.event = normalize({ event: { ...state.event, ...body.event } }).event;
  }
  if (Array.isArray(body.players)) state.players = cleanPlayers(body.players);
  if (Array.isArray(body.games)) state.games = cleanGames(body.games);
  if (isObj(body.rounds)) {
    const cleaned = cleanRounds(body.rounds);
    for (const gid of Object.keys(body.rounds)) state.rounds[gid] = cleaned[gid] ?? [];
  }
  if (Array.isArray(body.prizes)) state.prizes = cleanPrizes(body.prizes);
  if (Array.isArray(body.tiebreak)) state.tiebreak = cleanPlayers(body.tiebreak);
  if (isObj(body.pay)) {
    const pay = { ...(state.pay ?? {}) };
    for (const [rawName, info] of Object.entries(body.pay)) {
      const name = cleanName(rawName);
      if (!name) continue;
      if (info === null) {
        delete pay[name];
        continue;
      }
      const p = cleanPay(info);
      if (p) pay[name] = p;
      else delete pay[name];
    }
    state.pay = pay;
  }
  if (isObj(body.paid)) {
    for (const [rawName, v] of Object.entries(body.paid)) {
      const name = cleanName(rawName);
      if (!name) continue;
      if (v === null) delete state.paid[name];
      else if (isObj(v) && typeof v['amount'] === 'number' && Number.isFinite(v['amount']))
        state.paid[name] = { amount: Math.round(v['amount']), at: Date.now() };
    }
  }
  if (isObj(body.meet)) state.meet = { code: parseMeetCode(body.meet['code']) };
  let meet: MeetSummary | null = null;
  if (body.syncMeet === true) {
    meet = await fetchMeet(state.meet.code);
    if (!meet) {
      return NextResponse.json(
        {
          shared: true,
          admin,
          state: null,
          meet: null,
          error: state.meet.code
            ? '모집 페이지를 읽지 못했습니다. 잠시 뒤 다시 눌러 주세요.'
            : '설정에서 모집 페이지 링크를 먼저 넣어 주세요.',
        },
        { status: 502 },
      );
    }
    state.players = mergePlayers(state.players, meet.yes);
  }
  if (typeof body.started === 'boolean') {
    if (body.started && !state.started) state.startedAt = Date.now();
    if (!body.started) state.startedAt = 0;
    state.started = body.started;
  }
  state.updatedAt = Date.now();
  try {
    await save(state);
  } catch (err) {
    console.error('[mafia] db write failed', err);
    return NextResponse.json({ shared: false, admin, state: null, meet: null }, { status: 503 });
  }
  if (!meet) meet = await fetchMeet(state.meet.code);
  return NextResponse.json({ shared: true, admin, state, meet });
}
