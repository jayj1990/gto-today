import { SiteHeader } from '@/components/site-header';
import { Skeleton } from '@/components/skeleton';

/** Intro page for /today — header copy + streak calendar + CTA. */
export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main
        aria-busy
        aria-label="오늘의 훈련 불러오는 중"
        className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col pb-[calc(env(safe-area-inset-bottom)+32px)] pt-8"
      >
        <Skeleton width={120} height={12} />
        <Skeleton className="mt-2" width="55%" height={36} />
        <Skeleton className="mt-3" width="85%" height={14} />

        <div className="mt-8 grid grid-cols-2 gap-3">
          <Skeleton height={72} rounded="md" />
          <Skeleton height={72} rounded="md" />
        </div>

        {/* 7-day streak grid placeholder */}
        <div className="mt-6 grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} height={34} rounded="sm" />
          ))}
        </div>

        <Skeleton className="mt-10" height={56} rounded="md" />
      </main>
    </>
  );
}
