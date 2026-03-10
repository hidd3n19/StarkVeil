![Starkviel banner](assets/banner.png)

# StarkVeil port summary

StarkVeil is intended as a Starknet/Cairo port of Semaphore that reuses the upstream Semaphore v4 circuit and proving artifact stack rather than redefining the protocol's core cryptography. The intended reuse is the upstream circuit, identity and group semantics, proof-generation flow, proving artifacts such as `.wasm` and `.zkey`, and the matching verification key from the same upstream version. In this design, proofs remain generated off-chain, while Starknet handles protocol state and verification routing on-chain.

# Semaphore Starknet (Cairo)

Starknet-native Semaphore core preserving protocol semantics:
- anonymous group membership proof validation,
- depth-specific verifier routing,
- root membership validation,
- single-use nullifier replay protection,
- membership update/remove via Merkle inclusion proofs.

## Contracts

- `src/semaphore.cairo`
  - ownership and verifier registration (`set_verifier`)
  - group lifecycle (`create_group`, `set_group_admin`)
  - Poseidon Merkle tree state with per-node hashes
  - member operations: `add_member`, `add_members`, `update_member`, `remove_member`
  - proof validation: `validate_proof`
- `src/groth16_verifier_adapter.cairo`
  - implements `IVerifier`
  - forwards verification to a Groth16 backend contract implementing `IGroth16Backend`
  - intended adapter point for Garaga-style BN254 verifier backends
- `src/test_groth16_backend.cairo`
  - deterministic backend used by integration tests only.

## Specification

StarkVeil ports Semaphore to Starknet by preserving the upstream Semaphore proof model while moving verification routing and protocol state to Cairo.

The implementation backlog for this port is tracked in [port-doc.md](port-doc.md).

Core protocol model:
- users generate a Semaphore identity off-chain
- group membership is represented by identity commitments in a Merkle tree
- proof generation remains off-chain using the pinned upstream Semaphore v4 circuit and proving artifacts
- Starknet verifies proofs through depth-specific verifier routing and enforces group-root validity and nullifier replay protection

System requirements implemented by the port:
- `Identity`
  - upstream-compatible off-chain identity generation
  - access to identity commitment and secret scalar for proof generation
- `Group`
  - on-chain group lifecycle: `create_group`, `set_group_admin`, `add_member`, `add_members`, `update_member`, `remove_member`
  - root-history tracking across create, add, update, and remove transitions
- `Nullifier`
  - one-time signaling per identity per scope
  - on-chain replay protection through `is_nullifier_used` and `validate_proof`

Verification semantics:
- proof generation uses the pinned upstream Semaphore artifact stack
- verifier-facing public input order is:
  1. `merkle_tree_root`
  2. `nullifier`
  3. `hash(message)`
  4. `hash(scope)`
- the Cairo side checks:
  - configured verifier exists for the submitted depth
  - submitted root is valid for the group under the configured root-history policy
  - nullifier has not already been used
  - verifier accepts the proof

Port structure:
- [src](src)
  - main StarkVeil Cairo contracts
- [offchain](offchain)
  - upstream-compatible identity, group, witness, proof, proof-package, and calldata helpers
- [starkveil_groth16_backend](starkveil_groth16_backend)
  - dedicated real BN254/Groth16 verifier package
- [starkveil_e2e](starkveil_e2e)
  - dedicated end-to-end integration package for real upstream proof acceptance

## Build

Main Cairo package:

```bash
scarb build
```

Real verifier package:

```bash
cd starkveil_groth16_backend
scarb build
```

End-to-end integration package:

```bash
cd starkveil_e2e
scarb build
```

Off-chain dependencies:

```bash
npm install
```

## Test

The repo has a point-by-point implementation and testing backlog covering the full port from upstream version pinning through end-to-end StarkVeil verification.

The 1:1 testing map for that backlog is tracked in [port-testing-doc.md](port-testing-doc.md).

Test surfaces:
- `scripts/test_point_1.py` to `scripts/test_point_31.py`
  - ordered point runners for the full port backlog
- [tests](tests)
  - main Cairo runtime tests for StarkVeil contract behavior
- [starkveil_groth16_backend/tests](starkveil_groth16_backend/tests)
  - real BN254/Groth16 verifier tests
- [starkveil_e2e/tests](starkveil_e2e/tests)
  - full upstream-proof-to-StarkVeil integration tests

Run the full ordered suite:

```bash
for i in $(seq 1 31); do
  python3 "scripts/test_point_${i}.py"
done
```

Run the main StarkVeil Cairo tests:

```bash
snforge test
```

Run the dedicated real verifier tests:

```bash
cd starkveil_groth16_backend
snforge test
```

Run the dedicated end-to-end integration tests:

```bash
cd starkveil_e2e
snforge test
```

Current coverage includes:
- contract initialization, ownership, verifier registration, and group lifecycle
- root-history invariants and query surface correctness
- off-chain identity, group, Merkle proof, witness, proof, proof-package, and calldata generation
- real BN254/Groth16 verification against upstream-compatible proofs
- full end-to-end StarkVeil acceptance of an upstream-generated proof

## Core verification ABI

`validate_proof(group_id, merkle_tree_depth, merkle_tree_root, nullifier, message, scope, message_hash, scope_hash, proof_points)`

Verifier public input order:
1. `merkle_tree_root`
2. `nullifier`
3. `message_hash`
4. `scope_hash`

## Notes

- `update_member` and `remove_member` require `siblings` length exactly equal to group depth.
- This repo now uses the Groth16 adapter path instead of a direct mock verifier.
