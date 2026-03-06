import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const PORT = Number(process.env.SMOKE_PORT || 8791);
const BASE = `http://127.0.0.1:${PORT}`;
const PASS = "phase0-passphrase-123";

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
  const timeoutMs = 60000;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await api("/api/state");
      return;
    } catch {
      await sleep(300);
    }
  }
  throw new Error("Server did not become ready in time");
}

async function run() {
  const server = spawn("node", ["server.mjs"], {
    cwd: new URL("..", import.meta.url),
    env: {
      ...process.env,
      PORT: String(PORT),
      MODE: "offchain",
      ONCHAIN_WRITE_ENABLED: "false",
      ONCHAIN_READ_PREFERRED: "false"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  server.stdout.on("data", (chunk) => process.stdout.write(`[server] ${chunk}`));
  server.stderr.on("data", (chunk) => process.stderr.write(`[server-err] ${chunk}`));

  try {
    await waitServerReady();
    await api("/api/reset", { method: "POST", body: JSON.stringify({}) });

    const checks = [];

    const identity = await api("/api/identities/create", {
      method: "POST",
      body: JSON.stringify({ passphrase: PASS })
    });
    assert.ok(identity.id);
    checks.push("create identity");

    await api("/api/identities/attrs", {
      method: "POST",
      body: JSON.stringify({
        identity_id: identity.id,
        kyc_verified: true,
        reputation: 50,
        token_balance: 1000
      })
    });

    const groupId = `phase0-group-${Date.now()}`;
    const group = await api("/api/groups/create", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        name: "Phase0 Group",
        description: "Baseline smoke group",
        depth: 20,
        eligibility_policy: { type: "token_min", min_token_balance: 10 }
      })
    });
    assert.equal(group.id, groupId);

    await api("/api/groups/join", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, identity_id: identity.id })
    });
    checks.push("join group");

    const pollName = "Phase0 Poll Topic";
    const pollTopic = await api("/api/topics", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, name: pollName, type: "poll" })
    });
    const openName = "Phase0 Open Topic";
    const openTopic = await api("/api/topics", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, name: openName, type: "open" })
    });
    assert.ok(pollTopic.id && openTopic.id);
    checks.push("create topic");

    const voteProof = await api("/api/proofs/generate", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        identity_id: identity.id,
        passphrase: PASS,
        scope: `${groupId}:${pollName}`,
        message: "YES"
      })
    });

    const voteResult = await api("/api/polls/vote", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, topic_id: pollTopic.id, proof: voteProof })
    });
    assert.equal(voteResult.status, "POLL_VOTE_ACCEPTED");
    checks.push("poll vote");

    const signalProof = await api("/api/proofs/generate", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        identity_id: identity.id,
        passphrase: PASS,
        scope: `${groupId}:${openName}`,
        message: "hello from phase0"
      })
    });

    const signalResult = await api("/api/signals/submit", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, topic_id: openTopic.id, proof: signalProof })
    });
    assert.equal(signalResult.status, "SIGNAL_ACCEPTED");
    checks.push("open discussion reply");

    await api("/api/reactions", {
      method: "POST",
      body: JSON.stringify({
        target_type: "topic",
        target_id: pollTopic.id,
        reaction_type: "👍",
        identity_id: identity.id
      })
    });
    await api("/api/reactions", {
      method: "POST",
      body: JSON.stringify({
        target_type: "topic",
        target_id: pollTopic.id,
        reaction_type: "❤️",
        identity_id: identity.id
      })
    });
    checks.push("reactions (toggle/switch)");

    await api("/api/comment", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        topic_id: pollTopic.id,
        identity_id: identity.id,
        message: "phase0 comment"
      })
    });

    const stateAfterComment = await api("/api/state");
    const createdComment = (stateAfterComment.signals || [])
      .find((x) => x.topic_id === pollTopic.id && x.identity_id === identity.id && x.message === "phase0 comment");
    assert.ok(createdComment?.id, "comment must exist");

    await api("/api/comment/edit", {
      method: "POST",
      body: JSON.stringify({ signal_id: createdComment.id, identity_id: identity.id, message: "phase0 edited" })
    });
    await api("/api/comment/delete", {
      method: "POST",
      body: JSON.stringify({ signal_id: createdComment.id, identity_id: identity.id })
    });
    checks.push("edit/delete comment");

    console.log("\\nPhase 0 smoke passed:");
    for (const item of checks) {
      console.log(`- ${item}`);
    }
  } finally {
    server.kill("SIGTERM");
    await sleep(250);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
