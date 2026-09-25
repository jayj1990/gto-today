import { describe, expect, it } from 'vitest';
import { DEFAULT_RATE, EXPENSES, PEOPLE, type Expense } from './data';
import { combinedNets, netsFor, settleTransfers, shareMap } from './calc';

// 데이터 정합성 + 정산 계산이 성립하는지(손익 합 0, 송금 후 전원 0). data.ts 를 고칠 때 같이 돈다.
describe('jopt settle', () => {
  it('지정 몫(shares)의 합은 total 과 같다', () => {
    for (const e of EXPENSES.filter((x) => x.shares)) {
      const sum = Object.values(e.shares ?? {}).reduce((a, b) => a + (b ?? 0), 0);
      expect(sum, e.id).toBe(e.total);
    }
  });

  it('균등 분담도 사람별 몫의 합이 total 과 같다(나머지는 결제자)', () => {
    for (const e of EXPENSES.filter((x) => x.even)) {
      const sum = [...shareMap(e).values()].reduce((a, b) => a + b, 0);
      expect(sum, e.id).toBe(e.total);
    }
  });

  it('메모의 대표 숫자와 맞는다', () => {
    const by = Object.fromEntries(EXPENSES.map((e) => [e.id, e])) as Record<string, Expense>;
    expect(shareMap(by['yakitori']!).get('서원')).toBe(5000);
    expect(shareMap(by['unidon']!).get('준수')).toBe(9240);
    expect(shareMap(by['unidon']!).get('태균')).toBe(8140);
    expect(shareMap(by['coffee']!).get('민지')).toBe(880);
    expect(shareMap(by['conv']!).get('재호')).toBe(1647);
  });

  it('통화별 손익 합은 0 이고, 민지의 커피 몫은 손익에서 빠진다', () => {
    const jpy = netsFor(EXPENSES, 'JPY');
    const krw = netsFor(EXPENSES, 'KRW');
    expect(jpy.reduce((a, n) => a + n.net, 0)).toBe(0);
    expect(krw.reduce((a, n) => a + n.net, 0)).toBe(0);
    const minji = jpy.find((n) => n.name === '민지');
    expect(minji?.net).toBe(-1643); // 편의점 몫만
    const taegyun = krw.find((n) => n.name === '태균');
    expect(taegyun?.net).toBe(180000 * 8 + 42000 + 48000);
  });

  it('원화 합산 손익도 합이 0 이고 송금 후 전원 0 이 된다', () => {
    const nets = combinedNets(EXPENSES, DEFAULT_RATE);
    expect(nets.reduce((a, n) => a + n.net, 0)).toBe(0);
    const tr = settleTransfers(nets, 'KRW');
    const bal = new Map(nets.map((n) => [n.name, n.net]));
    for (const t of tr) {
      bal.set(t.from, (bal.get(t.from) ?? 0) + t.amount);
      bal.set(t.to, (bal.get(t.to) ?? 0) - t.amount);
      expect(t.amount).toBeGreaterThan(0);
    }
    for (const p of PEOPLE) expect(bal.get(p), p).toBe(0);
    // 0 이 아닌 사람 수 - 1 이 상한. 받을 사람 2명(재호·태균)이라 인원-1건 안쪽으로 나온다.
    const nz = nets.filter((n) => n.net !== 0).length;
    expect(tr.length).toBeLessThanOrEqual(nz - 1);
  });

  it('엔·원 따로도 각각 송금 후 0 이 된다', () => {
    for (const cur of ['JPY', 'KRW'] as const) {
      const nets = netsFor(EXPENSES, cur);
      const bal = new Map(nets.map((n) => [n.name, n.net]));
      for (const t of settleTransfers(nets, cur)) {
        bal.set(t.from, (bal.get(t.from) ?? 0) + t.amount);
        bal.set(t.to, (bal.get(t.to) ?? 0) - t.amount);
      }
      for (const p of PEOPLE) expect(bal.get(p), `${cur} ${p}`).toBe(0);
    }
  });
});
