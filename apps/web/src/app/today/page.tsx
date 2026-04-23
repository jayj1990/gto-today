import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { formatTodayKR } from '@/lib/date';
import { StreakCalendar } from '@/components/streak-calendar';

export const revalidate = 3600;

export const metadata = {
  title: '오늘의 훈련',
  description: '매일 새로 공개되는 10핸드 GTO 퀴즈. RFI · BB 디펜스부터 3벳 스팟까지.',
  openGraph: {
    title: '오늘의 훈련 · gto.today',
    description: '매일 새로 공개되는 10핸드. 하루 5분.',
  },
};

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
      <main className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col pb-[calc(env(safe-area-inset-bottom)+32px)] pt-8">
        <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--color-accent)]">
          오늘 · {formatTodayKR()}
        </p>
        <h1 className="font-display mt-3 text-[36px] font-bold leading-[1.1] tracking-[-0.02em]">
          오늘의 훈련
        </h1>
        <p className="text-body text-fg-muted mt-3">
          매일 새로 생성되는 10핸드. 세계 모든 gto.today 사용자가 오늘 같은 핸드를 풉니다.
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-3">
          <Summary label="포맷" value="6맥스 100BB" />
          <Summary label="게임" value="캐시 · MTT" />
        </dl>

        <StreakCalendar className="mt-6" />

        <div className="border-hair surface mt-8 rounded-[var(--radius-panel)] p-5">
          <h2 className="font-display text-[18px] font-semibold">오늘 연습할 것</h2>
          <ul className="text-fg-muted mt-3 space-y-2 text-[14px]">
            <li>• 각 포지션의 오픈 레이즈 결정 (RFI) — UTG · MP · CO · BTN · SB</li>
            <li>• BB 디펜스 — 모든 오프너에 대한 콜 / 3벳 / 폴드</li>
            <li>• 플랍 의사결정 — 체크 / 벳 / 콜 / 폴드, 보드 텍스처별</li>
            <li>• 50/50 믹스부터 20/80 엣지 스팟까지 골고루</li>
          </ul>
        </div>

        <Link
          href="/today/play"
          style={{ touchAction: 'manipulation' }}
          className="bg-gold-gradient text-noir mt-10 inline-flex h-14 items-center justify-center rounded-[var(--radius-button)] font-semibold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
        >
          훈련 시작 →
        </Link>

        <Link
          href="/sim"
          className="text-fg-muted mt-3 text-center text-[13px] underline-offset-4 hover:underline"
        >
          자유 시뮬레이션으로 이동
        </Link>
      </main>
    </>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-hair surface rounded-[var(--radius-button)] p-3 text-center">
      <dt className="text-fg-muted font-mono text-[10px] uppercase tracking-[0.18em]">{label}</dt>
      <dd className="text-fg mt-1 font-mono text-[14px] font-semibold">{value}</dd>
    </div>
  );
}
