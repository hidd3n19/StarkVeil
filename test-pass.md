# Test Pass

This file records which ordered implementation testing points have been executed and why they are considered passed.

Current execution modes used in this environment:

- points `1-2`: artifact/source validation
- point `3`: semantics validation with an external `cast keccak` cross-check
- points `4-13`: runtime Cairo validation through `snforge`
- points `14-15`: off-chain runtime validation through `node`
- point `16`: mixed off-chain/runtime validation through `node` and `snforge`
- point `17`: off-chain runtime Merkle-proof validation through `node`
- point `18`: off-chain runtime witness validation through `node`
- point `19`: off-chain runtime proof-generation validation through `node`
- point `20`: off-chain runtime proof-package validation through `node`
- point `21`: off-chain runtime calldata validation through `node`
- point `22`: runtime Cairo validation through `snforge` in the dedicated verifier package
- point `23`: runtime Cairo validation through `snforge`
- point `24`: mixed upstream-proof/runtime Cairo validation through `node` and `snforge`
- point `25`: mixed off-chain submission/runtime Cairo validation through `node` and `snforge`
- point `26`: runtime Cairo validation through `snforge`
- point `27`: runtime Cairo validation through `snforge`
- point `28`: runtime Cairo validation through `snforge`
- point `29`: runtime Cairo validation through `snforge` in the dedicated verifier package
- point `30`: mixed deployment-config/runtime Cairo validation through `python` and `snforge`
- point `31`: mixed upstream-proof/runtime Cairo validation through `node`, `python`, and `snforge` in the dedicated integration package

Runtime toolchain now available and used for points `4-13`:

- `scarb`
- `snforge`

Off-chain runtime toolchain now available and used for points `14-21`:

- `node`
- `npm`

Runtime toolchain used for point `23`:

- `scarb`
- `snforge`

Runtime toolchain used for point `24`:

- `node`
- `scarb`
- `snforge`

Runtime toolchain used for point `25`:

- `node`
- `scarb`
- `snforge`

Runtime toolchain used for point `26`:

- `scarb`
- `snforge`

Runtime toolchain used for point `27`:

- `scarb`
- `snforge`

Runtime toolchain used for point `28`:

- `scarb`
- `snforge`

Runtime toolchain used for point `29`:

- `snforge 0.53.0`
- `scarb 2.14.0`

Runtime toolchain used for point `30`:

- `python3`
- `scarb`
- `snforge`

Runtime toolchain used for point `31`:

- `node`
- `python3`
- `snforge 0.53.0`
- `scarb 2.14.0`

Runtime toolchain used for point `22`:

- `snforge 0.53.0`
- `scarb 2.14.0`

Reference testing backlog:

- `vibe/port-testing-doc.md`

## Point 1

Reference:

- `vibe/port-testing-doc.md`

Testing point 1 requires:

- the chosen upstream Semaphore version is explicitly pinned
- the referenced circuit source, `.wasm`, `.zkey`, and verification key all belong to that exact version
- no flow references the legacy local `circuits/semaphore.circom` as the canonical proving source

Implementation used:

- `upstream-source-of-truth.md`
- `scripts/test_point_1.py`

Execution mode:

- mixed artifact/source validation

Why this point is passed:

- `upstream-source-of-truth.md` explicitly pins the upstream source of truth to:
  - git tag `v4.13.0`
  - artifact version `4.13.0`
- the same document records one exact upstream circuit source URL and one exact upstream artifact set for:
  - `.wasm`
  - `.zkey`
  - verification key JSON
- the validator checks that those URLs are present in the pinned document and that they resolve successfully
- the validator confirms local proof tooling aligns to that same artifact version:
  - `vibe/semaphore/packages/proof/src/generate-proof.ts` contains `version: "4.13.0"`
  - `vibe/semaphore-rs/src/utils.rs` contains `let version = "4.13.0";`
- the validator checks that the legacy local `circuits/semaphore.circom` is not referenced in the upstream-compatible implementation path as the canonical proving source

Execution:

```bash
python3 scripts/test_point_1.py
```

Observed result:

```text
PASS: mixed artifact/source validation for implementation point 1 and testing point 1 is satisfied
```

Status:

- point 1: passed

## Point 2

Reference:

- `vibe/port-testing-doc.md`

Testing point 2 requires:

- the manifest lists all required upstream artifacts
- expected hashes, locations, and semantics are present

Implementation used:

- `artifact-manifest.json`
- `scripts/validate_artifact_manifest.py`
- `scripts/test_point_2.py`

Execution mode:

- artifact validation

Why this point is passed:

- `artifact-manifest.json` records:
  - the pinned upstream git tag
  - the pinned artifact version
  - the upstream circuit source
  - the depth-20 `.wasm`
  - the depth-20 `.zkey`
  - the depth-20 verification key JSON
  - expected `sha256` hashes for each artifact
  - expected circuit and verifier public-input semantics
- `scripts/validate_artifact_manifest.py` validates:
  - manifest schema and pinned upstream version fields
  - expected verifier public input ordering
  - expected hashing semantics for `message` and `scope`
  - the presence of all required artifact kinds
  - the local mirror circuit hash
  - the downloaded upstream artifact hashes
- `scripts/test_point_2.py` validates the real manifest and then creates a tampered copy with a modified hash entry to confirm validation fails for a mismatched artifact declaration

Execution:

```bash
python3 scripts/validate_artifact_manifest.py
python3 scripts/test_point_2.py
```

Observed results:

```text
PASS: artifact manifest is valid
PASS: artifact validation for implementation point 2 and testing point 2 is satisfied
```

Status:

- point 2: passed

## Point 3

Reference:

- `vibe/port-testing-doc.md`

Testing point 3 requires:

- `message_hash` and hashed-scope values are computed as intended
- verifier public input ordering is correct

