'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo, cn } from '@gto/ui';
import {
  DailyTrainingIllustration,
  GtoMixIllustration,
  MobilePokerIllustration,
} from '@/components/onboarding-illustrations';
import { useAuthStore } from '@/lib/auth-store';

interface Slide {
  eyebrow: string;
  title: string;
  body: string;
  visual: 'cards' | 'chips' | 'mark';
}

const SLIDES: Slide[] = [
  {
    eyebrow: '매일의 훈련',
    title: '하루 10핸드.\n더 나은 판단.',
    body: '매일 세계 모든 사용자가 같은 10핸드를 풉니다. 연속 훈련을 쌓아보세요.',
    visual: 'cards',
  },
  {
    eyebrow: 'GTO 기반',
    title: '이론이 아닌\n습관으로.',
    body: '포지션·스택·시나리오에 따른 GTO 믹스를 즉시 확인하고, AI가 이유를 설명합니다.',
    visual: 'chips',
  },
  {
    eyebrow: '모바일 우선',
    title: '실전 옆에\n나란히.',
    body: '캐시·토너먼트 설정만 맞추면, 실전 중에도 한 손으로 GTO 가이드를 열 수 있어요.',
    visual: 'mark',
  },
];

/**
 * 3-slide onboarding flow. Swipe or tap next to advance. Skip link at top
 * right jumps straight to /signin. Each slide is a pure full-screen
 * composition — header dots, visual, title, body, CTA.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const onboarded = useAuthStore((s) => s.onboarded);
  const signedIn = useAuthStore((s) => s.signedIn);
  const [index, setIndex] = useState(0);

  // If the user already completed onboarding + signed in, send them home.
  useEffect(() => {
    if (onboarded && signedIn) router.replace('/');
  }, [onboarded, signedIn, router]);

  const last = index === SLIDES.length - 1;
  const slide = SLIDES[index]!;

  const goNext = () => {
    if (last) {
      setOnboarded();
      router.push('/signin');
    } else {
      setIndex((i) => i + 1);
    }
  };
  const skip = () => {
    setOnboarded();
    router.push('/signin');
  };

  return (
    <main
      className="relative mx-auto flex min-h-dvh max-w-lg flex-col safe-pad-x"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 20px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
      }}
    >
      {/* Header: logo + skip */}
      <header className="flex items-center justify-between">
        <Logo variant="full" width={108} />
        <button
          type="button"
          onClick={skip}
          className="font-mono text-[12px] uppercase tracking-[0.2em] text-fg-muted"
        >
          건너뛰기
        </button>
      </header>

      {/* Visual area */}
      <div className="flex flex-1 items-center justify-center py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.visual + index}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center"
          >
            {slide.visual === 'cards' && <DailyTrainingIllustration />}
            {slide.visual === 'chips' && <GtoMixIllustration />}
            {slide.visual === 'mark' && <MobilePokerIllustration />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Copy */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}
          className="text-center"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--color-accent)]">
            {slide.eyebrow}
          </p>
          <h1 className="mt-3 whitespace-pre-line font-display text-[32px] font-bold leading-[1.15] tracking-[-0.02em]">
            {slide.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xs text-body text-fg-muted">{slide.body}</p>
        </motion.div>
      </AnimatePresence>

      {/* Pagination dots */}
      <ul className="mt-6 flex justify-center gap-1.5" aria-label="진행도">
        {SLIDES.map((_, i) => (
          <li
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-[var(--dur-base)]',
              i === index ? 'w-6 bg-[color:var(--color-accent)]' : 'w-1.5 bg-[color:var(--color-border)]',
            )}
          />
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-6 flex items-center justify-between gap-3">
        {index > 0 ? (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="h-12 w-12 rounded-full border-hair surface-raised text-fg-muted active:scale-[0.96]"
            aria-label="이전"
          >
            ←
          </button>
        ) : (
          <div className="w-12" />
        )}
        <button
          type="button"
          onClick={goNext}
          style={{ touchAction: 'manipulation' }}
          className="h-14 flex-1 rounded-[var(--radius-button)] bg-gold-gradient font-semibold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
        >
          {last ? '시작하기' : '다음'}
        </button>
      </div>

      <p className="mt-4 text-center text-[12px] text-fg-muted">
        이미 계정이 있나요?{' '}
        <Link href="/signin" className="text-[color:var(--color-accent)] underline-offset-4 hover:underline">
          로그인
        </Link>
      </p>
    </main>
  );
}

/* Slide visuals now live in components/onboarding-illustrations.tsx */
