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
  raiseSize,
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
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 500) onClose();
            }}
            className={cn(
              'fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-lg',
              'rounded-t-[var(--radius-panel)] surface-raised border-hair border-t',
              'safe-sticky-bottom px-5 pt-5 pb-6 shadow-[var(--shadow-panel)]',
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
                          'w-20 flex-shrink-0 font-mono text-[13px]',
                          isTop ? 'font-bold text-white' : 'text-fg-muted',
                        )}
                      >
                        {r.label}
                      </span>
                      <div
                        className={cn(
                          'relative flex-1 overflow-hidden rounded-full bg-[color:var(--color-border)]',
                          isTop ? 'h-4' : 'h-3',
                        )}
                      >
                        <div
                          className="h-full rounded-full transition-[width] duration-500 ease-out"
                          style={{ width: `${r.value}%`, background: r.color }}
                        />
                      </div>
                      <span
                        className={cn(
                          'w-14 flex-shrink-0 text-right font-mono tabular-nums text-[13px]',
                          isTop ? 'font-bold text-white' : 'font-semibold',
                        )}
                      >
                        {r.value.toFixed(1)}%
                      </span>
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
  label: string;
  value: number; // percent 0..100
  color: string;
}

function buildRows(mix: ComboMix, raiseSize?: string): Row[] {
  const total = (mix.raise || 0) + (mix.call || 0) + (mix.fold || 0);
  // Normalise: if the mix is a fraction (<=1), scale to 0..100.
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
