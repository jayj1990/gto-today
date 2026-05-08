@echo off
setlocal enabledelayedexpansion
cd /d C:\Users\Jay\poker-gto-guide

REM Skip if watchdog already running. tasklist /v shows command line under WindowTitle for some shells; we use wmic for reliability.
set "ALREADY="
for /f "skip=1 tokens=*" %%i in ('wmic process where "name='bash.exe'" get CommandLine /format:list 2^>nul') do (
  echo %%i | findstr /c:"process-watchdog.sh" >nul && set "ALREADY=1"
)

if defined ALREADY (
  echo [%date% %time%] watchdog already running, skip >> solver-run\start-watchdog.log
  exit /b 0
)

echo [%date% %time%] launching watchdog >> solver-run\start-watchdog.log
start "" /B "C:\Program Files\Git\bin\bash.exe" -c "nohup bash solver-run/process-watchdog.sh >> solver-run/process-watchdog.out 2>&1 < /dev/null &"
exit /b 0