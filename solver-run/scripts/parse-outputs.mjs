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
// Runtime-fetched layout (2026-06-12) — bundling the spots as TS
// modules put a 57 MB JS chunk in the client bundle once Phase B
// landed (~145K spots). Mobile Safari OOM-crashed parsing it, taking
// every screen down. Spots now ship as static JSON under
//   apps/web/public/data/postflop/{chunkKey}.json
// plus a manifest.json describing each chunk (pairing, count,
// potType). The app fetches one pairing at a time via
// fetchPairingSpots() — nothing is bundled.
const PUBLIC_DIR = path.join(ROOT, 'apps/web/public/data/postflop');
const MANIFEST_JSON = path.join(PUBLIC_DIR, 'manifest.json');
// Full per-board ranges (169-grid data), one file per pairing chunk.
const RANGES_DIR = path.join(PUBLIC_DIR, 'ranges');
// Migration fallbacks — earlier layouts, read once if PUBLIC_DIR is
// empty so no spot is lost on the first run of the new pipeline.
const OLD_CHUNKS_JSON_DIR = path.join(ROOT, 'packages/gto-data/data/spots-chunks');
const LEGACY_OUT_JSON = path.join(ROOT, 'packages/gto-data/data/postflop-solver-spots.json');

/** Bucket key derived from spot id. SRP → `full-bb-co`; 3bet pot →
 *  `full3-sb-btn`; everything else (legacy phase / mtt / Phase 1 seeds) →
 *  `legacy`. Stable across runs so the same spot always lands in the
 *  same chunk file. */
function chunkKey(spot) {
  const m = spot.id.match(/^pf_(full3?)_([A-Z]+)_vs_([A-Z]+)_/);
  if (m) return `${m[1]}-${m[2].toLowerCase()}-${m[3].toLowerCase()}`;
  return 'legacy';
}

// Default pot/stack when the input txt doesn't declare them. We now
// read the actual values per file so MTT (pot 6.5) and cash (pot 5.5)
// produce separately labeled spots.
const DEFAULT_POT = 5.5;
const DEFAULT_EFF = 97.5;

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

/**
 * Derive (heroPos, villainPos, preflopSummary) from the solver input
 * filename. `all-tiers.sh` writes each pairing's inputs as
 * `full_{defender}_vs_{opener}_{flopKey}.txt`, so the prefix tells us
 * who's at the table. Legacy Tier 1 outputs (no prefix) stay BB-vs-CO.
 *
 * The defender is the hero — they called the open and now decide
 * postflop. The opener is the villain.
 */
function pairingFromFilename(name) {
  // Matches both `full_DEF_vs_OPN_*` (SRP, defender calls) and
  // `full3_DEF_vs_OPN_*` (3bet pot, defender 3bets / opener calls).
  const m = name.match(/^full3?_([A-Z]{2,3})_vs_([A-Z]{2,3})_/);
  if (!m) return { heroPos: 'BB', villainPos: 'CO' };
  return { heroPos: m[1], villainPos: m[2] };
}

function preflopSummaryKR(heroPos, villainPos, potType) {
  if (potType === '3bp') return `${villainPos} 오픈 · ${heroPos} 3벳 · ${villainPos} 콜`;
  if (potType === 'mtt') return `${villainPos} 오픈 · ${heroPos} 콜 (MTT · 1BB 앤티)`;
  return `${villainPos} 오픈 · ${heroPos} 콜`;
}

// ─────────────── Full-range extraction (2026-06-13) ───────────────
// The solver computes the hero's full strategy for EVERY combo in
// range. We used to keep only ~5 sample combos per board and delete
// the raw — losing the full 169-grid. Now we also emit a compact
// per-board range: { canonKey → { board, texture, hands:{handType:{act%}} } }.
// hands carries integer percentages, only non-zero actions. ~2 MB per
// pairing — actually smaller than the old 5-combo spots (no per-spot
// metadata repetition). Action codes: x=check f=fold c=call
// b33/b50/b75/bpot/bov=bet sizes, r=raise.

