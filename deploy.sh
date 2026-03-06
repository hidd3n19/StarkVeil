#!/bin/bash
set -e

# Load local env file if present (kept out of git by .gitignore)
if [ -f ".env" ]; then
    set -a
    . ./.env
    set +a
fi

# ==============================================================================
# Deploy Semaphore and Groth16 Verifier to Starknet Sepolia
# ==============================================================================
# This script uses Starkli to declare and deploy the Cairo smart contracts.
#
# PREREQUISITES:
# 1. Install starkli: https://book.starkli.rs/installation
# 2. Setup your Keystore and Account descriptors:
#    starkli account fetch <YOUR_WALLET_ADDRESS> --output ~/.starkli-wallets/account.json
#    export STARKNET_ACCOUNT=~/.starkli-wallets/account.json
#    export STARKNET_KEYSTORE=~/.starkli-wallets/keystore.json
# 3. Supply a valid RPC node:
#    export STARKNET_RPC="https://starknet-sepolia.public.blastapi.io"
# ==============================================================================

if [ -z "$STARKNET_ACCOUNT" ] || [ -z "$STARKNET_KEYSTORE" ] || [ -z "$STARKNET_RPC" ]; then
    echo "❌ Error: Please set STARKNET_ACCOUNT, STARKNET_KEYSTORE, and STARKNET_RPC environment variables."
    echo "Example:"
    echo "export STARKNET_ACCOUNT=~/.starkli-wallets/account.json"
    echo "export STARKNET_KEYSTORE=~/.starkli-wallets/keystore.json"
    echo "export STARKNET_RPC=https://starknet-sepolia.public.blastapi.io"
    exit 1
fi

echo "🚀 Compiling contracts using Scarb..."
scarb build

echo "📦 Declaring Groth16 Backend Verifier..."
VERIFIER_CLASS_HASH=$(starkli declare target/dev/semaphore_starknet_Groth16Backend.contract_class.json --compiler-version 2.8.2 --watch | grep "Class hash declared:" | awk '{print $4}')
echo "✅ Groth16 Backend Declared: $VERIFIER_CLASS_HASH"

echo "🚀 Deploying Groth16 Backend Verifier..."
# The dummy verifier has no constructor arguments
VERIFIER_ADDRESS=$(starkli deploy $VERIFIER_CLASS_HASH --watch | grep "Contract deployed:" | awk '{print $3}')
echo "✅ Groth16 Backend Deployed: $VERIFIER_ADDRESS"

echo "📦 Declaring Semaphore..."
SEMAPHORE_CLASS_HASH=$(starkli declare target/dev/semaphore_starknet_Semaphore.contract_class.json --compiler-version 2.8.2 --watch | grep "Class hash declared:" | awk '{print $4}')
echo "✅ Semaphore Declared: $SEMAPHORE_CLASS_HASH"

echo "🚀 Deploying Semaphore..."
# The Semaphore constructor expects (verifier_address, owner_address)
# For owner, we use the account address stored in Starkli
OWNER_ADDRESS=$(cat $STARKNET_ACCOUNT | grep "deployment" -A 5 | grep "address" | cut -d '"' -f 4)
SEMAPHORE_ADDRESS=$(starkli deploy $SEMAPHORE_CLASS_HASH $VERIFIER_ADDRESS $OWNER_ADDRESS --watch | grep "Contract deployed:" | awk '{print $3}')
echo "✅ Semaphore Deployed: $SEMAPHORE_ADDRESS"

echo ""
echo "🎉 Deployment Complete!"
echo "----------------------------------------------------"
echo "Verifier Contract:  $VERIFIER_ADDRESS"
echo "Semaphore Contract: $SEMAPHORE_ADDRESS"
echo "----------------------------------------------------"
echo "Update your frontend to point to these new contract addresses!"
