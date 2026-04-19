'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CardView, Chip, CountUp, MixBar } from '@gto/ui';
import {
  chipToss,
  dealContainer,
  duration as d,
  easeQuart,
  fadeUp,
} from '@gto/ui/motion';

/**
 * Interactive motion playground for /dev/showcase.
 * Every signature animation in one place so we can eyeball the feel.
 */
export function MotionDemo() {
  const [dealKey, setDealKey] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [evTarget, setEvTarget] = useState(2.14);
  const [mixPct, setMixPct] = useState({ bet: 68, check: 32 });
  const [tossKey, setTossKey] = useState(0);
  // Swallow double-fires when two fingers tap at the same time.
  const flipLockRef = useRef(0);
  const handleFlip = () => {
    const now = performance.now();
    if (now - flipLockRef.current < 240) return;
    flipLockRef.current = now;
    setFlipped((f) => !f);
  };

  return (
    <div className="space-y-8">
      {/* Deal stagger ------------------------------------------------ */}
      <Section title="Deal stagger">
        <div className="flex items-center gap-6">
          <motion.div
            key={dealKey}
            initial="hidden"
            animate="visible"
            variants={dealContainer}
            className="flex gap-2"
          >
            {(['A', 'K', 'Q', 'J', 'T'] as const).map((r, i) => {
              const suits = ['s', 'h', 'd', 'c'] as const;
              return (
                <CardView
                  key={`${dealKey}-${r}`}
                  rank={r}
                  suit={suits[i % suits.length]!}
                  deckScheme="four-color"
                  size="md"
                  dealVariant
                />
              );
            })}
          </motion.div>
          <button
            onClick={() => setDealKey((k) => k + 1)}
            style={{ touchAction: 'manipulation' }}
            className="select-none rounded-[var(--radius-button)] border-hair px-4 py-2 text-[13px] font-semibold active:scale-[0.97]"
          >
            Deal again
          </button>
        </div>
      </Section>

      {/* Card flip --------------------------------------------------- */}
      <Section title="Card flip">
        <div className="flex items-center gap-6">
          <CardView
            rank="A"
            suit="s"
            size="lg"
            flippable
            face={flipped ? 'up' : 'down'}
            interactive
            style={{ touchAction: 'manipulation' }}
            onClick={handleFlip}
          />
          <p className="text-[13px] text-fg-muted">
            클릭해서 뒤집어 보세요.
            <br />
            <code className="font-mono text-[12px]">flipVariants</code> + 3D <em>preserve-3d</em>.
          </p>
        </div>
      </Section>

      {/* Count up ---------------------------------------------------- */}
      <Section title="Count up (EV)">
        <div className="flex items-center gap-6">
          <p className="font-mono text-mono-lg font-semibold text-[color:var(--color-accent)]">
            +<CountUp value={evTarget} decimals={2} /> BB
          </p>
          <div className="flex gap-2">
            {[0.4, 2.14, -1.05, 5.67].map((v) => (
              <button
                key={v}
                onClick={() => setEvTarget(v)}
                style={{ touchAction: 'manipulation' }}
                className="select-none rounded-[var(--radius-button)] border-hair px-3 py-1.5 text-[13px] active:scale-[0.97]"
              >
                {v > 0 ? '+' : ''}
                {v}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Mix bar ----------------------------------------------------- */}
      <Section title="Mix bar">
        <div className="space-y-4">
          <MixBar
            segments={[
              { label: 'Bet 75%', value: mixPct.bet, color: 'var(--color-raise)' },
              { label: 'Check', value: mixPct.check, color: 'var(--color-info)' },
            ]}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setMixPct({ bet: 68, check: 32 })}
              style={{ touchAction: 'manipulation' }}
                className="select-none rounded-[var(--radius-button)] border-hair px-3 py-1.5 text-[13px] active:scale-[0.97]"
            >
              BTN vs BB (68/32)
            </button>
            <button
              onClick={() => setMixPct({ bet: 22, check: 78 })}
              style={{ touchAction: 'manipulation' }}
                className="select-none rounded-[var(--radius-button)] border-hair px-3 py-1.5 text-[13px] active:scale-[0.97]"
            >
              OOP wet (22/78)
            </button>
            <button
              onClick={() => setMixPct({ bet: 100, check: 0 })}
              style={{ touchAction: 'manipulation' }}
                className="select-none rounded-[var(--radius-button)] border-hair px-3 py-1.5 text-[13px] active:scale-[0.97]"
            >
              All-in (100/0)
            </button>
          </div>
        </div>
      </Section>

      {/* Chip toss (celebration) ------------------------------------- */}
      <Section title="Chip toss">
        <div className="flex items-center gap-6">
          <div className="relative h-28 w-40">
            <AnimatePresence mode="wait">
              <motion.div
                key={tossKey}
                className="absolute inset-0 flex items-end justify-center gap-1"
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={chipToss}
                    initial="rest"
                    animate="toss"
                  >
                    <Chip value={i === 2 ? 'GT' : i * 5} tone={i % 2 ? 'raise' : 'gold'} size="md" />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
          <button
            onClick={() => setTossKey((k) => k + 1)}
            style={{ touchAction: 'manipulation' }}
            className="select-none rounded-[var(--radius-button)] bg-gold-gradient px-4 py-2 text-[13px] font-semibold text-noir active:scale-[0.97]"
          >
            Sharp.
          </button>
        </div>
      </Section>

      {/* Sheet / fadeUp ---------------------------------------------- */}
      <Section title="fadeUp (result sheet)">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
          variants={fadeUp}
          transition={{ duration: d.base, ease: easeQuart }}
          className="rounded-[var(--radius-panel)] surface border-hair p-4 text-[14px] text-fg-muted"
        >
          Scroll me — fades up on entry. 240ms, ease-out-quart.
        </motion.div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-panel)] surface border-hair p-6">
      <h3 className="font-mono text-[12px] uppercase tracking-[0.2em] text-fg-muted">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
