$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$stopLocalScript = Join-Path $scriptDir "stop-local-demo.ps1"

if (-not (Test-Path $stopLocalScript)) {
  Write-Host "stop-local-demo.ps1 not found next to stop-lan-demo.ps1" -ForegroundColor Red
  exit 1
}

Write-Host "Stopping LAN demo services..." -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File $stopLocalScript
