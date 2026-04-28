import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

interface SharedSearchParams {
  streak?: string;
  best?: string;
  total?: string;
  acc?: string;
  milestone?: string;
}

interface PageProps {
  searchParams: Promise<SharedSearchParams>;
}

const SITE = 'https://gto.today';

function ogUrl(params: SharedSearchParams): string {
  const u = new URL(`${SITE}/api/og/stats`);
  for (const [k, v] of Object.entries(params)) {
    if (v != null) u.searchParams.set(k, v);
  }
  return u.toString();
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const streak = params.streak ? Number(params.streak) : null;
  const milestone = params.milestone;
  const acc = params.acc ? Number(params.acc) : null;

  const headline = milestone
    ? `${milestone} · GTO Today`
    : streak != null
      ? `${streak}일 연속 GTO 훈련`
      : 'GTO Today 훈련 기록';
  const description =
    acc != null ? `누적 정확도 ${acc}% · 매일 10핸드 GTO 퀴즈.` : '매일 10핸드 GTO 퀴즈.';
  const image = ogUrl(params);

  return {
    title: headline,
    description,
    openGraph: {
      title: headline,
      description,
      url: `${SITE}/share/stats`,
      images: [{ url: image, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: headline,
      description,
      images: [image],
    },
  };
}

export default async function ShareStatsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const streak = params.streak ? Number(params.streak) : null;
  const best = params.best ? Number(params.best) : null;
  const total = params.total ? Number(params.total) : null;
  const acc = params.acc ? Number(params.acc) : null;
  const milestone = params.milestone;

  return (
    <main className="safe-pad-x mx-auto flex min-h-dvh max-w-lg flex-col justify-center pb-12 pt-12">
      <div className="flex items-center gap-2.5">
        <Image
          src="/logos/mark-g3-transparent.png"
          alt=""
          width={32}
          height={32}
          style={{ width: 32, height: 32, objectFit: 'contain' }}
        />
        <span className="font-mono text-[14px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-gold)]">
          GTO · today
        </span>
      </div>

      <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--color-accent)]">
        {milestone ?? '훈련 기록'}
      </p>
      <h1 className="font-display mt-3 flex items-baseline gap-3 text-[88px] font-bold tabular-nums leading-none tracking-[-0.03em] text-[color:var(--color-gold)]">
        {streak != null ? streak : '—'}
        <span className="text-fg-muted text-[16px] font-normal uppercase tracking-[0.2em]">
          일 연속
        </span>
      </h1>

      <div className="text-fg-muted mt-4 flex flex-wrap items-baseline gap-4 font-mono text-[13px] tabular-nums">
        {total != null && <span>누적 {total.toLocaleString()}핸드</span>}
        {acc != null && <span>정확도 {acc}%</span>}
        {best != null && best > 0 && <span>최장 {best}일</span>}
      </div>

      <div className="mt-12 grid gap-3">
        <Link
          href="/today"
          className="bg-gold-gradient text-noir flex h-14 select-none items-center justify-center rounded-[var(--radius-button)] font-semibold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
        >
          나도 시작하기
        </Link>
        <Link
          href="/learn/gto"
          className="border-hair surface flex h-12 select-none items-center justify-center rounded-[var(--radius-button)] text-[14px] font-medium active:scale-[0.98]"
        >
          GTO가 뭐예요? 1분 입문
        </Link>
      </div>
    </main>
  );
}
