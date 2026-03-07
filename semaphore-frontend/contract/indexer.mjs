import { readFile, rename, writeFile } from "node:fs/promises";

function emptyReadModel() {
  return {
    meta: {
      generated_at: new Date().toISOString(),
      source: "ONCHAIN_RELAY_EVENTS",
      version: 1
    },
    group_roots: {},
    nullifiers: {},
    poll_votes_by_topic: {},
    relay_stats: {
      total_relayed_events: 0
    }
  };
}

export async function readReadModel(path) {
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : emptyReadModel();
  } catch {
    return emptyReadModel();
  }
}

export async function writeReadModel(path, model) {
  const tmp = `${path}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`;
  await writeFile(tmp, JSON.stringify(model, null, 2) + "\n", "utf8");
  await rename(tmp, path);
}

function relayEvents(state) {
  return (state.events || [])
    .filter((event) => String(event?.type || "") === "ONCHAIN_RELAY")
    .filter((event) => String(event?.data?.status || "") === "RELAYED");
}

export function projectReadModelFromState(state) {
  const model = emptyReadModel();
  const events = relayEvents(state);
  model.relay_stats.total_relayed_events = events.length;

  for (const event of events) {
    const data = event?.data || {};
    const action = String(data.action || "");
    const payload = data.payload || {};

    if (action === "GROUP_CREATE" || action === "GROUP_JOIN" || action === "GROUP_REMOVE") {
      const groupId = payload.group_id ? String(payload.group_id) : "";
      const root = payload.expected_root ? String(payload.expected_root) : "";
      if (groupId && root) {
        model.group_roots[groupId] = {
          root,
          updated_at: String(event?.at || new Date().toISOString())
        };
      }
    }

    if (action === "SIGNAL_SUBMIT" || action === "POLL_VOTE") {
      const proof = payload.proof || {};
      const nullifier = proof.nullifier ? String(proof.nullifier) : "";
      const groupId = payload.group_id ? String(payload.group_id) : "";
      if (nullifier) {
        model.nullifiers[nullifier] = {
          group_id: groupId,
          scope: proof.scope ? String(proof.scope) : "",
          used_at: String(event?.at || new Date().toISOString())
        };
      }
    }

    if (action === "POLL_VOTE") {
      const topicId = payload.topic_id ? String(payload.topic_id) : "";
      if (topicId) {
        const proof = payload.proof || {};
        const vote = String(proof.message || "").toUpperCase();
        const rec = model.poll_votes_by_topic[topicId] || { YES: 0, NO: 0, total: 0 };
        if (vote === "YES") rec.YES += 1;
        if (vote === "NO") rec.NO += 1;
        rec.total += 1;
        model.poll_votes_by_topic[topicId] = rec;
      }
    }
  }

  model.meta.generated_at = new Date().toISOString();
  return model;
}

export function mergeStateWithReadModel(state, model) {
  const merged = JSON.parse(JSON.stringify(state));

  for (const [groupId, rootRec] of Object.entries(model.group_roots || {})) {
    if (!merged.groups?.[groupId]) continue;
    const root = String(rootRec?.root || "");
    if (!root) continue;

    merged.groups[groupId].root = root;
    merged.groups[groupId].roots_history = Array.isArray(merged.groups[groupId].roots_history)
      ? merged.groups[groupId].roots_history
      : [];

    if (!merged.groups[groupId].roots_history.some((r) => String(r?.root || "") === root)) {
      merged.groups[groupId].roots_history.push({
        root,
        at: String(rootRec?.updated_at || new Date().toISOString())
      });
    }
  }

  merged.nullifiers = {};
  for (const [nullifier, details] of Object.entries(model.nullifiers || {})) {
    merged.nullifiers[nullifier] = {
      used_at: String(details?.used_at || new Date().toISOString()),
      group_id: String(details?.group_id || ""),
      scope: String(details?.scope || "")
    };
  }

  for (const topic of merged.topics || []) {
    if (String(topic?.type || "") !== "poll") continue;
    const topicId = String(topic.id || "");
    const chainRec = model.poll_votes_by_topic?.[topicId] || { YES: 0, NO: 0, total: 0 };
    const chainYes = Number(chainRec.YES || 0);
    const chainNo = Number(chainRec.NO || 0);
    const chainTotal = Number(chainRec.total || 0);
    topic.poll = topic.poll || { options: ["YES", "NO"], counts: { YES: 0, NO: 0 }, total_votes: 0 };
    topic.poll.counts = {
      YES: chainYes,
      NO: chainNo
    };
    topic.poll.total_votes = chainTotal;
  }

  return merged;
}

export function extractAuthorityState(model) {
  const nullifierSet = new Set(Object.keys(model.nullifiers || {}));
  const rootsByGroup = {};
  for (const [groupId, rec] of Object.entries(model.group_roots || {})) {
    const root = String(rec?.root || "");
    if (root) rootsByGroup[groupId] = root;
  }
  return { nullifierSet, rootsByGroup };
}
