![Starkviel banner](assets/banner.svg)

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

## Build

```bash
scarb build
```

## Test coverage added

`tests/semaphore_integration.cairo` includes cases for:
- replay failure (`NULLIFIER_ALREADY_USED`)
- wrong root (`ROOT_NOT_IN_GROUP`)
- wrong depth (`DEPTH_MISMATCH`)
- invalid proof (`INVALID_PROOF`)

Run:

```bash
snforge test
```

## Core verification ABI

`validate_proof(group_id, merkle_tree_depth, merkle_tree_root, nullifier, message, scope, message_hash, proof_points)`

Verifier public input order:
1. `merkle_tree_root`
2. `nullifier`
3. `message_hash`
4. `scope`

## Notes

- `update_member` and `remove_member` require `siblings` length exactly equal to group depth.
- This repo now uses the Groth16 adapter path instead of a direct mock verifier.
# StarkVeil
