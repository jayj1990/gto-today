import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/ananti-auth';
import { CATALOG, findRoom, kstNow, ymd } from '@/lib/ananti-catalog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const rows = await prisma.anantiRequest.findMany({
    orderBy: [{ stayDate: 'asc' }, { createdAt: 'asc' }],
    take: 200,
  });
  return NextResponse.json({ rows });
}

export async function POST(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    platform?: string;
    roomName?: string;
    stayDate?: string;
  };
  const { platform, roomName, stayDate } = body;
  if (!platform || !CATALOG[platform])
    return NextResponse.json({ error: '지점이 올바르지 않습니다.' }, { status: 400 });
  if (!roomName || !findRoom(platform, roomName))
    return NextResponse.json({ error: '객실이 올바르지 않습니다.' }, { status: 400 });
  if (!stayDate || !/^\d{8}$/.test(stayDate))
    return NextResponse.json({ error: '날짜 형식이 올바르지 않습니다.' }, { status: 400 });
  if (stayDate < ymd(kstNow()))
    return NextResponse.json({ error: '지난 날짜입니다.' }, { status: 400 });

  const existing = await prisma.anantiRequest.findUnique({
    where: { platform_roomName_stayDate: { platform, roomName, stayDate } },
  });
  if (existing && existing.status !== 'CANCELLED' && existing.status !== 'EXPIRED') {
    return NextResponse.json({ error: '같은 날짜·객실 요청이 이미 있습니다.' }, { status: 409 });
  }
  const row = existing
    ? await prisma.anantiRequest.update({
        where: { id: existing.id },
        data: {
          status: 'WAITING',
          source: 'manual',
          folio: null,
          amount: null,
          lastError: null,
          attempts: 0,
          lastTryAt: null,
        },
      })
    : await prisma.anantiRequest.create({
        data: { platform, roomName, stayDate, source: 'manual' },
      });
  return NextResponse.json({ ok: true, row });
}