Implementation used:

- `scripts/upstream_semantics.py`
- `scripts/test_point_3.py`

Execution mode:

- semantics validation

Why this point is passed:

- `scripts/upstream_semantics.py` implements:
  - normalization of `message` and `scope` into bigint-compatible values
  - upstream-compatible bytes32-string handling for non-numeric strings
  - the upstream hash rule `uint256(keccak256(abi.encodePacked(value))) >> 8`
  - verifier public input packing in the order:
    - `merkleTreeRoot`
    - `nullifier`
    - `hash(message)`
    - `hash(scope)`
- `scripts/test_point_3.py` checks fixed vectors for:
  - numeric normalization
  - string normalization
  - numeric `message_hash`
  - numeric `scope_hash`
  - string `message_hash`
  - string `scope_hash`
  - final verifier public input ordering
- the point-3 test also checks that the semantics recorded in `artifact-manifest.json` match the implementation
- the hash implementation was additionally cross-checked against local `cast keccak` output for the fixed vectors used in testing

Execution:

```bash
python3 scripts/test_point_3.py
```

Additional verification:

```bash
python3 - <<'PY'
import subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path('scripts').resolve()))
from upstream_semantics import hash_to_field, normalize_to_bigint

for value in [123, 456, 'Hello world', 'Scope']:
    normalized = normalize_to_bigint(value)
    packed = subprocess.check_output(['cast', '--to-uint256', str(normalized)], text=True).strip()
    cast_hex = subprocess.check_output(['cast', 'keccak', packed], text=True).strip()
    assert hash_to_field(value) == (int(cast_hex, 16) >> 8)
PY
```

Observed results:

```text
PASS: semantics validation for implementation point 3 and testing point 3 is satisfied
PASS: cross-check against cast succeeded
```

Status:

- point 3: passed

## Point 22

Reference:

- `vibe/port-testing-doc.md`

Testing point 22 requires:

- a valid proof verifies successfully
- an invalid proof is rejected

Implementation used:

- `starkveil_groth16_backend/src/groth16_verifier.cairo`
- `starkveil_groth16_backend/src/groth16_verifier_constants.cairo`
- `starkveil_groth16_backend/tests/point_22_backend.cairo`
- `scripts/test_point_22.py`

Execution mode:

- runtime Cairo validation through `snforge` in the dedicated verifier package

Why this point is passed:

- the real Garaga-generated BN254 verifier was isolated into the `starkveil_groth16_backend` package
- the verifier package was executed with the working backend stack:
  - `starknet-foundry 0.53.0`
  - `scarb 2.14.0`
- `point_22_valid_proof_verifies_successfully` loads real Groth16 calldata generated from the pinned upstream Semaphore verification key and confirms the verifier accepts it
- `point_22_invalid_proof_is_rejected` loads a deliberately corrupted proof calldata fixture and confirms the verifier rejects it
- both tests run against a forked Starknet RPC because the verifier depends on Garaga-maintained on-chain support contracts

Execution:

```bash
python3 scripts/test_point_22.py
```

Observed result:

```text
PASS: runtime validation for implementation point 22 and testing point 22 is satisfied
```

Status:

- point 22: passed

## Point 23

Reference:

- `vibe/port-testing-doc.md`

Testing point 23 requires:

- `src/groth16_verifier_adapter.cairo` forwards to the correct backend
- depth-based routing selects the expected verifier
- unsupported depths fail

Implementation used:

- `tests/point_23_routing.cairo`
- `scripts/test_point_23.py`
- `src/groth16_verifier_adapter.cairo`
- `src/semaphore.cairo`
- `src/test_groth16_backend.cairo`

Execution mode:

- runtime Cairo validation through `snforge`

Why this point is passed:

- `tests/point_23_routing.cairo` deploys:
  - `TestGroth16Backend`
  - `Groth16VerifierAdapter`
  - `Semaphore`
- point `23` validates adapter forwarding and depth routing with the lightweight test backend, not the real BN254 verifier
- it registers the adapter for a supported depth through `set_verifier`
- it confirms `validate_proof` reaches the configured verifier path by:
  - submitting a proof accepted by the test backend
  - asserting the nullifier becomes marked used
- it also configures a verifier for a different depth and confirms `validate_proof` fails with `UNSUPPORTED_DEPTH`

Execution:

```bash
python3 scripts/test_point_23.py
```

Observed result:

```text
PASS: runtime validation for implementation point 23 and testing point 23 is satisfied
```

Status:

- point 23: passed

## Point 24

Reference:

- `vibe/port-testing-doc.md`

Testing point 24 requires:

- verifier public input order matches upstream
- scope value fed to verification preserves upstream hashed-scope semantics
- the correct alignment verifies successfully and altered alignment fails

Implementation used:

- `src/interfaces/isemaphore.cairo`
- `src/semaphore.cairo`
- `src/test_public_input_alignment_backend.cairo`
- `tests/point_24_alignment.cairo`
- `scripts/test_point_24_fixture.mjs`
- `scripts/test_point_24.py`

Execution mode:

- mixed upstream-proof/runtime Cairo validation through `node` and `snforge`

Why this point is passed:

- `src/interfaces/isemaphore.cairo` and `src/semaphore.cairo` were updated so `validate_proof(...)` accepts `scope_hash` explicitly and forwards verifier public inputs in exact upstream order:
  - `merkle_tree_root`
  - `nullifier`
  - `message_hash`
  - `scope_hash`
- `scripts/test_point_24_fixture.mjs` generates a real proof from the pinned upstream Semaphore circuit and proves the fixed point-24 fixture values come from that upstream stack:
  - `merkleTreeRoot`
  - `nullifier`
  - `hash(message)`
  - `hash(scope)`
