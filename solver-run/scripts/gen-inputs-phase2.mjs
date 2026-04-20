#!/usr/bin/env node
// Phase 2 — add 4 more preflop scenarios (UTG/MP/BTN/SB vs BB) on
// a curated 15-board subset. Appends to solver-run/inputs/ and
// creates run-phase2.sh.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/Jay/poker-gto-guide';
const OUT_DIR = path.join(ROOT, 'solver-run', 'inputs');
const OUT_OUTPUTS = path.join(ROOT, 'solver-run', 'outputs');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(OUT_OUTPUTS, { recursive: true });

const DATA_DIR = path.join(ROOT, 'apps/web/public/data/preflop');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, p), 'utf8'));
}

function rangeFromMix(mix, pick) {
  const parts = [];
  for (const [c, m] of Object.entries(mix)) {
    const w = pick(m);
    if (w > 0.005) parts.push(w >= 0.999 ? c : `${c}:${w.toFixed(3)}`);
  }
  return parts.join(',');
}

// Scenario definitions. For each, read the opener's RFI (IP range) and
// BB's defense vs that opener (OOP range). BB vs SB isn't in our data
// under "bb_vs_sb" — skip SB if missing.
const SCENARIOS = [
  {
    tag: 'UTG',
    oopFile: '6max_100bb_bb_vs_UTG.json',
    ipFile: '6max_100bb_rfi_UTG.json',
    pot: 5.5,
    eff: 97.5,
  },
  {
    tag: 'MP',
    oopFile: '6max_100bb_bb_vs_MP.json',
    ipFile: '6max_100bb_rfi_MP.json',
    pot: 5.5,
    eff: 97.5,
  },
  {
    tag: 'BTN',
    oopFile: '6max_100bb_bb_vs_BTN.json',
    ipFile: '6max_100bb_rfi_BTN.json',
    pot: 5.5,
    eff: 97.5,
  },
  {
    tag: 'SB',
    oopFile: '6max_100bb_bb_vs_SB.json',
    ipFile: '6max_100bb_rfi_SB.json',
    pot: 6, // SB 3x + BB 3 = 6bb
    eff: 97,
  },
];

// 15 most representative textures from phase 1
const BOARDS = [
  ['A_dry_A72',    'Ad,7h,2c'],
  ['A_dry_AK4',    'As,Kd,4h'],
  ['A_wet_AJT',    'As,Jh,Th'],
  ['K_dry_K72',    'Kh,7d,2c'],
  ['K_conn_K98',   'Kd,9h,8c'],
  ['K_paired_KK2', 'Ks,Kd,2c'],
  ['Q_dry_Q83',    'Qs,8d,3c'],
  ['Q_wet_QJT',    'Qd,Jh,Tc'],
  ['Q_monotone',   'Qh,Jh,9h'],
  ['J_wet_JT9',    'Jh,Th,9d'],
  ['T_wet_T98',    'Th,9s,8d'],
  ['M_dry_975',    '9d,7c,5h'],
  ['M_wet_865',    '8d,6c,5s'],
  ['P_mid_883',    '8s,8d,3c'],
  ['L_dry_632',    '6d,3c,2h'],
];

function scriptFor(name, board, oopRange, ipRange, pot, eff) {
  return [
    `set_pot ${pot}`,
    `set_effective_stack ${eff}`,
    `set_board ${board}`,
    `set_range_ip ${ipRange}`,
    `set_range_oop ${oopRange}`,
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
    `dump_result ${OUT_OUTPUTS}/${name}.json`,
  ].join('\n') + '\n';
}

const allNewBoards = [];
let skipped = 0;
for (const scn of SCENARIOS) {
  const oopPath = path.join(DATA_DIR, scn.oopFile);
  const ipPath = path.join(DATA_DIR, scn.ipFile);
  if (!fs.existsSync(oopPath) || !fs.existsSync(ipPath)) {
    console.log(`  ⊘ ${scn.tag} — missing source files, skipped`);
    skipped++;
    continue;
  }
  const bbDef = loadJson(scn.oopFile);
  const rfi = loadJson(scn.ipFile);
  const oopRange = rangeFromMix(bbDef, (m) => m.call);
  // RFI JSONs have { raise, fold } per combo.
  const ipParts = [];
  for (const [c, m] of Object.entries(rfi)) {
    if ((m.raise ?? 0) > 0.005) {
      ipParts.push(m.raise >= 0.999 ? c : `${c}:${m.raise.toFixed(3)}`);
    }
  }
  const ipRange = ipParts.join(',');

  for (const [boardName, board] of BOARDS) {
    const fullName = `${scn.tag}_vs_BB__${boardName}`;
    const inputFile = path.join(OUT_DIR, `${fullName}.txt`);
    fs.writeFileSync(
      inputFile,
      scriptFor(fullName, board, oopRange, ipRange, scn.pot, scn.eff),
    );
    allNewBoards.push(fullName);
  }
  console.log(`  ✓ ${scn.tag} vs BB — ${BOARDS.length} inputs  (OOP=${oopRange.split(',').length}, IP=${ipRange.split(',').length})`);
}

// Runner script that executes ONLY the new phase-2 boards, resumable
// via existing-output skip.
const runnerLines = [
  '#!/bin/bash',
  'set -u',
  'cd "C:/Users/Jay/Desktop/GTO-Today/TexasSolver-v0.2.0-Windows"',
  'LOG="C:/Users/Jay/poker-gto-guide/solver-run/batch.log"',
  'echo "=== phase2 start $(date) ===" >> "$LOG"',
  ...allNewBoards.map((name) => [
    `if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/${name}.json" ]; then`,
    `  echo "[$(date +%H:%M:%S)] ${name} solving..." >> "$LOG"`,
    `  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/${name}.txt" --resource_dir ./resources >> "$LOG" 2>&1`,
    `  echo "[$(date +%H:%M:%S)] ${name} done" >> "$LOG"`,
    `else`,
    `  echo "[$(date +%H:%M:%S)] ${name} SKIPPED (output exists)" >> "$LOG"`,
    `fi`,
  ].join('\n')),
  'echo "=== phase2 done $(date) ===" >> "$LOG"',
  '',
].join('\n');

fs.writeFileSync(path.join(ROOT, 'solver-run', 'run-phase2.sh'), runnerLines);
console.log(`\nwrote ${allNewBoards.length} new input scripts + run-phase2.sh`);
console.log(`scenarios: ${SCENARIOS.length - skipped}/${SCENARIOS.length}`);
console.log(`estimated phase2 wall time: ~${Math.round(allNewBoards.length * 4)}min`);
