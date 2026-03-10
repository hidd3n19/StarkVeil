import assert from "node:assert/strict";

import { createPortGroup } from "../offchain/group.mjs";
import { createPortIdentity } from "../offchain/identity.mjs";
import { createProofPackage, deserializeProofPackage, serializeProofPackage } from "../offchain/proof-package.mjs";
import { generateUpstreamSemaphoreProof } from "../offchain/proof.mjs";

const identity = createPortIdentity("starkveil-point-14-fixed-private-key");
const group = createPortGroup([identity.commitment, 2222n, 3333n]);

const proofResult = await generateUpstreamSemaphoreProof(identity, group, "Hello world", "Scope", 20);
const proofPackage = createProofPackage(proofResult);
const serialized = serializeProofPackage(proofPackage);
const roundTripped = deserializeProofPackage(serialized);

assert.deepEqual(Object.keys(proofPackage), [
  "merkleTreeDepth",
  "merkleTreeRoot",
  "nullifier",
  "message",
  "scope",
  "points"
]);

assert.equal(typeof proofPackage.merkleTreeDepth, "number");
assert.equal(typeof proofPackage.merkleTreeRoot, "string");
assert.equal(typeof proofPackage.nullifier, "string");
assert.equal(typeof proofPackage.message, "string");
assert.equal(typeof proofPackage.scope, "string");
assert.equal(typeof proofPackage.points, "object");
assert.equal(Array.isArray(proofPackage.points.pi_a), true);
assert.equal(Array.isArray(proofPackage.points.pi_b), true);
assert.equal(Array.isArray(proofPackage.points.pi_c), true);
assert.equal(proofPackage.points.protocol, "groth16");
assert.equal(proofPackage.points.curve, "bn128");

assert.deepEqual(roundTripped, proofPackage);

console.log("PASS: off-chain proof package validation for implementation point 20 and testing point 20 is satisfied");
process.exit(0);
