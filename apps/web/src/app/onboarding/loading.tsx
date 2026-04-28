import { Skeleton } from '@/components/skeleton';

/** Onboarding 3-slide flow placeholder. Mirrors the slide layout —
 *  header (back/skip + logo), centered illustration, copy block,
 *  pagination dots, primary CTA. */
export default function Loading() {
  return (
    <main
      aria-busy
      aria-label="불러오는 중"
      className="safe-pad-x relative mx-auto flex min-h-dvh max-w-lg flex-col"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 20px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
      }}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton width={32} height={32} rounded="full" />
          <Skeleton width={88} height={16} />
        </div>
        <Skeleton width={64} height={14} />
      </header>

      {/* Slide illustration */}
      <div className="flex flex-1 items-center justify-center py-6">
        <Skeleton width="min(72vw, 320px)" height={320} rounded="lg" />
      </div>

      {/* Copy block — eyebrow + title + body */}
      <div className="text-center">
        <Skeleton className="mx-auto" width={64} height={11} />
        <Skeleton className="mx-auto mt-3" width="60%" height={32} />
        <Skeleton className="mx-auto mt-4" width="80%" height={16} />
      </div>

      {/* Pagination dots */}
      <div className="mt-6 flex justify-center gap-1.5">
        <Skeleton width={24} height={6} rounded="full" />
        <Skeleton width={6} height={6} rounded="full" />
        <Skeleton width={6} height={6} rounded="full" />
      </div>

      {/* CTA */}
      <Skeleton className="mt-6" height={56} rounded="md" />
    </main>
  );
}
