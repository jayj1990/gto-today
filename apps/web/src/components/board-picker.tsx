'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn, CardView } from '@gto/ui';
import { sheetUp } from '@gto/ui/motion';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
const SUITS = [
  { id: 's', label: '♠', color: '#F4EFE6' },
  { id: 'h', label: '♥', color: '#D63B3B' },
  { id: 'd', label: '♦', color: '#2B6CB0' },
  { id: 'c', label: '♣', color: '#1F6F3F' },
] as const;

export interface BoardPickerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (board: [string, string, string]) => void;
}

/**
 * Bottom-sheet 3-card flop picker. User taps rank then suit for
 * each slot. Dupe cards disabled. Rank buttons arranged in a
 * centered 7+6 flex layout so the 13 choices don't look like a
 * broken grid. Suit buttons forced to square aspect for uniform
 * sizing regardless of glyph metrics.
 */
export function BoardPicker({ open, onClose, onSubmit }: BoardPickerProps) {
  const [cards, setCards] = useState<(string | null)[]>([null, null, null]);
  const [activeSlot, setActiveSlot] = useState<0 | 1 | 2>(0);
  const [pendingRank, setPendingRank] = useState<string | null>(null);

  const usedCards = new Set(cards.filter(Boolean) as string[]);

  const pickRank = (r: string) => setPendingRank(r);
  const pickSuit = (s: string) => {
    if (!pendingRank) return;
    const card = pendingRank + s;
    if (usedCards.has(card)) return;
    const next = [...cards];
    next[activeSlot] = card;
    setCards(next);
    setPendingRank(null);
    const nextEmpty = next.findIndex((c) => c === null);
    if (nextEmpty >= 0) setActiveSlot(nextEmpty as 0 | 1 | 2);
  };

  const allFilled = cards.every(Boolean);
  const reset = () => {
    setCards([null, null, null]);
    setActiveSlot(0);
    setPendingRank(null);
  };
  const submit = () => {
    if (!allFilled) return;
    onSubmit(cards as [string, string, string]);
    reset();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bp-bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="bp-sh"
            role="dialog"
            aria-modal="true"
            aria-label="플랍 선택"
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

            <h2 className="font-display text-[22px] font-bold tracking-[-0.02em]">
              플랍 카드 선택
            </h2>
            <p className="mt-1 text-[12px] text-fg-muted">
              3장 다 고르면 솔빙을 시작합니다. 30~90초 걸려요.
            </p>

            {/* Three card slots */}
            <div className="mt-4 flex gap-2 justify-center">
              {cards.map((card, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setActiveSlot(i as 0 | 1 | 2);
                    setPendingRank(null);
                  }}
                  className={cn(
                    'rounded-[var(--radius-button)] border p-1.5 transition-colors',
                    activeSlot === i
                      ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10'
                      : 'border-hair surface',
                  )}
                >
                  <AnimatePresence mode="wait">
                    {card ? (
                      <motion.div
                        key={card}
                        initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                      >
                        <CardView
                          rank={card[0]!}
                          suit={card[1] as 's' | 'h' | 'd' | 'c'}
                          size="sm"
                          deckScheme="four-color"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-14 w-10 rounded-sm border border-dashed border-[color:var(--color-border)]"
                      />
                    )}
                  </AnimatePresence>
                </button>
              ))}
            </div>

            {/* Rank / Suit picker swap */}
            <div className="mt-5 min-h-[130px]">
              <AnimatePresence mode="wait">
                {!pendingRank ? (
                  <motion.section
                    key="rank-picker"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                  >
                    <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted text-center">
                      랭크 선택
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {RANKS.map((r) => (
                        <motion.button
                          key={r}
                          type="button"
                          onClick={() => pickRank(r)}
                          whileTap={{ scale: 0.92 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                          className="aspect-square w-11 rounded-[var(--radius-button)] border-hair surface font-display text-[16px] font-bold"
                        >
                          {r}
                        </motion.button>
                      ))}
                    </div>
                  </motion.section>
                ) : (
                  <motion.section
                    key="suit-picker"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                  >
                    <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted text-center">
                      <span className="text-[color:var(--color-accent)]">{pendingRank}</span> 수트 선택
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {SUITS.map((s) => {
                        const card = pendingRank + s.id;
                        const dupe = usedCards.has(card);
                        return (
                          <motion.button
                            key={s.id}
                            type="button"
                            disabled={dupe}
                            onClick={() => pickSuit(s.id)}
                            whileTap={dupe ? undefined : { scale: 0.92 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            className={cn(
                              'aspect-square rounded-[var(--radius-button)] border-hair surface flex items-center justify-center',
                              'text-[32px] font-bold leading-none',
                              dupe && 'opacity-25 cursor-not-allowed',
                            )}
                            style={{ color: s.color }}
                          >
                            {s.label}
                          </motion.button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingRank(null)}
                      className="mt-2 w-full font-mono text-[11px] text-fg-muted"
                    >
                      ← 랭크 다시 선택
                    </button>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={reset}
                className="h-11 rounded-[var(--radius-button)] border-hair surface font-mono text-[12px] text-fg-muted active:scale-[0.98]"
              >
                초기화
              </button>
              <motion.button
                type="button"
                onClick={submit}
                disabled={!allFilled}
                whileTap={allFilled ? { scale: 0.97 } : undefined}
                className={cn(
                  'h-11 rounded-[var(--radius-button)] font-bold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset',
                  allFilled
                    ? 'bg-gold-gradient ring-[color:var(--color-gold-deep)]'
                    : 'bg-[color:var(--color-border)] ring-[color:var(--color-border)] opacity-50 cursor-not-allowed',
                )}
              >
                솔빙 시작 →
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
