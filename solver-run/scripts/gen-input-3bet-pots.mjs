// Phase B — 3bet-pot postflop input generator.
//
// The 7 "squeeze" pairings (SB:BTN/CO/MP/UTG, CO:MP/UTG, MP:UTG) can't
// be solved as single-raised pots: the defender's call% is 0 (they
// 3bet-or-fold). The real postflop scenario is a 3BET POT — defender
// 3bets, opener calls. This script builds those inputs.
//
// Usage:
//   node gen-input-3bet-pots.mjs --defender=SB --opener=BTN [--limit=8]
//
// TWO things differ from the SRP generator (gen-input-all-flops.mjs):
//
// 1. POSITION decides OOP/IP, not who 3bet. Postflop acting order is
//    SB, BB, UTG, MP, CO, BTN (earliest acts first = most OOP). So:
//      - SB:* pairings  → SB (the 3bettor) is OOP, opener is IP.
//      - CO/MP squeeze  → opener (the caller) is OOP, 3bettor is IP.
//
// 2. RANGES. The 3bettor range is the defender's `raise` slice (we
//    have it). The CALLER range — the opener's "call vs 3bet" hands —
//    is NOT in our charts. Sourced from a curated file of established
//    100bb 6max GTO ranges (matches PIO/Wizard equilibria): see
//    solver-run/ranges/call-vs-3bet-6max-100bb.json.
//
// 3bet-pot geometry (100bb): opener raises 2.5, defender 3bets ~10,
// opener calls → pot ≈ 21, effective stack ≈ 89.5, SPR ≈ 4.3 (vs SRP
// SPR ≈ 17.7). Lower SPR = a meaningfully different solve.

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const ROOT = 'C:/Users/Jay/poker-gto-guide';
const OUT_DIR = path.join(ROOT, 'solver-run/inputs');

const { values: args } = parseArgs({
  options: {
    defender: { type: 'string' },
    opener: { type: 'string' },
    limit: { type: 'string' },
  },
});

if (!args.defender || !args.opener) {
  console.error('Usage: --defender=SB --opener=BTN [--limit=8]');
  process.exit(2);
}

const defender = args.defender.toUpperCase();
const opener = args.opener.toUpperCase();
const limit = args.limit ? parseInt(args.limit, 10) : Infinity;

// Postflop acting order — earliest acts first (most out of position).
const POSTFLOP_ORDER = ['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'];
const order = (p) => POSTFLOP_ORDER.indexOf(p);
if (order(defender) < 0 || order(opener) < 0) {
  console.error(`Unknown position in ${defender}:${opener}`);
  process.exit(2);
}

const defLower = defender.toLowerCase();
const defenderFile = path.join(
  ROOT,
  `apps/web/public/data/preflop/6max_100bb_${defLower}_vs_${opener}.json`,
);
const openerFile = path.join(ROOT, `apps/web/public/data/preflop/6max_100bb_rfi_${opener}.json`);

for (const [f, label] of [
  [defenderFile, 'defense chart'],
  [openerFile, 'RFI chart'],
]) {
  if (!fs.existsSync(f)) {
    console.error(`${label} missing: ${f}`);
    process.exit(3);
  }
}

const defenseChart = JSON.parse(fs.readFileSync(defenderFile, 'utf8'));
const rfiChart = JSON.parse(fs.readFileSync(openerFile, 'utf8'));

function rangeFromMix(mix, pick) {
  const parts = [];
  for (const [c, m] of Object.entries(mix)) {
    const w = pick(m);
    if (w > 0.005) parts.push(w >= 0.999 ? c : `${c}:${w.toFixed(3)}`);
  }
  return parts.join(',');
}

// ── 3bettor range = defender's raise (3bet) slice. We HAVE this. ──
const THREEBET_RANGE = rangeFromMix(defenseChart, (m) => m.raise ?? 0);

