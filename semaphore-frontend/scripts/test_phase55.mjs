import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

async function read(relPath) {
  return readFile(path.join(root, relPath), "utf8");
}

async function main() {
  const upgradePlan = await read("UPGRADE_PHASES.md");
  const phase55Draft = await read("PHASE55_ONCHAIN_SOCIAL_ECONOMICS.md");
  const pkg = JSON.parse(await read("package.json"));

  assert.match(upgradePlan, /## Phase 5\.5: On-Chain Social Economics and Identity Layer/);
  assert.match(upgradePlan, /Community creation bond/);
  assert.match(upgradePlan, /Registered identity commitment/);
  assert.match(upgradePlan, /Post bond/);
  assert.match(upgradePlan, /Reply bond or reply quota/);
  assert.match(upgradePlan, /Membership join bond/);
  assert.match(upgradePlan, /On-chain reputation attestations/);
  assert.match(upgradePlan, /identity_registry\.cairo/);
  assert.match(upgradePlan, /community_bond_vault\.cairo/);
  assert.match(upgradePlan, /post_bond_vault\.cairo/);
  assert.match(upgradePlan, /reputation_attestor\.cairo/);

  assert.match(phase55Draft, /## Fit Assessment/);
  assert.match(phase55Draft, /## Contract Strategy/);
  assert.match(phase55Draft, /## Feature Breakdown/);
  assert.match(phase55Draft, /### 1\. Registered Identity Commitment/);
  assert.match(phase55Draft, /### 2\. Community Creation Bond/);
  assert.match(phase55Draft, /### 3\. Membership Join Bond/);
  assert.match(phase55Draft, /### 4\. Post Bond/);
  assert.match(phase55Draft, /### 5\. Reply Bond or Reply Quota/);
  assert.match(phase55Draft, /### 6\. On-Chain Reputation Attestations/);
  assert.match(phase55Draft, /## Phase 5\.5 Execution Order/);
  assert.match(phase55Draft, /## Test Plan/);

  assert.equal(pkg.scripts["test:phase55"], "node scripts/test_phase55.mjs");

  console.log("Phase 5.5 planning artifacts test passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
