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

echo "=== process-watchdog start $(date) (pid $$) ===" >> "$LOG"

while true; do
  # Already finished? all-tiers.sh writes "=== all-tiers done" at the very
  # end. If we see that, exit — nothing more to babysit.
  if grep -q "=== all-tiers done" "$ALL_TIERS_LOG" 2>/dev/null; then
    echo "[$(date)] all-tiers complete — watchdog exiting" >> "$LOG"
    exit 0
  fi

  # Check for live console_solver. ps -W lists Windows native processes
  # under git-bash; tasklist would also work.
  if ps -W 2>/dev/null | grep -q "console_solver"; then
    : # alive — quiet
  else
    echo "[$(date)] console_solver not running — relaunching all-tiers" >> "$LOG"
    nohup bash "$REPO/solver-run/all-tiers.sh" >> "$REPO/solver-run/all-tiers.out" 2>&1 &
    echo "[$(date)] relaunched (pid $!)" >> "$LOG"
    # Give it time to spawn before next poll so we don't double-launch.
    sleep 60
  fi

  sleep $WATCH_INTERVAL
done
