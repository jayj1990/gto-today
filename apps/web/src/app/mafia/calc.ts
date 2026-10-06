// mafia.gto.today — 마피아 나이트 점수판의 자료형·점수 계산·송금 링크.
// 게임마다 라운드를 쌓고(이긴 사람·MVP), 합산 점수로 순위를 매겨 상금표에 꽂는다.
// 서버(/api/mafia)와 화면(mafia.tsx)이 같은 normalize 를 써서 저장된 JSON 모양이 어긋나도 안 터지게 한다.

export interface PayInfo {
  /** 토스 아이디(toss.me/아이디) 또는 토스 QR 링크(supertoss://…) */
  toss?: string;
  bank?: string;
  acct?: string;
}
export interface Round {
  id: string;
  winners: string[];
  mvp?: string;
  at: number;
}
export interface GameDef {
  id: string;
  name: string;
  /** 이긴 사람 1인당 점수 */
  winPts: number;
  /** MVP 추가 점수 */
  mvpPts: number;
}
export interface EventInfo {
  title: string;
  date: string;
  place: string;
  note: string;
}
export interface PaidMark {
  amount: number;
  at: number;
}
export interface MafiaState {
  event: EventInfo;
  players: string[];
  games: GameDef[];
  /** gameId → 라운드 목록(시간순) */
  rounds: Record<string, Round[]>;
  /** index = 등수-1, 원 단위 */
  prizes: number[];
  /** 동점일 때 앞에 둘 사람 순서(관리자가 ↑↓로 정함) */
  tiebreak: string[];
  /** 이름 → 송금처. 관리자에게만 내려간다. */
  pay?: Record<string, PayInfo>;
  paid: Record<string, PaidMark>;
  /** 포커투데이 모집 페이지(poker.gto.today/meet/{code}) 연결. 빈 문자열이면 없음. */
  meet: { code: string };
  /** 게임 시작 — 모집 페이지 참석자를 참가자로 옮긴 뒤 true */
  started: boolean;
  startedAt: number;
  updatedAt: number;
}

/** 모집 페이지 요약 — 서버가 poker.gto.today 에서 받아 응답에 실어 준다(저장 안 함). */
export interface MeetSummary {
  code: string;
  url: string;
  title: string;
  at: number;
  place: string;
  cap: number;
  closed: boolean;
  /** 참석(정원 안, 먼저 누른 순) */
  yes: string[];
  /** 참석이지만 정원 밖 */
  wait: string[];
  maybe: string[];
  noCount: number;
}

export const DEFAULT_EVENT: EventInfo = {
  title: '마피아 나이트',
  date: '',
  place: '',
  note: '',
};

// 2026-10-06 Jay 확정 — 5게임. 점수는 게임 길이에 맞춰 기본값만 두고 관리자가 바꿀 수 있다.
export const DEFAULT_GAMES: GameDef[] = [
  { id: 'werewolf', name: '한밤의 늑대인간', winPts: 2, mvpPts: 1 },
  { id: 'avalon', name: '아발론', winPts: 3, mvpPts: 1 },
  { id: 'cockroach', name: '바퀴벌레 포커', winPts: 1, mvpPts: 0 },
  { id: 'kraken', name: '피드 더 크라켄', winPts: 3, mvpPts: 1 },
  { id: 'saboteur', name: '사보타지', winPts: 2, mvpPts: 1 },
];

// 2026-10-06 Jay 확정 — 총 150만 중 20만은 보드게임 구매, 상금 풀 130만 중 129만 1천 배정.
export const DEFAULT_PRIZES: number[] = [
  600_000, 300_000, 200_000, 50_000, 50_000, 50_000, 15_000, 15_000, 10_000, 1_000,
];

export const MAX_PLAYERS = 30;
export const MAX_NAME = 24;