const RANK_VAL = { A: 14, K: 13, Q: 12, J: 11, T: 10, 9: 9, 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 3: 3, 2: 2 };

/** Replicates poker-core canonicalizeFlop().key so range lookups match
 *  findSpotsByBoard's matchKey exactly: ranks high→low + suit pattern. */
function canonKeyOf(board) {
  const cards = board.map((c) => ({ r: c[0], s: c[1] }));
  cards.sort((a, b) => RANK_VAL[b.r] - RANK_VAL[a.r]);
  const ranks = cards.map((c) => c.r).join('');
  const uniq = new Set(cards.map((c) => c.s)).size;
  const pattern = uniq === 3 ? 'r' : uniq === 1 ? 'mono' : 'tt';
  return `${ranks}${pattern}`;
}

/** Short action code for the compact range encoding. */
function shortAction(label, pot) {
  if (label === 'CHECK') return 'x';
  if (label === 'FOLD') return 'f';
  if (label === 'CALL') return 'c';
  if (label.startsWith('BET ')) {
    const b = classifyBet(parseFloat(label.slice(4)), pot);
    return { bet33: 'b33', bet50: 'b50', bet75: 'b75', bet_pot: 'bpot', bet_overbet: 'bov' }[b];
  }
  if (label.startsWith('RAISE ')) return 'r';
  return null;
}

/** Build the per-board full range from the root strategy node:
 *  { handType: { actCode: intPct } } over every combo in hero range. */
function extractBoardRange(root, pot) {
  if (!root.strategy || !root.strategy.strategy) return null;
  const actionList = root.strategy.actions ?? root.actions;
  if (!actionList) return null;
  const codes = actionList.map((a) => shortAction(a, pot));
  if (codes.some((a) => a === null)) return null;

  const agg = {}; // handType → { n, sums:{code:sum} }
  for (const [combo, freqs] of Object.entries(root.strategy.strategy)) {
    const s = combo4ToSpot(combo);
    const ht = s.pair ?? s.label;
    if (!agg[ht]) agg[ht] = { n: 0, sums: {} };
    agg[ht].n++;
    for (let i = 0; i < codes.length; i++) {
      agg[ht].sums[codes[i]] = (agg[ht].sums[codes[i]] ?? 0) + freqs[i];
    }
  }
  const hands = {};
  for (const [ht, { n, sums }] of Object.entries(agg)) {
    const mix = {};
    for (const [code, sum] of Object.entries(sums)) {
      const pct = Math.round((sum / n) * 100);
      if (pct > 0) mix[code] = pct;
    }
    hands[ht] = mix;
  }
  return hands;
}

