import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { ensureUpstreamArtifacts } from "../offchain/artifacts.mjs";
import { buildValidateProofCalldata } from "../offchain/calldata.mjs";
import { createPortGroup } from "../offchain/group.mjs";
import { createPortIdentity } from "../offchain/identity.mjs";
import { createProofPackage } from "../offchain/proof-package.mjs";
import { generateUpstreamSemaphoreProof } from "../offchain/proof.mjs";

const execFileAsync = promisify(execFile);

const ROOT = process.cwd();
const TMP = path.join(ROOT, "scripts", ".tmp_grants_demo");
const PUBLIC_DIR = path.join(ROOT, "frontend", "public");
const MESSAGE = 1n;
const SCOPE = 1n;

function parseGaragaArray(output) {
  return output.match(/0x[0-9a-fA-F]+|\d+/g) ?? [];
}

await fs.mkdir(TMP, { recursive: true });
await fs.mkdir(PUBLIC_DIR, { recursive: true });

const identity = createPortIdentity("point24-fit-77");
const group = createPortGroup([identity.commitment]);
const proofResult = await generateUpstreamSemaphoreProof(identity, group, MESSAGE, SCOPE, 20);
const proofPackage = createProofPackage(proofResult);
const prepared = buildValidateProofCalldata(1n, proofPackage);
const artifacts = await ensureUpstreamArtifacts(20);

await fs.writeFile(path.join(TMP, "proof.json"), JSON.stringify(proofResult.proof, null, 2), "utf8");
await fs.writeFile(path.join(TMP, "public.json"), JSON.stringify(proofResult.publicSignals, null, 2), "utf8");

const metadata = {
  groupId: "1",
  depth: "20",
  root: proofPackage.merkleTreeRoot,
  nullifier: proofPackage.nullifier,
  message: proofPackage.message,
  scope: proofPackage.scope,
  messageHash: prepared.calldata.message_hash,
  scopeHash: prepared.calldata.scope_hash,
  vkPath: artifacts.verificationKey
};

await fs.writeFile(path.join(TMP, "metadata.json"), JSON.stringify(metadata, null, 2), "utf8");

const { stdout } = await execFileAsync(
  "garaga",
  [
    "calldata",
    "--system",
    "groth16",
    "--vk",
    metadata.vkPath,
    "--proof",
    path.join(TMP, "proof.json"),
    "--public-inputs",
    path.join(TMP, "public.json"),
    "--format",
    "array"
  ],
  { cwd: ROOT, maxBuffer: 10 * 1024 * 1024 }
);

const values = parseGaragaArray(stdout);
if (values.length === 0) {
  throw new Error("Garaga returned no calldata values for the grants demo proof");
}

await fs.writeFile(
  path.join(PUBLIC_DIR, "grants_demo_full_calldata.txt"),
  `${values.join("\n")}\n`,
  "utf8"
);
await fs.writeFile(
  path.join(PUBLIC_DIR, "grants_demo_metadata.json"),
  JSON.stringify(metadata, null, 2),
  "utf8"
);

console.log("PASS: grants demo proof prepared");
