function normalizeCommitment(identity) {
  return identity.commitment.toString();
}

export function buildAddMemberJoinRequest(groupId, identity) {
  return {
    action: "add_member",
    groupId: groupId.toString(),
    identityCommitment: normalizeCommitment(identity),
    calldata: [groupId.toString(), normalizeCommitment(identity)]
  };
}

export function buildAddMembersJoinRequest(groupId, identities) {
  const commitments = identities.map(normalizeCommitment);

  return {
    action: "add_members",
    groupId: groupId.toString(),
    identityCommitments: commitments,
    calldata: [groupId.toString(), ...commitments]
  };
}
