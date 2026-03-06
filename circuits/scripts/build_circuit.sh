#!/bin/bash
set -e

echo "Building Semaphore Circuit..."

# Ensure we are in the circuits directory
cd "$(dirname "$0")/.."

# 1. Compile the circuit
echo "Compiling circuit with circom..."
# Assume circom is downloaded locally
./scripts/circom semaphore.circom --r1cs --wasm --sym

# 2. Download Powers of Tau (we need one with enough constraints)
# A circuit with 20 levels usually needs around 13-14 powers of tau
# We will download a pre-computed phase-1 file from Hermez
PTAU_FILE="powersOfTau28_hez_final_14.ptau"
if [ ! -f "$PTAU_FILE" ]; then
    echo "Downloading Powers of Tau file..."
    curl -L "https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_14.ptau" -o $PTAU_FILE
fi

# 3. Setup Groth16 using snarkjs
echo "Setting up Groth16 proving keys..."
npx snarkjs groth16 setup semaphore.r1cs $PTAU_FILE semaphore_0000.zkey

# 4. Contribute to the phase 2 ceremony (just locally for testing)
echo "Contributing to phase 2 randomness..."
npx snarkjs zkey contribute semaphore_0000.zkey semaphore_final.zkey --name="Local Test" -v -e="$(openssl rand -base64 32)"

# 5. Export Verification Key
echo "Exporting verification key..."
npx snarkjs zkey export verificationkey semaphore_final.zkey verification_key.json

echo "Build complete! Generated:"
echo "- semaphore_js/semaphore.wasm (for creating client proofs)"
echo "- semaphore_final.zkey (for proving)"
echo "- verification_key.json (for generating Garaga Cairo verifier)"
