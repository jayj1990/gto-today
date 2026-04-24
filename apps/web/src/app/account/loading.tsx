import { Skeleton } from '@/components/skeleton';

export default function Loading() {
  return (
    <main
      aria-busy
      aria-label="계정 정보 불러오는 중"
      className="safe-pad-x relative mx-auto max-w-lg"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 48px)',
      }}
    >
      <header className="flex items-center justify-between">
        <Skeleton width={40} height={14} />
        <Skeleton width={100} height={12} />
      </header>

      <section className="mt-10">
        <Skeleton width={60} height={12} />
        <Skeleton className="mt-3" width="55%" height={32} />
        <Skeleton className="mt-3" width="90%" height={14} />
      </section>

      <section className="border-hair mt-8 flex items-center gap-4 rounded-[var(--radius-panel)] p-5">
        <Skeleton width={56} height={56} rounded="full" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={16} />
          <Skeleton width="80%" height={12} />
        </div>
      </section>
    </main>
  );
}
