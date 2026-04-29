import type { Metadata } from 'next';
import Image from 'next/image';
import { ShareSpotQuiz } from './quiz';

interface SharedSearchParams {
  /** Base64-encoded full spot payload (the friend renders THIS, not
   *  a regenerated daily-list lookup — so a spot stays stable even
   *  when the solver pool grows and shifts indices). */
  s?: string;
  /** Teaser fields used only for the OG unfurl card — never rendered
   *  on the page itself, so the recipient solves blind. */
  combo?: string;
  pos?: string;
  scenario?: string;
  opener?: string;
  board?: string;
}

interface PageProps {
  searchParams: Promise<SharedSearchParams>;
}

const SITE = 'https://gto.today';

function ogUrl(params: SharedSearchParams): string {
  const u = new URL(`${SITE}/api/og/spot`);
  // Only forward the teaser fields — d/i/g are page-internal locators
  // and shouldn't bloat the OG cache key.
  for (const k of ['combo', 'pos', 'scenario', 'opener', 'board'] as const) {
    const v = params[k];
    if (v != null) u.searchParams.set(k, v);
  }
  return u.toString();
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const combo = params.combo ?? '';
  const pos = params.pos ?? '';
  const headline = combo ? `${combo} 스팟 풀어볼래? · GTO Today` : 'GTO 스팟 풀어볼래? · GTO Today';
  const description = pos
    ? `${pos} 포지션. 친구가 공유한 스팟을 직접 풀어보세요.`
    : '친구가 공유한 GTO 스팟을 직접 풀어보세요.';
  const image = ogUrl(params);

  return {
    title: headline,
    description,
    openGraph: {
      title: headline,
      description,
      url: `${SITE}/share/spot`,
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

export default async function ShareSpotPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const encoded = params.s ?? '';

  return (
    <main className="safe-pad-x mx-auto flex min-h-dvh max-w-lg flex-col pb-12 pt-8">
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

      <div className="mt-8">
        {encoded ? (
          <ShareSpotQuiz encoded={encoded} />
        ) : (
          <div className="border-hair surface rounded-[var(--radius-panel)] px-5 py-6 text-center">
            <p className="text-fg-muted text-[13px]">유효하지 않은 스팟 링크입니다.</p>
            <a
              href="/today"
              className="bg-gold-gradient text-noir mt-5 inline-flex h-12 select-none items-center justify-center rounded-[var(--radius-button)] px-5 text-[14px] font-semibold"
            >
              오늘의 퀴즈 풀기 →
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
