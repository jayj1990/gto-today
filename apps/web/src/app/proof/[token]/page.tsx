// 공개 교정지 — dabin.gto.today 가 이 경로로 rewrite 된다(next.config.ts).
// 로그인 불필요: 토큰이 곧 접근 권한이다. 색인은 막는다 — 남의 미공개 원고다.
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { readDecisions } from '@/lib/proof-store';
import { getDoc } from './doc';
import { ProofApp } from './proof-app';
import './proof.css';

export const metadata: Metadata = {
  title: '교정지',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function ProofPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const doc = getDoc(token);
  if (!doc) notFound();

  // 아직 아무도 안 눌렀으면 빈 객체 — 그때는 전부 "적용"이 기본값이다.
  const initial = await readDecisions(token);

  return <ProofApp token={token} doc={doc} initial={initial} />;
}
