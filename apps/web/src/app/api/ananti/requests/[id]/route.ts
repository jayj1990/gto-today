import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/ananti-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 요청 취소.
//   WAITING          → CANCELLED (그냥 요청 철회)
//   BOOKED           → CANCEL_REQUESTED (러너가 다음 tick에 아난티에서 실제 취소.
//                      미결제 결제대기 건만 자동 취소되고, 결제 완료 건이면 실패로 돌아온다)
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  const row = await prisma.anantiRequest.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: '요청을 찾을 수 없습니다.' }, { status: 404 });

  if (row.status === 'WAITING') {
    const updated = await prisma.anantiRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
    return NextResponse.json({ ok: true, row: updated, message: '요청을 취소했습니다.' });
  }
  if (row.status === 'BOOKED') {
    if (!row.folio)
      return NextResponse.json(
        { error: '예약번호가 없어 자동 취소할 수 없습니다.' },
        { status: 409 },
      );
    const updated = await prisma.anantiRequest.update({
      where: { id },
      data: { status: 'CANCEL_REQUESTED', lastError: null },
    });
    return NextResponse.json({
      ok: true,
      row: updated,
      message: '취소를 접수했습니다. 10분 안에 아난티에서 취소됩니다.',
    });
  }
  if (row.status === 'CANCEL_REQUESTED')
    return NextResponse.json({ error: '이미 취소 진행 중입니다.' }, { status: 409 });
  return NextResponse.json({ error: '취소할 수 없는 상태입니다.' }, { status: 409 });
}
