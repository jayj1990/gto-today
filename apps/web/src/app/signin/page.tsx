'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { Logo, cn } from '@gto/ui';
import { useAuthStore } from '@/lib/auth-store';

/**
 * Sign-in screen for the pre-Auth.js-v5 milestone.
 *
 * Three paths (all currently write a local session via useAuthStore):
 *   1. Continue with Google — stubbed for now, will become real OAuth in Phase 6
 *   2. Email magic link — stubbed; shows a sent-confirmation toast
 *   3. Guest — sets a local session and sends the user home
 *
 * Real auth arrives in Phase 6 (Auth.js v5 + Neon + Resend). The public
 * store API will not change, so pages that read useAuthStore won't break.
 */
export default function SignInPage() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Real Google OAuth — Auth.js v5 handles the redirect + callback, and
  // SessionSync mirrors the resulting session into zustand for us.
  const handleGoogle = () => {
    void nextAuthSignIn('google', { callbackUrl: '/' });
  };

  // Legacy mock sign-in path used by email + guest; will be removed once
  // we add email magic link provider.
  const done = (method: 'google' | 'apple' | 'email' | 'guest', name: string, userEmail?: string) => {
    signIn({
      method,
      name,
      email: userEmail,
      signedInAt: Date.now(),
    });
    router.replace('/');
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || sending) return;
    setSending(true);
    // Placeholder: pretend we sent a magic link. Phase 6 replaces with Resend.
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
    setSending(false);
    setTimeout(() => done('email', email.split('@')[0] ?? '사용자', email), 1200);
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
        <Logo variant="full" width={108} />
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
          onClick={() => done('apple', 'Apple 사용자')}
          style={{ touchAction: 'manipulation' }}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-[var(--radius-button)] bg-noir font-semibold text-ivory shadow-[var(--shadow-card)] ring-1 ring-inset ring-white/10 active:scale-[0.98]"
        >
          <span aria-hidden>⌁</span>
          Apple로 계속하기
        </button>

        <div className="relative my-4 flex items-center gap-3">
          <span className="h-[1px] flex-1 bg-[color:var(--color-border)]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted">
            또는
          </span>
          <span className="h-[1px] flex-1 bg-[color:var(--color-border)]" />
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
              이메일
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={cn(
                'h-14 w-full rounded-[var(--radius-button)] border-hair surface-raised px-4',
                'font-mono text-[14px] text-fg placeholder:text-fg-muted/50',
                'focus:border-[color:var(--color-accent)] focus:outline-none',
              )}
            />
          </label>
          <button
            type="submit"
            disabled={sending || sent || !email}
            className={cn(
              'flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] font-semibold transition-colors active:scale-[0.98] disabled:opacity-50',
              sent
                ? 'bg-[color:var(--color-call)] text-white'
                : 'border-hair surface-raised text-fg',
            )}
          >
            {sent ? '매직 링크 전송 완료' : sending ? '전송 중…' : '매직 링크 받기'}
          </button>
        </form>
      </div>

      <div className="mt-auto pt-10">
        <button
          type="button"
          onClick={() => done('guest', '게스트')}
          className="w-full text-center text-[13px] text-fg-muted underline-offset-4 hover:underline"
        >
          게스트로 둘러보기
        </button>
        <p className="mt-4 text-center text-[11px] text-fg-muted/70">
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
