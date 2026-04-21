#!/usr/bin/env node
// Generate the next solver phase: 100 isomorphism-unique flops for
// CO vs BB that aren't already queued. Output = run-phase<N>.sh plus
// one .txt per board in solver-run/inputs/.
//
// Usage: node solver-run/scripts/gen-next-phase.mjs <N>
//   N = phase number (3, 4, 5, …). Controls which offset of the iso
//       flop list we pull from so consecutive phases don't overlap.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/Jay/poker-gto-guide';
const OUT_DIR = path.join(ROOT, 'solver-run', 'inputs');
const OUTPUTS = path.join(ROOT, 'solver-run', 'outputs');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(OUTPUTS, { recursive: true });

const PHASE = Number(process.argv[2] ?? '3');
const BATCH_SIZE = 100;

const DATA_DIR = path.join(ROOT, 'apps/web/public/data/preflop');
const bbVsCO = JSON.parse(fs.readFileSync(path.join(DATA_DIR, '6max_100bb_bb_vs_CO.json'), 'utf8'));
const coRfi = JSON.parse(fs.readFileSync(path.join(DATA_DIR, '6max_100bb_rfi_CO.json'), 'utf8'));

function rangeFromMix(mix, pick) {
  const parts = [];
  for (const [c, m] of Object.entries(mix)) {
    const w = pick(m);
    if (w > 0.005) parts.push(w >= 0.999 ? c : `${c}:${w.toFixed(3)}`);
  }
  return parts.join(',');
}

const OOP = rangeFromMix(bbVsCO, (m) => m.call);
const IP = (() => {
  const parts = [];
  for (const [c, m] of Object.entries(coRfi)) {
    if ((m.raise ?? 0) > 0.005) parts.push(m.raise >= 0.999 ? c : `${c}:${m.raise.toFixed(3)}`);
  }
  return parts.join(',');
})();

/* ---------- Iso flop enumeration ---------- */
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

// Canonical iso flops: every unordered rank triple × 3 suit patterns
// (rainbow ABC, two-tone AAB, monotone AAA). Gives 455 rank triples
// × 3 suit patterns = 1365 distinct "shapes" that cover every real
// flop's strategic profile without redundant suit permutations.
function enumerateIsoFlops() {
  const flops = [];
  for (let i = 0; i < 13; i++) {
    for (let j = i; j < 13; j++) {
      for (let k = j; k < 13; k++) {
        const r = [RANKS[i], RANKS[j], RANKS[k]];
        // Rainbow — three different suits
        flops.push([`${r[0]}s`, `${r[1]}h`, `${r[2]}d`]);
        // Two-tone — top two share a suit
        flops.push([`${r[0]}s`, `${r[1]}s`, `${r[2]}d`]);
        // Monotone — all spades (only one combination matters)
        flops.push([`${r[0]}s`, `${r[1]}s`, `${r[2]}s`]);
      }
    }
  }
  return flops;
}

function flopKey(board) {
  return board.join(',');
}

function boardSlug(board) {
  return board.map((c) => c.toLowerCase()).join('');
}

/* ---------- What's already queued? ---------- */
function existingInputBoards() {
  const set = new Set();
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (!f.endsWith('.txt')) continue;
    const txt = fs.readFileSync(path.join(OUT_DIR, f), 'utf8');
    const m = txt.match(/^set_board\s+(.+)$/m);
    if (m) set.add(m[1].trim().replace(/\s+/g, ''));
  }
  return set;
}

const alreadyQueued = existingInputBoards();
const candidates = enumerateIsoFlops().filter((b) => !alreadyQueued.has(flopKey(b)));
console.log(`iso flops total: ${enumerateIsoFlops().length}, already queued: ${alreadyQueued.size}, fresh: ${candidates.length}`);

// Deterministic stride so phase 3, 4, 5 pull disjoint slices.
const offset = (PHASE - 3) * BATCH_SIZE;
const picks = candidates.slice(offset, offset + BATCH_SIZE);
if (picks.length === 0) {
  console.log('no fresh boards left — iso pool exhausted.');
  process.exit(0);
}

const POT = 5.5;
const EFFECTIVE = 97.5;

function scriptFor(name, board) {
  return [
    `set_pot ${POT}`,
    `set_effective_stack ${EFFECTIVE}`,
    `set_board ${board.join(',')}`,
    `set_range_ip ${IP}`,
    `set_range_oop ${OOP}`,
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
    'set_accuracy 0.25',
    'set_max_iteration 200',
    'set_print_interval 50',
    'set_use_isomorphism 1',
    'start_solve',
    'set_dump_rounds 1',
    `dump_result ${OUTPUTS}/${name}.json`,
  ].join('\n') + '\n';
}

const runnerEntries = [];
for (const board of picks) {
  const name = `phase${PHASE}_CO_${boardSlug(board)}`;
  fs.writeFileSync(path.join(OUT_DIR, `${name}.txt`), scriptFor(name, board));
  runnerEntries.push(name);
}

const runnerLines = [
  '#!/bin/bash',
  'set -u',
  'cd "C:/Users/Jay/Desktop/GTO-Today/TexasSolver-v0.2.0-Windows"',
  'LOG="C:/Users/Jay/poker-gto-guide/solver-run/batch.log"',
  `echo "=== phase${PHASE} start $(date) ===" >> "$LOG"`,
  ...runnerEntries.map((name) => [
    `if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/${name}.json" ]; then`,
    `  echo "[$(date +%H:%M:%S)] ${name} solving..." >> "$LOG"`,
    `  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/${name}.txt" --resource_dir ./resources >> "$LOG" 2>&1`,
    `  echo "[$(date +%H:%M:%S)] ${name} done" >> "$LOG"`,
    `else`,
    `  echo "[$(date +%H:%M:%S)] ${name} SKIPPED (output exists)" >> "$LOG"`,
    `fi`,
  ].join('\n')),
  `echo "=== phase${PHASE} done $(date) ===" >> "$LOG"`,
  '',
].join('\n');

const runnerPath = path.join(ROOT, 'solver-run', `run-phase${PHASE}.sh`);
fs.writeFileSync(runnerPath, runnerLines);
console.log(`wrote ${picks.length} inputs + ${runnerPath}`);
console.log(`estimated wall time: ~${Math.round(picks.length * 4)} min`);
