import { Redis } from '@upstash/redis';

/**
 * 교정지 결정 저장소 — Upstash Redis 문자열 키 하나.
 *
 * 문서 본문은 코드(app/proof/[token]/doc.ts)에 있고, 여기 담는 건
 * "어느 수정을 적용/취소했나"뿐이라 Postgres 테이블을 새로 팔 이유가 없다.
 * TTL 없음 — 행사가 끝나도 무엇을 확정했는지 되짚을 수 있어야 한다.
 *
 * explain-cache 와 같은 이유로 env 두 개가 다 있고 URL 이 https 일 때만 붙인다.
 * Vercel 의 Sensitive 플래그가 빌드 타임에 마스킹 문자열을 흘려서
 * Redis.fromEnv() 가 UrlError 로 빌드를 통째로 깨뜨린 전례가 있다.
 */
const url = process.env['UPSTASH_REDIS_REST_URL'];
const token = process.env['UPSTASH_REDIS_REST_TOKEN'];
const ready =
  typeof url === 'string' &&
  url.startsWith('https://') &&
  typeof token === 'string' &&
  token.length > 0;

const redis = ready ? new Redis({ url: url as string, token: token as string }) : null;

export const proofStoreReady = ready;

const key = (docToken: string) => `proof:${docToken}`;

export async function readDecisions(docToken: string): Promise<Record<string, string>> {
  if (!redis) return {};
  try {
    const raw = await redis.get<Record<string, string> | string>(key(docToken));
    if (!raw) return {};
    const obj = typeof raw === 'string' ? (JSON.parse(raw) as unknown) : raw;
    return obj && typeof obj === 'object' && !Array.isArray(obj)
      ? (obj as Record<string, string>)
      : {};
  } catch {
    // 저장소가 흔들려도 교정지는 열려야 한다 — 기본값(전부 적용)으로 보여준다.
    return {};
  }
}

export async function writeDecisions(
  docToken: string,
  decisions: Record<string, string>,
): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.set(key(docToken), JSON.stringify(decisions));
    return true;
  } catch {
    return false;
  }
}
