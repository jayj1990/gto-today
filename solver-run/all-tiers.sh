#!/bin/bash
# Master orchestrator — runs every shipped defender × opener pairing
# through all 1,755 canonical flops sequentially, committing + pushing
# after each tier completes.
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

# Pairing list — each is "DEFENDER:OPENER". 15 pairings ordered by
# real-game frequency so the most useful data ships first.
#
# Frequency rationale (6-max 100BB cash, approximate):
#   BB:BTN, BB:CO, SB:BTN — late-position steals BB/SB face daily
#   BB:SB                 — heads-up SB-vs-BB pot
#   SB:CO                 — SB defending CO open
#   BB:MP, BB:UTG         — early opens BB defends (less wide)
#   SB:MP, SB:UTG         — SB defending early opens
#   BTN:CO/MP/UTG         — BTN as 3-bettor (in-position 3bet pots, rarer)
#   CO:MP, CO:UTG, MP:UTG — squeeze pots (rarest, need open + caller)
#
# BB:CO is kept at the front because the in-flight tier is already
# 62 % done — wiping it to chase BB:BTN would burn ~30 hr of compute
# for no marginal data win.
PAIRINGS=(
  "BB:CO"                                  # in-flight (~62 % done) — finish first
  "BB:BTN"   "SB:BTN"   "BB:SB"            # late-position steal cluster
  "SB:CO"
  "BB:MP"    "BB:UTG"                      # BB vs early opens
  "SB:MP"    "SB:UTG"                      # SB vs early opens
  "BTN:CO"   "BTN:MP"   "BTN:UTG"          # BTN 3bet pots
  "CO:MP"    "CO:UTG"   "MP:UTG"           # squeeze pots
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

# Final sweep — catch any raw outputs / inputs that survived a push
# failure mid-chain. By the time we hit this line every pairing's
# strategy data is already in git via solver-spots.ts, so every raw
# JSON + input txt under solver-run/{outputs,inputs}/ is disposable.
FINAL_BEFORE=$(du -sh "$REPO/solver-run/outputs" 2>/dev/null | awk '{print $1}')
rm -f "$REPO/solver-run/outputs/full_"*.json
rm -f "$REPO/solver-run/inputs/full_"*.txt
FINAL_AFTER=$(du -sh "$REPO/solver-run/outputs" 2>/dev/null | awk '{print $1}')
echo "[$(date +%H:%M:%S)] ✓ final sweep: outputs ${FINAL_BEFORE} → ${FINAL_AFTER}" >> "$LOG"
