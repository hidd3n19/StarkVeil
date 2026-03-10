import assert from "node:assert/strict";

import { Group } from "@semaphore-protocol/group";

import { createPortGroup, importPortGroup } from "../offchain/group.mjs";

const FIXED_MEMBERS = [1111n, 2222n, 3333n];
const EXPECTED_ROOT = "21438346587766314216803727798652172296304872150343181057779004941144316958414";

const first = createPortGroup(FIXED_MEMBERS);
const second = createPortGroup(FIXED_MEMBERS);
const upstream = new Group(FIXED_MEMBERS);

assert.equal(first.root.toString(), EXPECTED_ROOT);
assert.equal(second.root.toString(), EXPECTED_ROOT);
assert.equal(upstream.root.toString(), EXPECTED_ROOT);

assert.equal(first.root.toString(), second.root.toString());
assert.equal(first.root.toString(), upstream.root.toString());
assert.equal(first.depth, second.depth);
assert.equal(first.size, second.size);
assert.deepEqual(first.members.map(String), second.members.map(String));
assert.deepEqual(first.members.map(String), upstream.members.map(String));

assert.equal(first.depth, 2);
assert.equal(first.size, 3);
assert.deepEqual(first.members.map(String), FIXED_MEMBERS.map(String));
assert.equal(first.indexOf(1111n), 0);
assert.equal(first.indexOf(2222n), 1);
assert.equal(first.indexOf(3333n), 2);

const serialized = first.serialize();
assert.deepEqual(serialized, {
  root: EXPECTED_ROOT,
  depth: 2,
  size: 3,
  members: FIXED_MEMBERS.map(String)
});
assert.deepEqual(first.toProverGroup(), serialized);

const exported = first.export();
const imported = importPortGroup(exported);

assert.equal(imported.root.toString(), EXPECTED_ROOT);
assert.equal(imported.depth, 2);
assert.equal(imported.size, 3);
assert.deepEqual(imported.members.map(String), FIXED_MEMBERS.map(String));

console.log("PASS: runtime group validation for implementation point 15 and testing point 15 is satisfied");
