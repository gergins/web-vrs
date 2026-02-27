$ErrorActionPreference = "Stop"

$rules = @(
  @{ Name = "VRS Demo 3000"; Port = 3000 },
  @{ Name = "VRS Demo 3004"; Port = 3004 },
  @{ Name = "VRS Demo 4001"; Port = 4001 },
  @{ Name = "VRS Demo 4003"; Port = 4003 }
)

Write-Host "Adding/updating Windows Firewall inbound rules for LAN demo..." -ForegroundColor Cyan

foreach ($rule in $rules) {
  $existing = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
  if ($existing) {
    Write-Host "Rule already exists: $($rule.Name)" -ForegroundColor Yellow
    continue
  }

  New-NetFirewallRule `
    -DisplayName $rule.Name `
    -Direction Inbound `
    -Action Allow `
    -Protocol TCP `
    -LocalPort $rule.Port `
    -Profile Any | Out-Null

  Write-Host "Added: $($rule.Name) (TCP $($rule.Port))" -ForegroundColor Green
}

Write-Host ""
Write-Host "Firewall demo rules ready." -ForegroundColor Green
Write-Host "If this script fails, run PowerShell as Administrator and retry." -ForegroundColor Yellow
