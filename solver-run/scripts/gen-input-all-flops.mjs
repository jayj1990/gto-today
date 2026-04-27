#!/usr/bin/env node
// Generate solver input files for EVERY iso canonical flop (1,755 of
// them) for a single defender × opener pairing. Invoked once per
// (defender, opener) combo by the master orchestrator.
//
// Usage:
//   node solver-run/scripts/gen-input-all-flops.mjs --defender=BB --opener=CO
//
// Outputs:
//   solver-run/inputs/full_{def}_vs_{opener}_{flopKey}.txt  (~1755 files)
//   solver-run/run-full-{def}-vs-{opener}.sh               (runner with skip logic)
//
// Why "full" prefix: keeps these separated from the phase-prefixed
// Tier 1 inputs so deleting one tier doesn't touch the other.

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const ROOT = 'C:/Users/Jay/poker-gto-guide';
const OUT_DIR = path.join(ROOT, 'solver-run', 'inputs');
fs.mkdirSync(OUT_DIR, { recursive: true });

const { values: args } = parseArgs({
  options: {
    defender: { type: 'string' },
    opener: { type: 'string' },
    limit: { type: 'string' }, // optional, for smoke tests
  },
});

if (!args.defender || !args.opener) {
  console.error('Usage: --defender=BB --opener=CO [--limit=5]');
  process.exit(2);
}

const defender = args.defender.toUpperCase();
const opener = args.opener.toUpperCase();
const limit = args.limit ? parseInt(args.limit, 10) : Infinity;

const defLower = defender.toLowerCase();
const defenderFile = path.join(
  ROOT,
  `apps/web/public/data/preflop/6max_100bb_${defLower}_vs_${opener}.json`,
);
const openerFile = path.join(
  ROOT,
  `apps/web/public/data/preflop/6max_100bb_rfi_${opener}.json`,
);

if (!fs.existsSync(defenderFile)) {
  console.error(`Defense chart missing: ${defenderFile}`);
  process.exit(3);
}
if (!fs.existsSync(openerFile)) {
  console.error(`RFI chart missing: ${openerFile}`);
  process.exit(3);
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

// OOP = defender (call or raise → we keep the call slice only for
// SRP postflop since calling BB's open is the usual postflop start).
const OOP_RANGE = rangeFromMix(defenseChart, (m) => m.call ?? 0);
const IP_RANGE = rangeFromMix(rfiChart, (m) => m.raise ?? 0);

// ─────────────── 1,755 canonical flop generator ───────────────
// Count proof: 286 rank-triples × 5 suit patterns + 156 pair-kicker
// × 2 kicker-suit patterns + 13 trips = 1430 + 312 + 13 = 1755.

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

function generateAllCanonicalFlops() {
  const flops = [];

  // 1) Three distinct ranks — 286 triples, 5 suit patterns each
  for (let i = 12; i >= 0; i--) {
    for (let j = i - 1; j >= 0; j--) {
      for (let k = j - 1; k >= 0; k--) {
        const hi = RANKS[i];
        const mid = RANKS[j];
        const lo = RANKS[k];
        // Rainbow: all 3 different suits
        flops.push({ key: `${hi}${mid}${lo}r`, cards: [`${hi}s`, `${mid}h`, `${lo}d`] });
        // Two-tone variants — 3 ways to pick which two share a suit
        flops.push({ key: `${hi}${mid}${lo}hh`, cards: [`${hi}s`, `${mid}s`, `${lo}h`] });
        flops.push({ key: `${hi}${mid}${lo}hl`, cards: [`${hi}s`, `${mid}h`, `${lo}s`] });
        flops.push({ key: `${hi}${mid}${lo}ml`, cards: [`${hi}h`, `${mid}s`, `${lo}s`] });
        // Monotone
        flops.push({ key: `${hi}${mid}${lo}m`, cards: [`${hi}s`, `${mid}s`, `${lo}s`] });
      }
    }
  }

  // 2) Pair + kicker — 156 rank pairs, 2 kicker-suit patterns
  for (let p = 12; p >= 0; p--) {
    for (let k = 12; k >= 0; k--) {
      if (p === k) continue;
      const pr = RANKS[p];
      const kr = RANKS[k];
      // Kicker matches one of the pair suits
      flops.push({ key: `${pr}${pr}${kr}m`, cards: [`${pr}s`, `${pr}h`, `${kr}s`] });
      // Kicker fresh suit
      flops.push({ key: `${pr}${pr}${kr}r`, cards: [`${pr}s`, `${pr}h`, `${kr}d`] });
    }
  }

  // 3) Trips — 13, all iso-equivalent (3 of 4 suits)
  for (let i = 12; i >= 0; i--) {
    const r = RANKS[i];
    flops.push({ key: `${r}${r}${r}`, cards: [`${r}s`, `${r}h`, `${r}d`] });
  }

  return flops;
}

const allFlops = generateAllCanonicalFlops();
if (allFlops.length !== 1755) {
  console.warn(`[warn] expected 1755 flops, got ${allFlops.length}`);
}

const boards = allFlops.slice(0, limit);

// ─────────────── Solver input template ───────────────
// Matches the Tier 1 settings so output format stays consistent for
// the parser.
const POT = 5.5;
const EFFECTIVE = 97.5;

function scriptFor(name, cards) {
  return [
    `set_pot ${POT}`,
    `set_effective_stack ${EFFECTIVE}`,
    `set_board ${cards.join(',')}`,
    `set_range_ip ${IP_RANGE}`,
    `set_range_oop ${OOP_RANGE}`,
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
    // dump_rounds 1 = flop only (~50 KB/file). 3 produces ~9 GB/file
    // because the entire chance tree across 3 streets gets serialized
    // — at 1,755 boards × 15 pairings that's ~250 TB, which already
    // filled the host disk once and triggered a crash. Turn / river
    // drills need a separate targeted-subtree solve, not a brute-force
    // full-tree dump.
    'set_dump_rounds 1',
    `dump_result C:/Users/Jay/poker-gto-guide/solver-run/outputs/${name}.json`,
  ].join('\n') + '\n';
}

const namePrefix = `full_${defender}_vs_${opener}`;

for (const { key, cards } of boards) {
  const name = `${namePrefix}_${key}`;
  fs.writeFileSync(path.join(OUT_DIR, `${name}.txt`), scriptFor(name, cards));
}

// Runner — sequential, skip if output exists (so crashes resume
// cleanly). Marker lines at begin/end let post-chain3 watchdog poll.
const runnerLines = [
  '#!/bin/bash',
  `# Tier runner: ${defender} vs ${opener} — auto-generated.`,
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

const runnerPath = path.join(
  ROOT,
  'solver-run',
  `run-${namePrefix.replace(/_/g, '-')}.sh`,
);
fs.writeFileSync(runnerPath, runnerLines);

console.log(
  `wrote ${boards.length} input scripts + ${path.basename(runnerPath)}`,
);
console.log(`OOP entries: ${OOP_RANGE.split(',').length}, IP entries: ${IP_RANGE.split(',').length}`);
console.log(`estimated wall time: ~${Math.round((boards.length * 4) / 60)}h (at ~4 min/board)`);