export function emptyState(): MafiaState {
  return {
    event: { ...DEFAULT_EVENT },
    players: [],
    games: DEFAULT_GAMES.map((g) => ({ ...g })),
    rounds: {},
    prizes: [...DEFAULT_PRIZES],
    tiebreak: [],
    paid: {},
    meet: { code: '' },
    started: false,
    startedAt: 0,
    updatedAt: 0,
  };
}

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}
export function cleanName(v: unknown): string {
  return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, MAX_NAME) : '';
}
function cleanText(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}
function cleanInt(v: unknown, fallback: number, min = 0, max = 100_000_000): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, Math.round(v)));
}
export function cleanPlayers(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of v) {
    const n = cleanName(raw);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
    if (out.length >= MAX_PLAYERS) break;
  }
  return out;
}
export function cleanGames(v: unknown): GameDef[] {
  if (!Array.isArray(v)) return DEFAULT_GAMES.map((g) => ({ ...g }));
  const out: GameDef[] = [];
  const seen = new Set<string>();
  for (const raw of v) {
    if (!isObj(raw)) continue;
    const id = cleanText(raw['id'], 32).replace(/[^a-z0-9_-]/gi, '');
    const name = cleanText(raw['name'], 40);
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      name,
      winPts: cleanInt(raw['winPts'], 1, 0, 100),
      mvpPts: cleanInt(raw['mvpPts'], 0, 0, 100),
    });
    if (out.length >= 20) break;
  }
  return out.length ? out : DEFAULT_GAMES.map((g) => ({ ...g }));
}
export function cleanRound(v: unknown): Round | null {
  if (!isObj(v)) return null;
  const id = cleanText(v['id'], 32).replace(/[^a-z0-9_-]/gi, '');
  if (!id) return null;
  const winners = cleanPlayers(v['winners']);
  const mvp = cleanName(v['mvp']);
  const r: Round = { id, winners, at: cleanInt(v['at'], Date.now(), 0, 4_102_444_800_000) };
  if (mvp) r.mvp = mvp;
  return r;
}
export function cleanRounds(v: unknown): Record<string, Round[]> {
  const out: Record<string, Round[]> = {};
  if (!isObj(v)) return out;
  for (const [gid, list] of Object.entries(v)) {
    if (!Array.isArray(list)) continue;
    const rounds: Round[] = [];
    const seen = new Set<string>();
    for (const raw of list) {
      const r = cleanRound(raw);
      if (!r || seen.has(r.id)) continue;
      seen.add(r.id);
      rounds.push(r);
      if (rounds.length >= 50) break;
    }
    out[gid] = rounds;
  }
  return out;
}
export function cleanPrizes(v: unknown): number[] {
  if (!Array.isArray(v)) return [...DEFAULT_PRIZES];
  return v.slice(0, MAX_PLAYERS).map((n) => cleanInt(n, 0));
}
export function cleanPay(v: unknown): PayInfo | null {
  if (!isObj(v)) return null;
  const p: PayInfo = {};
  const toss = cleanText(v['toss'], 120);
  const bank = cleanText(v['bank'], 20);
  const acct = cleanText(v['acct'], 40);
  if (toss) p.toss = toss;
  if (bank) p.bank = bank;
  if (acct) p.acct = acct;
  return toss || bank || acct ? p : null;
}

/** 저장된 JSON(또는 아무 값)을 안전한 상태로. 빠진 칸은 기본값. */
export function normalize(raw: unknown): MafiaState {
  const st = emptyState();
  if (!isObj(raw)) return st;
  if (isObj(raw['event'])) {
    const e = raw['event'];
    st.event = {
      title: cleanText(e['title'], 40) || DEFAULT_EVENT.title,
      date: cleanText(e['date'], 40),
      place: cleanText(e['place'], 60),
      note: cleanText(e['note'], 300),
    };
  }
  st.players = cleanPlayers(raw['players']);
  st.games = cleanGames(raw['games']);
  st.rounds = cleanRounds(raw['rounds']);
  st.prizes = cleanPrizes(raw['prizes']);
  st.tiebreak = cleanPlayers(raw['tiebreak']);
  if (isObj(raw['pay'])) {
    const pay: Record<string, PayInfo> = {};
    for (const [name, info] of Object.entries(raw['pay'])) {
      const p = cleanPay(info);
      const n = cleanName(name);
      if (p && n) pay[n] = p;
    }
    st.pay = pay;
  }
  if (isObj(raw['paid'])) {
    for (const [name, mark] of Object.entries(raw['paid'])) {
      const n = cleanName(name);
      if (!n || !isObj(mark)) continue;
      st.paid[n] = {
        amount: cleanInt(mark['amount'], 0),
        at: cleanInt(mark['at'], 0, 0, 4_102_444_800_000),
      };
    }
  }
  if (isObj(raw['meet'])) st.meet = { code: parseMeetCode(raw['meet']['code']) };
  st.started = raw['started'] === true;
  st.startedAt = cleanInt(raw['startedAt'], 0, 0, 4_102_444_800_000);
  st.updatedAt = cleanInt(raw['updatedAt'], 0, 0, 4_102_444_800_000);
  return st;
}

// ---------- 모집 페이지 연결 ----------

