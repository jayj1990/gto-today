import Link from 'next/link';
import { Logo } from '@gto/ui';
import { ThemeToggle } from './theme-toggle';

export function SiteHeader() {
  return (
    <header className="safe-top sticky top-0 z-20 border-b border-hair backdrop-blur-md bg-[color:var(--color-bg)]/70">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between safe-pad-x">
        <Link href="/" aria-label="gto.today home" className="flex items-center">
          <Logo variant="full" className="text-[20px]" />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/signin"
            className="hidden rounded-full border-hair px-3 py-1.5 text-[13px] text-fg-muted hover:text-fg sm:inline-flex"
          >
            로그인
          </Link>
        </div>
      </div>
    </header>
  );
}
