import { encodeBytes32String, keccak256, toBeHex, toBigInt as ethersToBigInt } from "ethers";

import { buildMerkleWitness, serializeMerkleWitness } from "./merkle-proof.mjs";

export function normalizeSemaphoreValue(value) {
  try {
    return ethersToBigInt(value);
  } catch (error) {
    if (typeof value === "string") {
      return ethersToBigInt(encodeBytes32String(value));
    }

    throw new TypeError(error instanceof Error ? error.message : String(error));
  }
}

export function hashSemaphoreValue(value) {
  const normalized = normalizeSemaphoreValue(value);
  return BigInt(keccak256(toBeHex(normalized, 32))) >> 8n;
}

export function buildCircuitWitness(identity, group, message, scope, merkleTreeDepth) {
  const merkleWitness = buildMerkleWitness(group, identity.commitment);
  const merkleProofLength = merkleWitness.merkleProofLength;
  const resolvedTreeDepth = merkleTreeDepth ?? (merkleProofLength !== 0 ? merkleProofLength : 1);
  const merkleProofSiblings = [...merkleWitness.merkleProofSiblings].map(BigInt);

  for (let i = 0; i < resolvedTreeDepth; i += 1) {
    if (merkleProofSiblings[i] === undefined) {
      merkleProofSiblings[i] = 0n;
    }
  }

  return {
    secret: identity.secretScalar,
    merkleProofLength,
    merkleProofIndex: merkleWitness.merkleProofIndex,
    merkleProofSiblings,
    message: hashSemaphoreValue(message),
    scope: hashSemaphoreValue(scope)
  };
}

export function serializeCircuitWitness(witness) {
  return {
    secret: witness.secret.toString(),
    merkleProofLength: witness.merkleProofLength,
    merkleProofIndex: witness.merkleProofIndex,
    merkleProofSiblings: witness.merkleProofSiblings.map((value) => value.toString()),
    message: witness.message.toString(),
    scope: witness.scope.toString()
  };
}

export function serializeCompleteWitness(identity, group, message, scope, merkleTreeDepth) {
  return {
    circuit: serializeCircuitWitness(
      buildCircuitWitness(identity, group, message, scope, merkleTreeDepth)
    ),
    merkle: serializeMerkleWitness(buildMerkleWitness(group, identity.commitment))
  };
}
