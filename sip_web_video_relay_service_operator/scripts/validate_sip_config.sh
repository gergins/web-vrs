#!/bin/bash
echo "Validating SIP configuration..."
grep -E "tls|transport=ws|transport=wss" ../assets/sample_sip_tls.conf || exit 1
echo "SIP config validation passed."
