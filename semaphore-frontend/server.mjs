import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual
} from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { relayGroupCreate, relayGroupJoin } from "./contract/groups.mjs";
import { buildRelayEvent } from "./contract/events.mjs";
import { relayPollVote, relaySignalSubmit } from "./contract/proofs.mjs";
import { createRelayClient } from "./contract/relay_client.mjs";
import { generateRealProof, verifyRealProof } from "./real_zk_helper.mjs";

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = normalize(join(__filename, "..", ".."));
const PUBLIC_DIR = normalize(join(ROOT_DIR, "semaphore-frontend", "public"));
const DATA_FILE = normalize(join(ROOT_DIR, "semaphore-frontend", "data", "history.json"));
const RELAY_STORE_FILE = normalize(
  join(ROOT_DIR, "semaphore-frontend", "data", "relay_idempotency.json")
);
const ENV_FILE = normalize(join(ROOT_DIR, "semaphore-frontend", ".env"));

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return;
  }
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(ENV_FILE);

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const HOST = process.env.HOST ? String(process.env.HOST) : "127.0.0.1";
const SYM_FILE = normalize(join(ROOT_DIR, "circuits", "semaphore.sym"));

function inferCircuitDepthFromSym(symPath) {
  if (!existsSync(symPath)) {
    return null;
  }
  const content = readFileSync(symPath, "utf8");
  const matches = [...content.matchAll(/main\.treePathIndices\[(\d+)\]/g)];
  if (matches.length === 0) {
    return null;
  }
  let maxIndex = -1;
  for (const m of matches) {
    const idx = Number(m[1]);
    if (Number.isInteger(idx) && idx > maxIndex) {
      maxIndex = idx;
    }
  }
  return maxIndex + 1;
}

const artifactDepth = inferCircuitDepthFromSym(SYM_FILE);
const CIRCUIT_DEPTH = process.env.CIRCUIT_DEPTH
  ? Number(process.env.CIRCUIT_DEPTH)
  : Number(artifactDepth ?? 20);
if (!Number.isInteger(CIRCUIT_DEPTH) || CIRCUIT_DEPTH < 1 || CIRCUIT_DEPTH > 32) {
  throw new Error("INVALID_CIRCUIT_DEPTH");
}
if (Number.isInteger(artifactDepth) && artifactDepth !== CIRCUIT_DEPTH) {
  console.warn(
    `[DEPTH] CIRCUIT_DEPTH=${CIRCUIT_DEPTH} but semaphore.sym expects ${artifactDepth}.`
  );
}

const PROVER_VERSION = "local-prover-v1";
const VK_ID = "local-vk-v1";
const VK_HASH = toBigIntHex(hashHex(VK_ID));
const PROVER_SECRET = hashHex("semaphore-local-prover-secret-v1");
const CURRENT_STATE_VERSION = 4;
const MODE = String(process.env.MODE || "offchain").trim().toLowerCase();
const ONCHAIN_WRITE_ENABLED =
  String(process.env.ONCHAIN_WRITE_ENABLED || "false").toLowerCase() === "true";
const ONCHAIN_READ_PREFERRED =
  String(process.env.ONCHAIN_READ_PREFERRED || "false").toLowerCase() === "true";
const RELAY_MODE = String(process.env.CONTRACT_RELAY_MODE || "mock").trim().toLowerCase();

if (!["offchain", "hybrid", "onchain"].includes(MODE)) {
  throw new Error("INVALID_MODE_FLAG");
}

const relayClient = createRelayClient({
  enabled: ONCHAIN_WRITE_ENABLED && MODE !== "offchain",
  relayMode: RELAY_MODE,
  storePath: RELAY_STORE_FILE,
  maxRetries: Number(process.env.ONCHAIN_RELAY_MAX_RETRIES || 3)
});

function structuredLog(event, payload = {}) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      event,
      mode: MODE,
      onchain_write_enabled: ONCHAIN_WRITE_ENABLED,
      onchain_read_preferred: ONCHAIN_READ_PREFERRED,
      ...payload
    })
  );
}

function hashHex(input) {
  return createHash("sha256").update(input).digest("hex");
}

function toBigIntHex(hex) {
  return BigInt("0x" + hex).toString();
}

function nowIso() {
  return new Date().toISOString();
}

