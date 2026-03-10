import assert from "node:assert/strict";

import { createPortGroup } from "../offchain/group.mjs";
import { createPortIdentity } from "../offchain/identity.mjs";
import {
  buildCircuitWitness,
  hashSemaphoreValue,
  normalizeSemaphoreValue,
  serializeCircuitWitness
} from "../offchain/witness.mjs";

const identity = createPortIdentity("starkveil-point-14-fixed-private-key");
const group = createPortGroup([identity.commitment, 2222n, 3333n]);
const MESSAGE = "Hello world";
const SCOPE = "Scope";
const EXPECTED_WITNESS = {
  secret: "1438267848771025978925773081848144212277631810234829019001220837314248736683",
  merkleProofLength: 2,
  merkleProofIndex: 0,
  merkleProofSiblings: ["2222", "3333", "0", "0"],
  message: "8665846418922331996225934941481656421248110469944536651334918563951783029",
  scope: "170164770795872309789133717676167925425155944778337387941930839678899666300"
};

const witness = buildCircuitWitness(identity, group, MESSAGE, SCOPE, 4);
const serialized = serializeCircuitWitness(witness);

assert.deepEqual(Object.keys(serialized), [
  "secret",
  "merkleProofLength",
  "merkleProofIndex",
  "merkleProofSiblings",
  "message",
  "scope"
]);

assert.equal(normalizeSemaphoreValue(MESSAGE).toString(), "32745724963520510550185023804391900974863477733501474067656557556163468591104");
assert.equal(normalizeSemaphoreValue(SCOPE).toString(), "37717653415819232215590989865455204849443869931268328771929128739472152723456");
assert.equal(hashSemaphoreValue(MESSAGE).toString(), EXPECTED_WITNESS.message);
assert.equal(hashSemaphoreValue(SCOPE).toString(), EXPECTED_WITNESS.scope);

assert.deepEqual(serialized, EXPECTED_WITNESS);

console.log("PASS: off-chain circuit witness validation for implementation point 18 and testing point 18 is satisfied");
