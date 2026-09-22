import type { Metadata } from 'next';
import { JoptPlanner } from '../ui';

// /jopt/map — LEGO 아이소메트릭 동선 지도. 2026-09-22 부터 /jopt 루트는 일정표(today.tsx)가 맡고
// 지도는 여기로 옮겼다(Jay: 벡터 지도보다 렌더 이미지 기반 일정표를 메인으로).
export const metadata: Metadata = {
  title: 'LEGO 동선 지도 · JOPT SAPPORO 2026',
  robots: { index: false, follow: false },
};

export default function JoptMapPage() {
  return <JoptPlanner />;
}
