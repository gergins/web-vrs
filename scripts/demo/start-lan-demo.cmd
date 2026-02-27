@echo off
setlocal

set SCRIPT_DIR=%~dp0
set PS1_PATH=%SCRIPT_DIR%start-lan-demo.ps1

if "%~1"=="" (
  set /p LAN_IP=Enter LAN IPv4 (example 192.168.1.50): 
) else (
  set LAN_IP=%~1
)

if "%LAN_IP%"=="" (
  echo No LAN IP provided.
  pause
  exit /b 1
)

powershell -ExecutionPolicy Bypass -File "%PS1_PATH%" -LanIp %LAN_IP%
if errorlevel 1 (
  echo LAN demo failed to start.
)

pause
