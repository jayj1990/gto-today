'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@gto/ui';

/**
 * Root-level error boundary. Next.js 15 catches any render error in
 * the segment tree and mounts this instead of a blank page. Keeps
 * the brand present (small logo up top) and gives two recovery paths
 * — retry the current page + bail to home.
 *
 * Production builds mask the error message for security; we still
 * log it to the browser console in dev so it's inspectable.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[gto.today error boundary]', error);
    }
  }, [error]);

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="absolute inset-x-0 top-0 flex justify-center pt-10">
        <Logo variant="full" width={110} wordColor="var(--color-fg-muted)" />
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-raise)]">
        Error
      </p>
      <h1 className="mt-3 font-display text-[34px] font-bold leading-[1.1] tracking-[-0.02em]">
        잠시 문제가 생겼어요
      </h1>
      <p className="mt-3 text-[14px] leading-[1.55] text-fg-muted">
        화면을 다시 그리면 대부분 해결돼요. 같은 곳에서 반복되면
        홈으로 돌아가 새 핸드를 풀어보세요.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[10px] text-fg-muted">
          ref: {error.digest}
        </p>
      )}

      <div className="mt-8 grid w-full max-w-xs grid-cols-2 gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-button)] bg-gold-gradient font-semibold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-button)] border-hair surface-raised text-[14px] font-semibold active:scale-[0.98]"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
