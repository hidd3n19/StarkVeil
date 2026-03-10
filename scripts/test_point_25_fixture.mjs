import assert from "node:assert/strict";

import { flattenGroth16ProofPoints } from "../offchain/calldata.mjs";
import { createValidateProofSubmission } from "../offchain/submission.mjs";

const proofResult = {
  merkleTreeDepth: 20,
  merkleTreeRoot: "1915826951860152537973846421180435708428200415375148218822513943503006881772",
  nullifier: "3458865867026562423864128494600834396845418179367624501223719005479595891815",
  message: "11",
  scope: "22",
  proof: {
    pi_a: ["42", "43", "1"],
    pi_b: [
      ["44", "45"],
      ["46", "47"],
      ["1", "0"]
    ],
    pi_c: ["48", "49", "1"],
    protocol: "groth16",
    curve: "bn128"
  }
};
const submission = createValidateProofSubmission(1n, proofResult);

assert.deepEqual(
  {
    merkleTreeDepth: submission.proofPackage.merkleTreeDepth,
    merkleTreeRoot: submission.proofPackage.merkleTreeRoot,
    nullifier: submission.proofPackage.nullifier,
    message: submission.proofPackage.message,
    scope: submission.proofPackage.scope
  },
  {
    merkleTreeDepth: 20,
    merkleTreeRoot: "1915826951860152537973846421180435708428200415375148218822513943503006881772",
    nullifier: "3458865867026562423864128494600834396845418179367624501223719005479595891815",
    message: "11",
    scope: "22"
  }
);

assert.equal(submission.proofPackage.points.protocol, "groth16");
assert.equal(submission.proofPackage.points.curve, "bn128");
assert.equal(Array.isArray(submission.proofPackage.points.pi_a), true);
assert.equal(Array.isArray(submission.proofPackage.points.pi_b), true);
assert.equal(Array.isArray(submission.proofPackage.points.pi_c), true);

const flattenedProofPoints = flattenGroth16ProofPoints(submission.proofPackage.points);

assert.deepEqual(submission.preparedCall.calldata, {
  group_id: "1",
  merkle_tree_depth: 20,
  merkle_tree_root: "1915826951860152537973846421180435708428200415375148218822513943503006881772",
  nullifier: "3458865867026562423864128494600834396845418179367624501223719005479595891815",
  message: "11",
  scope: "22",
  message_hash: "2579302562577254625442564198428206326386786986498533264305983357867499549",
  scope_hash: "381991507470523043981536760298699211324388782897715347961370496096313610818",
  proof_points: flattenedProofPoints
});

assert.deepEqual(submission.preparedCall.rawCalldata.slice(0, 9), [
  "1",
  "20",
  "1915826951860152537973846421180435708428200415375148218822513943503006881772",
  "3458865867026562423864128494600834396845418179367624501223719005479595891815",
  "11",
  "22",
  "2579302562577254625442564198428206326386786986498533264305983357867499549",
  "381991507470523043981536760298699211324388782897715347961370496096313610818",
  "12"
]);
assert.deepEqual(submission.preparedCall.rawCalldata.slice(9), flattenedProofPoints);

console.log("PASS: point 25 submission fixture matches the pinned off-chain submission flow");
process.exit(0);
