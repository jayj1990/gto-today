'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@gto/ui';
import { SiteHeader } from '@/components/site-header';
import { useLiveStore, type GameType } from '@/lib/live-store';

/**
 * 실전 모드 setup. Scope is constrained to what TexasSolver 0.2
 * bundles for us, so every field below is locked except the game
 * type (cash vs MTT — we map both to the same data today since the
 * underlying ranges are identical at 6max 100BB).
 */
export default function LiveSetupPage() {
  const config = useLiveStore((s) => s.config);
  const setGameType = useLiveStore((s) => s.setGameType);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col safe-pad-x pb-[calc(env(safe-area-inset-bottom)+32px)] pt-8">
        <header>
          <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted">
            ← 홈으로
          </Link>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
            실전 모드 · 설정
          </p>
          <h1 className="mt-2 font-display text-[30px] font-bold tracking-[-0.02em]">
            솔버 데이터 선택
          </h1>
          <p className="mt-3 text-[13px] text-fg-muted">
            TexasSolver 0.2가 제공하는 범위로 고정. 추가 스택·오픈 사이즈·앤티 지원은 향후 솔버 데이터 확장되면 열립니다.
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
                  className={cn(
                    'rounded-[var(--radius-panel)] border p-4 text-left transition-colors active:scale-[0.99]',
                    config.gameType === k
                      ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10'
                      : 'border-hair surface hover:bg-[color:var(--color-surface-raised)]',
                  )}
                >
                  <p className="font-display text-[18px] font-bold">
                    {k === 'cash' ? '캐시 게임' : '토너먼트'}
                  </p>
                  <p className="mt-1 text-[12px] text-fg-muted">
                    {k === 'cash' ? 'NL200 · 500 rake' : 'MTT 100BB 기준'}
                  </p>
                </button>
              ))}
            </div>
          </FieldSet>

          <InfoRow label="테이블" value="6맥스 (솔버 범위)" locked />
          <InfoRow label="스택" value="100BB" locked />
          <InfoRow label="오픈 사이즈" value="2.5x (SB 3x)" locked />
          <InfoRow
            label="데이터 출처"
            value="TexasSolver 0.2"
            valueClass="text-[color:var(--color-call)]"
          />
        </motion.section>

        <Link
          href="/live/play"
          className="mt-10 inline-flex h-14 items-center justify-center rounded-[var(--radius-button)] bg-gold-gradient text-center font-semibold text-noir shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
          style={{ touchAction: 'manipulation' }}
        >
          실전 시작 →
        </Link>

        <div className="mt-4 rounded-[var(--radius-button)] border border-[color:var(--color-info)]/40 bg-[color:var(--color-info)]/10 px-4 py-3 text-[12px] text-[color:var(--color-info)]">
          향후 확장 예정: 다양한 스택 뎁스 (50BB / 200BB), 추가 오픈 사이즈 (2.25x / 3x), ICM 버블 모드. TexasSolver로 솔빙 후 추가됩니다.
        </div>
      </main>
    </>
  );
}

function FieldSet({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
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
    <div className="flex items-center justify-between rounded-[var(--radius-button)] border-hair surface px-4 py-3">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
          {label}
        </p>
        <p className={cn('mt-0.5 font-mono text-[14px] font-semibold', valueClass ?? 'text-fg')}>
          {value}
        </p>
      </div>
      {locked && (
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted/70">
          고정
        </span>
      )}
    </div>
  );
}