// Walk the solver JSON down to the root-node's strategy block and
// normalise it into { [ourAction]: { [combo]: freq } }.
function extractRootStrategy(root, pot) {
  // The root itself is player 0 (OOP=BB) deciding. Its strategy is
  // at root.strategy.strategy (combo → freq-array).
  // But root has `actions` and no `strategy`... wait — looking again,
  // the root has `actions` + `childrens` directly, and the strategy
  // for each combo is at root.strategy.strategy. Let me be defensive.
  if (!root.strategy || !root.strategy.strategy) return null;
  const actionList = root.strategy.actions ?? root.actions;
  if (!actionList) return null;

  const mapped = actionList.map((a) => mapAction(a, pot));
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

function buildSpot(sourceName, board, root, { c, freqs }, meta) {
  const actionList = root.strategy.actions ?? root.actions;
  const mix = {};
  for (let i = 0; i < actionList.length; i++) {
    const act = mapAction(actionList[i], meta.pot);
    if (!act) continue;
    mix[act] = (mix[act] ?? 0) + (freqs[i] ?? 0);
  }
  const available = Object.keys(mix).sort();
  const texture = classifyTexture(board);
  const hero = heroCardsFromCombo(c);

  const sortedMix = Object.entries(mix).sort((a, b) => b[1] - a[1]);
  const [top, topFreq] = sortedMix[0];
  const actionKR = { check: '체크', bet33: '1/3 벳', bet50: '1/2 벳', bet75: '3/4 벳', bet_pot: '팟 벳', bet_overbet: '오버벳' };
  const teachingNote = topFreq >= 0.85
    ? `이 보드 · 이 핸드에서는 ${actionKR[top] ?? top}이 단독 정답에 가깝습니다.`
    : `혼합 전략 — ${actionKR[top] ?? top}이 가장 빈번하지만 ${sortedMix[1] ? actionKR[sortedMix[1][0]] ?? sortedMix[1][0] : '대체 액션'}도 충분한 비중.`;

  const { heroPos, villainPos, potType } = meta;
  const preflopSummary = preflopSummaryKR(heroPos, villainPos, potType);

  return {
    id: `pf_${sourceName}_${c}`,
    street: 'flop',
    board,
    hero,
    texture,
    context: {
      heroPos,
      villainPos,
      potType,
      spr: meta.eff / meta.pot,
      potBB: meta.pot,
      effStackBB: meta.eff,
      preflopSummary,
    },
    facingBetBB: 0,
    mix,
    availableActions: available,
    teachingNote,
  };
}

/**
 * Walk into a solver subtree and pull turn + river spots out, with
 * sampling limits so we don't explode the output size.
 *
 *   • Per chance_node (turn / river deal), sample at most N dealt
 *     cards — chosen deterministically so regen stays stable.
 *   • Per action_node, emit one spot iff the position-to-act is the
 *     hero (OOP preflop = BB in Tier 1 inputs; IP for Tier 3 BTN 3bet,
 *     etc.). Short-circuit sample size so we don't end up with
 *     50+ spots per flop.
 *
 *   set_dump_rounds 1  → this returns [] (no subtree dumped).
 *   set_dump_rounds 2  → flop + turn spots.
 *   set_dump_rounds 3  → flop + turn + river spots.
 */
const TURN_SAMPLE = 4;   // cards per turn chance
const RIVER_SAMPLE = 3;  // cards per river chance
const MAX_LINE_DEPTH = 6;

function extractDeeperStreets(flopRoot, flopBoard, sourceName, meta) {
  const out = [];
  const seenHeroCombosAt = new Set(); // spotId dedup — same-hand-on-same-street only once

  const seed = hashString(sourceName) >>> 0;
  const rng = mulberry32(seed);

  walk(flopRoot, flopBoard, [], 0);
  return out;

  function walk(node, board, lineTrace, depth) {
    if (!node || depth > MAX_LINE_DEPTH) return;

    if (node.node_type === 'chance_node') {
      // dealcards may be absent (dump_rounds=1) — bail cleanly.
      if (!node.dealcards) return;
      const street = board.length === 3 ? 'turn' : 'river';
      const limit = street === 'turn' ? TURN_SAMPLE : RIVER_SAMPLE;
      const cards = Object.keys(node.dealcards);
      const picked = sampleCards(cards, limit, rng);
      for (const card of picked) {
        const sub = node.dealcards[card];
        walk(sub, [...board, card], lineTrace, depth + 1);
      }
      return;
    }

    if (node.node_type === 'action_node') {
      // Emit a spot for this decision point if it's postflop (board
      // length > 3 means turn/river already) AND strategy data is
      // present.
      if (board.length > 3 && node.strategy && node.strategy.strategy) {
        const heroPicks = pickHeroCombos(node, board);
        for (const pick of heroPicks) {
          const spotId = `${sourceName}_${board.join('')}_${pick.c}`;
          if (seenHeroCombosAt.has(spotId)) continue;
          seenHeroCombosAt.add(spotId);
          const street = board.length === 4 ? 'turn' : 'river';
          out.push(buildDeeperSpot(sourceName, board, node, pick, meta, street, lineTrace));
        }
      }

      // Recurse into chosen branches — we follow top-frequency paths
      // to keep the spot tree coherent (a "check-check, bet, check"
      // sequence rather than random noise).
      if (node.childrens) {
        const childActions = Object.keys(node.childrens);
        // Take the two most-played branches so the trace stays thin.
        const sorted = rankBranches(node, childActions);
        const topBranches = sorted.slice(0, 2);
        for (const action of topBranches) {
          walk(node.childrens[action], board, [...lineTrace, action], depth + 1);
        }
      }
    }
  }
}

// Rank branches by their aggregate frequency across all hero combos.
// Pure-fold lines sink to the bottom so we don't waste recursion on them.
function rankBranches(node, actions) {
  const strat = node.strategy?.strategy ?? {};
  const actionList = node.strategy?.actions ?? node.actions ?? actions;
  const totals = new Array(actionList.length).fill(0);
  let count = 0;
  for (const freqs of Object.values(strat)) {
    for (let i = 0; i < actionList.length; i++) totals[i] += freqs[i] ?? 0;
    count++;
  }
  const ranked = actions
    .map((a) => {
      const idx = actionList.indexOf(a);
      return { a, freq: idx >= 0 && count > 0 ? totals[idx] / count : 0 };
    })
    .sort((a, b) => b.freq - a.freq)
    .map((x) => x.a);
  return ranked;
}

// Deterministic RNG from a seed — lets `pnpm typecheck` re-emit
// SOLVER_SPOTS with the same sampled cards every run.
function mulberry32(seed) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h;
}

