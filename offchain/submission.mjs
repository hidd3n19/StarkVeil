import { buildValidateProofCalldata } from "./calldata.mjs";
import { createProofPackage } from "./proof-package.mjs";

export function createValidateProofSubmission(groupId, proofResult) {
  const proofPackage = createProofPackage(proofResult);
  const preparedCall = buildValidateProofCalldata(groupId, proofPackage);

  return {
    proofPackage,
    preparedCall
  };
}
