import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const PORT = Number(process.env.PHASE3_PORT || 8792);
const BASE = `http://127.0.0.1:${PORT}`;
const PASS = "phase3-passphrase-123";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function api(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { "content-type": "application/json" },
    ...options
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`${path} -> ${response.status} ${payload?.error || text}`);
  }
  return payload;
}

async function waitServerReady() {
  const timeoutMs = 30000;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await api("/api/state");
      return;
    } catch {
      await sleep(200);
    }
  }
  throw new Error("Server did not become ready in time");
}

async function waitRelayActions(requiredActions) {
  const timeoutMs = 30000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const state = await api("/api/state");
    const relayedActions = new Set(
      (state.events || [])
        .filter((e) => String(e?.type || "") === "ONCHAIN_RELAY")
        .filter((e) => String(e?.data?.status || "") === "RELAYED")
        .map((e) => String(e?.data?.action || ""))
    );

    const allPresent = requiredActions.every((action) => relayedActions.has(action));
    if (allPresent) return;

    await sleep(250);
  }

  throw new Error("Timed out waiting for async shadow relay actions");
}

async function run() {
  const server = spawn("node", ["server.mjs"], {
    cwd: new URL("..", import.meta.url),
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(PORT),
      MODE: "hybrid",
      ONCHAIN_WRITE_ENABLED: "true",
      ONCHAIN_READ_PREFERRED: "false",
      CONTRACT_RELAY_MODE: "mock"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  server.stdout.on("data", (chunk) => process.stdout.write(`[server] ${chunk}`));
  server.stderr.on("data", (chunk) => process.stderr.write(`[server-err] ${chunk}`));

  try {
    await waitServerReady();
    await api("/api/reset", { method: "POST", body: JSON.stringify({}) });

    const identity = await api("/api/identities/create", {
      method: "POST",
      body: JSON.stringify({ passphrase: PASS })
    });

    await api("/api/identities/attrs", {
      method: "POST",
      body: JSON.stringify({
        identity_id: identity.id,
        kyc_verified: true,
        reputation: 50,
        token_balance: 1000
      })
    });

    const groupId = `phase3-group-${Date.now()}`;
    await api("/api/groups/create", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        name: "Phase3 Group",
        description: "Shadow-write test",
        depth: 20,
        eligibility_policy: { type: "open" }
      })
    });

    await api("/api/groups/join", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, identity_id: identity.id })
    });

    const pollName = "Phase3 Poll";
    const poll = await api("/api/topics", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, name: pollName, type: "poll", author_identity_id: identity.id })
    });

    const openName = "Phase3 Open";
    const open = await api("/api/topics", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, name: openName, type: "open", author_identity_id: identity.id })
    });

    const voteProof = await api("/api/proofs/generate", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        identity_id: identity.id,
        passphrase: PASS,
        scope: String(poll.scope),
        message: "YES"
      })
    });

    await api("/api/polls/vote", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, topic_id: poll.id, proof: voteProof })
    });

    const signalProof = await api("/api/proofs/generate", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        identity_id: identity.id,
        passphrase: PASS,
        scope: String(open.scope),
        message: "phase3-signal"
      })
    });

    await api("/api/signals/submit", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, topic_id: open.id, proof: signalProof })
    });

    await waitRelayActions(["GROUP_CREATE", "GROUP_JOIN", "POLL_VOTE", "SIGNAL_SUBMIT"]);

    const drift = await api("/api/drift/report");
    assert.equal(drift.status, "HEALTHY");
    assert.equal(Number(drift?.summary?.drift_count || 0), 0);

    console.log("Phase 3 shadow write + drift monitor test passed.");
  } finally {
    server.kill("SIGTERM");
    await sleep(250);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
