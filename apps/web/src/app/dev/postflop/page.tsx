import {
  listPostflopSpots,
  POSTFLOP_ACTION_COLOR,
  POSTFLOP_ACTION_LABEL,
  type PostflopAction,
  type PostflopSpot,
} from '@gto/gto-data';
import { CardView } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';

export const metadata = { title: '포스트플랍 시드' };

const STREET_LABEL = { flop: '플랍', turn: '턴', river: '리버' } as const;
const POT_LABEL = { srp: 'SRP', '3bp': '3-bet 팟', '4bp': '4-bet 팟', limped: '림프', mtt: 'MTT' } as const;

export default function PostflopDevPage() {
  const spots = listPostflopSpots();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl safe-pad-x pb-24 pt-10">
        <header className="mb-8">
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
            /dev/postflop
          </p>
          <h1 className="mt-2 font-display text-[36px] font-bold tracking-[-0.02em]">
            포스트플랍 시드
          </h1>
          <p className="mt-2 text-fg-muted">
            Phase 5a — 5개의 손으로 심은 포스트플랍 스팟. 데이터 포맷 + 그레이딩 동작 확인용. 추후 실 데이터로 교체 예정.
          </p>
        </header>

        <ul className="space-y-8">
          {spots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </ul>
      </main>
    </>
  );
}

function SpotCard({ spot }: { spot: PostflopSpot }) {
  const [h1, h2] = spot.hero;
  const totalMix = Object.values(spot.mix).reduce((acc, v) => acc + (v ?? 0), 0);

  return (
    <li className="rounded-[var(--radius-panel)] border-hair surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-[20px] font-bold tracking-[-0.015em]">
          {STREET_LABEL[spot.street]} · {POT_LABEL[spot.context.potType]}
        </h2>
        <p className="font-mono text-[11px] text-fg-muted">{spot.id}</p>
      </div>

      <p className="mt-2 text-[13px] text-fg-muted">
        {spot.context.preflopSummary} · SPR {spot.context.spr.toFixed(1)} · 팟{' '}
        {spot.context.potBB}BB
      </p>

      {/* Board */}
      <div className="mt-5 flex items-center gap-4">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
            보드
          </p>
          <div className="flex gap-1.5">
            {spot.board.map((code, i) => {
              const rank = code.charAt(0);
              const suit = code.charAt(1) as 's' | 'h' | 'd' | 'c';
              return (
                <CardView key={i} rank={rank} suit={suit} size="sm" deckScheme="four-color" />
              );
            })}
          </div>
        </div>
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
            히어로 ({spot.context.heroPos})
          </p>
          <div className="flex gap-1.5">
            {[h1, h2].map((code, i) => {
              const rank = code.charAt(0);
              const suit = code.charAt(1) as 's' | 'h' | 'd' | 'c';
              return (
                <CardView key={i} rank={rank} suit={suit} size="sm" deckScheme="four-color" />
              );
            })}
          </div>
        </div>
      </div>

      {/* Facing action */}
      <p className="mt-4 rounded-[var(--radius-button)] border-hair surface px-3 py-2 text-[12px] text-fg-muted">
        {spot.facingBetBB > 0
          ? `빌런 벳 ${spot.facingBetBB.toFixed(1)}BB 에 대한 ${spot.context.heroPos} 액션`
          : `체크가 돌아와 ${spot.context.heroPos} 차례`}
      </p>

      {/* GTO mix bars */}
      <div className="mt-5 space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
          GTO 믹스 (합계 {Math.round(totalMix * 100)}%)
        </p>
        {(Object.entries(spot.mix) as [PostflopAction, number][])
          .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
          .map(([action, freq]) => (
            <MixRow key={action} action={action} freq={freq ?? 0} />
          ))}
      </div>

      {/* Teaching note */}
      <div className="mt-5 rounded-[var(--radius-button)] border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/8 px-4 py-3 text-[12px] leading-[1.55] text-fg">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
          왜 그런지
        </p>
        {spot.teachingNote}
      </div>
    </li>
  );
}

function MixRow({ action, freq }: { action: PostflopAction; freq: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 font-mono text-[12px] text-fg-muted">
        {POSTFLOP_ACTION_LABEL[action]}
      </span>
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[color:var(--color-border)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${freq * 100}%`, background: POSTFLOP_ACTION_COLOR[action] }}
        />
      </div>
      <span className="w-12 text-right font-mono text-[12px] font-semibold tabular-nums">
        {(freq * 100).toFixed(1)}%
      </span>
    </div>
  );
}
