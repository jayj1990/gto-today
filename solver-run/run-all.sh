#!/bin/bash
set -u
cd "C:/Users/Jay/Desktop/GTO-Today/TexasSolver-v0.2.0-Windows"
LOG="C:/Users/Jay/poker-gto-guide/solver-run/batch.log"
echo "=== batch start $(date) ===" >> "$LOG"
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_dry_A72.json" ]; then
  echo "[$(date +%H:%M:%S)] A_dry_A72 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/A_dry_A72.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] A_dry_A72 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_dry_A72.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] A_dry_A72 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_dry_A83.json" ]; then
  echo "[$(date +%H:%M:%S)] A_dry_A83 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/A_dry_A83.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] A_dry_A83 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_dry_A83.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] A_dry_A83 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_dry_AK4.json" ]; then
  echo "[$(date +%H:%M:%S)] A_dry_AK4 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/A_dry_AK4.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] A_dry_AK4 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_dry_AK4.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] A_dry_AK4 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_dry_A95.json" ]; then
  echo "[$(date +%H:%M:%S)] A_dry_A95 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/A_dry_A95.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] A_dry_A95 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_dry_A95.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] A_dry_A95 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_wet_AJT.json" ]; then
  echo "[$(date +%H:%M:%S)] A_wet_AJT solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/A_wet_AJT.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] A_wet_AJT done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_wet_AJT.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] A_wet_AJT SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_wet_AKQ.json" ]; then
  echo "[$(date +%H:%M:%S)] A_wet_AKQ solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/A_wet_AKQ.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] A_wet_AKQ done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_wet_AKQ.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] A_wet_AKQ SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_wet_A98.json" ]; then
  echo "[$(date +%H:%M:%S)] A_wet_A98 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/A_wet_A98.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] A_wet_A98 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_wet_A98.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] A_wet_A98 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_wet_AT8.json" ]; then
  echo "[$(date +%H:%M:%S)] A_wet_AT8 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/A_wet_AT8.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] A_wet_AT8 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_wet_AT8.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] A_wet_AT8 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_paired_A77.json" ]; then
  echo "[$(date +%H:%M:%S)] A_paired_A77 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/A_paired_A77.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] A_paired_A77 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_paired_A77.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] A_paired_A77 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_paired_A44.json" ]; then
  echo "[$(date +%H:%M:%S)] A_paired_A44 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/A_paired_A44.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] A_paired_A44 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/A_paired_A44.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] A_paired_A44 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/K_dry_K72.json" ]; then
  echo "[$(date +%H:%M:%S)] K_dry_K72 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/K_dry_K72.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] K_dry_K72 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/K_dry_K72.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] K_dry_K72 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/K_dry_K83.json" ]; then
  echo "[$(date +%H:%M:%S)] K_dry_K83 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/K_dry_K83.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] K_dry_K83 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/K_dry_K83.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] K_dry_K83 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/K_dry_K95.json" ]; then
  echo "[$(date +%H:%M:%S)] K_dry_K95 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/K_dry_K95.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] K_dry_K95 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/K_dry_K95.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] K_dry_K95 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/K_conn_KQJ.json" ]; then
  echo "[$(date +%H:%M:%S)] K_conn_KQJ solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/K_conn_KQJ.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] K_conn_KQJ done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/K_conn_KQJ.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] K_conn_KQJ SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/K_conn_KT9.json" ]; then
  echo "[$(date +%H:%M:%S)] K_conn_KT9 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/K_conn_KT9.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] K_conn_KT9 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/K_conn_KT9.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] K_conn_KT9 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/K_conn_K98.json" ]; then
  echo "[$(date +%H:%M:%S)] K_conn_K98 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/K_conn_K98.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] K_conn_K98 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/K_conn_K98.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] K_conn_K98 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/K_paired_KK2.json" ]; then
  echo "[$(date +%H:%M:%S)] K_paired_KK2 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/K_paired_KK2.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] K_paired_KK2 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/K_paired_KK2.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] K_paired_KK2 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/K_paired_KK7.json" ]; then
  echo "[$(date +%H:%M:%S)] K_paired_KK7 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/K_paired_KK7.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] K_paired_KK7 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/K_paired_KK7.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] K_paired_KK7 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/Q_dry_Q83.json" ]; then
  echo "[$(date +%H:%M:%S)] Q_dry_Q83 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/Q_dry_Q83.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] Q_dry_Q83 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/Q_dry_Q83.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] Q_dry_Q83 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/Q_dry_Q62.json" ]; then
  echo "[$(date +%H:%M:%S)] Q_dry_Q62 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/Q_dry_Q62.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] Q_dry_Q62 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/Q_dry_Q62.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] Q_dry_Q62 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/Q_wet_QJT.json" ]; then
  echo "[$(date +%H:%M:%S)] Q_wet_QJT solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/Q_wet_QJT.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] Q_wet_QJT done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/Q_wet_QJT.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] Q_wet_QJT SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/Q_monotone.json" ]; then
  echo "[$(date +%H:%M:%S)] Q_monotone solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/Q_monotone.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] Q_monotone done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/Q_monotone.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] Q_monotone SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/Q_paired_Q66.json" ]; then
  echo "[$(date +%H:%M:%S)] Q_paired_Q66 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/Q_paired_Q66.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] Q_paired_Q66 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/Q_paired_Q66.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] Q_paired_Q66 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/J_dry_J72.json" ]; then
  echo "[$(date +%H:%M:%S)] J_dry_J72 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/J_dry_J72.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] J_dry_J72 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/J_dry_J72.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] J_dry_J72 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/J_wet_JT9.json" ]; then
  echo "[$(date +%H:%M:%S)] J_wet_JT9 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/J_wet_JT9.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] J_wet_JT9 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/J_wet_JT9.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] J_wet_JT9 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/J_wet_JT8.json" ]; then
  echo "[$(date +%H:%M:%S)] J_wet_JT8 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/J_wet_JT8.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] J_wet_JT8 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/J_wet_JT8.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] J_wet_JT8 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/J_paired_J55.json" ]; then
  echo "[$(date +%H:%M:%S)] J_paired_J55 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/J_paired_J55.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] J_paired_J55 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/J_paired_J55.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] J_paired_J55 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/T_dry_T52.json" ]; then
  echo "[$(date +%H:%M:%S)] T_dry_T52 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/T_dry_T52.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] T_dry_T52 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/T_dry_T52.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] T_dry_T52 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/T_wet_T98.json" ]; then
  echo "[$(date +%H:%M:%S)] T_wet_T98 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/T_wet_T98.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] T_wet_T98 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/T_wet_T98.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] T_wet_T98 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/T_wet_T87.json" ]; then
  echo "[$(date +%H:%M:%S)] T_wet_T87 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/T_wet_T87.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] T_wet_T87 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/T_wet_T87.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] T_wet_T87 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/M_dry_975.json" ]; then
  echo "[$(date +%H:%M:%S)] M_dry_975 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/M_dry_975.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] M_dry_975 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/M_dry_975.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] M_dry_975 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/M_wet_986.json" ]; then
  echo "[$(date +%H:%M:%S)] M_wet_986 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/M_wet_986.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] M_wet_986 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/M_wet_986.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] M_wet_986 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/M_wet_865.json" ]; then
  echo "[$(date +%H:%M:%S)] M_wet_865 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/M_wet_865.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] M_wet_865 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/M_wet_865.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] M_wet_865 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/M_dry_763.json" ]; then
  echo "[$(date +%H:%M:%S)] M_dry_763 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/M_dry_763.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] M_dry_763 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/M_dry_763.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] M_dry_763 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/M_wet_754.json" ]; then
  echo "[$(date +%H:%M:%S)] M_wet_754 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/M_wet_754.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] M_wet_754 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/M_wet_754.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] M_wet_754 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/M_dry_752.json" ]; then
  echo "[$(date +%H:%M:%S)] M_dry_752 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/M_dry_752.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] M_dry_752 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/M_dry_752.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] M_dry_752 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/L_dry_632.json" ]; then
  echo "[$(date +%H:%M:%S)] L_dry_632 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/L_dry_632.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] L_dry_632 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/L_dry_632.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] L_dry_632 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/L_wet_543.json" ]; then
  echo "[$(date +%H:%M:%S)] L_wet_543 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/L_wet_543.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] L_wet_543 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/L_wet_543.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] L_wet_543 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/L_wet_642.json" ]; then
  echo "[$(date +%H:%M:%S)] L_wet_642 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/L_wet_642.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] L_wet_642 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/L_wet_642.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] L_wet_642 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/P_mid_883.json" ]; then
  echo "[$(date +%H:%M:%S)] P_mid_883 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/P_mid_883.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] P_mid_883 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/P_mid_883.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] P_mid_883 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/P_mid_775.json" ]; then
  echo "[$(date +%H:%M:%S)] P_mid_775 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/P_mid_775.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] P_mid_775 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/P_mid_775.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] P_mid_775 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/P_low_664.json" ]; then
  echo "[$(date +%H:%M:%S)] P_low_664 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/P_low_664.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] P_low_664 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/P_low_664.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] P_low_664 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/P_low_442.json" ]; then
  echo "[$(date +%H:%M:%S)] P_low_442 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/P_low_442.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] P_low_442 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/P_low_442.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] P_low_442 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/P_low_332.json" ]; then
  echo "[$(date +%H:%M:%S)] P_low_332 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/P_low_332.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] P_low_332 done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/P_low_332.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] P_low_332 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MT_T84_spade.json" ]; then
  echo "[$(date +%H:%M:%S)] MT_T84_spade solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MT_T84_spade.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MT_T84_spade done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/MT_T84_spade.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MT_T84_spade SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MT_963_heart.json" ]; then
  echo "[$(date +%H:%M:%S)] MT_963_heart solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MT_963_heart.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MT_963_heart done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/MT_963_heart.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MT_963_heart SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MT_875_club.json" ]; then
  echo "[$(date +%H:%M:%S)] MT_875_club solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MT_875_club.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MT_875_club done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/MT_875_club.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MT_875_club SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/TT_J98_h.json" ]; then
  echo "[$(date +%H:%M:%S)] TT_J98_h solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/TT_J98_h.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] TT_J98_h done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/TT_J98_h.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] TT_J98_h SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/TT_KQT_s.json" ]; then
  echo "[$(date +%H:%M:%S)] TT_KQT_s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/TT_KQT_s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] TT_KQT_s done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/TT_KQT_s.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] TT_KQT_s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/TT_T76_d.json" ]; then
  echo "[$(date +%H:%M:%S)] TT_T76_d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/TT_T76_d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] TT_T76_d done (size=$(stat -c%s C:/Users/Jay/poker-gto-guide/solver-run/outputs/TT_T76_d.json 2>/dev/null || echo 0))" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] TT_T76_d SKIPPED (output exists)" >> "$LOG"
fi
echo "=== batch done $(date) ===" >> "$LOG"
