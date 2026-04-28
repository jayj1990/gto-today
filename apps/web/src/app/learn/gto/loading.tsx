import { SiteHeader } from '@/components/site-header';
import { Skeleton } from '@/components/skeleton';

/** Learn / GTO intro placeholder — hero + 6 sections of varying
 *  density. Long-scroll page so we render multiple section blocks. */
export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main
        aria-busy
        aria-label="GTO 입문 불러오는 중"
        className="safe-pad-x mx-auto max-w-lg pb-[calc(env(safe-area-inset-bottom)+48px)] pt-4"
      >
        {/* Hero */}
        <div className="mb-8 mt-2 text-center">
          <Skeleton className="mx-auto" width={64} height={11} />
          <Skeleton className="mx-auto mt-3" width="60%" height={36} />
          <Skeleton className="mx-auto mt-4" width="80%" height={14} />
        </div>

        {/* 6 section blocks */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border-hair surface mt-10 rounded-[var(--radius-panel)] px-5 py-6"
          >
            <Skeleton width={48} height={10} />
            <Skeleton className="mt-2" width="55%" height={22} />
            <Skeleton className="mt-2" width="90%" height={14} />
            <Skeleton className="mt-1" width="70%" height={14} />
            <Skeleton className="mt-5" height={120} rounded="md" />
          </div>
        ))}
      </main>
    </>
  );
}
