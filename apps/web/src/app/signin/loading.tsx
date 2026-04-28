import { Skeleton } from '@/components/skeleton';

/** Sign-in placeholder — title block + 4 social-auth buttons + email
 *  input. Roughly matches the SigninPage form layout. */
export default function Loading() {
  return (
    <main
      aria-busy
      aria-label="로그인 화면 불러오는 중"
      className="safe-pad-x mx-auto flex min-h-dvh max-w-md flex-col justify-center"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 32px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 32px)',
      }}
    >
      <Skeleton width={120} height={12} />
      <Skeleton className="mt-3" width="70%" height={36} />
      <Skeleton className="mt-3" width="90%" height={14} />

      <div className="mt-10 space-y-3">
        <Skeleton height={52} rounded="md" />
        <Skeleton height={52} rounded="md" />
        <Skeleton height={52} rounded="md" />
        <Skeleton height={52} rounded="md" />
      </div>

      <div className="mt-8 flex items-center gap-3">
        <Skeleton height={1} />
        <Skeleton width={32} height={11} />
        <Skeleton height={1} />
      </div>

      <Skeleton className="mt-6" height={48} rounded="md" />
    </main>
  );
}
