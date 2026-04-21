#!/bin/bash
set -u
cd "C:/Users/Jay/Desktop/GTO-Today/TexasSolver-v0.2.0-Windows"
LOG="C:/Users/Jay/poker-gto-guide/solver-run/batch.log"
echo "=== phase4 start $(date) ===" >> "$LOG"
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as8s5s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s5s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as8s5s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s5s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s5s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as8h4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as8h4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as8h4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as8h4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as8h4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as8s4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as8s4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as8s4s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s4s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as8s4s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s4s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s4s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as8h3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as8h3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as8h3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as8h3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as8h3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as8s3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as8s3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as8s3s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s3s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as8s3s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s3s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s3s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as8h2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as8h2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as8h2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as8h2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as8h2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as8s2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as8s2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as8s2s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s2s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as8s2s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s2s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as8s2s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7h7d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h7d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7h7d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h7d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h7d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7s7d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s7d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7s7d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s7d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s7d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7s7s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s7s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7s7s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s7s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s7s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7h6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7h6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7s6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7s6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7s6s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s6s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7s6s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s6s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s6s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7h5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7h5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7s5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7s5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7s5s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s5s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7s5s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s5s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s5s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7h4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7h4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7s4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7s4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7s4s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s4s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7s4s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s4s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s4s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7h3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7h3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7s3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7s3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7s3s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s3s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7s3s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s3s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s3s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7h2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7h2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7h2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7s2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7s2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as7s2s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s2s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as7s2s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s2s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as7s2s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as6h6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as6h6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as6h6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as6h6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as6h6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as6s6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as6s6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as6s6s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s6s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as6s6s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s6s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s6s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as6h5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as6h5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as6h5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as6h5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as6h5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as6s5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as6s5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as6s5s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s5s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as6s5s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s5s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s5s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as6h4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as6h4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as6h4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as6h4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as6h4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as6s4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as6s4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as6s4s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s4s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as6s4s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s4s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s4s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as6h3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as6h3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as6h3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as6h3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as6h3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as6s3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as6s3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as6s3s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s3s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as6s3s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s3s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s3s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as6h2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as6h2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as6h2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as6h2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as6h2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as6s2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as6s2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as6s2s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s2s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as6s2s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s2s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as6s2s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as5h5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as5h5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as5h5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as5h5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as5h5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as5s5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as5s5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as5s5s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s5s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as5s5s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s5s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s5s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as5h4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as5h4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as5h4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as5h4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as5h4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as5s4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as5s4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as5s4s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s4s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as5s4s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s4s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s4s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as5h3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as5h3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as5h3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as5h3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as5h3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as5s3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as5s3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as5s3s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s3s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as5s3s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s3s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s3s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as5h2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as5h2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as5h2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as5h2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as5h2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as5s2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as5s2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as5s2s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s2s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as5s2s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s2s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as5s2s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as4h4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as4h4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as4h4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as4h4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as4h4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as4s4d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s4d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as4s4d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s4d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s4d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as4s4s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s4s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as4s4s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s4s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s4s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as4h3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as4h3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as4h3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as4h3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as4h3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as4s3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as4s3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as4s3s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s3s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as4s3s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s3s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s3s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as4h2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as4h2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as4h2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as4h2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as4h2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as4s2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as4s2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as4s2s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s2s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as4s2s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s2s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as4s2s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as3h3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as3h3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as3h3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as3h3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as3h3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as3s3d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as3s3d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as3s3d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as3s3d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as3s3d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as3s3s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as3s3s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as3s3s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as3s3s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as3s3s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as3h2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as3h2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as3h2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as3h2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as3h2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as3s2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as3s2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as3s2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as3s2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as3s2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as3s2s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as3s2s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as3s2s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as3s2s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as3s2s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as2h2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as2h2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as2h2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as2h2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as2h2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as2s2d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as2s2d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as2s2d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as2s2d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as2s2d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_as2s2s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_as2s2s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_as2s2s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_as2s2s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_as2s2s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_kskhkd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_kskhkd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_kskhkd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_kskhkd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_kskhkd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_kskskd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_kskskd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_kskskd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_kskskd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_kskskd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_ksksks.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksks solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_ksksks.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksks done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksks SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_kskhqd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_kskhqd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_kskhqd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_kskhqd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_kskhqd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_ksksqd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksqd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_ksksqd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksqd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksqd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_ksksqs.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksqs solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_ksksqs.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksqs done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksqs SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_kskhjd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_kskhjd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_kskhjd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_kskhjd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_kskhjd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_ksksjd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksjd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_ksksjd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksjd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksjd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_ksksjs.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksjs solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_ksksjs.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksjs done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksjs SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_kskhtd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_kskhtd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_kskhtd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_kskhtd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_kskhtd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_kskstd.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_kskstd solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_kskstd.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_kskstd done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_kskstd SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_ksksts.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksts solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_ksksts.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksts done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_ksksts SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_kskh9d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_kskh9d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_kskh9d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_kskh9d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_kskh9d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_ksks9d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks9d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_ksks9d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks9d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks9d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_ksks9s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks9s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_ksks9s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks9s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks9s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_kskh8d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_kskh8d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_kskh8d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_kskh8d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_kskh8d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_ksks8d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks8d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_ksks8d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks8d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks8d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_ksks8s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks8s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_ksks8s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks8s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks8s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_kskh7d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_kskh7d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_kskh7d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_kskh7d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_kskh7d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_ksks7d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks7d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_ksks7d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks7d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks7d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_ksks7s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks7s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_ksks7s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks7s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks7s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_kskh6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_kskh6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_kskh6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_kskh6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_kskh6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_ksks6d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks6d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_ksks6d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks6d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks6d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_ksks6s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks6s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_ksks6s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks6s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks6s SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_kskh5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_kskh5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_kskh5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_kskh5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_kskh5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_ksks5d.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks5d solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_ksks5d.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks5d done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks5d SKIPPED (output exists)" >> "$LOG"
fi
if [ ! -s "C:/Users/Jay/poker-gto-guide/solver-run/outputs/phase4_CO_ksks5s.json" ]; then
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks5s solving..." >> "$LOG"
  ./console_solver.exe --input_file "C:/Users/Jay/poker-gto-guide/solver-run/inputs/phase4_CO_ksks5s.txt" --resource_dir ./resources >> "$LOG" 2>&1
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks5s done" >> "$LOG"
else
  echo "[$(date +%H:%M:%S)] phase4_CO_ksks5s SKIPPED (output exists)" >> "$LOG"
fi
echo "=== phase4 done $(date) ===" >> "$LOG"
