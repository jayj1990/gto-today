import { SiteHeader } from '@/components/site-header';
import { HandCardSkeleton } from '@/components/skeleton';

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main
        aria-busy
        aria-label="플랍 훈련 불러오는 중"
        className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col pb-[calc(env(safe-area-inset-bottom)+16px)] pt-6"
      >
        <HandCardSkeleton />
      </main>
    </>
  );
}
