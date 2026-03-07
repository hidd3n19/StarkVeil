function getOffchainPollTotals(state) {
  const out = {};
  for (const topic of state.topics || []) {
    if (String(topic?.type || "") !== "poll") continue;
    out[String(topic.id)] = Number(topic?.poll?.total_votes || 0);
  }
  return out;
}

function getRelayedPollTotals(state) {
  const out = {};
  for (const event of state.events || []) {
    if (String(event?.type || "") !== "ONCHAIN_RELAY") continue;
    const data = event?.data || {};
    if (String(data.status || "") !== "RELAYED") continue;
    if (String(data.action || "") !== "POLL_VOTE") continue;
    const topicId = data?.payload?.topic_id ? String(data.payload.topic_id) : "";
    if (!topicId) continue;
    out[topicId] = Number(out[topicId] || 0) + 1;
  }
  return out;
}

function getOffchainNullifiersByGroup(state) {
  const grouped = {};
  for (const [nullifier, details] of Object.entries(state.nullifiers || {})) {
    const gid = String(details?.group_id || "");
    if (!gid) continue;
    if (!grouped[gid]) grouped[gid] = new Set();
    grouped[gid].add(String(nullifier));
  }
  return grouped;
}

function getRelayedNullifiersByGroup(state) {
  const grouped = {};
  for (const event of state.events || []) {
    if (String(event?.type || "") !== "ONCHAIN_RELAY") continue;
    const data = event?.data || {};
    if (String(data.status || "") !== "RELAYED") continue;
    const action = String(data.action || "");
    if (action !== "SIGNAL_SUBMIT" && action !== "POLL_VOTE") continue;
    const gid = data?.payload?.group_id ? String(data.payload.group_id) : "";
    const nullifier = data?.payload?.proof?.nullifier
      ? String(data.payload.proof.nullifier)
      : "";
    if (!gid || !nullifier) continue;
    if (!grouped[gid]) grouped[gid] = new Set();
    grouped[gid].add(nullifier);
  }
  return grouped;
}

function getOffchainGroupRoots(state) {
  const out = {};
  for (const [groupId, group] of Object.entries(state.groups || {})) {
    out[String(groupId)] = String(group?.root || "");
  }
  return out;
}

function getRelayedGroupRoots(state) {
  const out = {};
  for (const event of state.events || []) {
    if (String(event?.type || "") !== "ONCHAIN_RELAY") continue;
    const data = event?.data || {};
    if (String(data.status || "") !== "RELAYED") continue;
    const action = String(data.action || "");
    if (action !== "GROUP_CREATE" && action !== "GROUP_JOIN" && action !== "GROUP_REMOVE") continue;
    const gid = data?.payload?.group_id ? String(data.payload.group_id) : "";
    const root = data?.payload?.expected_root ? String(data.payload.expected_root) : "";
    if (!gid || !root) continue;
    out[gid] = root;
  }
  return out;
}

function compareMaps(expectedMap, actualMap) {
  const diffs = [];
  const keys = new Set([...Object.keys(expectedMap), ...Object.keys(actualMap)]);
  for (const key of keys) {
    const expected = Number(expectedMap[key] || 0);
    const actual = Number(actualMap[key] || 0);
    if (expected !== actual) {
      diffs.push({ key, offchain: expected, relayed: actual, delta: actual - expected });
    }
  }
  return diffs;
}

function compareRootMaps(offchainRoots, relayedRoots) {
  const diffs = [];
  for (const [groupId, offchainRoot] of Object.entries(offchainRoots)) {
    const relayedRoot = String(relayedRoots[groupId] || "");
    if (relayedRoot && relayedRoot !== String(offchainRoot)) {
      diffs.push({ group_id: groupId, offchain_root: String(offchainRoot), relayed_root: relayedRoot });
    }
  }
  return diffs;
}

export function generateDriftReport(state) {
  const offchainPollTotals = getOffchainPollTotals(state);
  const relayedPollTotals = getRelayedPollTotals(state);

  const offchainNullifierSets = getOffchainNullifiersByGroup(state);
  const relayedNullifierSets = getRelayedNullifiersByGroup(state);

  const offchainNullifierCounts = {};
  const relayedNullifierCounts = {};
  for (const [groupId, set] of Object.entries(offchainNullifierSets)) {
    offchainNullifierCounts[groupId] = set.size;
  }
  for (const [groupId, set] of Object.entries(relayedNullifierSets)) {
    relayedNullifierCounts[groupId] = set.size;
  }

  const offchainRoots = getOffchainGroupRoots(state);
  const relayedRoots = getRelayedGroupRoots(state);

  const pollDiffs = compareMaps(offchainPollTotals, relayedPollTotals);
  const nullifierDiffs = compareMaps(offchainNullifierCounts, relayedNullifierCounts);
  const rootDiffs = compareRootMaps(offchainRoots, relayedRoots);

  return {
    generated_at: new Date().toISOString(),
    status: pollDiffs.length === 0 && nullifierDiffs.length === 0 && rootDiffs.length === 0
      ? "HEALTHY"
      : "DRIFT_DETECTED",
    summary: {
      poll_topics: Object.keys(offchainPollTotals).length,
      groups_with_nullifiers: Object.keys(offchainNullifierCounts).length,
      groups_tracked: Object.keys(offchainRoots).length,
      drift_count: pollDiffs.length + nullifierDiffs.length + rootDiffs.length
    },
    poll_totals: {
      offchain: offchainPollTotals,
      relayed: relayedPollTotals,
      diffs: pollDiffs
    },
    nullifiers: {
      offchain: offchainNullifierCounts,
      relayed: relayedNullifierCounts,
      diffs: nullifierDiffs
    },
    group_roots: {
      offchain: offchainRoots,
      relayed: relayedRoots,
      diffs: rootDiffs
    }
  };
}
