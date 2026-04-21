#!/usr/bin/env node
// MTT preflop/postflop inputs — same board universe as cash phase 1,
// but with 1BB big-blind ante baked into the pot math:
//   pot = 0.5(SB) + 1(BB) + 1(BBA) + 2.5(opener) + 1.5(BB call) = 6.5
//   eff = 100 - 2.5 - 1(ante for BB side) ≈ 96.5
//
// TexasSolver 0.2 doesn't ship an MTT preflop tree, so we reuse the
// cash RFI/defence ranges — MTT ranges differ mostly in frequency,
// not in combo selection, and the bigger pot (ante dead money) is
// what actually drives different postflop strategy.
//
// Output names are prefixed "mtt_" so the parser can tag them with
// potType:"mtt" → the daily / infinite quiz can pull MTT-only spots
// when the user picked 토너먼트 in /live.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/Jay/poker-gto-guide';
const OUT_DIR = path.join(ROOT, 'solver-run', 'inputs');
const OUTPUTS = path.join(ROOT, 'solver-run', 'outputs');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(OUTPUTS, { recursive: true });

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

// Same 50 textures as phase 1 — easier side-by-side comparison of
// cash vs MTT strategies for training / explanation purposes.
const BOARDS = [
  ['A_dry_A72',     'Ad,7h,2c'],
  ['A_dry_A83',     'As,8d,3c'],
  ['A_dry_AK4',     'As,Kd,4h'],
  ['A_dry_A95',     'Ah,9c,5d'],
  ['A_wet_AJT',     'As,Jh,Th'],
  ['A_wet_AKQ',     'Ad,Kh,Qc'],
  ['A_wet_A98',     'As,9h,8h'],
  ['A_wet_AT8',     'Ac,Th,8h'],
  ['A_paired_A77',  'Ac,7s,7d'],
  ['A_paired_A44',  'Ah,4c,4d'],
  ['K_dry_K72',     'Kh,7d,2c'],
  ['K_dry_K83',     'Ks,8d,3h'],
  ['K_dry_K95',     'Kc,9d,5s'],
  ['K_conn_KQJ',    'Ks,Qd,Jh'],
  ['K_conn_KT9',    'Kh,Tc,9d'],
  ['K_conn_K98',    'Kd,9h,8c'],
  ['K_paired_KK2',  'Ks,Kd,2c'],
  ['K_paired_KK7',  'Kh,Kc,7d'],
  ['Q_dry_Q83',     'Qs,8d,3c'],
  ['Q_dry_Q62',     'Qh,6c,2d'],
  ['Q_wet_QJT',     'Qd,Jh,Tc'],
  ['Q_monotone',    'Qh,Jh,9h'],
  ['Q_paired_Q66',  'Qc,6h,6d'],
  ['J_dry_J72',     'Jc,7h,2d'],
  ['J_wet_JT9',     'Jh,Th,9d'],
  ['J_wet_JT8',     'Js,Td,8h'],
  ['J_paired_J55',  'Jd,5c,5h'],
  ['T_dry_T52',     'Ts,5d,2h'],
  ['T_wet_T98',     'Th,9s,8d'],
  ['T_wet_T87',     'Tc,8h,7d'],
  ['M_dry_975',     '9d,7c,5h'],
  ['M_wet_986',     '9h,8h,6d'],
  ['M_wet_865',     '8d,6c,5s'],
  ['M_dry_763',     '7d,6c,3h'],
  ['M_wet_754',     '7s,5h,4h'],
  ['M_dry_752',     '7c,5d,2h'],
  ['L_dry_632',     '6d,3c,2h'],
  ['L_wet_543',     '5s,4h,3h'],
  ['L_wet_642',     '6h,4h,2s'],
  ['P_mid_883',     '8s,8d,3c'],
  ['P_mid_775',     '7h,7c,5d'],
  ['P_low_664',     '6s,6d,4h'],
  ['P_low_442',     '4d,4c,2h'],
  ['P_low_332',     '3s,3d,2c'],
  ['MT_T84_spade',  'Ts,8s,4s'],
  ['MT_963_heart',  '9h,6h,3h'],
  ['MT_875_club',   '8c,7c,5c'],
  ['TT_J98_h',      'Jh,9h,8d'],
  ['TT_KQT_s',      'Ks,Qs,Td'],
  ['TT_T76_d',      'Td,7d,6s'],
];

const POT = 6.5;
const EFFECTIVE = 96.5;

function scriptFor(name, board) {
  return [
    `set_pot ${POT}`,
    `set_effective_stack ${EFFECTIVE}`,
    `set_board ${board}`,
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

const entries = [];
for (const [boardName, board] of BOARDS) {
  const name = `mtt_CO_${boardName}`;
  fs.writeFileSync(path.join(OUT_DIR, `${name}.txt`), scriptFor(name, board));
  entries.push(name);
}

const runnerLines = [
  '#!/bin/bash',
  'set -u',
  'cd "C:/Users/Jay/Desktop/GTO-Today/TexasSolver-v0.2.0-Windows"',
  'LOG="C:/Users/Jay/poker-gto-guide/solver-run/batch.log"',
  'echo "=== mtt start $(date) ===" >> "$LOG"',
  ...entries.map((name) => [
    `if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/${name}.json" ]; then`,
    `  echo "[$(date +%H:%M:%S)] ${name} solving..." >> "$LOG"`,
    `  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/${name}.txt" --resource_dir ./resources >> "$LOG" 2>&1`,
    `  echo "[$(date +%H:%M:%S)] ${name} done" >> "$LOG"`,
    `else`,
    `  echo "[$(date +%H:%M:%S)] ${name} SKIPPED" >> "$LOG"`,
    `fi`,
  ].join('\n')),
  'echo "=== mtt done $(date) ===" >> "$LOG"',
  '',
].join('\n');

fs.writeFileSync(path.join(ROOT, 'solver-run', 'run-mtt.sh'), runnerLines);
console.log(`wrote ${entries.length} MTT inputs + run-mtt.sh`);
console.log(`pot=${POT}, eff=${EFFECTIVE}  (cash: 5.5 / 97.5)`);
console.log(`estimated wall time: ~${Math.round(entries.length * 4)} min`);
