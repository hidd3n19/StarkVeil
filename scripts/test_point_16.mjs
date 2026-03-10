import assert from "node:assert/strict";

import { createPortIdentity } from "../offchain/identity.mjs";
import { buildAddMemberJoinRequest, buildAddMembersJoinRequest } from "../offchain/join.mjs";

const GROUP_ID = 1n;
const FIXED_PRIVATE_KEY = "starkveil-point-14-fixed-private-key";
const SECOND_PRIVATE_KEY = "starkveil-point-16-second-private-key";
const EXPECTED_COMMITMENT =
  "8605193490045856462881442938423161176586994125765270102157641444951344051869";

const identity = createPortIdentity(FIXED_PRIVATE_KEY);
const secondIdentity = createPortIdentity(SECOND_PRIVATE_KEY);

const addMemberRequest = buildAddMemberJoinRequest(GROUP_ID, identity);

assert.equal(addMemberRequest.action, "add_member");
assert.equal(addMemberRequest.groupId, "1");
assert.equal(addMemberRequest.identityCommitment, EXPECTED_COMMITMENT);
assert.deepEqual(addMemberRequest.calldata, ["1", EXPECTED_COMMITMENT]);
assert.equal("secretScalar" in addMemberRequest, false);
assert.equal("privateKey" in addMemberRequest, false);
assert.equal("publicKey" in addMemberRequest, false);

const addMembersRequest = buildAddMembersJoinRequest(GROUP_ID, [identity, secondIdentity]);

assert.equal(addMembersRequest.action, "add_members");
assert.equal(addMembersRequest.groupId, "1");
assert.equal(addMembersRequest.identityCommitments.length, 2);
assert.equal(addMembersRequest.identityCommitments[0], EXPECTED_COMMITMENT);
assert.equal(addMembersRequest.identityCommitments[1], secondIdentity.commitment.toString());
assert.deepEqual(addMembersRequest.calldata, [
  "1",
  EXPECTED_COMMITMENT,
  secondIdentity.commitment.toString()
]);
assert.equal("secretScalar" in addMembersRequest, false);
assert.equal("privateKey" in addMembersRequest, false);
assert.equal("publicKey" in addMembersRequest, false);

console.log("PASS: off-chain join payload validation for implementation point 16 and testing point 16 is satisfied");
