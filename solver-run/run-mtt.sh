#!/bin/bash
set -u
cd "C:/Users/Jay/Desktop/GTO-Today/TexasSolver-v0.2.0-Windows"
LOG="C:/Users/Jay/poker-gto-guide/solver-run/batch.log"
echo "=== mtt start $(date) ===" >> "$LOG"
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_A_dry_A72.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_A_dry_A72 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_A_dry_A72.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_A_dry_A72 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_A_dry_A72 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_A_dry_A83.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_A_dry_A83 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_A_dry_A83.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_A_dry_A83 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_A_dry_A83 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_A_dry_AK4.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_A_dry_AK4 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_A_dry_AK4.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_A_dry_AK4 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_A_dry_AK4 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_A_dry_A95.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_A_dry_A95 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_A_dry_A95.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_A_dry_A95 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_A_dry_A95 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_A_wet_AJT.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_A_wet_AJT solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_A_wet_AJT.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_A_wet_AJT done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_A_wet_AJT SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_A_wet_AKQ.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_A_wet_AKQ solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_A_wet_AKQ.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_A_wet_AKQ done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_A_wet_AKQ SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_A_wet_A98.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_A_wet_A98 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_A_wet_A98.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_A_wet_A98 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_A_wet_A98 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_A_wet_AT8.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_A_wet_AT8 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_A_wet_AT8.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_A_wet_AT8 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_A_wet_AT8 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_A_paired_A77.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_A_paired_A77 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_A_paired_A77.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_A_paired_A77 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_A_paired_A77 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_A_paired_A44.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_A_paired_A44 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_A_paired_A44.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_A_paired_A44 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_A_paired_A44 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_K_dry_K72.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_K_dry_K72 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_K_dry_K72.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_K_dry_K72 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_K_dry_K72 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_K_dry_K83.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_K_dry_K83 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_K_dry_K83.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_K_dry_K83 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_K_dry_K83 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_K_dry_K95.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_K_dry_K95 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_K_dry_K95.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_K_dry_K95 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_K_dry_K95 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_K_conn_KQJ.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_K_conn_KQJ solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_K_conn_KQJ.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_K_conn_KQJ done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_K_conn_KQJ SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_K_conn_KT9.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_K_conn_KT9 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_K_conn_KT9.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_K_conn_KT9 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_K_conn_KT9 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_K_conn_K98.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_K_conn_K98 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_K_conn_K98.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_K_conn_K98 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_K_conn_K98 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_K_paired_KK2.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_K_paired_KK2 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_K_paired_KK2.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_K_paired_KK2 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_K_paired_KK2 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_K_paired_KK7.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_K_paired_KK7 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_K_paired_KK7.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_K_paired_KK7 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_K_paired_KK7 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_Q_dry_Q83.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_Q_dry_Q83 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_Q_dry_Q83.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_Q_dry_Q83 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_Q_dry_Q83 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_Q_dry_Q62.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_Q_dry_Q62 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_Q_dry_Q62.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_Q_dry_Q62 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_Q_dry_Q62 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_Q_wet_QJT.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_Q_wet_QJT solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_Q_wet_QJT.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_Q_wet_QJT done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_Q_wet_QJT SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_Q_monotone.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_Q_monotone solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_Q_monotone.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_Q_monotone done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_Q_monotone SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_Q_paired_Q66.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_Q_paired_Q66 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_Q_paired_Q66.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_Q_paired_Q66 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_Q_paired_Q66 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_J_dry_J72.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_J_dry_J72 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_J_dry_J72.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_J_dry_J72 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_J_dry_J72 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_J_wet_JT9.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_J_wet_JT9 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_J_wet_JT9.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_J_wet_JT9 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_J_wet_JT9 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_J_wet_JT8.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_J_wet_JT8 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_J_wet_JT8.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_J_wet_JT8 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_J_wet_JT8 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_J_paired_J55.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_J_paired_J55 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_J_paired_J55.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_J_paired_J55 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_J_paired_J55 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_T_dry_T52.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_T_dry_T52 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_T_dry_T52.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_T_dry_T52 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_T_dry_T52 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_T_wet_T98.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_T_wet_T98 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_T_wet_T98.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_T_wet_T98 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_T_wet_T98 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_T_wet_T87.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_T_wet_T87 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_T_wet_T87.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_T_wet_T87 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_T_wet_T87 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_M_dry_975.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_M_dry_975 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_M_dry_975.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_M_dry_975 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_M_dry_975 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_M_wet_986.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_M_wet_986 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_M_wet_986.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_M_wet_986 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_M_wet_986 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_M_wet_865.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_M_wet_865 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_M_wet_865.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_M_wet_865 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_M_wet_865 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_M_dry_763.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_M_dry_763 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_M_dry_763.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_M_dry_763 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_M_dry_763 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_M_wet_754.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_M_wet_754 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_M_wet_754.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_M_wet_754 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_M_wet_754 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_M_dry_752.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_M_dry_752 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_M_dry_752.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_M_dry_752 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_M_dry_752 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_L_dry_632.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_L_dry_632 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_L_dry_632.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_L_dry_632 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_L_dry_632 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_L_wet_543.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_L_wet_543 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_L_wet_543.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_L_wet_543 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_L_wet_543 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_L_wet_642.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_L_wet_642 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_L_wet_642.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_L_wet_642 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_L_wet_642 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_P_mid_883.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_P_mid_883 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_P_mid_883.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_P_mid_883 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_P_mid_883 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_P_mid_775.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_P_mid_775 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_P_mid_775.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_P_mid_775 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_P_mid_775 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_P_low_664.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_P_low_664 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_P_low_664.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_P_low_664 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_P_low_664 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_P_low_442.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_P_low_442 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_P_low_442.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_P_low_442 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_P_low_442 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_P_low_332.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_P_low_332 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_P_low_332.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_P_low_332 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_P_low_332 SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_MT_T84_spade.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_MT_T84_spade solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_MT_T84_spade.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_MT_T84_spade done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_MT_T84_spade SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_MT_963_heart.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_MT_963_heart solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_MT_963_heart.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_MT_963_heart done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_MT_963_heart SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_MT_875_club.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_MT_875_club solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_MT_875_club.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_MT_875_club done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_MT_875_club SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_TT_J98_h.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_TT_J98_h solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_TT_J98_h.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_TT_J98_h done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_TT_J98_h SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_TT_KQT_s.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_TT_KQT_s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_TT_KQT_s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_TT_KQT_s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_TT_KQT_s SKIPPED" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/mtt_CO_TT_T76_d.json" ]; then
  echo "[$(date +%H:%M:%S)] mtt_CO_TT_T76_d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/mtt_CO_TT_T76_d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] mtt_CO_TT_T76_d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] mtt_CO_TT_T76_d SKIPPED" >> "$LOG"
fi
echo "=== mtt done $(date) ===" >> "$LOG"
