import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

interface SharedSearchParams {
  combo?: string;
  pos?: string;
  scenario?: string;
  opener?: string;
  board?: string;
  me?: string;
  gto?: string;
  grade?: string;
}

interface PageProps {
  searchParams: Promise<SharedSearchParams>;
}

const SITE = 'https://gto.today';

function ogUrl(params: SharedSearchParams): string {
  const u = new URL(`${SITE}/api/og/spot`);
  for (const [k, v] of Object.entries(params)) {
    if (v != null) u.searchParams.set(k, v);
  }
  return u.toString();
}

function gradeColor(grade?: string): string {
  if (grade === 'sharp') return 'var(--color-call)';
  if (grade === 'acceptable') return 'var(--color-info)';
  return 'var(--color-raise)';
}

function gradeKR(grade?: string): string {
  if (grade === 'sharp') return '정확';
  if (grade === 'acceptable') return '괜찮음';
  return '오답';
}

function scenarioKR(s: string | undefined, pos: string | undefined, opener: string | null): string {
  if (!s) return pos ?? '';
  if (s === 'rfi') return `${pos} RFI`;
  if (s === 'vs_open' && opener) return `${pos} vs ${opener} 오픈`;
  if (s === 'vs_3bet' && opener) return `${pos} 3벳 vs ${opener}`;
  if (s === 'vs_4bet') return `${pos} 4벳 디펜스`;
  if (s === 'vs_squeeze') return `${pos} 스퀴즈 받음`;
  if (s === 'vs_allin') return `${pos} 올인 직면`;
  if (s === 'flop') return `${pos} 플랍`;
  if (s === 'turn') return `${pos} 턴`;
  if (s === 'river') return `${pos} 리버`;
  return `${pos} · ${s}`;
}

function splitBoard(b: string): string[] {
  const out: string[] = [];
  for (let i = 0; i + 1 < b.length; i += 2) out.push(b.slice(i, i + 2));
  return out;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const combo = params.combo ?? '';
  const pos = params.pos ?? '';
  const grade = params.grade;
  const headline = combo ? `${combo} 스팟 풀어볼래? · GTO Today` : 'GTO 스팟 풀어볼래? · GTO Today';
  const description = pos
    ? `${pos} 포지션. ${gradeKR(grade)}이라고 답했어요.`
    : 'GTO Today 퀴즈 풀어보세요.';
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
  const combo = params.combo ?? '??';
  const pos = params.pos ?? '';
  const scenario = params.scenario;
  const opener = params.opener ?? null;
  const board = params.board ? splitBoard(params.board) : null;
  const me = params.me;
  const gto = params.gto;
  const grade = params.grade;

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
        {scenarioKR(scenario, pos, opener)}
      </p>

      <h1 className="font-display mt-3 text-[88px] font-bold tabular-nums leading-none tracking-[-0.03em] text-[color:var(--color-gold)]">
        {combo}
      </h1>

      {board && (
        <div className="mt-6">
          <p className="text-fg-muted mb-2 font-mono text-[10px] uppercase tracking-[0.22em]">
            board
          </p>
          <div className="flex gap-1.5">
            {board.map((c, i) => (
              <BoardCardKR key={i} code={c} />
            ))}
          </div>
        </div>
      )}

      {(me || gto) && (
        <dl className="border-hair surface mt-8 grid grid-cols-2 overflow-hidden rounded-[var(--radius-panel)]">
          <div className="border-r border-[color:var(--color-border)] px-5 py-4">
            <dt className="text-fg-muted font-mono text-[10px] uppercase tracking-[0.22em]">
              내 답
            </dt>
            <dd
              className="font-display mt-1 text-[18px] font-bold"
              style={{ color: gradeColor(grade) }}
            >
              {me ?? '—'}
            </dd>
            {grade && (
              <p
                className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{ color: gradeColor(grade) }}
              >
                {gradeKR(grade)}
              </p>
            )}
          </div>
          <div className="px-5 py-4">
            <dt className="text-fg-muted font-mono text-[10px] uppercase tracking-[0.22em]">GTO</dt>
            <dd className="font-display mt-1 text-[18px] font-bold text-[color:var(--color-gold)]">
              {gto ?? '—'}
            </dd>
          </div>
        </dl>
      )}

      <div className="mt-12 grid gap-3">
        <Link
          href="/today"
          className="bg-gold-gradient text-noir flex h-14 select-none items-center justify-center rounded-[var(--radius-button)] font-semibold shadow-[var(--shadow-card)] ring-1 ring-inset ring-[color:var(--color-gold-deep)] active:scale-[0.98]"
        >
          나도 도전 — 오늘의 퀴즈 풀기
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

function BoardCardKR({ code }: { code: string }) {
  const rank = code.charAt(0);
  const suit = code.charAt(1);
  const suitColor =
    suit === 'h' ? '#D63B3B' : suit === 'd' ? '#2B6CB0' : suit === 'c' ? '#1F6F3F' : '#1A1A1F';
  const glyph = suit === 'h' ? '♥' : suit === 'd' ? '♦' : suit === 'c' ? '♣' : '♠';
  return (
    <div
      className="flex h-14 w-10 flex-col items-center justify-center rounded-md bg-[color:var(--color-cream)] font-bold"
      style={{ color: suitColor, lineHeight: 1 }}
    >
      <span className="text-[16px]">{rank}</span>
      <span className="mt-0.5 text-[12px]">{glyph}</span>
    </div>
  );
}