function sampleCards(cards, n, rng) {
  if (cards.length <= n) return cards;
  // Fisher-Yates partial shuffle on a copy.
  const arr = [...cards];
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (arr.length - i));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

function buildDeeperSpot(sourceName, board, node, { c, freqs }, meta, street, lineTrace) {
  const actionList = node.strategy?.actions ?? node.actions ?? [];
  const mix = {};
  for (let i = 0; i < actionList.length; i++) {
    const act = mapAction(actionList[i], meta.pot);
    if (!act) continue;
    mix[act] = (mix[act] ?? 0) + (freqs[i] ?? 0);
  }
  const available = Object.keys(mix).sort();
  // Texture classification works on the first 3 cards (flop) since
  // turn/river just add one card each — the flop-texture bucket is
  // the relevant UX grouping either way.
  const texture = classifyTexture(board.slice(0, 3));
  const hero = heroCardsFromCombo(c);

  const sortedMix = Object.entries(mix).sort((a, b) => b[1] - a[1]);
  const [top, topFreq] = sortedMix[0] ?? ['check', 0];
  const actionKR = {
    check: '체크',
    bet33: '1/3 벳',
    bet50: '1/2 벳',
    bet75: '3/4 벳',
    bet_pot: '팟 벳',
    bet_overbet: '오버벳',
    call: '콜',
    fold: '폴드',
    raise_small: '레이즈',
    raise_big: '올인급 레이즈',
  };
  const lineText = lineTrace.length > 0 ? ` · 라인: ${lineTrace.join(' → ')}` : '';
  const teachingNote =
    topFreq >= 0.85
      ? `${street} 결정 · ${actionKR[top] ?? top}이 단독 정답에 가깝습니다.${lineText}`
      : `혼합 전략 — ${actionKR[top] ?? top}이 가장 빈번${sortedMix[1] ? `, 대체는 ${actionKR[sortedMix[1][0]] ?? sortedMix[1][0]}` : ''}.${lineText}`;

  const { heroPos, villainPos, potType } = meta;
  const preflopSummary = preflopSummaryKR(heroPos, villainPos, potType);

  return {
    id: `pf_${sourceName}_${street}_${board.join('')}_${c}`,
    street,
    board,
    hero,
    texture,
    context: {
      heroPos,
      villainPos,
      potType,
      spr: meta.eff / meta.pot,
      potBB: meta.pot,
      effStackBB: meta.eff,
      preflopSummary,
    },
    facingBetBB: 0,
    mix,
    availableActions: available,
    teachingNote,
  };
}

