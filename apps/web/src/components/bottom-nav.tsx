'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/auth-store';
import { useMistakesStore } from '@/lib/mistakes-store';
import { cn } from '@gto/ui';

/**
 * Mobile-first bottom tab bar. Only renders once the user is past
 * onboarding + signin (same gate as the home screen) and stays hidden
 * on auth / onboarding surfaces. Items:
 *   홈 / 오늘 / 실전 / 복습 (badge when > 0) / 통계
 */

interface Tab {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
  match: (pathname: string) => boolean;
}

const TABS: Tab[] = [
  {
    href: '/',
    label: '홈',
    match: (p) => p === '/',
    icon: (a) => <IconHome active={a} />,
  },
  {
    href: '/today',
    label: '오늘',
    match: (p) => p.startsWith('/today'),
    icon: (a) => <IconToday active={a} />,
  },
  {
    href: '/live',
    label: '실전',
    match: (p) => p.startsWith('/live'),
    icon: (a) => <IconLive active={a} />,
  },
  {
    href: '/review',
    label: '복습',
    match: (p) => p.startsWith('/review'),
    icon: (a) => <IconReview active={a} />,
  },
  {
    href: '/stats',
    label: '통계',
    match: (p) => p.startsWith('/stats'),
    icon: (a) => <IconStats active={a} />,
  },
];

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
        {TABS.map((t) => {
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
                  <span className="absolute right-[28%] top-1.5 min-w-[16px] rounded-full bg-[color:var(--color-raise)] px-1 text-center font-mono text-[9px] font-bold leading-[16px] text-white">
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

/* ─────────── Icons — stroke=currentColor so they inherit tab color ─ */

interface IconProps {
  active: boolean;
}

function IconHome({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2v-9z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconToday({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
      />
      <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth={active ? 2 : 1.6} />
      <path
        d="M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
      />
      {active && <circle cx="12" cy="14.5" r="1.6" fill="currentColor" />}
    </svg>
  );
}

function IconLive({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse
        cx="12"
        cy="12"
        rx="9"
        ry="6.5"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
      />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
    </svg>
  );
}

function IconReview({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7a3 3 0 0 1 3-3h7l6 6v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinejoin="round"
      />
      <path
        d="M14 4v5h5"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinejoin="round"
      />
      <path
        d="M8.5 13.5l2 2 4-4"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconStats({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3.5"
        y="13"
        width="3.5"
        height="7"
        rx="0.75"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
      />
      <rect
        x="10.25"
        y="8"
        width="3.5"
        height="12"
        rx="0.75"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
      />
      <rect
        x="17"
        y="4"
        width="3.5"
        height="16"
        rx="0.75"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
      />
    </svg>
  );
}
