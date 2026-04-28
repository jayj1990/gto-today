import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * /admin — Jay-only operations dashboard.
 *
 * Access gate: session must be authenticated AND the email must match
 * ADMIN_EMAIL env. Anyone else gets a 404 (not a 401) so the route is
 * indistinguishable from unknown from the outside — no "admin surface
 * exists but you can't enter".
 *
 * This is intentionally a thin read-only surface. Nothing here
 * mutates state. Jay's Vercel Analytics dashboard is still the
 * source of truth for funnel / engagement; this page covers what
 * lives only in our Neon DB (users, sessions, provider mix).
 */
export default async function AdminPage() {
  const adminEmail = process.env['ADMIN_EMAIL'];
  if (!adminEmail) notFound();
  const session = await auth();
  if (!session?.user?.email || session.user.email !== adminEmail) notFound();

  // Window for the 7-day trend chart. Anchored to the current
  // server time so the latest bucket is always "today".
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const weekStart = new Date(now.getTime() - 7 * dayMs);
  weekStart.setHours(0, 0, 0, 0);

  const [userCount, sessionCount, recentUsers, providerRows, recentVerifs, weekUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.session.count({ where: { expires: { gt: now } } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, name: true, email: true, createdAt: true, image: true },
      }),
      prisma.account.groupBy({
        by: ['provider'],
        _count: { provider: true },
      }),
      prisma.verificationToken.count({ where: { expires: { gt: now } } }),
      prisma.user.findMany({
        where: { createdAt: { gte: weekStart } },
        select: { createdAt: true },
      }),
    ]);

  const byProvider = Object.fromEntries(providerRows.map((r) => [r.provider, r._count.provider]));

  // Bucket the last-7-days signups into per-day counts. KST-friendly:
  // bucket 0 = 6 days ago, bucket 6 = today.
  const dailySignups = Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(weekStart.getTime() + i * dayMs);
    const dayEnd = new Date(dayStart.getTime() + dayMs);
    const count = weekUsers.filter((u) => u.createdAt >= dayStart && u.createdAt < dayEnd).length;
    return { day: dayStart, count };
  });
  const dailyMax = Math.max(1, ...dailySignups.map((d) => d.count));

  return (
    <main
      className="safe-pad-x relative mx-auto max-w-2xl pb-16 pt-8"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}
    >
      <header className="mb-6 flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--color-accent)]">
            Admin
          </p>
          <h1 className="font-display mt-2 text-[28px] font-bold tracking-[-0.02em]">
            운영 대시보드
          </h1>
          <p className="text-fg-muted mt-1 font-mono text-[10px] tabular-nums">
            as of {now.toISOString().replace('T', ' ').slice(0, 19)} UTC
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Link
            href="/admin"
            prefetch={false}
            className="text-fg-muted hover:text-fg font-mono text-[11px] uppercase tracking-[0.2em]"
          >
            ↻ 새로고침
          </Link>
          <Link href="/" className="text-fg-muted font-mono text-[11px] uppercase tracking-[0.2em]">
            ← 홈
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="총 가입자" value={userCount} />
        <Kpi label="활성 세션" value={sessionCount} />
        <Kpi label="대기 매직링크" value={recentVerifs} />
        <Kpi label="OAuth 계정" value={providerRows.reduce((a, r) => a + r._count.provider, 0)} />
      </section>

      <section className="mt-8">
        <SectionHeader
          title="최근 7일 가입 트렌드"
          right={`${weekUsers.length}명 · 일 평균 ${(weekUsers.length / 7).toFixed(1)}`}
        />
        <div className="border-hair surface mt-3 rounded-[var(--radius-panel)] p-4">
          <div className="flex items-end justify-between gap-1.5" style={{ height: 96 }}>
            {dailySignups.map(({ day, count }, i) => {
              const ratio = count / dailyMax;
              const isToday = i === dailySignups.length - 1;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-full w-full items-end">
                    <div
                      className="w-full rounded-sm transition-all"
                      style={{
                        height: count > 0 ? `${Math.max(4, ratio * 100)}%` : '2px',
                        background: isToday
                          ? 'var(--color-accent)'
                          : 'color-mix(in oklab, var(--color-accent) 35%, transparent)',
                      }}
                      aria-label={`${day.toISOString().slice(0, 10)}: ${count}명`}
                    />
                  </div>
                  <span className="text-fg-muted font-mono text-[9px] tabular-nums">
                    {day.toISOString().slice(5, 10).replace('-', '/')}
                  </span>
                  <span className="font-mono text-[10px] font-semibold tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader title="로그인 방법별 분포" />
        <ul className="border-hair mt-3 overflow-hidden rounded-[var(--radius-panel)]">
          {Object.entries(byProvider).length === 0 ? (
            <li className="text-fg-muted px-4 py-3 text-[13px]">아직 OAuth 로그인이 없어요.</li>
          ) : (
            Object.entries(byProvider).map(([provider, count], i, arr) => (
              <li
                key={provider}
                className={
                  i < arr.length - 1
                    ? 'flex justify-between border-b border-[color:var(--color-border)] px-4 py-3'
                    : 'flex justify-between px-4 py-3'
                }
              >
                <span className="font-mono text-[13px] capitalize">{provider}</span>
                <span className="font-mono text-[13px] tabular-nums">{count}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-8">
        <SectionHeader title="최근 가입자 10명" />
        <ul className="border-hair mt-3 overflow-hidden rounded-[var(--radius-panel)]">
          {recentUsers.length === 0 ? (
            <li className="text-fg-muted px-4 py-3 text-[13px]">아직 가입자가 없어요.</li>
          ) : (
            recentUsers.map((u, i) => (
              <li
                key={u.id}
                className={
                  i < recentUsers.length - 1
                    ? 'border-b border-[color:var(--color-border)] px-4 py-3'
                    : 'px-4 py-3'
                }
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display truncate text-[14px] font-semibold">
                      {u.name ?? '(이름 없음)'}
                    </p>
                    <p className="text-fg-muted truncate font-mono text-[11px]">{u.email}</p>
                  </div>
                  <time
                    className="text-fg-muted font-mono text-[10px] tabular-nums"
                    dateTime={u.createdAt.toISOString()}
                  >
                    {formatRelative(u.createdAt)}
                  </time>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-hair rounded-[var(--radius-button)] p-4">
      <p className="text-fg-muted font-mono text-[10px] uppercase tracking-[0.2em]">{label}</p>
      <p className="font-display mt-1 text-[24px] font-bold tabular-nums">{value}</p>
    </div>
  );
}

function SectionHeader({ title, right }: { title: string; right?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-fg-muted font-mono text-[11px] uppercase tracking-[0.22em]">{title}</h2>
      {right && (
        <span className="text-fg-muted/70 font-mono text-[10px] tabular-nums">{right}</span>
      )}
    </div>
  );
}

function formatRelative(d: Date): string {
  const delta = Date.now() - d.getTime();
  const min = Math.round(delta / 60_000);
  if (min < 1) return '방금';
  if (min < 60) return `${min}분 전`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}일 전`;
  return d.toISOString().slice(0, 10);
}
