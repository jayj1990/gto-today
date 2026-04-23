import { SiteHeader } from '@/components/site-header';
import { Skeleton } from '@/components/skeleton';

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main
        aria-busy
        aria-label="푸시/폴드 차트 불러오는 중"
        className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4"
      >
        <Skeleton width={96} height={12} />
        <Skeleton className="mt-2" width="55%" height={28} />
        <Skeleton className="mt-2" width="90%" height={14} />

        {/* Chart/Train mode toggle */}
        <div className="mt-4 inline-flex gap-1">
          <Skeleton width={72} height={40} rounded="md" />
          <Skeleton width={72} height={40} rounded="md" />
        </div>

        {/* Position tabs */}
        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width={64} height={44} rounded="md" />
          ))}
        </div>

        {/* Range grid 13x13 */}
        <div
          className="mt-3 grid aspect-square gap-[2px]"
          style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}
        >
          {Array.from({ length: 169 }).map((_, i) => (
            <Skeleton key={i} width="100%" height="100%" rounded="sm" />
          ))}
        </div>
      </main>
    </>
  );
}
