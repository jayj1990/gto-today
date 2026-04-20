#!/bin/bash
# Full overnight chain:
#   1. Wait for phase 1 ("=== batch done") — run-all.sh writes this marker
#      when the first 50 CO-vs-BB boards complete
#   2. Start phase 2 — 60 more boards across UTG/MP/BTN/SB vs BB
#   3. Wait for phase 2 ("=== phase2 done")
#   4. Run the parser — emits solver-spots.ts
#   5. Typecheck to catch any issue before Jay wakes up
set -u

LOG="C:/Users/Jay/poker-gto-guide/solver-run/batch.log"
WATCH="C:/Users/Jay/poker-gto-guide/solver-run/watchdog.log"

echo "=== chain start $(date) ===" >> "$WATCH"

# 1. Wait for phase 1
echo "[$(date +%H:%M:%S)] waiting for phase 1..." >> "$WATCH"
while ! grep -q "=== batch done" "$LOG" 2>/dev/null; do
  sleep 120
done
echo "[$(date +%H:%M:%S)] phase 1 done — starting phase 2" >> "$WATCH"

# 2. Phase 2
bash C:/Users/Jay/poker-gto-guide/solver-run/run-phase2.sh

# 3. Wait for phase 2 marker (run-phase2.sh writes it)
echo "[$(date +%H:%M:%S)] waiting for phase 2..." >> "$WATCH"
while ! grep -q "=== phase2 done" "$LOG" 2>/dev/null; do
  sleep 120
done
echo "[$(date +%H:%M:%S)] phase 2 done — parsing outputs" >> "$WATCH"

# 4. Parser
cd C:/Users/Jay/poker-gto-guide
node solver-run/scripts/parse-outputs.mjs >> "$WATCH" 2>&1

# 5. Typecheck
echo "[$(date +%H:%M:%S)] parser done — running typecheck" >> "$WATCH"
pnpm typecheck >> "$WATCH" 2>&1

echo "=== chain done $(date) ===" >> "$WATCH"
