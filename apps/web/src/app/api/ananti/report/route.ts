import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRunner } from '@/lib/ananti-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 러너가 처리 결과를 보고한다.
//   기본(예약 시도): ok=true → BOOKED / ok=false → attempts+1, lastError, WAITING 유지
//   action='cancel': ok=true → CANCELLED / ok=false → BOOKED 복귀 + lastError
//     (실패 시 BOOKED 로 되돌려야 tick 마다 무한 재시도하지 않는다)
export async function POST(req: Request) {
  if (!checkRunner(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    action?: string;
    ok?: boolean;
    folio?: string;
    amount?: number;
    error?: string;
  };
  if (!body.id) return NextResponse.json({ error: 'id 누락' }, { status: 400 });
  const row = await prisma.anantiRequest.findUnique({ where: { id: body.id } });
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });

  let data;
  if (body.action === 'cancel') {
    data = body.ok
      ? { status: 'CANCELLED', lastError: null, lastTryAt: new Date() }
      : {
          status: 'BOOKED',
          lastError: (body.error || '취소 실패').slice(0, 300),
          lastTryAt: new Date(),
        };
  } else {
    data = body.ok
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
        };
  }
  const updated = await prisma.anantiRequest.update({ where: { id: body.id }, data });
  return NextResponse.json({ ok: true, row: updated });
}
