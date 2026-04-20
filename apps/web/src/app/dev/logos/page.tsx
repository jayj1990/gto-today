import { SiteHeader } from '@/components/site-header';

export const metadata = { title: '로고 미리보기' };

type Mark = {
  key: string;
  src: string;
  title: string;
  desc: string;
};

const CODED_MARKS: Mark[] = [
  {
    key: 'chip',
    src: '/logos/mark-chip.svg',
    title: 'A1 · Chip (코딩)',
    desc: '포커 칩 림 + 중앙 골드 코인 + GT 모노그램. 카지노 토큰 감성.',
  },
  {
    key: 'dot',
    src: '/logos/mark-dot.svg',
    title: 'A2 · Dot (코딩)',
    desc: '브랜드 시그니처 골드 닷 + 스택된 워드마크. 미니멀.',
  },
  {
    key: 'spade',
    src: '/logos/mark-spade.svg',
    title: 'A3 · Spade (코딩)',
    desc: '스페이드 실루엣 안 골드 닷. 포커 아이덴티티 강조.',
  },
];

const WORDMARKS: Mark[] = [
  {
    key: 'wm-h',
    src: '/logos/wordmark-horizontal.svg',
    title: 'B1 · Wordmark Horizontal',
    desc: '타이포 기반 가로형. 헤더 / 명함 / 인보이스.',
  },
  {
    key: 'wm-s',
    src: '/logos/wordmark-stacked.svg',
    title: 'B2 · Wordmark Stacked',
    desc: '타이포 기반 2단 스택. 스플래시 / 세로 레이아웃.',
  },
];

const AI_MARKS: Mark[] = [
  {
    key: 'ai-dot',
    src: '/ai-assets/logo/dot-halo.png',
    title: 'C1 · Dot Halo (AI v1)',
    desc: 'DALL·E 3 HD. 골드 닷 + 할로 + 라운드 스퀘어.',
  },
  {
    key: 'ai-chip',
    src: '/ai-assets/logo/chip-stack.png',
    title: 'C2 · Chip Stack (AI v1) — 현재 앱 아이콘',
    desc: '3단 칩 스택 탑뷰 + 골드 도트. 질감 풍부. 현재 favicon/192/512/maskable로 승격 상태.',
  },
  {
    key: 'ai-spade',
    src: '/ai-assets/logo/spade-minimal.png',
    title: 'C3 · Spade Minimal (AI v1)',
    desc: '한 획 느낌의 추상화된 스페이드.',
  },
  {
    key: 'ai-compass',
    src: '/ai-assets/logo/compass-of-suits.png',
    title: 'C4 · Compass of Suits (AI v1)',
    desc: '네 슈트가 나침반처럼 둘러싼 골드 닷. 상징성 강함.',
  },
];

const AI_MARKS_V2: Mark[] = [
  {
    key: 'v2-seal',
    src: '/ai-assets/logo-v2/gold-seal.png',
    title: 'D1 · Gold Seal (AI v2)',
    desc: '아트데코 나침반 훈장. 럭셔리 감 최상. 디테일이 많아 작은 사이즈에서는 뭉개질 수 있음.',
  },
  {
    key: 'v2-spade',
    src: '/ai-assets/logo-v2/spade-emblem.png',
    title: 'D2 · Spade Emblem (AI v2)',
    desc: '깔끔한 스페이드 + 골드 프레임. 포커 정체성 가장 명확.',
  },
  {
    key: 'v2-chip',
    src: '/ai-assets/logo-v2/chip-dot.png',
    title: 'D3 · Chip Dot (AI v2)',
    desc: '고전 포커칩 탑뷰 + 중앙 도트. 범용적, 깔끔.',
  },
  {
    key: 'v2-crown',
    src: '/ai-assets/logo-v2/crown-chip.png',
    title: 'D4 · Crown Chip (AI v2)',
    desc: '왕관 + 칩 조합. "GTO의 왕관" 서사. 유니크하고 포지셔닝 강함.',
  },
  {
    key: 'v2-ace',
    src: '/ai-assets/logo-v2/ace-monogram.png',
    title: 'D5 · Ace Monogram (AI v2)',
    desc: '빈 아트데코 플라크 프레임. 단독 사용보다 텍스트 오버레이용.',
  },
  {
    key: 'v2-geom',
    src: '/ai-assets/logo-v2/geom-dot.png',
    title: 'D6 · Geom Dot (AI v2)',
    desc: '동심원 + 궤도 도트. 모던·추상·테크루. 태양계 느낌.',
  },
];

