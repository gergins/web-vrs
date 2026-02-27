Write-Host "=== Baseline Verification ==="

\ = Resolve-Path "."
\ = Get-ChildItem -Path \ -Recurse -File

# Block plaintext SIP (external only, ignore markdown/json)
\ = \ | Where-Object {
    \.Extension -notin ".md",".json"
} | Select-String -Pattern '\bsip:' -SimpleMatch

if (\) {
    Write-Host "ERROR: Plaintext SIP detected:"
    \ | Select-Object -First 5
    exit 1
}

# Detect hardcoded secrets (simple deterministic pattern)
\ = \ | Select-String -Pattern 'password\s*=|secret\s*=|api[_-]?key\s*='

if (\) {
    Write-Host "ERROR: Hardcoded secret detected:"
    \ | Select-Object -First 5
    exit 1
}

# Validate TLS config exists
if (!(Test-Path "sip_web_video_relay_service_operator\assets\sample_sip_tls.conf")) {
    Write-Host "ERROR: TLS config missing."
    exit 1
}

# Validate codec policy exists
if (!(Test-Path "sip_web_video_relay_service_operator\assets\codec_policy.json")) {
    Write-Host "ERROR: Codec policy missing."
    exit 1
}

Write-Host "Baseline verification passed."
exit 0
