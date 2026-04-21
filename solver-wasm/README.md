# gto-today-solver-wasm

WASM bindings around the **postflop-solver** Rust crate ([b-inary/postflop-solver](https://github.com/b-inary/postflop-solver)), exposing a single `solve_flop` entry point that the gto.today Next.js app invokes from a Vercel Function.

## License

**AGPL-3.0** — inherited from postflop-solver. This package is intentionally kept in a separate (public) codebase so that our main gto.today app can stay closed-source while still benefiting from the solver. The main app links to this package via HTTP / npm dependency only, never as source — **mere aggregation** under AGPL's terms.

If you fork, modify, or redistribute this crate **you must publish your source**.

## Build

Requires: Rust 1.75+, `wasm-pack` (`cargo install wasm-pack`).

```bash
# Target nodejs — Vercel Function runtime
wasm-pack build --target nodejs --release

# Output lands in pkg/
# - pkg/gto_today_solver_wasm.js         (JS bindings)
# - pkg/gto_today_solver_wasm_bg.wasm    (compiled)
# - pkg/package.json
```

## Publish

Publish to GitHub Packages (or npm) from CI:

```bash
cd pkg
npm publish --access public
```

## Consumer usage (apps/web)

```ts
import { solve_flop } from '@gto-today/solver-wasm';

const result = solve_flop({
  board: ['As', 'Kh', '7d'],
  oop_range: 'AA,KK,...',
  ip_range: '...',
  pot: 5.5,
  eff_stack: 97.5,
  accuracy: 0.5,
  max_iter: 150,
});
// → { actions: ['check','bet33','bet75'], mix: { AsKh: [0.4,0.3,0.3], ... }, exploitability: 0.42, iterations: 87 }
```

## Bet tree

The flop tree is fixed at:
- Flop: Check / Bet 33% / Bet 75% → face-bet: Call / Raise 3x / Fold
- Turn: Check / Bet 60% / Bet 125% → face-bet: Call / Raise 3x / Fold
- River: same as turn

To customise sizing you'd need to change `TreeConfig` in `src/lib.rs` and rebuild.