export default function LogosPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl safe-pad-x pb-24 pt-10">
        <header className="mb-8">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
            /dev/logos
          </p>
          <h1 className="mt-2 font-display text-[36px] font-bold tracking-[-0.02em]">
            로고 후보
          </h1>
          <p className="mt-2 text-fg-muted">
            네 가지 방향 · 총 15개 후보. A(코딩) · B(타이포) · C(AI v1) · D(AI v2 — 고퀄리티 재생성).
          </p>
          <p className="mt-2 text-[12px] font-mono text-[color:var(--color-accent)]">
            현재 앱 아이콘(favicon / 192 / 512 / apple / maskable) 전부 C2 chip-stack 적용 중.
          </p>
        </header>

        <Family
          badge="A"
          title="코딩 SVG 마크"
          subtitle="벡터 기반. 크기·색 튜닝이 즉시 가능. 정석 / 미니멀 방향."
          marks={CODED_MARKS}
        />

        <Family
          badge="B"
          title="타이포그래피 워드마크"
          subtitle="로고 = 브랜드명 그 자체. 가독성 + 고급감. 간판·헤더·명함에 강함."
          marks={WORDMARKS}
        />

        <Family
          badge="C"
          title="AI v1 — 미니멀 방향 (DALL·E 3 HD)"
          subtitle="첫 배치. 평면적·미니멀 스타일. 현재 C2 chip-stack이 앱 아이콘으로 승격."
          marks={AI_MARKS}
        />

        <Family
          badge="D"
          title="AI v2 — 프리미엄 방향 (DALL·E 3 HD)"
          subtitle="두 번째 배치. 볼류메트릭 라이팅 + 아트데코 프레임 + 엠보스 메탈. 럭셔리 극대화."
          marks={AI_MARKS_V2}
        />

        <section className="mt-12 rounded-[var(--radius-panel)] border-hair surface p-6">
          <h2 className="font-display text-[18px] font-bold">선택 방법</h2>
          <ul className="mt-3 space-y-1 text-[13px] text-fg-muted">
            <li>• 마음에 드는 후보 번호(A2, B1, C4 등)를 알려주시면 최종 산출물(favicon / 192 / 512 / maskable / Open Graph) 전부 재생성</li>
            <li>• 조합도 가능 — 예: C1 아이콘 + B1 워드마크 = 앱 마크 + 로고 세트</li>
            <li>• 색상·디테일 튜닝은 선택 후 바로 작업</li>
            <li>• AI 후보(C)는 PNG — 확정 시 SVG로 트레이스하거나 더 고해상도로 재생성</li>
          </ul>
        </section>
      </main>
    </>
  );
}

function Family({
  badge,
  title,
  subtitle,
  marks,
}: {
  badge: string;
  title: string;
  subtitle: string;
  marks: Mark[];
}) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-accent)] font-mono text-[13px] font-bold text-noir">
          {badge}
        </span>
        <h2 className="font-display text-[24px] font-bold tracking-[-0.02em]">{title}</h2>
      </div>
      <p className="mb-5 text-[13px] text-fg-muted">{subtitle}</p>

      <ul className="space-y-6">
        {marks.map((m) => (
          <li
            key={m.key}
            className="rounded-[var(--radius-panel)] border-hair surface p-6"
          >
            <div className="mb-5">
              <h3 className="font-display text-[20px] font-bold">{m.title}</h3>
              <p className="mt-1 text-[13px] text-fg-muted">{m.desc}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <PreviewPanel src={m.src} alt={m.title} background="dark" />
              <PreviewPanel src={m.src} alt={m.title} background="light" />
            </div>

            <p className="mt-4 font-mono text-[11px] text-fg-muted">
              파일: {m.src}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PreviewPanel({
  src,
  alt,
  background,
}: {
  src: string;
  alt: string;
  background: 'dark' | 'light';
}) {
  const bg = background === 'dark' ? '#08120E' : '#F4EFE6';
  return (
    <div
      className="rounded-[var(--radius-button)] border-hair p-6"
      style={{ background: bg }}
    >
      <p
        className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em]"
        style={{ color: background === 'dark' ? 'rgba(244,239,230,0.5)' : 'rgba(10,10,10,0.5)' }}
      >
        {background === 'dark' ? 'Tonight (기본 테마)' : 'Light (배경 대비용)'}
      </p>
      <div className="flex items-end gap-6">
        <img src={src} alt={alt} width={128} height={128} style={{ borderRadius: 18, objectFit: 'contain' }} />
        <img src={src} alt="" width={72} height={72} style={{ borderRadius: 12, objectFit: 'contain' }} />
        <img src={src} alt="" width={40} height={40} style={{ borderRadius: 8, objectFit: 'contain' }} />
      </div>
      <p
        className="mt-4 font-mono text-[10px]"
        style={{ color: background === 'dark' ? 'rgba(244,239,230,0.4)' : 'rgba(10,10,10,0.4)' }}
      >
        128 / 72 / 40
      </p>
    </div>
  );
}
