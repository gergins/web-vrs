$ErrorActionPreference = "Continue"

$ports = @(3000, 3004, 4001, 4003)
$stopped = @()

Write-Host "Stopping local VRS demo services..." -ForegroundColor Cyan

foreach ($port in $ports) {
  $processIds = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique

  foreach ($procId in $processIds) {
    try {
      Stop-Process -Id $procId -Force
      $stopped += [PSCustomObject]@{ Port = $port; PID = $procId }
    } catch {
      Write-Host "Failed to stop PID $procId on port $port" -ForegroundColor Yellow
    }
  }
}

if ($stopped.Count -eq 0) {
  Write-Host "No active demo processes found on ports 3000, 3004, 4001, 4003." -ForegroundColor Yellow
} else {
  Write-Host "Stopped processes:" -ForegroundColor Green
  $stopped | Sort-Object Port, PID | Format-Table -AutoSize
}
