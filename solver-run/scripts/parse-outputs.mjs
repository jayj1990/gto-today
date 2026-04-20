#!/usr/bin/env node
// Parse every TexasSolver output in solver-run/outputs/ into our
// PostflopSpot shape. Output lands at packages/gto-data/data/
// postflop-solver-spots.json, then the app's listPostflopSpots()
// consumer can read it directly.
//
// Each solver dump's root node represents BB's flop decision after
// calling a CO 2.5x open: check / bet33 / bet75. For every combo in
// BB's range that has a meaningful mix (≥ one action at ≥ 20% AND
// not a single-action 100% line — those don't teach), we emit one
// spot per combo with a plausible teaching note.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/Jay/poker-gto-guide';
const INPUT = path.join(ROOT, 'solver-run/outputs');
const OUT_JSON = path.join(ROOT, 'packages/gto-data/data/postflop-solver-spots.json');
const OUT_TS = path.join(ROOT, 'packages/gto-data/src/ranges/solver-spots.ts');

const POT = 5.5;            // BB + CO 2.5 + BB 1.5 + SB 0.5
const EFF_STACK = 97.5;

// Classify a "BET N" action label into our sizing bucket.
function classifyBet(amount, pot) {
  const ratio = amount / pot;
  if (ratio < 0.42) return 'bet33';
  if (ratio < 0.62) return 'bet50';
  if (ratio < 0.88) return 'bet75';
  if (ratio < 1.25) return 'bet_pot';
  return 'bet_overbet';
}

function mapAction(label, pot) {
  if (label === 'CHECK') return 'check';
  if (label === 'FOLD') return 'fold';
  if (label === 'CALL') return 'call';
  if (label.startsWith('BET ')) return classifyBet(parseFloat(label.slice(4)), pot);
  if (label.startsWith('RAISE ')) {
    const amt = parseFloat(label.slice(6));
    // Relative to pot already at the raise decision point — we use a
    // flat "small vs big" heuristic: under 3x = small, else big.
    return amt < 3 * pot ? 'raise_small' : 'raise_big';
  }
  return null;
}

// Convert solver 4-card combo "Tc9c" → our 169-style "T9s" label.
function combo4ToSpot(combo) {
  const [r1, s1, r2, s2] = [combo[0], combo[1], combo[2], combo[3]];
  if (r1 === r2) return { pair: r1 + r2 };
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const hi = ranks.indexOf(r1) < ranks.indexOf(r2) ? r1 : r2;
  const lo = hi === r1 ? r2 : r1;
  return {
    hi, lo,
    suited: s1 === s2,
    suitHi: hi === r1 ? s1 : s2,
    suitLo: hi === r1 ? s2 : s1,
    label: hi + lo + (s1 === s2 ? 's' : 'o'),
  };
}

// Board textures — minimal classifier driven off the flop card codes.
function classifyTexture(board) {
  const ranks = board.map((c) => c[0]);
  const suits = board.map((c) => c[1]);
  const rankOrder = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const idxs = ranks.map((r) => rankOrder.indexOf(r));
  const top = Math.min(...idxs); // lower idx = higher rank
  const hasA = ranks.includes('A');
  const hasK = ranks.includes('K');
  const paired = new Set(ranks).size < 3;
  const monotone = new Set(suits).size === 1;
  const twoTone = new Set(suits).size === 2;
  const sortedIdxs = [...idxs].sort((a, b) => a - b);
  const connected = sortedIdxs[2] - sortedIdxs[0] <= 4;
  if (paired) return 'paired';
  if (monotone) return 'monotone';
  if (hasA && !connected) return 'ace_high';
  if (connected && twoTone) return 'wet_draw';
  if (hasA || hasK) return 'dry_high';
  if (top <= 4) return 'broadway';
  if (top >= 8 && connected) return 'low_connected';
  if (top >= 8) return 'dry_mid';
  return 'semi_wet';
}

function preflopSummaryKR() {
  return 'CO 오픈 · BB 콜';
}

// Walk the solver JSON down to the root-node's strategy block and
// normalise it into { [ourAction]: { [combo]: freq } }.
function extractRootStrategy(root) {
  // The root itself is player 0 (OOP=BB) deciding. Its strategy is
  // at root.strategy.strategy (combo → freq-array).
  // But root has `actions` and no `strategy`... wait — looking again,
  // the root has `actions` + `childrens` directly, and the strategy
  // for each combo is at root.strategy.strategy. Let me be defensive.
  if (!root.strategy || !root.strategy.strategy) return null;
  const actionList = root.strategy.actions ?? root.actions;
  if (!actionList) return null;

  const mapped = actionList.map((a) => mapAction(a, POT));
  if (mapped.some((a) => a === null)) return null;

  const byAction = {};
  for (const [combo, freqs] of Object.entries(root.strategy.strategy)) {
    for (let i = 0; i < mapped.length; i++) {
      const act = mapped[i];
      if (!byAction[act]) byAction[act] = {};
      byAction[act][combo] = (byAction[act][combo] ?? 0) + freqs[i];
    }
  }
  return { actions: mapped, byAction };
}

// Convert per-4card freqs into per-169hand-type averaged freqs.
function compress4ToHandtype(combos) {
  const byHand = {};
  for (const [c, w] of Object.entries(combos)) {
    const s = combo4ToSpot(c);
    const key = s.pair ?? s.label;
    if (!byHand[key]) byHand[key] = { sum: 0, n: 0 };
    byHand[key].sum += w;
    byHand[key].n += 1;
  }
  const out = {};
  for (const [k, { sum, n }] of Object.entries(byHand)) {
    out[k] = sum / n;
  }
  return out;
}

