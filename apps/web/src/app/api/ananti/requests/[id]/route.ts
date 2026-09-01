import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/ananti-auth';
import { kstNow, ymd } from '@/lib/ananti-catalog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 요청 취소.
//   WAITING        → CANCELLED (요청 철회, 되돌리기 가능)
//   BOOKED         → CANCEL_PENDING + cancelAt(+5분). 유예가 지나면 러너가
//                    아난티에서 실제 취소한다. 유예 중엔 되돌리기 가능.
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
      data: {
        status: 'CANCEL_PENDING',
        cancelAt: new Date(Date.now() + 5 * 60_000),
        lastError: null,
      },
    });
    return NextResponse.json({
      ok: true,
      row: updated,
      message: '5분 뒤 아난티에서 취소됩니다. 그 전엔 되돌릴 수 있어요.',
    });
  }
  if (row.status === 'CANCEL_PENDING' || row.status === 'CANCEL_REQUESTED')
    return NextResponse.json({ error: '이미 취소 대기 중입니다.' }, { status: 409 });
  return NextResponse.json({ error: '취소할 수 없는 상태입니다.' }, { status: 409 });
}

// 되돌리기.
//   CANCEL_PENDING → BOOKED (유예 중 취소 철회)
//   CANCELLED      → WAITING (요청 다시 살리기, 지난 날짜는 불가)
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  const row = await prisma.anantiRequest.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: '요청을 찾을 수 없습니다.' }, { status: 404 });

  if (row.status === 'CANCEL_PENDING') {
    const updated = await prisma.anantiRequest.update({
      where: { id },
      data: { status: 'BOOKED', cancelAt: null },
    });
    return NextResponse.json({
      ok: true,
      row: updated,
      message: '취소를 되돌렸습니다. 예약은 그대로 유지됩니다.',
    });
  }
  if (row.status === 'CANCELLED') {
    if (row.stayDate < ymd(kstNow()))
      return NextResponse.json({ error: '지난 날짜라 되돌릴 수 없습니다.' }, { status: 400 });
    const updated = await prisma.anantiRequest.update({
      where: { id },
      data: { status: 'WAITING', lastError: null },
    });
    return NextResponse.json({ ok: true, row: updated, message: '요청을 되살렸습니다.' });
  }
  return NextResponse.json({ error: '되돌릴 수 없는 상태입니다.' }, { status: 409 });
}
