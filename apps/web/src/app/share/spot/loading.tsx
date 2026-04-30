import Image from 'next/image';
import { HandCardSkeleton } from '@/components/skeleton';

export default function Loading() {
  return (
    <main
      aria-busy
      aria-label="공유된 스팟 불러오는 중"
      className="safe-pad-x mx-auto flex min-h-dvh max-w-lg flex-col pb-12 pt-8"
    >
      <div className="flex items-center gap-2.5">
        <Image
          src="/logos/mark-g3-transparent.png"
          alt=""
          width={32}
          height={32}
          style={{ width: 32, height: 32, objectFit: 'contain' }}
        />
        <span className="font-mono text-[14px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-gold)]">
          GTO · today
        </span>
      </div>
      <div className="mt-8">
        <HandCardSkeleton />
      </div>
    </main>
  );
}
