import assert from "node:assert/strict";
import { unlink } from "node:fs/promises";

import { relayGroupCreate, relayGroupJoin } from "../contract/groups.mjs";
import { relayPollVote, relaySignalSubmit } from "../contract/proofs.mjs";
import { createRelayClient } from "../contract/relay_client.mjs";

const storePath = "/tmp/semaphore_phase2_relay_idempotency.json";

async function main() {
  try {
    await unlink(storePath);
  } catch {}

  const relayClient = createRelayClient({
    enabled: true,
    relayMode: "mock",
    storePath,
    maxRetries: 3
  });

  const groupCreate = await relayGroupCreate(relayClient, {
    group_id: "g-1",
    depth: 20,
    admin: "0x123"
  });
  assert.equal(groupCreate.status, "RELAYED");
  assert.ok(groupCreate.tx_hash);

  const groupCreateReplay = await relayGroupCreate(relayClient, {
    group_id: "g-1",
    depth: 20,
    admin: "0x123"
  });
  assert.equal(groupCreateReplay.replayed, true);
  assert.equal(groupCreateReplay.tx_hash, groupCreate.tx_hash);

  const groupJoin = await relayGroupJoin(relayClient, {
    group_id: "g-1",
    identity_commitment: "12345"
  });
  assert.equal(groupJoin.status, "RELAYED");

  const fakeProof = {
    merkle_tree_depth: 20,
    merkle_tree_root: "100",
    nullifier: "200",
    message: "YES",
    scope: "300",
    message_hash: "400",
    proof_points: ["1", "2", "3"]
  };

  const signal = await relaySignalSubmit(relayClient, {
    group_id: "g-1",
    proof: fakeProof
  });
  assert.equal(signal.status, "RELAYED");

  const vote = await relayPollVote(relayClient, {
    group_id: "g-1",
    proof: fakeProof
  });
  assert.equal(vote.status, "RELAYED");

  console.log("Phase 2 contract adapter tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
