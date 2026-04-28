import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

interface SharedSearchParams {
  acc?: string;
  streak?: string;
  sharp?: string;
  acceptable?: string;
  wrong?: string;
}

interface PageProps {
  searchParams: Promise<SharedSearchParams>;
}

const SITE = 'https://gto.today';

/**
 * Build the og:image URL from the same query params we received,
 * forwarded to /api/og/daily. Keeps the OG card in lock-step with
 * whatever the share button computed.
 */
function ogUrl(params: SharedSearchParams): string {
  const u = new URL(`${SITE}/api/og/daily`);
  for (const [k, v] of Object.entries(params)) {
    if (v != null) u.searchParams.set(k, v);
  }
  return u.toString();
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const acc = params.acc ? Number(params.acc) : null;
  const streak = params.streak ? Number(params.streak) : null;
  const accuracyText = acc != null ? `${acc}%` : '—';
  const streakText = streak != null && streak > 0 ? ` · ${streak}일 연속` : '';

  const title = `오늘 정확도 ${accuracyText}${streakText} · GTO Today`;
  const description = '매일 새로 공개되는 10핸드 GTO 퀴즈. 하루 5분.';
  const image = ogUrl(params);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE}/share/daily`,
      images: [{ url: image, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

/**
 * Share landing — what a friend sees after tapping the shared link.
 * Renders a simple preview of the same metric block + CTA into the
 * actual training. The OG meta drives the unfurled card in
 * KakaoTalk / Twitter.
 */
export default async function ShareDailyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const acc = params.acc ? Number(params.acc) : null;
  const streak = params.streak ? Number(params.streak) : null;
  const sharp = params.sharp ? Number(params.sharp) : null;
  const acceptable = params.acceptable ? Number(params.acceptable) : null;
  const wrong = params.wrong ? Number(params.wrong) : null;

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
        오늘의 훈련 결과
      </p>
      <h1 className="font-display mt-3 flex items-baseline gap-3 text-[88px] font-bold tabular-nums leading-none tracking-[-0.03em] text-[color:var(--color-gold)]">
        {acc != null ? `${acc}%` : '—'}
        <span className="text-fg-muted text-[16px] font-normal uppercase tracking-[0.2em]">
          정확도
        </span>
      </h1>

      {(sharp != null || acceptable != null || wrong != null) && (
        <p className="text-fg-muted mt-4 font-mono text-[13px] tabular-nums">
          정답 {sharp ?? 0} · 차선 {acceptable ?? 0} · 오답 {wrong ?? 0}
        </p>
      )}

      {streak != null && streak > 0 && (
        <p className="text-fg mt-2 font-mono text-[13px]">{streak}일 연속 훈련</p>
      )}

      <div className="mt-12 grid gap-3">
        <Link
          href="/today"
          className="bg-gold-gradient text-noir flex h-14 select-none items-center justify-center rounded-[var(--radius-button)] font-semibold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
        >
          나도 풀어보기
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
