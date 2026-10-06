/**
 * 스택 조건이 붙은 차트를 특정 스택 하나의 차트로 푼다.
 *
 * RYE 오픈 차트는 100bb 부터 40bb 까지 한 장이다. 대신 칸마다 "3벳엔 콜
 * (50bb 이상일 때만)", "4벳 올인 (30bb 미만일 때)" 같은 조건이 붙어 있고,
 * 한 칸이 둘로 갈린 핸드는 빈도 믹스가 아니라 스택에 따라 계획이 갈리는
 * 핸드다. 그래서 "지금 45bb 인데 AK 는?" 에 답하려면 조건을 머리로 풀어야
 * 했다. 여기서 그 일을 대신한다.
 *
 * 칸 하나를 푸는 규칙:
 * 1. 조건이 맞는 액션이 하나라도 있으면 그 액션(들)만 남긴다. 같은 칸의
 *    조건 없는 액션은 "조건 밖일 때의 계획"이라 같이 지운다 — 리잼 차트의
 *    "30bb 이하 리잼 / 3벳·올인엔 콜" 칸은 25bb 에서 리잼 100% 다.
 * 2. 조건이 전부 빗나가면 조건 없는 액션에 몫을 넘긴다.
 * 3. 그마저 없으면 각 조건의 `else` 액션으로 넘긴다. else 에도 조건이 있으면
 *    맞을 때까지 따라간다(깊이 제한 8).
 */
import type { ActionSpec, ComboActions, PreflopChartData, StackRule } from './preflop-action';

/** 스택 bb 가 조건 구간 안인지. */
export function stackRuleHolds(rule: StackRule, bb: number): boolean {
  if (rule.gte !== undefined && bb < rule.gte) return false;
  if (rule.lt !== undefined && bb >= rule.lt) return false;
  if (rule.lte !== undefined && bb > rule.lte) return false;
  return true;
}

/** 차트가 계획을 가르는 스택 경계들. 큰 것부터, 중복 없이. 조건이 없으면 빈 배열. */
export function stackThresholds(actions: readonly ActionSpec[]): number[] {
  const set = new Set<number>();
  for (const a of actions) {
    const r = a.stack;
    if (!r) continue;
    for (const v of [r.gte, r.lt, r.lte]) if (v !== undefined && v > 0) set.add(v);
  }
  return [...set].sort((a, b) => b - a);
}

/**
 * 경계 사이의 구간 하나. 경계 위쪽(`min` 만)부터 아래쪽(`max` 만)까지.
 * `bb` 는 구간을 대표하는 스택 — resolveStack 에 그대로 넣으면 된다.
 */
export interface StackBucket {
  readonly min?: number;
  readonly max?: number;
  readonly bb: number;
}

/**
 * 경계로 구간을 나눈다. [50, 40, 30] → 50 이상 / 40-50 / 30-40 / 30 미만.
 * 경계가 포함되는 쪽(이상/미만 vs 넘게/이하)은 조건 연산자가 정하니 라벨은
 * 화면이 붙이고, 대표값은 어느 쪽이든 안전하게 구간 한가운데를 쓴다.
 */
export function stackBuckets(actions: readonly ActionSpec[]): StackBucket[] {
  const ts = stackThresholds(actions);
  if (ts.length === 0) return [];
  const out: StackBucket[] = [];
  for (let i = 0; i <= ts.length; i++) {
    const max = ts[i - 1];
    const min = ts[i];
    if (max === undefined && min !== undefined) out.push({ min, bb: min + 5 });
    else if (min === undefined && max !== undefined) out.push({ max, bb: Math.max(1, max - 5) });
    else if (min !== undefined && max !== undefined) out.push({ min, max, bb: (min + max) / 2 });
  }
  return out;
}

/** bb 가 이 구간에 드는지. 경계는 위 구간에 붙인다(라벨의 이상/이하와 무관하게 쓰는 UI 용). */
export function bucketContains(b: StackBucket, bb: number): boolean {
  if (b.min !== undefined && bb < b.min) return false;
  if (b.max !== undefined && bb >= b.max) return false;
  return true;
}

const MAX_ELSE_DEPTH = 8;

/** 조건이 맞을 때까지 else 를 따라간 끝의 키. 끊기면 마지막 키. */
function settle(byKey: ReadonlyMap<string, ActionSpec>, key: string, bb: number): string {
  let k = key;
  for (let i = 0; i < MAX_ELSE_DEPTH; i++) {
    const spec = byKey.get(k);
    if (!spec?.stack || stackRuleHolds(spec.stack, bb)) return k;
    k = spec.stack.else;
  }
  return k;
}

function resolveCell(
  byKey: ReadonlyMap<string, ActionSpec>,
  cell: ComboActions,
  bb: number,
): ComboActions {
  const holds: string[] = [];
  const plain: string[] = [];
  const misses: string[] = [];
  for (const [k, v] of Object.entries(cell)) {
    if (v <= 0) continue;
    const rule = byKey.get(k)?.stack;
    if (!rule) plain.push(k);
    else if (stackRuleHolds(rule, bb)) holds.push(k);
    else misses.push(k);
  }
  if (misses.length === 0 && holds.length === 0) return cell;

  const out: Record<string, number> = {};
  const add = (k: string, v: number) => {
    out[k] = (out[k] ?? 0) + v;
  };
  // 규칙 1: 맞는 조건이 있으면 그것만. 나머지 몫은 맞는 쪽에 비례 배분.
  if (holds.length > 0) {
    const kept = holds.reduce((s, k) => s + cell[k]!, 0);
    for (const k of holds) add(k, cell[k]! / kept);
    return out;
  }
  // 규칙 2: 조건 없는 액션이 받는다.
  if (plain.length > 0) {
    const kept = plain.reduce((s, k) => s + cell[k]!, 0);
    for (const k of plain) add(k, cell[k]! / kept);
    return out;
  }
  // 규칙 3: else 로.
  for (const k of misses) add(settle(byKey, k, bb), cell[k]!);
  return out;
}

/**
 * 스택 bb 기준으로 조건을 전부 푼 차트. 조건이 하나도 없으면 입력 그대로.
 * 범례는 그대로 두되(안 쓰이는 항목은 화면이 거른다) 칸만 바뀐다.
 */
export function resolveStack(data: PreflopChartData, bb: number): PreflopChartData {
  if (!data.actions.some((a) => a.stack)) return data;
  const byKey = new Map(data.actions.map((a) => [a.key, a] as const));
  const cells: Record<string, ComboActions> = {};
  for (const [combo, cell] of Object.entries(data.cells))
    cells[combo] = resolveCell(byKey, cell, bb);
  return { actions: data.actions, cells };
}
