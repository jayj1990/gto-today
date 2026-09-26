// 정산 계산 — 지출 목록 → 사람별 손익 → 최소 횟수 송금.
// 최소 송금 알고리즘은 Poker Today(currentive-web src/app/poker/lib.ts settleTransfers)에서 가져왔다.
import { PEOPLE, type Cur, type Expense, type Person } from './data';

export interface Net {
  name: Person;
  net: number;
}

export interface Transfer {
  from: Person;
  to: Person;
  amount: number;
  cur: Cur;
}

/** 한 지출에서 사람별 부담액. 균등 분담의 나머지는 결제자가 진다(합이 total 과 정확히 같아야 손익 합이 0). */
export function shareMap(e: Expense): Map<Person, number> {
  const out = new Map<Person, number>();
  if (e.shares) {
    for (const [name, amt] of Object.entries(e.shares) as [Person, number][]) {
      if (amt) out.set(name, amt);
    }
    return out;
  }
  const even = e.even ?? [];
  const weights = even.reduce((a, p) => a + (p.weight ?? 1), 0);
  if (weights === 0) return out;
  const unit = Math.floor(e.total / weights);
  let used = 0;
  for (const p of even) {
    const v = unit * (p.weight ?? 1);
    out.set(p.name, v);
    used += v;
  }
  const rest = e.total - used;
  if (rest) out.set(e.payer, (out.get(e.payer) ?? 0) + rest);
  return out;
}

/** 통화별 손익. 양수 = 받을 돈, 음수 = 보낼 돈. 이미 결제자에게 직접 준 사람(prepaid)은 양쪽에서 뺀다. */
export function netsFor(expenses: Expense[], cur: Cur): Net[] {
  const acc = new Map<Person, number>();
  for (const p of PEOPLE) acc.set(p, 0);
  for (const e of expenses) {
    if (e.cur !== cur) continue;
    const shares = shareMap(e);
    let paid = e.total;
    for (const p of e.prepaid ?? []) {
      paid -= shares.get(p) ?? 0;
      shares.delete(p);
    }
    acc.set(e.payer, (acc.get(e.payer) ?? 0) + paid);
    for (const [name, amt] of shares) acc.set(name, (acc.get(name) ?? 0) - amt);
  }
  return PEOPLE.map((name) => ({ name, net: acc.get(name) ?? 0 }));
}

/** 엔 → 원 (rate = 원/100엔) */
export function jpyToKrw(jpy: number, rate: number): number {
  return Math.round((jpy * rate) / 100);
}

/**
 * 엔화 손익을 원화로 바꿔 원화 손익과 합친다. 반올림으로 합이 0 에서 몇 원 어긋나면
 * 절댓값이 가장 큰 사람에게 몰아 합을 0 으로 맞춘다 — 송금 계산이 성립하려면 합이 정확히 0 이어야 한다.
 */
export function combinedNets(expenses: Expense[], rate: number): Net[] {
  const jpy = netsFor(expenses, 'JPY');
  const krw = netsFor(expenses, 'KRW');
  const out = PEOPLE.map((name, i) => ({
    name,
    net: jpyToKrw(jpy[i]?.net ?? 0, rate) + (krw[i]?.net ?? 0),
  }));
  const drift = out.reduce((a, n) => a + n.net, 0);
  if (drift !== 0 && out.length) {
    const top = out.reduce((a, n) => (Math.abs(n.net) > Math.abs(a.net) ? n : a));
    top.net -= drift;
  }
  return out;
}

// 큰 금액끼리 맞물리는 그리디 — 합 0인 그룹에서 인원-1건을 만든다.
function greedySettle(nets: Net[], cur: Cur): Transfer[] {
  const debtors = nets
    .filter((p) => p.net < 0)
    .map((p) => ({ name: p.name, amt: -p.net }))
    .sort((a, b) => b.amt - a.amt);
  const creditors = nets
    .filter((p) => p.net > 0)
    .map((p) => ({ name: p.name, amt: p.net }))
    .sort((a, b) => b.amt - a.amt);
  const out: Transfer[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];
    if (!d || !c) break;
    const amt = Math.min(d.amt, c.amt);
    if (amt > 0) out.push({ from: d.name, to: c.name, amount: amt, cur });
    d.amt -= amt;
    c.amt -= amt;
    if (d.amt === 0) i++;
    if (c.amt === 0) j++;
  }
  return out;
}

