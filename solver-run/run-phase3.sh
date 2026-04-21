#!/bin/bash
set -u
cd "C:/Users/Jay/Desktop/GTO-Today/TexasSolver-v0.2.0-Windows"
LOG="C:/Users/Jay/poker-gto-guide/solver-run/batch.log"
echo "=== phase3 start $(date) ===" >> "$LOG"
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asahad.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asahad solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asahad.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asahad done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asahad SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asasad.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asasad solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asasad.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asasad done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asasad SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asasas.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asasas solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asasas.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asasas done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asasas SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asahkd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asahkd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asahkd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asahkd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asahkd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asaskd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asaskd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asaskd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asaskd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asaskd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asasks.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asasks solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asasks.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asasks done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asasks SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asahqd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asahqd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asahqd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asahqd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asahqd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asasqd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asasqd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asasqd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asasqd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asasqd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asasqs.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asasqs solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asasqs.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asasqs done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asasqs SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asahjd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asahjd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asahjd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asahjd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asahjd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asasjd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asasjd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asasjd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asasjd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asasjd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asasjs.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asasjs solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asasjs.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asasjs done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asasjs SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asahtd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asahtd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asahtd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asahtd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asahtd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asastd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asastd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asastd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asastd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asastd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asasts.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asasts solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asasts.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asasts done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asasts SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asah9d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asah9d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asah9d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asah9d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asah9d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asas9d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asas9d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asas9d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asas9d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asas9d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asas9s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asas9s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asas9s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asas9s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asas9s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asah8d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asah8d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asah8d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asah8d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asah8d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asas8d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asas8d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asas8d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asas8d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asas8d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asas8s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asas8s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asas8s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asas8s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asas8s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asah7d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asah7d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asah7d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asah7d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asah7d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asas7d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asas7d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asas7d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asas7d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asas7d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asas7s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asas7s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asas7s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asas7s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asas7s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asah6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asah6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asah6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asah6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asah6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asas6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asas6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asas6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asas6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asas6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asas6s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asas6s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asas6s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asas6s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asas6s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asah5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asah5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asah5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asah5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asah5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asas5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asas5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asas5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asas5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asas5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asas5s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asas5s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asas5s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asas5s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asas5s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asah4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asah4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asah4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asah4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asah4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asas4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asas4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asas4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asas4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asas4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asas4s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asas4s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asas4s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asas4s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asas4s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asah3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asah3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asah3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asah3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asah3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asas3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asas3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asas3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asas3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asas3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asas3s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asas3s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asas3s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asas3s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asas3s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asah2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asah2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asah2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asah2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asah2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asas2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asas2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asas2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asas2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asas2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asas2s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asas2s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asas2s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asas2s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asas2s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_askhkd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_askhkd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_askhkd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_askhkd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_askhkd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_askskd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_askskd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_askskd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_askskd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_askskd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asksks.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asksks solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asksks.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asksks done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asksks SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_askhqd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_askhqd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_askhqd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_askhqd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_askhqd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asksqd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asksqd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asksqd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asksqd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asksqd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asksqs.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asksqs solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asksqs.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asksqs done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asksqs SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_askhjd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_askhjd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_askhjd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_askhjd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_askhjd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asksjd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asksjd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asksjd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asksjd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asksjd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asksjs.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asksjs solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asksjs.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asksjs done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asksjs SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_askhtd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_askhtd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_askhtd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_askhtd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_askhtd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_askstd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_askstd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_askstd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_askstd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_askstd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asksts.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asksts solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asksts.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asksts done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asksts SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_askh9d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_askh9d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_askh9d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_askh9d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_askh9d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asks9d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asks9d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asks9d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asks9d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asks9d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asks9s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asks9s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asks9s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asks9s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asks9s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_askh8d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_askh8d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_askh8d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_askh8d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_askh8d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asks8d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asks8d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asks8d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asks8d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asks8d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asks8s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asks8s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asks8s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asks8s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asks8s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_askh7d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_askh7d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_askh7d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_askh7d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_askh7d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asks7d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asks7d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asks7d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asks7d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asks7d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asks7s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asks7s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asks7s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asks7s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asks7s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_askh6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_askh6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_askh6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_askh6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_askh6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asks6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asks6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asks6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asks6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asks6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asks6s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asks6s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asks6s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asks6s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asks6s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_askh5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_askh5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_askh5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_askh5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_askh5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asks5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asks5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asks5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asks5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asks5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asks5s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asks5s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asks5s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asks5s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asks5s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_askh4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_askh4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_askh4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_askh4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_askh4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asks4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asks4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asks4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asks4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asks4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asks4s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asks4s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asks4s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asks4s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asks4s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_askh3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_askh3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_askh3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_askh3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_askh3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asks3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asks3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asks3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asks3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asks3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asks3s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asks3s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asks3s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asks3s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asks3s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_askh2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_askh2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_askh2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_askh2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_askh2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asks2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asks2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asks2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asks2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asks2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asks2s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asks2s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asks2s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asks2s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asks2s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqhqd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqhqd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqhqd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqhqd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqhqd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqsqd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqsqd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqsqd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqsqd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqsqd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqsqs.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqsqs solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqsqs.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqsqs done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqsqs SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqhjd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqhjd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqhjd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqhjd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqhjd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqsjd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqsjd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqsjd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqsjd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqsjd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqsjs.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqsjs solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqsjs.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqsjs done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqsjs SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqhtd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqhtd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqhtd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqhtd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqhtd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqstd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqstd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqstd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqstd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqstd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqsts.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqsts solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqsts.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqsts done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqsts SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqh9d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh9d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqh9d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh9d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh9d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqs9d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs9d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqs9d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs9d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs9d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqs9s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs9s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqs9s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs9s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs9s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqh8d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh8d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqh8d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh8d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh8d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqs8d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs8d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqs8d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs8d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs8d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqs8s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs8s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqs8s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs8s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs8s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqh7d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh7d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqh7d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh7d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh7d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqs7d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs7d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqs7d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs7d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs7d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqs7s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs7s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqs7s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs7s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs7s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqh6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqh6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqs6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqs6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqs6s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs6s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqs6s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs6s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs6s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqh5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqh5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqs5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqs5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqs5s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs5s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqs5s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs5s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqs5s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase3_CO_asqh4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase3_CO_asqh4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase3_CO_asqh4d SKIPPED (output exists)" >> "$LOG"
fi
echo "=== phase3 done $(date) ===" >> "$LOG"
