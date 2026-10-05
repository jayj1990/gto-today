import { MTT_GROUP_IDS } from '@gto/gto-data';
import { SiteHeader } from '@/components/site-header';
import { ChartLibraryBrowser } from '@/components/chart-library-browser';

/**
 * 토너먼트 프리플랍 차트 — 스택 뎁스 × 포지션 전부.
 *
 * 100/40/25bb 오픈, SB 플레이, 오픈에 대한 대응, BB 디펜스, 림프, 리잼은
 * RYE 차트(/data/rye). 20/10bb 는 RYE 가 다루지 않는 구간이라 Nash
 * 올인·폴드 차트(/data/preflop)를 그대로 둔다.
 */
export default function MttPreflopPage() {
  return (
    <>
      <SiteHeader />
      <main className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
        <header className="mb-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
            MTT · 9맥스
          </p>
          <h1 className="font-display mt-1 text-[24px] font-bold leading-[1.1] tracking-[-0.02em]">
            프리플랍 차트
          </h1>
          <p className="text-fg-muted mt-2 text-[13px] leading-[1.55]">
            스택 뎁스별 오픈·디펜스·리잼. 3벳을 맞았을 때 뭘 할지까지 한 칸에 적혀 있고{' '}
            <span className="text-fg">20bb 이하는 올인 or 폴드</span> Nash 차트예요.
          </p>
        </header>

        <ChartLibraryBrowser groups={MTT_GROUP_IDS} />
      </main>
    </>
  );
}