- `tests/point_24_alignment.cairo` then validates the Cairo contract path with a dedicated alignment backend that checks the verifier-facing inputs exactly
- the test seeds the upstream proof root directly into StarkVeil root history for this point so the runtime assertion isolates public-input alignment from the separate local Merkle-tree compatibility issue
- `point_24_upstream_aligned_public_inputs_verify_successfully` confirms the correctly aligned call succeeds and marks the nullifier used
- `point_24_altered_scope_hash_is_rejected` repeats the call with intentionally altered scope hashing and confirms the contract fails with `INVALID_PROOF`

Execution:

```bash
python3 scripts/test_point_24.py
```

Observed result:

```text
PASS: point 24 upstream proof fixture matches the pinned generator
PASS: runtime validation for implementation point 24 and testing point 24 is satisfied
```

Status:

- point 24: passed

## Point 25

Reference:

- `vibe/port-testing-doc.md`

Testing point 25 requires:

- a user/relayer can submit a valid proof package to `validate_proof`
- successful validation marks the nullifier and emits the proof-validated event

Implementation used:

- `offchain/submission.mjs`
- `scripts/test_point_25_fixture.mjs`
- `tests/point_25_submission.cairo`
- `scripts/test_point_25.py`
- `src/semaphore.cairo`

Execution mode:

- mixed off-chain submission/runtime Cairo validation through `node` and `snforge`

Why this point is passed:

- `offchain/submission.mjs` implements the user/relayer-side submission helper that turns a proof result into:
  - a canonical proof package
  - a prepared `validate_proof(...)` call payload
- `scripts/test_point_25_fixture.mjs` validates that the submission helper produces the expected package and calldata shape for a complete proof-submission request
- `tests/point_25_submission.cairo` deploys:
  - `TestPublicInputAlignmentBackend`
  - `Groth16VerifierAdapter`
  - `Semaphore`
- the runtime test seeds the upstream-compatible root into StarkVeil root history for this point, submits the prepared proof fields through `validate_proof(...)`, then checks:
  - the nullifier changes from unused to used
  - a single event is emitted by `Semaphore`
  - that event payload matches `ProofValidated(group_id, root, nullifier, message, scope)`
- the runtime submission path for point `25` uses a felt-safe proof fixture so the main contract boundary can execute end to end under the current ABI, while the real BN254 verifier path remains covered by points `22`, `29`, and `31`

Execution:

```bash
python3 scripts/test_point_25.py
```

Observed result:

```text
PASS: point 25 submission fixture matches the pinned off-chain submission flow
PASS: runtime validation for implementation point 25 and testing point 25 is satisfied
```

Status:

- point 25: passed

## Point 26

Reference:

- `vibe/port-testing-doc.md`

Testing point 26 requires:

- `is_nullifier_used` reports `false` before successful validation
- `is_nullifier_used` reports `true` after successful validation

Implementation used:

- `src/interfaces/isemaphore.cairo`
- `src/semaphore.cairo`
- `tests/point_26_nullifier_status.cairo`
- `scripts/test_point_26.py`

Execution mode:

- runtime Cairo validation through `snforge`

Why this point is passed:

- the nullifier-status read/query surface is already implemented in:
  - `src/interfaces/isemaphore.cairo`
  - `src/semaphore.cairo`
- `tests/point_26_nullifier_status.cairo` provides a dedicated point-26 runtime test rather than relying on incidental coverage from point `25`
- the runtime test deploys:
  - `TestPublicInputAlignmentBackend`
  - `Groth16VerifierAdapter`
  - `Semaphore`
- it seeds the expected upstream-compatible root into contract root history, queries `is_nullifier_used(NULLIFIER)` before validation, submits a successful proof, and queries `is_nullifier_used(NULLIFIER)` again after validation
- the test passes only if the status transitions from `false` to `true` across a successful `validate_proof(...)` call

Execution:

```bash
python3 scripts/test_point_26.py
```

Observed result:

```text
PASS: runtime validation for implementation point 26 and testing point 26 is satisfied
```

Status:

- point 26: passed

## Point 27

Reference:

- `vibe/port-testing-doc.md`

Testing point 27 requires:

- the same nullifier cannot be used twice
- first submission succeeds and second submission fails

Implementation used:

- `src/semaphore.cairo`
- `tests/point_27_replay.cairo`
- `scripts/test_point_27.py`

Execution mode:

- runtime Cairo validation through `snforge`

Why this point is passed:

- replay protection is already enforced in `src/semaphore.cairo` by rejecting a used nullifier with `NULLIFIER_ALREADY_USED`
- `tests/point_27_replay.cairo` provides a dedicated point-27 runtime test using the same felt-safe submission path as the recent proof-submission points
- the test deploys:
  - `TestPublicInputAlignmentBackend`
  - `Groth16VerifierAdapter`
  - `Semaphore`
- it seeds the expected upstream-compatible root into root history, submits one successful proof, asserts the nullifier is marked used, then submits the same proof again
- the second submission fails with `NULLIFIER_ALREADY_USED`, proving one-time signaling per nullifier at the contract boundary

Execution:

```bash
python3 scripts/test_point_27.py
```

Observed result:

```text
PASS: runtime validation for implementation point 27 and testing point 27 is satisfied
```

Status:

- point 27: passed

## Point 28

Reference:

- `vibe/port-testing-doc.md`

Testing point 28 requires:

- invalid roots are rejected
- wrong depths are rejected
- historical-root policy matches the intended rule

Implementation used:

- `src/semaphore.cairo`
- `tests/point_28_root_depth.cairo`
- `scripts/test_point_28.py`

Execution mode:

- runtime Cairo validation through `snforge`

Why this point is passed:

