import Link from 'next/link';
import { Logo } from '@gto/ui';

export const metadata = { title: '로고 비교 — G1 vs G3' };

type Candidate = {
  key: 'g1' | 'g3';
  srcBg: string;
  srcTransparent: string;
  title: string;
  blurb: string;
};

const CANDIDATES: Candidate[] = [
  {
    key: 'g1',
    srcBg: '/logos/mark-g1.png',
    srcTransparent: '/logos/mark-g1-transparent.png',
    title: 'G1 · Bold Serif',
    blurb: '중앙 GTO TODAY 뚜렷 / 외곽 다이아몬드 림 / 골드 하이라이트 강함',
  },
  {
    key: 'g3',
    srcBg: '/logos/mark-g3.png',
    srcTransparent: '/logos/mark-g3-transparent.png',
    title: 'G3 · Stacked Serif (현재 적용)',
    blurb: '동심원 그루브 + 중앙 GTO/TODAY / 아이보리 림 4방향 / 차분한 다크 그린',
  },
];

export default function LogoComparePage() {
  return (
    <main className="safe-pad-x mx-auto max-w-5xl pb-24 pt-10">
      <header className="mb-8">
        <Link
          href="/dev/logos"
          className="text-fg-muted font-mono text-[11px] uppercase tracking-[0.22em]"
        >
          ← /dev/logos
        </Link>
        <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
          /dev/logo-compare
        </p>
        <h1 className="font-display mt-2 text-[36px] font-bold tracking-[-0.02em]">
          G1 vs G3 — 맥락 비교
        </h1>
        <p className="text-fg-muted mt-2">
          같은 로고를 헤더 · 스플래시 · 앱 아이콘 세 자리에 넣어서 실제 사용 상황에서 어떻게
          보이는지 비교합니다.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-2">
        {CANDIDATES.map((c) => (
          <CandidateColumn key={c.key} candidate={c} />
        ))}
      </div>

      <section className="border-hair surface mt-16 rounded-[var(--radius-panel)] p-6">
        <h2 className="font-display text-[18px] font-bold">선택 방법</h2>
        <ul className="text-fg-muted mt-3 space-y-1.5 text-[13px]">
          <li>
            • 위 두 열에서 더 끌리는 쪽의 키 (<code className="font-mono">G1</code> /{' '}
            <code className="font-mono">G3</code>) 말씀해주시면 1분 안에 앱 전체에 반영합니다.
          </li>
          <li>• 지금은 G3이 스플래시 · 헤더 · 앱 아이콘 전부 메인으로 적용되어 있어요.</li>
          <li>
            • 둘 다 별로면 &ldquo;다시&rdquo; 말씀만 주세요 — 다른 방향 프롬프트로 재생성 ($0.32 /
            4장).
          </li>
          <li>• 작은 사이즈(36px 헤더)에서의 가독성이 가장 중요 — 실제 결정 기준으로 쓰시길.</li>
        </ul>
      </section>
    </main>
  );
}

function CandidateColumn({ candidate }: { candidate: Candidate }) {
  return (
    <div className="space-y-6">
      <div className="border-hair surface rounded-[var(--radius-panel)] p-5">
        <h2 className="font-display text-[22px] font-bold">{candidate.title}</h2>
        <p className="text-fg-muted mt-1.5 text-[12px]">{candidate.blurb}</p>
        <p className="text-fg-muted mt-2 font-mono text-[10px]">
          투명: {candidate.srcTransparent} · 배경: {candidate.srcBg}
        </p>
      </div>

      {/* ── Header mock ─────────────────────────────────────────────── */}
      <Mock label="헤더 (36px, 투명 배경 · 다크 헤더 배경에 합성)">
        <div className="border-hair flex h-14 w-full items-center border-b px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={candidate.srcTransparent}
            alt=""
            width={36}
            height={36}
            style={{
              width: 36,
              height: 36,
              objectFit: 'contain',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
            }}
          />
          <div className="ml-2.5">
            <Logo variant="full" width={92} />
          </div>
        </div>
      </Mock>

      {/* ── Splash mock ─────────────────────────────────────────────── */}
      <Mock label="스플래시 (140px, 투명 배경 · 다크 그라디언트 위)">
        <div
          className="flex aspect-[3/4] w-full flex-col items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 50% 40%, #0E3B2E 0%, #082018 65%, #051612 100%)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={candidate.srcTransparent}
            alt=""
            width={140}
            height={140}
            style={{
              width: 140,
              height: 140,
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 18px rgba(212,175,55,0.35))',
            }}
          />
          <h2
            className="font-display mt-6 flex items-baseline gap-1 leading-none tracking-[-0.02em]"
            style={{ fontSize: 36 }}
          >
            <span className="text-ivory font-bold uppercase">GTO</span>
            <span
              aria-hidden
              className="inline-block h-[6px] w-[6px] rounded-full bg-[color:var(--color-gold)]"
              style={{ transform: 'translateY(-0.35em)' }}
            />
            <span className="text-ivory/90 font-light">today</span>
          </h2>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-gold)]">
            매일 · 한 걸음
          </p>
        </div>
      </Mock>

      {/* ── App icon sizes mock — uses the WITH-BACKGROUND version ───── */}
      <Mock label="앱 아이콘 (180·96·48·24px, 배경 유지 버전)">
        <div className="flex items-end justify-around gap-4 p-6" style={{ background: '#08120E' }}>
          {[180, 96, 48, 24].map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={candidate.srcBg}
                alt=""
                width={size}
                height={size}
                style={{
                  width: size,
                  height: size,
                  objectFit: 'contain',
                  borderRadius: size >= 96 ? 20 : size >= 48 ? 10 : 5,
                }}
              />
              <span className="text-fg-muted font-mono text-[10px]">{size}px</span>
            </div>
          ))}
        </div>
      </Mock>
    </div>
  );
}

function Mock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure className="border-hair overflow-hidden rounded-[var(--radius-panel)]">
      <figcaption className="text-fg-muted px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em]">
        {label}
      </figcaption>
      <div className="surface">{children}</div>
    </figure>
  );
}
