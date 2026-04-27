import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@/lib/auth';
import {
  CACHE_BACKEND,
  cacheGet,
  cacheSet,
  checkRateLimit,
  fingerprint,
} from '@/lib/explain-cache';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Claude Haiku explain endpoint — used by the result sheets to turn
 * a spot + user answer into a one-paragraph Korean explanation.
 *
 * Cost-control gates (in order):
 *   1. Must be authenticated (Auth.js session). Blocks anonymous
 *      crawlers / abuse before hitting Claude OR the cache.
 *   2. Redis cache hit on fingerprint(spot) returns instantly, no
 *      Claude call, no rate-limit charge.
 *   3. Per-user sliding window rate limit (60 req / hour). Exceeding
 *      returns 429 with reset ms.
 *   4. Claude Haiku 4.5 short-prompt generation (~200 output tokens
 *      cap). Response cached forever — spot explanations don't age.
 */
const MODEL = 'claude-haiku-4-5-20251001';

interface ExplainBody {
  spot?: unknown;
  userAnswer?: unknown;
  locale?: 'ko' | 'en';
  tone?: 'beginner' | 'intermediate';
}

export async function POST(req: Request): Promise<NextResponse> {
  const session = await auth();
  const userId = session?.user?.id ?? session?.user?.email ?? null;
  if (!userId) {
    return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });
  }

  let body: ExplainBody;
  try {
    body = (await req.json()) as ExplainBody;
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });
  }
  if (!body.spot) {
    return NextResponse.json({ error: 'spot missing' }, { status: 400 });
  }

  const fp = fingerprint({
    spot: body.spot,
    userAnswer: body.userAnswer ?? null,
    locale: body.locale ?? 'ko',
  });

  // 1) Cache check before rate-limit charge — a repeat question is
  //    free for the user, no reason to count it.
  const cached = await cacheGet(fp);
  if (cached) {
    return NextResponse.json({
      text: cached,
      cached: true,
      cacheBackend: CACHE_BACKEND,
    });
  }

  // 2) Rate limit by userId.
  const rl = await checkRateLimit(`u:${userId}`);
  if (!rl.success) {
    const resetSec = Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000));
    return NextResponse.json(
      { error: `해설 요청 한도를 초과했어요. ${resetSec}초 후 다시 시도해 주세요.` },
      { status: 429 },
    );
  }

  // 3) Call Claude.
  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) {
    return NextResponse.json({ error: 'AI 해설 설정이 아직이에요' }, { status: 503 });
  }

  const client = new Anthropic({ apiKey });
  const system = buildSystemPrompt(body.tone ?? 'beginner');
  const userPrompt = buildUserPrompt(body);

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 220,
      temperature: 0.4,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const text = msg.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim();
    if (!text) {
      return NextResponse.json({ error: '해설을 만들지 못했어요' }, { status: 502 });
    }
    await cacheSet(fp, text);
    return NextResponse.json({ text, cached: false, cacheBackend: CACHE_BACKEND });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `AI 해설 실패: ${msg}` }, { status: 502 });
  }
}

function buildSystemPrompt(tone: 'beginner' | 'intermediate'): string {
  const level =
    tone === 'beginner'
      ? '초보 플레이어가 이해할 수 있게 쉬운 포커 용어로. 전문 용어는 한 번만 설명하고 재사용.'
      : '중급 플레이어 대상. 레인지·EV·블로커 개념을 자유롭게 사용.';
  return `너는 포커 GTO 코치다. 한국어로 답한다. ${level}
- 2-3문장, 최대 120자 이내로 짧게.
- 왜 그런 결정이 최적인지 핵심 이유 하나만.
- 과장·느낌표 금지. 결단력 있는 톤.
- "라고 볼 수 있어요" 같은 애매한 표현 금지.
- 마지막은 마침표로 끝낸다.

포커 용어는 한국 커뮤니티 표기를 그대로 쓴다 (번역/의역 금지):
- hand → 핸드 (절대 "손"으로 번역 금지)
- pot → 팟 (절대 "냄비"로 번역 금지)
- pot odds → 팟 오즈 (절대 "배당률"로 번역 금지)
- equity → 에쿼티
- range → 레인지
- blocker → 블로커
- c-bet → 씨벳
- check-raise → 체크레이즈
- street → 스트릿
- all-in → 올인
- fold / call / raise → 폴드 / 콜 / 레이즈
- flop / turn / river → 플랍 / 턴 / 리버
- suited / offsuit → 수트 / 오프수트
- 3bet / 4bet → 3벳 / 4벳
- combo → 콤보
- board → 보드
- position → 포지션
한국식 영어 포커 용어가 표준이다. 직역하면 어색해진다.`;
}

function buildUserPrompt(body: ExplainBody): string {
  const spot = body.spot as Record<string, unknown>;
  const user = body.userAnswer ?? '(미응답)';
  return `스팟:\n${JSON.stringify(spot, null, 2)}\n\n유저 선택: ${String(user)}\n\n이 스팟에서 왜 그게 GTO 답인지 짧게 설명.`;
}
