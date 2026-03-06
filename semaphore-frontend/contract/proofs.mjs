import { buildIdempotencyKey } from "./events.mjs";

export function mapSignalSubmitToContractCall(input) {
  return {
    contract: "Semaphore",
    entrypoint: "validate_proof",
    calldata: {
      group_id: String(input.group_id),
      merkle_tree_depth: Number(input.proof.merkle_tree_depth),
      merkle_tree_root: String(input.proof.merkle_tree_root),
      nullifier: String(input.proof.nullifier),
      message: String(input.proof.message || ""),
      scope: String(input.proof.scope),
      message_hash: String(input.proof.message_hash),
      proof_points: Array.isArray(input.proof.proof_points) ? input.proof.proof_points.map(String) : []
    }
  };
}

export function mapPollVoteToContractCall(input) {
  return mapSignalSubmitToContractCall(input);
}

export async function relaySignalSubmit(relayClient, input) {
  const call = mapSignalSubmitToContractCall(input);
  const idempotencyKey = buildIdempotencyKey("SIGNAL_SUBMIT", call);
  return relayClient.submit({ action: "SIGNAL_SUBMIT", call, idempotencyKey });
}

export async function relayPollVote(relayClient, input) {
  const call = mapPollVoteToContractCall(input);
  const idempotencyKey = buildIdempotencyKey("POLL_VOTE", call);
  return relayClient.submit({ action: "POLL_VOTE", call, idempotencyKey });
}
