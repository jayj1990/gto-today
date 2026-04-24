import { SiteHeader } from '@/components/site-header';
import { Skeleton } from '@/components/skeleton';

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main
        aria-busy
        aria-label="실전 설정 불러오는 중"
        className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col pb-[calc(env(safe-area-inset-bottom)+32px)] pt-8"
      >
        <Skeleton width={60} height={12} />
        <Skeleton className="mt-4" width={140} height={12} />
        <Skeleton className="mt-2" width="55%" height={32} />
        <Skeleton className="mt-3" width="90%" height={14} />

        {/* Game-type picker (2 columns) */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Skeleton height={88} rounded="lg" />
          <Skeleton height={88} rounded="lg" />
        </div>

        {/* Info rows */}
        <div className="mt-6 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={56} rounded="md" />
          ))}
        </div>

        <Skeleton className="mt-10" height={56} rounded="md" />
      </main>
    </>
  );
}
