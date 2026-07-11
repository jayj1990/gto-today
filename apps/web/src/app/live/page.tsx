'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import type { TableFormat } from '@gto/poker-core';
import { useLiveStore, type GameType } from '@/lib/live-store';

/** Stack depths with a 9-max decision tree. 20/10BB collapse to
 *  jam-or-fold (Nash), 60/40BB swap in the depth-correct open ranges. */
const NINE_MAX_DEPTHS = [100, 60, 40, 20, 10];

/**
 * 실전 모드 setup. Game type is live (cash → TexasSolver qb_ranges,
 * MTT → heuristic-widened ranges approximating 1BB BB-ante). Table /
 * stack / open size are locked to what our solved dataset covers.
 */
export default function LiveSetupPage() {
  const config = useLiveStore((s) => s.config);
  const setGameType = useLiveStore((s) => s.setGameType);
  const setFormat = useLiveStore((s) => s.setFormat);
  const setStackBB = useLiveStore((s) => s.setStackBB);
  const format = config.format === '9max' ? '9max' : '6max';
  const depth =
    format === '9max' && NINE_MAX_DEPTHS.includes(config.stackBB as number)
      ? (config.stackBB as number)
      : 100;

  return (
    <>
      <SiteHeader />
      <main className="safe-pad-x mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col pb-[calc(env(safe-area-inset-bottom)+32px)] pt-8">
        <header>
          <Link href="/" className="text-fg-muted font-mono text-[11px] uppercase tracking-[0.2em]">
            ← 홈으로
          </Link>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
            실전 모드 · 설정
          </p>
          <h1 className="font-display mt-2 text-[30px] font-bold tracking-[-0.02em]">
            GTO 데이터 선택
          </h1>
          <p className="text-fg-muted mt-3 text-[13px]">
            6맥스·9맥스 100BB · 캐시(앤티 없음) 와 토너먼트(1BB 앤티) 지원. 추가 스택·오픈 사이즈는
            추후 업데이트.
          </p>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="mt-6 space-y-6"
        >
          <FieldSet label="게임 종류">
            <div className="grid grid-cols-2 gap-3">
              {(['cash', 'mtt'] as GameType[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setGameType(k)}
                  aria-pressed={config.gameType === k}
                  className={cn(
                    'rounded-[var(--radius-panel)] border p-4 text-left transition-colors active:scale-[0.99]',
                    config.gameType === k
                      ? 'bg-[color:var(--color-accent)]/10 border-[color:var(--color-accent)]'
                      : 'border-hair surface hover:bg-[color:var(--color-surface-raised)]',
                  )}
                >
                  <p className="font-display text-[18px] font-bold">
                    {k === 'cash' ? '캐시 게임' : '토너먼트'}
                  </p>
                  <p className="text-fg-muted mt-1 text-[12px]">
                    {k === 'cash' ? '앤티 없음 · NL cash 기준' : '1BB 앤티 · ChipEV (근사)'}
                  </p>
                </button>
              ))}
            </div>
          </FieldSet>

          <FieldSet label="테이블 인원">
            <div className="grid grid-cols-2 gap-3">
              {(['6max', '9max'] as TableFormat[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFormat(k)}
                  aria-pressed={format === k}
                  className={cn(
                    'rounded-[var(--radius-panel)] border p-4 text-left transition-colors active:scale-[0.99]',
                    format === k
                      ? 'bg-[color:var(--color-accent)]/10 border-[color:var(--color-accent)]'
                      : 'border-hair surface hover:bg-[color:var(--color-surface-raised)]',
                  )}
                >
                  <p className="font-display text-[18px] font-bold">
                    {k === '6max' ? '6맥스' : '9맥스'}
                  </p>
                  <p className="text-fg-muted mt-1 text-[12px]">
                    {k === '6max' ? '솔버 트리 원본' : '풀링 · 멀티웨이 라인 포함'}
                  </p>
                </button>
              ))}
            </div>
          </FieldSet>

          {format === '9max' ? (
            <FieldSet label="스택 뎁스">
              <div className="grid grid-cols-5 gap-1.5">
                {NINE_MAX_DEPTHS.map((d) => {
                  const active = depth === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setStackBB(d)}
                      aria-pressed={active}
                      aria-label={`${d}BB 스택`}
                      className={cn(
                        'flex h-12 flex-col items-center justify-center rounded-[var(--radius-button)] border font-mono transition-colors active:scale-[0.98]',
                        active
                          ? 'bg-[color:var(--color-accent)]/10 border-[color:var(--color-accent)] text-[color:var(--color-accent)]'
                          : 'border-hair surface text-fg-muted',
                      )}
                    >
                      <span className="text-[13px] font-semibold">{d}BB</span>
                      {d <= 20 && (
                        <span className="text-[9px] uppercase tracking-[0.12em] opacity-80">
                          올인
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </FieldSet>
          ) : (
            <InfoRow label="스택" value="100BB" locked />
          )}
          <InfoRow
            label="오픈 사이즈"
            value={depth <= 20 ? '올인 or 폴드' : '2.5x (SB 3x)'}
            locked
          />
          {config.gameType === 'mtt' ? (
            <InfoRow
              label="앤티"
              value="1BB (BB 앤티)"
              valueClass="text-[color:var(--color-accent)]"
            />
          ) : (
            <InfoRow label="앤티" value="없음" />
          )}
        </motion.section>

        <Link
          href="/live/play"
          className="bg-gold-gradient text-noir mt-10 inline-flex h-14 items-center justify-center rounded-[var(--radius-button)] text-center font-semibold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
          style={{ touchAction: 'manipulation' }}
        >
          실전 시작 →
        </Link>

        {config.gameType === 'mtt' && (
          <div className="border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/10 mt-4 rounded-[var(--radius-button)] border px-4 py-3 text-[12px] text-[color:var(--color-gold)]">
            토너먼트 데이터는 캐시 범위를 앤티 효과로 보정한 <strong>근사값</strong>이에요. 정확한
            ChipEV 솔브는 추후 업데이트.
          </div>
        )}

        {format === '9max' && (
          <div className="border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/10 mt-4 rounded-[var(--radius-button)] border px-4 py-3 text-[12px] text-[color:var(--color-gold)]">
            {depth <= 20 ? (
              <>
                {depth}BB는 <strong>올인 or 폴드</strong> Nash 차트 기반이에요. 올인을 맞은 콜
                레인지는 Nash 근사값.
              </>
            ) : (
              <>
                9맥스 트리는 6맥스 솔버 트리와 9맥스 오픈 레인지를 결합한 <strong>파생 근사</strong>
                예요. UTG+1·LJ·HJ는 인접 포지션 전략을 빌려옵니다.
              </>
            )}
          </div>
        )}

        <div className="border-[color:var(--color-info)]/40 bg-[color:var(--color-info)]/10 mt-4 rounded-[var(--radius-button)] border px-4 py-3 text-[12px] text-[color:var(--color-info)]">
          추후 업데이트: 다양한 스택 뎁스 (50BB / 200BB), 추가 오픈 사이즈 (2.25x / 3x), ICM 버블
          모드.
        </div>
      </main>
    </>
  );
}

function FieldSet({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-fg-muted mb-2 font-mono text-[11px] uppercase tracking-[0.18em]">
        {label}
      </p>
      {children}
    </section>
  );
}

function InfoRow({
  label,
  value,
  locked = false,
  valueClass,
}: {
  label: string;
  value: string;
  locked?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="border-hair surface flex items-center justify-between rounded-[var(--radius-button)] px-4 py-3">
      <div>
        <p className="text-fg-muted font-mono text-[10px] uppercase tracking-[0.18em]">{label}</p>
        <p className={cn('mt-0.5 font-mono text-[14px] font-semibold', valueClass ?? 'text-fg')}>
          {value}
        </p>
      </div>
      {locked && (
        <span className="text-fg-muted/70 font-mono text-[10px] uppercase tracking-[0.18em]">
          고정
        </span>
      )}
    </div>
  );
}
