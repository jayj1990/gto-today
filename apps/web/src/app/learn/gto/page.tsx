'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MixBar } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';

/**
 * 처음 오신 분에게 GTO를 시각적으로 설명하는 페이지. 텍스트는 짧고,
 * 각 섹션은 간단한 SVG/컴포넌트 그림 하나로 핵심 개념을 전합니다.
 */
export default function LearnGtoPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg safe-pad-x pb-[calc(env(safe-area-inset-bottom)+48px)] pt-4">
        <Hero />
        <Section
          eyebrow="WHAT"
          title="GTO가 뭐예요?"
          body="포커는 운이 아니라 실력이 더 중요한 게임입니다. 균형잡힌 GTO 전략이 장기적으로 더 높은 수익률을 가져다줍니다."
          delay={0.05}
        >
          <BalanceVisual />
        </Section>

        <Section
          eyebrow="WHY"
          title="왜 필요해요?"
          body="감으로만 플레이하면 패턴이 읽혀 이용당합니다. GTO는 상대가 무슨 수를 써도 허점이 없어요."
          delay={0.1}
        >
          <IntuitionVsGtoVisual />
        </Section>

        <Section
          eyebrow="MIX"
          title="한 가지 답이 아니에요"
          body="같은 패라도 상황에 따라 레이즈·콜·폴드를 확률로 섞습니다. 상대가 예측할 수 없도록."
          delay={0.15}
        >
          <MixExample />
        </Section>

        <Section
          eyebrow="POSITION"
          title="자리(포지션)가 핵심"
          body="늦게 행동할수록 정보가 많습니다. 버튼(BTN)은 넓게, 언더더건(UTG)은 좁게 플레이하는 이유죠."
          delay={0.2}
        >
          <PositionVisual />
        </Section>

        <Section
          eyebrow="TERMS"
          title="자주 나오는 용어"
          body="훈련하다 보면 계속 마주치는 3가지. 머리에 넣어두면 편해요."
          delay={0.25}
        >
          <TermsGrid />
        </Section>

        <Section
          eyebrow="HOW"
          title="이 앱은 어떻게 써요?"
          body="매일 10핸드 퀴즈 풀고 GTO 감을 익혀보세요. 실전에서 힌트가 필요할 때도 적극 활용해 보세요."
          delay={0.3}
        >
          <AppFlow />
        </Section>

        <Cta />
      </main>
    </>
  );
}

function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mt-2 mb-8 text-center"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--color-accent)]">
        GTO 입문
      </p>
      <h1 className="mt-3 font-display text-[36px] font-bold leading-[1.1] tracking-[-0.02em]">
        포커의 정답,
        <br />
        <span className="text-[color:var(--color-accent)]">균형</span>입니다
      </h1>
      <p className="mx-auto mt-4 max-w-xs text-[14px] leading-[1.65] text-fg-muted">
        운이 아니라 전략. 1분이면 GTO가 뭔지 감이 옵니다.
      </p>
    </motion.div>
  );
}

function Section({
  eyebrow,
  title,
  body,
  children,
  delay,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="mt-10 rounded-[var(--radius-panel)] border-hair surface px-5 py-6"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-[22px] font-bold leading-tight tracking-[-0.015em]">
        {title}
      </h2>
      <p className="mt-2 text-[14px] leading-[1.65] text-fg-muted">{body}</p>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

function BalanceVisual() {
  // Balanced scale — two pans equal weight. "정확한 균형 = GTO"
  return (
    <div className="flex items-center justify-center py-2">
      <svg width="220" height="110" viewBox="0 0 220 110" role="img" aria-label="균형 저울">
        <line x1="110" y1="20" x2="110" y2="95" stroke="var(--color-gold)" strokeWidth="2" />
        <line x1="40" y1="30" x2="180" y2="30" stroke="var(--color-gold)" strokeWidth="2.5" />
        <line x1="40" y1="30" x2="40" y2="55" stroke="var(--color-gold)" strokeWidth="1.5" />
        <line x1="180" y1="30" x2="180" y2="55" stroke="var(--color-gold)" strokeWidth="1.5" />
        <ellipse cx="40" cy="60" rx="28" ry="7" fill="var(--color-gold)" opacity="0.85" />
        <ellipse cx="180" cy="60" rx="28" ry="7" fill="var(--color-gold)" opacity="0.85" />
        <circle cx="110" cy="20" r="4" fill="var(--color-gold)" />
        <rect x="90" y="95" width="40" height="6" rx="2" fill="var(--color-gold)" opacity="0.6" />
        <text x="40" y="85" textAnchor="middle" fontSize="11" fill="var(--color-fg-muted)" fontFamily="monospace">
          공격
        </text>
        <text x="180" y="85" textAnchor="middle" fontSize="11" fill="var(--color-fg-muted)" fontFamily="monospace">
          수비
        </text>
      </svg>
    </div>
  );
}

function IntuitionVsGtoVisual() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-[var(--radius-button)] border border-[color:var(--color-raise)]/30 bg-[color:var(--color-raise)]/5 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-raise)]">
          감으로
        </p>
        <p className="mt-2 text-[13px] leading-[1.55] text-fg">
          기분 따라 플레이
          <br />→ 패턴 읽힘
          <br />→ <span className="text-[color:var(--color-raise)]">이용당함</span>
        </p>
      </div>
      <div className="rounded-[var(--radius-button)] border border-[color:var(--color-call)]/40 bg-[color:var(--color-call)]/5 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-call)]">
          GTO로
        </p>
        <p className="mt-2 text-[13px] leading-[1.55] text-fg">
          균형 잡힌 믹스
          <br />→ 예측 불가
          <br />→ <span className="text-[color:var(--color-call)]">손해 없음</span>
        </p>
      </div>
    </div>
  );
}

