'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  gradeAnswer,
  gradePostflopAction,
  POSTFLOP_ACTION_LABEL,
  type GradedAction,
  type PostflopAction,
} from '@gto/gto-data';
import { CardView, cn } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import {
  useMistakesStore,
  type MistakeRecord,
  type PostflopMistake,
  type PreflopMistake,
} from '@/lib/mistakes-store';

const PREFLOP_ACTION_LABEL: Record<GradedAction, string> = {
  fold: '폴드',
  check: '체크',
  call: '콜',
  raise: '레이즈',
};

export default function ReviewPage() {
  const mistakes = useMistakesStore((s) => s.mistakes);
  const resolveMistake = useMistakesStore((s) => s.resolveMistake);
  const clearAll = useMistakesStore((s) => s.clearAll);

  const sorted = useMemo(
    () => [...mistakes].sort((a, b) => b.at - a.at),
    [mistakes],
  );

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const active = activeKey
    ? sorted.find((m) => keyOf(m) === activeKey) ?? null
    : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
        <header className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
              Review
            </p>
            <h1 className="mt-1 font-display text-[26px] font-bold leading-[1.1] tracking-[-0.02em]">
              복습 모드
            </h1>
          </div>
          {sorted.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('모든 오답 기록을 지울까요? 되돌릴 수 없어요.'))
                  clearAll();
              }}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted active:scale-[0.96]"
            >
              전체 비우기
            </button>
          )}
        </header>

        {sorted.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <p className="mb-3 text-[13px] text-fg-muted">
              틀렸던 스팟 <span className="font-semibold text-fg">{sorted.length}</span>개. 다시
              풀어보면서 감을 잡아가요.
            </p>
            <ul className="space-y-2">
              {sorted.map((m) => {
                const key = keyOf(m);
                const isOpen = activeKey === key;
                return (
                  <li
                    key={key}
                    className={cn(
                      'rounded-[var(--radius-panel)] border-hair surface overflow-hidden',
                      isOpen && 'ring-1 ring-[color:var(--color-accent)]/40',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveKey(isOpen ? null : key)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left active:scale-[0.99]"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
                        {m.kind === 'preflop' ? 'PRE' : 'POST'}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-display text-[15px] font-semibold text-fg">
                          {summary(m)}
                        </span>
                        <span className="truncate font-mono text-[11px] text-fg-muted">
                          {detail(m)}
                        </span>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                        {isOpen ? '닫기' : '펼치기'}
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="border-t border-hair px-4 py-4">
                            <MistakeDetail mistake={m} />
                            <div className="mt-4 flex gap-2">
                              <button
                                type="button"
                                onClick={() => resolveMistake(m.kind, m.spotId)}
                                className="h-12 flex-1 rounded-[var(--radius-button)] bg-gold-gradient text-[14px] font-semibold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
                              >
                                이해했어요
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveKey(null)}
                                className="h-12 flex-1 rounded-[var(--radius-button)] border-hair surface-raised text-[14px] font-medium active:scale-[0.98]"
                              >
                                나중에
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <nav className="mt-10 flex justify-center">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted underline-offset-4 hover:underline"
          >
            ← 홈으로
          </Link>
        </nav>
      </main>

      {/* Active = selected in list; kept state-aware so the list item
          can show a focus ring. No modal sheet here — the expand/
          collapse inline view is the replay surface. */}
      {active && null}
    </>
  );
}

function EmptyState() {
  return (
    <section className="mt-6 rounded-[var(--radius-panel)] border-hair surface p-8 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
        Clean slate
      </p>
      <h2 className="mt-2 font-display text-[22px] font-bold tracking-[-0.015em]">
        복습할 오답이 없어요
      </h2>
      <p className="mt-2 text-[13px] text-fg-muted">
        잘하고 있어요. 오늘의 훈련이나 무한 훈련에서 새 스팟을 계속 풀어봐요.
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <Link
          href="/today"
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-button)] bg-gold-gradient px-4 text-[14px] font-semibold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
        >
          오늘의 훈련
        </Link>
        <Link
          href="/sim"
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-button)] border-hair surface-raised px-4 text-[14px] font-medium active:scale-[0.98]"
        >
          무한 훈련
        </Link>
      </div>
    </section>
  );
}

function keyOf(m: MistakeRecord): string {
  return `${m.kind}:${m.spotId}`;
}

function summary(m: MistakeRecord): string {
  if (m.kind === 'preflop') {
    const s = m.spot;
    if (s.scenario === 'vs_open') {
      return `${s.combo} · BB vs ${s.opener}`;
    }
    return `${s.combo} · ${s.position} RFI`;
  }
  return `${m.spot.context.heroPos} · 플랍`;
}

function detail(m: MistakeRecord): string {
  if (m.kind === 'preflop') {
    const gto = dominantPreflopLabel(m);
    return `내 답: ${PREFLOP_ACTION_LABEL[m.userAnswer]} → GTO: ${gto}`;
  }
  const gto = dominantPostflopLabel(m);
  return `내 답: ${POSTFLOP_ACTION_LABEL[m.userAnswer]} → GTO: ${gto}`;
}

