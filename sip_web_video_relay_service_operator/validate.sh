#!/bin/bash
echo "=== Baseline Verification ==="

grep -R "sip:" . --exclude="*.md" --exclude="*.json" && echo "ERROR: Plaintext SIP found" && exit 1

grep -R "password=\|secret=\|api_key=" . && echo "ERROR: Hardcoded secret found" && exit 1

[ ! -f "./assets/sample_sip_tls.conf" ] && echo "ERROR: TLS config missing" && exit 1

[ ! -f "./assets/codec_policy.json" ] && echo "ERROR: Codec policy missing" && exit 1

echo "Baseline verification passed."
exit 0
