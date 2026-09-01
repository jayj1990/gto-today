import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/ananti-auth';
import { CATALOG, findRoom, kstNow, parseYmd, ymd } from '@/lib/ananti-catalog';

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

// 단일 날짜 또는 기간 등록. endDate(체크아웃)를 주면 [stayDate, endDate) 각 밤을
// 1박짜리 요청으로 전부 만든다 — 되는 날만 잡히고, 결제는 필요한 날만 하면 되는 구조.
export async function POST(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    platform?: string;
    roomName?: string;
    stayDate?: string;
    endDate?: string;
  };
  const { platform, roomName, stayDate, endDate } = body;
  if (!platform || !CATALOG[platform])
    return NextResponse.json({ error: '지점이 올바르지 않습니다.' }, { status: 400 });
  if (!roomName || !findRoom(platform, roomName))
    return NextResponse.json({ error: '객실이 올바르지 않습니다.' }, { status: 400 });
  if (!stayDate || !/^\d{8}$/.test(stayDate))
    return NextResponse.json({ error: '날짜 형식이 올바르지 않습니다.' }, { status: 400 });
  if (stayDate < ymd(kstNow()))
    return NextResponse.json({ error: '지난 날짜입니다.' }, { status: 400 });

  const nights: string[] = [];
  if (endDate) {
    if (!/^\d{8}$/.test(endDate) || endDate <= stayDate)
      return NextResponse.json({ error: '체크아웃 날짜가 올바르지 않습니다.' }, { status: 400 });
    const cur = parseYmd(stayDate);
    const end = parseYmd(endDate);
    while (cur < end) {
      nights.push(ymd(cur));
      cur.setUTCDate(cur.getUTCDate() + 1);
      if (nights.length > 14)
        return NextResponse.json(
          { error: '한 번에 최대 14박까지 등록할 수 있습니다.' },
          { status: 400 },
        );
    }
  } else {
    nights.push(stayDate);
  }

  let created = 0;
  let skipped = 0;
  for (const night of nights) {
    const existing = await prisma.anantiRequest.findUnique({
      where: { platform_roomName_stayDate: { platform, roomName, stayDate: night } },
    });
    if (existing && existing.status !== 'CANCELLED' && existing.status !== 'EXPIRED') {
      skipped++;
      continue;
    }
    if (existing) {
      await prisma.anantiRequest.update({
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
      });
    } else {
      await prisma.anantiRequest.create({
        data: { platform, roomName, stayDate: night, source: 'manual' },
      });
    }
    created++;
  }
  return NextResponse.json({ ok: true, created, skipped });
}