/**
 * 손익 목록 → 최소 횟수 송금 목록.
 * 합이 0이 되는 소그룹으로 최대한 쪼갤수록 송금이 줄어든다(그룹당 인원-1건).
 * 12명 이하는 비트마스크 DP로 최적 분할을 찾고, 그 이상은 그리디로.
 */
export function settleTransfers(nets: Net[], cur: Cur): Transfer[] {
  const nz = nets.filter((p) => p.net !== 0);
  if (nz.length < 2) return [];
  if (nz.length > 12) return greedySettle(nz, cur);

  const n = nz.length;
  const sums = new Array<number>(1 << n).fill(0);
  for (let mask = 1; mask < 1 << n; mask++) {
    const low = mask & -mask;
    sums[mask] = (sums[mask ^ low] ?? 0) + (nz[31 - Math.clz32(low)]?.net ?? 0);
  }
  const popcount = (m: number) => {
    let c = 0;
    while (m) {
      m &= m - 1;
      c++;
    }
    return c;
  };
  const memo = new Map<number, number>();
  const choice = new Map<number, number>();
  const solve = (mask: number): number => {
    if (mask === 0) return 0;
    const hit = memo.get(mask);
    if (hit !== undefined) return hit;
    const low = mask & -mask;
    let best = Infinity;
    let bestSub = mask;
    for (let sub = mask; sub > 0; sub = (sub - 1) & mask) {
      if (!(sub & low) || sums[sub] !== 0) continue;
      const cand = popcount(sub) - 1 + solve(mask ^ sub);
      if (cand < best) {
        best = cand;
        bestSub = sub;
      }
    }
    if (best === Infinity) {
      best = popcount(mask) - 1;
      bestSub = mask;
    }
    memo.set(mask, best);
    choice.set(mask, bestSub);
    return best;
  };

  const full = (1 << n) - 1;
  solve(full);
  const out: Transfer[] = [];
  let mask = full;
  while (mask) {
    const sub = choice.get(mask) ?? mask;
    out.push(
      ...greedySettle(
        nz.filter((_, i) => sub & (1 << i)),
        cur,
      ),
    );
    mask ^= sub;
  }
  // 받는 사람 → 금액 큰 순으로 정렬해 목록이 안정적으로 보이게
  return out.sort((a, b) => a.to.localeCompare(b.to) || b.amount - a.amount);
}

export function transferKey(t: Transfer): string {
  return `${t.from}>${t.to}>${t.cur}`;
}

export function fmt(n: number, cur: Cur): string {
  const abs = Math.abs(n).toLocaleString('ko-KR');
  return `${n < 0 ? '-' : ''}${abs}${cur === 'JPY' ? '엔' : '원'}`;
}

// ---------- 송금처 ----------
// Poker Today(currentive-web src/app/poker/lib.ts payUrl)의 한국 계좌 분기만 옮겼다.
// 받는 사람의 송금 정보는 /api/jopt/settle 이 KvBlob 에서 읽어 준다(클라이언트는 못 바꾼다).
export interface PayInfo {
  /** 토스 아이디(toss.me/아이디) 또는 토스 QR 링크(supertoss://…) */
  toss?: string;
  /** 카카오페이 개인 송금 링크(https://qr.kakaopay.com/…) */
  kakao?: string;
  bank?: string;
  acct?: string;
}

export function hasPay(v?: PayInfo | null): v is PayInfo {
  return !!(v?.toss || v?.kakao || v?.acct);
}

function tossAccountUrl(bank: string, acct: string, amount: number): string {
  const q = new URLSearchParams({
    amount: String(Math.max(0, Math.round(amount))),
    bank,
    // 하이픈을 넣어 저장했어도 토스 링크에는 숫자만 넘어가야 앱이 계좌를 알아본다
    accountNo: acct.replace(/[^0-9]/g, ''),
    origin: 'qr',
  });
  return `supertoss://send?${q.toString()}`;
}

/** 금액까지 채워진 송금 링크. 토스 아이디 → toss.me, 계좌 → 토스 앱 딥링크(모바일 전용), 카카오페이 링크 순. */
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
  const kakao = (info.kakao ?? '').trim();
  if (kakao) return kakao.startsWith('http') ? kakao : `https://${kakao}`;
  return null;
}

/** 복사용 송금처 문자열("은행 계좌번호"). 계좌가 없으면 null. */
export function payAccount(info: PayInfo | undefined): string | null {
  if (!info?.acct) return null;
  return [info.bank, info.acct].filter(Boolean).join(' ');
}
