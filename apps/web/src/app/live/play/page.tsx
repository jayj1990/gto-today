'use client';

import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { useLiveStore } from '@/lib/live-store';

/**
 * Placeholder "실전 플레이" screen. Phase 5+ will turn this into a
 * live hand-input GTO solver (enter your cards + position + action → see
 * GTO answer instantly). For now it summarizes the saved setup and
 * redirects the user to /today or /sim where training flow is live.
 */
export default function LivePlayPage() {
  const config = useLiveStore((s) => s.config);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+32px)] pt-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
          실전 모드
        </p>
        <h1 className="mt-2 font-display text-[32px] font-bold tracking-[-0.02em]">
          설정 저장 완료
        </h1>
        <p className="mt-3 text-body text-fg-muted">
          {config.gameType === 'cash' ? '캐시 게임' : '토너먼트'} · {config.format} · {config.stackBB}BB
        </p>

        <div className="mt-8 rounded-[var(--radius-panel)] border-hair surface p-5">
          <p className="font-display text-[16px] font-semibold">
            실전 핸드 입력 화면은 준비 중입니다.
          </p>
          <p className="mt-2 text-[13px] text-fg-muted">
            다음 업데이트에서 카드/포지션/베팅 입력 → 즉시 GTO 판단 기능이 추가됩니다. 지금은
            훈련 모드로 같은 설정을 연습해 보세요.
          </p>
        </div>

        <div className="mt-8 grid gap-3">
          <Link
            href="/today"
            className="flex h-14 items-center justify-center rounded-[var(--radius-button)] bg-gold-gradient font-semibold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
          >
            오늘의 훈련으로
          </Link>
          <Link
            href="/sim"
            className="flex h-12 items-center justify-center rounded-[var(--radius-button)] border-hair surface-raised font-medium active:scale-[0.98]"
          >
            자유 시뮬레이션
          </Link>
          <Link
            href="/live"
            className="text-center text-[13px] text-fg-muted underline-offset-4 hover:underline"
          >
            설정 다시 잡기
          </Link>
        </div>
      </main>
    </>
  );
}
