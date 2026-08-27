import { NextResponse } from 'next/server';
import { writeDecisions } from '@/lib/proof-store';
import { getDoc, type Seg } from '@/app/proof/[token]/doc';

export const dynamic = 'force-dynamic';

/**
 * 교정지 결정 저장 — 공개 엔드포인트(토큰이 곧 권한).
 * 열린 쓰기 통로라 세 겹으로 막는다.
 *   1) 토큰이 doc.ts 에 없으면 404 — 추측한 토큰으로는 키가 생기지 않는다.
 *   2) 문서에 실제로 있는 수정 id 만 받는다 — 임의 키로 값을 부풀릴 수 없다.
 *   3) 값은 'a' | 'r' | 'c:<문구>' 만, 문구는 500자까지.
 * 마지막 저장이 이긴다. 동시에 둘이 만질 일이 사실상 없고, 있어도 새로고침이면 정리된다.
 */
const MAX_CUSTOM = 500;

function knownIds(token: string): Set<string> | null {
  const doc = getDoc(token);
  if (!doc) return null;
  const ids = new Set<string>();
  for (const s of doc.sections) {
    for (const b of s.blocks) {
      if (b.t === 'new') ids.add(b.id);
      else for (const g of b.seg as Seg[]) if ('id' in g) ids.add(g.id);
    }
    if (s.move) ids.add(s.move);
  }
  return ids;
}

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const ids = knownIds(token);
  if (!ids) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const body = (await req.json().catch(() => null)) as { dec?: Record<string, unknown> } | null;
  if (!body || typeof body.dec !== 'object' || body.dec === null) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const clean: Record<string, string> = {};
  for (const [k, raw] of Object.entries(body.dec)) {
    if (!ids.has(k) || typeof raw !== 'string') continue;
    if (raw === 'a' || raw === 'r') clean[k] = raw;
    else if (raw.startsWith('c:')) clean[k] = `c:${raw.slice(2, 2 + MAX_CUSTOM)}`;
  }

  const result = await writeDecisions(token, clean);
  if (result !== 'ok') {
    return NextResponse.json(
      { error: result === 'unconfigured' ? 'store_unconfigured' : 'save_failed' },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true, saved: Object.keys(clean).length });
}
