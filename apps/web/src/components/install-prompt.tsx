'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { useChallengeStore } from '@/lib/challenge-store';

/**
 * Dismissible PWA install banner.
 *
 * - Android/Chromium: captures `beforeinstallprompt`, shows a banner,
 *   calls prompt() on click.
 * - iOS Safari: no install event exists, so we detect the browser and
 *   show share-to-homescreen instructions instead.
 *
 * Banner only shows after the user has seen onboarding and signed in
 * (to not interrupt first-touch), and respects a 30-day "don't ask again"
 * cookie in localStorage.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed-at';
const DISMISS_COOLDOWN_DAYS = 30;

// Routes where the install prompt would be intrusive — onboarding,
// signin, sensitive flows. Everywhere else is fair game after
// onboarding completes.
const SUPPRESSED_PATHS = ['/onboarding', '/signin'];

export function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const pathname = usePathname();
  const onboarded = useAuthStore((s) => s.onboarded);
  const signedIn = useAuthStore((s) => s.signedIn);
  // Require the user to have actually engaged with the product before
  // asking them to install it — 5 answered spots proves intent and
  // the prompt lands after value delivered, not before.
  const answeredCount = useChallengeStore((s) => s.answers.length);
  const engagementReady = answeredCount >= 5;

  const suppressed =
    !onboarded ||
    !signedIn ||
    !engagementReady ||
    SUPPRESSED_PATHS.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (suppressed) return;
    // Respect cooldown
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_DAYS * 86400_000) {
      return;
    }
    // Already installed / standalone display mode → nothing to show.
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (
      'standalone' in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone
    ) {
      return;
    }

    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !/MSStream/.test(ua);
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS: show banner on a delay; no event to wait for.
    if (ios) {
      const t = setTimeout(() => setVisible(true), 8000);
      return () => {
        clearTimeout(t);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [suppressed]);

  // Route changes can move the user onto a suppressed path while the
  // prompt is up — hide it without clearing the dismissal cookie.
  useEffect(() => {
    if (suppressed) setVisible(false);
  }, [suppressed]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  const install = async () => {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    const result = await deferredEvent.userChoice;
    if (result.outcome === 'accepted') {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setVisible(false);
    setDeferredEvent(null);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="region"
          aria-label="홈화면에 추가"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="safe-pad-x fixed bottom-0 left-0 right-0 z-40"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
          }}
        >
          <div className="border-hair bg-[color:var(--color-surface-raised)]/95 mx-auto max-w-md rounded-[var(--radius-panel)] p-3 shadow-[var(--shadow-card)] backdrop-blur">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/mark-g3-transparent.png"
                alt=""
                width={36}
                height={36}
                style={{ width: 36, height: 36, objectFit: 'contain' }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[14px] font-semibold leading-tight">
                  {isIOS ? '홈화면에 추가하기' : '앱으로 설치하기'}
                </p>
                <p className="text-fg-muted mt-0.5 text-[11px]">
                  {isIOS
                    ? '공유 버튼 → 홈 화면에 추가'
                    : '홈화면에 바로가기 · 오프라인 데이터 포함'}
                </p>
              </div>
              {!isIOS && deferredEvent && (
                <button
                  type="button"
                  onClick={install}
                  className="bg-gold-gradient text-noir rounded-[var(--radius-button)] px-3 py-2 font-mono text-[11px] font-bold"
                >
                  설치
                </button>
              )}
              <button
                type="button"
                onClick={dismiss}
                aria-label="닫기"
                className="text-fg-muted flex h-9 w-9 items-center justify-center rounded-[var(--radius-button)]"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
