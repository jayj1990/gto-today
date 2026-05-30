#!/bin/bash
# Process-alive watchdog — runs forever in the background, polls every
# WATCH_INTERVAL seconds for console_solver. If it's dead AND not all
# 15 pairings finished, kicks off all-tiers.sh again. Resumable runner
# logic in run-full-*.sh skips already-produced outputs, so a relaunch
# costs nothing.
#
# Why this exists: each PC reboot kills the chain. Manual restart was
# costing ~3.5 days of solver time per crash. This recovers in <5 min.
#
# Start it:
#   nohup bash solver-run/process-watchdog.sh > solver-run/process-watchdog.out 2>&1 &
#
# Stop it:
#   pkill -f process-watchdog.sh
set -u

REPO="C:/Users/Jay/poker-gto-guide"
LOG="$REPO/solver-run/process-watchdog.log"
ALL_TIERS_LOG="$REPO/solver-run/all-tiers.log"
WATCH_INTERVAL=300  # 5 min
STARTUP_GRACE=180   # 3 min — lets a freshly-launched all-tiers spawn
                    # its first console_solver before we start checking,
                    # so we don't race-launch a duplicate chain.

echo "=== process-watchdog start $(date) (pid $$) ===" >> "$LOG"
echo "[$(date)] grace period ${STARTUP_GRACE}s before first check" >> "$LOG"
sleep $STARTUP_GRACE

# Only consider "all-tiers done" as a reason to exit AFTER we've
# spawned the chain at least once. The log persists across watchdog
# restarts, so stale done markers from prior sessions used to trick a
# fresh watchdog into exiting immediately (caught 2026-05-30: every
# Task-Scheduler watchdog kept exiting on the 2026-05-24 SRP-done
# marker, so Phase B never started).
SPAWNED=0

while true; do
  if [ "$SPAWNED" = "1" ] && tail -n 30 "$ALL_TIERS_LOG" 2>/dev/null | grep -q "=== all-tiers done"; then
    echo "[$(date)] all-tiers complete — watchdog exiting" >> "$LOG"
    exit 0
  fi

  # Check for live console_solver. ps -W lists Windows native processes
  # under git-bash; tasklist would also work.
  if ps -W 2>/dev/null | grep -q "console_solver"; then
    : # alive — quiet
  else
    # Don't double-launch all-tiers. Console_solver can briefly disappear
    # between boards (parser run, cleanup, next runner spawn) — that's
    # not a chain death. Only relaunch if the orchestrator itself is gone.
    # Caught 2026-05-10: watchdog spawned a 2nd all-tiers while the 1st
    # was alive between solves; both raced on the same input file.
    if ps -ef 2>/dev/null | grep -E 'all-tiers\.sh' | grep -v grep > /dev/null; then
      echo "[$(date)] console_solver gap (between boards) — all-tiers alive, skip relaunch" >> "$LOG"
    else
      echo "[$(date)] console_solver + all-tiers both dead — relaunching all-tiers" >> "$LOG"
      nohup bash "$REPO/solver-run/all-tiers.sh" >> "$REPO/solver-run/all-tiers.out" 2>&1 &
      echo "[$(date)] relaunched (pid $!)" >> "$LOG"
      SPAWNED=1
      # Give it time to spawn before next poll so we don't double-launch.
      sleep 60
    fi
  fi

  sleep $WATCH_INTERVAL
done
