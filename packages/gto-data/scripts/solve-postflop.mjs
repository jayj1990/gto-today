#!/usr/bin/env node
/**
 * solve-postflop.mjs — batch driver for TexasSolver.
 *
 * Generates TexasSolver input files for every scenario listed in the
 * SCENARIOS constant, invokes the solver's console binary, collects the
 * JSON strategy dumps, and converts them into our internal
 * PostflopStrategyJson format under apps/web/public/data/postflop/.
 *
 * Usage
 * -----
 *  1. Download TexasSolver for your OS from:
 *       https://github.com/bupticybee/TexasSolver/releases
 *  2. Unzip and point SOLVER_BIN (env var) at the `console_solver` binary.
 *     e.g.  Windows → C:\\Tools\\TexasSolver\\console_solver.exe
 *           macOS   → ~/TexasSolver/console_solver
 *  3. From repo root:
 *       SOLVER_BIN=/path/to/console_solver \
 *         pnpm --filter @gto/gto-data solve:postflop
 *
 * The script skips any scenario whose output JSON already exists so reruns
 * are cheap. Delete the file under ../tmp/solver-out/ to force a re-solve.
 *
 * ── License note ──
 * TexasSolver itself is AGPL v3. This script only INVOKES the binary — it
 * does not embed or redistribute the solver's code. The JSON dumps the
 * solver produces are treated as user-generated output (same as running
 * any CLI tool on your own machine) and can be shipped with our app.
 * Keep the binary outside this repo to avoid any licensing ambiguity.
 */
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const TMP_DIR = join(REPO_ROOT, 'packages', 'gto-data', 'tmp', 'solver');
const OUT_DIR = join(REPO_ROOT, 'apps', 'web', 'public', 'data', 'postflop');

const SOLVER_BIN = process.env.SOLVER_BIN;
if (!SOLVER_BIN) {
  console.error('✗ SOLVER_BIN is not set. See header comment for setup.');
  process.exit(1);
}

/**
 * Scenarios to solve. Start small — each entry is a separate solver run,
 * and preflop-range-in / postflop solve takes 30s – 5min depending on
 * complexity.
 *
 * Board string follows TexasSolver conventions: "As,Kd,2h" for a flop.
 * Ranges use "Hand:frequency" syntax — we use the same notation that
 * our own PreflopStrategyJson emits so we can feed our own seed ranges
 * straight into the solver.
 *
 * Phase 5 ships with the 5 highest-traffic spots; expand this list as
 * needed without touching anything else in the script.
 */
const SCENARIOS = [
  {
    id: 'btn-vs-bb-srp-axx-flop',
    description: 'BTN vs BB SRP on A-high dry flop',
    pot: 5.5,            // 2.5 open + 2.5 call + 0.5 sb
    effective_stack: 97.5,
    board: 'As,9h,4c',
    range_ip: 'btn-rfi',  // references a preflop chart → script expands
    range_oop: 'bb-defend-vs-btn',
    bet_sizes: [
      'oop,flop,bet,33',
      'ip,flop,bet,33,66',
      'oop,flop,raise,2.5x',
    ],
    allin_threshold: 0.67,
  },
  {
    id: 'co-vs-bb-srp-low-connected-flop',
    description: 'CO vs BB SRP on low-connected flop',
    pot: 5.5,
    effective_stack: 97.5,
    board: '8h,7d,6s',
    range_ip: 'co-rfi',
    range_oop: 'bb-defend-vs-co',
    bet_sizes: ['oop,flop,bet,50', 'ip,flop,bet,33,75', 'oop,flop,raise,3x'],
    allin_threshold: 0.67,
  },
  {
    id: 'btn-vs-bb-3bp-broadway-flop',
    description: 'BTN vs BB 3-bet pot on broadway flop',
    pot: 18,
    effective_stack: 91,
    board: 'Kd,Qs,7h',
    range_ip: 'btn-call-vs-bb-3bet',
    range_oop: 'bb-3bet-vs-btn',
    bet_sizes: ['oop,flop,bet,33', 'ip,flop,bet,50', 'oop,flop,raise,3x'],
    allin_threshold: 0.67,
  },
];

/**
 * Range reference → actual Hand:freq string lookup.
 * Populated lazily from our preflop JSON data under /public/data/preflop/.
 * For now, stub. Will wire up real loader once solver path is validated
 * end-to-end on the user's machine.
 */
async function resolveRange(_ref) {
  // TODO: load packages/gto-data/src/ranges/*.ts output into a Hand:freq
  // string for each seat key. For the first dry-run we just hardcode a
  // trivial range so the pipeline flows.
  return 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AKo,AQs,AQo,AJs,ATs,KQs,KJs,QJs,JTs';
}

function buildInputScript(scenario, ranges) {
  const lines = [];
  lines.push(`set_pot ${scenario.pot}`);
  lines.push(`set_effective_stack ${scenario.effective_stack}`);
  lines.push(`set_board ${scenario.board}`);
  lines.push(`set_range_ip ${ranges.ip}`);
  lines.push(`set_range_oop ${ranges.oop}`);
  for (const bs of scenario.bet_sizes) lines.push(`set_bet_sizes ${bs}`);
  lines.push(`set_allin_threshold ${scenario.allin_threshold ?? 0.67}`);
  lines.push('build_tree');
  lines.push('start_solve');
  return lines.join('\n');
}

function run(bin, args, opts = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(bin, args, { stdio: 'inherit', ...opts });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${bin} exited ${code}`));
    });
  });
}

async function exists(path) {
  try {
    await access(path, FS.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Minimal converter — TexasSolver output → our PostflopStrategyJson.
 * Real mapping depends on the exact shape of TexasSolver's dump, which
 * we confirm on first real run. This stub passes the JSON through and
 * tags it with our metadata so downstream consumers can detect partial
 * conversions.
 */
async function convert(solverJsonPath, outPath, scenario) {
  const raw = await readFile(solverJsonPath, 'utf8');
  const parsed = JSON.parse(raw);
  const wrapped = {
    version: 0, // bump once the real converter lands
    scenario: {
      id: scenario.id,
      description: scenario.description,
      board: scenario.board,
      pot: scenario.pot,
      effectiveStack: scenario.effective_stack,
    },
    raw: parsed,
  };
  await writeFile(outPath, JSON.stringify(wrapped));
}

async function main() {
  await mkdir(TMP_DIR, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });

  for (const scenario of SCENARIOS) {
    const outFile = join(OUT_DIR, `${scenario.id}.json`);
    const tmpIn = join(TMP_DIR, `${scenario.id}.in.txt`);
    const tmpOut = join(TMP_DIR, `${scenario.id}.out.json`);

    if (await exists(outFile)) {
      console.log(`→ ${scenario.id} already solved, skipping`);
      continue;
    }

    console.log(`⚙  ${scenario.id}: ${scenario.description}`);

    const ranges = {
      ip: await resolveRange(scenario.range_ip),
      oop: await resolveRange(scenario.range_oop),
    };
    const script = buildInputScript(scenario, ranges);
    await writeFile(tmpIn, script);

    const startedAt = Date.now();
    await run(SOLVER_BIN, ['-i', tmpIn, '-o', tmpOut]);
    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);

    await convert(tmpOut, outFile, scenario);
    console.log(`✓ ${scenario.id} solved in ${elapsed}s → ${outFile}`);
  }

  console.log(`\nDone. ${SCENARIOS.length} scenarios processed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
