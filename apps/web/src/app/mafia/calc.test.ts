import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PRIZES,
  emptyState,
  fmtMan,
  mergePlayers,
  missingPlayers,
  moveInTie,
  normalize,
  parseMeetCode,
  payUrl,
  standings,
  type MafiaState,
} from './calc';

function base(): MafiaState {
  const st = emptyState();
  st.players = ['가', '나', '다', '라'];
  st.games = [
    { id: 'g1', name: 'G1', winPts: 3, mvpPts: 1 },
    { id: 'g2', name: 'G2', winPts: 1, mvpPts: 0 },
  ];
  return st;
}

describe('normalize', () => {
  it('아무 값이나 넣어도 기본값으로 선다', () => {
    const st = normalize(null);
    expect(st.players).toEqual([]);
    expect(st.games.length).toBe(5);
    expect(st.prizes).toEqual(DEFAULT_PRIZES);
    expect(normalize({ players: ['a', ' a ', '', 'b'] }).players).toEqual(['a', 'b']);
  });
  it('라운드·송금처·완료 표시를 정리해서 올린다', () => {
    const st = normalize({
      rounds: { g1: [{ id: 'r1', winners: ['가', '가', '나'], mvp: '가', at: 5 }, { id: '' }] },
      pay: { 가: { toss: 'jay', acct: '' }, 나: {} },
      paid: { 가: { amount: 1000.4, at: 1 } },
    });
    expect(st.rounds['g1']).toEqual([{ id: 'r1', winners: ['가', '나'], mvp: '가', at: 5 }]);
    expect(st.pay).toEqual({ 가: { toss: 'jay' } });
    expect(st.paid).toEqual({ 가: { amount: 1000, at: 1 } });
  });
});

describe('standings', () => {
  it('점수 → MVP → 승수 → 명단 순서로 줄 세우고 등수는 1부터', () => {
    const st = base();
    st.rounds = {
      g1: [{ id: 'a', winners: ['가', '나'], mvp: '나', at: 1 }],
      g2: [{ id: 'b', winners: ['가', '다'], at: 2 }],
    };
    const rows = standings(st);
    expect(rows.map((r) => [r.rank, r.name, r.pts])).toEqual([
      [1, '나', 4],
      [2, '가', 4],
      [3, '다', 1],
      [4, '라', 0],
    ]);
    // 가·나 둘 다 4점, 나는 MVP 가 있어서 위
  });
});

describe('standings tie rules', () => {
  it('같은 점수면 MVP 수가 많은 쪽이 위', () => {
    const st = base();
    st.rounds = {
      g1: [{ id: 'a', winners: ['가', '나'], mvp: '나', at: 1 }],
      g2: [{ id: 'b', winners: ['가'], at: 2 }],
    };
    // 가 3+1=4, 나 3+1(MVP)=4 → MVP 가 있는 나가 위
    const rows = standings(st);
    expect(rows[0]?.name).toBe('나');
    expect(rows[1]?.name).toBe('가');
    expect(rows[0]?.tied).toBe(false);
  });
  it('완전 동점은 tied 로 표시되고 상금은 자리 순서대로 붙는다', () => {
    const st = base();
    st.prizes = [100, 50, 10, 1];
    st.rounds = { g2: [{ id: 'b', winners: ['다', '라'], at: 2 }] };
    const rows = standings(st);
    expect(rows.map((r) => [r.name, r.tied, r.prize])).toEqual([
      ['다', true, 100],
      ['라', true, 50],
      ['가', true, 10],
      ['나', true, 1],
    ]);
  });
  it('관리자 동점 순서(tiebreak)가 명단 순서보다 앞선다', () => {
    const st = base();
    st.rounds = { g2: [{ id: 'b', winners: ['다', '라'], at: 2 }] };
    st.tiebreak = moveInTie(st, '라', -1);
    expect(st.tiebreak).toEqual(['라', '다']);
    expect(standings(st).map((r) => r.name)).toEqual(['라', '다', '가', '나']);
    // 묶음이 다르면 안 움직인다
    expect(moveInTie(st, '가', -1)).toEqual(st.tiebreak);
  });
});

describe('fmtMan', () => {
  it('만·천 단위로 읽기 쉽게', () => {
    expect(fmtMan(600_000)).toBe('60만 원');
    expect(fmtMan(15_000)).toBe('1만 5천 원');
    expect(fmtMan(1_000)).toBe('1천 원');
    expect(fmtMan(1_291_000)).toBe('129만 1천 원');
    expect(fmtMan(12_345)).toBe('1만 2,345 원');
    expect(fmtMan(0)).toBe('0원');
  });
});

describe('payUrl', () => {
  it('토스 아이디면 toss.me 에 금액을 붙인다', () => {
    expect(payUrl({ toss: '@jay' }, 15000)).toBe('https://toss.me/jay/15000');
    expect(payUrl({ toss: 'https://toss.me/jay/1' }, 100)).toBe('https://toss.me/jay/100');
  });
  it('계좌만 있으면 토스 딥링크', () => {
    const u = payUrl({ bank: '카카오뱅크', acct: '3333-01-1234567' }, 1000);
    expect(u?.startsWith('supertoss://send?')).toBe(true);
    expect(u).toContain('accountNo=3333011234567');
    expect(u).toContain('amount=1000');
    expect(payUrl(undefined, 1)).toBeNull();
  });
});

describe('모집 페이지 연결', () => {
  it('링크·경로·코드 어느 모양이든 코드만 뽑는다', () => {
    expect(parseMeetCode('https://poker.gto.today/meet/ey2cysk7rg')).toBe('ey2cysk7rg');
    expect(parseMeetCode('/poker/meet/EY2CYSK7RG?x=1')).toBe('ey2cysk7rg');
    expect(parseMeetCode('  ey2cysk7rg ')).toBe('ey2cysk7rg');
    expect(parseMeetCode('https://poker.gto.today/')).toBe('');
    expect(parseMeetCode('')).toBe('');
    expect(normalize({ meet: { code: 'https://poker.gto.today/meet/abcd1234' } }).meet.code).toBe(
      'abcd1234',
    );
  });
  it('참석자를 합칠 때 이미 있는 사람은 두고 새 사람만 뒤에 붙인다', () => {
    expect(mergePlayers(['Jay', '민수'], ['jay ', '혜지', '민수', '태균'])).toEqual([
      'Jay',
      '민수',
      '혜지',
      '태균',
    ]);
    expect(missingPlayers(['Jay', '민수'], ['jay', '혜지'])).toEqual(['혜지']);
  });
});
