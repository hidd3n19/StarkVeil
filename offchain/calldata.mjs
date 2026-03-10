import { hashSemaphoreValue } from "./witness.mjs";

export function flattenGroth16ProofPoints(points) {
  return [
    points.pi_a[0],
    points.pi_a[1],
    points.pi_a[2],
    points.pi_b[0][0],
    points.pi_b[0][1],
    points.pi_b[1][0],
    points.pi_b[1][1],
    points.pi_b[2][0],
    points.pi_b[2][1],
    points.pi_c[0],
    points.pi_c[1],
    points.pi_c[2]
  ].map(String);
}

export function buildValidateProofCalldata(groupId, proofPackage) {
  const messageHash = hashSemaphoreValue(proofPackage.message).toString();
  const scopeHash = hashSemaphoreValue(proofPackage.scope).toString();
  const proofPoints = flattenGroth16ProofPoints(proofPackage.points);

  const calldata = {
    group_id: String(groupId),
    merkle_tree_depth: Number(proofPackage.merkleTreeDepth),
    merkle_tree_root: String(proofPackage.merkleTreeRoot),
    nullifier: String(proofPackage.nullifier),
    message: String(proofPackage.message),
    scope: String(proofPackage.scope),
    message_hash: messageHash,
    scope_hash: scopeHash,
    proof_points: proofPoints
  };

  return {
    contract: "Semaphore",
    entrypoint: "validate_proof",
    calldata,
    rawCalldata: [
      calldata.group_id,
      String(calldata.merkle_tree_depth),
      calldata.merkle_tree_root,
      calldata.nullifier,
      calldata.message,
      calldata.scope,
      calldata.message_hash,
      calldata.scope_hash,
      String(proofPoints.length),
      ...proofPoints
    ],
    verifierPublicInputs: [
      calldata.merkle_tree_root,
      calldata.nullifier,
      messageHash,
      scopeHash
    ],
    scopeHash
  };
}
