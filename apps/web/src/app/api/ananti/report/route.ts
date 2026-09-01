import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRunner } from '@/lib/ananti-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 러너가 시도 결과를 보고한다.
//   ok=true  → BOOKED + folio/amount 기록
//   ok=false → attempts 증가 + lastError 기록 (상태는 WAITING 유지, 다음 tick에 재시도)
export async function POST(req: Request) {
  if (!checkRunner(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    ok?: boolean;
    folio?: string;
    amount?: number;
    error?: string;
  };
  if (!body.id) return NextResponse.json({ error: 'id 누락' }, { status: 400 });
  const row = await prisma.anantiRequest.findUnique({ where: { id: body.id } });
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const updated = await prisma.anantiRequest.update({
    where: { id: body.id },
    data: body.ok
      ? {
          status: 'BOOKED',
          folio: body.folio || null,
          amount: body.amount ?? null,
          lastError: null,
          lastTryAt: new Date(),
          attempts: { increment: 1 },
        }
      : {
          lastError: (body.error || '실패').slice(0, 300),
          lastTryAt: new Date(),
          attempts: { increment: 1 },
        },
  });
  return NextResponse.json({ ok: true, row: updated });
}
