#!/bin/bash
set -u
cd "C:/Users/Jay/Desktop/GTO-Today/TexasSolver-v0.2.0-Windows"
LOG="C:/Users/Jay/poker-gto-guide/solver-run/batch.log"
echo "=== phase5 start $(date) ===" >> "$LOG"
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9s9s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s9s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9s9s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s9s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s9s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9h8d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h8d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9h8d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h8d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h8d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9s8d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s8d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9s8d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s8d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s8d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9s8s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s8s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9s8s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s8s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s8s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9h7d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h7d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9h7d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h7d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h7d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9s7d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s7d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9s7d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s7d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s7d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9s7s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s7s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9s7s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s7s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s7s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9h6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9h6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9s6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9s6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9s6s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s6s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9s6s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s6s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s6s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9h5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9h5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9s5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9s5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9s5s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s5s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9s5s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s5s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s5s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9h4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9h4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9s4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9s4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9s4s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s4s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9s4s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s4s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s4s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9h3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9h3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9s3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9s3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9s3s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s3s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9s3s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s3s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s3s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9h2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9h2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9h2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9s2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9s2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks9s2s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s2s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks9s2s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s2s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks9s2s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8h8d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h8d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8h8d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h8d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h8d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8s8d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s8d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8s8d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s8d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s8d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8s8s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s8s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8s8s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s8s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s8s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8h7d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h7d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8h7d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h7d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h7d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8s7d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s7d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8s7d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s7d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s7d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8s7s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s7s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8s7s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s7s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s7s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8h6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8h6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8s6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8s6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8s6s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s6s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8s6s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s6s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s6s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8h5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8h5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8s5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8s5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8s5s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s5s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8s5s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s5s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s5s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8h4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8h4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8s4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8s4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8s4s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s4s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8s4s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s4s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s4s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8h3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8h3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8s3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8s3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8s3s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s3s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8s3s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s3s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s3s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8h2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8h2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8h2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8s2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8s2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks8s2s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s2s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks8s2s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s2s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks8s2s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7h7d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h7d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7h7d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h7d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h7d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7s7d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s7d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7s7d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s7d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s7d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7s7s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s7s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7s7s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s7s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s7s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7h6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7h6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7s6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7s6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7s6s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s6s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7s6s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s6s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s6s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7h5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7h5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7s5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7s5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7s5s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s5s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7s5s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s5s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s5s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7h4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7h4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7s4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7s4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7s4s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s4s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7s4s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s4s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s4s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7h3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7h3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7s3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7s3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7s3s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s3s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7s3s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s3s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s3s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7h2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7h2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7h2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7s2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7s2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks7s2s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s2s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks7s2s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s2s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks7s2s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks6h6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6h6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks6h6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6h6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6h6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks6s6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks6s6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks6s6s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s6s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks6s6s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s6s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s6s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks6h5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6h5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks6h5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6h5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6h5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks6s5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks6s5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks6s5s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s5s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks6s5s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s5s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s5s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks6h4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6h4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks6h4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6h4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6h4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks6s4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks6s4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks6s4s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s4s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks6s4s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s4s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s4s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks6h3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6h3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks6h3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6h3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6h3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks6s3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks6s3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks6s3s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s3s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks6s3s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s3s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s3s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks6h2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6h2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks6h2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6h2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6h2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks6s2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks6s2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks6s2s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s2s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks6s2s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s2s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks6s2s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks5h5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5h5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks5h5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5h5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5h5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks5s5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks5s5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks5s5s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s5s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks5s5s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s5s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s5s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks5h4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5h4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks5h4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5h4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5h4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks5s4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks5s4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks5s4s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s4s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks5s4s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s4s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s4s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks5h3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5h3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks5h3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5h3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5h3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks5s3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks5s3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks5s3s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s3s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks5s3s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s3s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s3s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks5h2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5h2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks5h2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5h2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5h2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks5s2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks5s2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks5s2s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s2s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks5s2s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s2s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks5s2s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks4h4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4h4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks4h4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4h4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4h4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks4s4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks4s4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks4s4s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s4s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks4s4s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s4s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s4s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks4h3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4h3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks4h3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4h3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4h3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks4s3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks4s3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks4s3s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s3s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks4s3s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s3s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s3s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks4h2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4h2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks4h2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4h2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4h2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks4s2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks4s2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks4s2s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s2s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks4s2s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s2s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks4s2s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks3h3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks3h3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks3h3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks3h3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks3h3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks3s3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks3s3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks3s3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks3s3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks3s3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase5_CO_ks3s3s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase5_CO_ks3s3s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase5_CO_ks3s3s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase5_CO_ks3s3s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase5_CO_ks3s3s SKIPPED (output exists)" >> "$LOG"
fi
echo "=== phase5 done $(date) ===" >> "$LOG"
