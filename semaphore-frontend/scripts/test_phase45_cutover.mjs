import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const PORT = Number(process.env.PHASE45_PORT || 8793);
const BASE = `http://127.0.0.1:${PORT}`;
const REQUEST_TIMEOUT_MS = Number(process.env.PHASE45_REQUEST_TIMEOUT_MS || 600000);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function step(label) {
  console.log(`[phase45] ${label}`);
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      ...options
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`${path} -> REQUEST_TIMEOUT_${REQUEST_TIMEOUT_MS}MS`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = null;
  }

  return { status: response.status, payload, text };
}

async function api(path, options = {}) {
  const result = await request(path, options);
  if (result.status < 200 || result.status >= 300) {
    const err = result.payload?.error || result.text || "UNKNOWN_ERROR";
    throw new Error(`${path} -> ${result.status} ${err}`);
  }
  return result.payload || {};
}

async function apiExpect(path, expectedStatus, expectedError, options = {}) {
  const result = await request(path, options);
  assert.equal(result.status, expectedStatus, `${path} expected ${expectedStatus} got ${result.status}`);
  if (expectedError !== undefined) {
    assert.equal(String(result.payload?.error || ""), String(expectedError), `${path} expected error ${expectedError}`);
  }
  return result;
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

async function createIdentity(passphrase) {
  return api("/api/identities/create", {
    method: "POST",
    body: JSON.stringify({ passphrase })
  });
}

async function setAttrs(identityId, attrs) {
  return api("/api/identities/attrs", {
    method: "POST",
    body: JSON.stringify({
      identity_id: identityId,
      kyc_verified: attrs.kyc_verified,
      reputation: attrs.reputation,
      token_balance: attrs.token_balance
    })
  });
}

async function run() {
  const server = spawn("node", ["server.mjs"], {
    cwd: new URL("..", import.meta.url),
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(PORT),
      MODE: "onchain",
      ONCHAIN_WRITE_ENABLED: "true",
      ONCHAIN_READ_PREFERRED: "true",
      CONTRACT_RELAY_MODE: "mock",
      INDEXER_POLL_INTERVAL_MS: "500"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  server.stdout.on("data", (chunk) => process.stdout.write(`[server] ${chunk}`));
  server.stderr.on("data", (chunk) => process.stderr.write(`[server-err] ${chunk}`));

  try {
    step("wait server ready");
    await waitServerReady();

    step("reset state");
    await api("/api/reset", { method: "POST", body: JSON.stringify({}) });

    step("create identities (admin/member/non-member/late-joiner)");
    const admin = await createIdentity("phase45-admin-pass");
    const member = await createIdentity("phase45-member-pass");
    const nonMember = await createIdentity("phase45-nonmember-pass");
    const lateJoiner = await createIdentity("phase45-latejoiner-pass");

    step("seed identity attrs");
    await setAttrs(admin.id, { kyc_verified: true, reputation: 100, token_balance: 1000 });
    await setAttrs(member.id, { kyc_verified: true, reputation: 80, token_balance: 700 });
    await setAttrs(nonMember.id, { kyc_verified: true, reputation: 60, token_balance: 400 });
    await setAttrs(lateJoiner.id, { kyc_verified: true, reputation: 55, token_balance: 500 });

    const groupId = `phase45-group-${Date.now()}`;
    step("group create (admin)");
    await api("/api/groups/create", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        name: "Phase45 Group",
        depth: 20,
        eligibility_policy: { type: "open" },
        created_by_identity_id: admin.id
      })
    });

    step("group create allowed for member and non-member identities");
    const memberOwnedGroup = `phase45-member-owned-${Date.now()}`;
    const nonMemberOwnedGroup = `phase45-nonmember-owned-${Date.now()}`;
    await api("/api/groups/create", {
      method: "POST",
      body: JSON.stringify({
        group_id: memberOwnedGroup,
        name: "Member Owned Group",
        depth: 20,
        eligibility_policy: { type: "open" },
        created_by_identity_id: member.id
      })
    });
    await api("/api/groups/create", {
      method: "POST",
      body: JSON.stringify({
        group_id: nonMemberOwnedGroup,
        name: "Non-member Owned Group",
        depth: 20,
        eligibility_policy: { type: "open" },
        created_by_identity_id: nonMember.id
      })
    });

    step("group view should be public");
    const stateAfterCreate = await api("/api/state");
    assert.ok(stateAfterCreate?.groups?.[groupId]);

    step("group join: admin/member should be eligible");
    await api("/api/groups/join", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, identity_id: admin.id })
    });
    await api("/api/groups/join", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, identity_id: member.id })
    });

    step("topic create: admin yes, member yes, non-member no");
    const adminPoll = await api("/api/topics", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, name: "Phase45 Poll", type: "poll", author_identity_id: admin.id })
    });
    const memberTopic = await api("/api/topics", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, name: "Member Topic", type: "open", author_identity_id: member.id })
    });
    const memberDeleteTopic = await api("/api/topics", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, name: "Delete Me", type: "open", author_identity_id: member.id })
    });
    const memberArchiveTopic = await api("/api/topics", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, name: "Archive Me", type: "open", author_identity_id: member.id })
    });
    await apiExpect(
      "/api/topics",
      403,
      "TOPIC_CREATE_FORBIDDEN",
      {
        method: "POST",
        body: JSON.stringify({ group_id: groupId, name: "Nonmember Topic", type: "open", author_identity_id: nonMember.id })
      }
    );

    step("topic view should be available");
    const topics = await api("/api/topics");
    assert.ok(topics.find((t) => String(t.id) === String(adminPoll.id)));
    assert.ok(topics.find((t) => String(t.id) === String(memberTopic.id)));

    step("topic edit/delete/archive matrix");
    const editedTopic = await api("/api/topics/edit", {
      method: "POST",
      body: JSON.stringify({
        topic_id: memberTopic.id,
        identity_id: member.id,
        name: "Member Topic Edited",
        body: "edited body",
        image_url: null,
        link_url: null
      })
    });
    assert.equal(String(editedTopic.name), "Member Topic Edited");
    await apiExpect(
      "/api/topics/edit",
      403,
      "NOT_TOPIC_OWNER",
      {
        method: "POST",
        body: JSON.stringify({
          topic_id: memberTopic.id,
          identity_id: admin.id,
          name: "admin edit attempt"
        })
      }
    );
    await apiExpect(
      "/api/topics/delete",
      403,
      "NOT_TOPIC_OWNER",
      {
        method: "POST",
        body: JSON.stringify({
          topic_id: memberDeleteTopic.id,
          identity_id: admin.id
        })
      }
    );
    const deletedTopic = await api("/api/topics/delete", {
      method: "POST",
      body: JSON.stringify({
        topic_id: memberDeleteTopic.id,
        identity_id: member.id
      })
    });
    assert.equal(String(deletedTopic.status), "deleted");
    await apiExpect(
      "/api/topics/edit",
      403,
      "TOPIC_DELETED",
      {
        method: "POST",
        body: JSON.stringify({
          topic_id: memberDeleteTopic.id,
          identity_id: member.id,
          body: "retry edit"
        })
      }
    );
    await apiExpect(
      "/api/topics/archive",
      403,
      "NOT_GROUP_ADMIN",
      {
        method: "POST",
        body: JSON.stringify({
          topic_id: memberArchiveTopic.id,
          identity_id: member.id,
          status: "archived"
        })
      }
    );
    const archivedTopic = await api("/api/topics/archive", {
      method: "POST",
      body: JSON.stringify({
        topic_id: memberArchiveTopic.id,
        identity_id: admin.id,
        status: "archived"
      })
    });
    assert.equal(String(archivedTopic.status), "archived");
    await apiExpect(
      "/api/comment",
      403,
      "TOPIC_LOCKED",
      {
        method: "POST",
        body: JSON.stringify({ group_id: groupId, topic_id: memberArchiveTopic.id, identity_id: member.id, message: "blocked on archived topic" })
      }
    );
    await apiExpect(
      "/api/topics/edit",
      403,
      "TOPIC_LOCKED",
      {
        method: "POST",
        body: JSON.stringify({
          topic_id: memberArchiveTopic.id,
          identity_id: member.id,
          body: "owner edit blocked"
        })
      }
    );
    const reopenedTopic = await api("/api/topics/archive", {
      method: "POST",
      body: JSON.stringify({
        topic_id: memberArchiveTopic.id,
        identity_id: admin.id,
        status: "active"
      })
    });
    assert.equal(String(reopenedTopic.status), "active");

    step("comment create: admin yes, member yes, non-member no");
    await api("/api/comment", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, topic_id: adminPoll.id, identity_id: admin.id, message: "admin comment" })
    });
    await api("/api/comment", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, topic_id: adminPoll.id, identity_id: member.id, message: "member comment" })
    });
    await apiExpect(
      "/api/comment",
      403,
      "COMMENT_CREATE_FORBIDDEN",
      {
        method: "POST",
        body: JSON.stringify({ group_id: groupId, topic_id: adminPoll.id, identity_id: nonMember.id, message: "intruder" })
      }
    );

    step("locate created comments for permission checks");
    const stateWithComments = await api("/api/state");
    const adminComment = (stateWithComments?.signals || []).find(
      (s) => String(s.group_id) === groupId && String(s.identity_id) === String(admin.id) && String(s.message) === "admin comment"
    );
    const memberComment = (stateWithComments?.signals || []).find(
      (s) => String(s.group_id) === groupId && String(s.identity_id) === String(member.id) && String(s.message) === "member comment"
    );
    assert.ok(adminComment, "admin comment not found");
    assert.ok(memberComment, "member comment not found");

    step("edit own comment: member yes, non-member no");
    await api("/api/comment/edit", {
      method: "POST",
      body: JSON.stringify({ signal_id: memberComment.id, identity_id: member.id, message: "member comment edited" })
    });
    await apiExpect(
      "/api/comment/edit",
      403,
      "NOT_COMMENT_OWNER",
      {
        method: "POST",
        body: JSON.stringify({ signal_id: memberComment.id, identity_id: nonMember.id, message: "bad edit" })
      }
    );

    step("moderate others' comment: admin yes, member no");
    await api("/api/comment/edit", {
      method: "POST",
      body: JSON.stringify({ signal_id: memberComment.id, identity_id: admin.id, message: "admin moderated member comment" })
    });
    await apiExpect(
      "/api/comment/edit",
      403,
      "NOT_COMMENT_OWNER",
      {
        method: "POST",
        body: JSON.stringify({ signal_id: adminComment.id, identity_id: member.id, message: "member should not moderate" })
      }
    );

    step("delete own comment: member yes, non-member no");
    await api("/api/comment", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, topic_id: adminPoll.id, identity_id: member.id, message: "member temp delete" })
    });
    const stateWithTempComment = await api("/api/state");
    const memberTempComment = (stateWithTempComment?.signals || []).find(
      (s) => String(s.group_id) === groupId && String(s.identity_id) === String(member.id) && String(s.message) === "member temp delete"
    );
    assert.ok(memberTempComment, "member temp comment not found");

    await api("/api/comment/delete", {
      method: "POST",
      body: JSON.stringify({ signal_id: memberTempComment.id, identity_id: member.id })
    });
    await apiExpect(
      "/api/comment/delete",
      403,
      "NOT_COMMENT_OWNER",
      {
        method: "POST",
        body: JSON.stringify({ signal_id: adminComment.id, identity_id: nonMember.id })
      }
    );

    step("admin delete other user's comment should succeed");
    await api("/api/comment", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, topic_id: adminPoll.id, identity_id: member.id, message: "member for admin delete" })
    });
    const stateBeforeAdminDelete = await api("/api/state");
    const memberForAdminDelete = (stateBeforeAdminDelete?.signals || []).find(
      (s) => String(s.group_id) === groupId && String(s.identity_id) === String(member.id) && String(s.message) === "member for admin delete"
    );
    assert.ok(memberForAdminDelete, "member comment for admin delete not found");

    await api("/api/comment/delete", {
      method: "POST",
      body: JSON.stringify({ signal_id: memberForAdminDelete.id, identity_id: admin.id })
    });

    step("group metadata and admin-list matrix");
    const metadataUpdate = await api("/api/groups/update-metadata", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        admin_identity_id: admin.id,
        name: "Phase45 Group Updated",
        description: "updated description",
        header_image_url: "https://example.com/header.png",
        tags: ["zk", "starknet"],
        rules: ["respect privacy", "no spam"]
      })
    });
    assert.equal(String(metadataUpdate.name), "Phase45 Group Updated");
    await apiExpect(
      "/api/groups/update-metadata",
      403,
      "NOT_GROUP_ADMIN",
      {
        method: "POST",
        body: JSON.stringify({
          group_id: groupId,
          admin_identity_id: member.id,
          name: "member update attempt"
        })
      }
    );
    await apiExpect(
      "/api/groups/manage-admins",
      403,
      "NOT_GROUP_ADMIN",
      {
        method: "POST",
        body: JSON.stringify({
          group_id: groupId,
          admin_identity_id: member.id,
          target_identity_id: nonMember.id,
          action: "add"
        })
      }
    );
    const addAdmin = await api("/api/groups/manage-admins", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        admin_identity_id: admin.id,
        target_identity_id: nonMember.id,
        action: "add"
      })
    });
    assert.ok((addAdmin?.admins || []).includes(String(nonMember.id)));
    const metadataByNewAdmin = await api("/api/groups/update-metadata", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        admin_identity_id: nonMember.id,
        description: "updated by delegated admin"
      })
    });
    assert.equal(String(metadataByNewAdmin.description), "updated by delegated admin");
    await apiExpect(
      "/api/groups/manage-admins",
      403,
      "CREATOR_ADMIN_IMMUTABLE",
      {
        method: "POST",
        body: JSON.stringify({
          group_id: groupId,
          admin_identity_id: admin.id,
          target_identity_id: admin.id,
          action: "remove"
        })
      }
    );
    const removeAdmin = await api("/api/groups/manage-admins", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        admin_identity_id: admin.id,
        target_identity_id: nonMember.id,
        action: "remove"
      })
    });
    assert.ok(!(removeAdmin?.admins || []).includes(String(nonMember.id)));

    step("group policy update: admin yes, member/no-member no");
    const policyUpdate = await api("/api/admin/update-policy", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        eligibility_policy: { type: "token_min", min_token_balance: 50 },
        admin_identity_id: admin.id
      })
    });
    assert.equal(String(policyUpdate?.eligibility_policy?.type || ""), "token_min");

    await apiExpect(
      "/api/admin/update-policy",
      403,
      "NOT_GROUP_ADMIN",
      {
        method: "POST",
        body: JSON.stringify({
          group_id: groupId,
          eligibility_policy: { type: "open" },
          admin_identity_id: member.id
        })
      }
    );
    await apiExpect(
      "/api/admin/update-policy",
      403,
      "NOT_GROUP_ADMIN",
      {
        method: "POST",
        body: JSON.stringify({
          group_id: groupId,
          eligibility_policy: { type: "open" },
          admin_identity_id: nonMember.id
        })
      }
    );

    step("group add/remove member: admin yes, member/no-member no");
    const addByAdmin = await api("/api/admin/add-member", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        identity_commitment: nonMember.commitment,
        admin_identity_id: admin.id
      })
    });
    assert.ok((addByAdmin?.leaves || []).includes(String(nonMember.commitment)));

    await apiExpect(
      "/api/admin/add-member",
      403,
      "NOT_GROUP_ADMIN",
      {
        method: "POST",
        body: JSON.stringify({
          group_id: groupId,
          identity_commitment: nonMember.commitment,
          admin_identity_id: member.id
        })
      }
    );

    await apiExpect(
      "/api/admin/remove-member",
      403,
      "NOT_GROUP_ADMIN",
      {
        method: "POST",
        body: JSON.stringify({
          group_id: groupId,
          identity_commitment: nonMember.commitment,
          admin_identity_id: nonMember.id
        })
      }
    );

    const removeByAdmin = await api("/api/admin/remove-member", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        identity_commitment: nonMember.commitment,
        admin_identity_id: admin.id
      })
    });
    assert.ok(!(removeByAdmin?.leaves || []).includes(String(nonMember.commitment)));

    step("phase 5 proof flow: generate vote proof + submit vote");
    const voteProof = await api("/api/proofs/generate", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        identity_id: admin.id,
        passphrase: "phase45-admin-pass",
        scope: String(adminPoll.scope),
        message: "YES"
      })
    });

    const voteRes = await api("/api/polls/vote", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, topic_id: adminPoll.id, proof: voteProof })
    });
    assert.equal(voteRes.status, "POLL_VOTE_ACCEPTED");

    step("phase 5 duplicate vote should be rejected");
    await apiExpect(
      "/api/polls/vote",
      400,
      "NULLIFIER_ALREADY_USED",
      {
        method: "POST",
        body: JSON.stringify({ group_id: groupId, topic_id: adminPoll.id, proof: voteProof })
      }
    );

    step("phase 5 signal flow");
    const signalProof = await api("/api/proofs/generate", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        identity_id: member.id,
        passphrase: "phase45-member-pass",
        scope: String(memberTopic.scope),
        message: "phase45-signal"
      })
    });

    const signalRes = await api("/api/signals/submit", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, topic_id: memberTopic.id, proof: signalProof })
    });
    assert.equal(signalRes.status, "SIGNAL_ACCEPTED");

    step("group archive matrix");
    await apiExpect(
      "/api/groups/archive",
      403,
      "NOT_GROUP_ADMIN",
      {
        method: "POST",
        body: JSON.stringify({ group_id: groupId, admin_identity_id: member.id, status: "archived" })
      }
    );
    const archivedGroup = await api("/api/groups/archive", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, admin_identity_id: admin.id, status: "archived" })
    });
    assert.equal(String(archivedGroup.status), "archived");
    await apiExpect(
      "/api/groups/join",
      403,
      "GROUP_ARCHIVED",
      {
        method: "POST",
        body: JSON.stringify({ group_id: groupId, identity_id: lateJoiner.id })
      }
    );
    await apiExpect(
      "/api/topics",
      403,
      "GROUP_ARCHIVED",
      {
        method: "POST",
        body: JSON.stringify({ group_id: groupId, name: "Blocked While Archived", type: "open", author_identity_id: member.id })
      }
    );
    await apiExpect(
      "/api/comment",
      403,
      "GROUP_ARCHIVED",
      {
        method: "POST",
        body: JSON.stringify({ group_id: groupId, topic_id: adminPoll.id, identity_id: member.id, message: "blocked while archived" })
      }
    );
    const blockedVoteProof = await api("/api/proofs/generate", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        identity_id: member.id,
        passphrase: "phase45-member-pass",
        scope: String(adminPoll.scope),
        message: "NO"
      })
    });
    await apiExpect(
      "/api/polls/vote",
      403,
      "GROUP_ARCHIVED",
      {
        method: "POST",
        body: JSON.stringify({ group_id: groupId, topic_id: adminPoll.id, proof: blockedVoteProof })
      }
    );
    const blockedSignalProof = await api("/api/proofs/generate", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        identity_id: member.id,
        passphrase: "phase45-member-pass",
        scope: String(memberTopic.scope),
        message: "blocked-after-archive"
      })
    });
    await apiExpect(
      "/api/signals/submit",
      403,
      "GROUP_ARCHIVED",
      {
        method: "POST",
        body: JSON.stringify({ group_id: groupId, topic_id: memberTopic.id, proof: blockedSignalProof })
      }
    );
    const reopenedGroup = await api("/api/groups/archive", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, admin_identity_id: admin.id, status: "active" })
    });
    assert.equal(String(reopenedGroup.status), "active");
    await apiExpect(
      "/api/groups/delete",
      404,
      undefined,
      {
        method: "POST",
        body: JSON.stringify({ group_id: groupId, admin_identity_id: admin.id })
      }
    );
    await apiExpect(
      "/api/topics/hard-delete",
      404,
      undefined,
      {
        method: "POST",
        body: JSON.stringify({ topic_id: adminPoll.id, identity_id: admin.id })
      }
    );

    step("phase 4 read model + drift checks");
    const state = await api("/api/state");
    assert.ok(state?.groups?.[groupId]);
    assert.ok(Array.isArray(state?.topics));
    assert.ok(typeof state?.nullifiers === "object");

    const finalTopics = await api("/api/topics");
    const poll = finalTopics.find((t) => String(t.id) === String(adminPoll.id));
    assert.ok(poll);
    assert.equal(Number(poll?.poll?.counts?.YES || 0), 1);
    assert.equal(Number(poll?.poll?.counts?.NO || 0), 0);
    assert.equal(Number(poll?.poll?.total_votes || 0), 1);

    const drift = await api("/api/drift/report");
    assert.equal(String(drift.status), "HEALTHY");
    assert.equal(Number(drift?.summary?.drift_count || 0), 0);

    console.log("Phase 4 / 4.5 / 5 end-to-end matrix coverage test passed.");
  } finally {
    server.kill("SIGTERM");
    await sleep(250);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
