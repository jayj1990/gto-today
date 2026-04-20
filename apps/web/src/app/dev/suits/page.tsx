import { CardView } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';

export const metadata = { title: '수트 프리뷰' };

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '5', '2'] as const;
const SUITS = [
  { key: 's', name: '스페이드' },
  { key: 'h', name: '하트' },
  { key: 'd', name: '다이아' },
  { key: 'c', name: '클로버' },
] as const;

export default function SuitsPreviewPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl safe-pad-x pb-24 pt-10">
        <header className="mb-8">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
            /dev/suits
          </p>
          <h1 className="mt-2 font-display text-[32px] font-bold tracking-[-0.02em]">
            카드 수트 프리뷰
          </h1>
          <p className="mt-2 text-fg-muted">
            4 suit × 5 size × 8 rank 로 실제 렌더링 결과 확인. 내부 동심 타원 패턴이
            모든 suit에 동일하게 적용되어 있는지 체크용.
          </p>
        </header>

        {/* Side-by-side comparison at lg size, all 4 suits */}
        <section className="mb-10">
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
            Large (96×134) · 테마 일관성 체크
          </h2>
          <div className="flex flex-wrap gap-4">
            {SUITS.map((s) => (
              <div key={s.key} className="flex flex-col items-center gap-2">
                <CardView rank="A" suit={s.key as 's' | 'h' | 'd' | 'c'} size="lg" />
                <span className="font-mono text-[11px] text-fg-muted">{s.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
            Extra Large (114×160) · 디테일 체크
          </h2>
          <div className="flex flex-wrap gap-4">
            {SUITS.map((s) => (
              <div key={s.key} className="flex flex-col items-center gap-2">
                <CardView rank="K" suit={s.key as 's' | 'h' | 'd' | 'c'} size="xl" />
                <span className="font-mono text-[11px] text-fg-muted">{s.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
            Medium (68×96) · 모바일 실전 사이즈
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {SUITS.map((s) =>
              RANKS.slice(0, 4).map((r) => (
                <div key={`${r}${s.key}`} className="flex flex-col items-center gap-1.5">
                  <CardView rank={r} suit={s.key as 's' | 'h' | 'd' | 'c'} size="md" />
                  <span className="font-mono text-[10px] text-fg-muted">
                    {r}
                    {s.key}
                  </span>
                </div>
              )),
            )}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
            Small (42×60) · 포커 테이블 사이즈
          </h2>
          <div className="flex flex-wrap gap-2">
            {SUITS.map((s) =>
              RANKS.map((r) => (
                <CardView
                  key={`${r}${s.key}-sm`}
                  rank={r}
                  suit={s.key as 's' | 'h' | 'd' | 'c'}
                  size="sm"
                />
              )),
            )}
          </div>
        </section>

        <section className="rounded-[var(--radius-panel)] border-hair surface p-5 text-[13px] text-fg-muted">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
            체크리스트
          </p>
          <ul className="mt-2 space-y-1">
            <li>1. 4 suit 모두 같은 내부 스트라이프 개수·두께로 보이는가?</li>
            <li>2. 위아래 마진 동일한가?</li>
            <li>3. 랭크가 좌측, 수트가 우측에 제대로 배치되었는가?</li>
            <li>4. 작은 사이즈(sm)에서 랭크 가독성 유지?</li>
          </ul>
        </section>
      </main>
    </>
  );
}
