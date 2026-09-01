import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/ananti-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  const row = await prisma.anantiRequest.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: '요청을 찾을 수 없습니다.' }, { status: 404 });
  if (row.status === 'BOOKED') {
    return NextResponse.json(
      { error: '이미 예약된 건입니다. 아난티 마이페이지에서 취소해 주세요.' },
      { status: 409 },
    );
  }
  const updated = await prisma.anantiRequest.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });
  return NextResponse.json({ ok: true, row: updated });
}
