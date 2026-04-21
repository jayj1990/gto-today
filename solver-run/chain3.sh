#!/bin/bash
# Continuous solver pipeline — runs phase 3, 4, 5, 6 in sequence after
# the current chain.sh finishes. After each phase completes, re-runs
# the parser to regenerate solver-spots.ts with the cumulative spots,
# then commits + pushes the update so Jay wakes up to progress even
# if he doesn't touch the keyboard for a day.
#
# Each phase is ~6.5h of CPU, so total runtime is ~26h once kicked
# off (after phase 2 + chain.sh has produced ~550 spots, phase 3-6
# adds another ~2000). Totally resumable — if any phase dies the
# existing-output skip inside run-phaseN.sh picks up where it left.
set -u

REPO="C:/Users/Jay/poker-gto-guide"
LOG="$REPO/solver-run/batch.log"
WATCH="$REPO/solver-run/watchdog.log"

echo "=== chain3 start $(date) ===" >> "$WATCH"

# Wait for the primary chain (phase2 parser) to finish first.
echo "[$(date +%H:%M:%S)] waiting for primary chain (=== chain done)" >> "$WATCH"
while ! grep -q "=== chain done" "$WATCH" 2>/dev/null; do
  sleep 120
done
echo "[$(date +%H:%M:%S)] primary chain done — starting phase 3" >> "$WATCH"

run_phase () {
  local N="$1"
  local SCRIPT="$REPO/solver-run/run-phase${N}.sh"
  if [ ! -f "$SCRIPT" ]; then
    echo "[$(date +%H:%M:%S)] phase${N} script missing — skipping" >> "$WATCH"
    return 0
  fi

  echo "[$(date +%H:%M:%S)] ▶ phase${N} begin" >> "$WATCH"
  bash "$SCRIPT"

  # Wait for the marker the runner writes.
  while ! grep -q "=== phase${N} done" "$LOG" 2>/dev/null; do
    sleep 60
  done
  echo "[$(date +%H:%M:%S)] ✓ phase${N} done — parsing" >> "$WATCH"

  # Re-parse + typecheck with cumulative outputs.
  cd "$REPO"
  node solver-run/scripts/parse-outputs.mjs >> "$WATCH" 2>&1
  pnpm typecheck >> "$WATCH" 2>&1 || {
    echo "[$(date +%H:%M:%S)] typecheck FAILED after phase${N} — stopping chain" >> "$WATCH"
    exit 1
  }

  # Auto-commit + push so the repo reflects progress overnight.
  git add packages/gto-data/ >> "$WATCH" 2>&1
  git commit -m "data(solver): phase ${N} adds $(ls solver-run/outputs/phase${N}_*.json 2>/dev/null | wc -l) more CO-vs-BB boards" >> "$WATCH" 2>&1
  git push origin main >> "$WATCH" 2>&1
  echo "[$(date +%H:%M:%S)] ✓ phase${N} pushed" >> "$WATCH"
}

for N in 3 4 5 6; do
  run_phase "$N"
done

echo "=== chain3 done $(date) ===" >> "$WATCH"