// ── Caller range — opener's "call vs 3bet" range, sourced from the
//    curated established-GTO file. This replaced an earlier heuristic
//    on 2026-05-30 because the heuristic produced an approximation;
//    these ranges match published PIO/GTO Wizard equilibria at 100bb
//    6max cash. See solver-run/ranges/call-vs-3bet-6max-100bb.json. ──
const callerFile = path.join(ROOT, 'solver-run/ranges/call-vs-3bet-6max-100bb.json');
if (!fs.existsSync(callerFile)) {
  console.error(`[gen-3bet] ABORT: caller-range file missing: ${callerFile}`);
  process.exit(6);
}
const callerRanges = JSON.parse(fs.readFileSync(callerFile, 'utf8'));
const callerKey = `${defender}_${opener}`;
const callerRange = callerRanges[callerKey];
if (!callerRange || typeof callerRange !== 'string') {
  console.error(
    `[gen-3bet] ABORT: no caller range defined for ${callerKey} in ${path.basename(callerFile)}. Add it to the JSON or switch to a supported pairing.`,
  );
  process.exit(7);
}

if (!THREEBET_RANGE) {
  console.error(`[gen-3bet] ABORT: ${defender} has empty 3bet range vs ${opener}. Chart bug.`);
  process.exit(4);
}
if (!callerRange) {
  console.error(`[gen-3bet] ABORT: ${opener} has empty caller range. Heuristic produced nothing.`);
  process.exit(5);
}

// ── Position assignment: earliest postflop actor is OOP. ──
const oopIsThreebettor = order(defender) < order(opener);
const OOP_RANGE = oopIsThreebettor ? THREEBET_RANGE : callerRange;
const IP_RANGE = oopIsThreebettor ? callerRange : THREEBET_RANGE;
const oopRole = oopIsThreebettor ? `${defender}(3bet)` : `${opener}(call)`;
const ipRole = oopIsThreebettor ? `${opener}(call)` : `${defender}(3bet)`;

// ── 1,755 canonical flops (identical generator to the SRP script). ──
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
function generateAllCanonicalFlops() {
  const flops = [];
  for (let i = 12; i >= 0; i--) {
    for (let j = i - 1; j >= 0; j--) {
      for (let k = j - 1; k >= 0; k--) {
        const hi = RANKS[i], mid = RANKS[j], lo = RANKS[k];
        flops.push({ key: `${hi}${mid}${lo}r`, cards: [`${hi}s`, `${mid}h`, `${lo}d`] });
        flops.push({ key: `${hi}${mid}${lo}hh`, cards: [`${hi}s`, `${mid}s`, `${lo}h`] });
        flops.push({ key: `${hi}${mid}${lo}hl`, cards: [`${hi}s`, `${mid}h`, `${lo}s`] });
        flops.push({ key: `${hi}${mid}${lo}ml`, cards: [`${hi}h`, `${mid}s`, `${lo}s`] });
        flops.push({ key: `${hi}${mid}${lo}m`, cards: [`${hi}s`, `${mid}s`, `${lo}s`] });
      }
    }
  }
  for (let p = 12; p >= 0; p--) {
    for (let k = 12; k >= 0; k--) {
      if (p === k) continue;
      const pr = RANKS[p], kr = RANKS[k];
      flops.push({ key: `${pr}${pr}${kr}m`, cards: [`${pr}s`, `${pr}h`, `${kr}s`] });
      flops.push({ key: `${pr}${pr}${kr}r`, cards: [`${pr}s`, `${pr}h`, `${kr}d`] });
    }
  }
  for (let i = 12; i >= 0; i--) {
    const r = RANKS[i];
    flops.push({ key: `${r}${r}${r}`, cards: [`${r}s`, `${r}h`, `${r}d`] });
  }
  return flops;
}
const allFlops = generateAllCanonicalFlops();
if (allFlops.length !== 1755) console.warn(`[warn] expected 1755 flops, got ${allFlops.length}`);
const boards = allFlops.slice(0, limit);

// ── 3bet-pot geometry. pot 21 / eff 89.5 → SPR ≈ 4.3. ──
const POT = 21;
const EFFECTIVE = 89.5;

