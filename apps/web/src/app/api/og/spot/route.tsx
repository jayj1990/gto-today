import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * Spot-share OG image. Shows position + hero combo + (optional) board
 * + the user's answer vs the GTO answer side by side.
 *
 * Query params:
 *   - combo: e.g. "AKs", "QQ", "76o" — 169 hand grid label
 *   - pos: hero position ("BB", "BTN", "CO", ...)
 *   - scenario: "rfi" | "vs_open" | "vs_3bet" | "flop" | …
 *   - opener: opener position when scenario starts with vs_
 *   - board: optional 3-5 card codes joined ("Ks7s2c") for postflop
 *   - me: user's answer label ("폴드", "콜", "레이즈 21bb", "체크", "벳 75%")
 *   - gto: GTO answer label
 *   - grade: "sharp" | "acceptable" | "wrong"
 */
export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const combo = searchParams.get('combo') ?? '??';
  const pos = searchParams.get('pos') ?? '';
  const scenario = searchParams.get('scenario') ?? '';
  const opener = searchParams.get('opener');
  const board = searchParams.get('board');
  const me = searchParams.get('me') ?? '—';
  const gto = searchParams.get('gto') ?? '—';
  const grade = (searchParams.get('grade') ?? 'wrong') as 'sharp' | 'acceptable' | 'wrong';

  const gradeLabel = grade === 'sharp' ? 'sharp' : grade === 'acceptable' ? 'acceptable' : 'miss';
  const gradeColor = grade === 'sharp' ? '#1F9D55' : grade === 'acceptable' ? '#4A9EFF' : '#C8102E';

  const scenarioLabel = scenarioLabelOf(scenario, pos, opener);
  const boardCards = board ? splitBoard(board) : null;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #082018 0%, #0E3B2E 55%, #051612 100%)',
        color: '#F4EFE6',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '64px 72px',
      }}
    >
      {/* Brand row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 14,
          color: '#D4AF37',
          fontSize: 26,
          letterSpacing: '0.08em',
          fontWeight: 700,
          textTransform: 'uppercase',
        }}
      >
        <span>GTO</span>
        <span style={{ color: '#D4AF37', fontSize: 34, lineHeight: 1 }}>·</span>
        <span style={{ color: '#F4EFE6', textTransform: 'lowercase', fontWeight: 500 }}>today</span>
      </div>

      {/* Eyebrow */}
      <div
        style={{
          marginTop: 28,
          color: 'rgba(244, 239, 230, 0.55)',
          fontSize: 20,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        {scenarioLabel || 'GTO drill'}
      </div>

      {/* Combo + board */}
      <div
        style={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 36,
        }}
      >
        <div
          style={{
            fontSize: 180,
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: '-0.03em',
            color: '#E8CC72',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {combo}
        </div>
        {boardCards && (
          <div
            style={{
              paddingBottom: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <span
              style={{
                color: 'rgba(244, 239, 230, 0.5)',
                fontSize: 16,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              board
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {boardCards.map((c, i) => (
                <BoardCard key={i} code={c} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Answer row */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          gap: 32,
          paddingTop: 32,
          borderTop: '1px solid rgba(212, 175, 55, 0.25)',
        }}
      >
        <AnswerBlock label="my answer" value={me} accent={gradeColor} grade={gradeLabel} />
        <AnswerBlock label="GTO" value={gto} accent="#D4AF37" />
        <div
          style={{
            marginLeft: 'auto',
            alignSelf: 'flex-end',
            color: 'rgba(212, 175, 55, 0.85)',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'lowercase',
          }}
        >
          gto.today
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}

function AnswerBlock({
  label,
  value,
  accent,
  grade,
}: {
  label: string;
  value: string;
  accent: string;
  grade?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 220 }}>
      <span
        style={{
          color: 'rgba(244, 239, 230, 0.5)',
          fontSize: 16,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        {label}
        {grade && (
          <span
            style={{
              marginLeft: 8,
              color: accent,
              fontSize: 14,
              letterSpacing: '0.18em',
            }}
          >
            · {grade}
          </span>
        )}
      </span>
      <span
        style={{
          color: accent,
          fontSize: 38,
          fontWeight: 700,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function BoardCard({ code }: { code: string }) {
  const rank = code.charAt(0);
  const suit = code.charAt(1);
  const suitColor =
    suit === 'h' ? '#D63B3B' : suit === 'd' ? '#2B6CB0' : suit === 'c' ? '#1F6F3F' : '#1A1A1F';
  const suitGlyph = suit === 'h' ? '♥' : suit === 'd' ? '♦' : suit === 'c' ? '♣' : '♠';
  return (
    <div
      style={{
        width: 56,
        height: 76,
        borderRadius: 6,
        background: '#F4EFE6',
        color: suitColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 30,
        lineHeight: 1,
        gap: 2,
      }}
    >
      <span>{rank}</span>
      <span style={{ fontSize: 22 }}>{suitGlyph}</span>
    </div>
  );
}

function splitBoard(b: string): string[] {
  // "Ks7s2c" -> ["Ks", "7s", "2c"]
  const out: string[] = [];
  for (let i = 0; i + 1 < b.length; i += 2) out.push(b.slice(i, i + 2));
  return out;
}

function scenarioLabelOf(s: string, pos: string, opener: string | null): string {
  if (!s) return pos;
  if (s === 'rfi') return `${pos} · RFI`;
  if (s === 'vs_open' && opener) return `${pos} vs ${opener} open`;
  if (s === 'vs_3bet' && opener) return `${pos} 3bet pot vs ${opener}`;
  if (s === 'vs_4bet') return `${pos} · 4bet pot`;
  if (s === 'vs_squeeze') return `${pos} · squeeze pot`;
  if (s === 'vs_allin') return `${pos} · facing allin`;
  if (s === 'flop') return `${pos} · flop`;
  if (s === 'turn') return `${pos} · turn`;
  if (s === 'river') return `${pos} · river`;
  return `${pos} · ${s}`;
}
