import type { ReactNode } from 'react';

/**
 * Single source of truth for the primary nav tabs. Both the mobile
 * BottomNav and the desktop strip in SiteHeader render from this list,
 * so adding a tab in one place updates both surfaces.
 */
export interface NavTab {
  href: string;
  label: string;
  icon: (active: boolean) => ReactNode;
  match: (pathname: string) => boolean;
}

export const NAV_TABS: NavTab[] = [
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

/* ─────────── Icons — stroke=currentColor so they inherit nav color ─ */

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
