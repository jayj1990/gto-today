import Link from 'next/link';
import { Logo } from '@gto/ui';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
      <Logo variant="dot" className="text-[48px]" />
      <h1 className="mt-6 font-display text-[40px] font-bold tracking-[-0.02em]">
        길을 잃으셨네요.
      </h1>
      <p className="mt-3 text-fg-muted">찾으시는 페이지는 없어요. 홈으로 돌아가시죠.</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center rounded-[var(--radius-button)] bg-gold-gradient px-5 font-semibold text-noir"
      >
        홈으로
      </Link>
    </main>
  );
}
