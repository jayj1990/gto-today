'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { Logo } from '@gto/ui';
import { useAuthStore } from '@/lib/auth-store';
import { track } from '@/lib/analytics';

/**
 * Sign-in screen.
 * Active providers (loaded server-side in lib/auth.ts if env present):
 *   - Google OAuth
 *   - Naver OAuth
 *   - Kakao OAuth (심사 통과 후)
 *   - Resend email magic link
 * Plus a 나중에 guest-session escape hatch.
 */
export default function SignInPage() {
  const router = useRouter();
  const guestSignIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const handleGoogle = () => {
    track({ name: 'signin_attempted', props: { method: 'google' } });
    void nextAuthSignIn('google', { callbackUrl: '/' });
  };
  const handleNaver = () => {
    track({ name: 'signin_attempted', props: { method: 'naver' } });
    void nextAuthSignIn('naver', { callbackUrl: '/' });
  };
  const handleLater = () => {
    track({ name: 'signin_attempted', props: { method: 'guest' } });
    guestSignIn({
      method: 'guest',
      name: '게스트',
      signedInAt: Date.now(),
    });
    router.push('/');
  };
  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || emailSubmitting) return;
    track({ name: 'signin_attempted', props: { method: 'email' } });
    setEmailSubmitting(true);
    try {
      await nextAuthSignIn('resend', { email, callbackUrl: '/', redirect: false });
      setEmailSent(true);
    } finally {
      setEmailSubmitting(false);
    }
  };

  return (
    <main
      className="safe-pad-x relative mx-auto flex min-h-dvh max-w-lg flex-col"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 32px)',
      }}
    >
      <header className="flex items-center justify-between">
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
        <button
          type="button"
          onClick={handleLater}
          className="text-fg-muted font-mono text-[12px] uppercase tracking-[0.2em]"
        >
          나중에
        </button>
      </header>

      <section className="mt-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--color-accent)]">
          로그인
        </p>
        <h1 className="font-display mt-3 text-[34px] font-bold leading-[1.1] tracking-[-0.02em]">
          로그인하고
          <br />
          오늘의 훈련을.
        </h1>
        <p className="text-body text-fg-muted mt-3">
          연속 훈련 기록과 AI 해설 요청 횟수가 기기 간에 동기화됩니다.
        </p>
      </section>

      <div className="mt-10 space-y-3">
        <button
          type="button"
          onClick={handleGoogle}
          style={{ touchAction: 'manipulation' }}
          className="border-hair bg-ivory text-noir flex h-14 w-full items-center justify-center gap-3 rounded-[var(--radius-button)] font-semibold shadow-[var(--shadow-card)] active:scale-[0.98]"
        >
          <GoogleGlyph />
          Google로 계속하기
        </button>

        <button
          type="button"
          onClick={handleNaver}
          style={{ background: '#03C75A', color: '#FFFFFF', touchAction: 'manipulation' }}
          className="border-hair flex h-14 w-full items-center justify-center gap-3 rounded-[var(--radius-button)] font-semibold shadow-[var(--shadow-card)] active:scale-[0.98]"
        >
          <span aria-hidden className="font-display text-[20px] font-bold">
            N
          </span>
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
          className="border-hair flex h-14 w-full items-center justify-center gap-3 rounded-[var(--radius-button)] font-semibold shadow-[var(--shadow-card)]"
        >
          <KakaoGlyph />
          <span>카카오로 계속하기</span>
          <span className="bg-noir/10 ml-1 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]">
            곧 지원
          </span>
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[color:var(--color-border)]" />
        <span className="text-fg-muted font-mono text-[11px] uppercase tracking-[0.2em]">또는</span>
        <div className="h-px flex-1 bg-[color:var(--color-border)]" />
      </div>

      {emailSent ? (
        <div className="border-hair surface mt-4 rounded-[var(--radius-button)] p-4 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-call)]">
            메일 전송 완료
          </p>
          <p className="text-fg-muted mt-2 text-[13px] leading-[1.55]">
            <span className="text-fg font-semibold">{email}</span>로 로그인 링크를 보냈어요.
            <br />
            이메일의 링크를 누르면 로그인됩니다.
          </p>
        </div>
      ) : (
        <form onSubmit={handleEmail} className="mt-4 flex flex-col gap-2">
          <label htmlFor="signin-email" className="sr-only">
            이메일
          </label>
          <input
            id="signin-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-hair surface text-fg h-14 w-full rounded-[var(--radius-button)] px-4 text-[15px] placeholder:text-[color:var(--color-fg-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-gold)]"
          />
          <button
            type="submit"
            disabled={!email || emailSubmitting}
            className="border-hair surface-raised text-fg inline-flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] font-semibold active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {emailSubmitting ? '보내는 중…' : '이메일로 로그인 링크 받기'}
          </button>
        </form>
      )}

      <div className="mt-auto pt-10">
        <p className="text-fg-muted/70 text-center text-[11px]">
          계속 진행하면{' '}
          <Link href="/terms" className="underline-offset-2 hover:underline">
            이용약관
          </Link>{' '}
          및{' '}
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
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.79 2.72v2.26h2.9c1.69-1.56 2.67-3.86 2.67-6.62z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.46-.81 5.95-2.18l-2.9-2.26c-.8.54-1.84.86-3.05.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.95 10.7c-.18-.54-.28-1.12-.28-1.7s.1-1.16.28-1.7V4.97H.95A8.994 8.994 0 0 0 0 9c0 1.45.35 2.82.95 4.03l3-2.33z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .95 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"
        fill="#EA4335"
      />
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
