'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { cellSegments, type ComboMix } from './range-grid';
import { LEGACY_ACTIONS, type ActionSpec, type ComboActions } from './preflop-action';
import { cn } from './cn';
import { sheetUp } from './motion';

export interface ComboDetailSheetProps {
  open: boolean;
  /** e.g. "AKs", "AA", "76o". Null closes the sheet. */
  combo: string | null;
  /** Mix at this spot. If undefined, shown as the empty-state text. */
  mix?: ComboMix | undefined;
  /** 블러프까지 구분하는 새 경로 — 차트 범례와 이 콤보의 액션별 빈도. */
  actions?: readonly ActionSpec[] | undefined;
  cell?: ComboActions | undefined;
  /** Copy for the no-mix state — defaults to a generic "no data". */
  emptyText?: string;
  /**
   * false 면 막대와 퍼센트를 숨기고 액션 목록만 보인다. RYE 오픈 차트처럼
   * 한 칸의 분할이 빈도가 아니라 "깊으면 콜, 얕으면 4벳 올인" 같은 스택
   * 조건일 때 "50.0%" 는 거짓말이다.
   */
  percent?: boolean | undefined;
  onClose: () => void;
}

/**
 * Bottom sheet shown when the user taps a cell in the range grid.
 * Slide down / drag down below a small threshold to dismiss —
 * matches iOS sheet behaviour, no explicit close button needed.
 */
export function ComboDetailSheet({
  open,
  combo,
  mix,
  actions,
  cell,
  emptyText = '이 스팟의 데이터가 없어요.',
  percent = true,
  onClose,
}: ComboDetailSheetProps) {
  const rows = cell ? buildActionRows(actions ?? LEGACY_ACTIONS, cell) : mix ? buildRows(mix) : [];
  const top = rows.reduce((a, b) => (b.value > a.value ? b : a), rows[0]!);

  return (
    <AnimatePresence>
      {open && combo && (
        <>
          <motion.div
            key="combo-bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="combo-sh"
            role="dialog"
            aria-modal="true"
            aria-label={`${combo} 세부 확률`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sheetUp}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 500) onClose();
            }}
            className={cn(
              'fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-lg',
              'surface-raised border-hair rounded-t-[var(--radius-panel)] border-t',
              'safe-sticky-bottom px-5 pb-6 pt-5 shadow-[var(--shadow-panel)]',
              'touch-pan-y',
            )}
          >
            <div
              className="mx-auto mb-3 h-1 w-10 rounded-full bg-[color:var(--color-border)]"
              aria-hidden
            />

            <h2 className="font-display text-[32px] font-bold leading-none tracking-[-0.02em]">
              {combo}
            </h2>

            {rows.length === 0 ? (
              <p className="border-hair surface text-fg-muted mt-4 rounded-[var(--radius-button)] p-4 text-center text-[12px]">
                {emptyText}
              </p>
            ) : (
              // 라벨 열은 가장 긴 라벨("레이즈 8.5bb 블러프")에 맞춰 늘어나고
              // 줄은 안 꺾는다. 줄마다 subgrid 로 열을 물려받아 막대 시작점이
              // 일직선 — 줄마다 격자를 따로 두면 "콜"과 "레이즈 11bb"가
              // 어긋난다. mix-bar 와 같은 구조.
              <ul
                className="mt-4"
                style={{
                  display: 'grid',
                  gridTemplateColumns: percent
                    ? 'max-content minmax(0, 1fr) 48px'
                    : '12px minmax(0, 1fr)',
                  columnGap: 8,
                  rowGap: 8,
                }}
              >
                {rows.map((r) => {
                  const isTop = percent && r === top && r.value > 0;
                  return (
                    <li
                      key={r.key}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'subgrid',
                        gridColumn: '1 / -1',
                        alignItems: 'center',
                      }}
                    >
                      {/* 퍼센트를 숨기면 막대 대신 색 견본으로 격자와 잇는다 */}
                      {!percent && (
                        <span
                          aria-hidden
                          style={{
                            display: 'inline-block',
                            width: 12,
                            height: 12,
                            borderRadius: 3,
                            background: r.color,
                          }}
                        />
                      )}
                      <span
                        className={cn(
                          'whitespace-nowrap font-mono text-[13px] leading-tight',
                          percent ? 'text-right' : 'text-left',
                          isTop
                            ? 'text-on-primary font-bold'
                            : percent
                              ? 'text-fg-muted'
                              : 'text-fg',
                        )}
                      >
                        {r.label}
                        {r.note && (
                          <span className="text-fg-muted block text-[11px] font-normal">
                            {r.note}
                          </span>
                        )}
                      </span>
                      {percent && (
                        <>
                          <div className="relative h-3 overflow-hidden rounded-full bg-[color:var(--color-border)]">
                            <div
                              className="h-full rounded-full transition-[width] duration-500 ease-out"
                              style={{ width: `${r.value}%`, background: r.color }}
                            />
                          </div>
                          <span
                            className={cn(
                              'text-right font-mono text-[13px] tabular-nums',
                              isTop ? 'text-on-primary font-bold' : 'font-semibold',
                            )}
                          >
                            {r.value.toFixed(1)}%
                          </span>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface Row {
  key: string;
  label: string;
  /** 범례 꼬리말("30bb 미만일 때"). 조건부 계획은 이게 있어야 읽힌다. */
  note?: string | undefined;
  value: number; // percent 0..100
  color: string;
}

/**
 * 새 경로 — 범례 순서대로 액션 줄을 만든다. 빈도 0 인 액션은 뺀다.
 * 블러프/밸류는 같은 색에 무늬로 갈리므로 막대도 격자와 같은 fill 을 쓴다.
 * 라벨은 범례와 같은 한 줄("레이즈 8.5bb 블러프") — cellSegments 가 격자와
 * 같은 라벨·fill 을 이미 만들어 준다.
 */
function buildActionRows(specs: readonly ActionSpec[], cell: ComboActions): Row[] {
  return cellSegments(specs, cell).map((s) => ({
    key: s.key,
    label: s.label,
    note: specs.find((a) => a.key === s.key)?.note,
    value: s.pct,
    color: s.fill,
  }));
}

function buildRows(mix: ComboMix): Row[] {
  const total = (mix.allin || 0) + (mix.raise || 0) + (mix.call || 0) + (mix.fold || 0);
  // Normalise: if the mix is a fraction (<=1), scale to 0..100.
  const scale = total > 1.5 ? 1 : 100;
  const rows: Row[] = [];
  if (mix.allin !== undefined) {
    rows.push({ key: 'allin', label: '올인', value: mix.allin * scale, color: '#D4AF37' });
  }
  rows.push({ key: 'raise', label: '레이즈', value: (mix.raise ?? 0) * scale, color: '#C8102E' });
  if (mix.call !== undefined) {
    rows.push({ key: 'call', label: '콜', value: mix.call * scale, color: '#1F9D55' });
  }
  rows.push({ key: 'fold', label: '폴드', value: (mix.fold ?? 0) * scale, color: '#2B5F8F' });
  return rows;
}
