import Link from 'next/link';

/**
 * Sticky top header with a clickable wordmark that routes to home.
 * Theme toggle removed — the app is pinned to the Tonight palette.
 */
export function SiteHeader() {
  return (
    <header className="safe-top sticky top-0 z-20 border-b border-hair backdrop-blur-md bg-[color:var(--color-bg)]/70">
      <div className="mx-auto flex h-14 max-w-5xl items-center safe-pad-x">
        <Link
          href="/"
          aria-label="gto.today 홈"
          className="flex items-center gap-1 active:scale-[0.97]"
          style={{ touchAction: 'manipulation' }}
        >
          <span
            className="font-display font-bold uppercase text-fg"
            style={{ fontSize: 18, letterSpacing: '-0.02em', lineHeight: 1 }}
          >
            GTO
          </span>
          <span
            aria-hidden
            className="rounded-full bg-[color:var(--color-gold)]"
            style={{ width: 4, height: 4, transform: 'translateY(-5px)' }}
          />
          <span
            className="font-display font-light text-fg/85"
            style={{ fontSize: 18, letterSpacing: '-0.01em', lineHeight: 1 }}
          >
            today
          </span>
        </Link>
      </div>
    </header>
  );
}
