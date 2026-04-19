'use client';

import { motion } from 'framer-motion';

/**
 * Three custom SVG / HTML illustrations for the onboarding slides.
 * These replace the previous "two cards + three chips + logo mark"
 * placeholder visuals, which felt generic. Each illustration tells a
 * specific story about the slide's message:
 *
 *   DailyTraining   → a 10-dot streak tracker with a glowing current day
 *                     and a stack of cards drifting in from the right
 *   GtoMix          → an animated horizontal bar splitting a decision
 *                     into raise / call / fold, with a pulsing "63.2%" tag
 *   MobilePoker     → a phone frame holding a mini poker table with a
 *                     hero gold chip on the bottom rail
 */

export function DailyTrainingIllustration() {
  return (
    <div className="relative flex h-64 w-full items-center justify-center">
      {/* Background glow */}
      <div
        aria-hidden
        className="absolute h-48 w-48 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0) 70%)',
        }}
      />

      {/* Streak dot row */}
      <div className="relative flex flex-col items-center gap-6">
        <div className="flex items-center gap-2.5">
          {Array.from({ length: 10 }).map((_, i) => {
            const current = i === 6;
            const done = i < 6;
            return (
              <motion.span
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.08 * i, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block rounded-full"
                style={{
                  width: current ? 14 : 10,
                  height: current ? 14 : 10,
                  background: done
                    ? 'linear-gradient(135deg, #E8CC72, #D4AF37)'
                    : current
                      ? 'radial-gradient(circle, #E8CC72, #D4AF37)'
                      : 'rgba(255,255,255,0.12)',
                  boxShadow: current
                    ? '0 0 0 3px rgba(212,175,55,0.25), 0 0 18px rgba(212,175,55,0.6)'
                    : done
                      ? '0 2px 5px rgba(0,0,0,0.3)'
                      : 'none',
                }}
              />
            );
          })}
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-gold)]">
          Day 7 · Streak
        </p>

        {/* Card stack drifting into frame */}
        <div className="relative h-24 w-32">
          {[2, 1, 0].map((idx) => {
            const rotate = (idx - 1) * 6;
            const translateX = (idx - 1) * 12;
            return (
              <motion.div
                key={idx}
                initial={{ x: 60, opacity: 0, rotate: rotate + 10 }}
                animate={{ x: translateX, opacity: 1 - idx * 0.25, rotate }}
                transition={{
                  delay: 0.25 + idx * 0.08,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute left-1/2 top-0 -ml-[26px] h-24 w-[52px] rounded-[8px]"
                style={{
                  background:
                    idx === 0
                      ? 'linear-gradient(155deg, #9B2A3E, #6B1A2A)'
                      : idx === 1
                        ? 'linear-gradient(155deg, #2B5F8F, #1A436A)'
                        : 'linear-gradient(155deg, #1F1F24, #0C0C10)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 8px 22px rgba(0,0,0,0.45)',
                  zIndex: 3 - idx,
                }}
              >
                <div className="absolute left-2 top-1.5 text-[10px] text-ivory/70">
                  {idx === 0 ? '♥' : idx === 1 ? '♦' : '♠'}
                </div>
                <div className="absolute inset-0 flex items-center justify-center font-display text-[28px] font-bold text-ivory">
                  {idx === 0 ? 'K' : idx === 1 ? 'Q' : 'A'}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function GtoMixIllustration() {
  const raise = 63.2;
  const call = 22.7;
  return (
    <div className="relative flex h-64 w-full items-center justify-center">
      <div
        aria-hidden
        className="absolute h-48 w-64 rounded-full blur-3xl"
        style={{ background: 'rgba(212,175,55,0.14)' }}
      />

      <div className="relative w-full max-w-xs space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-baseline justify-between"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted">
            GTO 믹스
          </span>
          <span className="font-mono text-[11px] text-fg-muted">BB vs BTN · A5s</span>
        </motion.div>

        {/* Three segments, each a labeled animated bar */}
        <MixSegment label="레이즈" pct={raise} delay={0.1} color="var(--color-raise)" />
        <MixSegment label="콜" pct={call} delay={0.25} color="var(--color-call)" />
        <MixSegment
          label="폴드"
          pct={100 - raise - call}
          delay={0.4}
          color="var(--color-fold)"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="mt-5 rounded-[var(--radius-button)] border border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent)]/10 px-3 py-2 text-[12px] text-[color:var(--color-accent)]"
        >
          AI 코치: 블로커가 약하지만 상대 3벳 레인지에 레이즈로 압박 가능.
        </motion.div>
      </div>
    </div>
  );
}

function MixSegment({
  label,
  pct,
  delay,
  color,
}: {
  label: string;
  pct: number;
  delay: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 font-mono text-[12px] text-fg-muted">{label}</span>
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[color:var(--color-border)]">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="h-full origin-left rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="w-14 text-right font-mono text-[12px] font-semibold tabular-nums">
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

export function MobilePokerIllustration() {
  return (
    <div className="relative flex h-64 w-full items-center justify-center">
      <div
        aria-hidden
        className="absolute h-56 w-56 rounded-full blur-3xl"
        style={{ background: 'rgba(31,157,85,0.22)' }}
      />

      {/* Phone frame */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-[260px] w-[150px] rounded-[28px]"
        style={{
          background: 'linear-gradient(180deg, #1C1C1E 0%, #0A0A0A 100%)',
          border: '1.5px solid rgba(255,255,255,0.12)',
          boxShadow:
            '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Speaker slit */}
        <div
          aria-hidden
          className="absolute left-1/2 top-2 h-1.5 w-14 -translate-x-1/2 rounded-full bg-black"
        />
        {/* Screen */}
        <div className="absolute inset-2 overflow-hidden rounded-[22px] bg-[rgb(8,32,24)]">
          {/* Mini table */}
          <div className="relative h-full w-full p-3">
            <svg viewBox="0 0 120 180" className="h-full w-full">
              <defs>
                <radialGradient id="mini-felt" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#177046" />
                  <stop offset="100%" stopColor="#061C14" />
                </radialGradient>
              </defs>
              <ellipse
                cx="60"
                cy="90"
                rx="52"
                ry="72"
                fill="url(#mini-felt)"
                stroke="rgba(212,175,55,0.25)"
                strokeWidth="0.8"
              />
              {/* villain chips */}
              {[
                { cx: 30, cy: 40, label: 'UTG' },
                { cx: 90, cy: 40, label: 'CO' },
                { cx: 20, cy: 90, label: 'MP' },
                { cx: 100, cy: 90, label: 'BTN' },
                { cx: 40, cy: 140, label: 'SB' },
              ].map((s) => (
                <g key={s.label}>
                  <circle
                    cx={s.cx}
                    cy={s.cy}
                    r="10"
                    fill="#18181C"
                    stroke="rgba(255,255,255,0.28)"
                    strokeWidth="1"
                  />
                  <text
                    x={s.cx}
                    y={s.cy + 3}
                    textAnchor="middle"
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill="rgba(244,239,230,0.7)"
                  >
                    {s.label}
                  </text>
                </g>
              ))}
              {/* Hero BB with teal ring */}
              <circle
                cx="80"
                cy="140"
                r="12"
                fill="#18181C"
                stroke="#1F9D55"
                strokeWidth="2.5"
              />
              <text
                x="80"
                y="143"
                textAnchor="middle"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
                fill="#1F9D55"
              >
                BB
              </text>
              {/* Pot */}
              <text
                x="60"
                y="92"
                textAnchor="middle"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
                fill="#F4EFE6"
              >
                8 bb
              </text>
            </svg>
          </div>
        </div>
        {/* Home bar */}
        <div
          aria-hidden
          className="absolute bottom-1.5 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-ivory/40"
        />
      </motion.div>

      {/* Floating gold chip sliding in */}
      <motion.div
        initial={{ x: -40, y: 60, opacity: 0 }}
        animate={{ x: 60, y: 20, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute h-10 w-10 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 30%, #F0C857, #D4AF37 60%, #8C6F1F)',
          border: '2px solid rgba(255,255,255,0.3)',
          boxShadow: '0 6px 18px rgba(212,175,55,0.4)',
        }}
      >
        <div className="flex h-full w-full items-center justify-center font-mono text-[11px] font-bold text-noir">
          GTO
        </div>
      </motion.div>
    </div>
  );
}
