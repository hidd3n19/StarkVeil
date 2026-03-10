import assert from "node:assert/strict";

import { buildValidateProofCalldata, flattenGroth16ProofPoints } from "../offchain/calldata.mjs";
import { createPortGroup } from "../offchain/group.mjs";
import { createPortIdentity } from "../offchain/identity.mjs";
import { createProofPackage } from "../offchain/proof-package.mjs";
import { generateUpstreamSemaphoreProof } from "../offchain/proof.mjs";
import { hashSemaphoreValue } from "../offchain/witness.mjs";

const GROUP_ID = 1n;
const identity = createPortIdentity("starkveil-point-14-fixed-private-key");
const group = createPortGroup([identity.commitment, 2222n, 3333n]);
const proofResult = await generateUpstreamSemaphoreProof(identity, group, "Hello world", "Scope", 20);
const proofPackage = createProofPackage(proofResult);
const prepared = buildValidateProofCalldata(GROUP_ID, proofPackage);
const expectedProofPoints = flattenGroth16ProofPoints(proofPackage.points);

assert.equal(prepared.contract, "Semaphore");
assert.equal(prepared.entrypoint, "validate_proof");

assert.deepEqual(prepared.calldata, {
  group_id: "1",
  merkle_tree_depth: 20,
  merkle_tree_root: proofPackage.merkleTreeRoot,
  nullifier: proofPackage.nullifier,
  message: proofPackage.message,
  scope: proofPackage.scope,
  message_hash: hashSemaphoreValue(proofPackage.message).toString(),
  scope_hash: hashSemaphoreValue(proofPackage.scope).toString(),
  proof_points: expectedProofPoints
});

assert.equal(prepared.rawCalldata[0], "1");
assert.equal(prepared.rawCalldata[1], "20");
assert.equal(prepared.rawCalldata[2], proofPackage.merkleTreeRoot);
assert.equal(prepared.rawCalldata[3], proofPackage.nullifier);
assert.equal(prepared.rawCalldata[4], proofPackage.message);
assert.equal(prepared.rawCalldata[5], proofPackage.scope);
assert.equal(prepared.rawCalldata[6], hashSemaphoreValue(proofPackage.message).toString());
assert.equal(prepared.rawCalldata[7], hashSemaphoreValue(proofPackage.scope).toString());
assert.equal(prepared.rawCalldata[8], String(expectedProofPoints.length));
assert.deepEqual(prepared.rawCalldata.slice(9), expectedProofPoints);

assert.deepEqual(prepared.verifierPublicInputs, [
  proofPackage.merkleTreeRoot,
  proofPackage.nullifier,
  hashSemaphoreValue(proofPackage.message).toString(),
  hashSemaphoreValue(proofPackage.scope).toString()
]);

assert.equal(prepared.scopeHash, hashSemaphoreValue(proofPackage.scope).toString());

console.log("PASS: off-chain calldata validation for implementation point 21 and testing point 21 is satisfied");
process.exit(0);