function MixExample() {
  return (
    <div className="rounded-[var(--radius-button)] surface-raised p-4">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
        예: BTN에서 AKo를 받았을 때
      </p>
      <MixBar
        segments={[
          { label: '레이즈', value: 75, color: 'var(--color-raise)', dominant: true },
          { label: '콜', value: 20, color: 'var(--color-call)' },
          { label: '폴드', value: 5, color: 'var(--color-fold)' },
        ]}
        highlightColor="var(--color-gold)"
      />
      <p className="mt-3 text-[12px] leading-[1.5] text-fg-muted">
        100번 중 75번은 레이즈, 20번은 콜, 5번은 폴드. 상대는 내 다음 액션을 맞출 수 없습니다.
      </p>
    </div>
  );
}

function PositionVisual() {
  // Compact overhead table with UTG (tight/red), BTN (wide/green) pulled out.
  const seats = [
    { label: 'UTG', angle: -90, tone: 'tight' as const },
    { label: 'MP', angle: -30, tone: 'mid' as const },
    { label: 'CO', angle: 30, tone: 'mid' as const },
    { label: 'BTN', angle: 90, tone: 'wide' as const },
    { label: 'SB', angle: 150, tone: 'blind' as const },
    { label: 'BB', angle: 210, tone: 'blind' as const },
  ];
  const cx = 110;
  const cy = 90;
  const rx = 82;
  const ry = 58;
  const toneColor = (t: 'tight' | 'mid' | 'wide' | 'blind') =>
    t === 'tight'
      ? 'var(--color-raise)'
      : t === 'wide'
        ? 'var(--color-call)'
        : t === 'mid'
          ? 'var(--color-gold-cool)'
          : 'var(--color-fold)';

  return (
    <div>
      <div className="flex items-center justify-center">
        <svg width="220" height="180" viewBox="0 0 220 180" role="img" aria-label="6인 테이블 포지션">
          <ellipse cx={cx} cy={cy} rx={rx + 8} ry={ry + 8} fill="var(--color-noir)" />
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="var(--color-felt)" stroke="color-mix(in oklab, var(--color-gold) 20%, transparent)" />
          {seats.map((s) => {
            const rad = (s.angle * Math.PI) / 180;
            const x = cx + rx * Math.cos(rad);
            const y = cy + ry * Math.sin(rad);
            return (
              <g key={s.label}>
                <circle cx={x} cy={y} r={14} fill={toneColor(s.tone)} opacity={0.85} />
                <text
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--color-ivory)"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {s.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-4 flex justify-center gap-4 text-[11px] text-fg-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-raise)' }} />
          좁게 (UTG)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-call)' }} />
          넓게 (BTN)
        </span>
      </div>
    </div>
  );
}

function TermsGrid() {
  const terms = [
    {
      label: 'RFI',
      ko: '첫 레이즈',
      desc: '아무도 들어오지 않은 상태에서 처음 레이즈하는 것.',
    },
    {
      label: '3벳',
      ko: '리-레이즈',
      desc: '누군가 레이즈했을 때 다시 레이즈해서 판을 키우는 것.',
    },
    {
      label: '4벳',
      ko: '3벳에 리리레이즈',
      desc: '3벳에 또 레이즈.\n보통 매우 강한 패거나 블러프.',
    },
    {
      label: '팟 오즈',
      ko: '배당',
      desc: '내가 콜해야 할 금액 대비 팟 크기의 비율.\n승률 기준점.',
    },
  ];
  return (
    <ul className="space-y-2">
      {terms.map((t) => (
        <li
          key={t.label}
          className="flex gap-3 rounded-[var(--radius-button)] surface-raised px-3 py-2.5"
        >
          <span className="shrink-0 font-mono text-[13px] font-bold text-[color:var(--color-accent)] min-w-[44px]">
            {t.label}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-fg">{t.ko}</p>
            <p className="mt-0.5 whitespace-pre-line text-[12px] leading-[1.5] text-fg-muted">{t.desc}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function AppFlow() {
  const steps = [
    { n: '1', title: '매일 10핸드 퀴즈', body: 'GTO 감을 매일 조금씩 익혀요.\n하루 3~5분.' },
    { n: '2', title: '복습', body: '틀린 스팟만 모아 다시 풀기.\n약점 집중 공략.' },
    { n: '3', title: '실전에서 활용', body: '게임 중 GTO Today 켜두고 힌트를 얻어보세요.' },
  ];
  return (
    <ol className="space-y-2">
      {steps.map((s) => (
        <li key={s.n} className="flex gap-3 rounded-[var(--radius-button)] surface-raised px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-gradient font-mono text-[13px] font-bold text-noir">
            {s.n}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-fg">{s.title}</p>
            <p className="mt-0.5 whitespace-pre-line text-[12px] leading-[1.5] text-fg-muted">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Cta() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className="mt-10"
    >
      <Link
        href="/today"
        style={{ touchAction: 'manipulation' }}
        className="block w-full rounded-[var(--radius-button)] bg-gold-gradient py-4 text-center font-semibold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
      >
        오늘의 훈련 시작
      </Link>
      <p className="mt-3 text-center text-[12px] text-fg-muted">
        혹은{' '}
        <Link href="/" className="text-[color:var(--color-accent)] underline underline-offset-4">
          홈으로
        </Link>
      </p>
    </motion.div>
  );
}