function dominantPreflopLabel(m: PreflopMistake): string {
  const s = m.spot;
  if (s.scenario === 'vs_open') {
    const mix = { raise: s.gtoRaise, call: s.gtoCall ?? 0, fold: s.gtoFold };
    const max = Math.max(mix.raise, mix.call, mix.fold);
    if (max === mix.raise) return PREFLOP_ACTION_LABEL.raise;
    if (max === mix.call) return PREFLOP_ACTION_LABEL.call;
    return PREFLOP_ACTION_LABEL.fold;
  }
  return s.gtoRaise > 0.5 ? PREFLOP_ACTION_LABEL.raise : PREFLOP_ACTION_LABEL.fold;
}

function dominantPostflopLabel(m: PostflopMistake): string {
  const entries = Object.entries(m.spot.mix) as [PostflopAction, number][];
  const top = entries.reduce((a, b) => ((b[1] ?? 0) > (a[1] ?? 0) ? b : a), entries[0]!);
  return POSTFLOP_ACTION_LABEL[top[0]];
}

function MistakeDetail({ mistake }: { mistake: MistakeRecord }) {
  if (mistake.kind === 'preflop') {
    const s = mistake.spot;
    return (
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
          내 핸드
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          {s.hero.map((c) => (
            <CardView
              key={c}
              rank={c.charAt(0)}
              suit={c.charAt(1) as 's' | 'h' | 'd' | 'c'}
              size="sm"
              deckScheme="four-color"
            />
          ))}
          <span className="ml-2 font-display text-[18px] font-bold">{s.combo}</span>
        </div>
        <div className="mt-3 space-y-1.5 text-[12px]">
          <Row label="시나리오" value={s.scenario === 'vs_open' ? `${s.opener} 오픈에 BB` : `${s.position} RFI`} />
          <Row label="스택" value={`${s.stackBB}BB`} />
          <Row label="GTO 믹스" value={preflopMixString(mistake)} />
          <Row
            label="내 답"
            value={PREFLOP_ACTION_LABEL[mistake.userAnswer]}
            tone="raise"
          />
          <Row
            label="정답"
            value={dominantPreflopLabel(mistake)}
            tone="call"
          />
        </div>
        <ReGradeHint mistake={mistake} />
      </div>
    );
  }

  // postflop
  const s = mistake.spot;
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
        보드
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        {s.board.map((c) => (
          <CardView
            key={c}
            rank={c.charAt(0)}
            suit={c.charAt(1) as 's' | 'h' | 'd' | 'c'}
            size="sm"
            deckScheme="four-color"
          />
        ))}
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
        히어로
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        {s.hero.map((c) => (
          <CardView
            key={c}
            rank={c.charAt(0)}
            suit={c.charAt(1) as 's' | 'h' | 'd' | 'c'}
            size="sm"
            deckScheme="four-color"
          />
        ))}
      </div>
      <div className="mt-3 space-y-1.5 text-[12px]">
        <Row label="포지션" value={`${s.context.heroPos} (OOP)`} />
        <Row label="팟" value={`${s.context.potBB}BB · SPR ${s.context.spr.toFixed(1)}`} />
        <Row
          label="내 답"
          value={POSTFLOP_ACTION_LABEL[mistake.userAnswer]}
          tone="raise"
        />
        <Row
          label="정답"
          value={dominantPostflopLabel(mistake)}
          tone="call"
        />
      </div>
      {s.teachingNote && (
        <div className="mt-3 rounded-[var(--radius-button)] border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/8 p-3 text-[12px] leading-[1.55] text-fg">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
            왜 그런지
          </p>
          {s.teachingNote}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'raise' | 'call' }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
        {label}
      </span>
      <span
        className={cn(
          'font-mono font-semibold text-fg tabular-nums',
          tone === 'raise' && 'text-[color:var(--color-raise)]',
          tone === 'call' && 'text-[color:var(--color-call)]',
        )}
      >
        {value}
      </span>
    </div>
  );
}

function preflopMixString(m: PreflopMistake): string {
  const s = m.spot;
  if (s.scenario === 'vs_open') {
    return `R ${(s.gtoRaise * 100).toFixed(0)} · C ${((s.gtoCall ?? 0) * 100).toFixed(0)} · F ${(s.gtoFold * 100).toFixed(0)}`;
  }
  return `R ${(s.gtoRaise * 100).toFixed(0)} · F ${(s.gtoFold * 100).toFixed(0)}`;
}

function ReGradeHint({ mistake }: { mistake: PreflopMistake }) {
  // Re-grade the user's original answer so the hint stays accurate if
  // grade thresholds ever shift. Mostly here for readability ("내
  // 답이 왜 오답인지" framing in a single line).
  const grade = gradeAnswer(mistake.spot, mistake.userAnswer);
  void grade;
  return null;
}

// gradePostflopAction is imported to keep the types in scope for
// future replay features but isn't directly invoked in the list view.
void gradePostflopAction;
