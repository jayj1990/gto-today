import type { Metadata } from 'next';
import { Settle } from './settle';

// /jopt/settle — 삿포로 원정 정산. 포커 링게임 정산처럼 "누가 누구에게 얼마" 최소 송금 목록과
// 보냈어요 체크. 데이터는 data.ts, 계산은 calc.ts, 공유 상태는 /api/jopt/settle (Upstash).
export const metadata: Metadata = {
  title: '삿포로 정산 · JOPT SAPPORO 2026',
  description: '9/21-25 삿포로 원정 지출 정산 — 누가 누구에게 얼마 보내면 끝나는지, 영수증까지.',
  robots: { index: false, follow: false },
};

export default function JoptSettlePage() {
  return <Settle />;
}
