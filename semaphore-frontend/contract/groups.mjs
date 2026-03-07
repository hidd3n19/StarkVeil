import { buildIdempotencyKey } from "./events.mjs";

export function mapCreateGroupToContractCall(input) {
  return {
    contract: "Semaphore",
    entrypoint: "create_group",
    calldata: {
      group_id: String(input.group_id),
      admin: String(input.admin || "0x0"),
      merkle_tree_depth: Number(input.depth)
    }
  };
}

export function mapJoinGroupToContractCall(input) {
  return {
    contract: "Semaphore",
    entrypoint: "add_member",
    calldata: {
      group_id: String(input.group_id),
      identity_commitment: String(input.identity_commitment)
    }
  };
}

export function mapRemoveMemberToContractCall(input) {
  return {
    contract: "Semaphore",
    entrypoint: "remove_member",
    calldata: {
      group_id: String(input.group_id),
      identity_commitment: String(input.identity_commitment),
      leaf_index: Number(input.leaf_index ?? -1)
    }
  };
}

export function mapPolicyUpdateToContractCall(input) {
  return {
    contract: "Semaphore",
    entrypoint: "set_group_policy",
    calldata: {
      group_id: String(input.group_id),
      eligibility_policy: input.eligibility_policy || { type: "open" }
    }
  };
}

export async function relayGroupCreate(relayClient, input) {
  const call = mapCreateGroupToContractCall(input);
  const idempotencyKey = buildIdempotencyKey("GROUP_CREATE", call);
  return relayClient.submit({ action: "GROUP_CREATE", call, idempotencyKey });
}

export async function relayGroupJoin(relayClient, input) {
  const call = mapJoinGroupToContractCall(input);
  const idempotencyKey = buildIdempotencyKey("GROUP_JOIN", call);
  return relayClient.submit({ action: "GROUP_JOIN", call, idempotencyKey });
}

export async function relayGroupRemove(relayClient, input) {
  const call = mapRemoveMemberToContractCall(input);
  const idempotencyKey = buildIdempotencyKey("GROUP_REMOVE", call);
  return relayClient.submit({ action: "GROUP_REMOVE", call, idempotencyKey });
}

export async function relayPolicyUpdate(relayClient, input) {
  const call = mapPolicyUpdateToContractCall(input);
  const idempotencyKey = buildIdempotencyKey("POLICY_UPDATE", call);
  return relayClient.submit({ action: "POLICY_UPDATE", call, idempotencyKey });
}
