'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { useLiveStore, type GameType } from '@/lib/live-store';
import type { TableFormat } from '@gto/poker-core';

type Step = 'game' | 'table' | 'details' | 'review';

const STEP_TITLES: Record<Step, string> = {
  game: '어떤 게임인가요',
  table: '테이블 설정',
  details: '세부 설정',
  review: '확인',
};

const STEP_ORDER: Step[] = ['game', 'table', 'details', 'review'];

/**
 * Live-mode setup wizard — 4-step progressive disclosure instead of one
 * intimidating form. Each step captures the minimum decision; the "세부
 * 설정" screen swaps its body based on Cash vs MTT so we never show
 * irrelevant fields (no ICM slider for cash, no rake slider for MTT).
 */
export default function LiveSetupPage() {
  const [step, setStep] = useState<Step>('game');
  const config = useLiveStore((s) => s.config);
  const { setGameType, setFormat, setStackBB, setOpenSize, setCash, setMtt } = useLiveStore();

  const stepIdx = STEP_ORDER.indexOf(step);
  const next = () => {
    const nextStep = STEP_ORDER[stepIdx + 1];
    if (nextStep) setStep(nextStep);
  };
  const prev = () => {
    const prevStep = STEP_ORDER[stepIdx - 1];
    if (prevStep) setStep(prevStep);
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+32px)] pt-8">
        <header>
          <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted">
            ← 홈으로
          </Link>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
            실전 모드 · {stepIdx + 1} / {STEP_ORDER.length}
          </p>
          <h1 className="mt-2 font-display text-[32px] font-bold tracking-[-0.02em]">
            {STEP_TITLES[step]}
          </h1>
          <ul className="mt-4 flex gap-1.5">
            {STEP_ORDER.map((s, i) => (
              <li
                key={s}
                className={cn(
                  'h-1 flex-1 rounded-full',
                  i <= stepIdx
                    ? 'bg-[color:var(--color-accent)]'
                    : 'bg-[color:var(--color-border)]',
                )}
              />
            ))}
          </ul>
        </header>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-8 flex-1"
        >
          {step === 'game' && (
            <GameStep
              value={config.gameType}
              onChange={(v) => {
                setGameType(v);
                next();
              }}
            />
          )}

          {step === 'table' && (
            <TableStep
              format={config.format}
              stackBB={config.stackBB}
              openSize={config.openSize}
              onFormat={setFormat}
              onStack={setStackBB}
              onOpenSize={setOpenSize}
            />
          )}

          {step === 'details' && config.gameType === 'cash' && (
            <CashDetailStep
              rakePct={config.cash.rakePct}
              rakeCapBB={config.cash.rakeCapBB}
              ante={config.cash.ante}
              onChange={setCash}
            />
          )}

          {step === 'details' && config.gameType === 'mtt' && (
            <MttDetailStep
              anteBB={config.mtt.anteBB}
              icmAwareness={config.mtt.icmAwareness}
              bubbleFactor={config.mtt.bubbleFactor}
              onChange={setMtt}
            />
          )}

          {step === 'review' && <ReviewStep />}
        </motion.div>

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {stepIdx > 0 && (
            <button
              type="button"
              onClick={prev}
              className="h-12 flex-1 rounded-[var(--radius-button)] border-hair surface-raised font-medium active:scale-[0.98]"
            >
              이전
            </button>
          )}
          {step === 'review' ? (
            <Link
              href="/live/play"
              className="flex h-12 flex-[2] items-center justify-center rounded-[var(--radius-button)] bg-gold-gradient font-semibold text-noir shadow-[var(--shadow-card)] active:scale-[0.98]"
            >
              실전 시작 →
            </Link>
          ) : step !== 'game' ? (
            <button
              type="button"
              onClick={next}
              className="h-12 flex-[2] rounded-[var(--radius-button)] bg-gold-gradient font-semibold text-noir shadow-[var(--shadow-card)] active:scale-[0.98]"
            >
              다음
            </button>
          ) : null}
        </div>
      </main>
    </>
  );
}

/* ─── STEPS ─────────────────────────────────────────────────────────── */

