import { SiteHeader } from '@/components/site-header';

export const metadata = { title: '로고 미리보기' };

/**
 * /dev/logos — internal preview page for the 3 logo concepts.
 * Each card shows the same SVG mark at 3 sizes (256 / 96 / 48) against
 * both a dark and a light backdrop so the user can judge legibility.
 */
export default function LogosPage() {
  const concepts = [
    {
      key: 'chip',
      src: '/logos/mark-chip.svg',
      title: '콘셉트 A · Chip',
      desc: '포커 칩 림 + 중앙 골드 코인 + GT 모노그램. 카지노 토큰 감성, 인쇄물·배지에 유리.',
    },
    {
      key: 'dot',
      src: '/logos/mark-dot.svg',
      title: '콘셉트 B · Dot',
      desc: '브랜드 시그니처 골드 닷 + 스택된 "GTO today" 워드마크. 미니멀, 앱 아이콘 기본값 후보.',
    },
    {
      key: 'spade',
      src: '/logos/mark-spade.svg',
      title: '콘셉트 C · Spade',
      desc: '스타일라이즈된 스페이드 실루엣 안에 골드 닷. 포커의 아이덴티티를 강하게.',
    },
  ];

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
            3가지 방향. 어느 걸로 가시든 세 사이즈(256/96/48)에서 잘 읽히는지 먼저 보고 결정하세요.
          </p>
        </header>

        <ul className="space-y-10">
          {concepts.map((c) => (
            <li
              key={c.key}
              className="rounded-[var(--radius-panel)] border-hair surface p-6"
            >
              <div className="mb-5">
                <h2 className="font-display text-[22px] font-bold">{c.title}</h2>
                <p className="mt-1 text-[13px] text-fg-muted">{c.desc}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <PreviewPanel src={c.src} alt={c.title} background="dark" />
                <PreviewPanel src={c.src} alt={c.title} background="light" />
              </div>

              <p className="mt-4 font-mono text-[11px] text-fg-muted">
                파일: {c.src}
              </p>
            </li>
          ))}
        </ul>

        <section className="mt-12 rounded-[var(--radius-panel)] border-hair surface p-6">
          <h2 className="font-display text-[18px] font-bold">선택 방법</h2>
          <ul className="mt-3 space-y-1 text-[13px] text-fg-muted">
            <li>• A, B, C 중 하나 고르시면 앱 아이콘 (favicon / 192 / 512 / maskable) 전부 재생성</li>
            <li>• 원하는 조합(예: "B의 닷 + C의 스페이드") 있으시면 말씀만 하세요 — 새 SVG 파생</li>
            <li>• 색상·닷 크기·테두리 두께 같은 튜닝은 언제든지 수정 가능</li>
          </ul>
        </section>
      </main>
    </>
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
        <img src={src} alt={alt} width={128} height={128} style={{ borderRadius: 18 }} />
        <img src={src} alt="" width={72} height={72} style={{ borderRadius: 12 }} />
        <img src={src} alt="" width={40} height={40} style={{ borderRadius: 8 }} />
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
