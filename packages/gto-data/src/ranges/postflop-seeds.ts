import type { CardCode } from '@gto/poker-core';
import type { PostflopSpot } from '../postflop';

/** Tiny helper to brand a 2-char card literal. Keeps the seed data readable. */
const c = (s: string): CardCode => s as CardCode;

/**
 * Five hand-crafted postflop spots covering the most common decision
 * types a beginner/intermediate player faces. Frequencies are taken
 * from public GTO Wizard illustrations, Upswing Lab content, and
 * community-vetted heuristics — they're plausible seeds, NOT solved
 * output. Replace with real solver data once the TexasSolver pipeline
 * is running.
 *
 * All five are 6-max, 100BB, cash-game SRP / 3BP contexts.
 */
export const POSTFLOP_SEEDS: readonly PostflopSpot[] = [
  /* ── 1. Flop c-bet decision — BTN vs BB, dry high ─────────────────── */
  {
    id: 'pf-srp-btn-vs-bb-K72r-cbet',
    street: 'flop',
    board: [c('Ks'), c('7d'), c('2c')],
    hero: [c('As'), c('Js')],
    texture: 'dry_high',
    context: {
      heroPos: 'BTN',
      villainPos: 'BB',
      potType: 'srp',
      spr: 17.4,
      potBB: 5.5,
      effStackBB: 97.5,
      preflopSummary: 'BTN 오픈 2.5BB · BB 콜',
    },
    facingBetBB: 0,
    mix: { bet33: 0.72, check: 0.28 },
    availableActions: ['check', 'bet33', 'bet75'],
    teachingNote:
      '드라이 K-하이 보드는 BTN의 레인지 강점이 압도적이라 작은 33% 벳으로 거의 전 레인지 c-bet 하는 것이 표준. AJs는 백도어 + 오버카드 둘 다 있어 가치 겸 블러프로 벳 높음.',
  },

  /* ── 2. Flop check-raise decision — BB vs BTN c-bet ───────────────── */
  {
    id: 'pf-srp-bb-vs-btn-987ss-xr',
    street: 'flop',
    board: [c('9h'), c('8s'), c('7s')],
    hero: [c('Ts'), c('9s')],
    texture: 'wet_draw',
    context: {
      heroPos: 'BB',
      villainPos: 'BTN',
      potType: 'srp',
      spr: 16.2,
      potBB: 5.5,
      effStackBB: 97.5,
      preflopSummary: 'BTN 오픈 2.5BB · BB 콜 → BTN 50% c-bet',
    },
    facingBetBB: 2.75,
    mix: { raise_small: 0.58, call: 0.35, fold: 0.07 },
    availableActions: ['fold', 'call', 'raise_small'],
    teachingNote:
      'T9s는 탑페어 + 오픈엔디드 + 플러시드로. BB의 체크레이즈 레인지에서 최고 수준의 핸드라 공격적으로 레이즈 비중이 높음. 콜도 여전히 유효해 믹스.',
  },

  /* ── 3. Turn barrel decision — BTN after flop c-bet called ────────── */
  {
    id: 'pf-srp-btn-vs-bb-Q94r-2c-barrel',
    street: 'turn',
    board: [c('Qd'), c('9c'), c('4s'), c('2c')],
    hero: [c('Ah'), c('Jd')],
    texture: 'dry_high',
    context: {
      heroPos: 'BTN',
      villainPos: 'BB',
      potType: 'srp',
      spr: 10.5,
      potBB: 9.0,
      effStackBB: 94.5,
      preflopSummary: 'BTN 오픈 · BB 콜 → BTN 33% c-bet · BB 콜',
    },
    facingBetBB: 0,
    mix: { check: 0.62, bet50: 0.25, bet33: 0.13 },
    availableActions: ['check', 'bet33', 'bet50'],
    teachingNote:
      'BB의 턴 콜 레인지에 Q+ 페어와 9x 가 많이 남아있어 AJ 오프는 이미 벤드를 먹는 경우가 잦음. 체크가 기본 라인, 일부 빈도로 작은 2-배럴 (쇼다운 밸류 보호).',
  },

  /* ── 4. River bluff-catch — BB vs BTN 3-bet pot ───────────────────── */
  {
    id: 'pf-3bp-bb-vs-btn-K74r-2s-Th-riv',
    street: 'river',
    board: [c('Kd'), c('7h'), c('4c'), c('2s'), c('Th')],
    hero: [c('Ah'), c('Qh')],
    texture: 'dry_high',
    context: {
      heroPos: 'BB',
      villainPos: 'BTN',
      potType: '3bp',
      spr: 3.8,
      potBB: 21.0,
      effStackBB: 80.0,
      preflopSummary: 'BTN 오픈 · BB 3-bet 11BB · BTN 콜 → 플랍·턴 체크-체크',
    },
    facingBetBB: 16.0,
    mix: { call: 0.52, fold: 0.48 },
    availableActions: ['fold', 'call'],
    teachingNote:
      'BTN이 플랍·턴을 둘 다 체크한 라인에서 리버 75% 베팅 → 벤크 + 블러프가 섞이는 폴라 라인. AQ 하이는 블러프캐처로 최소 정당 — 약 반반 믹스.',
  },

  /* ── 5. Flop donk — BB leads into preflop caller on low board ─────── */
  {
    id: 'pf-srp-bb-vs-btn-654r-donk',
    street: 'flop',
    board: [c('6h'), c('5d'), c('4c')],
    hero: [c('8s'), c('7s')],
    texture: 'low_connected',
    context: {
      heroPos: 'BB',
      villainPos: 'BTN',
      potType: 'srp',
      spr: 16.9,
      potBB: 5.5,
      effStackBB: 93.0,
      preflopSummary: 'BTN 오픈 · BB 콜 → BB to act',
    },
    facingBetBB: 0,
    mix: { bet33: 0.46, check: 0.54 },
    availableActions: ['check', 'bet33', 'bet75'],
    teachingNote:
      '876 계열 보드는 BB 레인지의 스트레이트·스트레이트드로 비중이 BTN보다 높아 소량의 블록사이즈 돈크 벳이 솔버에 등장. 87s 는 이미 스트레이트, 돈크가 표준.',
  },
];