function GameStep({
  value,
  onChange,
}: {
  value: GameType;
  onChange: (v: GameType) => void;
}) {
  const options: { key: GameType; title: string; desc: string }[] = [
    { key: 'cash', title: '캐시 게임', desc: '홈게임·온라인 캐시. 스택 깊고 ICM 없음.' },
    { key: 'mtt', title: '토너먼트', desc: 'MTT·SnG. 앤티·ICM 반영 가능.' },
  ];
  return (
    <ul className="grid gap-3">
      {options.map((opt) => (
        <li key={opt.key}>
          <button
            type="button"
            onClick={() => onChange(opt.key)}
            className={cn(
              'w-full rounded-[var(--radius-panel)] border p-5 text-left transition-colors active:scale-[0.99]',
              value === opt.key
                ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10'
                : 'border-hair surface hover:bg-[color:var(--color-surface-raised)]',
            )}
          >
            <p className="font-display text-[20px] font-bold">{opt.title}</p>
            <p className="mt-1 text-[13px] text-fg-muted">{opt.desc}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}

function TableStep({
  format,
  stackBB,
  openSize,
  onFormat,
  onStack,
  onOpenSize,
}: {
  format: TableFormat;
  stackBB: number;
  openSize: number;
  onFormat: (v: TableFormat) => void;
  onStack: (v: number) => void;
  onOpenSize: (v: number) => void;
}) {
  const formats: TableFormat[] = ['6max', '9max', '10max', '11max'];
  const stacks = [25, 50, 75, 100, 150, 200];
  const sizes = [2, 2.25, 2.5, 3];
  return (
    <div className="space-y-6">
      <FieldSet label="테이블 크기">
        <ChipRow>
          {formats.map((f) => (
            <Chip key={f} active={format === f} onClick={() => onFormat(f)}>
              {f === '6max' ? '6맥스' : f === '9max' ? '9맥스' : f === '10max' ? '10맥스' : '11맥스'}
            </Chip>
          ))}
        </ChipRow>
      </FieldSet>
      <FieldSet label="스택 (BB)">
        <ChipRow>
          {stacks.map((s) => (
            <Chip key={s} active={stackBB === s} onClick={() => onStack(s)}>
              {s}BB
            </Chip>
          ))}
        </ChipRow>
      </FieldSet>
      <FieldSet label="오픈 사이즈 (BB)">
        <ChipRow>
          {sizes.map((s) => (
            <Chip key={s} active={openSize === s} onClick={() => onOpenSize(s)}>
              {s}x
            </Chip>
          ))}
        </ChipRow>
      </FieldSet>
    </div>
  );
}

function CashDetailStep({
  rakePct,
  rakeCapBB,
  ante,
  onChange,
}: {
  rakePct: number;
  rakeCapBB: number;
  ante: 'none' | 'bb-ante' | 'straddle';
  onChange: (u: Partial<{ rakePct: number; rakeCapBB: number; ante: 'none' | 'bb-ante' | 'straddle' }>) => void;
}) {
  return (
    <div className="space-y-6">
      <FieldSet label="레이크 비율" hint="일반 온라인 5%, 라이브 홈게임 2~3%">
        <ChipRow>
          {[0, 0.025, 0.05, 0.075].map((p) => (
            <Chip key={p} active={Math.abs(rakePct - p) < 0.001} onClick={() => onChange({ rakePct: p })}>
              {p === 0 ? '무레이크' : `${(p * 100).toFixed(1)}%`}
            </Chip>
          ))}
        </ChipRow>
      </FieldSet>
      <FieldSet label="레이크 캡 (BB)" hint="팟이 아무리 커도 이 한도까지만 레이크">
        <ChipRow>
          {[0, 2, 3, 5].map((c) => (
            <Chip key={c} active={rakeCapBB === c} onClick={() => onChange({ rakeCapBB: c })}>
              {c === 0 ? '없음' : `${c}BB`}
            </Chip>
          ))}
        </ChipRow>
      </FieldSet>
      <FieldSet label="블라인드 구조">
        <ChipRow>
          <Chip active={ante === 'none'} onClick={() => onChange({ ante: 'none' })}>
            일반 (SB/BB)
          </Chip>
          <Chip active={ante === 'bb-ante'} onClick={() => onChange({ ante: 'bb-ante' })}>
            BB 앤티
          </Chip>
          <Chip active={ante === 'straddle'} onClick={() => onChange({ ante: 'straddle' })}>
            스트래들
          </Chip>
        </ChipRow>
      </FieldSet>
    </div>
  );
}

function MttDetailStep({
  anteBB,
  icmAwareness,
  bubbleFactor,
  onChange,
}: {
  anteBB: number;
  icmAwareness: boolean;
  bubbleFactor: number;
  onChange: (u: Partial<{ anteBB: number; icmAwareness: boolean; bubbleFactor: number }>) => void;
}) {
  return (
    <div className="space-y-6">
      <FieldSet label="앤티 구조" hint="BB 앤티는 매 핸드 BB 자리가 전원분 앤티 대납">
        <ChipRow>
          {[0, 0.125, 0.25, 0.5].map((a) => (
            <Chip key={a} active={anteBB === a} onClick={() => onChange({ anteBB: a })}>
              {a === 0 ? '없음' : `${a}BB`}
            </Chip>
          ))}
        </ChipRow>
      </FieldSet>
      <FieldSet label="ICM 인식" hint="버블·파이널 테이블에서 생존 가치 반영">
        <ChipRow>
          <Chip active={!icmAwareness} onClick={() => onChange({ icmAwareness: false })}>
            Chip EV (꺼짐)
          </Chip>
          <Chip active={icmAwareness} onClick={() => onChange({ icmAwareness: true })}>
            ICM 인식
          </Chip>
        </ChipRow>
      </FieldSet>
      {icmAwareness && (
        <FieldSet label="버블 강도" hint="1.0 = 평상, 숫자 커질수록 더 타이트">
          <ChipRow>
            {[1, 1.15, 1.3, 1.5].map((b) => (
              <Chip
                key={b}
                active={Math.abs(bubbleFactor - b) < 0.001}
                onClick={() => onChange({ bubbleFactor: b })}
              >
                {b === 1 ? '평상' : `×${b.toFixed(2)}`}
              </Chip>
            ))}
          </ChipRow>
        </FieldSet>
      )}
    </div>
  );
}

function ReviewStep() {
  const config = useLiveStore((s) => s.config);
  const gameLabel = config.gameType === 'cash' ? '캐시 게임' : '토너먼트';
  return (
    <div className="rounded-[var(--radius-panel)] border-hair surface p-5">
      <dl className="grid grid-cols-2 gap-4 text-[14px]">
        <Review label="게임 종류" value={gameLabel} />
        <Review
          label="테이블"
          value={config.format === '6max' ? '6맥스' : `${config.format.replace('max', '')}맥스`}
        />
        <Review label="스택" value={`${config.stackBB}BB`} />
        <Review label="오픈 사이즈" value={`${config.openSize}x`} />
        {config.gameType === 'cash' ? (
          <>
            <Review label="레이크" value={`${(config.cash.rakePct * 100).toFixed(1)}%`} />
            <Review
              label="레이크 캡"
              value={config.cash.rakeCapBB === 0 ? '없음' : `${config.cash.rakeCapBB}BB`}
            />
            <Review
              label="블라인드"
              value={
                config.cash.ante === 'none'
                  ? '일반'
                  : config.cash.ante === 'bb-ante'
                    ? 'BB 앤티'
                    : '스트래들'
              }
            />
          </>
        ) : (
          <>
            <Review
              label="앤티"
              value={config.mtt.anteBB === 0 ? '없음' : `${config.mtt.anteBB}BB`}
            />
            <Review
              label="ICM"
              value={config.mtt.icmAwareness ? `×${config.mtt.bubbleFactor.toFixed(2)}` : 'Chip EV'}
            />
          </>
        )}
      </dl>
      <p className="mt-6 rounded-[var(--radius-button)] border border-[color:var(--color-warning)]/40 bg-[color:var(--color-warning)]/10 p-3 text-[12px] text-[color:var(--color-warning)]">
        ⚠ 실전 플레이 화면은 다음 버전에서 활성화됩니다. 지금은 설정이 저장되고 /today, /sim
        훈련에 반영됩니다.
      </p>
    </div>
  );
}

/* ─── ATOMS ─────────────────────────────────────────────────────────── */

function FieldSet({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
        {label}
      </p>
      {children}
      {hint && <p className="mt-2 text-[12px] text-fg-muted/80">{hint}</p>}
    </section>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ touchAction: 'manipulation' }}
      className={cn(
        'select-none rounded-full border px-3 py-1.5 font-mono text-[12px] tracking-[0.04em] active:scale-[0.96]',
        active
          ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-noir font-semibold'
          : 'border-[color:var(--color-border)] bg-[color:var(--color-surface-raised)] text-fg-muted',
      )}
    >
      {children}
    </button>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">
        {label}
      </dt>
      <dd className="mt-0.5 font-mono text-[14px] font-semibold text-fg">{value}</dd>
    </div>
  );
}
