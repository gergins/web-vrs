#!/bin/bash
echo "Checking TLS certificates..."
if [ ! -f ../assets/cert.pem ]; then
  echo "Missing certificate."
  exit 1
fi
echo "TLS certificate present."
