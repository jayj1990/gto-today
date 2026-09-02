import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/ananti-auth';
import { CATALOG, findRoom } from '@/lib/ananti-catalog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const config = await prisma.anantiConfig.findUnique({ where: { id: 1 } });
  return NextResponse.json({ config });
}

export async function PUT(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    sweepEnabled?: boolean;
    sweepPlatform?: string;
    sweepRooms?: string[];
  };
  const data: {
    sweepEnabled?: boolean;
    sweepPlatform?: string;
    sweepRoom?: string;
    sweepRooms?: string[];
  } = {};
  if (typeof body.sweepEnabled === 'boolean') data.sweepEnabled = body.sweepEnabled;
  if (body.sweepPlatform) {
    if (!CATALOG[body.sweepPlatform])
      return NextResponse.json({ error: '지점이 올바르지 않습니다.' }, { status: 400 });
    data.sweepPlatform = body.sweepPlatform;
  }
  if (Array.isArray(body.sweepRooms)) {
    const plat =
      data.sweepPlatform ||
      (await prisma.anantiConfig.findUnique({ where: { id: 1 } }))?.sweepPlatform ||
      'chord';
    for (const room of body.sweepRooms) {
      if (!findRoom(plat, room))
        return NextResponse.json({ error: `객실이 올바르지 않습니다: ${room}` }, { status: 400 });
    }
    data.sweepRooms = body.sweepRooms;
    // 구버전 호환 미러 — 러너/이전 코드가 sweepRoom 만 볼 때를 대비
    const first = body.sweepRooms[0];
    if (first) data.sweepRoom = first;
  }
  const config = await prisma.anantiConfig.update({ where: { id: 1 }, data });
  return NextResponse.json({ ok: true, config });
}
