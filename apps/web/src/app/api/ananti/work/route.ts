import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRunner } from '@/lib/ananti-auth';
import { isOpen, kstNow, ymd, parseYmd } from '@/lib/ananti-catalog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 러너 전용. 호출 시:
//  1) 지난 날짜 WAITING → EXPIRED 정리
//  2) 스윕 켜져 있고 오늘이 월요일이면, 오늘 10:00에 열리는 주(오늘+28 ~ +34)
//     7일치 스윕 요청을 미리 생성 (있으면 건너뜀)
//  3) 오픈됐고 재시도 쿨다운(45분)이 지난 WAITING 목록 반환. ?force=1 이면 쿨다운 무시.
//  4) CANCEL_REQUESTED(예약 완료 건 취소 접수) 목록도 함께 반환.
export async function GET(req: Request) {
  if (!checkRunner(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  const force = url.searchParams.get('force') === '1';

  const now = kstNow();
  const today = ymd(now);

  await prisma.anantiRequest.updateMany({
    where: { status: 'WAITING', stayDate: { lt: today } },
    data: { status: 'EXPIRED' },
  });

  const config = await prisma.anantiConfig.findUnique({ where: { id: 1 } });
  const isMonday = now.getUTCDay() === 1;
  if (config?.sweepEnabled && isMonday) {
    const rooms =
      Array.isArray(config.sweepRooms) && config.sweepRooms.length
        ? (config.sweepRooms as string[])
        : [config.sweepRoom];
    const base = parseYmd(today);
    const sweepRows = [];
    for (let i = 28; i <= 34; i++) {
      const d = new Date(base);
      d.setUTCDate(d.getUTCDate() + i);
      for (const roomName of rooms) {
        sweepRows.push({
          platform: config.sweepPlatform,
          roomName,
          stayDate: ymd(d),
          source: 'sweep',
        });
      }
    }
    await prisma.anantiRequest.createMany({ data: sweepRows, skipDuplicates: true });
  }

  const cooldown = new Date(Date.now() - 45 * 60_000);
  const waiting = await prisma.anantiRequest.findMany({
    where: { status: 'WAITING' },
    orderBy: [{ stayDate: 'asc' }],
  });
  const due = waiting.filter(
    (r) => isOpen(r.stayDate) && (force || !r.lastTryAt || r.lastTryAt < cooldown),
  );
  // 취소는 5분 유예(cancelAt)가 지난 것만 러너에 넘긴다 — 그 사이 되돌리기 가능.
  // CANCEL_REQUESTED 는 유예 도입 전 구상태 호환용.
  const cancelJobs = await prisma.anantiRequest.findMany({
    where: {
      OR: [
        { status: 'CANCEL_PENDING', cancelAt: { lte: new Date() } },
        { status: 'CANCEL_REQUESTED' },
      ],
    },
    orderBy: [{ stayDate: 'asc' }],
  });
  return NextResponse.json({ config, due, cancelJobs, waitingCount: waiting.length });
}
