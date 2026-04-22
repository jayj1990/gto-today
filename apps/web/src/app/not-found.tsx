import Link from 'next/link';
import { Logo } from '@gto/ui';

export const metadata = {
  title: '404 · gto.today',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="absolute inset-x-0 top-0 flex justify-center pt-10">
        <Logo variant="full" width={110} wordColor="var(--color-fg-muted)" />
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-accent)]">
        404
      </p>
      <h1 className="mt-3 font-display text-[38px] font-bold leading-[1.1] tracking-[-0.02em]">
        없는 스팟이에요.
      </h1>
      <p className="mt-3 text-[14px] leading-[1.55] text-fg-muted">
        주소가 바뀌었거나 아직 준비되지 않은 페이지일 수 있어요.
      </p>

      <div className="mt-8 grid w-full max-w-xs grid-cols-2 gap-2">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-button)] bg-gold-gradient font-semibold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
        >
          홈으로
        </Link>
        <Link
          href="/today"
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-button)] border-hair surface text-[14px] font-semibold active:scale-[0.98]"
        >
          오늘의 훈련 →
        </Link>
      </div>

      <nav className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[11px] text-fg-muted">
        <Link href="/charts" className="underline-offset-4 hover:underline">
          프리플랍 차트
        </Link>
        <Link href="/charts/postflop" className="underline-offset-4 hover:underline">
          포스트플랍 차트
        </Link>
        <Link href="/live" className="underline-offset-4 hover:underline">
          실전 모드
        </Link>
      </nav>
    </main>
  );
}
