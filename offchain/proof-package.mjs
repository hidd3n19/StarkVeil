function stringifyNested(value) {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(stringifyNested);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, stringifyNested(nested)])
    );
  }

  return value;
}

export function createProofPackage(proofResult) {
  return {
    merkleTreeDepth: proofResult.merkleTreeDepth,
    merkleTreeRoot: proofResult.merkleTreeRoot,
    nullifier: proofResult.nullifier,
    message: proofResult.message,
    scope: proofResult.scope,
    points: stringifyNested(proofResult.proof)
  };
}

export function serializeProofPackage(proofPackage) {
  return JSON.stringify(proofPackage);
}

export function deserializeProofPackage(serializedProofPackage) {
  return JSON.parse(serializedProofPackage);
}
