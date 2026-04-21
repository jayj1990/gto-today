import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import {
  POSTFLOP_ACTION_LABEL,
  type PostflopAction,
  type PostflopSpot,
  type TrainingSpot,
} from '@gto/gto-data';
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

  let body: {
    spot: TrainingSpot | PostflopSpot;
    userAnswer?: PostflopAction;
    locale?: 'ko' | 'en';
    tone?: 'beginner' | 'advanced';
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const locale = body.locale ?? 'ko';
  const tone = body.tone ?? 'beginner';
  const spot = body.spot;
  const isPostflop = spot && 'street' in spot && 'board' in spot;
  if (!spot || (!isPostflop && (!('combo' in spot) || !spot.position))) {
    return NextResponse.json({ error: 'Invalid spot' }, { status: 400 });
  }

  const fp = fingerprint(
    body.userAnswer !== undefined
      ? { spot, locale, tone, userAnswer: body.userAnswer }
      : { spot, locale, tone },
  );
  const cached = getCached(fp);
  if (cached) {
    return NextResponse.json({ text: cached, cached: true });
  }

  const prompt = isPostflop
    ? buildPostflopPrompt(spot as PostflopSpot, body.userAnswer, locale, tone)
    : buildPrompt(spot as TrainingSpot, locale, tone);
  const client = new Anthropic({ apiKey });

  try {
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: isPostflop ? 900 : 600,
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

const TEXTURE_LABEL: Record<string, string> = {
  dry_high: 'K 탑 드라이',
  dry_mid: '중간 드라이',
  semi_wet: '세미웻',
  wet_draw: '젖은 보드',
  paired: '페어드 보드',
  monotone: '모노톤',
  ace_high: 'A 하이 드라이',
  low_connected: '로우 커넥티드',
  broadway: '브로드웨이',
};

function buildPostflopPrompt(
  spot: PostflopSpot,
  userAnswer: PostflopAction | undefined,
  locale: 'ko' | 'en',
  tone: 'beginner' | 'advanced',
): string {
  const isKorean = locale === 'ko';
  const topEntry = (Object.entries(spot.mix) as [PostflopAction, number][])
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0];
  const topAction = topEntry?.[0];

  const mixLine = (Object.entries(spot.mix) as [PostflopAction, number][])
    .filter(([, v]) => (v ?? 0) > 0.01)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .map(([k, v]) => `${POSTFLOP_ACTION_LABEL[k]} ${((v ?? 0) * 100).toFixed(0)}%`)
    .join(' / ');

  const boardStr = spot.board.join(' ');
  const heroStr = spot.hero.join(' ');
  const textureKR = TEXTURE_LABEL[spot.texture] ?? spot.texture;

  if (isKorean) {
    const toneGuidance =
      tone === 'beginner'
        ? '포커 용어를 조금 아는 중급 학습자에게 말하듯 자연스럽고 친근한 어투. 어려운 GTO 이론 용어는 풀어서 설명.'
        : '진지한 포커 학습자 대상. GTO 이론 용어(에쿼티, 블로커, EV, 레인지 어드밴티지, SPR)를 자연스럽게 사용.';

    return [
      'gto.today 포커 훈련 앱의 AI 코치입니다. 사용자가 방금 플레이한 포스트플랍 스팟의 GTO 솔루션을 한국어로 설명하세요.',
      '',
      '── 용어 규칙 (반드시 지킬 것) ──',
      '• hand → "핸드" (절대 "손"이라고 쓰지 말 것)',
      '• check/bet/call/fold/raise → "체크/벳/콜/폴드/레이즈"',
      '• cbet → "C벳"',
      '• range advantage → "레인지 우위"',
      '• equity → "에쿼티", blocker → "블로커"',
      '• nut advantage → "넛 어드밴티지"',
      '',
      '── 포스트플랍 팩트 규칙 ──',
      '• OOP(Out of Position)가 첫 번째 액션. SRP에서 BB는 CO/BTN/UTG/MP 상대로 항상 OOP.',
      '• A-high 드라이 보드는 IP(오프너)가 레인지 우위 — BB가 많이 체크하는 이유.',
      '• 페어드 보드는 양쪽 레인지 nut advantage 가 낮아 체크가 증가.',
      '• 모노톤/웻 보드는 작은 사이즈 벳이 많고 오버벳 드묾.',
      '• 블로커는 상대 콜 빈도에 영향: A블로커·K블로커가 상대 콤보 수 줄임.',
      '',
      '── 스팟 정보 ──',
      `상황: 6맥스 100BB · ${spot.context.preflopSummary} · 팟 ${spot.context.potBB}BB · 유효 스택 ${spot.context.effStackBB}BB (SPR ${spot.context.spr.toFixed(1)})`,
      `히어로 포지션: ${spot.context.heroPos} (${spot.context.villainPos} vs 히어로)`,
      `스트리트: ${spot.street === 'flop' ? '플랍' : spot.street === 'turn' ? '턴' : '리버'}`,
      `보드: ${boardStr} (${textureKR})`,
      `히어로 핸드: ${heroStr}`,
      `상대 액션: ${spot.facingBetBB > 0 ? `${spot.facingBetBB}BB 벳` : '체크'}`,
      `GTO 믹스: ${mixLine}`,
      userAnswer
        ? `사용자 선택: ${POSTFLOP_ACTION_LABEL[userAnswer]}${topAction === userAnswer ? ' (정답)' : ''}`
        : '',
      '',
      '── 출력 형식 ──',
      '한 문단, 3~4문장. 번호·불릿·마크다운·헤더·볼드 모두 금지.',
      '구성:',
      '1. 이 보드·핸드에서 왜 이런 믹스가 나오는지 (레인지 우위·텍스처·블로커 중 핵심 1~2개).',
      '2. 사용자의 선택에 대한 평가 (정답이면 왜 좋은지, 차선이면 어떤 상황에 권장되는지).',
      '3. 자주 하는 실수 또는 조심할 점 하나.',
      '전체 길이: 한국어 250~350자. 반드시 완결된 마침표로 끝낼 것.',
      `어투: ${toneGuidance}`,
      '"~하는 것이다" 남발 금지. 자연스러운 구어체.',
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    'You are the AI coach for gto.today. Explain the GTO postflop solution.',
    '',
    `Scenario: 6-max 100BB · ${spot.context.preflopSummary} · pot ${spot.context.potBB}BB · eff ${spot.context.effStackBB}BB`,
    `Hero position: ${spot.context.heroPos} (vs ${spot.context.villainPos})`,
    `Street: ${spot.street}`,
    `Board: ${boardStr} (texture: ${spot.texture})`,
    `Hero: ${heroStr}`,
    `Facing: ${spot.facingBetBB > 0 ? `${spot.facingBetBB}BB bet` : 'check'}`,
    `GTO mix: ${mixLine}`,
    userAnswer ? `User picked: ${POSTFLOP_ACTION_LABEL[userAnswer]}` : '',
    '',
    'In 3-4 sentences:',
    '1. Why this mix — range advantage / texture / blockers.',
    '2. Evaluate the user\'s choice.',
    '3. One common mistake to avoid.',
    '',
    tone === 'beginner'
      ? 'Tone: friendly, intermediate player. Unpack GTO jargon.'
      : 'Tone: serious poker student, use theory terms naturally.',
    'Under 700 chars, no markdown.',
  ]
    .filter(Boolean)
    .join('\n');
}
