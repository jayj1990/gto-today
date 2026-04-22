#!/usr/bin/env node
// Generate one solver input file per board for the "BB call vs CO 2.5x"
// postflop spot. OOP (BB) and IP (CO) ranges are read from the preflop
// JSONs so they match what the app displays.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/Jay/poker-gto-guide';
const OUT_DIR = path.join(ROOT, 'solver-run', 'inputs');
fs.mkdirSync(OUT_DIR, { recursive: true });

const bbVsCO = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'apps/web/public/data/preflop/6max_100bb_bb_vs_CO.json'), 'utf8'),
);
const coRfi = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'apps/web/public/data/preflop/6max_100bb_rfi_CO.json'), 'utf8'),
);

function rangeFromMix(mix, pick) {
  const parts = [];
  for (const [c, m] of Object.entries(mix)) {
    const w = pick(m);
    if (w > 0.005) parts.push(w >= 0.999 ? c : `${c}:${w.toFixed(3)}`);
  }
  return parts.join(',');
}

const OOP = rangeFromMix(bbVsCO, (m) => m.call);
const IP = rangeFromMix(coRfi, (m) => m.raise);

// 50 flops covering common textures for BB-call vs CO-open spot.
// Names used as file prefixes — stay filesystem-safe.
const BOARDS = [
  // A-high dry
  ['A_dry_A72',    'Ad,7h,2c'],
  ['A_dry_A83',    'As,8d,3c'],
  ['A_dry_AK4',    'As,Kd,4h'],
  ['A_dry_A95',    'Ah,9c,5d'],
  // A-high wet
  ['A_wet_AJT',    'As,Jh,Th'],
  ['A_wet_AKQ',    'Ad,Kh,Qc'],
  ['A_wet_A98',    'As,9h,8h'],
  ['A_wet_AT8',    'Ac,Th,8h'],
  // A-paired
  ['A_paired_A77', 'Ac,7s,7d'],
  ['A_paired_A44', 'Ah,4c,4d'],
  // K-high dry
  ['K_dry_K72',    'Kh,7d,2c'],
  ['K_dry_K83',    'Ks,8d,3h'],
  ['K_dry_K95',    'Kc,9d,5s'],
  // K-high connected
  ['K_conn_KQJ',   'Ks,Qd,Jh'],
  ['K_conn_KT9',   'Kh,Tc,9d'],
  ['K_conn_K98',   'Kd,9h,8c'],
  // K-paired
  ['K_paired_KK2', 'Ks,Kd,2c'],
  ['K_paired_KK7', 'Kh,Kc,7d'],
  // Q-high
  ['Q_dry_Q83',    'Qs,8d,3c'],
  ['Q_dry_Q62',    'Qh,6c,2d'],
  ['Q_wet_QJT',    'Qd,Jh,Tc'],
  ['Q_monotone',   'Qh,Jh,9h'],
  ['Q_paired_Q66', 'Qc,6h,6d'],
  // J-high
  ['J_dry_J72',    'Jc,7h,2d'],
  ['J_wet_JT9',    'Jh,Th,9d'],
  ['J_wet_JT8',    'Js,Td,8h'],
  ['J_paired_J55', 'Jd,5c,5h'],
  // T-high
  ['T_dry_T52',    'Ts,5d,2h'],
  ['T_wet_T98',    'Th,9s,8d'],
  ['T_wet_T87',    'Tc,8h,7d'],
  // Middle-low
  ['M_dry_975',    '9d,7c,5h'],
  ['M_wet_986',    '9h,8h,6d'],
  ['M_wet_865',    '8d,6c,5s'],
  ['M_dry_763',    '7d,6c,3h'],
  ['M_wet_754',    '7s,5h,4h'],
  ['M_dry_752',    '7c,5d,2h'],
  // Low
  ['L_dry_632',    '6d,3c,2h'],
  ['L_wet_543',    '5s,4h,3h'],
  ['L_wet_642',    '6h,4h,2s'],
  // Paired
  ['P_mid_883',    '8s,8d,3c'],
  ['P_mid_775',    '7h,7c,5d'],
  ['P_low_664',    '6s,6d,4h'],
  ['P_low_442',    '4d,4c,2h'],
  ['P_low_332',    '3s,3d,2c'],
  // Monotone
  ['MT_T84_spade', 'Ts,8s,4s'],
  ['MT_963_heart', '9h,6h,3h'],
  ['MT_875_club',  '8c,7c,5c'],
  // Two-tone aggressive
  ['TT_J98_h',     'Jh,9h,8d'],
  ['TT_KQT_s',     'Ks,Qs,Td'],
  ['TT_T76_d',     'Td,7d,6s'],
];

const POT = 5.5;
const EFFECTIVE = 97.5;

function scriptFor(name, board) {
  return [
    `set_pot ${POT}`,
    `set_effective_stack ${EFFECTIVE}`,
    `set_board ${board}`,
    `set_range_ip ${IP}`,
    `set_range_oop ${OOP}`,
    // Flop — GTO-typical simplified tree
    'set_bet_sizes ip,flop,bet,33,75',
    'set_bet_sizes ip,flop,raise,300',
    'set_bet_sizes oop,flop,bet,33,75',
    'set_bet_sizes oop,flop,donk,33',
    'set_bet_sizes oop,flop,raise,300',
    // Turn
    'set_bet_sizes ip,turn,bet,60,125',
    'set_bet_sizes ip,turn,raise,300',
    'set_bet_sizes oop,turn,bet,60,125',
    'set_bet_sizes oop,turn,raise,300',
    // River
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
    `dump_result C:/Users/Jay/poker-gto-guide/solver-run/outputs/${name}.json`,
  ].join('\n') + '\n';
}

fs.mkdirSync(path.join(ROOT, 'solver-run', 'outputs'), { recursive: true });

for (const [name, board] of BOARDS) {
  fs.writeFileSync(path.join(OUT_DIR, `${name}.txt`), scriptFor(name, board));
}

// Master runner — sequential through every input. Skips any board whose
// output already exists so the batch is resumable on crash / reboot.
const runnerLines = [
  '#!/bin/bash',
  'set -u',
  'cd "C:/Users/Jay/Desktop/GTO-Today/TexasSolver-v0.2.0-Windows"',
  'LOG="C:/Users/Jay/poker-gto-guide/solver-run/batch.log"',
  'echo "=== batch start $(date) ===" >> "$LOG"',
  ...BOARDS.map(([name]) => [
    `if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/${name}.json" ]; then`,
    `  echo "[$(date +%H:%M:%S)] ${name} solving..." >> "$LOG"`,
    `  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/${name}.txt" --resource_dir ./resources >> "$LOG" 2>&1`,
    `  echo "[$(date +%H:%M:%S)] ${name} done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/${name}.json 2>/dev/null || echo 0))" >> "$LOG"`,
    `else`,
    `  echo "[$(date +%H:%M:%S)] ${name} SKIPPED (output exists)" >> "$LOG"`,
    `fi`,
  ].join('\n')),
  'echo "=== batch done $(date) ===" >> "$LOG"',
  '',
].join('\n');

fs.writeFileSync(path.join(ROOT, 'solver-run', 'run-all.sh'), runnerLines);
console.log(`wrote ${BOARDS.length} input scripts + run-all.sh`);
console.log(`OOP entries: ${OOP.split(',').length}, IP entries: ${IP.split(',').length}`);
console.log(`estimated wall time: ~${Math.round(BOARDS.length * 5.5)}min (at ~5.5 min/board)`);
