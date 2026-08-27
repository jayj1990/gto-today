import { prisma } from '@/lib/prisma';

/**
 * 교정지 결정 저장소 — ProofDecision 한 행(토큰당).
 *
 * 문서 본문은 코드(app/proof/[token]/doc.ts)에 있고, 여기 담는 건
 * "어느 수정을 적용/취소했나"뿐이다. TTL 없음 — 행사가 끝나도 무엇을
 * 확정했는지 되짚을 수 있어야 한다.
 *
 * 처음에는 Upstash Redis 로 갔는데 그 DB 가 사라져 있었다(호스트가 DNS 에서
 * ENOTFOUND). 같은 자격증명을 쓰는 explain-cache 도 그래서 무력화된 상태다.
 * Neon 은 살아 있고 인증이 이미 그 위에서 돌아가니 저장은 여기로 모은다.
 */
export type WriteResult = 'ok' | 'failed';

export async function readDecisions(token: string): Promise<Record<string, string>> {
  try {
    const row = await prisma.proofDecision.findUnique({ where: { token } });
    const v = row?.decisions;
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, string>) : {};
  } catch {
    // 저장소가 흔들려도 교정지는 열려야 한다 — 기본값(전부 적용)으로 보여준다.
    return {};
  }
}

export async function writeDecisions(
  token: string,
  decisions: Record<string, string>,
): Promise<WriteResult> {
  try {
    await prisma.proofDecision.upsert({
      where: { token },
      create: { token, decisions },
      update: { decisions },
    });
    return 'ok';
  } catch {
    return 'failed';
  }
}