// Choose 4 representative hero combos per board for training:
// 2 mixed (not 0/100 on any action), 1 clear-bet, 1 clear-check.
function pickHeroCombos(root, board) {
  const combos = Object.keys(root.strategy.strategy ?? {});
  const scored = combos.map((c) => {
    const freqs = root.strategy.strategy[c];
    const max = Math.max(...freqs);
    const mixed = max < 0.85 ? 1 : 0; // mixed = interesting teaching spot
    return { c, freqs, max, mixed };
  });
  // Shuffle deterministically by hash so regen is stable
  scored.sort((a, b) => a.c.localeCompare(b.c));
  const mixed = scored.filter((s) => s.mixed);
  const pure = scored.filter((s) => !s.mixed);
  const pick = [...mixed.slice(0, 3), ...pure.slice(0, 2)].slice(0, 5);
  // Filter out combos that collide with board cards
  const boardSet = new Set(board);
  return pick.filter(({ c }) => !boardSet.has(c.slice(0, 2)) && !boardSet.has(c.slice(2, 4)));
}

function heroCardsFromCombo(combo) {
  return [combo.slice(0, 2), combo.slice(2, 4)];
}

function buildSpot(sourceName, board, root, { c, freqs }) {
  const actionList = root.strategy.actions ?? root.actions;
  const mix = {};
  for (let i = 0; i < actionList.length; i++) {
    const act = mapAction(actionList[i], POT);
    if (!act) continue;
    mix[act] = (mix[act] ?? 0) + (freqs[i] ?? 0);
  }
  const available = Object.keys(mix).sort();
  const texture = classifyTexture(board);
  const hero = heroCardsFromCombo(c);

  // Short teaching note — short, drivable from mix dominance.
  const sortedMix = Object.entries(mix).sort((a, b) => b[1] - a[1]);
  const [top, topFreq] = sortedMix[0];
  const actionKR = { check: '체크', bet33: '1/3 벳', bet50: '1/2 벳', bet75: '3/4 벳', bet_pot: '팟 벳', bet_overbet: '오버벳' };
  const teachingNote = topFreq >= 0.85
    ? `이 보드 · 이 핸드에서는 ${actionKR[top] ?? top}이 단독 정답에 가깝습니다.`
    : `혼합 전략 — ${actionKR[top] ?? top}이 가장 빈번하지만 ${sortedMix[1] ? actionKR[sortedMix[1][0]] ?? sortedMix[1][0] : '대체 액션'}도 충분한 비중.`;

  return {
    id: `pf_${sourceName}_${c}`,
    street: 'flop',
    board,
    hero,
    texture,
    context: {
      heroPos: 'BB',
      villainPos: 'CO',
      potType: 'srp',
      spr: EFF_STACK / POT,
      potBB: POT,
      effStackBB: EFF_STACK,
      preflopSummary: preflopSummaryKR(),
    },
    facingBetBB: 0,
    mix,
    availableActions: available,
    teachingNote,
  };
}

function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const files = fs.readdirSync(INPUT).filter((f) => f.endsWith('.json'));
  console.log(`found ${files.length} solver outputs`);

  const spots = [];
  for (const f of files) {
    let tree;
    try {
      tree = JSON.parse(fs.readFileSync(path.join(INPUT, f), 'utf8'));
    } catch (e) {
      console.warn(`  ! ${f} — JSON parse failed`);
      continue;
    }
    // Board is encoded in the input filename via a mapping we don't
    // keep post-run, so re-extract from the solver dump: the root's
    // `dealcards` appears on chance children; we use the *input* filename
    // to look up the board. The input txt file has `set_board X,Y,Z`.
    const inputPath = path.join(ROOT, 'solver-run/inputs', f.replace(/\.json$/, '.txt'));
    let board = [];
    if (fs.existsSync(inputPath)) {
      const txt = fs.readFileSync(inputPath, 'utf8');
      const m = txt.match(/^set_board\s+(.+)$/m);
      if (m) board = m[1].split(',').map((s) => s.trim());
    }
    if (board.length !== 3) {
      console.warn(`  ! ${f} — could not recover board`);
      continue;
    }

    const root = tree;
    const extracted = extractRootStrategy(root);
    if (!extracted) {
      console.warn(`  ! ${f} — no root strategy`);
      continue;
    }

    const heroPicks = pickHeroCombos(root, board);
    const sourceName = f.replace(/\.json$/, '');
    for (const pick of heroPicks) {
      spots.push(buildSpot(sourceName, board, root, pick));
    }
    console.log(`  ✓ ${f} → ${heroPicks.length} spots`);
  }

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(spots, null, 2) + '\n', 'utf8');
  console.log(`\nwrote ${spots.length} spots → ${OUT_JSON}`);

  // Emit TS module so the data is bundled directly (no runtime fetch).
  const ts = [
    '// AUTO-GENERATED from solver-run/outputs/. Do not edit by hand.',
    '// Regenerate: node solver-run/scripts/parse-outputs.mjs',
    '',
    "import type { PostflopSpot } from '../postflop';",
    '',
    'export const SOLVER_SPOTS: readonly PostflopSpot[] = ' +
      JSON.stringify(spots, null, 2) +
      ' as const;',
    '',
  ].join('\n');
  fs.mkdirSync(path.dirname(OUT_TS), { recursive: true });
  fs.writeFileSync(OUT_TS, ts, 'utf8');
  console.log(`wrote TS module → ${OUT_TS}`);
}

main();
