import { CardView, Chip, Logo } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';

export const metadata = { title: 'Showcase' };

export default function ShowcasePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-10">
        <header className="mb-10">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
            /dev/showcase
          </p>
          <h1 className="mt-2 font-display text-[40px] font-bold tracking-[-0.02em]">
            Design system
          </h1>
          <p className="mt-2 text-fg-muted">
            모든 Phase의 컴포넌트가 이 페이지에 모입니다. Phase 1 — 토큰·로고·카드·칩.
          </p>
        </header>

        <Section title="Logo">
          <div className="flex flex-wrap items-end gap-8">
            <Logo variant="full" className="text-[40px]" />
            <Logo variant="short" className="text-[40px]" />
            <Logo variant="dot" className="text-[40px]" />
          </div>
        </Section>

        <Section title="Color palette">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Swatch name="Felt" varName="--color-felt" />
            <Swatch name="Felt Deep" varName="--color-felt-deep" />
            <Swatch name="Felt Night" varName="--color-felt-night" />
            <Swatch name="Gold" varName="--color-gold" />
            <Swatch name="Gold Soft" varName="--color-gold-soft" />
            <Swatch name="Gold Cool" varName="--color-gold-cool" />
            <Swatch name="Noir" varName="--color-noir" />
            <Swatch name="Charcoal" varName="--color-charcoal" />
            <Swatch name="Ivory" varName="--color-ivory" />
            <Swatch name="Cream" varName="--color-cream" />
            <Swatch name="Raise" varName="--color-raise" />
            <Swatch name="Call" varName="--color-call" />
          </div>
        </Section>

        <Section title="Cards">
          <div className="flex flex-wrap gap-3">
            <CardView rank="A" suit="s" size="md" />
            <CardView rank="K" suit="h" size="md" />
            <CardView rank="Q" suit="d" size="md" deckScheme="four-color" />
            <CardView rank="J" suit="c" size="md" deckScheme="four-color" />
            <CardView face="down" size="md" />
            <CardView rank="T" suit="h" size="lg" />
          </div>
        </Section>

        <Section title="Chips">
          <div className="flex flex-wrap items-center gap-3">
            <Chip value={1} tone="gold" />
            <Chip value={5} tone="felt" />
            <Chip value={25} tone="raise" />
            <Chip value={100} tone="call" />
          </div>
        </Section>

        <Section title="Gradients">
          <div className="grid gap-3 sm:grid-cols-3">
            <GradientTile label="felt" className="bg-felt-gradient" />
            <GradientTile label="gold" className="bg-gold-gradient" />
            <GradientTile label="today" className="bg-today-gradient" />
          </div>
        </Section>

        <Section title="Typography">
          <div className="space-y-4">
            <p className="font-display text-[56px] font-bold tracking-[-0.02em] leading-[1]">
              Display XL — GTO, Today.
            </p>
            <p className="font-display text-[40px] font-bold tracking-[-0.02em]">
              Display LG — 오늘의 GTO.
            </p>
            <p className="text-heading font-semibold">Heading — 매일 한 스팟.</p>
            <p className="text-subheading">Subheading — 한 결정의 품질을 다듬는다.</p>
            <p className="text-body-lg">
              Body LG — "Sharp." / "Here&rsquo;s why." 우리는 판단하지 않고 설명합니다.
            </p>
            <p className="font-mono text-mono-lg font-semibold">EV +2.14 BB</p>
            <p className="font-mono text-mono">Bet 75% · 68%</p>
            <p className="font-mono text-caption uppercase tracking-[0.18em] text-fg-muted">
              Caption — Meta · Labels
            </p>
          </div>
        </Section>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 rounded-[var(--radius-panel)] border-hair surface p-6">
      <h2 className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Swatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="rounded-[var(--radius-button)] border-hair overflow-hidden">
      <div className="h-16 w-full" style={{ background: `var(${varName})` }} />
      <div className="px-3 py-2">
        <p className="text-[13px] font-medium">{name}</p>
        <p className="font-mono text-[11px] text-fg-muted">{varName}</p>
      </div>
    </div>
  );
}

function GradientTile({ label, className }: { label: string; className: string }) {
  return (
    <div className={`${className} h-24 rounded-[var(--radius-button)] p-4 text-[13px] text-noir`}>
      <span className="font-mono uppercase tracking-[0.18em]">{label}</span>
    </div>
  );
}
