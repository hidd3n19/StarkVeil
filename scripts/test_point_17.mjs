import assert from "node:assert/strict";

import { createPortGroup } from "../offchain/group.mjs";
import {
  buildMerkleWitness,
  recomputeLeanIMTRootFromWitness,
  serializeMerkleWitness
} from "../offchain/merkle-proof.mjs";

const FIXED_MEMBERS = [1111n, 2222n, 3333n];
const TARGET_MEMBER = 2222n;
const EXPECTED_ROOT = "21438346587766314216803727798652172296304872150343181057779004941144316958414";
const EXPECTED_WITNESS = {
  leaf: "2222",
  root: EXPECTED_ROOT,
  merkleProofLength: 2,
  merkleProofIndex: 1,
  merkleProofSiblings: ["1111", "3333"]
};

const group = createPortGroup(FIXED_MEMBERS);
const witness = buildMerkleWitness(group, TARGET_MEMBER);
const serialized = serializeMerkleWitness(witness);

assert.equal(group.indexOf(TARGET_MEMBER), 1);
assert.deepEqual(serialized, EXPECTED_WITNESS);

const recomputedRoot = recomputeLeanIMTRootFromWitness(
  serialized.leaf,
  serialized.merkleProofIndex,
  serialized.merkleProofSiblings
);

assert.equal(recomputedRoot, EXPECTED_ROOT);
assert.equal(recomputedRoot, serialized.root);

assert.throws(
  () => buildMerkleWitness(group, 9999n),
  /Identity commitment is not a member of the group/
);

console.log("PASS: off-chain Merkle proof validation for implementation point 17 and testing point 17 is satisfied");
