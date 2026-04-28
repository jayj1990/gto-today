'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/auth-store';
import { useMistakesStore } from '@/lib/mistakes-store';
import { NAV_TABS } from '@/lib/nav-tabs';
import { cn } from '@gto/ui';

/**
 * Mobile-first bottom tab bar. Only renders once the user is past
 * onboarding + signin (same gate as the home screen) and stays hidden
 * on auth / onboarding surfaces. The tab list lives in lib/nav-tabs
 * so the desktop strip in SiteHeader renders from the same source.
 */

const SUPPRESSED = ['/onboarding', '/signin'];

export function BottomNav() {
  const pathname = usePathname() ?? '/';
  const onboarded = useAuthStore((s) => s.onboarded);
  const signedIn = useAuthStore((s) => s.signedIn);
  const { status: sessionStatus } = useSession();
  const authed = signedIn || sessionStatus === 'authenticated';
  const mistakeCount = useMistakesStore((s) => s.mistakes.length);

  // Gate: same rule as HomeGate + hide on the auth/onboarding paths.
  if (!onboarded || !authed) return null;
  if (SUPPRESSED.some((p) => pathname.startsWith(p))) return null;
  // Hide on the home route — the big primary cards already cover
  // every tab target, so a duplicate strip at the bottom is just
  // visual noise.
  if (pathname === '/') return null;

  return (
    <nav
      aria-label="주요 메뉴"
      className="bg-[color:var(--color-bg)]/85 fixed inset-x-0 bottom-0 z-30 backdrop-blur-md md:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        // Subtle upward shadow instead of a hard hairline border —
        // separates the nav from scrolling content without the gold
        // accent line reading as an intentional accent.
        boxShadow: '0 -8px 18px -12px rgba(0, 0, 0, 0.45)',
      }}
    >
      <ul className="mx-auto flex h-14 max-w-lg items-stretch justify-between px-2">
        {NAV_TABS.map((t) => {
          const active = t.match(pathname);
          const showBadge = t.href === '/review' && mistakeCount > 0;
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-full w-full flex-col items-center justify-center gap-0.5 transition-colors active:scale-[0.96]',
                  active ? 'text-[color:var(--color-accent)]' : 'text-fg-muted',
                )}
              >
                {t.icon(active)}
                <span className="font-mono text-[9.5px] uppercase tracking-[0.12em]">
                  {t.label}
                </span>
                {showBadge && (
                  <span className="text-on-primary absolute right-[28%] top-1.5 min-w-[16px] rounded-full bg-[color:var(--color-raise)] px-1 text-center font-mono text-[9px] font-bold leading-[16px]">
                    {mistakeCount > 99 ? '99+' : mistakeCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
