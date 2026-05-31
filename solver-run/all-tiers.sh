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
#
# Order = priority. The first 6 entries (BB:CO + 5 core) cover ~80%
# of real-game spots and ship first. The deferred 9 follow once the
# core lands. The git-log skip guard makes this self-healing across
# crashes / restarts — already-shipped pairings auto-skip.
PAIRINGS=(
  "BB:CO"                                  # done
  "BB:BTN"                                 # done
  "BB:SB"                                  # core (BB defends SB open)
  "BB:MP"                                  # core (BB vs MP)
  "BB:UTG"                                 # core (BB vs UTG)
  "BTN:CO"   "BTN:MP"   "BTN:UTG"          # BTN as defender (in-position calls)
  # ── REMOVED 2026-05-07: defenders below have call%=0 in the
  # preflop charts (squeeze/3bet-only positions). Running the
  # solver against an empty OOP range produces trivial garbage
  # data. Re-add only after building dedicated 3bet-pot ranges:
  #   SB:BTN  SB:CO   SB:MP   SB:UTG   (SB never flats)
  #   CO:MP   CO:UTG  MP:UTG           (squeeze positions)
)

for PAIR in "${PAIRINGS[@]}"; do
  DEF="${PAIR%:*}"
  OPN="${PAIR#*:}"
  NAME="full_${DEF}_vs_${OPN}"
  RUNNER="$REPO/solver-run/run-${NAME//_/-}.sh"

  # Skip pairings already pushed to git. Cleanup empties outputs/, so the
  # per-board "[ ! -s output ]" resume check can't tell the difference
  # between "never solved" and "already shipped". Without this guard a
  # crash + restart would re-solve every prior pairing from scratch
  # (~117h each).
  cd "$REPO"
  if git log --oneline --grep="data(solver): ${NAME} —" 2>/dev/null | grep -q .; then
    echo "[$(date +%H:%M:%S)] ⊘ ${NAME} already in git, skip" >> "$LOG"
    continue
  fi

  echo "[$(date +%H:%M:%S)] ▶ ${NAME} begin" >> "$LOG"

  # Regenerate inputs each time so changes in range data propagate.
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
  # typecheck triggers turbo's full dep graph, which includes
  # gto-data:build → build-preflop, which sometimes hits a transient
  # UNKNOWN errno -4094 writing manifest.json under repeated load
  # (caught 2026-05-31 — SB:BTN looped for 12h on this single race).
  # Retry once after a short pause before treating it as fatal.
  pnpm typecheck >> "$LOG" 2>&1 || {
    echo "[$(date +%H:%M:%S)] typecheck failed first try, sleeping 30s then retrying" >> "$LOG"
    sleep 30
    pnpm typecheck >> "$LOG" 2>&1 || {
      echo "[$(date +%H:%M:%S)] typecheck FAILED twice after ${NAME} — stopping chain" >> "$LOG"
      exit 1
    }
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

echo "=== SRP tiers done $(date) ===" >> "$LOG"

# ─────────────── Phase B: 3bet-pot tiers ───────────────
# The 7 squeeze pairings (SB:*, CO:MP/UTG, MP:UTG) — defender 3bets,
# opener calls. Different solver setup (pot 21, eff 89.5, position-
# aware OOP/IP) via gen-input-3bet-pots.mjs. Caller ranges sourced
# from solver-run/ranges/call-vs-3bet-6max-100bb.json (established
# 100bb 6max GTO equilibria). Filename prefix `full3_` keeps the
# parser + skip guard isolated from the SRP pipeline.
PAIRINGS_3BET=(
  "SB:BTN"   "SB:CO"   "SB:MP"   "SB:UTG"
  "CO:MP"    "CO:UTG"  "MP:UTG"
)

for PAIR in "${PAIRINGS_3BET[@]}"; do
  DEF="${PAIR%:*}"
  OPN="${PAIR#*:}"
  NAME="full3_${DEF}_vs_${OPN}"
  RUNNER="$REPO/solver-run/run-${NAME//_/-}.sh"

  cd "$REPO"
  if git log --oneline --grep="data(solver): ${NAME} —" 2>/dev/null | grep -q .; then
    echo "[$(date +%H:%M:%S)] ⊘ ${NAME} already in git, skip" >> "$LOG"
    continue
  fi

  echo "[$(date +%H:%M:%S)] ▶ ${NAME} begin (3bet pot)" >> "$LOG"

  node solver-run/scripts/gen-input-3bet-pots.mjs \
    --defender="$DEF" --opener="$OPN" >> "$LOG" 2>&1

  if [ ! -f "$RUNNER" ]; then
    echo "[$(date +%H:%M:%S)] runner missing for ${NAME} — skipping" >> "$LOG"
    continue
  fi

  bash "$RUNNER"

  echo "[$(date +%H:%M:%S)] ✓ ${NAME} batch done — parsing" >> "$LOG"

  node solver-run/scripts/parse-outputs.mjs >> "$LOG" 2>&1
  # typecheck triggers turbo's full dep graph, which includes
  # gto-data:build → build-preflop, which sometimes hits a transient
  # UNKNOWN errno -4094 writing manifest.json under repeated load
  # (caught 2026-05-31 — SB:BTN looped for 12h on this single race).
  # Retry once after a short pause before treating it as fatal.
  pnpm typecheck >> "$LOG" 2>&1 || {
    echo "[$(date +%H:%M:%S)] typecheck failed first try, sleeping 30s then retrying" >> "$LOG"
    sleep 30
    pnpm typecheck >> "$LOG" 2>&1 || {
      echo "[$(date +%H:%M:%S)] typecheck FAILED twice after ${NAME} — stopping chain" >> "$LOG"
      exit 1
    }
  }

  PUSHED=0
  if ! git diff --quiet packages/gto-data/ 2>/dev/null; then
    COUNT=$(ls "$REPO/solver-run/outputs/${NAME}_"*.json 2>/dev/null | wc -l)
    git add packages/gto-data/ >> "$LOG" 2>&1
    git commit -m "data(solver): ${NAME} — ${COUNT} boards (3bet pot)" >> "$LOG" 2>&1
    if git push origin main >> "$LOG" 2>&1; then
      PUSHED=1
      echo "[$(date +%H:%M:%S)] ✓ ${NAME} pushed (${COUNT} boards)" >> "$LOG"
    else
      echo "[warn] push failed — continuing" >> "$LOG"
    fi
  else
    echo "[$(date +%H:%M:%S)] ${NAME} produced no new data" >> "$LOG"
  fi

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
rm -f "$REPO/solver-run/outputs/full3_"*.json
rm -f "$REPO/solver-run/inputs/full_"*.txt
rm -f "$REPO/solver-run/inputs/full3_"*.txt
FINAL_AFTER=$(du -sh "$REPO/solver-run/outputs" 2>/dev/null | awk '{print $1}')
echo "[$(date +%H:%M:%S)] ✓ final sweep: outputs ${FINAL_BEFORE} → ${FINAL_AFTER}" >> "$LOG"
