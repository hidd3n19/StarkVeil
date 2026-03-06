#!/bin/bash
set -e

VK_FILE="$(dirname "$0")/../verification_key.json"
OUTPUT_DIR="$(dirname "$0")/../../src"
MODULE_NAME="groth16_backend"

echo "Verifying presence of verification_key.json..."
if [ ! -f "$VK_FILE" ]; then
    echo "verification_key.json not found! Please run build_circuit.sh first."
    exit 1
fi

echo "Ensure you have Garaga installed. E.g.: pip install garaga"
echo ""
echo "Generating Cairo Verifier using Garaga..."

# Example Garaga CLI generation
# This assumes the Garaga CLI 'garaga' is available
garaga gen --system groth16 --vk $VK_FILE --project-name $MODULE_NAME --output $OUTPUT_DIR

echo "Garaga generation complete!"
echo "Move or ensure the generated $MODULE_NAME.cairo is in the src directory."
