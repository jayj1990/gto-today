import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * Dynamic OG image for "today's GTO training complete" shares.
 * Embedded by /share/daily as `og:image` so KakaoTalk / Twitter / etc.
 * render a real preview card instead of a generic site link.
 *
 * Query params (all optional):
 *   - acc: integer accuracy 0-100
 *   - streak: integer streak days
 *   - sharp / acceptable / wrong: per-grade counts
 *
 * English-text-only by design — Korean glyph rendering at edge runtime
 * needs a Pretendard binary embed which doubles the route's cold-start
 * size for marginal gain. KakaoTalk preview cards do fine with English.
 */
export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const acc = clampInt(searchParams.get('acc'), 0, 100);
  const streak = clampInt(searchParams.get('streak'), 0, 9999);
  const sharp = clampInt(searchParams.get('sharp'), 0, 9999);
  const acceptable = clampInt(searchParams.get('acceptable'), 0, 9999);
  const wrong = clampInt(searchParams.get('wrong'), 0, 9999);

  const accLabel = acc != null ? `${acc}%` : '—';
  const streakLabel = streak != null && streak > 0 ? `${streak}-day streak` : 'fresh start';
  const breakdown =
    sharp != null || acceptable != null || wrong != null
      ? `${sharp ?? 0} sharp · ${acceptable ?? 0} ok · ${wrong ?? 0} miss`
      : null;

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
        position: 'relative',
      }}
    >
      {/* Brand row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 14,
          color: '#D4AF37',
          fontSize: 28,
          letterSpacing: '0.08em',
          fontWeight: 700,
          textTransform: 'uppercase',
        }}
      >
        <span>GTO</span>
        <span style={{ color: '#D4AF37', fontSize: 36, lineHeight: 1 }}>·</span>
        <span style={{ color: '#F4EFE6', textTransform: 'lowercase', fontWeight: 500 }}>today</span>
      </div>

      {/* Eyebrow */}
      <div
        style={{
          marginTop: 40,
          color: 'rgba(244, 239, 230, 0.55)',
          fontSize: 22,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        today&apos;s training
      </div>

      {/* Big accuracy */}
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 24,
        }}
      >
        <div
          style={{
            fontSize: 240,
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            color: '#E8CC72',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {accLabel}
        </div>
        <div
          style={{
            fontSize: 28,
            color: 'rgba(244, 239, 230, 0.55)',
            paddingBottom: 28,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          accuracy
        </div>
      </div>

      {/* Streak + breakdown */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 24,
          paddingTop: 32,
          borderTop: '1px solid rgba(212, 175, 55, 0.25)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              color: 'rgba(244, 239, 230, 0.5)',
              fontSize: 18,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
            }}
          >
            {streakLabel}
          </span>
          {breakdown && (
            <span
              style={{
                color: 'rgba(244, 239, 230, 0.7)',
                fontSize: 20,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {breakdown}
            </span>
          )}
        </div>
        <div
          style={{
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

function clampInt(v: string | null, min: number, max: number): number | null {
  if (v == null) return null;
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return null;
  return Math.max(min, Math.min(max, n));
}
