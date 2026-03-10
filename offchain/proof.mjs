import { groth16 } from "snarkjs";

import { ensureUpstreamArtifacts, loadVerificationKey } from "./artifacts.mjs";
import { buildCircuitWitness, serializeCircuitWitness } from "./witness.mjs";

export async function generateUpstreamSemaphoreProof(
  identity,
  group,
  message,
  scope,
  merkleTreeDepth = 20
) {
  const artifacts = await ensureUpstreamArtifacts(merkleTreeDepth);
  const witness = buildCircuitWitness(identity, group, message, scope, merkleTreeDepth);
  const serializedWitness = serializeCircuitWitness(witness);

  const { proof, publicSignals } = await groth16.fullProve(
    {
      secret: serializedWitness.secret,
      merkleProofLength: serializedWitness.merkleProofLength,
      merkleProofIndex: serializedWitness.merkleProofIndex,
      merkleProofSiblings: serializedWitness.merkleProofSiblings,
      message: serializedWitness.message,
      scope: serializedWitness.scope
    },
    artifacts.wasm,
    artifacts.zkey
  );

  return {
    merkleTreeDepth,
    merkleTreeRoot: publicSignals[0],
    nullifier: publicSignals[1],
    message: message.toString(),
    scope: scope.toString(),
    proof,
    publicSignals,
    witness: serializedWitness
  };
}

export async function verifyUpstreamSemaphoreProof(proofResult) {
  const verificationKey = await loadVerificationKey(proofResult.merkleTreeDepth);
  return groth16.verify(verificationKey, proofResult.publicSignals, proofResult.proof);
}
