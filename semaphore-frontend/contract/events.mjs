import { createHash } from "node:crypto";

function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
}

export function buildIdempotencyKey(action, payload) {
  const input = `${String(action)}:${stableStringify(payload)}`;
  return createHash("sha256").update(input).digest("hex");
}

export function buildRelayEvent(action, relayResult, payload) {
  return {
    type: "ONCHAIN_RELAY",
    at: new Date().toISOString(),
    data: {
      action,
      idempotency_key: relayResult?.idempotency_key || null,
      status: relayResult?.status || "UNKNOWN",
      replayed: Boolean(relayResult?.replayed),
      attempts: Number(relayResult?.attempts || 0),
      tx_hash: relayResult?.tx_hash || null,
      payload
    }
  };
}
