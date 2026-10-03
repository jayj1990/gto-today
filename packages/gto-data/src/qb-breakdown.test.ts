import { describe, expect, it } from 'vitest';
import { collapseToGraded, bluffShareOfAggression, type ComboKey } from '@gto/poker-core';
import { breakdownForCombo, collapseForCombo } from './qb-tree';

/**
 * 설명을 잘게 쪼개도 채점은 안 흔들린다 — 이 파일이 지키는 약속.
 *
 * breakdownForCombo 는 레이즈를 사이즈별로 나눠 적고, collapseForCombo 는
 * 하나로 합친다. 둘을 따로 두면 언젠가 서로 어긋나고, 그러면 화면에 보이는
 * 믹스와 채점 기준이 달라진다. 그 순간을 여기서 잡는다.
 */

const NODE: Record<string, Record<string, number>> = {
  '2.5bb': { AKs: 0.4, '72o': 0.05 },
  '8.5bb': { AKs: 0.3, '72o': 0 },
  AllIn: { AKs: 0.1, '72o': 0 },
  Call: { AKs: 0.15, '72o': 0.05 },
  FOLD: { AKs: 0.05, '72o': 0.9 },
};

describe('breakdownForCombo', () => {
  it('레이즈를 사이즈별로 쪼갠다', () => {
    const b = breakdownForCombo(NODE, 'AKs' as ComboKey)!;
    const keys = b.actions.map((a) => a.key);
    expect(keys).toContain('raise_2.5bb');
    expect(keys).toContain('raise_8.5bb');
    expect(b.mix['raise_2.5bb']).toBeCloseTo(0.4, 5);
    expect(b.mix['raise_8.5bb']).toBeCloseTo(0.3, 5);
  });

  it('작은 레이즈가 먼저 온다', () => {
    const b = breakdownForCombo(NODE, 'AKs' as ComboKey)!;
    const sizes = b.actions.filter((a) => a.kind === 'raise').map((a) => a.size);
    expect(sizes).toEqual(['2.5bb', '8.5bb']);
  });

  it('빈도 0 인 액션은 안 적는다', () => {
    const b = breakdownForCombo(NODE, '72o' as ComboKey)!;
    expect(b.actions.map((a) => a.key)).toEqual(['raise_2.5bb', 'call', 'fold']);
  });

  it('아무 빈도도 없으면 null', () => {
    expect(breakdownForCombo(NODE, 'QQ' as ComboKey)).toBeNull();
  });

  it('채점용으로 접으면 collapseForCombo 와 같다', () => {
    for (const combo of ['AKs', '72o'] as ComboKey[]) {
      const flat = collapseForCombo(NODE, combo)!;
      const graded = collapseToGraded(breakdownForCombo(NODE, combo)!);
      expect(graded.raise).toBeCloseTo(flat.raise, 10);
      expect(graded.call).toBeCloseTo(flat.call, 10);
      expect(graded.fold).toBeCloseTo(flat.fold, 10);
      expect(graded.allin).toBeCloseTo(flat.allin, 10);
    }
  });

  it('블러프 표기가 없는 차트는 블러프 비중을 추정하지 않는다', () => {
    // 솔버 트리에는 밸류/블러프 라벨이 없다. 빈도만 보고 지어내면 안 된다.
    expect(bluffShareOfAggression(breakdownForCombo(NODE, 'AKs' as ComboKey)!)).toBeNull();
  });

  it('블러프를 적어준 차트는 레이즈 안의 블러프 비중을 센다', () => {
    const share = bluffShareOfAggression({
      actions: [
        { key: 'rv', kind: 'raise', intent: 'value', label: '레이즈' },
        { key: 'rb', kind: 'raise', intent: 'bluff', label: '레이즈' },
        { key: 'fold', kind: 'fold', label: '폴드' },
      ],
      mix: { rv: 0.39, rb: 0.21, fold: 0.4 },
    });
    expect(share).toBeCloseTo(0.35, 5);
  });
});
