import { CardView, Chip, Logo } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { MotionDemo } from '@/components/showcase/motion-demo';
import { PokerTableDemo } from '@/components/showcase/poker-table-demo';
import { RangeDemo } from '@/components/showcase/range-demo';

export const metadata = { title: 'Showcase' };

export default function ShowcasePage() {
  return (
    <>
      <SiteHeader />
      <main className="safe-pad-x mx-auto max-w-5xl pb-[calc(env(safe-area-inset-bottom)+96px)] pt-10">
        <header className="mb-10">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
            /dev/showcase
          </p>
          <h1 className="font-display mt-2 text-[40px] font-bold tracking-[-0.02em]">
            Design system
          </h1>
          <p className="text-fg-muted mt-2">
            모든 컴포넌트가 여기 모여 있습니다. 아래 섹션에서 직접 만져보세요.
          </p>
        </header>

        <Section title="01 · Logo">
          <div className="flex flex-wrap items-end gap-10">
            <div className="flex flex-col items-start gap-1">
              <Logo variant="full" width={200} />
              <span className="text-fg-muted font-mono text-[11px]">variant=&quot;full&quot;</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <Logo variant="short" width={72} />
              <span className="text-fg-muted font-mono text-[11px]">variant=&quot;short&quot;</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <Logo variant="dot" width={32} height={32} />
              <span className="text-fg-muted font-mono text-[11px]">variant=&quot;dot&quot;</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <Logo variant="mark" width={64} height={64} />
              <span className="text-fg-muted font-mono text-[11px]">variant=&quot;mark&quot;</span>
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
          <p className="text-fg-muted mt-3 font-mono text-[11px]">
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
          <PokerTableDemo />
        </Section>

        <Section title="06 · Preflop range (live GTO data)">
          <RangeDemo />
        </Section>

        <Section title="07 · Gradients">
          <div className="grid gap-3 sm:grid-cols-3">
            <GradientTile label="felt" className="bg-felt-gradient text-ivory" />
            <GradientTile label="gold" className="bg-gold-gradient text-noir" />
            <GradientTile label="today" className="bg-today-gradient text-ivory" />
          </div>
        </Section>

        <Section title="08 · Motion (live)">
          <MotionDemo />
        </Section>

        <Section title="09 · Typography">
          <div className="space-y-4">
            <p className="font-display text-[56px] font-bold leading-[1] tracking-[-0.02em]">
              Display XL — GTO, Today.
            </p>
            <p className="font-display text-[40px] font-bold tracking-[-0.02em]">
              Display LG — 오늘의 GTO.
            </p>
            <p className="text-heading font-semibold">Heading — 매일 한 핸드.</p>
            <p className="text-subheading">Subheading — 한 번의 판단을 다듬습니다.</p>
            <p className="text-body-lg">
              Body LG — &quot;정확해요&quot; / &quot;해설 보기&quot; 정답/오답 대신 설명을 드립니다.
            </p>
            <p className="text-mono-lg font-mono font-semibold">EV +2.14 BB</p>
            <p className="text-mono font-mono">Bet 75% · 68%</p>
            <p
              className="text-caption text-fg-muted font-mono uppercase tracking-[0.18em]"
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
    <section className="border-hair surface mt-10 rounded-[var(--radius-panel)] p-6">
      <h2 className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Swatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="border-hair overflow-hidden rounded-[var(--radius-button)]">
      <div className="h-16 w-full" style={{ background: `var(${varName})` }} />
      <div className="px-3 py-2">
        <p className="text-[13px] font-medium">{name}</p>
        <p className="text-fg-muted font-mono text-[11px]">{varName}</p>
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
