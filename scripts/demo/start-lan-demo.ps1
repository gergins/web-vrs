param(
  [string]$LanIp,
  [switch]$LaunchChromeSecure
)

$ErrorActionPreference = "Stop"

if (-not $LanIp) {
  $LanIp = Read-Host "Enter LAN IPv4 address (example 192.168.1.123)"
}

if (-not $LanIp) {
  Write-Host "Usage: .\scripts\demo\start-lan-demo.ps1 -LanIp 192.168.1.123" -ForegroundColor Yellow
  Write-Host "Press Enter to exit..."
  [void](Read-Host)
  exit 1
}

$repoRoot = "c:\Users\Gergin\Projects\vrs test 1"
$platformRoot = Join-Path $repoRoot "vrs-platform"
$signalWs = "ws://$LanIp`:4001"

Write-Host "Starting LAN demo services on $LanIp ..." -ForegroundColor Cyan
Write-Host "Signaling URL for UIs: $signalWs" -ForegroundColor Cyan

Start-Process -FilePath "npm.cmd" -ArgumentList "run start" -WorkingDirectory (Join-Path $platformRoot "services\signaling")
Start-Process -FilePath "npm.cmd" -ArgumentList "run start" -WorkingDirectory (Join-Path $platformRoot "services\assignment")

$webEnv = "set NEXT_PUBLIC_SIGNALING_URL=$signalWs&& npm run dev -- -H 0.0.0.0 -p 3000"
$intEnv = "set NEXT_PUBLIC_SIGNALING_URL=$signalWs&& npm run dev -- -H 0.0.0.0 -p 3004"

Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $webEnv -WorkingDirectory (Join-Path $platformRoot "apps\web")
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $intEnv -WorkingDirectory (Join-Path $platformRoot "apps\interpreter")

Write-Host "Waiting for services..." -ForegroundColor Yellow

$checks = @(
  @{ name = "signaling"; url = "http://localhost:4001/health" },
  @{ name = "assignment"; url = "http://localhost:4003/assign" },
  @{ name = "deaf-ui"; url = "http://$LanIp`:3000" },
  @{ name = "interpreter-ui"; url = "http://$LanIp`:3004" }
)

$allReady = $false
for ($attempt = 1; $attempt -le 50; $attempt++) {
  $ok = $true
  foreach ($c in $checks) {
    try {
      $null = Invoke-WebRequest -Uri $c.url -UseBasicParsing -TimeoutSec 2
    } catch {
      $ok = $false
      break
    }
  }
  if ($ok) { $allReady = $true; break }
  Start-Sleep -Seconds 1
}

if (-not $allReady) {
  Write-Host "Some services are not ready yet. Check console windows and firewall settings." -ForegroundColor Red
}

Write-Host ""
Write-Host "Share these URLs on LAN" -ForegroundColor Green
Write-Host "Deaf UI:        http://$LanIp`:3000"
Write-Host "Interpreter UI: http://$LanIp`:3004"
Write-Host ""
Write-Host "Important for camera/mic on colleague machine:" -ForegroundColor Yellow
Write-Host "- Best: run behind HTTPS (recommended)."
Write-Host "- HTTP on LAN may block camera/mic in modern browsers."
Write-Host ""
Write-Host "Demo flow:" -ForegroundColor Green
Write-Host "1) Deaf opens 3000, Interpreter opens 3004"
Write-Host "2) Deaf clicks Ring Interpreter"
Write-Host "3) Interpreter clicks Accept"
Write-Host ""
Write-Host "Camera list fix for HTTP LAN (Chrome):" -ForegroundColor Yellow
Write-Host "Use -LaunchChromeSecure to auto-open Chrome with secure-origin flags for this LAN IP."
Write-Host "Example:"
Write-Host "powershell -ExecutionPolicy Bypass -File `"$repoRoot\scripts\demo\start-lan-demo.ps1`" -LanIp $LanIp -LaunchChromeSecure"

if ($LaunchChromeSecure) {
  $chromeCandidates = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
  )

  $chromePath = $chromeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
  if (-not $chromePath) {
    Write-Host "Chrome not found. Install Chrome or open browser manually with secure-origin flag." -ForegroundColor Red
  } else {
    $secureOrigins = "http://$LanIp`:3000,http://$LanIp`:3004"
    $profileDir = Join-Path $env:TEMP "vrs-lan-chrome-profile"
    $args = @(
      "--user-data-dir=$profileDir",
      "--unsafely-treat-insecure-origin-as-secure=$secureOrigins",
      "--new-window",
      "http://$LanIp`:3000"
    )
    Start-Process -FilePath $chromePath -ArgumentList $args
    Start-Sleep -Milliseconds 700
    Start-Process -FilePath $chromePath -ArgumentList @("--user-data-dir=$profileDir", "http://$LanIp`:3004")
    Write-Host "Chrome launched with LAN secure-origin override for camera/mic." -ForegroundColor Green
  }
}