/** 링크(https://poker.gto.today/meet/abc, /poker/meet/abc)나 코드 그대로 → 코드. 모르면 ''. */
export function parseMeetCode(v: unknown): string {
  if (typeof v !== 'string') return '';
  const t = v.trim();
  if (!t) return '';
  const m = /\/meet\/([a-z0-9]+)/i.exec(t);
  const code = (m?.[1] ?? t).toLowerCase();
  return /^[a-z0-9]{4,20}$/.test(code) ? code : '';
}
export function meetUrl(code: string): string {
  return `https://poker.gto.today/meet/${code}`;
}
/** 이름은 대소문자·앞뒤 공백만 다르면 한 사람(포커투데이 규칙) */
export function sameName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
/** 모집 페이지 참석자를 참가자 명단에 더한다 — 이미 있는 사람은 그대로, 새 사람은 뒤에. */
export function mergePlayers(existing: string[], incoming: string[]): string[] {
  const out = [...existing];
  for (const raw of incoming) {
    const n = cleanName(raw);
    if (!n || out.some((p) => sameName(p, n))) continue;
    out.push(n);
    if (out.length >= MAX_PLAYERS) break;
  }
  return out;
}
/** 모집 페이지에는 있는데 참가자 명단에 없는 사람 */
export function missingPlayers(existing: string[], incoming: string[]): string[] {
  return incoming.filter((n) => !existing.some((p) => sameName(p, n)));
}
/** 모임 시각(epoch ms) → "10/18 (토) 19:00" */
export function fmtMeetAt(at: number): string {
  if (!at) return '';
  const d = new Date(at);
  const day = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()] ?? '';
  return `${d.getMonth() + 1}/${d.getDate()} (${day}) ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`;
}

// ---------- 점수·순위 ----------

export interface Tally {
  pts: number;
  wins: number;
  mvps: number;
}
export interface Standing extends Tally {
  name: string;
  /** 1부터 */
  rank: number;
  prize: number;
  /** 점수·MVP·승수가 같은 사람이 또 있다 */
  tied: boolean;
}

export function tallies(st: MafiaState): Record<string, Tally> {
  const out: Record<string, Tally> = {};
  for (const p of st.players) out[p] = { pts: 0, wins: 0, mvps: 0 };
  for (const g of st.games) {
    for (const r of st.rounds[g.id] ?? []) {
      for (const w of r.winners) {
        const t = out[w];
        if (!t) continue;
        t.pts += g.winPts;
        t.wins += 1;
      }
      if (r.mvp) {
        const t = out[r.mvp];
        if (t) {
          t.pts += g.mvpPts;
          t.mvps += 1;
        }
      }
    }
  }
  return out;
}

function tieKey(t: Tally): string {
  return `${t.pts}|${t.mvps}|${t.wins}`;
}

/** 점수 → MVP 수 → 승수 → 관리자 동점 순서 → 명단 순서. 등수는 1부터 빈틈없이. */
export function standings(st: MafiaState): Standing[] {
  const t = tallies(st);
  const order = new Map(st.players.map((p, i) => [p, i] as const));
  const manual = new Map(st.tiebreak.map((p, i) => [p, i] as const));
  const keyCount = new Map<string, number>();
  for (const p of st.players) {
    const k = tieKey(t[p] ?? { pts: 0, wins: 0, mvps: 0 });
    keyCount.set(k, (keyCount.get(k) ?? 0) + 1);
  }
  const sorted = [...st.players].sort((a, b) => {
    const ta = t[a] ?? { pts: 0, wins: 0, mvps: 0 };
    const tb = t[b] ?? { pts: 0, wins: 0, mvps: 0 };
    if (tb.pts !== ta.pts) return tb.pts - ta.pts;
    if (tb.mvps !== ta.mvps) return tb.mvps - ta.mvps;
    if (tb.wins !== ta.wins) return tb.wins - ta.wins;
    const ma = manual.get(a) ?? Number.POSITIVE_INFINITY;
    const mb = manual.get(b) ?? Number.POSITIVE_INFINITY;
    if (ma !== mb) return ma - mb;
    return (order.get(a) ?? 0) - (order.get(b) ?? 0);
  });
  return sorted.map((name, i) => {
    const tally = t[name] ?? { pts: 0, wins: 0, mvps: 0 };
    return {
      name,
      rank: i + 1,
      prize: st.prizes[i] ?? 0,
      tied: (keyCount.get(tieKey(tally)) ?? 0) > 1,
      ...tally,
    };
  });
}

