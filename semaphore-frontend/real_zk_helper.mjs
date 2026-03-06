import { buildPoseidon } from 'circomlibjs';
import { existsSync, readFileSync } from 'fs';
import { groth16 } from 'snarkjs';

// Helper to convert Uint8Array back to BigInt
function poseidonToBigInt(poseidon, input) {
    const F = poseidon.F;
    return F.toObject(input).toString();
}

let poseidonHash = null;

export async function initPoseidon() {
    if (!poseidonHash) {
        poseidonHash = await buildPoseidon();
    }
    return poseidonHash;
}

export async function hash2(a, b) {
    const p = await initPoseidon();
    return poseidonToBigInt(p, p([BigInt(a), BigInt(b)]));
}

// Generate a real Groth16 proof using snarkjs
export async function generateRealProof(witness, wasmPath, zkeyPath) {
    if (!existsSync(wasmPath) || !existsSync(zkeyPath)) {
        throw new Error("ZK circuit files not found! Please run build_circuit.sh first.");
    }

    // snarkjs calculates the proof
    const { proof, publicSignals } = await groth16.fullProve(witness, wasmPath, zkeyPath);

    // Format to the flat array point structure expected by Garaga
    const proof_points = [
        proof.pi_a[0], proof.pi_a[1], proof.pi_a[2],
        proof.pi_b[0][0], proof.pi_b[0][1], proof.pi_b[1][0], proof.pi_b[1][1], proof.pi_b[2][0], proof.pi_b[2][1],
        proof.pi_c[0], proof.pi_c[1], proof.pi_c[2]
    ];

    return {
        proof_points,
        publicSignals,
        prover_version: "snarkjs-groth16-v1"
    };
}

export async function verifyRealProof(publicSignals, proof_points, vkeyPath) {
    if (!existsSync(vkeyPath)) {
        throw new Error("Verification key not found! Please run build_circuit.sh first.");
    }
    const vKey = JSON.parse(readFileSync(vkeyPath, 'utf8'));

    // Reconstruct snarkjs proof object from flat points
    const proof = {
        pi_a: [proof_points[0], proof_points[1], proof_points[2]],
        pi_b: [
            [proof_points[3], proof_points[4]],
            [proof_points[5], proof_points[6]],
            [proof_points[7], proof_points[8]]
        ],
        pi_c: [proof_points[9], proof_points[10], proof_points[11]],
        protocol: "groth16",
        curve: "bn128"
    };

    const res = await groth16.verify(vKey, publicSignals, proof);
    if (!res) {
        throw new Error("INVALID_REAL_ZK_PROOF");
    }
    return true;
}