function toRecoveryCode(bytes) {
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 16)}-${hex.slice(16, 24)}-${hex.slice(24, 32)}`;
}

function normalizeRecoveryCode(code) {
  return String(code || "").trim().toLowerCase().replace(/[^a-f0-9]/g, "");
}

function deriveKey(passphrase, saltHex) {
  return scryptSync(String(passphrase), Buffer.from(saltHex, "hex"), 32);
}

function encryptPayload(payload, passphrase) {
  const salt = randomBytes(16).toString("hex");
  const iv = randomBytes(12);
  const key = deriveKey(passphrase, salt);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    cipher: "aes-256-gcm",
    kdf: "scrypt",
    salt,
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    ciphertext: encrypted.toString("hex")
  };
}

function decryptPayload(encryptedPayload, passphrase) {
  try {
    const key = deriveKey(passphrase, encryptedPayload.salt);
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(encryptedPayload.iv, "hex")
    );
    decipher.setAuthTag(Buffer.from(encryptedPayload.tag, "hex"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(encryptedPayload.ciphertext, "hex")),
      decipher.final()
    ]);
    return JSON.parse(plaintext.toString("utf8"));
  } catch {
    throw new Error("INVALID_PASSPHRASE_OR_CORRUPTED_IDENTITY");
  }
}

function seedState() {
  const now = nowIso();
  return {
    meta: {
      version: CURRENT_STATE_VERSION,
      note: "JSON-backed local database for app state/history.",
      circuit_depth: CIRCUIT_DEPTH,
      created_at: now,
      updated_at: now
    },
    groups: {},
    identities: {},
    nullifiers: {},
    signals: [],
    topics: [],
    events: [],
    indexes: {
      membership_by_identity: {},
      topics_by_group: {},
      signals_by_topic: {}
    }
  };
}

function ensureIso(value, fallback) {
  const text = String(value || "");
  if (!text) return fallback;
  const time = Date.parse(text);
  return Number.isFinite(time) ? new Date(time).toISOString() : fallback;
}

function normalizeIdentityAttrs(attrs) {
  return {
    kyc_verified: Boolean(attrs?.kyc_verified),
    reputation: Number(attrs?.reputation ?? 0),
    token_balance: Number(attrs?.token_balance ?? 0)
  };
}

function normalizeGroupRecord(groupId, group) {
  const now = nowIso();
  const leaves = Array.isArray(group?.leaves) ? group.leaves.map((x) => String(x)) : [];
  const rawDepth = Number(group?.depth ?? CIRCUIT_DEPTH);
  const depth = Number.isInteger(rawDepth)
    ? Math.max(1, Math.min(rawDepth, CIRCUIT_DEPTH))
    : CIRCUIT_DEPTH;
  const computedRoot = computeMerkleRoot(CIRCUIT_DEPTH, leaves);
  const root = String(group?.root ?? computedRoot);
  const rootsHistory = Array.isArray(group?.roots_history)
    ? group.roots_history
      .filter((x) => x && typeof x === "object")
      .map((x) => ({ root: String(x.root ?? ""), at: ensureIso(x.at, now) }))
      .filter((x) => x.root)
    : [];
  if (!rootsHistory.some((x) => x.root === root)) {
    rootsHistory.push({ root, at: now });
  }

  const normalized = {
    id: String(group?.id ?? groupId),
    name: String(group?.name ?? groupId),
    description: String(group?.description ?? ""),
    header_image_url: group?.header_image_url ? String(group.header_image_url) : null,
    avatar_url: group?.avatar_url ? String(group.avatar_url) : null,
    tags: Array.isArray(group?.tags) ? group.tags.map((x) => String(x)) : [],
    rules: Array.isArray(group?.rules) ? group.rules.map((x) => String(x)) : [],
    admins: Array.isArray(group?.admins) ? group.admins.map((x) => String(x)) : [],
    depth,
    leaves,
    root,
    roots_history: rootsHistory,
    eligibility_policy: validateEligibilityPolicy(group?.eligibility_policy),
    stats: {
      member_count: leaves.length,
      topic_count: Number(group?.stats?.topic_count ?? 0)
    },
    created_at: ensureIso(group?.created_at, now),
    updated_at: ensureIso(group?.updated_at, now)
  };
  return normalized;
}

function normalizeIdentityRecord(identityId, identity) {
  const now = nowIso();
  return {
    ...identity,
    id: String(identity?.id ?? identityId),
    commitment: String(identity?.commitment ?? ""),
    attrs: normalizeIdentityAttrs(identity?.attrs),
    created_at: ensureIso(identity?.created_at, now),
    updated_at: ensureIso(identity?.updated_at, now)
  };
}

function normalizeTopicRecord(topic, index = 0) {
  const now = nowIso();
  const id = String(topic?.id ?? hashHex(`topic:${index}:${now}`).slice(0, 16));
  const groupId = String(topic?.group_id ?? "");
  const type = String(topic?.type ?? "open");
  const pollCounts = {
    YES: Number(topic?.poll?.counts?.YES ?? topic?.poll?.counts?.yes ?? 0),
    NO: Number(topic?.poll?.counts?.NO ?? topic?.poll?.counts?.no ?? 0)
  };
  const totalVotes = Number(topic?.poll?.total_votes ?? (pollCounts.YES + pollCounts.NO));
  return {
    id,
    group_id: groupId,
    author_identity_id: topic?.author_identity_id ? String(topic.author_identity_id) : null,
    name: String(topic?.name ?? ""),
    body: topic?.body ? String(topic.body) : null,
    scope: String(topic?.scope ?? `${groupId}:${String(topic?.name ?? "")}`),
    type,
    image_url: topic?.image_url ? String(topic.image_url) : null,
    link_url: topic?.link_url ? String(topic.link_url) : null,
    status: String(topic?.status ?? "active"),
    poll: type === "poll"
      ? { options: ["YES", "NO"], counts: pollCounts, total_votes: totalVotes }
      : null,
    reactions: topic?.reactions && typeof topic.reactions === "object" ? topic.reactions : {},
    reaction_users:
      topic?.reaction_users && typeof topic.reaction_users === "object"
        ? topic.reaction_users
        : {},
    created_at: ensureIso(topic?.created_at, now),
    updated_at: ensureIso(topic?.updated_at, topic?.created_at ?? now)
  };
}

function normalizeSignalRecord(signal, index = 0) {
  const now = nowIso();
  return {
    id: String(signal?.id ?? hashHex(`signal:${index}:${now}`).slice(0, 16)),
    topic_id: signal?.topic_id ? String(signal.topic_id) : null,
    group_id: String(signal?.group_id ?? ""),
    identity_id: signal?.identity_id ? String(signal.identity_id) : null,
    scope: String(signal?.scope ?? ""),
    scope_text: signal?.scope_text ? String(signal.scope_text) : null,
    message: signal?.message ? String(signal.message) : "",
    message_hash: signal?.message_hash ? String(signal.message_hash) : "",
    nullifier: signal?.nullifier ? String(signal.nullifier) : "",
    proof_ref: {
      merkle_tree_root: String(signal?.proof_ref?.merkle_tree_root ?? ""),
      merkle_tree_depth: Number(signal?.proof_ref?.merkle_tree_depth ?? CIRCUIT_DEPTH),
      prover_version: String(signal?.proof_ref?.prover_version ?? PROVER_VERSION),
      vk_hash: String(signal?.proof_ref?.vk_hash ?? VK_HASH)
    },
    parent_id: signal?.parent_id ? String(signal.parent_id) : null,
    reactions: signal?.reactions && typeof signal.reactions === "object" ? signal.reactions : {},
    reaction_users:
      signal?.reaction_users && typeof signal.reaction_users === "object"
        ? signal.reaction_users
        : {},
    edited_at: signal?.edited_at ? ensureIso(signal.edited_at, now) : null,
    deleted_at: signal?.deleted_at ? ensureIso(signal.deleted_at, now) : null,
    created_at: ensureIso(signal?.created_at, now),
    updated_at: ensureIso(signal?.updated_at, signal?.created_at ?? now)
  };
}

function applyReactionToggle(targetObj, identityId, reactionType) {
  targetObj.reactions = targetObj.reactions || {};
  targetObj.reaction_users = targetObj.reaction_users || {};

  const idKey = String(identityId);
  const nextReaction = String(reactionType || "").trim();
  if (!nextReaction) {
    throw new Error("INVALID_REACTION");
  }
  if (nextReaction.length > 32) {
    throw new Error("REACTION_TOO_LONG");
  }
  const currentReaction = targetObj.reaction_users[idKey] || null;

  const dec = (emoji) => {
    const prev = Number(targetObj.reactions[emoji] || 0);
    const next = Math.max(0, prev - 1);
    if (next === 0) {
      delete targetObj.reactions[emoji];
      return;
    }
    targetObj.reactions[emoji] = next;
  };

  const inc = (emoji) => {
    targetObj.reactions[emoji] = Number(targetObj.reactions[emoji] || 0) + 1;
  };

  if (currentReaction === nextReaction) {
    dec(nextReaction);
    delete targetObj.reaction_users[idKey];
    return { action: "removed", active_reaction: null };
  }

  if (currentReaction) {
    dec(currentReaction);
    inc(nextReaction);
    targetObj.reaction_users[idKey] = nextReaction;
    return { action: "switched", active_reaction: nextReaction };
  }

  inc(nextReaction);
  targetObj.reaction_users[idKey] = nextReaction;
  return { action: "added", active_reaction: nextReaction };
}

function rebuildIndexes(state) {
  const membershipByIdentity = {};
  const topicsByGroup = {};
  const signalsByTopic = {};

  for (const [identityId] of Object.entries(state.identities || {})) {
    membershipByIdentity[identityId] = [];
  }

  const identityEntries = Object.entries(state.identities || {});
  for (const [groupId, group] of Object.entries(state.groups || {})) {
    const leaves = Array.isArray(group?.leaves) ? group.leaves.map((x) => String(x)) : [];
    for (const [identityId, identity] of identityEntries) {
      if (leaves.includes(String(identity?.commitment ?? ""))) {
        membershipByIdentity[identityId] = membershipByIdentity[identityId] || [];
        membershipByIdentity[identityId].push(groupId);
      }
    }
  }

  for (const topic of state.topics || []) {
    const gid = String(topic?.group_id ?? "");
    if (!topicsByGroup[gid]) topicsByGroup[gid] = [];
    topicsByGroup[gid].push(String(topic?.id ?? ""));
  }

  for (const signal of state.signals || []) {
    const topicId = signal?.topic_id ? String(signal.topic_id) : "";
    if (!topicId) continue;
    if (!signalsByTopic[topicId]) signalsByTopic[topicId] = [];
    signalsByTopic[topicId].push(String(signal?.id ?? ""));
  }

  return {
    membership_by_identity: membershipByIdentity,
    topics_by_group: topicsByGroup,
    signals_by_topic: signalsByTopic
  };
}

function normalizeState(raw) {
  const base = raw && typeof raw === "object" ? raw : {};
  const now = nowIso();

  const state = {
    meta: {
      version: CURRENT_STATE_VERSION,
      note: "JSON-backed local database for app state/history.",
      circuit_depth: CIRCUIT_DEPTH,
      created_at: ensureIso(base?.meta?.created_at, now),
      updated_at: ensureIso(base?.meta?.updated_at, now)
    },
    groups: {},
    identities: {},
    nullifiers: {},
    signals: [],
    topics: [],
    events: Array.isArray(base?.events) ? base.events : [],
    indexes: {
      membership_by_identity: {},
      topics_by_group: {},
      signals_by_topic: {}
    }
  };

  for (const [groupId, group] of Object.entries(base?.groups || {})) {
    state.groups[String(groupId)] = normalizeGroupRecord(groupId, group);
  }
  for (const [identityId, identity] of Object.entries(base?.identities || {})) {
    state.identities[String(identityId)] = normalizeIdentityRecord(identityId, identity);
  }

  for (const [nullifier, details] of Object.entries(base?.nullifiers || {})) {
    state.nullifiers[String(nullifier)] = {
      used_at: ensureIso(details?.used_at, now),
      group_id: String(details?.group_id ?? ""),
      scope: String(details?.scope ?? "")
    };
  }

  state.topics = Array.isArray(base?.topics)
    ? base.topics.map((topic, index) => normalizeTopicRecord(topic, index))
    : [];
  state.signals = Array.isArray(base?.signals)
    ? base.signals.map((signal, index) => normalizeSignalRecord(signal, index))
    : [];

  state.indexes = rebuildIndexes(state);
  for (const [groupId, group] of Object.entries(state.groups)) {
    group.stats.member_count = group.leaves.length;
    group.stats.topic_count = (state.indexes.topics_by_group[groupId] || []).length;
  }
  return state;
}

function stateNeedsBackfill(raw) {
  if (!raw || typeof raw !== "object") return true;
  if (Number(raw?.meta?.version) !== CURRENT_STATE_VERSION) return true;
  if (!Array.isArray(raw?.signals)) return true;
  if (!raw?.indexes || typeof raw.indexes !== "object") return true;

  for (const group of Object.values(raw?.groups || {})) {
    if (group?.name === undefined) return true;
    if (group?.description === undefined) return true;
    if (group?.stats === undefined) return true;
    if (!Array.isArray(group?.tags) || !Array.isArray(group?.rules) || !Array.isArray(group?.admins)) return true;
  }

  for (const identity of Object.values(raw?.identities || {})) {
    if (!identity?.attrs || identity.attrs.kyc_verified === undefined || identity.attrs.reputation === undefined || identity.attrs.token_balance === undefined) {
      return true;
    }
  }

  for (const topic of raw?.topics || []) {
    if (topic?.status === undefined || topic?.updated_at === undefined || topic?.image_url === undefined || topic?.link_url === undefined || topic?.reactions === undefined || topic?.reaction_users === undefined) {
      return true;
    }
  }

  for (const signal of raw?.signals || []) {
    if (signal?.reactions === undefined || signal?.reaction_users === undefined) return true;
  }

  return false;
}

async function readState() {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const normalized = normalizeState(parsed);
    const requiresRewrite = stateNeedsBackfill(parsed);
    if (requiresRewrite) {
      await writeState(normalized);
    }
    return normalized;
  } catch (error) {
    if (error?.code === "ENOENT") {
      const state = seedState();
      await writeState(state);
      return state;
    }
    throw error;
  }
}

async function writeState(state) {
  const normalized = normalizeState(state);
  normalized.meta.updated_at = nowIso();
  await writeFile(DATA_FILE, JSON.stringify(normalized, null, 2) + "\n", "utf8");
}

function addEvent(state, type, data) {
  state.events.push({ id: hashHex(type + nowIso() + Math.random()), type, at: nowIso(), data });
  if (state.events.length > 700) {
    state.events = state.events.slice(state.events.length - 700);
  }
}

async function attemptOnchainRelay(state, action, relayFn, payload) {
  try {
    const relayResult = await relayFn(relayClient, payload);
    if (relayResult?.status && relayResult.status !== "SKIPPED_FLAG_OFF") {
      const relayEvent = buildRelayEvent(action, relayResult, payload);
      state.events.push({
        id: hashHex(action + nowIso() + Math.random()),
        type: relayEvent.type,
        at: relayEvent.at,
        data: relayEvent.data
      });
      if (state.events.length > 700) {
        state.events = state.events.slice(state.events.length - 700);
      }
    }
    structuredLog("onchain_relay", {
      action,
      status: relayResult?.status || "UNKNOWN",
      attempts: Number(relayResult?.attempts || 0),
      replayed: Boolean(relayResult?.replayed),
      tx_hash: relayResult?.tx_hash || null,
      idempotency_key: relayResult?.idempotency_key || null
    });
  } catch (error) {
    structuredLog("onchain_relay_error", {
      action,
      error: String(error?.message || "UNKNOWN_RELAY_ERROR")
    });
  }
}

function computeMerkleRoot(depth, leaves) {
  const zeroLeaf = "0";
  let current = [...leaves];
  const maxLeaves = 2 ** depth;
  if (current.length > maxLeaves) {
    throw new Error("GROUP_FULL");
  }
  while (current.length < maxLeaves) {
    current.push(zeroLeaf);
  }

  for (let level = 0; level < depth; level += 1) {
    const next = [];
    for (let i = 0; i < current.length; i += 2) {
      next.push(toBigIntHex(hashHex(`${current[i]}:${current[i + 1]}`)));
    }
    current = next;
  }

  return current[0] ?? "0";
}

function computeMerklePath(depth, leaves, leafIndex) {
  const zeroLeaf = "0";
  const maxLeaves = 2 ** depth;
  let current = [...leaves];
  while (current.length < maxLeaves) {
    current.push(zeroLeaf);
  }

  const siblings = [];
  const pathIndices = [];
  let index = Number(leafIndex);

  for (let level = 0; level < depth; level += 1) {
    const isLeft = index % 2 === 0;
    const siblingIndex = isLeft ? index + 1 : index - 1;
    siblings.push(current[siblingIndex] ?? "0");
    pathIndices.push(isLeft ? 0 : 1);

    const next = [];
    for (let i = 0; i < current.length; i += 2) {
      next.push(toBigIntHex(hashHex(`${current[i]}:${current[i + 1]}`)));
    }
    current = next;
    index = Math.floor(index / 2);
  }

  return {
    siblings,
    path_indices: pathIndices,
    root: current[0] ?? "0"
  };
}

function computeMessageHash(message) {
  return toBigIntHex(hashHex(String(message)));
}

function computeNullifier(secretScalar, scope) {
  return toBigIntHex(hashHex(`${secretScalar}:${scope}`));
}

function ensureGroup(state, groupId) {
  const group = state.groups[groupId];
  if (!group) {
    throw new Error("GROUP_NOT_FOUND");
  }
  return group;
}

function ensureIdentity(state, identityId) {
  const identity = state.identities[identityId];
  if (!identity) {
    throw new Error("IDENTITY_NOT_FOUND");
  }
  return identity;
}

function sanitizeIdentity(identity) {
  return {
    id: identity.id,
    commitment: identity.commitment,
    created_at: identity.created_at,
    updated_at: identity.updated_at,
    attrs: identity.attrs
  };
}

function defaultEligibilityPolicy() {
  return { type: "open" };
}

function validateEligibilityPolicy(policy) {
  if (!policy || typeof policy !== "object") {
    return defaultEligibilityPolicy();
  }
  const rawType = String(policy.type || "open");
  const type = rawType === "rep_min" ? "reputation_min" : rawType;

  if (type === "open") {
    return { type: "open" };
  }
  if (type === "allowlist") {
    const allowlist = Array.isArray(policy.allowlist_identity_ids)
      ? policy.allowlist_identity_ids
      : Array.isArray(policy.allowlist_ids)
        ? policy.allowlist_ids
        : [];
    return {
      type,
      allowlist_identity_ids: allowlist.map((x) => String(x))
    };
  }
  if (type === "kyc") {
    return {
      type,
      require_kyc: policy.require_kyc === undefined ? true : Boolean(policy.require_kyc)
    };
  }
  if (type === "reputation_min") {
    return { type, min_reputation: Number(policy.min_reputation ?? 0) };
  }
  if (type === "token_min") {
    return { type, min_token_balance: Number(policy.min_token_balance ?? 0) };
  }
  throw new Error("INVALID_ELIGIBILITY_POLICY");
}

function evaluateEligibility(group, identity) {
  const policy = group.eligibility_policy || defaultEligibilityPolicy();

  if (policy.type === "open") {
    return { eligible: true, reason: "OPEN_GROUP" };
  }

  if (policy.type === "allowlist") {
    const allowed = (policy.allowlist_identity_ids || []).includes(identity.id);
    return { eligible: allowed, reason: allowed ? "ALLOWLIST_MATCH" : "NOT_IN_ALLOWLIST" };
  }

  if (policy.type === "kyc") {
    if (policy.require_kyc === false) {
      return { eligible: true, reason: "KYC_NOT_REQUIRED" };
    }
    const eligible = Boolean(identity.attrs?.kyc_verified);
    return { eligible, reason: eligible ? "KYC_VERIFIED" : "KYC_REQUIRED" };
  }

  if (policy.type === "reputation_min") {
    const min = Number(policy.min_reputation || 0);
    const rep = Number(identity.attrs?.reputation || 0);
    return { eligible: rep >= min, reason: rep >= min ? "REPUTATION_OK" : "REPUTATION_TOO_LOW" };
  }

  if (policy.type === "token_min") {
    const min = Number(policy.min_token_balance || 0);
    const bal = Number(identity.attrs?.token_balance || 0);
    return { eligible: bal >= min, reason: bal >= min ? "TOKEN_BALANCE_OK" : "TOKEN_BALANCE_TOO_LOW" };
  }

  return { eligible: false, reason: "UNKNOWN_POLICY" };
}

async function generateLocalProof(group, identityRecord, privateIdentity, message, scope) {
  const leafIndex = group.leaves.indexOf(identityRecord.commitment);
  if (leafIndex < 0) {
    throw new Error("NOT_GROUP_MEMBER");
  }

  const messageHash = computeMessageHash(message);
  const nullifier = computeNullifier(privateIdentity.secret_scalar, scope);
  const merklePath = computeMerklePath(CIRCUIT_DEPTH, group.leaves, leafIndex);

  // ZK Circom Witness Inputs
  const witness = {
    identityNullifier: privateIdentity.secret_scalar,
    identityTrapdoor: privateIdentity.message_scalar,
    treePathIndices: merklePath.path_indices,
    treeSiblings: merklePath.siblings,
    messageHash: computeMessageHash(message),
    scope: computeMessageHash(scope)
  };

  const wasmPath = join(ROOT_DIR, "circuits", "semaphore_js", "semaphore.wasm");
  const zkeyPath = join(ROOT_DIR, "circuits", "semaphore_final.zkey");

  let realProof;
  try {
    realProof = await generateRealProof(witness, wasmPath, zkeyPath);
  } catch (error) {
    const message = String(error?.message || "");
    if (message.includes("treePathIndices") || message.includes("treeSiblings")) {
      throw new Error(
        `WITNESS_PATH_LEN_MISMATCH expected=${CIRCUIT_DEPTH} got_indices=${witness.treePathIndices.length} got_siblings=${witness.treeSiblings.length} group_depth=${group.depth}`
      );
    }
    throw error;
  }

  return {
    ...realProof,
    merkle_tree_root: realProof.publicSignals[0],
    nullifier: realProof.publicSignals[1],
    message_hash: realProof.publicSignals[2],
    scope: realProof.publicSignals[3],
    scope_text: String(scope),
    merkle_tree_depth: CIRCUIT_DEPTH,
    message: String(message)
  };
}


async function verifyLocalProof(proof) {
  const vkeyPath = join(ROOT_DIR, "circuits", "verification_key.json");
  return await verifyRealProof(proof.publicSignals, proof.proof_points, vkeyPath);
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("INVALID_JSON_BODY");
  }
}

function json(res, statusCode, payload) {
  res.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function isInsidePublic(pathname) {
  const full = normalize(join(PUBLIC_DIR, pathname));
  return full.startsWith(PUBLIC_DIR);
}

async function serveStatic(pathname, res) {
  const safe = pathname === "/" ? "/index.html" : pathname;
  if (!isInsidePublic(safe)) {
    json(res, 400, { error: "INVALID_PATH" });
    return;
  }
  const full = normalize(join(PUBLIC_DIR, safe));
  try {
    const data = await readFile(full);
    const ext = extname(full).toLowerCase();
    const mime =
      ext === ".html"
        ? "text/html; charset=utf-8"
        : ext === ".js"
          ? "text/javascript; charset=utf-8"
          : ext === ".css"
            ? "text/css; charset=utf-8"
            : "application/octet-stream";
    res.writeHead(200, { "content-type": mime });
    res.end(data);
  } catch {
    json(res, 404, { error: "NOT_FOUND" });
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === "GET" && url.pathname === "/api/state") {
      const state = await readState();
      json(res, 200, state);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/identities/create") {
      const { passphrase } = await parseBody(req);
      if (!passphrase || String(passphrase).length < 8) {
        json(res, 400, { error: "PASSPHRASE_TOO_SHORT" });
        return;
      }

      const state = await readState();
      const secretScalar = toBigIntHex(randomBytes(32).toString("hex"));
      const messageScalar = toBigIntHex(randomBytes(32).toString("hex"));
      const commitment = toBigIntHex(hashHex(`${secretScalar}:${messageScalar}`));
      const id = hashHex(commitment).slice(0, 16);

      const privateIdentity = {
        id,
        secret_scalar: secretScalar,
        message_scalar: messageScalar,
        commitment
      };

      const recoveryCode = toRecoveryCode(randomBytes(16));
      const backupPassphrase = normalizeRecoveryCode(recoveryCode);
      const encryptedIdentity = encryptPayload(privateIdentity, passphrase);
      const backupEncryptedIdentity = encryptPayload(privateIdentity, backupPassphrase);

      state.identities[id] = {
        id,
        commitment,
        attrs: {
          kyc_verified: false,
          reputation: 0,
          token_balance: 0
        },
        encrypted_identity: encryptedIdentity,
        backup_encrypted_identity: backupEncryptedIdentity,
        recovery_hash: hashHex(backupPassphrase),
        created_at: nowIso(),
        updated_at: nowIso()
      };

      addEvent(state, "IDENTITY_CREATED", { identity_id: id, commitment });
      await writeState(state);

      json(res, 201, {
        ...sanitizeIdentity(state.identities[id]),
        recovery_code: recoveryCode
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/identities/export") {
      const { identity_id } = await parseBody(req);
      const state = await readState();
      const identity = ensureIdentity(state, identity_id);

      json(res, 200, {
        version: 1,
        exported_at: nowIso(),
        identity: {
          id: identity.id,
          commitment: identity.commitment,
          attrs: identity.attrs,
          encrypted_identity: identity.encrypted_identity,
          backup_encrypted_identity: identity.backup_encrypted_identity,
          recovery_hash: identity.recovery_hash,
          created_at: identity.created_at,
          updated_at: identity.updated_at
        }
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/identities/import") {
      const { passphrase, package_data } = await parseBody(req);
      if (!passphrase || String(passphrase).length < 8) {
        json(res, 400, { error: "PASSPHRASE_TOO_SHORT" });
        return;
      }
      if (!package_data?.identity?.id) {
        json(res, 400, { error: "INVALID_IMPORT_PACKAGE" });
        return;
      }

      const imported = package_data.identity;
      const privateIdentity = decryptPayload(imported.encrypted_identity, passphrase);
      if (String(privateIdentity.commitment) !== String(imported.commitment)) {
        json(res, 400, { error: "IMPORT_COMMITMENT_MISMATCH" });
        return;
      }

      const state = await readState();
      state.identities[imported.id] = {
        id: imported.id,
        commitment: imported.commitment,
        attrs: imported.attrs || {
          kyc_verified: false,
          reputation: 0,
          token_balance: 0
        },
        encrypted_identity: imported.encrypted_identity,
        backup_encrypted_identity: imported.backup_encrypted_identity,
        recovery_hash: imported.recovery_hash,
        created_at: imported.created_at || nowIso(),
        updated_at: nowIso()
      };

      addEvent(state, "IDENTITY_IMPORTED", { identity_id: imported.id });
      await writeState(state);

      json(res, 200, sanitizeIdentity(state.identities[imported.id]));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/identities/recover") {
      const { identity_id, recovery_code, new_passphrase } = await parseBody(req);
      if (!new_passphrase || String(new_passphrase).length < 8) {
        json(res, 400, { error: "PASSPHRASE_TOO_SHORT" });
        return;
      }

      const state = await readState();
      const identity = ensureIdentity(state, identity_id);
      const normalizedRecovery = normalizeRecoveryCode(recovery_code);
      if (!normalizedRecovery || normalizedRecovery.length < 32) {
        json(res, 400, { error: "INVALID_RECOVERY_CODE" });
        return;
      }

      const expectedHash = Buffer.from(identity.recovery_hash, "hex");
      const gotHash = Buffer.from(hashHex(normalizedRecovery), "hex");
      if (
        expectedHash.length !== gotHash.length ||
        !timingSafeEqual(expectedHash, gotHash)
      ) {
        json(res, 401, { error: "RECOVERY_CODE_MISMATCH" });
        return;
      }

      const privateIdentity = decryptPayload(identity.backup_encrypted_identity, normalizedRecovery);
      identity.encrypted_identity = encryptPayload(privateIdentity, new_passphrase);
      identity.updated_at = nowIso();

      addEvent(state, "IDENTITY_RECOVERED", { identity_id });
      await writeState(state);

      json(res, 200, sanitizeIdentity(identity));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/identities/attrs") {
      const { identity_id, kyc_verified, reputation, token_balance } = await parseBody(req);
      const state = await readState();
      const identity = ensureIdentity(state, identity_id);

      identity.attrs = {
        kyc_verified: Boolean(kyc_verified),
        reputation: Number(reputation ?? 0),
        token_balance: Number(token_balance ?? 0)
      };
      identity.updated_at = nowIso();

      addEvent(state, "IDENTITY_ATTRS_UPDATED", { identity_id, attrs: identity.attrs });
      await writeState(state);

      json(res, 200, sanitizeIdentity(identity));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/groups/create") {
      const {
        group_id,
        depth,
        eligibility_policy,
        name,
        description,
        header_image_url,
        avatar_url,
        tags,
        rules,
        admins
      } = await parseBody(req);
      if (!group_id) {
        json(res, 400, { error: "GROUP_ID_REQUIRED" });
        return;
      }
      const parsedDepth = Number(depth ?? 20);
      if (!Number.isInteger(parsedDepth) || parsedDepth < 1 || parsedDepth > CIRCUIT_DEPTH) {
        json(res, 400, { error: "INVALID_DEPTH" });
        return;
      }

      const state = await readState();
      if (state.groups[group_id]) {
        json(res, 409, { error: "GROUP_EXISTS" });
        return;
      }

      const group = {
        id: String(group_id),
        name: String(name ?? group_id),
        description: String(description ?? ""),
        header_image_url: header_image_url ? String(header_image_url) : null,
        avatar_url: avatar_url ? String(avatar_url) : null,
        tags: Array.isArray(tags) ? tags.map((x) => String(x)) : [],
        rules: Array.isArray(rules) ? rules.map((x) => String(x)) : [],
        admins: Array.isArray(admins) ? admins.map((x) => String(x)) : [],
        depth: parsedDepth,
        leaves: [],
        root: computeMerkleRoot(CIRCUIT_DEPTH, []),
        roots_history: [],
        eligibility_policy: validateEligibilityPolicy(eligibility_policy),
        stats: {
          member_count: 0,
          topic_count: 0
        },
        created_at: nowIso(),
        updated_at: nowIso()
      };
      group.roots_history.push({ root: group.root, at: nowIso() });
      state.groups[group_id] = group;
      addEvent(state, "GROUP_CREATED", {
        group_id,
        depth: parsedDepth,
        root: group.root,
        eligibility_policy: group.eligibility_policy
      });
      structuredLog("group_create", {
        group_id: String(group_id),
        depth: parsedDepth,
        root: String(group.root),
        policy_type: String(group.eligibility_policy?.type || "open")
      });
      await attemptOnchainRelay(state, "GROUP_CREATE", relayGroupCreate, {
        group_id: String(group_id),
        depth: parsedDepth,
        admin: String(Array.isArray(admins) && admins.length > 0 ? admins[0] : "0x0")
      });
      await writeState(state);

      json(res, 201, group);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/eligibility/check") {
      const { group_id, identity_id } = await parseBody(req);
      const state = await readState();
      const group = ensureGroup(state, group_id);
      const identity = ensureIdentity(state, identity_id);
      const decision = evaluateEligibility(group, identity);
      json(res, 200, { group_id, identity_id, ...decision, policy: group.eligibility_policy });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/groups/join") {
      const { group_id, identity_id } = await parseBody(req);
      const state = await readState();
      const group = ensureGroup(state, group_id);
      const identity = ensureIdentity(state, identity_id);

      const decision = evaluateEligibility(group, identity);
      if (!decision.eligible) {
        json(res, 403, { error: "NOT_ELIGIBLE", reason: decision.reason });
        return;
      }

      if (group.leaves.includes(identity.commitment)) {
        json(res, 409, { error: "ALREADY_MEMBER" });
        return;
      }

      const capacity = 2 ** group.depth;
      if (group.leaves.length >= capacity) {
        json(res, 409, { error: "GROUP_FULL" });
        return;
      }

      group.leaves.push(identity.commitment);
      group.root = computeMerkleRoot(CIRCUIT_DEPTH, group.leaves);
      group.roots_history.push({ root: group.root, at: nowIso() });
      group.updated_at = nowIso();

      addEvent(state, "MEMBER_ADDED", {
        group_id,
        identity_id,
        commitment: identity.commitment,
        new_root: group.root
      });
      structuredLog("group_join", {
        group_id: String(group_id),
        identity_id: String(identity_id),
        commitment: String(identity.commitment),
        new_root: String(group.root)
      });
      await attemptOnchainRelay(state, "GROUP_JOIN", relayGroupJoin, {
        group_id: String(group_id),
        identity_commitment: String(identity.commitment)
      });
      await writeState(state);

      json(res, 200, group);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/topics") {
      const { group_id, name, type, body, image_url, link_url, author_identity_id, status } = await parseBody(req);
      if (!group_id || !name || !type) {
        json(res, 400, { error: "MISSING_FIELDS" });
        return;
      }
      const state = await readState();
      // Verify group exists
      ensureGroup(state, group_id);

      const topic = {
        id: hashHex(group_id + name + nowIso()).slice(0, 16),
        group_id: String(group_id),
        author_identity_id: author_identity_id ? String(author_identity_id) : null,
        name: String(name),
        body: body ? String(body) : null,
        scope: `${group_id}:${name}`,
        type: String(type), // "poll" or "open"
        image_url: image_url ? String(image_url) : null,
        link_url: link_url ? String(link_url) : null,
        status: String(status ?? "active"),
        poll: String(type) === "poll"
          ? {
            options: ["YES", "NO"],
            counts: { YES: 0, NO: 0 },
            total_votes: 0
          }
          : null,
        reactions: {},
        created_at: nowIso(),
        updated_at: nowIso()
      };

      state.topics.push(topic);
      addEvent(state, "TOPIC_CREATED", topic);
      await writeState(state);

      json(res, 201, topic);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/topics") {
      const state = await readState();
      const enrichedTopics = (state.topics || []).map(topic => {
        const signal_count = (state.signals || []).filter(s => s.topic_id === topic.id).length;
        return {
          ...topic,
          stats: { signal_count }
        };
      });
      json(res, 200, enrichedTopics);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/proofs/generate") {
      const { group_id, identity_id, message, scope, passphrase, parent_id } = await parseBody(req);
      if (message === undefined || scope === undefined) {
        console.log("[ZK Error] MESSAGE_AND_SCOPE_REQUIRED:", { message, scope });
        json(res, 400, { error: "MESSAGE_AND_SCOPE_REQUIRED" });
        return;
      }
      if (!passphrase) {
        console.log("[ZK Error] PASSPHRASE_REQUIRED");
        json(res, 400, { error: "PASSPHRASE_REQUIRED" });
        return;
      }

      const state = await readState();
      const group = ensureGroup(state, group_id);
      const identity = ensureIdentity(state, identity_id);

      if (!group.leaves.includes(identity.commitment)) {
        console.log("[ZK Error] NOT_GROUP_MEMBER:", { groupId: group_id, commitment: identity.commitment, leaves: group.leaves.length });
        json(res, 400, { error: "NOT_GROUP_MEMBER" });
        return;
      }

      const privateIdentity = decryptPayload(identity.encrypted_identity, passphrase);
      const proof = await generateLocalProof(group, identity, privateIdentity, message, scope);

      // Keep submit-time root validation aligned with prover output.
      // Some prover stacks emit a root representation that differs from the
      // app's locally-tracked root encoding, so we persist the proof root too.
      const proofRoot = String(proof.merkle_tree_root || "");
      if (proofRoot && !group.roots_history.some((x) => String(x.root) === proofRoot)) {
        group.roots_history.push({ root: proofRoot, at: nowIso() });
      }
      group.updated_at = nowIso();

      addEvent(state, "PROOF_GENERATED", {
        group_id,
        identity_id,
        nullifier: proof.nullifier,
        scope: proof.scope,
        prover_version: proof.prover_version
      });
      await writeState(state);

      json(res, 200, { ...proof, parent_id: parent_id || null });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/signals/submit") {
      const { group_id, topic_id, proof } = await parseBody(req);
      const state = await readState();
      const group = ensureGroup(state, group_id);

      if (Number(proof.merkle_tree_depth) !== CIRCUIT_DEPTH) {
        json(res, 400, { error: "DEPTH_MISMATCH" });
        return;
      }
      if (!group.roots_history.some((x) => String(x.root) === String(proof.merkle_tree_root))) {
        json(res, 400, { error: "ROOT_NOT_IN_GROUP" });
        return;
      }
      if (state.nullifiers[proof.nullifier]) {
        json(res, 400, { error: "NULLIFIER_ALREADY_USED" });
        return;
      }

      await verifyLocalProof(proof);

      state.nullifiers[proof.nullifier] = {
        used_at: nowIso(),
        group_id: String(group_id),
        scope: String(proof.scope)
      };

      const scopeText = typeof proof.scope_text === "string" ? proof.scope_text : null;
      const scopeForMatch = scopeText ?? String(proof.scope ?? "");
      const matchedTopicByScope = (state.topics || []).find(
        (topic) =>
          String(topic.group_id) === String(group_id) &&
          String(topic.scope).trim() === String(scopeForMatch).trim()
      );
      const matchedTopicById = topic_id
        ? (state.topics || []).find(
            (topic) =>
              String(topic.id) === String(topic_id) &&
              String(topic.group_id) === String(group_id)
          ) || null
        : null;
      const matchedTopic = matchedTopicByScope || matchedTopicById;
      if (matchedTopic?.type === "poll" && matchedTopic?.poll?.counts) {
        const vote = String(proof.message || "").toUpperCase();
        if (vote === "YES" || vote === "NO") {
          matchedTopic.poll.counts[vote] = Number(matchedTopic.poll.counts[vote] || 0) + 1;
          matchedTopic.poll.total_votes = Number(matchedTopic.poll.total_votes || 0) + 1;
          matchedTopic.updated_at = nowIso();
        }
      }

      state.signals = Array.isArray(state.signals) ? state.signals : [];
      state.signals.push({
        id: hashHex(`signal:${group_id}:${proof.nullifier}:${nowIso()}`).slice(0, 16),
        topic_id: matchedTopic?.id || null,
        group_id: String(group_id),
        scope: String(proof.scope),
        scope_text: scopeText,
        message: String(proof.message ?? ""),
        message_hash: String(proof.message_hash ?? ""),
        nullifier: String(proof.nullifier),
        proof_ref: {
          merkle_tree_root: String(proof.merkle_tree_root ?? ""),
          merkle_tree_depth: Number(proof.merkle_tree_depth ?? CIRCUIT_DEPTH),
          prover_version: String(proof.prover_version ?? PROVER_VERSION),
          vk_hash: String(proof.vk_hash ?? VK_HASH)
        },
        parent_id: typeof proof.parent_id === "string" ? proof.parent_id : null,
        reactions: {},
        reaction_users: {},
        edited_at: null,
        deleted_at: null,
        created_at: nowIso(),
        updated_at: nowIso()
      });

      addEvent(state, "SIGNAL_ACCEPTED", {
        group_id,
        nullifier: proof.nullifier,
        message: proof.message,
        scope: proof.scope,
        prover_version: proof.prover_version,
        vk_hash: proof.vk_hash
      });
      structuredLog("signal_submit", {
        group_id: String(group_id),
        topic_id: matchedTopic?.id ? String(matchedTopic.id) : null,
        nullifier: String(proof.nullifier),
        scope: String(proof.scope),
        prover_version: String(proof.prover_version || PROVER_VERSION)
      });
      await attemptOnchainRelay(state, "SIGNAL_SUBMIT", relaySignalSubmit, {
        group_id: String(group_id),
        proof
      });
      await writeState(state);

      json(res, 200, {
        ok: true,
        status: "SIGNAL_ACCEPTED",
        nullifier: proof.nullifier,
        prover_version: proof.prover_version,
        vk_hash: proof.vk_hash
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/polls/vote") {
      const { group_id, topic_id, proof } = await parseBody(req);
      const state = await readState();
      const group = ensureGroup(state, group_id);
      const topic = (state.topics || []).find(
        (t) => String(t.id) === String(topic_id) && String(t.group_id) === String(group_id)
      );
      if (!topic || String(topic.type) !== "poll") {
        json(res, 404, { error: "POLL_TOPIC_NOT_FOUND" });
        return;
      }

      if (Number(proof?.merkle_tree_depth) !== CIRCUIT_DEPTH) {
        json(res, 400, { error: "DEPTH_MISMATCH" });
        return;
      }
      if (!group.roots_history.some((x) => String(x.root) === String(proof?.merkle_tree_root))) {
        json(res, 400, { error: "ROOT_NOT_IN_GROUP" });
        return;
      }
      if (state.nullifiers[String(proof?.nullifier || "")]) {
        json(res, 400, { error: "NULLIFIER_ALREADY_USED" });
        return;
      }

      const scopeText = typeof proof?.scope_text === "string" ? proof.scope_text : "";
      if (!scopeText || String(scopeText).trim() !== String(topic.scope).trim()) {
        json(res, 400, { error: "SCOPE_TOPIC_MISMATCH" });
        return;
      }

      const vote = String(proof?.message || "").toUpperCase();
      if (vote !== "YES" && vote !== "NO") {
        json(res, 400, { error: "INVALID_VOTE_OPTION" });
        return;
      }

      await verifyLocalProof(proof);

      state.nullifiers[String(proof.nullifier)] = {
        used_at: nowIso(),
        group_id: String(group_id),
        scope: String(proof.scope)
      };

      topic.poll.counts[vote] = Number(topic.poll.counts[vote] || 0) + 1;
      topic.poll.total_votes = Number(topic.poll.total_votes || 0) + 1;
      topic.updated_at = nowIso();

      addEvent(state, "POLL_VOTE_ACCEPTED", {
        group_id: String(group_id),
        topic_id: String(topic_id),
        vote,
        nullifier: String(proof.nullifier)
      });
      structuredLog("vote_submit", {
        group_id: String(group_id),
        topic_id: String(topic_id),
        vote,
        nullifier: String(proof.nullifier)
      });
      await attemptOnchainRelay(state, "POLL_VOTE", relayPollVote, {
        group_id: String(group_id),
        proof
      });
      await writeState(state);

      json(res, 200, {
        ok: true,
        status: "POLL_VOTE_ACCEPTED",
        topic_id: String(topic_id),
        vote,
        counts: topic.poll.counts,
        total_votes: topic.poll.total_votes
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/comment") {
      const { group_id, topic_id, identity_id, message, parent_id } = await parseBody(req);
      const state = await readState();

      const matchedTopic = (state.topics || []).find(t => String(t.id) === String(topic_id));
      if (!matchedTopic) {
        json(res, 404, { error: "TOPIC_NOT_FOUND" });
        return;
      }

      state.signals = Array.isArray(state.signals) ? state.signals : [];
      state.signals.push({
        id: hashHex(`comment:${group_id}:${identity_id}:${nowIso()}`).slice(0, 16),
        topic_id: String(topic_id),
        group_id: String(group_id),
        identity_id: String(identity_id),
        message: String(message ?? ""),
        reactions: {},
        reaction_users: {},
        parent_id: parent_id ? String(parent_id) : null,
        edited_at: null,
        deleted_at: null,
        created_at: nowIso(),
        updated_at: nowIso()
      });

      addEvent(state, "COMMENT_CREATED", { topic_id });
      structuredLog("comment_submit", {
        group_id: String(group_id),
        topic_id: String(topic_id),
        identity_id: String(identity_id),
        parent_id: parent_id ? String(parent_id) : null
      });
      await writeState(state);

      json(res, 201, { success: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/comment/edit") {
      const { signal_id, identity_id, message } = await parseBody(req);
      if (!signal_id || !identity_id || !String(message || "").trim()) {
        json(res, 400, { error: "MISSING_FIELDS" });
        return;
      }
      const state = await readState();
      const signal = (state.signals || []).find((s) => String(s.id) === String(signal_id));
      if (!signal) {
        json(res, 404, { error: "COMMENT_NOT_FOUND" });
        return;
      }
      if (String(signal.identity_id || "") !== String(identity_id)) {
        json(res, 403, { error: "NOT_COMMENT_OWNER" });
        return;
      }
      if (signal.deleted_at) {
        json(res, 400, { error: "COMMENT_DELETED" });
        return;
      }

      signal.message = String(message).trim();
      signal.edited_at = nowIso();
      signal.updated_at = nowIso();
      addEvent(state, "COMMENT_EDITED", { signal_id: String(signal.id), identity_id: String(identity_id) });
      await writeState(state);

      json(res, 200, { ok: true, signal_id: signal.id, edited_at: signal.edited_at });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/comment/delete") {
      const { signal_id, identity_id } = await parseBody(req);
      if (!signal_id || !identity_id) {
        json(res, 400, { error: "MISSING_FIELDS" });
        return;
      }
      const state = await readState();
      const signal = (state.signals || []).find((s) => String(s.id) === String(signal_id));
      if (!signal) {
        json(res, 404, { error: "COMMENT_NOT_FOUND" });
        return;
      }
      if (String(signal.identity_id || "") !== String(identity_id)) {
        json(res, 403, { error: "NOT_COMMENT_OWNER" });
        return;
      }

      const toDelete = new Set([String(signal.id)]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const s of state.signals || []) {
          const parentId = String(s?.parent_id || "");
          const sid = String(s?.id || "");
          if (parentId && toDelete.has(parentId) && !toDelete.has(sid)) {
            toDelete.add(sid);
            changed = true;
          }
        }
      }

      state.signals = (state.signals || []).filter((s) => !toDelete.has(String(s?.id || "")));
      addEvent(state, "COMMENT_DELETED", {
        signal_id: String(signal.id),
        identity_id: String(identity_id),
        removed_count: toDelete.size
      });
      await writeState(state);

      json(res, 200, { ok: true, signal_id: signal.id, removed_count: toDelete.size });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/reactions") {
      const { target_type, target_id, reaction_type, identity_id } = await parseBody(req);
      if (!target_type || !target_id || !reaction_type || !identity_id) {
        json(res, 400, { error: "MISSING_FIELDS" });
        return;
      }
      const state = await readState();
      ensureIdentity(state, identity_id);

      let targetObj = null;
      if (target_type === "topic") {
        targetObj = state.topics.find((t) => String(t.id) === String(target_id));
      } else if (target_type === "signal") {
        targetObj = state.signals.find((s) => String(s.id) === String(target_id));
      }

      if (!targetObj) {
        json(res, 404, { error: "TARGET_NOT_FOUND" });
        return;
      }

      const outcome = applyReactionToggle(targetObj, identity_id, reaction_type);
      targetObj.updated_at = nowIso();

      await writeState(state);
      json(res, 200, { ok: true, reactions: targetObj.reactions, ...outcome });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/reset") {
      const state = seedState();
      await writeState(state);
      json(res, 200, { ok: true });
      return;
    }

    await serveStatic(url.pathname, res);
  } catch (error) {
    json(res, 400, { error: error.message ?? "BAD_REQUEST" });
  }
});

server.listen(PORT, HOST, () => {
  structuredLog("server_boot", {
    host: HOST,
    port: PORT,
    circuit_depth: CIRCUIT_DEPTH,
    relay_mode: RELAY_MODE
  });
  console.log(`Semaphore frontend server running at http://${HOST}:${PORT}`);
});
