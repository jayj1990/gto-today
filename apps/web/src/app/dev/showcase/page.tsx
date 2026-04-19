import { CardView, Chip, Logo, PokerTable } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { MotionDemo } from '@/components/showcase/motion-demo';

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
            Phase 1 + 2 컴포넌트 전부. 모션은 섹션 7에서 직접 실행해보세요.
          </p>
        </header>

        <Section title="01 · Logo">
          <div className="flex flex-wrap items-end gap-10">
            <div className="flex flex-col items-start gap-1">
              <Logo variant="full" width={200} />
              <span className="font-mono text-[11px] text-fg-muted">variant=&quot;full&quot;</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <Logo variant="short" width={72} />
              <span className="font-mono text-[11px] text-fg-muted">variant=&quot;short&quot;</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <Logo variant="dot" width={32} height={32} />
              <span className="font-mono text-[11px] text-fg-muted">variant=&quot;dot&quot;</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <Logo variant="mark" width={64} height={64} />
              <span className="font-mono text-[11px] text-fg-muted">variant=&quot;mark&quot;</span>
            </div>
          </div>
        </Section>

        <Section title="02 · Color palette">
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

        <Section title="03 · Cards (static)">
          <div className="flex flex-wrap gap-3">
            <CardView rank="A" suit="s" size="md" deckScheme="four-color" />
            <CardView rank="K" suit="h" size="md" deckScheme="four-color" />
            <CardView rank="Q" suit="d" size="md" deckScheme="four-color" />
            <CardView rank="J" suit="c" size="md" deckScheme="four-color" />
            <CardView face="down" size="md" />
            <CardView rank="T" suit="h" size="lg" deckScheme="two-color" />
          </div>
          <p className="mt-3 font-mono text-[11px] text-fg-muted">
            Left: four-color deck · Right: two-color (traditional)
          </p>
        </Section>

        <Section title="04 · Chips">
          <div className="flex flex-wrap items-center gap-3">
            <Chip value={1} tone="gold" />
            <Chip value={5} tone="felt" />
            <Chip value={25} tone="raise" />
            <Chip value={100} tone="call" />
            <Chip value={500} tone="ivory" />
            <Chip value="1K" tone="gold" size="lg" />
            <Chip value="$" tone="felt" size="sm" />
          </div>
        </Section>

        <Section title="05 · Poker table (overhead)">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-[11px] text-fg-muted">6-max · hero on BTN</p>
              <PokerTable format="6max" hero="BTN" folded={['UTG', 'MP']} />
            </div>
            <div>
              <p className="mb-2 font-mono text-[11px] text-fg-muted">9-max · hero on CO</p>
              <PokerTable format="9max" hero="CO" folded={['UTG', 'UTG1', 'MP', 'LJ']} />
            </div>
          </div>
        </Section>

        <Section title="06 · Gradients">
          <div className="grid gap-3 sm:grid-cols-3">
            <GradientTile label="felt" className="bg-felt-gradient text-ivory" />
            <GradientTile label="gold" className="bg-gold-gradient text-noir" />
            <GradientTile label="today" className="bg-today-gradient text-ivory" />
          </div>
        </Section>

        <Section title="07 · Motion (live)">
          <MotionDemo />
        </Section>

        <Section title="08 · Typography">
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
              Body LG — &quot;Sharp.&quot; / &quot;Here&rsquo;s why.&quot; 우리는 판단하지 않고 설명합니다.
            </p>
            <p className="font-mono text-mono-lg font-semibold">EV +2.14 BB</p>
            <p className="font-mono text-mono">Bet 75% · 68%</p>
            <p
              className="font-mono text-caption uppercase tracking-[0.18em] text-fg-muted"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Serif accent (Fraunces) — Today awaits.
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
    <div className={`${className} h-24 rounded-[var(--radius-button)] p-4 text-[13px]`}>
      <span className="font-mono uppercase tracking-[0.18em]">{label}</span>
    </div>
  );
}
