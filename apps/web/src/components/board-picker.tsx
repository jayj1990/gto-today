'use client';

import { useMemo } from 'react';
import { CardView, cn } from '@gto/ui';
import type { CardCode } from '@gto/poker-core';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
const SUITS = ['s', 'h', 'd', 'c'] as const;

export interface BoardPickerProps {
  /** Currently selected cards, in click order. 0–3 entries. */
  selected: readonly string[];
  onChange: (next: readonly string[]) => void;
  className?: string;
}

/**
 * GTO Wizard-style card picker — 13×4 grid, click to toggle. Caps at 3
 * cards (a flop). Picked cards dim in the grid; tapping a selected
 * card un-picks it. Order of taps becomes the board order so the
 * downstream iso-canonicalizer sees the user's chosen suit pattern.
 */
export function BoardPicker({ selected, onChange, className }: BoardPickerProps) {
  const selSet = useMemo(() => new Set(selected), [selected]);

  const toggle = (card: string) => {
    if (selSet.has(card)) {
      onChange(selected.filter((c) => c !== card));
      return;
    }
    if (selected.length >= 3) return;
    onChange([...selected, card]);
  };

  const clear = () => onChange([]);

  return (
    <section className={cn('flex flex-col gap-3', className)}>
      {/* Selected preview row */}
      <div className="border-hair surface flex items-center justify-between gap-3 rounded-[var(--radius-button)] p-2">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => {
            const c = selected[i];
            return c ? (
              <button
                key={i}
                type="button"
                onClick={() => onChange(selected.filter((_, j) => j !== i))}
                aria-label={`${c} 선택 해제`}
                className="active:scale-[0.95]"
              >
                <CardView
                  rank={c.charAt(0)}
                  suit={c.charAt(1) as 's' | 'h' | 'd' | 'c'}
                  size="sm"
                  deckScheme="four-color"
                />
              </button>
            ) : (
              <div
                key={i}
                aria-hidden
                className="border-hair text-fg-muted flex h-12 w-9 items-center justify-center rounded-[var(--radius-button)] border border-dashed font-mono text-[16px]"
              >
                ?
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={clear}
          disabled={selected.length === 0}
          className="text-fg-muted font-mono text-[11px] uppercase tracking-[0.18em] disabled:opacity-30"
        >
          초기화
        </button>
      </div>

      {/* 13×4 card grid */}
      <div className="border-hair surface rounded-[var(--radius-panel)] p-2">
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}>
          {SUITS.flatMap((s) =>
            RANKS.map((r) => {
              const card = `${r}${s}` as CardCode;
              const isSelected = selSet.has(card);
              return (
                <button
                  key={card}
                  type="button"
                  onClick={() => toggle(card)}
                  disabled={!isSelected && selected.length >= 3}
                  aria-pressed={isSelected}
                  aria-label={card}
                  className={cn(
                    'flex items-center justify-center rounded-[4px] transition-opacity active:scale-[0.94]',
                    isSelected
                      ? 'ring-2 ring-[color:var(--color-accent)] ring-offset-1 ring-offset-[color:var(--color-bg)]'
                      : 'opacity-100',
                    !isSelected && selected.length >= 3 && 'opacity-25',
                  )}
                >
                  <CardView
                    rank={r}
                    suit={s as 's' | 'h' | 'd' | 'c'}
                    size="xs"
                    deckScheme="four-color"
                  />
                </button>
              );
            }),
          )}
        </div>
      </div>
    </section>
  );
}
