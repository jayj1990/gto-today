#!/bin/bash
set -u
cd "C:/Users/Jay/Desktop/GTO-Today/TexasSolver-v0.2.0-Windows"
LOG="C:/Users/Jay/poker-gto-guide/solver-run/batch.log"
echo "=== phase2 start $(date) ===" >> "$LOG"
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/UTG_vs_BB__A_dry_A72.json" ]; then
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__A_dry_A72 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/UTG_vs_BB__A_dry_A72.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__A_dry_A72 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__A_dry_A72 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/UTG_vs_BB__A_dry_AK4.json" ]; then
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__A_dry_AK4 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/UTG_vs_BB__A_dry_AK4.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__A_dry_AK4 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__A_dry_AK4 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/UTG_vs_BB__A_wet_AJT.json" ]; then
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__A_wet_AJT solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/UTG_vs_BB__A_wet_AJT.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__A_wet_AJT done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__A_wet_AJT SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/UTG_vs_BB__K_dry_K72.json" ]; then
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__K_dry_K72 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/UTG_vs_BB__K_dry_K72.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__K_dry_K72 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__K_dry_K72 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/UTG_vs_BB__K_conn_K98.json" ]; then
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__K_conn_K98 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/UTG_vs_BB__K_conn_K98.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__K_conn_K98 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__K_conn_K98 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/UTG_vs_BB__K_paired_KK2.json" ]; then
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__K_paired_KK2 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/UTG_vs_BB__K_paired_KK2.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__K_paired_KK2 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__K_paired_KK2 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/UTG_vs_BB__Q_dry_Q83.json" ]; then
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__Q_dry_Q83 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/UTG_vs_BB__Q_dry_Q83.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__Q_dry_Q83 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__Q_dry_Q83 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/UTG_vs_BB__Q_wet_QJT.json" ]; then
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__Q_wet_QJT solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/UTG_vs_BB__Q_wet_QJT.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__Q_wet_QJT done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__Q_wet_QJT SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/UTG_vs_BB__Q_monotone.json" ]; then
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__Q_monotone solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/UTG_vs_BB__Q_monotone.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__Q_monotone done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__Q_monotone SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/UTG_vs_BB__J_wet_JT9.json" ]; then
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__J_wet_JT9 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/UTG_vs_BB__J_wet_JT9.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__J_wet_JT9 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__J_wet_JT9 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/UTG_vs_BB__T_wet_T98.json" ]; then
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__T_wet_T98 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/UTG_vs_BB__T_wet_T98.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__T_wet_T98 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__T_wet_T98 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/UTG_vs_BB__M_dry_975.json" ]; then
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__M_dry_975 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/UTG_vs_BB__M_dry_975.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__M_dry_975 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__M_dry_975 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/UTG_vs_BB__M_wet_865.json" ]; then
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__M_wet_865 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/UTG_vs_BB__M_wet_865.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__M_wet_865 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__M_wet_865 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/UTG_vs_BB__P_mid_883.json" ]; then
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__P_mid_883 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/UTG_vs_BB__P_mid_883.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__P_mid_883 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__P_mid_883 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/UTG_vs_BB__L_dry_632.json" ]; then
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__L_dry_632 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/UTG_vs_BB__L_dry_632.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__L_dry_632 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] UTG_vs_BB__L_dry_632 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MP_vs_BB__A_dry_A72.json" ]; then
  echo "[$(date +%H:%M:%S)] MP_vs_BB__A_dry_A72 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MP_vs_BB__A_dry_A72.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MP_vs_BB__A_dry_A72 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MP_vs_BB__A_dry_A72 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MP_vs_BB__A_dry_AK4.json" ]; then
  echo "[$(date +%H:%M:%S)] MP_vs_BB__A_dry_AK4 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MP_vs_BB__A_dry_AK4.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MP_vs_BB__A_dry_AK4 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MP_vs_BB__A_dry_AK4 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MP_vs_BB__A_wet_AJT.json" ]; then
  echo "[$(date +%H:%M:%S)] MP_vs_BB__A_wet_AJT solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MP_vs_BB__A_wet_AJT.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MP_vs_BB__A_wet_AJT done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MP_vs_BB__A_wet_AJT SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MP_vs_BB__K_dry_K72.json" ]; then
  echo "[$(date +%H:%M:%S)] MP_vs_BB__K_dry_K72 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MP_vs_BB__K_dry_K72.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MP_vs_BB__K_dry_K72 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MP_vs_BB__K_dry_K72 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MP_vs_BB__K_conn_K98.json" ]; then
  echo "[$(date +%H:%M:%S)] MP_vs_BB__K_conn_K98 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MP_vs_BB__K_conn_K98.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MP_vs_BB__K_conn_K98 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MP_vs_BB__K_conn_K98 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MP_vs_BB__K_paired_KK2.json" ]; then
  echo "[$(date +%H:%M:%S)] MP_vs_BB__K_paired_KK2 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MP_vs_BB__K_paired_KK2.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MP_vs_BB__K_paired_KK2 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MP_vs_BB__K_paired_KK2 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MP_vs_BB__Q_dry_Q83.json" ]; then
  echo "[$(date +%H:%M:%S)] MP_vs_BB__Q_dry_Q83 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MP_vs_BB__Q_dry_Q83.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MP_vs_BB__Q_dry_Q83 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MP_vs_BB__Q_dry_Q83 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MP_vs_BB__Q_wet_QJT.json" ]; then
  echo "[$(date +%H:%M:%S)] MP_vs_BB__Q_wet_QJT solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MP_vs_BB__Q_wet_QJT.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MP_vs_BB__Q_wet_QJT done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MP_vs_BB__Q_wet_QJT SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MP_vs_BB__Q_monotone.json" ]; then
  echo "[$(date +%H:%M:%S)] MP_vs_BB__Q_monotone solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MP_vs_BB__Q_monotone.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MP_vs_BB__Q_monotone done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MP_vs_BB__Q_monotone SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MP_vs_BB__J_wet_JT9.json" ]; then
  echo "[$(date +%H:%M:%S)] MP_vs_BB__J_wet_JT9 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MP_vs_BB__J_wet_JT9.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MP_vs_BB__J_wet_JT9 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MP_vs_BB__J_wet_JT9 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MP_vs_BB__T_wet_T98.json" ]; then
  echo "[$(date +%H:%M:%S)] MP_vs_BB__T_wet_T98 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MP_vs_BB__T_wet_T98.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MP_vs_BB__T_wet_T98 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MP_vs_BB__T_wet_T98 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MP_vs_BB__M_dry_975.json" ]; then
  echo "[$(date +%H:%M:%S)] MP_vs_BB__M_dry_975 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MP_vs_BB__M_dry_975.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MP_vs_BB__M_dry_975 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MP_vs_BB__M_dry_975 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MP_vs_BB__M_wet_865.json" ]; then
  echo "[$(date +%H:%M:%S)] MP_vs_BB__M_wet_865 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MP_vs_BB__M_wet_865.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MP_vs_BB__M_wet_865 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MP_vs_BB__M_wet_865 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MP_vs_BB__P_mid_883.json" ]; then
  echo "[$(date +%H:%M:%S)] MP_vs_BB__P_mid_883 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MP_vs_BB__P_mid_883.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MP_vs_BB__P_mid_883 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MP_vs_BB__P_mid_883 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/MP_vs_BB__L_dry_632.json" ]; then
  echo "[$(date +%H:%M:%S)] MP_vs_BB__L_dry_632 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/MP_vs_BB__L_dry_632.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] MP_vs_BB__L_dry_632 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] MP_vs_BB__L_dry_632 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/BTN_vs_BB__A_dry_A72.json" ]; then
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__A_dry_A72 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/BTN_vs_BB__A_dry_A72.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__A_dry_A72 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__A_dry_A72 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/BTN_vs_BB__A_dry_AK4.json" ]; then
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__A_dry_AK4 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/BTN_vs_BB__A_dry_AK4.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__A_dry_AK4 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__A_dry_AK4 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/BTN_vs_BB__A_wet_AJT.json" ]; then
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__A_wet_AJT solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/BTN_vs_BB__A_wet_AJT.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__A_wet_AJT done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__A_wet_AJT SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/BTN_vs_BB__K_dry_K72.json" ]; then
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__K_dry_K72 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/BTN_vs_BB__K_dry_K72.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__K_dry_K72 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__K_dry_K72 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/BTN_vs_BB__K_conn_K98.json" ]; then
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__K_conn_K98 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/BTN_vs_BB__K_conn_K98.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__K_conn_K98 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__K_conn_K98 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/BTN_vs_BB__K_paired_KK2.json" ]; then
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__K_paired_KK2 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/BTN_vs_BB__K_paired_KK2.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__K_paired_KK2 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__K_paired_KK2 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/BTN_vs_BB__Q_dry_Q83.json" ]; then
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__Q_dry_Q83 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/BTN_vs_BB__Q_dry_Q83.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__Q_dry_Q83 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__Q_dry_Q83 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/BTN_vs_BB__Q_wet_QJT.json" ]; then
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__Q_wet_QJT solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/BTN_vs_BB__Q_wet_QJT.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__Q_wet_QJT done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__Q_wet_QJT SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/BTN_vs_BB__Q_monotone.json" ]; then
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__Q_monotone solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/BTN_vs_BB__Q_monotone.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__Q_monotone done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__Q_monotone SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/BTN_vs_BB__J_wet_JT9.json" ]; then
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__J_wet_JT9 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/BTN_vs_BB__J_wet_JT9.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__J_wet_JT9 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__J_wet_JT9 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/BTN_vs_BB__T_wet_T98.json" ]; then
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__T_wet_T98 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/BTN_vs_BB__T_wet_T98.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__T_wet_T98 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__T_wet_T98 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/BTN_vs_BB__M_dry_975.json" ]; then
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__M_dry_975 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/BTN_vs_BB__M_dry_975.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__M_dry_975 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__M_dry_975 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/BTN_vs_BB__M_wet_865.json" ]; then
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__M_wet_865 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/BTN_vs_BB__M_wet_865.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__M_wet_865 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__M_wet_865 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/BTN_vs_BB__P_mid_883.json" ]; then
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__P_mid_883 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/BTN_vs_BB__P_mid_883.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__P_mid_883 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__P_mid_883 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/BTN_vs_BB__L_dry_632.json" ]; then
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__L_dry_632 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/BTN_vs_BB__L_dry_632.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__L_dry_632 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] BTN_vs_BB__L_dry_632 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/SB_vs_BB__A_dry_A72.json" ]; then
  echo "[$(date +%H:%M:%S)] SB_vs_BB__A_dry_A72 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/SB_vs_BB__A_dry_A72.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] SB_vs_BB__A_dry_A72 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] SB_vs_BB__A_dry_A72 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/SB_vs_BB__A_dry_AK4.json" ]; then
  echo "[$(date +%H:%M:%S)] SB_vs_BB__A_dry_AK4 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/SB_vs_BB__A_dry_AK4.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] SB_vs_BB__A_dry_AK4 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] SB_vs_BB__A_dry_AK4 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/SB_vs_BB__A_wet_AJT.json" ]; then
  echo "[$(date +%H:%M:%S)] SB_vs_BB__A_wet_AJT solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/SB_vs_BB__A_wet_AJT.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] SB_vs_BB__A_wet_AJT done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] SB_vs_BB__A_wet_AJT SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/SB_vs_BB__K_dry_K72.json" ]; then
  echo "[$(date +%H:%M:%S)] SB_vs_BB__K_dry_K72 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/SB_vs_BB__K_dry_K72.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] SB_vs_BB__K_dry_K72 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] SB_vs_BB__K_dry_K72 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/SB_vs_BB__K_conn_K98.json" ]; then
  echo "[$(date +%H:%M:%S)] SB_vs_BB__K_conn_K98 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/SB_vs_BB__K_conn_K98.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] SB_vs_BB__K_conn_K98 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] SB_vs_BB__K_conn_K98 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/SB_vs_BB__K_paired_KK2.json" ]; then
  echo "[$(date +%H:%M:%S)] SB_vs_BB__K_paired_KK2 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/SB_vs_BB__K_paired_KK2.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] SB_vs_BB__K_paired_KK2 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] SB_vs_BB__K_paired_KK2 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/SB_vs_BB__Q_dry_Q83.json" ]; then
  echo "[$(date +%H:%M:%S)] SB_vs_BB__Q_dry_Q83 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/SB_vs_BB__Q_dry_Q83.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] SB_vs_BB__Q_dry_Q83 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] SB_vs_BB__Q_dry_Q83 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/SB_vs_BB__Q_wet_QJT.json" ]; then
  echo "[$(date +%H:%M:%S)] SB_vs_BB__Q_wet_QJT solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/SB_vs_BB__Q_wet_QJT.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] SB_vs_BB__Q_wet_QJT done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] SB_vs_BB__Q_wet_QJT SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/SB_vs_BB__Q_monotone.json" ]; then
  echo "[$(date +%H:%M:%S)] SB_vs_BB__Q_monotone solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/SB_vs_BB__Q_monotone.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] SB_vs_BB__Q_monotone done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] SB_vs_BB__Q_monotone SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/SB_vs_BB__J_wet_JT9.json" ]; then
  echo "[$(date +%H:%M:%S)] SB_vs_BB__J_wet_JT9 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/SB_vs_BB__J_wet_JT9.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] SB_vs_BB__J_wet_JT9 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] SB_vs_BB__J_wet_JT9 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/SB_vs_BB__T_wet_T98.json" ]; then
  echo "[$(date +%H:%M:%S)] SB_vs_BB__T_wet_T98 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/SB_vs_BB__T_wet_T98.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] SB_vs_BB__T_wet_T98 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] SB_vs_BB__T_wet_T98 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/SB_vs_BB__M_dry_975.json" ]; then
  echo "[$(date +%H:%M:%S)] SB_vs_BB__M_dry_975 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/SB_vs_BB__M_dry_975.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] SB_vs_BB__M_dry_975 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] SB_vs_BB__M_dry_975 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/SB_vs_BB__M_wet_865.json" ]; then
  echo "[$(date +%H:%M:%S)] SB_vs_BB__M_wet_865 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/SB_vs_BB__M_wet_865.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] SB_vs_BB__M_wet_865 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] SB_vs_BB__M_wet_865 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/SB_vs_BB__P_mid_883.json" ]; then
  echo "[$(date +%H:%M:%S)] SB_vs_BB__P_mid_883 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/SB_vs_BB__P_mid_883.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] SB_vs_BB__P_mid_883 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] SB_vs_BB__P_mid_883 SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/SB_vs_BB__L_dry_632.json" ]; then
  echo "[$(date +%H:%M:%S)] SB_vs_BB__L_dry_632 solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/SB_vs_BB__L_dry_632.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] SB_vs_BB__L_dry_632 done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] SB_vs_BB__L_dry_632 SKIPPED (output exists)" >> "$LOG"
fi
echo "=== phase2 done $(date) ===" >> "$LOG"
