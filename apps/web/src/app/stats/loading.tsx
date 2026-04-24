import { SiteHeader } from '@/components/site-header';
import { Skeleton } from '@/components/skeleton';

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main
        aria-busy
        aria-label="통계 불러오는 중"
        className="safe-pad-x mx-auto max-w-lg pb-8 pt-4"
      >
        <Skeleton width={80} height={12} />
        <Skeleton className="mt-2" width="55%" height={28} />

        {/* 3-up stat row */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={80} rounded="md" />
          ))}
        </div>

        {/* chart / bars */}
        <Skeleton className="mt-6" height={180} rounded="lg" />

        {/* list rows */}
        <div className="mt-6 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={52} rounded="md" />
          ))}
        </div>
      </main>
    </>
  );
}
