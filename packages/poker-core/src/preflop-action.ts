/**
 * 프리플랍 액션 어휘 — 레이즈/폴드 2단 구조를 걷어낸 자리.
 *
 * 예전 모델은 한 콤보를 allin/raise/call/fold 네 칸으로만 적었다. 그래서
 * "3.5x 밸류 레이즈"와 "3.5x 블러프 레이즈"가 한 칸으로 뭉개졌고, 솔버
 * 트리가 2.5bb 와 8.5bb 를 따로 들고 있어도 둘 다 그냥 '레이즈'가 됐다.
 * 블러프 비중과 사이즈 분포는 프리플랍 공부의 알맹이인데 화면에서 사라진 셈이다.
 *
 * 어휘를 고정 enum 으로 박지 않은 이유: 차트마다 범례가 다르다. 같은 빨강이
 * 어떤 차트에서는 "3.5x + broke", 다른 차트에서는 "4bet 밸류"다. 그래서
 * 차트가 자기 범례(ActionSpec[])를 데이터로 들고 다니고, 화면은 kind 로
 * 색을, intent 로 무늬를 고른다. 새 범례가 들어와도 렌더러는 그대로다.
 */

/** 액션의 종류. 화면에서 색을 정하고, 채점에서 4지선다로 접힌다. */
export type PreflopActionKind = 'fold' | 'check' | 'limp' | 'call' | 'raise' | 'jam';

/** 같은 종류 안에서의 의도. 화면에서 무늬를 정한다. */
export type PreflopActionIntent = 'value' | 'bluff' | 'thin';

export interface ActionSpec {
  /** 한 차트 안에서 유일하면 되는 키. 셀 빈도를 여기에 건다. */
  readonly key: string;
  readonly kind: PreflopActionKind;
  /** 생략하면 value 로 본다. */
  readonly intent?: PreflopActionIntent;
  /** "3.5x", "8.5bb", "올인" 처럼 사람이 읽는 사이즈. */
  readonly size?: string;
  /**
   * 같은 종류 안에서의 색 농도(0..1). 벳 사이즈가 커질수록 1 에 가깝게 준다.
   *
   * 포스트플랍은 1/3벳부터 오버벳까지 전부 raise 라서 종류만으로는 다 같은
   * 빨강이 된다. 크기 순서를 색의 진하기로 옮겨야 격자에서 구분이 된다.
   */
  readonly shade?: number;
  /** 범례·상세 시트에 그대로 쓰는 한국어 라벨. */
  readonly label: string;
  /** "올인에는 폴드" 같은 꼬리말. 범례에만 작게 붙는다. */
  readonly note?: string;
}

/** 콤보 하나의 액션별 빈도. 합이 1(또는 100)이면 된다. */
export type ComboActions = Readonly<Record<string, number>>;

/** 차트 하나 — 범례와 169칸. */
export interface PreflopChartData {
  readonly actions: readonly ActionSpec[];
  readonly cells: Readonly<Record<string, ComboActions>>;
}

/** 한 콤보의 범례 + 빈도. 퀴즈 스팟이 들고 다니는 조각. */
export interface ActionBreakdown {
  readonly actions: readonly ActionSpec[];
  readonly mix: ComboActions;
}

/** 채점이 쓰는 4지선다. 설명은 더 잘게 쪼개도 채점은 여기로 접힌다. */
export type GradedKind = 'fold' | 'call' | 'raise' | 'allin';

/**
 * 종류 → 채점 단위.
 * 체크와 림프는 "안 올리고 넘긴다"는 점에서 콜 쪽에 붙는다. 버튼을 여섯 개로
 * 늘리는 건 모바일에서 과하고, 공부의 실익도 없다.
 */
export function gradedKindOf(kind: PreflopActionKind): GradedKind {
  switch (kind) {
    case 'fold':
      return 'fold';
    case 'jam':
      return 'allin';
    case 'raise':
      return 'raise';
    case 'check':
    case 'limp':
    case 'call':
      return 'call';
  }
}

/**
 * 잘게 쪼갠 빈도를 채점용 4칸으로 접는다.
 *
 * 이게 있어야 설명을 아무리 쪼개도 채점이 흔들리지 않는다. 합이 1 이 아닌
 * 입력(퍼센트, 반올림 잔차)도 들어오므로 마지막에 정규화한다.
 */
export function collapseToGraded(b: ActionBreakdown): Record<GradedKind, number> {
  const out: Record<GradedKind, number> = { fold: 0, call: 0, raise: 0, allin: 0 };
  let total = 0;
  for (const spec of b.actions) {
    const v = b.mix[spec.key] ?? 0;
    if (v <= 0) continue;
    out[gradedKindOf(spec.kind)] += v;
    total += v;
  }
  if (total <= 0) return out;
  for (const k of Object.keys(out) as GradedKind[]) out[k] /= total;
  return out;
}

/**
 * 올리는 빈도(레이즈 + 올인) 가운데 블러프 비중(0..1).
 * 차트가 블러프를 표기하지 않았으면 null — 빈도만 보고 추정하지 않는다.
 */
export function bluffShareOfAggression(b: ActionBreakdown): number | null {
  let raise = 0;
  let bluff = 0;
  let labelled = false;
  for (const spec of b.actions) {
    if (spec.kind !== 'raise' && spec.kind !== 'jam') continue;
    const v = b.mix[spec.key] ?? 0;
    if (spec.intent === 'bluff') labelled = true;
    if (v <= 0) continue;
    raise += v;
    if (spec.intent === 'bluff') bluff += v;
  }
  if (!labelled || raise <= 0) return null;
  return bluff / raise;
}
