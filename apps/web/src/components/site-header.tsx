import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@gto/ui';

/**
 * Sticky top header — G3 chip icon (left) + "GTO · today" SVG wordmark,
 * both wrapped in a single link back to home. Theme pinned to Tonight.
 */
export function SiteHeader() {
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
      </div>
    </header>
  );
}
