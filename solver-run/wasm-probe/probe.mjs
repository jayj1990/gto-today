#!/usr/bin/env node
// Probe the @jayj1990/gto-today-solver-wasm engine in a controlled Node
// environment (no Vercel Function timeout, no cold-start memory cap)
// to determine whether WASM is a viable Tier 2 batch engine alongside
// or instead of TexasSolver CLI.
//
// Loads the WASM package straight out of pnpm cache — no need to
// reinstall it into a workspace.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const WASM_PKG = path.join(
  ROOT,
  'node_modules/.pnpm/@jayj1990+gto-today-solver-wasm@0.5.0/node_modules/@jayj1990/gto-today-solver-wasm',
);

const wasmJsUrl = pathToFileURL(path.join(WASM_PKG, 'gto_today_solver_wasm.js')).href;
const wasmMod = await import(wasmJsUrl);
const init = wasmMod.default;
const solve_flop = wasmMod.solve_flop;

// Load the .wasm as bytes and hand it to the web-target wrapper.
const wasmBytes = fs.readFileSync(path.join(WASM_PKG, 'gto_today_solver_wasm_bg.wasm'));
await init(wasmBytes);

// Ranges copied verbatim from solver-run/inputs/phase3_CO_asah2d.txt —
// same CO-open / BB-call preflop lines as the Tier 1 TexasSolver batch.
const IP_RANGE =
  '22:0.673,33:0.873,44,55,66,77,88,99,AA,AKs,AQs,AJs,ATs,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,AKo,KK,KQs,KJs,KTs,K9s,K8s:0.782,K7s:0.477,K6s:0.277,K5s:0.179,AQo,KQo,QQ,QJs,QTs,Q9s,Q8s:0.617,Q7s:0.317,AJo,KJo,QJo,JJ,JTs,J9s,J8s:0.713,J7s:0.315,ATo,KTo,QTo:0.814,JTo:0.710,TT,T9s,T8s,T7s:0.508,A9o:0.703,K9o:0.383,98s,97s:0.708,A8o:0.410,87s,86s:0.479,A7o:0.203,76s,75s:0.505,65s,64s:0.385,A5o:0.303,54s,43s:0.277';

const OOP_RANGE =
  '22:0.710,33:0.815,44:0.903,55,66,77,88,99,AKs:0.069,AQs:0.211,AJs:0.293,ATs:0.304,A9s:0.823,A8s:0.841,A7s:0.689,A6s:0.501,A5s:0.138,A4s:0.139,A3s:0.200,A2s:0.255,AKo:0.173,KQs:0.343,KJs:0.522,KTs:0.708,K9s:0.703,K8s:0.403,K5s:0.249,AQo:0.499,KQo:0.702,QJs:0.764,QTs:0.871,Q9s:0.712,AJo:0.689,KJo:0.797,QJo:0.704,JJ:0.098,JTs:0.859,J9s:0.596,ATo:0.699,KTo:0.500,QTo:0.398,JTo:0.500,TT:0.354,T9s,T8s:0.500,A9o:0.403,98s:0.895,87s:0.809,76s:0.697,65s:0.499,54s:0.459';

const BOARDS = [
  { name: 'As7h2d (A-high dry rainbow)', board: ['As', '7h', '2d'] },
  { name: 'Th9h8d (wet connected two-tone)', board: ['Th', '9h', '8d'] },
  { name: 'As3s3d (paired, TexasSolver segfault)', board: ['As', '3s', '3d'] },
];

const RESULTS = [];

for (const { name, board } of BOARDS) {
  console.log(`\n─── ${name} ───`);
  const start = Date.now();
  try {
    const out = solve_flop({
      board,
      oop_range: OOP_RANGE,
      ip_range: IP_RANGE,
      pot: 5.5,
      eff_stack: 97.5,
      accuracy: 0.25, // match TexasSolver batch target
      max_iter: 200,  // match TexasSolver batch cap
    });
    const elapsedMs = Date.now() - start;
    const mixSize = out.mix ? Object.keys(out.mix).length : 0;

    // Extract top action per combo and the range-wide distribution.
    const topActionCount = {};
    if (out.mix) {
      for (const [, freqs] of Object.entries(out.mix)) {
        const topIdx = freqs.reduce((bi, v, i, a) => (v > a[bi] ? i : bi), 0);
        const topAction = out.actions[topIdx];
        topActionCount[topAction] = (topActionCount[topAction] ?? 0) + 1;
      }
    }

    const result = {
      board: board.join(','),
      status: 'ok',
      elapsedMs,
      exploitability: out.exploitability,
      iterations: out.iterations,
      actions: out.actions,
      combos: mixSize,
      topActionCount,
    };
    RESULTS.push(result);
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    const elapsedMs = Date.now() - start;
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    RESULTS.push({ board: board.join(','), status: 'error', elapsedMs, error: msg });
    console.error(`FAILED after ${elapsedMs}ms — ${msg}`);
  }
}

fs.writeFileSync(
  path.join(__dirname, 'results.json'),
  JSON.stringify(RESULTS, null, 2),
);
console.log('\n─── summary written to results.json ───');
