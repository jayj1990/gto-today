#!/bin/bash
# Master orchestrator — runs every shipped defender × opener pairing
# through all 1,755 canonical flops sequentially, committing + pushing
# after each tier completes.
#
# Ordered by realistic frequency (most-common spots first) so users
# benefit as each tier finishes:
#
#   Tier 2: BB defense (5 openers)
#   Tier 3: BTN in-position 3bet defense (3 openers)
#   Tier 4: SB OOP defense (4 openers)
#   Tier 5: CO + MP squeeze (3 openers)
#
# Resumable: each run-full-X-vs-Y.sh checks `[ ! -s output.json ]`
# before calling the solver, so killing + restarting resumes mid-tier.
#
# Rough wall time per tier (1,755 spots × ~2 min each at set_accuracy
# 0.5, max_iter 120): ~2.5 days/tier. Full chain ~37 days.
set -u

REPO="C:/Users/Jay/poker-gto-guide"
LOG="$REPO/solver-run/all-tiers.log"

echo "=== all-tiers start $(date) ===" >> "$LOG"

# Pairing list — each is "DEFENDER:OPENER". All 15 combos we ship
# preflop data for, ordered by expected play-frequency.
PAIRINGS=(
  "BB:CO"    "BB:BTN"  "BB:SB"    "BB:UTG"   "BB:MP"
  "BTN:CO"   "BTN:MP"  "BTN:UTG"
  "SB:BTN"   "SB:CO"   "SB:MP"    "SB:UTG"
  "CO:MP"    "CO:UTG"
  "MP:UTG"
)

for PAIR in "${PAIRINGS[@]}"; do
  DEF="${PAIR%:*}"
  OPN="${PAIR#*:}"
  NAME="full_${DEF}_vs_${OPN}"
  RUNNER="$REPO/solver-run/run-${NAME//_/-}.sh"

  echo "[$(date +%H:%M:%S)] ▶ ${NAME} begin" >> "$LOG"

  # Regenerate inputs each time so changes in range data propagate.
  cd "$REPO"
  node solver-run/scripts/gen-input-all-flops.mjs \
    --defender="$DEF" --opener="$OPN" >> "$LOG" 2>&1

  if [ ! -f "$RUNNER" ]; then
    echo "[$(date +%H:%M:%S)] runner missing for ${NAME} — skipping" >> "$LOG"
    continue
  fi

  # Blocking run — each pairing ~2.5 days of solver time.
  bash "$RUNNER"

  echo "[$(date +%H:%M:%S)] ✓ ${NAME} batch done — parsing" >> "$LOG"

  # Parse + typecheck + commit + push.
  node solver-run/scripts/parse-outputs.mjs >> "$LOG" 2>&1
  pnpm typecheck >> "$LOG" 2>&1 || {
    echo "[$(date +%H:%M:%S)] typecheck FAILED after ${NAME} — stopping chain" >> "$LOG"
    exit 1
  }

  # Commit only if something changed (idempotent re-runs are safe).
  PUSHED=0
  if ! git diff --quiet packages/gto-data/ 2>/dev/null; then
    COUNT=$(ls "$REPO/solver-run/outputs/${NAME}_"*.json 2>/dev/null | wc -l)
    git add packages/gto-data/ >> "$LOG" 2>&1
    git commit -m "data(solver): ${NAME} — ${COUNT} boards (all-iso)" >> "$LOG" 2>&1
    if git push origin main >> "$LOG" 2>&1; then
      PUSHED=1
      echo "[$(date +%H:%M:%S)] ✓ ${NAME} pushed (${COUNT} boards)" >> "$LOG"
    else
      echo "[warn] push failed — continuing" >> "$LOG"
    fi
  else
    echo "[$(date +%H:%M:%S)] ${NAME} produced no new data" >> "$LOG"
  fi

  # Auto-cleanup raw outputs after successful push — the strategy data
  # is permanently in git via solver-spots.ts at this point, the raw
  # JSON is no longer needed and would otherwise accumulate to ~7 GB
  # across the 15 pairings. Skip cleanup if push failed so the data
  # can be re-parsed/re-pushed manually.
  if [ "$PUSHED" = "1" ]; then
    BEFORE=$(du -sh "$REPO/solver-run/outputs/${NAME}_"*.json 2>/dev/null | tail -1 | awk '{print $1}')
    rm -f "$REPO/solver-run/outputs/${NAME}_"*.json
    rm -f "$REPO/solver-run/inputs/${NAME}_"*.txt
    echo "[$(date +%H:%M:%S)] ✓ cleaned ${NAME} raw outputs + inputs (~${BEFORE})" >> "$LOG"
  fi
done

echo "=== all-tiers done $(date) ===" >> "$LOG"