function main() {
  const files = fs.readdirSync(INPUT).filter((f) => f.endsWith('.json'));
  console.log(`found ${files.length} solver outputs`);

  // Merge mode: preserve spots from prior pairings whose raw outputs
  // have been cleaned up. Without this, each pairing commit overwrites
  // earlier pairings — caught 2026-05-08 when BB:CO data was silently
  // lost on the BB:BTN merge (recovered from git 6a9c8fa).
  const byId = new Map();
  const loadDir = (dir, label) => {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json') || f === 'manifest.json') continue;
      try {
        const arr = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        for (const s of arr) byId.set(s.id, s);
      } catch (e) {
        console.warn(`${label}/${f} unparseable, skipping — ${e.message}`);
      }
    }
  };
  loadDir(PUBLIC_DIR, 'public');
  if (byId.size > 0) {
    console.log(`merge mode: loaded ${byId.size} existing spots from public/data/postflop/`);
  } else {
    // Migration: earlier layouts, read once.
    loadDir(OLD_CHUNKS_JSON_DIR, 'spots-chunks');
    if (byId.size === 0 && fs.existsSync(LEGACY_OUT_JSON)) {
      try {
        const prev = JSON.parse(fs.readFileSync(LEGACY_OUT_JSON, 'utf8'));
        for (const s of prev) byId.set(s.id, s);
      } catch (e) {
        console.warn(`legacy JSON unparseable — ${e.message}`);
      }
    }
    if (byId.size > 0) console.log(`migration: seeded ${byId.size} spots from prior layout`);
  }
  const existingCount = byId.size;

  // Full per-board ranges, merged across runs like spots. Keyed
  // chunkKey → canonBoardKey → { board, texture, hands }.
  const rangesByChunk = {};
  if (fs.existsSync(RANGES_DIR)) {
    for (const f of fs.readdirSync(RANGES_DIR)) {
      if (!f.endsWith('.json')) continue;
      try {
        rangesByChunk[f.replace(/\.json$/, '')] = JSON.parse(
          fs.readFileSync(path.join(RANGES_DIR, f), 'utf8'),
        );
      } catch (e) {
        console.warn(`ranges/${f} unparseable — ${e.message}`);
      }
    }
  }

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
    let pot = DEFAULT_POT;
    let eff = DEFAULT_EFF;
    if (fs.existsSync(inputPath)) {
      const txt = fs.readFileSync(inputPath, 'utf8');
      const mBoard = txt.match(/^set_board\s+(.+)$/m);
      if (mBoard) board = mBoard[1].split(',').map((s) => s.trim());
      const mPot = txt.match(/^set_pot\s+([\d.]+)/m);
      if (mPot) pot = parseFloat(mPot[1]);
      const mEff = txt.match(/^set_effective_stack\s+([\d.]+)/m);
      if (mEff) eff = parseFloat(mEff[1]);
    }
    if (board.length !== 3) {
      console.warn(`  ! ${f} — could not recover board`);
      continue;
    }
    // Reject impossible boards (duplicate cards). Pre-2026-04-27
    // gen-next-phase.mjs emitted [Ks, Ks, Td] style boards from
    // pair-rank loops where suits should have differed — solver
    // garbage-in/garbage-out, and the rendered table showed two of the
    // same card. Defense-in-depth: parser drops them so they can't
    // reach the app even if a bad input slips back in.
    if (new Set(board).size !== board.length) {
      console.warn(`  ! ${f} — duplicate card board ${board.join(',')}, skipping`);
      continue;
    }
    // Filename-driven classification (pot-size heuristic is unreliable
    // now that 3bet pots have pot ~21, which used to trigger the MTT
    // branch via `pot > 6.0`).
    const sourceName = f.replace(/\.json$/, '');
    const is3bet = sourceName.startsWith('full3_');
    const isMTT = sourceName.startsWith('mtt_');
    const potType = is3bet ? '3bp' : isMTT ? 'mtt' : 'srp';
    const { heroPos, villainPos } = pairingFromFilename(sourceName);
    const meta = {
      pot,
      eff,
      format: isMTT ? 'mtt' : 'cash',
      potType,
      heroPos,
      villainPos,
    };

    const root = tree;
    const extracted = extractRootStrategy(root, pot);
    if (!extracted) {
      console.warn(`  ! ${f} — no root strategy`);
      continue;
    }

    const heroPicks = pickHeroCombos(root, board);
    for (const pick of heroPicks) {
      spots.push(buildSpot(sourceName, board, root, pick, meta));
    }
    let streetCount = heroPicks.length;

    // Full per-board range for the 169-grid chart. Keyed by canonical
    // board so the app's findSpotsByBoard matchKey resolves it.
    const hands = extractBoardRange(root, pot);
    if (hands) {
      const ck = chunkKey({ id: `pf_${sourceName}_x` });
      (rangesByChunk[ck] ??= {})[canonKeyOf(board)] = {
        board,
        texture: classifyTexture(board),
        hands,
      };
    }

    // Extend into turn + river subtrees when the solver was asked to
    // dump them (set_dump_rounds 3). For flop-only dumps the recursion
    // short-circuits immediately at the first chance_node, so this is
    // a no-op for legacy data.
    const turnRiverSpots = extractDeeperStreets(root, board, sourceName, meta);
    for (const s of turnRiverSpots) spots.push(s);
    streetCount += turnRiverSpots.length;

    console.log(`  ✓ ${f} → ${streetCount} spots (${meta.format})`);
  }

  // Merge new spots into the existing-by-id map (re-solved boards
  // overwrite by id, never silently delete earlier pairings).
  for (const s of spots) byId.set(s.id, s);
  const overwritten = existingCount + spots.length - byId.size;
  console.log(
    `merge: ${existingCount} existing + ${spots.length} new (${overwritten} overwritten) → ${byId.size} total`,
  );

  // Bucket by chunk key.
  const buckets = new Map();
  for (const s of byId.values()) {
    const k = chunkKey(s);
    const list = buckets.get(k);
    if (list) list.push(s);
    else buckets.set(k, [s]);
  }

  // Write one minified JSON per chunk + a manifest describing them.
  // Minified: these are fetched at runtime — pretty-printing costs
  // ~30% extra transfer for nothing.
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  const chunkKeys = [...buckets.keys()].sort();
  const manifestChunks = [];
  for (const k of chunkKeys) {
    const arr = buckets.get(k);
    fs.writeFileSync(path.join(PUBLIC_DIR, `${k}.json`), JSON.stringify(arr) + '\n', 'utf8');
    const first = arr[0];
    manifestChunks.push({
      key: k,
      count: arr.length,
      heroPos: first?.context?.heroPos ?? null,
      villainPos: first?.context?.villainPos ?? null,
      potType: first?.context?.potType ?? null,
      summary: first?.context?.preflopSummary ?? '',
    });
  }
  // Write full-range files (one per chunk that has range data) and flag
  // them in the manifest so the UI knows a 169-grid is available.
  fs.mkdirSync(RANGES_DIR, { recursive: true });
  const rangeBoardCount = {};
  for (const [ck, boards] of Object.entries(rangesByChunk)) {
    const n = Object.keys(boards).length;
    if (n === 0) continue;
    fs.writeFileSync(path.join(RANGES_DIR, `${ck}.json`), JSON.stringify(boards) + '\n', 'utf8');
    rangeBoardCount[ck] = n;
  }
  for (const c of manifestChunks) {
    c.rangeBoards = rangeBoardCount[c.key] ?? 0;
  }

  fs.writeFileSync(
    MANIFEST_JSON,
    JSON.stringify({ version: 2, chunks: manifestChunks }, null, 2) + '\n',
    'utf8',
  );

  console.log(`wrote ${chunkKeys.length} chunks + ${Object.keys(rangeBoardCount).length} range files + manifest`);
  for (const c of manifestChunks) {
    console.log(
      `  ${c.key}: ${c.count} spots, ${c.rangeBoards} range boards (${c.heroPos} vs ${c.villainPos}, ${c.potType})`,
    );
  }
}

main();
