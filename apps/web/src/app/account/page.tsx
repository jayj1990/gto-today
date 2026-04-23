'use client';

import Link from 'next/link';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { useAuthStore } from '@/lib/auth-store';
import { Skeleton } from '@/components/skeleton';

/**
 * 마이페이지 — 로그인 계정이 제공한 정보(이메일·이름)를 한 곳에서 보여
 * 준다. 소셜 로그인 심사(네이버·카카오)에서 요구하는 "제공 정보 활용처"
 * 이미지가 바로 이 페이지의 스크린샷.
 */
export default function AccountPage() {
  const { data: session, status } = useSession();
  const storeUser = useAuthStore((s) => s.user);
  const signOutStore = useAuthStore((s) => s.signOut);

  const displayName =
    session?.user?.name ?? storeUser?.name ?? '이름 없음';
  const displayEmail =
    session?.user?.email ?? storeUser?.email ?? '';
  const avatarUrl = session?.user?.image ?? null;

  const loading = status === 'loading';
  const authed = status === 'authenticated';

  const handleLogout = () => {
    if (!window.confirm('로그아웃 하시겠어요?')) return;
    signOutStore();
    void nextAuthSignOut({ callbackUrl: '/signin' });
  };

  return (
    <main
      className="relative mx-auto max-w-lg safe-pad-x"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 48px)',
      }}
    >
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-[12px] uppercase tracking-[0.2em] text-fg-muted"
          aria-label="홈으로"
        >
          ← 홈
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-fg-muted/70">
          My Account
        </p>
      </header>

      <section className="mt-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--color-accent)]">
          Profile
        </p>
        <h1 className="mt-3 font-display text-[32px] font-bold leading-[1.15] tracking-[-0.02em]">
          내 계정 정보
        </h1>
        <p className="mt-3 text-body text-fg-muted">
          소셜 로그인으로 전달받은 기본 정보입니다. 이 값들은 학습 기록을 기기 간 동기화하고,
          AI 해설 요청 한도를 관리하는 용도로만 쓰입니다.
        </p>
      </section>

      {loading ? (
        <section
          aria-busy
          aria-label="불러오는 중"
          className="mt-8 flex items-center gap-4 rounded-[var(--radius-panel)] border-hair p-5"
        >
          <Skeleton width={56} height={56} rounded="full" />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height={16} />
            <Skeleton width="80%" height={12} />
          </div>
        </section>
      ) : !authed ? (
        <div className="mt-10 rounded-[var(--radius-panel)] border-hair p-5 text-center">
          <p className="text-body text-fg-muted">로그인이 필요합니다.</p>
          <Link
            href="/signin"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] border-hair bg-[color:var(--color-accent)] px-5 font-semibold text-noir"
          >
            로그인 하러 가기
          </Link>
        </div>
      ) : (
        <>
          <section className="mt-8 flex items-center gap-4 rounded-[var(--radius-panel)] border-hair p-5">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                width={56}
                height={56}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  border: '1.5px solid color-mix(in oklab, var(--color-gold) 60%, transparent)',
                }}
              />
            ) : (
              <span
                aria-hidden
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--color-surface-raised)',
                  border: '1.5px solid var(--color-border)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  color: 'var(--color-fg-muted)',
                }}
              >
                {displayName[0] ?? '?'}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[18px] font-semibold tracking-[-0.01em]">
                {displayName}
              </p>
              <p className="truncate font-mono text-[12px] text-fg-muted">
                {displayEmail || '이메일 미제공'}
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
              제공받은 정보 · 활용처
            </h2>
            <dl className="mt-3 divide-y divide-[color:var(--color-hair)] overflow-hidden rounded-[var(--radius-panel)] border-hair">
              <InfoRow
                label="이름"
                value={displayName}
                usage="홈 화면 상단 인사말, 마이페이지 표시"
              />
              <InfoRow
                label="이메일"
                value={displayEmail || '-'}
                usage="회원 고유 식별, 학습 기록 동기화, 중요 공지 발송"
              />
              <InfoRow
                label="프로필 사진"
                value={avatarUrl ? '연동됨' : '미연동'}
                usage="홈 상단·마이페이지 아바타 표시 (선택 동의)"
              />
            </dl>
          </section>

          <section className="mt-8">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
              쓰지 않는 곳
            </h2>
            <ul className="mt-3 space-y-1.5 text-[13px] text-fg-muted">
              <li>— 마케팅·광고 전송에 사용하지 않습니다.</li>
              <li>— 외부 기관에 판매·제공하지 않습니다.</li>
              <li>— AI 해설 생성 시 이메일·이름을 모델에 전송하지 않습니다.</li>
            </ul>
          </section>

          <section className="mt-10 grid gap-2">
            <Link
              href="/privacy"
              className="flex h-12 w-full items-center justify-between rounded-[var(--radius-button)] border-hair px-4 text-[14px] font-medium"
            >
              <span>개인정보처리방침</span>
              <span className="font-mono text-[11px] text-fg-muted">→</span>
            </Link>
            <Link
              href="/terms"
              className="flex h-12 w-full items-center justify-between rounded-[var(--radius-button)] border-hair px-4 text-[14px] font-medium"
            >
              <span>이용약관</span>
              <span className="font-mono text-[11px] text-fg-muted">→</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-[var(--radius-button)] border-hair bg-bg-elevated text-[14px] font-medium text-fg-muted active:scale-[0.98]"
            >
              로그아웃
            </button>
          </section>
        </>
      )}
    </main>
  );
}

function InfoRow({
  label,
  value,
  usage,
}: {
  label: string;
  value: string;
  usage: string;
}) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-3 px-4 py-3">
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
        {label}
      </div>
      <div>
        <p className="truncate font-mono text-[13px]">{value}</p>
        <p className="mt-0.5 text-[12px] text-fg-muted">{usage}</p>
      </div>
    </div>
  );
}
