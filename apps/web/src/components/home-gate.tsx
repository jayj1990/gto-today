'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo, cn } from '@gto/ui';
import { useAuthStore } from '@/lib/auth-store';
import { formatTodayKR } from '@/lib/date';

/**
 * Client-only landing component that gates the home screen behind:
 *   • onboarding completion → redirect to /onboarding
 *   • sign-in               → redirect to /signin
 *
 * Once both are satisfied, it renders a deliberately minimal home: just
 * two large buttons ("오늘의 훈련" / "실전 모드") as requested. The old
 * hero + secondary card + footer grid is gone — one decision per screen.
 */
export function HomeGate() {
  const router = useRouter();
  const onboarded = useAuthStore((s) => s.onboarded);
  const signedIn = useAuthStore((s) => s.signedIn);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  useEffect(() => {
    if (!onboarded) {
      router.replace('/onboarding');
      return;
    }
    if (!signedIn) {
      router.replace('/signin');
    }
  }, [onboarded, signedIn, router]);

  if (!onboarded || !signedIn) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="font-mono text-[12px] text-fg-muted">불러오는 중…</p>
      </main>
    );
  }

  return (
    <main
      className="relative mx-auto flex min-h-dvh max-w-lg flex-col safe-pad-x"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 20px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 28px)',
      }}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/mark-g3-transparent.png"
            alt=""
            width={36}
            height={36}
            style={{
              width: 36,
              height: 36,
              objectFit: 'contain',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
            }}
          />
          <Logo variant="full" width={96} aria-hidden />
        </div>
        <button
          type="button"
          onClick={() => {
            signOut();
            router.replace('/signin');
          }}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted"
          aria-label="로그아웃"
        >
          {user?.name ?? '게스트'}
        </button>
      </header>

      <section className="mt-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--color-gold)]">
          오늘 · {formatTodayKR()}
        </p>
        <h1 className="mt-3 font-display text-[36px] font-bold leading-[1.08] tracking-[-0.02em]">
          어디서부터
          <br />
          시작할까요?
        </h1>
      </section>

      <div className="mt-10 grid gap-4">
        <PrimaryCard
          href="/today"
          eyebrow="Daily Challenge"
          title="오늘의 훈련"
          description="매일 무료로 제공되는 GTO 훈련."
          variant="primary"
          delay={0}
        />
        <PrimaryCard
          href="/live"
          eyebrow="Live Assist"
          title="실전 모드"
          description="내 상황에 GTO 적용해보기."
          variant="secondary"
          delay={0.06}
        />
      </div>

      <footer className="mt-auto pt-10">
        <Link
          href="/sim"
          className="flex items-center justify-between rounded-[var(--radius-button)] border-hair surface px-4 py-3 text-[13px] transition-colors hover:bg-[color:var(--color-surface-raised)]"
        >
          <span>자유 시뮬레이션 — 시간 날 때 혼자 연습</span>
          <span aria-hidden className="text-fg-muted">
            →
          </span>
        </Link>
      </footer>
    </main>
  );
}

function PrimaryCard({
  href,
  eyebrow,
  title,
  description,
  variant,
  delay,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  variant: 'primary' | 'secondary';
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={href}
        style={{ touchAction: 'manipulation' }}
        className={cn(
          'block rounded-[var(--radius-panel)] p-6 transition-transform active:scale-[0.98]',
          variant === 'primary'
            ? 'bg-gold-gradient text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)]'
            : 'border-hair surface hover:bg-[color:var(--color-surface-raised)]',
        )}
      >
        <p
          className={cn(
            'font-mono text-[11px] uppercase tracking-[0.22em]',
            variant === 'primary' ? 'text-noir/70' : 'text-[color:var(--color-accent)]',
          )}
        >
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-[28px] font-bold leading-tight tracking-[-0.015em]">
          {title}
        </h2>
        <p
          className={cn(
            'mt-2 text-[14px]',
            variant === 'primary' ? 'text-noir/75' : 'text-fg-muted',
          )}
        >
          {description}
        </p>
        <span className="mt-6 inline-flex items-center gap-1 font-medium">
          시작 <span aria-hidden>→</span>
        </span>
      </Link>
    </motion.div>
  );
}
