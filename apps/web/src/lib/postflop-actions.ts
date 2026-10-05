import type { ActionSpec } from '@gto/poker-core';

/**
 * 포스트플랍 액션 코드 → 표시 규칙.
 *
 * 예전에는 b33·b50·b75·bpot·bov·r 을 전부 `raise` 한 칸으로 접어서, 격자에는
 * "벳 70%" 한 덩어리만 남고 1/3벳인지 오버벳인지가 사라졌다. 이제 코드마다
 * 액션을 하나씩 두고 사이즈가 커질수록 빨강을 진하게 깐다. 종류는 다 raise 라
 * 색상 자체는 하나로 묶이니, 멀리서는 "빨강 = 공격"이 그대로 남는다.
 */
const SPEC_BY_CODE: Record<string, ActionSpec> = {
  r: { key: 'r', kind: 'raise', label: '레이즈', shade: 0.9 },
  bov: { key: 'bov', kind: 'raise', label: '오버벳', shade: 1 },
  bpot: { key: 'bpot', kind: 'raise', label: '팟 벳', shade: 0.8 },
  b75: { key: 'b75', kind: 'raise', label: '3/4 벳', shade: 0.6 },
  b50: { key: 'b50', kind: 'raise', label: '1/2 벳', shade: 0.4 },
  b33: { key: 'b33', kind: 'raise', label: '1/3 벳', shade: 0.2 },
  c: { key: 'c', kind: 'call', label: '콜' },
  x: { key: 'x', kind: 'check', label: '체크' },
  f: { key: 'f', kind: 'fold', label: '폴드' },
};

/** 공격 → 패시브 순. 셀 안에서 막대가 이 순서로 쌓인다. */
const ORDER = ['r', 'bov', 'bpot', 'b75', 'b50', 'b33', 'c', 'x', 'f'] as const;

/**
 * 실제로 등장한 코드만 추려 범례를 만든다.
 * 솔버가 새 사이즈를 들고 와도(b25 같은) 조용히 사라지지 않게, 모르는 코드는
 * 공격 액션으로 보고 뒤에 붙인다.
 */
export function postflopActions(codes: Iterable<string>): ActionSpec[] {
  const seen = new Set(codes);
  const out: ActionSpec[] = [];
  for (const k of ORDER) {
    if (seen.has(k)) out.push(SPEC_BY_CODE[k]!);
  }
  for (const k of seen) {
    if (!(ORDER as readonly string[]).includes(k)) {
      out.push({ key: k, kind: 'raise', label: k, shade: 0.5 });
    }
  }
  return out;
}

/**
 * 코드 하나를 스펙으로. 지나온 액션 자취(breadcrumb)처럼 현재 노드의 범례
 * 밖에 있는 코드도 색과 이름이 필요해서 둔다.
 */
export function postflopSpec(code: string): ActionSpec {
  return SPEC_BY_CODE[code] ?? { key: code, kind: 'raise', label: code, shade: 0.5 };
}

/** 핸드별 믹스 묶음에서 등장하는 액션 코드를 전부 모은다. */
export function collectCodes(hands: Record<string, Record<string, number>>): Set<string> {
  const codes = new Set<string>();
  for (const hand of Object.values(hands)) {
    for (const [code, pct] of Object.entries(hand)) if (pct > 0) codes.add(code);
  }
  return codes;
}
