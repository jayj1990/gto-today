import { SiteHeader } from '@/components/site-header';
import { Skeleton } from '@/components/skeleton';

/** Preflop chart explorer placeholder — title + 13×13 grid + action
 *  buttons. ChartNavigator already shows its own internal loading
 *  state, but this top-level skeleton covers the SiteHeader-to-grid
 *  cold paint before the client component mounts. */
export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main
        aria-busy
        aria-label="차트 불러오는 중"
        className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3"
      >
        <Skeleton width="60%" height={22} />

        <div className="mt-4 space-y-2">
          <Skeleton width={120} height={14} />
          <div
            className="grid aspect-square gap-[2px]"
            style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}
          >
            {Array.from({ length: 169 }).map((_, i) => (
              <Skeleton key={i} width="100%" height="100%" rounded="sm" />
            ))}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Skeleton height={36} rounded="md" />
          <Skeleton height={36} rounded="md" />
          <Skeleton height={36} rounded="md" />
        </div>
      </main>
    </>
  );
}
