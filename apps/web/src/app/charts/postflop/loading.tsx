import { SiteHeader } from '@/components/site-header';
import { Skeleton } from '@/components/skeleton';

/**
 * Postflop chart is data-heavy (manifest + per-group spot JSON). This
 * fallback stands in for the board-texture picker + 2xN board grid so the
 * first paint isn't blank.
 */
export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main
        aria-busy
        aria-label="플랍 차트 불러오는 중"
        className="mx-auto max-w-lg safe-pad-x pb-8 pt-4"
      >
        <Skeleton width={140} height={12} />
        <Skeleton className="mt-2" width="70%" height={28} />
        <Skeleton className="mt-2" width="90%" height={14} />

        <div className="mt-4 flex flex-wrap gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} width={72} height={44} rounded="md" />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} height={92} rounded="md" />
          ))}
        </div>
      </main>
    </>
  );
}
