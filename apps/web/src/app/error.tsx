'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@gto/ui';

/**
 * Root-level error boundary. Next.js 15 catches any render error in
 * the segment tree and mounts this instead of a blank page.
 *
 * Special-cases the post-deploy "stale cache" failure: after a new
 * build ships, a phone holding an old service-worker precache loads
 * chunk hashes that no longer match, throwing a ChunkLoadError on
 * every screen. We detect that, purge the SW + caches once, and hard-
 * reload onto the fresh build — no user action needed. A one-shot
 * sessionStorage guard prevents reload loops if the purge doesn't fix
 * it (then we fall through to the manual recovery UI).
 */
function isStaleChunkError(error: Error): boolean {
  const msg = `${error.name} ${error.message}`.toLowerCase();
  return (
    msg.includes('chunkloaderror') ||
    msg.includes('loading chunk') ||
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('importing a module script failed')
  );
}

const RELOAD_GUARD = 'gto_stale_reload_done';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[gto.today error boundary]', error);
    }

    if (!isStaleChunkError(error)) return;
    // Only auto-recover once per session — avoid an infinite purge/reload
    // loop if something other than stale cache is wrong.
    if (sessionStorage.getItem(RELOAD_GUARD)) return;
    sessionStorage.setItem(RELOAD_GUARD, '1');
    setRecovering(true);

    void (async () => {
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch {
        // Best-effort. Even if purge fails, the reload below often
        // resolves it because the new SW activates (skipWaiting).
      }
      // Cache-busted reload onto the current build.
      window.location.replace(`/?_r=${Date.now()}`);
    })();
  }, [error]);

  if (recovering) {
    return (
      <main className="relative mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
        <div className="absolute inset-x-0 top-0 flex justify-center pt-10">
          <Logo variant="full" width={110} wordColor="var(--color-fg-muted)" />
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-accent)]">
          Updating
        </p>
        <h1 className="font-display mt-3 text-[28px] font-bold leading-[1.15] tracking-[-0.02em]">
          최신 버전으로 업데이트 중
        </h1>
        <p className="text-fg-muted mt-3 text-[14px] leading-[1.55]">
          잠깐이면 끝나요. 자동으로 새로고침됩니다.
        </p>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="absolute inset-x-0 top-0 flex justify-center pt-10">
        <Logo variant="full" width={110} wordColor="var(--color-fg-muted)" />
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-raise)]">
        Error
      </p>
      <h1 className="font-display mt-3 text-[32px] font-bold leading-[1.15] tracking-[-0.02em]">
        화면을 불러오지 못했어요
      </h1>
      <p className="text-fg-muted mt-3 text-[14px] leading-[1.6]">
        다시 시도하면 대부분 해결됩니다. 계속 안 되면 홈에서 다시 시작해보세요.
      </p>
      {error.digest && (
        <p className="text-fg-muted mt-2 font-mono text-[10px]">ref: {error.digest}</p>
      )}

      <div className="mt-8 grid w-full max-w-xs grid-cols-2 gap-2">
        <button
          type="button"
          onClick={reset}
          className="bg-gold-gradient text-noir inline-flex h-12 items-center justify-center rounded-[var(--radius-button)] font-semibold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="border-hair surface-raised inline-flex h-12 items-center justify-center rounded-[var(--radius-button)] text-[14px] font-semibold active:scale-[0.98]"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