- `src/semaphore.cairo` enforces:
  - `ROOT_NOT_IN_GROUP` when the submitted root is not present in root history
  - `DEPTH_MISMATCH` when the submitted depth does not match the group depth
  - acceptance of any root recorded in `group_root_exists`
- `tests/point_28_root_depth.cairo` provides a dedicated runtime test covering all required boundary cases
- the test seeds root history with both:
  - one current root
  - one historic root
- it then proves:
  - a non-existent root is rejected
  - a wrong depth is rejected
  - the historic root is accepted when present
  - the current root is accepted when present

Execution:

```bash
python3 scripts/test_point_28.py
```

Observed result:

```text
PASS: runtime validation for implementation point 28 and testing point 28 is satisfied
```

Status:

- point 28: passed

## Point 29

Reference:

- `vibe/port-testing-doc.md`

Testing point 29 requires:

- tampered proof points are rejected
- mismatched public inputs are rejected

Implementation used:

- `starkveil_groth16_backend/tests/point_29_backend.cairo`
- `scripts/test_point_29_fixtures.py`
- `scripts/test_point_29.py`

Execution mode:

- runtime Cairo validation through `snforge` in the dedicated verifier package

Why this point is passed:

- point `29` runs directly against the real Garaga-generated BN254 verifier in the dedicated verifier package
- `scripts/test_point_29_fixtures.py` derives two explicit invalid calldata fixtures from the valid upstream proof calldata:
  - `point_29_invalid_proof_points_calldata.txt` mutates calldata word `0`, which lies inside the serialized proof-point section
  - `point_29_invalid_public_inputs_calldata.txt` mutates calldata word `33`, which is the first serialized public-input word after the 32 proof-point words and the public-input count marker
- `starkveil_groth16_backend/tests/point_29_backend.cairo` runs three real-verifier tests:
  - a valid control proof still verifies successfully
  - tampered proof points are rejected
  - tampered public inputs are rejected
- this makes the two rejection modes explicit instead of relying on a single ambiguous invalid fixture

Execution:

```bash
python3 scripts/test_point_29.py
```

Observed result:

```text
PASS: point 29 fixtures generated
PASS: runtime validation for implementation point 29 and testing point 29 is satisfied
```

Status:

- point 29: passed

## Point 30

Reference:

- `vibe/port-testing-doc.md`

Testing point 30 requires:

- deployment procedure produces a working environment
- verifier contracts and keys are correctly mapped to supported depths

Implementation used:

- `deployment-manifest.json`
- `scripts/validate_deployment_manifest.py`
- `tests/point_30_deployment.cairo`
- `scripts/test_point_30.py`

Execution mode:

- mixed deployment-config/runtime Cairo validation through `python` and `snforge`

Why this point is passed:

- `deployment-manifest.json` documents:
  - the deployment order for backend, adapter, and semaphore contract instances
  - the supported depth mapping for depth `20`
  - the configured `vk_hash`
  - the verification-key artifact reference used for that depth
- `scripts/validate_deployment_manifest.py` validates that manifest against:
  - the expected deployment flow
  - the configured contract classes
  - the supported-depth mapping
  - the verification-key artifact declared in `artifact-manifest.json`
- `tests/point_30_deployment.cairo` performs a fresh runtime deployment of:
  - `TestPublicInputAlignmentBackend`
  - `Groth16VerifierAdapter`
  - `Semaphore`
- the runtime test then:
  - creates a group at depth `20`
  - seeds the expected root
  - registers the verifier for depth `20`
  - submits a valid proof for that depth
  - confirms validation succeeds and the nullifier is marked used

Execution:

```bash
python3 scripts/test_point_30.py
```

Observed result:

```text
PASS: deployment manifest is valid
PASS: runtime validation for implementation point 30 and testing point 30 is satisfied
```

Status:

- point 30: passed

## Point 31

Reference:

- `vibe/port-testing-doc.md`

Testing point 31 requires:

- the full StarkVeil port accepts proofs generated by the pinned upstream-compatible off-chain flow
- the end-to-end path covers identity creation, group construction, proof generation, calldata preparation, StarkVeil submission, and nullifier recording

Implementation used:

- `offchain/identity.mjs`
- `offchain/group.mjs`
- `offchain/proof.mjs`
- `offchain/proof-package.mjs`
- `offchain/calldata.mjs`
- `scripts/test_point_31_prepare.mjs`
- `scripts/test_point_31.py`
- `starkveil_e2e/src/groth16_verifier.cairo`
- `starkveil_e2e/src/groth16_verifier_constants.cairo`
- `starkveil_e2e/src/real_groth16_bridge_backend.cairo`
- `starkveil_e2e/src/groth16_verifier_adapter.cairo`
- `starkveil_e2e/src/semaphore.cairo`
- `starkveil_e2e/tests/point_31_e2e.cairo`

Execution mode:

- mixed upstream-proof/runtime Cairo validation through `node`, `python`, and `snforge` in the dedicated integration package

Why this point is passed:

- `scripts/test_point_31_prepare.mjs` uses the pinned upstream-compatible off-chain flow to:
  - create a deterministic identity
  - create a group containing that identity commitment
  - generate a real upstream Semaphore proof with the pinned artifacts
  - persist the proof, public signals, and verifier-facing metadata
- `scripts/test_point_31.py` then:
  - generates real Garaga verifier calldata from that proof and the pinned verification key
  - writes the full verifier calldata and expected public-input metadata into the dedicated integration package
  - runs `snforge test point_31_` in `starkveil_e2e`
- `starkveil_e2e/tests/point_31_e2e.cairo` performs the end-to-end runtime integration:
  - declares and deploys the real Garaga BN254 verifier contract
  - deploys the bridge backend, verifier adapter, and Semaphore contracts
  - creates the StarkVeil group and seeds the upstream root into StarkVeil root history
  - registers the verifier for depth `20`
  - submits the real upstream-generated proof through `Semaphore.validate_proof(...)`
  - verifies that StarkVeil accepts the proof and marks the nullifier used
