import { SiteHeader } from '@/components/site-header';
import { Skeleton } from '@/components/skeleton';

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main
        aria-busy
        aria-label="복습 모드 불러오는 중"
        className="mx-auto max-w-lg safe-pad-x pb-8 pt-4"
      >
        <Skeleton width={96} height={12} />
        <Skeleton className="mt-2" width="55%" height={28} />
        <Skeleton className="mt-2" width="90%" height={14} />

        <div className="mt-6 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={92} rounded="md" />
          ))}
        </div>
      </main>
    </>
  );
}
