'use client';

import Link from 'next/link';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { Logo } from '@gto/ui';

/**
 * Sign-in screen. All three providers (Google / Kakao / Naver) are
 * wired up — Kakao & Naver only succeed when their client-id/secret
 * env vars are present on the deployment (see docs/oauth-setup.md).
 * If a key is missing, Auth.js redirects to its generic error page.
 */
export default function SignInPage() {
  const handleGoogle = () => {
    void nextAuthSignIn('google', { callbackUrl: '/' });
  };
  const handleNaver = () => {
    void nextAuthSignIn('naver', { callbackUrl: '/' });
  };

  return (
    <main
      className="relative mx-auto flex min-h-dvh max-w-lg flex-col safe-pad-x"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 32px)',
      }}
    >
      <header className="flex items-center justify-between">
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
        <Link
          href="/"
          className="font-mono text-[12px] uppercase tracking-[0.2em] text-fg-muted"
        >
          나중에
        </Link>
      </header>

      <section className="mt-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--color-accent)]">
          로그인
        </p>
        <h1 className="mt-3 font-display text-[34px] font-bold leading-[1.1] tracking-[-0.02em]">
          로그인하고
          <br />
          오늘의 훈련을.
        </h1>
        <p className="mt-3 text-body text-fg-muted">
          연속 훈련 기록과 AI 해설 요청 횟수가 기기 간에 동기화됩니다.
        </p>
      </section>

      <div className="mt-10 space-y-3">
        <button
          type="button"
          onClick={handleGoogle}
          style={{ touchAction: 'manipulation' }}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-[var(--radius-button)] border-hair bg-ivory font-semibold text-noir shadow-[var(--shadow-card)] active:scale-[0.98]"
        >
          <GoogleGlyph />
          Google로 계속하기
        </button>

        <button
          type="button"
          onClick={handleNaver}
          style={{ background: '#03C75A', color: '#FFFFFF', touchAction: 'manipulation' }}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-[var(--radius-button)] border-hair font-semibold shadow-[var(--shadow-card)] active:scale-[0.98]"
        >
          <span aria-hidden className="font-display text-[20px] font-bold">N</span>
          네이버로 계속하기
        </button>

        <button
          type="button"
          disabled
          aria-disabled="true"
          title="카카오 로그인은 심사 완료 후 활성화됩니다."
          style={{
            background: '#FEE500',
            color: '#191919',
            touchAction: 'manipulation',
            opacity: 0.4,
            cursor: 'not-allowed',
          }}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-[var(--radius-button)] border-hair font-semibold shadow-[var(--shadow-card)]"
        >
          <KakaoGlyph />
          <span>카카오로 계속하기</span>
          <span className="ml-1 rounded-full bg-noir/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]">
            곧 지원
          </span>
        </button>
      </div>

      <div className="mt-auto pt-10">
        <p className="text-center text-[11px] text-fg-muted/70">
          계속 진행하면{' '}
          <Link href="/privacy" className="underline-offset-2 hover:underline">
            개인정보 처리방침
          </Link>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </main>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.79 2.72v2.26h2.9c1.69-1.56 2.67-3.86 2.67-6.62z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.46-.81 5.95-2.18l-2.9-2.26c-.8.54-1.84.86-3.05.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.95 10.7c-.18-.54-.28-1.12-.28-1.7s.1-1.16.28-1.7V4.97H.95A8.994 8.994 0 0 0 0 9c0 1.45.35 2.82.95 4.03l3-2.33z" fill="#FBBC05" />
      <path d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .95 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function KakaoGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#191919"
        d="M9 1.5C4.86 1.5 1.5 4.17 1.5 7.46c0 2.12 1.4 3.97 3.5 5l-.75 2.77c-.07.24.2.43.41.3l3.3-2.18c.35.05.69.07 1.04.07 4.14 0 7.5-2.67 7.5-5.96S13.14 1.5 9 1.5Z"
      />
    </svg>
  );
}
