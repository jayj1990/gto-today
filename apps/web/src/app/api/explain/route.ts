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
      max_tokens: 600,
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
        ? '포커 용어를 조금 아는 중급 학습자에게 말하듯 자연스럽고 친근한 어투. 어려운 GTO 이론 용어는 풀어서 설명.'
        : '진지한 포커 학습자 대상. GTO 이론 용어(에쿼티, 블로커, EV, 레인지 어드밴티지)를 자연스럽게 사용.';

    return [
      'gto.today 포커 훈련 앱의 AI 코치입니다. 사용자가 방금 플레이한 스팟의 GTO 솔루션을 한국어로 설명하세요.',
      '',
      '── 용어 규칙 (반드시 지킬 것) ──',
      '• hand → "핸드" (절대 "손"이라고 쓰지 말 것)',
      '• position → "포지션"',
      '• raise / call / fold → "레이즈 / 콜 / 폴드"',
      '• 3bet → "3벳"',
      '• equity → "에쿼티"',
      '• range → "레인지"',
      '• blocker → "블로커"',
      '• Sharp / Playable 같은 영어 평가어 금지 → "정확한 판단", "해볼만한 선택" 식으로 한국어로',
      '',
      '── 포커 팩트 규칙 (헛소리 금지) ──',
      '',
      '포스트플랍 액션 순서 (첫 → 마지막): SB → BB → UTG → MP → CO → BTN',
      '• SB는 포스트플랍 항상 첫 번째 액션 → 모든 상대에 대해 OOP',
      '• BB는 SB와 단둘이 남았을 때만 IP(인포지션). 그 외 포지션(UTG/MP/CO/BTN 등)과 붙으면 OOP.',
      '• BTN은 살아있으면 포스트플랍 마지막 액션 → 항상 IP',
      '• 포지션 이득을 주장하려면 반드시 실제 IP인 상황에만. 데이터 검증 없이 "BB 포지션 유리" 같은 표현 금지.',
      '',
      '3벳의 근거로 흔히 사용: 블로커 효과, 에쿼티 우위, 데드 머니(블라인드/앤티), 폴드 에쿼티, OOP 불리함 상쇄(SPR 낮춰 결정 단순화).',
      '콜의 근거로 흔히 사용: 솔버 혼합 전략 유지, 3벳 시 4벳-폴드 리스크, 임플라이드 오즈, 레인지 밸런스.',
      '',
      '── 스팟 정보 ──',
      `상황: 6맥스 100BB ${scenarioLabel}`,
      `히어로 포지션: ${spot.position}`,
      `히어로 핸드: ${spot.combo}`,
      `GTO 믹스: ${gto}`,
      '',
      '── 출력 형식 ──',
      '한 문단, 2~3문장으로 핵심만. 번호·불릿·마크다운·헤더·볼드 모두 금지.',
      '내용: 이 핸드가 왜 이 빈도로 플레이되는지 + 핵심 이유 1~2개(에쿼티·블로커·포지션 중 가장 큰 것).',
      '전체 길이: 한국어 130자 이내. 반드시 완결된 마침표로 끝낼 것(중간에 끊기지 않게).',
      `어투: ${toneGuidance}`,
      '부자연스러운 직역체("~하는 것이다", "~할 수 있다" 남발) 피하고, 구어체에 가깝게.',
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