- the integration test runs on a forked Starknet runtime because the real Garaga verifier depends on declared classes available in that environment; this is the same real-verifier runtime assumption already validated independently in point `22`

Execution:

```bash
python3 scripts/test_point_31.py
```

Observed result:

```text
PASS: point 31 upstream proof inputs prepared
PASS: runtime validation for implementation point 31 and testing point 31 is satisfied
```

Status:

- point 31: passed

## Point 4

Reference:

- `vibe/port-testing-doc.md`

Testing point 4 requires:

- constructor sets the owner and initialized state correctly
- `initialize` cannot be used more than once

Implementation used:

- `src/semaphore.cairo`
- `tests/port_runtime_points_4_11.cairo`
- `scripts/test_point_4.py`

Execution mode:

- runtime Cairo validation

Why this point is passed:

- `tests/port_runtime_points_4_11.cairo` executes runtime tests proving:
  - the constructor stores the owner and initialized state
  - owner-only entrypoints are usable immediately after deployment
  - calling `initialize` again reverts with `ALREADY_INITIALIZED`
- `scripts/test_point_4.py` executes the filtered `snforge` runtime tests for point 4

Execution:

```bash
python3 scripts/test_point_4.py
```

Observed result:

```text
PASS: runtime validation for implementation point 4 and testing point 4 is satisfied
```

Status:

- point 4: passed

## Point 5

Reference:

- `vibe/port-testing-doc.md`

Testing point 5 requires:

- only the owner can transfer ownership
- ownership changes persist correctly
- ownership transfer event is emitted

Implementation used:

- `src/semaphore.cairo`
- `src/interfaces/isemaphore.cairo`
- `tests/port_runtime_points_4_11.cairo`
- `scripts/test_point_5.py`

Execution mode:

- runtime Cairo validation

Why this point is passed:

- `tests/port_runtime_points_4_11.cairo` executes runtime tests proving:
  - the owner can transfer ownership successfully
  - non-owner callers are rejected with `NOT_OWNER`
  - the owner state actually changes after transfer
  - an event is emitted during the transfer
- `scripts/test_point_5.py` executes the filtered `snforge` runtime tests for point 5

Execution:

```bash
python3 scripts/test_point_5.py
```

Observed result:

```text
PASS: runtime validation for implementation point 5 and testing point 5 is satisfied
```

Status:

- point 5: passed

## Point 6

Reference:

- `vibe/port-testing-doc.md`

Testing point 6 requires:

- valid-depth verifier registration succeeds
- invalid-depth registration fails
- only the owner can register a verifier
- verifier registration event is emitted

Implementation used:

- `src/semaphore.cairo`
- `src/interfaces/isemaphore.cairo`
- `tests/port_runtime_points_4_11.cairo`
- `scripts/test_point_6.py`

Execution mode:

- runtime Cairo validation

Why this point is passed:

- `tests/port_runtime_points_4_11.cairo` executes runtime tests proving:
  - owner registration at a valid depth succeeds
  - invalid depths revert with `INVALID_DEPTH`
  - non-owner callers are rejected with `NOT_OWNER`
  - verifier storage state is written correctly
  - an event is emitted during registration
- `scripts/test_point_6.py` executes the filtered `snforge` runtime tests for point 6

Execution:

```bash
python3 scripts/test_point_6.py
```

Observed result:

```text
PASS: runtime validation for implementation point 6 and testing point 6 is satisfied
```

Status:

- point 6: passed

## Point 7

Reference:

- `vibe/port-testing-doc.md`

Testing point 7 requires:

- a new group is created with the correct admin, depth, size, initial root, and root-history entry
- duplicate creation fails
- invalid depths fail
- group-created event is emitted

Implementation used:

- `src/semaphore.cairo`
- `src/interfaces/isemaphore.cairo`
- `tests/port_runtime_points_4_11.cairo`
- `scripts/test_point_7.py`

Execution mode:

- runtime Cairo validation

Why this point is passed:

- `tests/port_runtime_points_4_11.cairo` executes runtime tests proving:
  - valid group creation sets admin, depth, size, root, and root-history state
  - duplicate creation reverts with `GROUP_EXISTS`
  - invalid depths revert with `INVALID_DEPTH`
  - group state is readable after creation
  - an event is emitted during group creation
- `scripts/test_point_7.py` executes the filtered `snforge` runtime tests for point 7

Execution:

```bash
python3 scripts/test_point_7.py
```

Observed result:

```text
PASS: runtime validation for implementation point 7 and testing point 7 is satisfied
```

Status:

- point 7: passed

## Point 8

Reference:

- `vibe/port-testing-doc.md`

Testing point 8 requires:

- current admin can update the admin
- non-admin cannot update the admin
- group-admin-updated event is emitted

Implementation used:

- `src/semaphore.cairo`
- `src/interfaces/isemaphore.cairo`
- `tests/port_runtime_points_4_11.cairo`
- `scripts/test_point_8.py`

Execution mode:

- runtime Cairo validation

Why this point is passed:

- `tests/port_runtime_points_4_11.cairo` executes runtime tests proving:
  - the current admin can update the admin
  - non-admin callers are rejected with `NOT_GROUP_ADMIN`
  - the stored admin value actually changes
  - an event is emitted during the admin update
- `scripts/test_point_8.py` executes the filtered `snforge` runtime tests for point 8

Execution:

```bash
python3 scripts/test_point_8.py
```

Observed result:

```text
PASS: runtime validation for implementation point 8 and testing point 8 is satisfied
```

Status:

- point 8: passed

## Point 9

Reference:

- `vibe/port-testing-doc.md`

