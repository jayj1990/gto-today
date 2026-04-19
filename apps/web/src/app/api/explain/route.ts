import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import type { TrainingSpot } from '@gto/gto-data';
import { fingerprint } from '@/lib/fingerprint';
import { getCached, setCached } from '@/lib/explain-cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/explain
 * Body: { spot: TrainingSpot, locale?: 'ko'|'en', tone?: 'beginner'|'advanced' }
 *
 * Returns a short Korean (or English) explanation of why the GTO mix looks
 * the way it does. Cache-first: the fingerprint of the spot + locale + tone
 * is the cache key; Claude is only called on a miss.
 */
export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI 해설이 일시적으로 비활성화되어 있습니다.' },
      { status: 503 },
    );
  }

  let body: { spot: TrainingSpot; locale?: 'ko' | 'en'; tone?: 'beginner' | 'advanced' };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const locale = body.locale ?? 'ko';
  const tone = body.tone ?? 'beginner';
  const spot = body.spot;
  if (!spot || !spot.combo || !spot.position) {
    return NextResponse.json({ error: 'Invalid spot' }, { status: 400 });
  }

  const fp = fingerprint({ spot, locale, tone });
  const cached = getCached(fp);
  if (cached) {
    return NextResponse.json({ text: cached, cached: true });
  }

  const prompt = buildPrompt(spot, locale, tone);
  const client = new Anthropic({ apiKey });

  try {
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = resp.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim();
    if (!text) {
      return NextResponse.json({ error: '응답이 비어있습니다.' }, { status: 500 });
    }
    setCached(fp, text);
    return NextResponse.json({ text, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: `해설 생성 실패: ${message}` }, { status: 500 });
  }
}

function buildPrompt(
  spot: TrainingSpot,
  locale: 'ko' | 'en',
  tone: 'beginner' | 'advanced',
): string {
  const isKorean = locale === 'ko';
  const scenarioLabel =
    spot.scenario === 'vs_open' ? `${spot.opener} 오픈 ${spot.openSize}BB에 대한 BB 디펜스` : 'RFI';
  const gto =
    spot.scenario === 'vs_open'
      ? `레이즈(3벳) ${pct(spot.gtoRaise)}% / 콜 ${pct(spot.gtoCall ?? 0)}% / 폴드 ${pct(spot.gtoFold)}%`
      : `레이즈 ${pct(spot.gtoRaise)}% / 폴드 ${pct(spot.gtoFold)}%`;

  if (isKorean) {
    const toneGuidance =
      tone === 'beginner'
        ? '포커 용어를 조금 아는 초중급자에게 설명하듯 친근한 어조. 어려운 GTO 이론 용어는 풀어서.'
        : '진지한 포커 학습자. GTO 이론 용어(equity, blocker, EV, range advantage) 자연스럽게 사용.';

    return [
      'gto.today 포커 훈련 앱의 AI 코치입니다. 사용자가 방금 푼 핸드의 GTO 솔루션을 한국어로 설명하세요.',
      '',
      `상황: 6맥스 100BB ${scenarioLabel}`,
      `히어로 포지션: ${spot.position}`,
      `히어로 핸드: ${spot.combo}`,
      `GTO 믹스: ${gto}`,
      '',
      '다음 3가지를 각각 1~2문장으로:',
      '1. 왜 이 핸드가 이 빈도로 플레이되는지 (핵심 이유)',
      '2. 주요 고려 요소 (레인지 어드밴티지, 포지션, 블로커, 플레이어빌리티 등)',
      '3. 초보자가 흔히 하는 실수나 주의점',
      '',
      `톤: ${toneGuidance}`,
      '전체 150자 이내. 마크다운 헤더·볼드 금지, 평범한 문장으로.',
    ].join('\n');
  }

  return [
    'You are the AI coach for gto.today. Explain the GTO solution for the hand the user just played.',
    '',
    `Scenario: 6-max 100BB ${spot.scenario}${spot.opener ? ` (BB vs ${spot.opener} ${spot.openSize}BB)` : ''}`,
    `Hero position: ${spot.position}`,
    `Hero hand: ${spot.combo}`,
    `GTO mix: ${gto}`,
    '',
    'In 3 short sentences:',
    '1. Why this hand plays at these frequencies',
    '2. Key considerations (range advantage, position, blockers, playability)',
    '3. A common mistake to avoid',
    '',
    tone === 'beginner'
      ? 'Tone: friendly, for intermediate players. Unpack GTO jargon.'
      : 'Tone: serious poker student. Use theory terms naturally.',
    'Under 500 chars, no markdown.',
  ].join('\n');
}

function pct(x: number): string {
  return (x * 100).toFixed(1);
}
