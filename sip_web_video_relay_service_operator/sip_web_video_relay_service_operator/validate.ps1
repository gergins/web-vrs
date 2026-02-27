Write-Host "=== Baseline Verification ==="

# Block plaintext SIP for external usage
\ = Select-String -Path . -Pattern "sip:" -Recurse -Exclude "*.md","*.json"
if (\) {
    Write-Host "ERROR: Plaintext SIP detected."
    exit 1
}

# Detect hardcoded secrets
\ = Select-String -Path . -Pattern "password\s*=|secret\s*=|api_key\s*=" -Recurse
if (\) {
    Write-Host "ERROR: Hardcoded secret detected."
    exit 1
}

# Validate required TLS/SRTP flags
if (!(Test-Path ".\assets\sample_sip_tls.conf")) {
    Write-Host "ERROR: TLS config missing."
    exit 1
}

if (!(Test-Path ".\assets\codec_policy.json")) {
    Write-Host "ERROR: Codec policy missing."
    exit 1
}

Write-Host "Baseline verification passed."
exit 0
