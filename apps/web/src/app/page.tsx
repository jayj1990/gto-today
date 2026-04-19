import Link from 'next/link';
import { CardView, Logo } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { formatTodayKR } from '@/lib/date';

// Re-render at most once per hour so "오늘 · 4월 19일" stays current.
export const revalidate = 3600;

const MODES: { title: string; desc: string; href: string; en: string }[] = [
  {
    title: '오늘의 챌린지',
    en: 'Daily Challenge',
    desc: '하루 10핸드, 연속 훈련을 이어가세요.',
    href: '/today',
  },
  {
    title: '실전 어시스트',
    en: 'Live Assist',
    desc: '실전 중에 옆에 띄워두는 GTO 판단 가이드.',
    href: '/assist',
  },
  {
    title: '자유 시뮬레이션',
    en: 'Free Sim',
    desc: '끝없는 핸드 연습. 히트맵으로 내 약점을 파악하세요.',
    href: '/sim',
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl safe-pad-x pb-[calc(env(safe-area-inset-bottom)+96px)]">
        <section className="relative overflow-hidden rounded-[var(--radius-panel)] mt-8 border-hair bg-felt-gradient grain">
          <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-24">
            <p className="font-mono text-[13px] uppercase tracking-[0.24em] text-gold">
              오늘 · {formatTodayKR()}
            </p>
            <h1 className="mt-4 font-display text-[44px] font-bold leading-[1.05] tracking-[-0.02em] text-ivory sm:text-[64px]">
              오늘의 GTO.
              <br />
              <span className="text-gold">매일 한 걸음.</span>
            </h1>
            <p className="mt-5 max-w-xl text-body-lg text-ivory/80">
              매일 한 핸드, 오늘의 판단을 다듬는 짧은 훈련.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/today"
                style={{ touchAction: 'manipulation' }}
                className="inline-flex h-14 items-center rounded-[var(--radius-button)] bg-gold-gradient px-6 font-semibold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] transition-transform duration-[var(--dur-fast)] ease-[var(--ease-quart)] active:scale-[0.98] select-none"
              >
                오늘의 훈련 시작 →
              </Link>
              <Link
                href="/assist"
                style={{ touchAction: 'manipulation' }}
                className="inline-flex h-14 items-center rounded-[var(--radius-button)] border-hair px-6 font-semibold text-ivory backdrop-blur-sm transition-colors active:scale-[0.98] select-none"
              >
                실전 모드 열기
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-8 -right-6 hidden gap-3 opacity-90 sm:flex">
            <CardView rank="A" suit="s" deckScheme="four-color" size="lg" />
            <CardView rank="K" suit="h" deckScheme="four-color" size="lg" />
            <CardView face="down" size="lg" />
          </div>
        </section>

        <section aria-labelledby="modes-h" className="mt-14">
          <h2 id="modes-h" className="font-display text-[28px] font-bold tracking-[-0.015em]">
            세 가지 모드
          </h2>
          <p className="mt-2 text-fg-muted">가볍게 시작해서 실력으로 끝냅니다.</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {MODES.map((m, i) => (
              <li
                key={m.href}
                className="surface relative overflow-hidden rounded-[var(--radius-panel)] border-hair p-6 transition-colors hover:bg-[color:var(--color-surface-raised)]"
              >
                <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
                  {String(i + 1).padStart(2, '0')} · {m.en}
                </span>
                <h3 className="mt-3 text-subheading font-semibold">{m.title}</h3>
                <p className="mt-2 text-body text-fg-muted">{m.desc}</p>
                <Link
                  href={m.href}
                  className="mt-6 inline-flex items-center gap-1 text-[13px] font-medium text-[color:var(--color-accent)]"
                >
                  열기 <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="numbers-h"
          className="mt-14 rounded-[var(--radius-panel)] border-hair surface p-6 sm:p-10"
        >
          <h2 id="numbers-h" className="sr-only">
            숫자로 보는 gto.today
          </h2>
          <dl className="grid grid-cols-3 gap-6 sm:gap-10">
            <Stat label="Preflop combos" value="22,100" />
            <Stat label="Hand buckets" value="169" />
            <Stat label="Spots per day" value="∞" />
          </dl>
        </section>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-hair pt-6 text-[13px] text-fg-muted">
          <div className="flex items-center gap-2">
            <Logo variant="short" className="text-[16px]" />
            <span>· 매일 한 걸음.</span>
          </div>
          <div className="flex gap-5">
            <Link href="/about">About</Link>
            <Link href="/dev/showcase">Showcase</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </footer>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="font-mono text-mono-lg font-semibold text-fg">{value}</dd>
      <dt className="mt-1 font-mono text-[12px] uppercase tracking-[0.16em] text-fg-muted">
        {label}
      </dt>
    </div>
  );
}
