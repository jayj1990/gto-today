#!/bin/bash
# Retry the two phase4 spots that segfaulted under set_use_isomorphism=1
# (as3s3d, as2s2s). Paired A-high boards where one of the pair cards
# shares a suit with the ace seem to hit an iso-table bug in TexasSolver
# v0.2.0. Turning iso off costs ~2-3x wall time but avoids the crash.
#
# Run AFTER chain3 finishes phase 4-6 — otherwise the solver binary is
# busy with the primary batch.
set -u
cd "C:/Users/Jay/Desktop/GTO-Today/TexasSolver-v0.2.0-Windows"
LOG="C:/Users/Jay/poker-gto-guide/solver-run/batch.log"

for SPOT in as3s3d as2s2s; do
  OUT="C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_${SPOT}.json"
  IN="C:/Users/Jay/poker-gto-guide/solver-run/inputs-retry/${SPOT}_noiso.txt"
  if [ -s "$OUT" ]; then
    echo "[$(date +%H:%M:%S)] phase4_CO_${SPOT} SKIPPED (output exists)" >> "$LOG"
    continue
  fi
  echo "[$(date +%H:%M:%S)] phase4_CO_${SPOT} retrying (iso off)..." >> "$LOG"
  ./console_solver.exe --input_file "$IN" --resource_dir ./resources >> "$LOG" 2>&1
  if [ -s "$OUT" ]; then
    echo "[$(date +%H:%M:%S)] phase4_CO_${SPOT} recovered" >> "$LOG"
  else
    echo "[$(date +%H:%M:%S)] phase4_CO_${SPOT} still failed — accepting coverage loss" >> "$LOG"
  fi
done

# Re-parse so the recovered spots land in packages/gto-data.
cd "C:/Users/Jay/poker-gto-guide"
node solver-run/scripts/parse-outputs.mjs >> "$LOG" 2>&1
