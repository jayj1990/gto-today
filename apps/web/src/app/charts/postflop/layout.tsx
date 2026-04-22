import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '포스트플랍 차트',
  description:
    '텍스처별 GTO 액션 믹스. 13×13 레인지 그리드로 히어로 콤보 단위 전략을 확인.',
  openGraph: {
    title: '포스트플랍 차트 · gto.today',
    description: '사전계산된 플랍 GTO 믹스. 텍스처 탭 + 레인지 그리드.',
  },
};

export default function PostflopChartsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
