'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
    eyebrow: 'Daily',
    title: '매일 10핸드',
    body: '오늘의 답을 내일의 감으로 바꾸는 포커 루틴.',
    image: '/ai-assets/onboarding-v2/daily-training.jpg',
    alt: '카드 두 장과 골드 칩이 놓인 포커 테이블 위로 흐르는 골드 리본',
  },
  {
    eyebrow: 'GTO',
    title: '포커의 정답은 GTO',
    body: '포커는 운이 아니라 균형의 싸움.\nGTO 훈련으로 늘리는 승률.',
    image: '/ai-assets/onboarding-v2/gto-mix.jpg',
    alt: '레이즈·콜·폴드 세 결정을 시각화한 빨강·초록·파랑 리본',
  },
  {
    eyebrow: 'Live',
    title: '테이블 옆의 조력자',
    body: 'GTO Today가 당신의 결정에 힘을 실어드립니다.',
    image: '/ai-assets/onboarding-v2/mobile-assist.jpg',
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
      className="safe-pad-x relative mx-auto flex min-h-dvh max-w-lg flex-col"
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
            className="border-hair surface-raised text-fg flex h-10 w-10 items-center justify-center rounded-full active:scale-[0.95]"
            aria-label="이전"
          >
            ←
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Image
              src="/logos/mark-g3-transparent.png"
              alt=""
              width={32}
              height={32}
              priority
              style={{ width: 32, height: 32, objectFit: 'contain' }}
            />
            <Logo variant="full" width={88} aria-hidden />
          </div>
        )}
        <button
          type="button"
          onClick={skip}
          className="text-fg-muted font-mono text-[12px] uppercase tracking-[0.2em]"
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
            <Image
              src={slide.image}
              alt={slide.alt}
              width={640}
              height={640}
              priority={index === 0}
              sizes="(max-width: 480px) 72vw, 320px"
              style={{
                width: 'min(72vw, 320px)',
                height: 'auto',
                aspectRatio: '1 / 1',
                objectFit: 'contain',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 45%, transparent 92%)',
                maskImage: 'radial-gradient(ellipse at center, black 45%, transparent 92%)',
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
          <h1 className="font-display mt-3 whitespace-pre-line text-[32px] font-bold leading-[1.15] tracking-[-0.02em]">
            {slide.title}
          </h1>
          <p className="text-body text-fg-muted mx-auto mt-4 max-w-xs whitespace-pre-line">
            {slide.body}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Pagination dots */}
      <ul className="mt-6 flex justify-center gap-1.5" aria-label="진행도">
        {SLIDES.map((_, i) => (
          <li
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-[var(--dur-base)]',
              i === index
                ? 'w-6 bg-[color:var(--color-accent)]'
                : 'w-1.5 bg-[color:var(--color-border)]',
            )}
          />
        ))}
      </ul>

      {/* CTA — full-width primary. Back button moved to the header. */}
      <button
        type="button"
        onClick={goNext}
        style={{ touchAction: 'manipulation' }}
        className="bg-gold-gradient text-noir mt-6 h-14 w-full rounded-[var(--radius-button)] text-center font-semibold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
      >
        {last ? '시작하기' : '다음'}
      </button>

      <p className="text-fg-muted mt-4 text-center text-[12px]">
        이미 계정이 있나요?{' '}
        <Link
          href="/signin"
          className="text-[color:var(--color-accent)] underline-offset-4 hover:underline"
        >
          로그인
        </Link>
      </p>
    </main>
  );
}