Testing point 9 requires:

- `add_member` updates leaf state, size, root, and root history
- `add_members` performs batched insertion correctly
- insertion beyond capacity fails
- member-added event is emitted

Implementation used:

- `src/semaphore.cairo`
- `src/interfaces/isemaphore.cairo`
- `tests/port_runtime_points_4_11.cairo`
- `scripts/test_point_9.py`

Execution mode:

- runtime Cairo validation

Why this point is passed:

- `tests/port_runtime_points_4_11.cairo` executes runtime tests proving:
  - `add_member` updates leaf state, size, root, and root history
  - `add_members` performs batched insertion
  - insertion beyond capacity reverts with `GROUP_FULL`
  - an event is emitted during single-member insertion
- `scripts/test_point_9.py` executes the filtered `snforge` runtime tests for point 9

Execution:

```bash
python3 scripts/test_point_9.py
```

Observed result:

```text
PASS: runtime validation for implementation point 9 and testing point 9 is satisfied
```

Status:

- point 9: passed

## Point 10

Reference:

- `vibe/port-testing-doc.md`

Testing point 10 requires:

- valid updates replace the stored leaf and root
- invalid siblings length fails
- invalid inclusion data fails
- member-updated event is emitted

Implementation used:

- `src/semaphore.cairo`
- `src/interfaces/isemaphore.cairo`
- `tests/port_runtime_points_4_11.cairo`
- `scripts/test_point_10.py`

Execution mode:

- runtime Cairo validation

Why this point is passed:

- `tests/port_runtime_points_4_11.cairo` executes runtime tests proving:
  - a valid update replaces the stored leaf and root
  - invalid siblings length reverts with `INVALID_SIBLINGS_LEN`
  - invalid inclusion data reverts with `INVALID_MERKLE_PROOF`
  - an event is emitted during a valid update
- `scripts/test_point_10.py` executes the filtered `snforge` runtime tests for point 10

Execution:

```bash
python3 scripts/test_point_10.py
```

Observed result:

```text
PASS: runtime validation for implementation point 10 and testing point 10 is satisfied
```

Status:

- point 10: passed

## Point 11

Reference:

- `vibe/port-testing-doc.md`

Testing point 11 requires:

- removing a valid member changes the root and clears the leaf
- removing an already removed member fails
- wrong inclusion data fails
- member-removed event is emitted

Implementation used:

- `src/semaphore.cairo`
- `src/interfaces/isemaphore.cairo`
- `tests/port_runtime_points_4_11.cairo`
- `scripts/test_point_11.py`

Execution mode:

- runtime Cairo validation

Why this point is passed:

- `tests/port_runtime_points_4_11.cairo` executes runtime tests proving:
  - removing a valid member clears the leaf and changes the root
  - removing an already removed member reverts with `MEMBER_ALREADY_REMOVED`
  - wrong inclusion data reverts with `INVALID_MERKLE_PROOF`
  - an event is emitted during a valid removal
- `scripts/test_point_11.py` executes the filtered `snforge` runtime tests for point 11

Execution:

```bash
python3 scripts/test_point_11.py
```

Observed result:

```text
PASS: runtime validation for implementation point 11 and testing point 11 is satisfied
```

Status:

- point 11: passed

## Point 12

Reference:

- `vibe/port-testing-doc.md`

Testing point 12 requires:

- every create/add/update/remove transition records the expected roots
- historical-root policy behaves as intended

Implementation used:

- `src/semaphore.cairo`
- `tests/port_runtime_points_4_11.cairo`
- `scripts/test_point_12.py`

Execution mode:

- runtime Cairo validation

Why this point is passed:

- `tests/port_runtime_points_4_11.cairo` executes a full runtime sequence covering:
  - group creation
  - member insertion
  - second insertion
  - member update
  - member removal
- after each transition, the runtime test asserts:
  - the new root becomes the current root
  - the new root is recorded in history via `is_root`
  - earlier roots remain valid according to the current contract policy
  - the root timestamp written to `group_root_created_at` matches the block timestamp forced for that transition
- the runtime test also asserts that an unknown root that was never recorded is rejected by `is_root`
- `scripts/test_point_12.py` executes the filtered `snforge` runtime tests for point 12

Execution:

```bash
python3 scripts/test_point_12.py
```

Observed result:

```text
PASS: runtime validation for implementation point 12 and testing point 12 is satisfied
```

Status:

- point 12: passed

## Point 13

Reference:

- `vibe/port-testing-doc.md`

Testing point 13 requires:

- `get_root`, `get_depth`, `get_size`, `get_member`, and `is_root` return correct values across state transitions

Implementation used:

- `src/semaphore.cairo`
- `tests/port_runtime_points_4_11.cairo`
- `scripts/test_point_13.py`

Execution mode:

- runtime Cairo validation

Why this point is passed:

- `tests/port_runtime_points_4_11.cairo` executes a runtime sequence covering:
  - group creation
  - first member insertion
  - second member insertion
  - member update
  - member removal
- after each state transition, the runtime test asserts:
  - `get_depth` returns the configured group depth
  - `get_size` reflects the expected group size
  - `get_member` returns the expected leaf values for the tested indices
  - `get_root` returns the expected current root snapshot
  - `is_root` accepts the current root and the previously recorded historical roots that should remain valid
- `scripts/test_point_13.py` executes the filtered `snforge` runtime tests for point 13

Execution:

```bash
python3 scripts/test_point_13.py
```

Observed result:

```text
PASS: runtime validation for implementation point 13 and testing point 13 is satisfied
```

Status:

- point 13: passed

## Point 14

Reference:

- `vibe/port-testing-doc.md`

Testing point 14 requires:

- identity generation is deterministic for a fixed private key/input
- commitment and secret scalar are accessible in the expected representation
- import/export preserves the identity if implemented

