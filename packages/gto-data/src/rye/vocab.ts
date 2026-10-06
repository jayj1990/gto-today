import type { PreflopActionIntent, PreflopActionKind } from '@gto/poker-core';

/**
 * RYE(Raise Your Edge, bencb) 차트 범례 → 우리 액션 어휘.
 *
 * 원본 범례는 "call vs 3bet ip", "4bet/jam <30bb" 처럼 영어 약어라 그대로
 * 보여 주면 안 읽힌다. 한 줄 한국어 라벨 + 조건은 note 로 뺀다. kind 는 이
 * 핸드로 하는 첫 액션(오픈 = raise, 림프 = limp, 리잼 = jam)이라 채점이
 * 4지선다로 접힐 때 틀리지 않는다. 블러프는 intent 로 표시해 격자에 사선이
 * 얹히고, 라벨 뒤에 "블러프"가 자동으로 붙으니 label 에 또 쓰지 않는다.
 *
 * 같은 뜻의 표기 차이("bluff 3bet" / "bluff3bet", "4bet value" / "4bet broke")
 * 는 같은 라벨로 모은다. 키는 build-rye 가 원본 라벨을 슬러그로 만들어 준다.
 *
 * 스택 조건("50bb+", "<30bb", 리잼의 "25bb")은 note 로 보여 주는 데서 그치지
 * 않고 stack 으로도 적는다. 화면이 스택 하나를 고르면 resolveStack 이 조건을
 * 풀어 칠하는데, 그때 조건 밖 스택에서 뭘 하는지(else)가 있어야 한다. 원본
 * 차트는 그 자리를 비워 두고 영상에서 말로 설명하니, 여기 적은 else 는 차트
 * 구조에서 읽어 낸 것이다: "3벳엔 콜 50bb+" 의 반대는 3벳엔 폴드, "4벳 밸류
 * <50bb" 의 반대는 3벳엔 콜(같은 차트에서 AA·KK 만 무조건 4벳이고 AK·QQ 는
 * 조건부 4벳이니 깊으면 콜), 리잼 "Nbb" 의 반대는 폴드. else 는 원본 라벨이고
 * 그 차트 범례에 없으면 build-rye 가 만들어 넣는다.
 */
export interface RyeStackRule {
  readonly gte?: number;
  readonly lt?: number;
  readonly lte?: number;
  /** 원본 라벨(이 표의 키). */
  readonly else: string;
}

export interface RyeVocabEntry {
  readonly kind: PreflopActionKind;
  readonly intent?: PreflopActionIntent;
  readonly size?: string;
  readonly label: string;
  readonly note?: string;
  readonly stack?: RyeStackRule;
}

const FOLD_3BET = 'fold vs 3bet';
const CALL_3BET = 'call vs 3bet';

const OPEN = '오픈';
const LIMP = '림프';

