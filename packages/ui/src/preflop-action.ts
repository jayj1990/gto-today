/**
 * 프리플랍 액션의 "보이는 쪽".
 *
 * 어휘 자체(ActionKind / ActionIntent / ActionSpec)는 @gto/poker-core 에 있다.
 * 데이터 패키지(gto-data)와 화면이 같은 말을 써야 하기 때문이다. 여기에는
 * 색과 무늬를 고르는 규칙만 둔다.
 */
import type {
  ActionSpec,
  ComboActions,
  PreflopActionIntent,
  PreflopActionKind,
} from '@gto/poker-core';

export type { ActionSpec, ComboActions };
/** 짧은 별칭 — 이 패키지 밖에서 쓰던 이름을 유지한다. */
export type ActionKind = PreflopActionKind;
export type ActionIntent = PreflopActionIntent;

/** kind → 색 토큰. 하드코딩 금지 원칙에 따라 전부 CSS 변수로 건다. */
const KIND_COLOR: Record<ActionKind, string> = {
  fold: 'var(--color-fold)',
  check: 'var(--color-check)',
  limp: 'var(--color-limp)',
  call: 'var(--color-call)',
  raise: 'var(--color-raise)',
  // 올인은 기존 화면이 쓰던 골드를 유지한다. 진홍(raise-deep)으로 바꿨더니
  // 13x13 격자에서 레이즈 빨강과 구분이 안 됐다.
  jam: 'var(--color-gold)',
};

/**
 * 셀을 채울 CSS background.
 *
 * 밸류는 단색, 블러프는 같은 색의 45° 사선 줄무늬다. 색을 따로 주지 않고
 * 무늬로 가르는 쪽을 택한 이유: 멀리서는 "빨강 = 공격"이 한눈에 남고,
 * 가까이 보면 밸류와 블러프가 갈린다. 색을 늘리면 13×13 격자에서 색이
 * 열 개 넘게 경쟁해 둘 다 안 읽힌다.
 */
export function actionFill(spec: ActionSpec): string {
  return fillFor(spec, 3);
}

/** 범례 스와치처럼 작은 칸에서는 줄무늬 간격을 좁힌다. */
export function actionSwatchFill(spec: ActionSpec): string {
  return fillFor(spec, 2);
}

function fillFor(spec: ActionSpec, stripe: number): string {
  const c = KIND_COLOR[spec.kind];
  if (spec.intent === 'bluff') {
    return `repeating-linear-gradient(45deg, ${c} 0 ${stripe}px, color-mix(in oklab, ${c} 45%, #000) ${stripe}px ${stripe * 2}px)`;
  }
  if (spec.intent === 'thin') {
    return `color-mix(in oklab, ${c} 68%, var(--color-surface))`;
  }
  return c;
}

/** 라벨 + 사이즈를 한 줄로. 범례와 상세 시트가 같은 문자열을 쓰게 한다. */
export function actionLabel(spec: ActionSpec): string {
  return spec.size ? `${spec.label} ${spec.size}` : spec.label;
}

/**
 * 의도까지 붙인 라벨.
 *
 * 범례는 스와치 무늬로 밸류와 블러프가 갈리지만, 막대 차트에서는 같은
 * 사이즈의 두 줄이 글자로만 보면 똑같아진다("레이즈 8.5bb" 두 번).
 * 그래서 막대 쪽은 이쪽을 쓴다.
 */
export function actionLabelFull(spec: ActionSpec): string {
  const base = actionLabel(spec);
  if (spec.intent === 'bluff') return `${base} 블러프`;
  if (spec.intent === 'thin') return `${base} 씬밸류`;
  return base;
}

/**
 * 옛 ComboMix(allin/raise/call/fold)를 새 어휘로 올리는 범례.
 * 기존 화면들은 이걸 거쳐 그대로 돈다.
 */
export const LEGACY_ACTIONS: readonly ActionSpec[] = [
  { key: 'allin', kind: 'jam', label: '올인' },
  { key: 'raise', kind: 'raise', label: '레이즈' },
  { key: 'call', kind: 'call', label: '콜' },
  { key: 'fold', kind: 'fold', label: '폴드' },
];

/** 차트가 실제로 쓰는 액션만 추린다. 빈도 0 뿐인 액션은 범례에서 뺀다. */
export function usedActions(
  actions: readonly ActionSpec[],
  cells: Record<string, ComboActions>,
): readonly ActionSpec[] {
  const seen = new Set<string>();
  for (const cell of Object.values(cells)) {
    for (const [k, v] of Object.entries(cell)) if (v > 0) seen.add(k);
  }
  return actions.filter((a) => seen.has(a.key));
}
