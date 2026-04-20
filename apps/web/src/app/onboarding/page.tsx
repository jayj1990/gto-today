'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo, cn } from '@gto/ui';
import { useAuthStore } from '@/lib/auth-store';

interface Slide {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  alt: string;
}

const SLIDES: Slide[] = [
  {
    eyebrow: 'Daily Challenge',
    title: '매일 10핸드',
    body: '오늘의 10핸드가 공개됐어요. 전 세계 사용자가 같은 문제를 함께 풉니다.',
    image: '/ai-assets/onboarding-v2/daily-training.png',
    alt: '카드 두 장과 골드 칩이 놓인 포커 테이블 위로 흐르는 골드 리본',
  },
  {
    eyebrow: 'GTO Solutions',
    title: 'GTO 솔루션',
    body: '포지션·스택별 최적 전략을 즉시 확인. AI가 왜 그 답인지 한국어로 알려줘요.',
    image: '/ai-assets/onboarding-v2/gto-mix.png',
    alt: '레이즈·콜·폴드 세 결정을 시각화한 빨강·초록·파랑 리본',
  },
  {
    eyebrow: 'Live Assist',
    title: '실전 어시스트',
    body: '홈게임 중에도 슬쩍 열어보세요. 핸드 하나만 고르면 곧바로 GTO 답.',
    image: '/ai-assets/onboarding-v2/mobile-assist.png',
    alt: '스마트폰에서 뻗어나오는 골드 가이던스 라인',
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
      {/* Header: back button (left) + skip (right). Logo drops to keep
          the focus on the slide content once the user has stepped in. */}
      <header className="flex items-center justify-between">
        {index > 0 ? (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border-hair surface-raised text-fg active:scale-[0.95]"
            aria-label="이전"
          >
            ←
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/mark-g3-transparent.png"
              alt=""
              width={32}
              height={32}
              style={{ width: 32, height: 32, objectFit: 'contain' }}
            />
            <Logo variant="full" width={88} aria-hidden />
          </div>
        )}
        <button
          type="button"
          onClick={skip}
          className="font-mono text-[12px] uppercase tracking-[0.2em] text-fg-muted"
        >
          건너뛰기
        </button>
      </header>

      {/* Visual area — DALL·E HD onboarding illustrations */}
      <div className="flex flex-1 items-center justify-center py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.image}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center"
          >
            {/* Radial mask fades the four edges so the DALL·E square crops
                merge smoothly into the felt-green page background. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt={slide.alt}
              width={320}
              height={320}
              style={{
                width: 'min(72vw, 320px)',
                height: 'auto',
                aspectRatio: '1 / 1',
                objectFit: 'contain',
                WebkitMaskImage:
                  'radial-gradient(ellipse at center, black 45%, transparent 92%)',
                maskImage:
                  'radial-gradient(ellipse at center, black 45%, transparent 92%)',
              }}
            />
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

      {/* CTA — full-width primary. Back button moved to the header. */}
      <button
        type="button"
        onClick={goNext}
        style={{ touchAction: 'manipulation' }}
        className="mt-6 h-14 w-full rounded-[var(--radius-button)] bg-gold-gradient text-center font-semibold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
      >
        {last ? '시작하기' : '다음'}
      </button>

      <p className="mt-4 text-center text-[12px] text-fg-muted">
        이미 계정이 있나요?{' '}
        <Link href="/signin" className="text-[color:var(--color-accent)] underline-offset-4 hover:underline">
          로그인
        </Link>
      </p>
    </main>
  );
}

