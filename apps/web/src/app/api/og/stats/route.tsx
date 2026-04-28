import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * Dynamic OG image for the /stats share. Different framing than the
 * daily card — leads with streak (the gamification hook) and shows
 * total hands + lifetime accuracy as supporting numbers.
 *
 * Query params:
 *   - streak: current consecutive-day count
 *   - best: best-ever streak
 *   - total: lifetime answer count
 *   - acc: lifetime accuracy 0-100
 *   - milestone: optional caption like "30-day streak"
 */
export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const streak = clampInt(searchParams.get('streak'), 0, 9999);
  const best = clampInt(searchParams.get('best'), 0, 9999);
  const total = clampInt(searchParams.get('total'), 0, 999999);
  const acc = clampInt(searchParams.get('acc'), 0, 100);
  const milestone = searchParams.get('milestone');

  const streakLabel = streak != null ? `${streak}` : '—';
  const eyebrow = milestone ? milestone : 'streak';

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
        {eyebrow}
      </div>

      {/* Big streak number */}
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
          {streakLabel}
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
          days in a row
        </div>
      </div>

      {/* Supporting numbers */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 32,
          paddingTop: 32,
          borderTop: '1px solid rgba(212, 175, 55, 0.25)',
        }}
      >
        <div style={{ display: 'flex', gap: 48 }}>
          {total != null && <Stat label="hands solved" value={total.toLocaleString()} />}
          {acc != null && <Stat label="accuracy" value={`${acc}%`} />}
          {best != null && best > 0 && <Stat label="best streak" value={`${best}d`} />}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          color: 'rgba(244, 239, 230, 0.5)',
          fontSize: 16,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: '#F4EFE6',
          fontSize: 30,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function clampInt(v: string | null, min: number, max: number): number | null {
  if (v == null) return null;
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return null;
  return Math.max(min, Math.min(max, n));
}
