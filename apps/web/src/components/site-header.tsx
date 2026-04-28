'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Logo, cn } from '@gto/ui';
import { useAuthStore } from '@/lib/auth-store';
import { useMistakesStore } from '@/lib/mistakes-store';
import { NAV_TABS } from '@/lib/nav-tabs';

/**
 * Sticky top header — G3 chip icon (left) + "GTO · today" SVG wordmark,
 * both wrapped in a single link back to home. Theme pinned to Tonight.
 *
 * Desktop (md+) gets an inline nav strip after the wordmark so users
 * with no BottomNav (which is `md:hidden`) can still reach 오늘 / 실전 /
 * 복습 / 통계 without round-tripping through the home cards. The strip
 * uses the same NAV_TABS source as BottomNav and the same mistake-count
 * badge on /review.
 */
const NAV_SUPPRESSED = ['/onboarding', '/signin'];

export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const onboarded = useAuthStore((s) => s.onboarded);
  const signedIn = useAuthStore((s) => s.signedIn);
  const { status: sessionStatus } = useSession();
  const authed = signedIn || sessionStatus === 'authenticated';
  const mistakeCount = useMistakesStore((s) => s.mistakes.length);

  // Same gate as BottomNav — only show desktop nav once user is past
  // onboarding + signin.
  const showNav = onboarded && authed && !NAV_SUPPRESSED.some((p) => pathname.startsWith(p));

  return (
    <header className="safe-top bg-[color:var(--color-bg)]/70 sticky top-0 z-20 backdrop-blur-md">
      <div className="safe-pad-x mx-auto flex h-14 max-w-5xl items-center">
        <Link
          href="/"
          aria-label="gto.today 홈"
          className="flex items-center gap-2.5 active:scale-[0.97]"
          style={{ touchAction: 'manipulation' }}
        >
          <Image
            src="/logos/mark-g3-transparent.png"
            alt=""
            width={36}
            height={36}
            priority
            style={{
              width: 36,
              height: 36,
              objectFit: 'contain',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
            }}
          />
          <Logo variant="full" width={92} aria-hidden />
        </Link>

        {showNav && (
          <nav aria-label="주요 메뉴" className="ml-auto hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV_TABS.map((t) => {
                const active = t.match(pathname);
                const showBadge = t.href === '/review' && mistakeCount > 0;
                return (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative flex h-9 items-center gap-1.5 rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors active:scale-[0.97]',
                        active
                          ? 'bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)]'
                          : 'text-fg-muted hover:text-fg hover:bg-[color:var(--color-surface-raised)]',
                      )}
                    >
                      <span aria-hidden className="inline-flex h-4 w-4 items-center justify-center">
                        <span className="scale-[0.78]">{t.icon(active)}</span>
                      </span>
                      <span>{t.label}</span>
                      {showBadge && (
                        <span className="text-on-primary ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[color:var(--color-raise)] px-1 font-mono text-[9px] font-bold">
                          {mistakeCount > 99 ? '99+' : mistakeCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
