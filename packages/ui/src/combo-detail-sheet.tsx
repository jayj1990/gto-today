'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ComboMix } from './range-grid';
import { cn } from './cn';
import { sheetUp } from './motion';

export interface ComboDetailSheetProps {
  open: boolean;
  /** e.g. "AKs", "AA", "76o". Null closes the sheet. */
  combo: string | null;
  /** Mix at this spot. If undefined, shown as "데이터 없음". */
  mix?: ComboMix | undefined;
  /** Additional size info — how many chips the raise commits, etc. */
  raiseSize?: string | undefined;
  /** Optional sub-heading (e.g. "BB vs CO · 2.5BB"). */
  spotLabel?: string | undefined;
  onClose: () => void;
}

/**
 * Bottom sheet that appears when the user taps a cell in the range grid.
 * Shows the exact mix (raise / call / fold percentages) with a bar each,
 * marks the dominant action with a gold star, and lists the four
 * representative suit-combos for the hand (e.g. A♠K♥, A♠K♦, A♠K♣, ...).
 *
 * Mirrors the ResultSheet pattern so the two modals feel like siblings.
 */
export function ComboDetailSheet({
  open,
  combo,
  mix,
  raiseSize,
  spotLabel,
  onClose,
}: ComboDetailSheetProps) {
  const rows = mix ? buildRows(mix, raiseSize) : [];
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
            className={cn(
              'fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-lg',
              'rounded-t-[var(--radius-panel)] surface-raised border-hair border-t',
              'safe-sticky-bottom px-5 pt-5 pb-6 shadow-[var(--shadow-panel)]',
            )}
          >
            <div
              className="mx-auto mb-3 h-1 w-10 rounded-full bg-[color:var(--color-border)]"
              aria-hidden
            />

            <div className="flex items-baseline justify-between">
              <div>
                {spotLabel && (
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
                    {spotLabel}
                  </p>
                )}
                <h2 className="font-display text-[30px] font-bold leading-none tracking-[-0.02em]">
                  {combo}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted active:scale-[0.95]"
                aria-label="닫기"
              >
                닫기
              </button>
            </div>

            {rows.length === 0 ? (
              <p className="mt-4 rounded-[var(--radius-button)] border-hair surface p-4 text-center text-[12px] text-fg-muted">
                이 스팟의 데이터가 없어요.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {rows.map((r) => {
                  const isTop = r === top && r.value > 0;
                  return (
                    <li key={r.label} className="flex items-center gap-3">
                      <span
                        className={cn(
                          'w-16 flex-shrink-0 font-mono text-[13px]',
                          isTop ? 'font-bold text-fg' : 'text-fg-muted',
                        )}
                      >
                        {isTop && (
                          <span className="mr-1" style={{ color: 'var(--color-gold)' }}>
                            ★
                          </span>
                        )}
                        {r.label}
                      </span>
                      <div
                        className="relative h-3 flex-1 overflow-hidden rounded-full bg-[color:var(--color-border)]"
                        style={isTop ? { boxShadow: `0 0 0 1.5px ${r.color}` } : undefined}
                      >
                        <div
                          className="h-full rounded-full transition-[width] duration-500 ease-out"
                          style={{ width: `${r.value}%`, background: r.color }}
                        />
                      </div>
                      <span
                        className={cn(
                          'w-14 flex-shrink-0 text-right font-mono tabular-nums',
                          isTop ? 'text-[13px] font-bold text-fg' : 'text-[13px] font-semibold',
                        )}
                      >
                        {r.value.toFixed(1)}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-4 flex items-center gap-2 font-mono text-[11px] text-fg-muted">
              <span>수츠별 콤보:</span>
              <span className="text-fg">{suitsForCombo(combo)}</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface Row {
  label: string;
  value: number; // percent 0..100
  color: string;
}

function buildRows(mix: ComboMix, raiseSize?: string): Row[] {
  const total =
    (mix.raise || 0) + (mix.call || 0) + (mix.fold || 0);
  // Normalise to percent if the mix is a fraction (<=1) or already in %.
  const scale = total > 1.5 ? 1 : 100;
  const rows: Row[] = [
    {
      label: raiseSize ? `레이즈 ${raiseSize}` : '레이즈',
      value: (mix.raise ?? 0) * scale,
      color: '#C8102E',
    },
  ];
  if (mix.call !== undefined) {
    rows.push({ label: '콜', value: mix.call * scale, color: '#1F9D55' });
  }
  rows.push({ label: '폴드', value: (mix.fold ?? 0) * scale, color: '#2B5F8F' });
  return rows;
}

function suitsForCombo(combo: string): string {
  // Pair (e.g. "AA"): 6 combos → ♠♥, ♠♦, ♠♣, ♥♦, ♥♣, ♦♣
  if (combo.length === 2) return '♠♥ · ♠♦ · ♠♣ · ♥♦ · ♥♣ · ♦♣  (6)';
  // Suited (e.g. "AKs"): 4 combos
  if (combo.endsWith('s')) return '♠♠ · ♥♥ · ♦♦ · ♣♣  (4)';
  // Offsuit (e.g. "AKo"): 12 combos
  return '오프수트 12가지';
}
