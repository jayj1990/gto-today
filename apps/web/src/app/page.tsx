import Link from 'next/link';
import { Logo } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { Splash } from '@/components/splash';
import { formatTodayKR } from '@/lib/date';

export const revalidate = 3600;

/**
 * Minimal landing — two primary cards (훈련, 실전) + one secondary (자유 시뮬).
 *
 * The previous landing exposed every sub-mode up front; we switched to
 * progressive disclosure per user request. Each card leads to its own
 * setup screen (format, stack, scenario, etc.) before play.
 */
const PRIMARY: {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  cta: string;
  variant: 'primary' | 'secondary';
}[] = [
  {
    title: '오늘의 훈련',
    subtitle: 'Daily Challenge',
    description: '매일 새로운 10핸드. 연속 훈련을 쌓아가세요.',
    href: '/today',
    cta: '훈련 시작',
    variant: 'primary',
  },
  {
    title: '실전 모드',
    subtitle: 'Live Assist',
    description: '캐시·토너먼트 설정을 잡고 실전 옆에서 GTO 판단.',
    href: '/live',
    cta: '실전 열기',
    variant: 'secondary',
  },
];

export default function HomePage() {
  return (
    <>
      <Splash />
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+96px)] pt-10">
        <section
          aria-labelledby="hero-title"
          className="relative overflow-hidden rounded-[var(--radius-panel)] border-hair bg-felt-gradient grain px-6 py-12 sm:px-10 sm:py-16"
        >
          <p className="relative z-10 font-mono text-[12px] uppercase tracking-[0.24em] text-gold">
            오늘 · {formatTodayKR()}
          </p>
          <h1
            id="hero-title"
            className="relative z-10 mt-3 font-display text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-ivory sm:text-[56px]"
          >
            오늘의 GTO.
            <br />
            <span className="text-gold">매일 한 걸음.</span>
          </h1>
          <p className="relative z-10 mt-4 max-w-lg text-body-lg text-ivory/80">
            매일 한 핸드, 오늘의 판단을 다듬는 짧은 훈련.
          </p>
        </section>

        <section aria-labelledby="modes-title" className="mt-10">
          <h2 id="modes-title" className="sr-only">
            모드 선택
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {PRIMARY.map((mode) => (
              <li key={mode.href}>
                <Link
                  href={mode.href}
                  style={{ touchAction: 'manipulation' }}
                  className={
                    mode.variant === 'primary'
                      ? 'block rounded-[var(--radius-panel)] bg-gold-gradient p-6 text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] transition-transform active:scale-[0.98]'
                      : 'block rounded-[var(--radius-panel)] border-hair surface p-6 transition-colors hover:bg-[color:var(--color-surface-raised)] active:scale-[0.98]'
                  }
                >
                  <p
                    className={
                      mode.variant === 'primary'
                        ? 'font-mono text-[11px] uppercase tracking-[0.22em] text-noir/70'
                        : 'font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]'
                    }
                  >
                    {mode.subtitle}
                  </p>
                  <h3 className="mt-3 font-display text-[26px] font-bold tracking-[-0.015em]">
                    {mode.title}
                  </h3>
                  <p
                    className={
                      mode.variant === 'primary'
                        ? 'mt-2 text-[14px] text-noir/75'
                        : 'mt-2 text-[14px] text-fg-muted'
                    }
                  >
                    {mode.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1 font-medium">
                    {mode.cta} <span aria-hidden>→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="extras-title" className="mt-10">
          <h2
            id="extras-title"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted"
          >
            더 해보기
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            <li>
              <Link
                href="/sim"
                className="flex items-center justify-between rounded-[var(--radius-button)] border-hair surface px-4 py-3 transition-colors hover:bg-[color:var(--color-surface-raised)]"
              >
                <div>
                  <p className="font-display text-[15px] font-semibold">자유 시뮬레이션</p>
                  <p className="mt-0.5 text-[12px] text-fg-muted">
                    끝없는 핸드 연습. 필터 자유롭게.
                  </p>
                </div>
                <span aria-hidden className="text-fg-muted">
                  →
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/dev/showcase"
                className="flex items-center justify-between rounded-[var(--radius-button)] border-hair surface px-4 py-3 transition-colors hover:bg-[color:var(--color-surface-raised)]"
              >
                <div>
                  <p className="font-display text-[15px] font-semibold">디자인 시스템</p>
                  <p className="mt-0.5 text-[12px] text-fg-muted">
                    컴포넌트·컬러·타이포 라이브 데모.
                  </p>
                </div>
                <span aria-hidden className="text-fg-muted">
                  →
                </span>
              </Link>
            </li>
          </ul>
        </section>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-hair pt-6 text-[13px] text-fg-muted">
          <div className="flex items-center gap-2">
            <Logo variant="short" width={40} />
            <span>· 매일 한 걸음.</span>
          </div>
          <div className="flex gap-5">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </footer>
      </main>
    </>
  );
}
