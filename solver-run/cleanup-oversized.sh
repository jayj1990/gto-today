#!/bin/bash
# One-shot cleanup for the dump_rounds=3 disk crisis (2026-04-27).
#
# DELETES every full_*.json under outputs/. Reasons:
#   • 51 are 518-byte truncated stubs from the PC crash — worthless.
#   • 59 are ~9 GB full-tree dumps that were never parsed (the parser
#     would OOM on a 9 GB JSON anyway). The dump_rounds=1 fix landed
#     in commit 47b89cb so future runs will produce 50 KB files —
#     these are the only artifacts that need to go.
#
# After cleanup:
#   1. all-tiers.sh can be relaunched safely
#   2. process-watchdog.sh can be re-armed
#
# Phase outputs (CO_vs_BB_* and pairing-prefixed legacy *.json files)
# are NOT touched — those produced the 2,769 spots already shipped in
# packages/gto-data/src/ranges/solver-spots.ts.
#
# Run:
#   bash solver-run/cleanup-oversized.sh
#
# Idempotent — re-running is a no-op once full_*.json is empty.
set -u

OUT="C:/Users/Jay/poker-gto-guide/solver-run/outputs"

count=$(ls "$OUT"/full_*.json 2>/dev/null | wc -l)
if [ "$count" -eq 0 ]; then
  echo "[cleanup] no full_*.json files — already clean."
  df -h /c/ | grep -E "Filesystem|/c"
  exit 0
fi

# Sum sizes before delete so the user sees what's reclaimed.
total=$(du -sh "$OUT"/full_*.json 2>/dev/null | awk '{sum += $1; unit=$2}END{print sum, unit}')
echo "[cleanup] removing $count full_*.json files (~${total})"

rm "$OUT"/full_*.json
echo "[cleanup] done."

df -h /c/ | grep -E "Filesystem|/c"
