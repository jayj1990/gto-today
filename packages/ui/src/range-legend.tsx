'use client';

import {
  actionLabel,
  actionSwatchFill,
  usedActions,
  type ActionSpec,
  type ComboActions,
} from './preflop-action';
import { cn } from './cn';

export interface RangeLegendProps {
  /** 이 차트의 범례 전체. */
  actions: readonly ActionSpec[];
  /**
   * 주면 실제로 쓰인 액션만 남긴다. 레인지 하나에 범례 여덟 줄이 붙으면
   * 격자보다 범례가 길어져서 안 읽힌다.
   */
  cells?: Record<string, ComboActions> | undefined;
  className?: string;
}

/**
 * 격자 아래 붙는 범례. 액션 수가 넷을 넘어가면서부터는 범례 없이는
 * 색을 못 읽는다.
 */
export function RangeLegend({ actions, cells, className }: RangeLegendProps) {
  const shown = cells ? usedActions(actions, cells) : actions;
  if (shown.length === 0) return null;

  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1.5', className)}>
      {shown.map((spec) => (
        <li key={spec.key} className="flex items-center gap-1.5">
          {/* 크기를 인라인으로 주는 이유: 이 패키지는 앱 바깥이라 새로 쓰는
              Tailwind 유틸리티가 dev 스캔에 안 잡히는 경우가 있다.
              range-grid 도 같은 이유로 인라인 스타일을 쓴다. */}
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              flexShrink: 0,
              borderRadius: 3,
              background: actionSwatchFill(spec),
            }}
          />
          <span className="text-[12px] leading-tight">
            {actionLabel(spec)}
            {spec.note && <span className="text-fg-muted ml-1 text-[11px]">({spec.note})</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
