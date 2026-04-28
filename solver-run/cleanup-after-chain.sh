#!/bin/bash
# Manual cleanup for the currently-running all-tiers chain. The version
# of all-tiers.sh that started before commit 97d5b5d doesn't auto-clean
# raw outputs per pairing, so by the end of its 50-day run there will
# be ~7 GB of full_*.json + per-board .txt inputs sitting on disk.
#
# Run this once the chain reports `=== all-tiers done` in
# solver-run/all-tiers.log. Safe to run any time after — it only
# touches `full_*.json` (post-2026-04-27 outputs) and `full_*.txt`
# (post-2026-04-27 inputs); legacy phase outputs and hand-crafted
# inputs are preserved.
#
# Usage:
#   bash solver-run/cleanup-after-chain.sh
set -u

REPO="C:/Users/Jay/poker-gto-guide"
OUT="$REPO/solver-run/outputs"
IN="$REPO/solver-run/inputs"

# Make sure the chain is actually finished — refuse to delete if it's
# still running, so we don't pull the rug from under an active solve.
if ps -W 2>/dev/null | grep -q "console_solver"; then
  echo "[abort] console_solver is still running. Wait until the chain"
  echo "        finishes (check 'tail solver-run/all-tiers.log')."
  exit 1
fi

OUT_BEFORE=$(du -sh "$OUT" 2>/dev/null | awk '{print $1}')
IN_BEFORE=$(du -sh "$IN" 2>/dev/null | awk '{print $1}')

OUT_COUNT=$(ls "$OUT"/full_*.json 2>/dev/null | wc -l)
IN_COUNT=$(ls "$IN"/full_*.txt 2>/dev/null | wc -l)

if [ "$OUT_COUNT" -eq 0 ] && [ "$IN_COUNT" -eq 0 ]; then
  echo "[clean] no full_*.{json,txt} found — already clean."
  df -h /c/ | tail -1
  exit 0
fi

echo "[clean] removing $OUT_COUNT raw outputs + $IN_COUNT input scripts"
rm -f "$OUT"/full_*.json
rm -f "$IN"/full_*.txt

OUT_AFTER=$(du -sh "$OUT" 2>/dev/null | awk '{print $1}')
IN_AFTER=$(du -sh "$IN" 2>/dev/null | awk '{print $1}')

echo "[clean] outputs: ${OUT_BEFORE} → ${OUT_AFTER}"
echo "[clean] inputs:  ${IN_BEFORE} → ${IN_AFTER}"
echo
df -h /c/ | tail -1
