import fs from "node:fs/promises";
import path from "node:path";

import { ensureUpstreamArtifacts } from "../offchain/artifacts.mjs";
import { buildValidateProofCalldata } from "../offchain/calldata.mjs";
import { createPortGroup } from "../offchain/group.mjs";
import { createPortIdentity } from "../offchain/identity.mjs";
import { createProofPackage } from "../offchain/proof-package.mjs";
import { generateUpstreamSemaphoreProof } from "../offchain/proof.mjs";

const ROOT = process.cwd();
const TMP = path.join(ROOT, "scripts", ".tmp_point_31");

const MASK_128 = (1n << 128n) - 1n;

function splitU256(value) {
  const bigintValue = BigInt(value);
  return {
    low: (bigintValue & MASK_128).toString(),
    high: (bigintValue >> 128n).toString()
  };
}

await fs.mkdir(TMP, { recursive: true });

const identity = createPortIdentity("point24-fit-77");
const group = createPortGroup([identity.commitment]);
const proofResult = await generateUpstreamSemaphoreProof(identity, group, 11n, 22n, 20);
const proofPackage = createProofPackage(proofResult);
const prepared = buildValidateProofCalldata(1n, proofPackage);
const artifacts = await ensureUpstreamArtifacts(20);

await fs.writeFile(
  path.join(TMP, "proof.json"),
  JSON.stringify(proofResult.proof, null, 2),
  "utf8"
);
await fs.writeFile(
  path.join(TMP, "public.json"),
  JSON.stringify(proofResult.publicSignals, null, 2),
  "utf8"
);

const metadata = {
  vkPath: artifacts.verificationKey,
  root: proofPackage.merkleTreeRoot,
  nullifier: proofPackage.nullifier,
  message: proofPackage.message,
  scope: proofPackage.scope,
  messageHash: prepared.calldata.message_hash,
  scopeHash: prepared.calldata.scope_hash,
  rootU256: splitU256(proofPackage.merkleTreeRoot),
  nullifierU256: splitU256(proofPackage.nullifier),
  messageHashU256: splitU256(prepared.calldata.message_hash),
  scopeHashU256: splitU256(prepared.calldata.scope_hash)
};

await fs.writeFile(
  path.join(TMP, "metadata.json"),
  JSON.stringify(metadata, null, 2),
  "utf8"
);

console.log("PASS: point 31 upstream proof inputs prepared");
process.exit(0);