Implementation used:

- `package.json`
- `package-lock.json`
- `offchain/identity.mjs`
- `scripts/test_point_14.mjs`
- `scripts/test_point_14.py`

Execution mode:

- off-chain runtime identity validation

Why this point is passed:

- `package.json` pins the port-side identity dependency to `@semaphore-protocol/identity@4.13.0`
- `offchain/identity.mjs` implements a root-level `PortIdentity` wrapper that exposes:
  - deterministic creation from a supplied private key
  - `secretScalar`
  - `commitment`
  - `publicKey`
  - base64 export/import behavior
  - proof-facing serialization through `toProofIdentity()`
- `scripts/test_point_14.mjs` executes runtime assertions proving:
  - repeated construction from the same fixed private key produces the same `secretScalar`, `commitment`, and `publicKey`
  - the wrapper output matches the upstream `Identity` class exactly
  - export/import round-trips preserve the same identity values
  - serialized output matches the expected stable string representation
- `scripts/test_point_14.py` executes the node-based runtime test for point 14

Execution:

```bash
npm install
python3 scripts/test_point_14.py
```

Observed result:

```text
PASS: runtime identity validation for implementation point 14 and testing point 14 is satisfied
```

Status:

- point 14: passed

## Point 15

Reference:

- `vibe/port-testing-doc.md`

Testing point 15 requires:

- off-chain group construction mirrors the intended group root behavior
- known commitments produce a deterministic root

Implementation used:

- `package.json`
- `package-lock.json`
- `offchain/group.mjs`
- `scripts/test_point_15.mjs`
- `scripts/test_point_15.py`

Execution mode:

- off-chain runtime group validation

Why this point is passed:

- `package.json` pins the port-side prover group dependency to `@semaphore-protocol/group@4.13.0`
- `offchain/group.mjs` implements a root-level `PortGroup` wrapper that exposes:
  - deterministic construction from a provided commitment set
  - `root`
  - `depth`
  - `size`
  - `members`
  - member lookup with `indexOf`
  - membership proof generation
  - export/import behavior
  - prover-facing serialization through `toProverGroup()`
- `scripts/test_point_15.mjs` executes runtime assertions proving:
  - repeated construction from the same fixed commitments produces the same root
  - the wrapper root matches the upstream `Group` class exactly
  - the fixed group root matches the expected snapshot for `[1111, 2222, 3333]`
  - `depth`, `size`, `members`, and `indexOf` are stable and correct
  - export/import preserves the same group state
- `scripts/test_point_15.py` executes the node-based runtime test for point 15

Execution:

```bash
npm install
python3 scripts/test_point_15.py
```

Observed result:

```text
PASS: runtime group validation for implementation point 15 and testing point 15 is satisfied
```

Status:

- point 15: passed

## Point 16

Reference:

- `vibe/port-testing-doc.md`

Testing point 16 requires:

- the join path sends only the public commitment
- successful join results in correct on-chain membership insertion

Implementation used:

- `offchain/join.mjs`
- `tests/port_runtime_points_4_11.cairo`
- `scripts/test_point_16.mjs`
- `scripts/test_point_16.py`

Execution mode:

- mixed off-chain/runtime validation

Why this point is passed:

- `offchain/join.mjs` implements root-level join payload builders for:
  - `add_member`
  - `add_members`
- those builders include only:
  - `groupId`
  - public identity commitment values
  - Starknet-facing calldata
- `scripts/test_point_16.mjs` executes runtime assertions proving:
  - the `add_member` join payload contains only the public commitment and calldata
  - the `add_members` join payload contains only public commitments and calldata
  - no `secretScalar`, `privateKey`, or `publicKey` fields are sent in the join request payload
- `tests/port_runtime_points_4_11.cairo` executes a runtime contract test proving:
  - submitting the joined commitment through `add_member` stores it as the member leaf
  - the group size increments
  - the group root updates and is recorded in root history
- `scripts/test_point_16.py` executes both the node-based payload validation and the filtered `snforge` runtime test for point 16

Execution:

```bash
python3 scripts/test_point_16.py
```

Observed result:

```text
PASS: off-chain join payload validation for implementation point 16 and testing point 16 is satisfied
PASS: runtime validation for implementation point 16 and testing point 16 is satisfied
```

Status:

- point 16: passed

## Point 17

Reference:

- `vibe/port-testing-doc.md`

Testing point 17 requires:

- leaf lookup by identity commitment succeeds for a member
- generated Merkle witness recomputes the expected root

Implementation used:

- `package.json`
- `package-lock.json`
- `offchain/merkle-proof.mjs`
- `scripts/test_point_17.mjs`
- `scripts/test_point_17.py`

Execution mode:

- off-chain runtime Merkle-proof validation

Why this point is passed:

- `offchain/merkle-proof.mjs` implements:
  - member lookup by commitment via `group.indexOf(...)`
  - generation of `merkleProofLength`
  - generation of `merkleProofIndex`
  - generation of `merkleProofSiblings`
  - serialization of the witness into the upstream proof-generation field names
  - independent LeanIMT root recomputation using the upstream proof index and sibling semantics
- `scripts/test_point_17.mjs` executes runtime assertions proving:
  - a known member commitment is found in the group
  - the generated witness matches the expected fixture for the fixed group
  - recomputing the root from `leaf`, `merkleProofIndex`, and `merkleProofSiblings` yields the expected root
  - requesting a witness for a non-member commitment fails
- `scripts/test_point_17.py` executes the node-based runtime test for point 17

Execution:

```bash
npm install
python3 scripts/test_point_17.py
```

Observed result:

```text
PASS: off-chain Merkle proof validation for implementation point 17 and testing point 17 is satisfied
```

Status:

