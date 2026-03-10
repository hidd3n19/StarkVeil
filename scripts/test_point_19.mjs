import assert from "node:assert/strict";

import { createPortGroup } from "../offchain/group.mjs";
import { createPortIdentity } from "../offchain/identity.mjs";
import { generateUpstreamSemaphoreProof, verifyUpstreamSemaphoreProof } from "../offchain/proof.mjs";

const identity = createPortIdentity("starkveil-point-14-fixed-private-key");
const group = createPortGroup([identity.commitment, 2222n, 3333n]);
const message = "Hello world";
const scope = "Scope";

const proofResult = await generateUpstreamSemaphoreProof(identity, group, message, scope, 20);
const verified = await verifyUpstreamSemaphoreProof(proofResult);

assert.equal(verified, true);
assert.equal(proofResult.merkleTreeDepth, 20);
assert.equal(typeof proofResult.merkleTreeRoot, "string");
assert.equal(typeof proofResult.nullifier, "string");
assert.equal(proofResult.publicSignals.length >= 2, true);
assert.equal(proofResult.publicSignals[0], proofResult.merkleTreeRoot);
assert.equal(proofResult.publicSignals[1], proofResult.nullifier);
assert.equal(typeof proofResult.proof, "object");
assert.equal(typeof proofResult.proof.pi_a, "object");
assert.equal(typeof proofResult.proof.pi_b, "object");
assert.equal(typeof proofResult.proof.pi_c, "object");
assert.equal(proofResult.message, message);
assert.equal(proofResult.scope, scope);

console.log("PASS: off-chain proof generation validation for implementation point 19 and testing point 19 is satisfied");
process.exit(0);
