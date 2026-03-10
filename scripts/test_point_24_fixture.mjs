import assert from "node:assert/strict";

import { createPortIdentity } from "../offchain/identity.mjs";
import { createPortGroup } from "../offchain/group.mjs";
import { generateUpstreamSemaphoreProof } from "../offchain/proof.mjs";
import { hashSemaphoreValue } from "../offchain/witness.mjs";

const identity = createPortIdentity("point24-fit-77");
const group = createPortGroup([identity.commitment]);
const proofResult = await generateUpstreamSemaphoreProof(identity, group, 11n, 22n, 20);

assert.equal(
  identity.commitment.toString(),
  "1915826951860152537973846421180435708428200415375148218822513943503006881772"
);
assert.equal(
  proofResult.publicSignals[0],
  "1915826951860152537973846421180435708428200415375148218822513943503006881772"
);
assert.equal(
  proofResult.publicSignals[1],
  "3458865867026562423864128494600834396845418179367624501223719005479595891815"
);
assert.equal(hashSemaphoreValue(11n).toString(), "2579302562577254625442564198428206326386786986498533264305983357867499549");
assert.equal(hashSemaphoreValue(22n).toString(), "381991507470523043981536760298699211324388782897715347961370496096313610818");

console.log("PASS: point 24 upstream proof fixture matches the pinned generator");
process.exit(0);