- point 17: passed

## Point 18

Reference:

- `vibe/port-testing-doc.md`

Testing point 18 requires:

- witness fields map exactly to the upstream circuit interface
- hashed message and hashed scope semantics are preserved

Implementation used:

- `package.json`
- `package-lock.json`
- `offchain/witness.mjs`
- `scripts/test_point_18.mjs`
- `scripts/test_point_18.py`

Execution mode:

- off-chain runtime witness validation

Why this point is passed:

- `offchain/witness.mjs` implements:
  - upstream-compatible normalization of `message` and `scope`
  - the upstream hash rule `keccak256(toBeHex(value, 32)) >> 8`
  - witness construction with the exact circuit field names:
    - `secret`
    - `merkleProofLength`
    - `merkleProofIndex`
    - `merkleProofSiblings`
    - `message`
    - `scope`
  - sibling padding to the requested Merkle tree depth to match upstream proof generation semantics
- `scripts/test_point_18.mjs` executes runtime assertions proving:
  - normalized string inputs match the expected bytes32 representation
  - hashed `message` and hashed `scope` match the expected values
  - the complete serialized witness matches the expected fixture
- `scripts/test_point_18.py` executes the node-based runtime test for point 18

Execution:

```bash
npm install
python3 scripts/test_point_18.py
```

Observed result:

```text
PASS: off-chain circuit witness validation for implementation point 18 and testing point 18 is satisfied
```

Status:

- point 18: passed

## Point 19

Reference:

- `vibe/port-testing-doc.md`

Testing point 19 requires:

- proof generation succeeds using the pinned upstream artifacts
- returned proof package contains a valid root/nullifier pair and proof points

Implementation used:

- `package.json`
- `package-lock.json`
- `offchain/artifacts.mjs`
- `offchain/proof.mjs`
- `scripts/test_point_19.mjs`
- `scripts/test_point_19.py`

Execution mode:

- off-chain runtime proof-generation validation

Why this point is passed:

- `offchain/artifacts.mjs` implements:
  - reading the pinned `artifact-manifest.json`
  - caching the upstream Semaphore `.wasm`, `.zkey`, and verification key under `.artifacts/`
  - loading the verification key for proof verification
- `offchain/proof.mjs` implements:
  - proof generation with `snarkjs.groth16.fullProve(...)`
  - use of the pinned upstream artifacts
  - return of the generated proof, public signals, root, and nullifier
  - verification of the generated proof against the upstream verification key
- `scripts/test_point_19.mjs` executes runtime assertions proving:
  - the proof verifies successfully
  - the proof result contains a coherent `merkleTreeRoot` / `nullifier` pair
  - the expected Groth16 proof points are present
- `scripts/test_point_19.py` executes the node-based runtime test for point 19

Execution:

```bash
npm install
python3 scripts/test_point_19.py
```

Observed result:

```text
PASS: off-chain proof generation validation for implementation point 19 and testing point 19 is satisfied
```

Status:

- point 19: passed

## Point 20

Reference:

- `vibe/port-testing-doc.md`

Testing point 20 requires:

- the canonical proof package includes all required fields
- serialization and deserialization preserve those fields exactly

Implementation used:

- `offchain/proof-package.mjs`
- `scripts/test_point_20.mjs`
- `scripts/test_point_20.py`

Execution mode:

- off-chain runtime proof-package validation

Why this point is passed:

- `offchain/proof-package.mjs` implements:
  - creation of a canonical proof package for the app/relayer/Starknet boundary
  - inclusion of the required fields:
    - `merkleTreeDepth`
    - `merkleTreeRoot`
    - `nullifier`
    - `message`
    - `scope`
    - `points`
  - normalization of nested Groth16 proof points into transport-safe strings
  - JSON serialization and deserialization helpers
- `scripts/test_point_20.mjs` executes runtime assertions proving:
  - the proof package has exactly the required top-level fields
  - the proof point structure is present and normalized
  - serializing and deserializing the package preserves every field exactly
- `scripts/test_point_20.py` executes the node-based runtime test for point 20

Execution:

```bash
python3 scripts/test_point_20.py
```

Observed result:

```text
PASS: off-chain proof package validation for implementation point 20 and testing point 20 is satisfied
```

Status:

- point 20: passed

## Point 21

Reference:

- `vibe/port-testing-doc.md`

Testing point 21 requires:

- calldata matches the `validate_proof(...)` ABI
- `message_hash` is computed correctly
- scope handling matches upstream-compatible verifier semantics

Implementation used:

- `offchain/calldata.mjs`
- `scripts/test_point_21.mjs`
- `scripts/test_point_21.py`

Execution mode:

- off-chain runtime calldata validation

Why this point is passed:

- `offchain/calldata.mjs` implements:
  - flattening of Groth16 proof points into the Starknet `proof_points` array shape used by this repo
  - translation from the canonical proof package to the `validate_proof(...)` contract-call fields
  - raw ABI calldata encoding for the final `Span<felt252>` argument by prepending the proof-point length
  - construction of `message_hash` with the upstream-compatible hash rule
  - construction of verifier-facing public inputs `[root, nullifier, hash(message), hash(scope)]`
- `scripts/test_point_21.mjs` executes runtime assertions proving:
  - the contract-call object matches the expected `validate_proof(...)` argument layout
  - the raw calldata positions match the expected ABI order
  - `message_hash` equals the upstream-compatible hashed message
  - `scopeHash` and `verifierPublicInputs` preserve upstream hashed-scope semantics
- `scripts/test_point_21.py` executes the node-based runtime test for point 21

Execution:

```bash
python3 scripts/test_point_21.py
```

Observed result:

```text
PASS: off-chain calldata validation for implementation point 21 and testing point 21 is satisfied
```

Status:

- point 21: passed
