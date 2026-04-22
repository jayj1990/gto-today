#!/bin/bash
# Polls watchdog.log until chain3 writes its done marker, then runs
# retry-segfaults.sh and commits/pushes the recovered spots. Safe to
# run alongside chain3 — the poll just sleeps, and the solver binary
# is free by the time this fires.
#
# Intended to be launched with nohup so it keeps running after any
# interactive session ends.
set -u

REPO="C:/Users/Jay/poker-gto-guide"
WATCH="$REPO/solver-run/watchdog.log"
LOG="$REPO/solver-run/batch.log"
SELF_LOG="$REPO/solver-run/post-chain3.out"

echo "=== post-chain3 start $(date) ===" >> "$SELF_LOG"

# Wait for chain3 to announce it's done. chain3.sh writes
# `=== chain3 done $(date) ===` at end-of-script.
while ! grep -q "^=== chain3 done" "$WATCH" 2>/dev/null; do
  sleep 120
done

echo "[$(date +%H:%M:%S)] chain3 finished — running segfault retries" >> "$SELF_LOG"
bash "$REPO/solver-run/retry-segfaults.sh" >> "$SELF_LOG" 2>&1

# parse-outputs already runs inside retry-segfaults.sh on success;
# run it again unconditionally so any recovered spot makes it into
# packages/gto-data regardless of whether retry succeeded.
cd "$REPO"
node solver-run/scripts/parse-outputs.mjs >> "$SELF_LOG" 2>&1

# Typecheck before pushing — if the new solver spots break types we
# don't want to ship.
pnpm typecheck >> "$SELF_LOG" 2>&1 || {
  echo "[$(date +%H:%M:%S)] typecheck failed — not committing" >> "$SELF_LOG"
  exit 1
}

# Commit only if there are changes.
if ! git diff --quiet packages/gto-data/ 2>/dev/null; then
  git add packages/gto-data/ >> "$SELF_LOG" 2>&1
  git commit -m "data(solver): segfault-retry + final parse after chain3" >> "$SELF_LOG" 2>&1
  git push origin main >> "$SELF_LOG" 2>&1
  echo "[$(date +%H:%M:%S)] committed + pushed recovered spots" >> "$SELF_LOG"
else
  echo "[$(date +%H:%M:%S)] no data changes to commit" >> "$SELF_LOG"
fi

echo "=== post-chain3 done $(date) ===" >> "$SELF_LOG"
