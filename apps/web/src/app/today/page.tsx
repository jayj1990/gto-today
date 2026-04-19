import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { formatTodayKR } from '@/lib/date';

export const revalidate = 3600;

/**
 * /today entry — intro + "시작" button.
 *
 * The active play loop lives at /today/play. The intro screen gives the
 * user a moment to breathe before committing to 10 hands and shows the
 * format / scenario summary up-front instead of surprising them.
 */
export default function TodayIntroPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+32px)] pt-8">
        <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--color-accent)]">
          오늘 · {formatTodayKR()}
        </p>
        <h1 className="mt-3 font-display text-[36px] font-bold leading-[1.1] tracking-[-0.02em]">
          오늘의 훈련
        </h1>
        <p className="mt-3 text-body text-fg-muted">
          매일 새로 생성되는 10핸드. 세계 모든 gto.today 사용자가 오늘 같은 핸드를 풉니다.
        </p>

        <dl className="mt-8 grid grid-cols-3 gap-3">
          <Summary label="포맷" value="6맥스" />
          <Summary label="스택" value="100BB" />
          <Summary label="시나리오" value="RFI · BB 디펜스" />
        </dl>

        <div className="mt-8 rounded-[var(--radius-panel)] border-hair surface p-5">
          <h2 className="font-display text-[18px] font-semibold">오늘 연습할 것</h2>
          <ul className="mt-3 space-y-2 text-[14px] text-fg-muted">
            <li>• 각 포지션의 오픈 레이즈 결정 (RFI)</li>
            <li>• BB 포지션의 디펜스 — 콜 / 3벳 / 폴드</li>
            <li>• 50/50 믹스부터 20/80 엣지 스팟까지 골고루</li>
          </ul>
        </div>

        <Link
          href="/today/play"
          style={{ touchAction: 'manipulation' }}
          className="mt-10 inline-flex h-14 items-center justify-center rounded-[var(--radius-button)] bg-gold-gradient font-semibold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
        >
          훈련 시작 →
        </Link>

        <Link
          href="/sim"
          className="mt-3 text-center text-[13px] text-fg-muted underline-offset-4 hover:underline"
        >
          자유 시뮬레이션으로 이동
        </Link>
      </main>
    </>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-button)] border-hair surface p-3 text-center">
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">{label}</dt>
      <dd className="mt-1 font-mono text-[14px] font-semibold text-fg">{value}</dd>
    </div>
  );
}