// Filename marker `full3_` distinguishes 3bet-pot outputs from SRP
// `full_` outputs so the parser can label potType correctly and the
// git-log skip guard tracks them separately.
const namePrefix = `full3_${defender}_vs_${opener}`;

function scriptFor(name, cards) {
  return (
    [
      `set_pot ${POT}`,
      `set_effective_stack ${EFFECTIVE}`,
      `set_board ${cards.join(',')}`,
      `set_range_ip ${IP_RANGE}`,
      `set_range_oop ${OOP_RANGE}`,
      // Lower SPR → keep sizings compact. Reuse SRP buckets so the
      // parser's bet-size classification needs no changes.
      'set_bet_sizes ip,flop,bet,33,75',
      'set_bet_sizes ip,flop,raise,300',
      'set_bet_sizes oop,flop,bet,33,75',
      'set_bet_sizes oop,flop,donk,33',
      'set_bet_sizes oop,flop,raise,300',
      'set_bet_sizes ip,turn,bet,60,125',
      'set_bet_sizes ip,turn,raise,300',
      'set_bet_sizes oop,turn,bet,60,125',
      'set_bet_sizes oop,turn,raise,300',
      'set_bet_sizes ip,river,bet,60,125',
      'set_bet_sizes ip,river,raise,300',
      'set_bet_sizes oop,river,bet,60,125',
      'set_bet_sizes oop,river,raise,300',
      'set_allin_threshold 0.85',
      'build_tree',
      'set_thread_num 8',
      'set_accuracy 0.5',
      'set_max_iteration 120',
      'set_print_interval 50',
      'set_use_isomorphism 1',
      'start_solve',
      'set_dump_rounds 1',
      `dump_result C:/Users/Jay/poker-gto-guide/solver-run/outputs/${name}.json`,
    ].join('\n') + '\n'
  );
}

for (const { key, cards } of boards) {
  fs.writeFileSync(path.join(OUT_DIR, `${namePrefix}_${key}.txt`), scriptFor(`${namePrefix}_${key}`, cards));
}

const runnerLines = [
  '#!/bin/bash',
  `# Tier runner (3bet pot): ${defender} vs ${opener} — auto-generated.`,
  'set -u',
  'cd "C:/Users/Jay/Desktop/GTO-Today/TexasSolver-v0.2.0-Windows"',
  'LOG="C:/Users/Jay/poker-gto-guide/solver-run/batch.log"',
  `echo "=== ${namePrefix} start $(date) ===" >> "$LOG"`,
  ...boards.map(({ key }) => {
    const name = `${namePrefix}_${key}`;
    return [
      `if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/${name}.json" ]; then`,
      `  echo "[$(date +%H:%M:%S)] ${name} solving..." >> "$LOG"`,
      `  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/${name}.txt" --resource_dir ./resources >> "$LOG" 2>&1`,
      `  echo "[$(date +%H:%M:%S)] ${name} done" >> "$LOG"`,
      'else',
      `  echo "[$(date +%H:%M:%S)] ${name} SKIPPED" >> "$LOG"`,
      'fi',
    ].join('\n');
  }),
  `echo "=== ${namePrefix} done $(date) ===" >> "$LOG"`,
  '',
].join('\n');

const runnerPath = path.join(ROOT, 'solver-run', `run-${namePrefix.replace(/_/g, '-')}.sh`);
fs.writeFileSync(runnerPath, runnerLines);

console.log(`wrote ${boards.length} input scripts + ${path.basename(runnerPath)}`);
console.log(`  OOP = ${oopRole}: ${OOP_RANGE.split(',').length} combos`);
console.log(`  IP  = ${ipRole}: ${IP_RANGE.split(',').length} combos`);
console.log(`  pot ${POT} / eff ${EFFECTIVE} → SPR ${(EFFECTIVE / POT).toFixed(1)}`);
console.log(`  caller range: ${path.basename(callerFile)} (established 100bb 6max GTO)`);
