'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  PUSH_FOLD_20BB,
  PUSH_FOLD_POSITIONS,
  type PushFoldEntry,
  type PushFoldPosition,
} from '@gto/gto-data';
import { RangeGrid, cn, type ComboMix } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';

/**
 * Push/fold trainer for ~20BB MTT stacks. Pure binary decision (no
 * mixed strategies), so the RangeGrid renders push = raise-red,
 * fold = blue. Position tabs let the user compare how aggression
 * opens up from UTG to SB.
 */
export default function PushFoldPage() {
  const [pos, setPos] = useState<PushFoldPosition>('BTN');

  const mixes = useMemo<Record<string, ComboMix>>(() => {
    const chart = PUSH_FOLD_20BB[pos];
    const out: Record<string, ComboMix> = {};
    for (const [combo, entry] of Object.entries(chart) as Array<[string, PushFoldEntry]>) {
      out[combo] = { raise: entry.push, fold: entry.fold };
    }
    return out;
  }, [pos]);

  const pushCount = useMemo(() => {
    return (Object.values(PUSH_FOLD_20BB[pos]) as PushFoldEntry[]).filter(
      (e) => e.push === 1,
    ).length;
  }, [pos]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
        <header className="mb-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
            MTT · 20BB
          </p>
          <h1 className="mt-1 font-display text-[24px] font-bold leading-[1.1] tracking-[-0.02em]">
            푸시/폴드 차트
          </h1>
          <p className="mt-2 text-[13px] leading-[1.55] text-fg-muted">
            숏스택 (~20BB 이하)에서는 레이즈 사이즈 의미가 사라져요. <span className="text-fg">올인 or 폴드</span> 두
            가지 결정만 남습니다. 아래는 Nash 균형 기준 포지션별 푸시 레인지.
          </p>
        </header>

        <section className="mb-3 overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {PUSH_FOLD_POSITIONS.map((p: PushFoldPosition) => {
              const active = p === pos;
              const count = (Object.values(PUSH_FOLD_20BB[p]) as PushFoldEntry[]).filter(
                (e) => e.push === 1,
              ).length;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPos(p)}
                  className={cn(
                    'rounded-[var(--radius-button)] border px-3 py-1.5 font-mono text-[12px] whitespace-nowrap',
                    active
                      ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/15 text-[color:var(--color-accent)]'
                      : 'border-hair surface text-fg-muted',
                  )}
                >
                  {p}
                  <span className="ml-1 tabular-nums opacity-80">· {count}</span>
                </button>
              );
            })}
          </div>
        </section>

        <p className="mb-2 text-center font-mono text-[11px] text-fg-muted">
          {pos} · 푸시 <span className="text-fg font-semibold">{pushCount}</span>개 / 169
          <span className="mx-2">·</span>
          <span className="text-[color:var(--color-raise)]">올인</span> vs{' '}
          <span className="text-[color:var(--color-fold)]">폴드</span>
        </p>

        <RangeGrid mixes={mixes} />

        <div className="mt-4 rounded-[var(--radius-button)] border-hair surface p-3 text-[12px] leading-[1.55] text-fg-muted">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
            사용법
          </p>
          <p className="mt-1">
            탁자 앞에 앉은 포지션 탭을 누르면 그 자리에서 푸시해도 되는 핸드가
            레드로 표시돼요. 블루는 폴드. 스택이 얕을수록 레인지가 넓어지고,
            SB에서 직접 폴드 무빙이 가장 공격적.
          </p>
          <p className="mt-2 text-[11px]">
            ※ BB 디펜스 / vs 푸시 콜 레인지는 추후 업데이트 예정.
          </p>
        </div>

        <nav className="mt-8 flex justify-center">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted underline-offset-4 hover:underline"
          >
            ← 홈으로
          </Link>
        </nav>
      </main>
    </>
  );
}
