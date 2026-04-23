import { SiteHeader } from '@/components/site-header';
import { HandCardSkeleton, Skeleton } from '@/components/skeleton';

/**
 * Route-level Suspense fallback for /today/play. Mirrors the real layout
 * (header + eyebrow + progress dots + training card + action row) so the
 * hydration handoff doesn't reflow.
 */
export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main
        aria-busy
        aria-label="오늘의 훈련 불러오는 중"
        className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col pb-[calc(env(safe-area-inset-bottom)+16px)] pt-6"
      >
        <header className="mb-2 flex items-center justify-between">
          <Skeleton width={80} height={12} />
          <Skeleton width={48} height={12} />
        </header>
        <div className="flex gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={4} rounded="full" />
          ))}
        </div>
        <HandCardSkeleton />
      </main>
    </>
  );
}
