# Semaphore Starknet Frontend (JSON-Backed App)

This app now supports, without wallet/testnet:
- identity lifecycle UX: create/export/import/recover
- encryption at rest for identity secrets
- eligibility checks before group join
- local witness/proof generation + verifier checks in submit flow
- Starknet wallet connect UI (Argent X / Braavos injected wallet)

State is persisted in:
- `semaphore-frontend/data/history.json`

## Run

```bash
cd semaphore-frontend
npm start
```

Open: `http://localhost:8787`

## Migration Flags (Phase 1)

Use env vars (see `.env.example`):

- `MODE=offchain|hybrid|onchain`
- `ONCHAIN_WRITE_ENABLED=false|true`
- `ONCHAIN_READ_PREFERRED=false|true`

Default behavior remains off-chain JSON-backed.

## Validation Scripts

```bash
cd semaphore-frontend
npm run test:phase2
npm run smoke:phase0
```

- `test:phase2`: validates contract adapter payload mapping + retry/idempotency relay behavior.
- `smoke:phase0`: runs baseline flow smoke test (requires local socket permissions).

## Notes

- Identity secrets are stored encrypted (`aes-256-gcm` + `scrypt`) in JSON.
- Recovery works via recovery code + backup encrypted identity package.
- Eligibility is policy-based (`open`, `allowlist`, `kyc`, `reputation_min`, `token_min`).
- Prover/verifier pipeline is local and deterministic for pre-wallet/testnet development.
- `Create Group`, `Join Group`, and `Submit Signal` now require a connected wallet.
