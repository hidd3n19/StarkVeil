#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -f "$ROOT/.env" ]; then
  set -a
  . "$ROOT/.env"
  set +a
fi

if [ -z "${STARKNET_ACCOUNT:-}" ] || [ -z "${STARKNET_KEYSTORE:-}" ] || [ -z "${STARKNET_RPC:-}" ]; then
  echo "missing STARKNET_ACCOUNT, STARKNET_KEYSTORE, or STARKNET_RPC"
  exit 1
fi

SIERRA="$ROOT/starkveil_groth16_backend/target/dev/starkveil_groth16_backend_Groth16VerifierBN254.contract_class.json"
CASM="$ROOT/starkveil_groth16_backend/target/dev/starkveil_groth16_backend_Groth16VerifierBN254.compiled_contract_class.json"

if [ ! -f "$SIERRA" ] || [ ! -f "$CASM" ]; then
  echo "missing verifier artifacts; build starkveil_groth16_backend first"
  exit 1
fi

CLASS_HASH="$(starkli class-hash "$SIERRA")"
echo "verifier class hash: $CLASS_HASH"

if starkli class-by-hash --rpc "$STARKNET_RPC" "$CLASS_HASH" >/dev/null 2>&1; then
  echo "already declared on chain"
  exit 0
fi

echo "declaring verifier class on chain..."
starkli declare \
  --rpc "$STARKNET_RPC" \
  --account "$STARKNET_ACCOUNT" \
  --keystore "$STARKNET_KEYSTORE" \
  ${STARKNET_KEYSTORE_PASSWORD:+--keystore-password "$STARKNET_KEYSTORE_PASSWORD"} \
  --casm-file "$CASM" \
  --watch \
  "$SIERRA"

echo "declared class hash: $CLASS_HASH"
