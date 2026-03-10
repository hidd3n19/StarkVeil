import assert from "node:assert/strict";

import { Identity } from "@semaphore-protocol/identity";

import { createPortIdentity, importPortIdentity } from "../offchain/identity.mjs";

const FIXED_PRIVATE_KEY = "starkveil-point-14-fixed-private-key";
const EXPECTED_SECRET_SCALAR =
  "1438267848771025978925773081848144212277631810234829019001220837314248736683";
const EXPECTED_COMMITMENT =
  "8605193490045856462881442938423161176586994125765270102157641444951344051869";
const EXPECTED_PUBLIC_KEY = [
  "11263149958270825811621407695538808962066954956826183041555541738637243985781",
  "7473230207859235030510505904670387571150296344617233799409967255578718725250"
];

function assertSerializedShape(serialized) {
  assert.equal(typeof serialized.privateKey, "string");
  assert.equal(typeof serialized.secretScalar, "string");
  assert.equal(typeof serialized.commitment, "string");
  assert.equal(Array.isArray(serialized.publicKey), true);
  assert.equal(serialized.publicKey.length, 2);
}

const first = createPortIdentity(FIXED_PRIVATE_KEY);
const second = createPortIdentity(FIXED_PRIVATE_KEY);
const upstream = new Identity(FIXED_PRIVATE_KEY);

assert.equal(first.secretScalar.toString(), EXPECTED_SECRET_SCALAR);
assert.equal(first.commitment.toString(), EXPECTED_COMMITMENT);
assert.deepEqual(first.publicKey.map((value) => value.toString()), EXPECTED_PUBLIC_KEY);

assert.equal(first.secretScalar.toString(), second.secretScalar.toString());
assert.equal(first.commitment.toString(), second.commitment.toString());
assert.deepEqual(
  first.publicKey.map((value) => value.toString()),
  second.publicKey.map((value) => value.toString())
);

assert.equal(first.secretScalar.toString(), upstream.secretScalar.toString());
assert.equal(first.commitment.toString(), upstream.commitment.toString());
assert.deepEqual(
  first.publicKey.map((value) => value.toString()),
  upstream.publicKey.map((value) => value.toString())
);

const exported = first.export();
const imported = importPortIdentity(exported);

assert.equal(imported.export(), exported);
assert.equal(imported.secretScalar.toString(), first.secretScalar.toString());
assert.equal(imported.commitment.toString(), first.commitment.toString());
assert.deepEqual(
  imported.publicKey.map((value) => value.toString()),
  first.publicKey.map((value) => value.toString())
);

const serialized = first.serialize();
assertSerializedShape(serialized);
assert.equal(serialized.privateKey, exported);
assert.equal(serialized.secretScalar, EXPECTED_SECRET_SCALAR);
assert.equal(serialized.commitment, EXPECTED_COMMITMENT);
assert.deepEqual(serialized.publicKey, EXPECTED_PUBLIC_KEY);

const proofIdentity = first.toProofIdentity();
assert.deepEqual(proofIdentity, {
  secretScalar: EXPECTED_SECRET_SCALAR,
  commitment: EXPECTED_COMMITMENT
});

console.log("PASS: runtime identity validation for implementation point 14 and testing point 14 is satisfied");