/** 동점자 묶음 안에서 name 을 한 칸 위/아래로. 묶음 밖이면 그대로. */
export function moveInTie(st: MafiaState, name: string, dir: -1 | 1): string[] {
  const rows = standings(st);
  const i = rows.findIndex((r) => r.name === name);
  const j = i + dir;
  const a = rows[i];
  const b = rows[j];
  if (!a || !b) return st.tiebreak;
  if (tieKey(a) !== tieKey(b)) return st.tiebreak;
  // 묶음 전체를 현재 순서대로 tiebreak 에 올리고 둘만 바꾼다
  const group = rows.filter((r) => tieKey(r) === tieKey(a)).map((r) => r.name);
  const gi = group.indexOf(a.name);
  const gj = group.indexOf(b.name);
  if (gi < 0 || gj < 0) return st.tiebreak;
  const next = [...group];
  next[gi] = b.name;
  next[gj] = a.name;
  const rest = st.tiebreak.filter((p) => !group.includes(p));
  return [...rest, ...next];
}

// ---------- 표시 ----------

export function fmtWon(n: number): string {
  return `${Math.round(n).toLocaleString('ko-KR')}원`;
}
/** 600000 → "60만 원", 15000 → "1만 5천 원", 1000 → "1천 원", 1291000 → "129만 1천 원" */
export function fmtMan(n: number): string {
  const v = Math.round(n);
  if (v === 0) return '0원';
  const man = Math.floor(v / 10_000);
  const rest = v % 10_000;
  const restStr =
    rest === 0 ? '' : rest % 1000 === 0 ? `${rest / 1000}천` : rest.toLocaleString('ko-KR');
  if (man === 0) return `${restStr} 원`;
  return restStr ? `${man}만 ${restStr} 원` : `${man}만 원`;
}
export function fmtDay(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`;
}
export function rankLabel(rank: number): string {
  return `${rank}등`;
}

export function shareText(st: MafiaState, rows: Standing[], url: string): string {
  const lines = [
    `${st.event.title} 순위`,
    [st.event.date, st.event.place].filter(Boolean).join(' · '),
    '',
    ...rows.map(
      (r) =>
        `${r.rank}등 ${r.name} ${r.pts}점${r.prize ? ` · ${fmtMan(r.prize)}` : ''}${
          st.paid[r.name] ? ' ✅' : ''
        }`,
    ),
    '',
    url,
  ];
  return lines.filter((l, i) => !(i === 1 && !l)).join('\n');
}

// ---------- 송금 링크 (jopt/settle/calc.ts 와 같은 규칙) ----------

export function hasPay(v?: PayInfo | null): v is PayInfo {
  return !!(v?.toss || v?.acct);
}
function tossAccountUrl(bank: string, acct: string, amount: number): string {
  const q = new URLSearchParams();
  if (bank) q.set('bank', bank);
  q.set('accountNo', acct);
  if (amount > 0) q.set('amount', String(amount));
  q.set('origin', 'qr');
  return `supertoss://send?${q.toString()}`;
}
/** 금액까지 채워진 송금 링크. 토스 아이디 → toss.me, 계좌 → 토스 앱 딥링크(모바일 전용). */
export function payUrl(info: PayInfo | undefined, amountKrw: number): string | null {
  if (!info) return null;
  const amt = Math.max(0, Math.round(amountKrw));
  const raw = (info.toss ?? '').trim();
  if (raw.startsWith('supertoss://')) {
    try {
      const q = new URLSearchParams(raw.split('?')[1] ?? '');
      const bank = q.get('bank') ?? info.bank ?? '';
      const acct = q.get('accountNo') ?? info.acct ?? '';
      if (acct) return tossAccountUrl(bank, acct, amt);
    } catch {
      /* 형식이 깨졌으면 아래 규칙으로 */
    }
  }
  const id = raw
    .replace(/^https?:\/\/toss\.me\//i, '')
    .replace(/^@/, '')
    .split('/')[0];
  if (id && !id.includes(':')) return `https://toss.me/${encodeURIComponent(id)}/${amt}`;
  const acct = (info.acct ?? '').replace(/[^0-9]/g, '');
  if (acct) return tossAccountUrl(info.bank ?? '', acct, amt);
  return null;
}
/** 복사용 송금처 문자열("은행 계좌번호"). 계좌가 없으면 null. */
export function payAccount(info: PayInfo | undefined): string | null {
  if (!info?.acct) return null;
  return [info.bank, info.acct].filter(Boolean).join(' ');
}

export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