export const RYE_VOCAB: Readonly<Record<string, RyeVocabEntry>> = {
  // ── 오픈 레이즈 차트: 오픈 뒤 3벳을 맞았을 때의 계획 ──
  raise: { kind: 'raise', label: '오픈 레이즈' },
  'fold vs 3bet': { kind: 'raise', label: `${OPEN} · 3벳엔 폴드` },
  'openraise/fold vs 3bet': { kind: 'raise', label: `${OPEN} · 3벳엔 폴드` },
  'openraise/fold': { kind: 'raise', label: `${OPEN} · 3벳엔 폴드` },
  'raise/fold': { kind: 'raise', label: `${OPEN} · 3벳엔 폴드` },
  'call vs 3bet': { kind: 'raise', label: `${OPEN} · 3벳엔 콜` },
  'call 3bet': { kind: 'raise', label: `${OPEN} · 3벳엔 콜` },
  'openraise/call vs 3bet': { kind: 'raise', label: `${OPEN} · 3벳엔 콜` },
  'raise/call': { kind: 'raise', label: `${OPEN} · 3벳엔 콜` },
  'call 3bet 50bb+': {
    kind: 'raise',
    label: `${OPEN} · 3벳엔 콜`,
    note: '50bb 이상일 때만',
    stack: { gte: 50, else: FOLD_3BET },
  },
  'call vs 3bet 40bb+': {
    kind: 'raise',
    label: `${OPEN} · 3벳엔 콜`,
    note: '40bb 이상일 때만',
    stack: { gte: 40, else: FOLD_3BET },
  },
  'call vs 3bet oop': { kind: 'raise', label: `${OPEN} · 3벳엔 콜`, note: 'OOP 일 때' },
  'call vs 3bet ip': { kind: 'raise', label: `${OPEN} · 3벳엔 콜`, note: 'IP 일 때' },
  'raise + call 3bet only 50bb+': {
    kind: 'raise',
    label: '레이즈',
    note: '3벳엔 50bb 이상에서만 콜',
    stack: { gte: 50, else: 'raise to 3.5x bb + fold to 4bet' },
  },
  '4bet value': { kind: 'raise', label: `${OPEN} · 4벳 밸류` },
  '4bet broke': { kind: 'raise', label: `${OPEN} · 4벳 밸류`, note: '5벳 올인엔 콜' },
  '4bet <50bb value': {
    kind: 'raise',
    label: `${OPEN} · 4벳 밸류`,
    note: '50bb 미만일 때',
    stack: { lt: 50, else: CALL_3BET },
  },
  '4bet <40bb value': {
    kind: 'raise',
    label: `${OPEN} · 4벳 밸류`,
    note: '40bb 미만일 때',
    stack: { lt: 40, else: CALL_3BET },
  },
  '4bet all in': { kind: 'raise', label: `${OPEN} · 4벳 올인` },
  '4bet/jam <30bb': {
    kind: 'raise',
    label: `${OPEN} · 4벳 올인`,
    note: '30bb 미만일 때',
    stack: { lt: 30, else: CALL_3BET },
  },
  '4bet/jam <40bb': {
    kind: 'raise',
    label: `${OPEN} · 4벳 올인`,
    note: '40bb 미만일 때',
    stack: { lt: 40, else: CALL_3BET },
  },
  '4bet bluff': { kind: 'raise', intent: 'bluff', label: `${OPEN} · 4벳` },
  '4bet bluff ip': { kind: 'raise', intent: 'bluff', label: `${OPEN} · 4벳`, note: 'IP 일 때' },
  '4bet bluff oop': { kind: 'raise', intent: 'bluff', label: `${OPEN} · 4벳`, note: 'OOP 일 때' },
  '4bet bluff <50bb': {
    kind: 'raise',
    intent: 'bluff',
    label: `${OPEN} · 4벳`,
    note: '50bb 미만일 때',
    stack: { lt: 50, else: FOLD_3BET },
  },
  '4bet bluff <50bb oop': {
    kind: 'raise',
    intent: 'bluff',
    label: `${OPEN} · 4벳`,
    note: '50bb 미만 OOP 일 때',
    stack: { lt: 50, else: FOLD_3BET },
  },
  'openraise/call rejam': { kind: 'raise', label: `${OPEN} · 리잼엔 콜` },
  openjam: { kind: 'jam', label: '오픈 올인' },
  jam: { kind: 'jam', label: '올인' },

  // ── 림프 전략(SB 믹스, 25bb BU vs 공격적 블라인드) ──
  'limp/call': { kind: 'limp', label: `${LIMP} · 레이즈엔 콜` },
  'limp/call vs raise': { kind: 'limp', label: `${LIMP} · 레이즈엔 콜` },
  'limp/fold': { kind: 'limp', label: `${LIMP} · 레이즈엔 폴드` },
  'limp/3bet': { kind: 'limp', label: `${LIMP} · 레이즈엔 3벳` },
  'limp/3bet value': { kind: 'limp', label: `${LIMP} · 레이즈엔 3벳` },
  'limp/3bet bluff': { kind: 'limp', intent: 'bluff', label: `${LIMP} · 레이즈엔 3벳` },
  'limp/jam': { kind: 'limp', label: `${LIMP} · 레이즈엔 올인` },
  'limp/call vs 3x isoraise': { kind: 'limp', label: `${LIMP} · 3x 아이소엔 콜` },
  'limp/fold vs 3x isoraise': { kind: 'limp', label: `${LIMP} · 3x 아이소엔 폴드` },

  // ── BB vs SB 림프 ──
  'check behind': { kind: 'check', label: '체크' },
  'raise to 3.5x bb bluff': { kind: 'raise', intent: 'bluff', size: '3.5x', label: '레이즈' },
  'raise to 3.5x bb + broke': { kind: 'raise', size: '3.5x', label: '레이즈', note: '올인까지' },
  // 15-20bb 차트가 "bluff" 라 부르는 그 자리(같은 금색)가 깊어지면
  // "fold to all in / fold to 4bet" 이 된다. 저항엔 접는 레이즈 = 블러프.
  'raise to 3.5x bb + fold to all in': {
    kind: 'raise',
    intent: 'bluff',
    size: '3.5x',
    label: '레이즈',
    note: '올인엔 폴드',
  },
  'raise to 3.5x bb + fold to 4bet': {
    kind: 'raise',
    intent: 'bluff',
    size: '3.5x',
    label: '레이즈',
    note: '4벳엔 폴드',
  },
  'raise to 3.5x bb + call 3x 4bet': {
    kind: 'raise',
    size: '3.5x',
    label: '레이즈',
    note: '3x 4벳엔 콜',
  },
  'raise to 3.5x bb + 4bet <100bb': {
    kind: 'raise',
    size: '3.5x',
    label: '레이즈',
    note: '100bb 미만이면 4벳',
    stack: { lt: 100, else: 'raise to 3.5x bb + call 3x 4bet' },
  },

  // ── 앞 포지션 오픈에 3벳 · 콜 ──
  flatcall: { kind: 'call', label: '콜' },
  'flat if table super soft': { kind: 'call', label: '콜', note: '테이블이 아주 약할 때만' },
  'flat if villian or players behind fish': {
    kind: 'call',
    label: '콜',
    note: '상대나 뒤에 피시가 있을 때만',
  },
  'value 3bet': { kind: 'raise', label: '3벳 밸류' },
  'value 3bet + broke <75bb': {
    kind: 'raise',
    label: '3벳 밸류',
    note: '75bb 미만이면 올인까지',
    stack: { lt: 75, else: 'value 3bet' },
  },
  'bluff 3bet': { kind: 'raise', intent: 'bluff', label: '3벳' },
  bluff3bet: { kind: 'raise', intent: 'bluff', label: '3벳' },
  '3bet + call 4bet': { kind: 'raise', label: '3벳 · 4벳엔 콜' },
  '3bet + call 4bet 75bb+': {
    kind: 'raise',
    label: '3벳 · 4벳엔 콜',
    note: '75bb 이상일 때',
    stack: { gte: 75, else: '3bet/fold' },
  },
  '3bet/fold': { kind: 'raise', label: '3벳 · 4벳엔 폴드' },

  // ── 리잼 ──
  // 폴드는 원본 범례에 없어(빈 칸) build-rye 가 붙이지만, 리잼 조건의 else 로 쓰인다.
  fold: { kind: 'fold', label: '폴드' },
  '3bet/call': { kind: 'raise', label: '3벳 · 올인엔 콜' },
  '30bb': { kind: 'jam', label: '리잼', note: '30bb 이하일 때', stack: { lte: 30, else: 'fold' } },
  '25bb': { kind: 'jam', label: '리잼', note: '25bb 이하일 때', stack: { lte: 25, else: 'fold' } },
  '20bb': { kind: 'jam', label: '리잼', note: '20bb 이하일 때', stack: { lte: 20, else: 'fold' } },
  '15bb': { kind: 'jam', label: '리잼', note: '15bb 이하일 때', stack: { lte: 15, else: 'fold' } },
};
