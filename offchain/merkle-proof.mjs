import { poseidon2 } from "poseidon-lite/poseidon2";

function normalizeBigIntArray(values) {
  return values.map((value) => value.toString());
}

export function buildMerkleWitness(group, identityCommitment) {
  const memberIndex = group.indexOf(identityCommitment);

  if (memberIndex < 0) {
    throw new Error("Identity commitment is not a member of the group");
  }

  const proof = group.merkleProof(memberIndex);

  return {
    leaf: proof.leaf,
    root: proof.root,
    merkleProofLength: proof.depth,
    merkleProofIndex: proof.index,
    merkleProofSiblings: proof.siblings
  };
}

export function recomputeLeanIMTRootFromWitness(leaf, merkleProofIndex, merkleProofSiblings) {
  let node = BigInt(leaf);

  for (let i = 0; i < merkleProofSiblings.length; i += 1) {
    const sibling = BigInt(merkleProofSiblings[i]);
    const isRightNode = (BigInt(merkleProofIndex) >> BigInt(i)) & 1n;

    node = isRightNode === 1n ? poseidon2([sibling, node]) : poseidon2([node, sibling]);
  }

  return node.toString();
}

export function serializeMerkleWitness(witness) {
  return {
    leaf: witness.leaf.toString(),
    root: witness.root.toString(),
    merkleProofLength: witness.merkleProofLength,
    merkleProofIndex: witness.merkleProofIndex,
    merkleProofSiblings: normalizeBigIntArray(witness.merkleProofSiblings)
  };
}
