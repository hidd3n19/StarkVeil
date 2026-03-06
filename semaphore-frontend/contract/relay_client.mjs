import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

function hashHex(input) {
  return createHash("sha256").update(String(input)).digest("hex");
}

async function readStore(path) {
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : { records: {} };
  } catch {
    return { records: {} };
  }
}

async function writeStore(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function backoffMs(attempt) {
  return 60 * 2 ** Math.max(0, attempt - 1);
}

export function createRelayClient(config) {
  const storePath = config.storePath;
  const relayMode = String(config.relayMode || "mock");
  const enabled = Boolean(config.enabled);

  return {
    async submit({ action, call, idempotencyKey }) {
      if (!enabled) {
        return {
          status: "SKIPPED_FLAG_OFF",
          idempotency_key: idempotencyKey,
          replayed: false,
          attempts: 0,
          tx_hash: null
        };
      }

      const store = await readStore(storePath);
      const existing = store.records[idempotencyKey];
      if (existing) {
        return {
          ...existing,
          replayed: true,
          idempotency_key: idempotencyKey
        };
      }

      const maxRetries = Number(config.maxRetries || 3);
      let attempts = 0;
      let lastError = null;

      while (attempts < maxRetries) {
        attempts += 1;
        try {
          if (relayMode !== "mock") {
            throw new Error(`UNSUPPORTED_RELAY_MODE_${relayMode}`);
          }

          const txHash = "0x" + hashHex(`${action}:${idempotencyKey}:${JSON.stringify(call)}`).slice(0, 64);
          const result = {
            status: "RELAYED",
            attempts,
            tx_hash: txHash,
            replayed: false,
            idempotency_key: idempotencyKey
          };

          store.records[idempotencyKey] = {
            status: result.status,
            attempts: result.attempts,
            tx_hash: result.tx_hash
          };
          await writeStore(storePath, store);
          return result;
        } catch (error) {
          lastError = error;
          if (attempts < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, backoffMs(attempts)));
          }
        }
      }

      return {
        status: "RELAY_FAILED",
        attempts,
        tx_hash: null,
        replayed: false,
        idempotency_key: idempotencyKey,
        error: String(lastError?.message || "UNKNOWN_RELAY_ERROR")
      };
    }
  };
}
