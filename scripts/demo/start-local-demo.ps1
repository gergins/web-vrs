$ErrorActionPreference = "Stop"

$repoRoot = "c:\Users\Gergin\Projects\vrs test 1"
$platformRoot = Join-Path $repoRoot "vrs-platform"

Write-Host "Starting local VRS demo services..." -ForegroundColor Cyan

Start-Process -FilePath "npm.cmd" -ArgumentList "run start" -WorkingDirectory (Join-Path $platformRoot "services\signaling")
Start-Process -FilePath "npm.cmd" -ArgumentList "run start" -WorkingDirectory (Join-Path $platformRoot "services\assignment")
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory (Join-Path $platformRoot "apps\web")
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory (Join-Path $platformRoot "apps\interpreter")

Write-Host "Waiting for services to become ready..." -ForegroundColor Yellow

$checks = @(
  @{ name = "signaling"; url = "http://localhost:4001/health" },
  @{ name = "assignment"; url = "http://localhost:4003/assign" },
  @{ name = "deaf-ui"; url = "http://localhost:3000" },
  @{ name = "interpreter-ui"; url = "http://localhost:3004" }
)

$allReady = $false
for ($attempt = 1; $attempt -le 40; $attempt++) {
  $ok = $true
  foreach ($c in $checks) {
    try {
      $null = Invoke-WebRequest -Uri $c.url -UseBasicParsing -TimeoutSec 2
    } catch {
      $ok = $false
      break
    }
  }
  if ($ok) {
    $allReady = $true
    break
  }
  Start-Sleep -Seconds 1
}

if (-not $allReady) {
  Write-Host "Some services are not ready yet. You can still check manually." -ForegroundColor Red
}

Write-Host ""
Write-Host "Demo URLs" -ForegroundColor Green
Write-Host "Deaf UI:        http://localhost:3000"
Write-Host "Interpreter UI: http://localhost:3004"
Write-Host "Signaling:      http://localhost:4001/health"
Write-Host "Assignment:     http://localhost:4003/assign"
Write-Host ""
Write-Host "Quick demo steps" -ForegroundColor Green
Write-Host "1) Open Deaf UI and Interpreter UI in separate browser windows/profiles."
Write-Host "2) Allow camera/microphone permissions on both."
Write-Host "3) Deaf clicks 'Ring Interpreter'."
Write-Host "4) Interpreter clicks 'Accept'."
Write-Host "5) Demo video + chat + RTT + fullscreen overlay."
Write-Host ""
Write-Host "Tip: If behavior looks stale after code changes, restart signaling and refresh both pages."
