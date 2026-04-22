'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo, cn } from '@gto/ui';
import { useAuthStore } from '@/lib/auth-store';
import { useChallengeStore } from '@/lib/challenge-store';
import { useMistakesStore } from '@/lib/mistakes-store';
import { isoDateKR } from '@/lib/date';

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
  const { data: nextAuthSession, status: sessionStatus } = useSession();
  const avatarUrl = nextAuthSession?.user?.image ?? null;
  const challengeDate = useChallengeStore((s) => s.dateKey);
  const challengeCursor = useChallengeStore((s) => s.cursor);
  const currentStreak = useChallengeStore((s) => s.currentStreak);
  const mistakeCount = useMistakesStore((s) => s.mistakes.length);
  const today = isoDateKR();
  const todayActive = challengeDate === today;
  const todayDone = todayActive && challengeCursor >= 10;
  const todayProgress = todayActive ? Math.min(challengeCursor, 10) : 0;
  // NextAuth is the source of truth — use it directly to avoid the
  // race where SessionSync hasn't mirrored the session into zustand
  // yet on the first render after an OAuth redirect.
  const sessionResolved = sessionStatus !== 'loading';
  const authed = signedIn || sessionStatus === 'authenticated';

  useEffect(() => {
    if (!sessionResolved) return;
    if (!onboarded) {
      router.replace('/onboarding');
      return;
    }
    if (!authed) {
      router.replace('/signin');
    }
  }, [onboarded, authed, sessionResolved, router]);

  if (!sessionResolved || !onboarded || !authed) {
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
        <Link
          href="/account"
          className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted active:scale-[0.96]"
          aria-label="내 계정"
        >
          <span className="hidden sm:inline">{user?.name ?? '게스트'}</span>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              width={28}
              height={28}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '1.5px solid rgba(212,175,55,0.6)',
              }}
            />
          ) : (
            <span
              aria-hidden
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--color-surface-raised)',
                border: '1.5px solid var(--color-border)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: 'var(--color-fg-muted)',
              }}
            >
              {(user?.name ?? '게')[0]}
            </span>
          )}
        </Link>
      </header>

      <div className="mt-6 grid gap-3">
        <PrimaryCard
          href="/today"
          eyebrow={
            todayDone
              ? `Daily · 오늘 완료 · ${currentStreak}일 연속`
              : todayActive
                ? `Daily · ${todayProgress}/10 진행 중`
                : currentStreak > 0
                  ? `Daily · ${currentStreak}일 연속`
                  : 'Daily Challenge'
          }
          title="오늘의 훈련"
          description={
            todayDone
              ? '내일 공개되는 새 핸드 기다려요.'
              : todayActive
                ? '이어서 풀기'
                : '매일 새로 공개되는 10핸드. 하루 5분.'
          }
          variant="primary"
          delay={0}
          progress={todayActive ? todayProgress / 10 : 0}
        />
        <PrimaryCard
          href="/sim"
          eyebrow="Infinite Drills"
          title="무한 GTO 훈련"
          description="10핸드 끝났다면 이어서 계속."
          variant="secondary"
          delay={0.06}
        />
        <PrimaryCard
          href="/live"
          eyebrow="Live Assist"
          title="실전 모드"
          description="테이블 옆에서 열어보는 GTO 가이드."
          variant="secondary"
          delay={0.12}
        />
        <PrimaryCard
          href="/mtt/push-fold"
          eyebrow="MTT · 20BB"
          title="푸시/폴드 차트"
          description="숏스택 Nash 균형. 포지션별 올인 레인지."
          variant="secondary"
          delay={0.15}
        />
        {mistakeCount > 0 && (
          <PrimaryCard
            href="/review"
            eyebrow={`Review · ${mistakeCount}개 오답`}
            title="복습 모드"
            description="틀렸던 스팟만 모아서 다시 풀기."
            variant="secondary"
            delay={0.18}
          />
        )}
      </div>
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
  progress,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  variant: 'primary' | 'secondary';
  delay: number;
  progress?: number;
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
          'block rounded-[var(--radius-panel)] p-5 transition-transform active:scale-[0.98]',
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
        <h2 className="mt-2 font-display text-[22px] font-bold leading-tight tracking-[-0.015em]">
          {title}
        </h2>
        <p
          className={cn(
            'mt-1 text-[13px]',
            variant === 'primary' ? 'text-noir/75' : 'text-fg-muted',
          )}
        >
          {description}
        </p>
        {progress !== undefined && progress > 0 && progress < 1 && (
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-noir/15">
            <div
              className="h-full rounded-full bg-noir/70 transition-[width] duration-500"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}
      </Link>
    </motion.div>
  );
}
