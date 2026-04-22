#!/bin/bash
# Wait for the solver batch to hit its "=== batch done ===" marker,
# then run the parser + typecheck. Runs as a background task so the
# post-batch pipeline fires even if Claude's conversation ends.
set -u

LOG="C:/Users/Jay/poker-gto-guide/solver-run/batch.log"
WATCH_LOG="C:/Users/Jay/poker-gto-guide/solver-run/watchdog.log"

echo "=== watchdog start $(date) ===" >> "$WATCH_LOG"

# Poll every 2 min until the batch marker appears.
while ! grep -q "=== batch done" "$LOG" 2>/dev/null; do
  sleep 120
done

echo "[$(date)] batch done detected — running parser" >> "$WATCH_LOG"
cd "C:/Users/Jay/poker-gto-guide"
node solver-run/scripts/parse-outputs.mjs >> "$WATCH_LOG" 2>&1
echo "[$(date)] parser done — running typecheck" >> "$WATCH_LOG"
pnpm typecheck >> "$WATCH_LOG" 2>&1
echo "=== watchdog done $(date) ===" >> "$WATCH_LOG"
