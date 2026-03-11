#!/usr/bin/env python3

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_RPC = "https://api.cartridge.gg/x/starknet/sepolia"
BRIDGE_CLASS_HASH = "0x03780dbe7ea61ea2cf56f227d6d945f02caa4aabc9cddd5bf822e5cb2d5342d9"
ADAPTER_CLASS_HASH = "0x02dc879df25e6f0b0b7a815addc0917109d5ceb3961632b3a68df87b8da4dbdf"
SEMAPHORE_CLASS_HASH = "0x07b08d53f31257f3a25c41987252fe7dffe9f723ccdef49dc42c81ffc41a69a1"
VERIFIER_CLASS_HASH = "0x0598d0f4685f333914064bfb4632b50432fce3679c3566625fb04cf6aa0bc345"
STRK_TOKEN = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
GRANTS_ARTIFACT = ROOT / "target" / "dev" / "semaphore_starknet_StarkVeilGrants.contract_class.json"
GRANTS_CASM_ARTIFACT = ROOT / "target" / "dev" / "semaphore_starknet_StarkVeilGrants.compiled_contract_class.json"
VK_HASH = "777"
ROOT_VALUE = "1915826951860152537973846421180435708428200415375148218822513943503006881772"
DEPTH = "20"
COMMUNITY_NAME = "0x4d41545f434f4d4d4f4e53"  # MAT_COMMONS
QUORUM = "1"
YES_THRESHOLD_BPS = "5000"
MAX_ASK_BPS = "8000"


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)


def run(command: list[str], env: dict[str, str]) -> str:
    result = subprocess.run(
        command,
        cwd=ROOT,
        env=env,
        text=True,
        capture_output=True,
        check=False,
    )
    if result.stdout:
        print(result.stdout, end="")
    if result.stderr:
        print(result.stderr, end="", file=sys.stderr)
    if result.returncode != 0:
        fail(f"command failed: {' '.join(command)}")
    return result.stdout


def parse_hex(output: str) -> str:
    matches = re.findall(r"0x[0-9a-fA-F]+", output)
    if not matches:
        fail("could not parse hex value from starkli output")
    return matches[-1]


def deploy(class_hash: str, ctor_args: list[str], env: dict[str, str]) -> str:
    output = run(
        ["starkli", "deploy", "--account", env["STARKNET_ACCOUNT"], class_hash, *ctor_args, "--watch"],
        env,
    )
    return parse_hex(output)


def invoke(contract: str, selector: str, args: list[str], env: dict[str, str]) -> str:
    return run(
        ["starkli", "invoke", "--account", env["STARKNET_ACCOUNT"], contract, selector, *args, "--watch"],
        env,
    )


def require_env(env: dict[str, str], key: str) -> str:
    value = env.get(key)
    if not value:
        fail(f"missing required env var: {key}")
    return value


def deployed_address(account_path: Path) -> str:
    data = json.loads(account_path.read_text(encoding="utf-8"))
    address = data.get("deployment", {}).get("address")
    if not address:
        fail(f"account file has no deployed address: {account_path}")
    return address


def ensure_class_declared(class_hash: str, env: dict[str, str]) -> None:
    result = subprocess.run(
        ["starkli", "class-by-hash", class_hash, "--rpc", env["STARKNET_RPC"]],
        cwd=ROOT,
        env=env,
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        fail(f"class hash is not declared on {env['STARKNET_RPC']}: {class_hash}")


def declare_grants_class(env: dict[str, str]) -> str:
    existing = env.get("STARKVEIL_GRANTS_CLASS_HASH")
    if existing:
        ensure_class_declared(existing, env)
        return existing

    if not GRANTS_ARTIFACT.exists():
        fail(f"missing grants artifact: {GRANTS_ARTIFACT}")
    if not GRANTS_CASM_ARTIFACT.exists():
        fail(f"missing grants CASM artifact: {GRANTS_CASM_ARTIFACT}")

    output = run(
        [
            "starkli",
            "declare",
            "--account",
            env["STARKNET_ACCOUNT"],
            "--casm-file",
            str(GRANTS_CASM_ARTIFACT),
            str(GRANTS_ARTIFACT),
            "--watch",
        ],
        env,
    )
    return parse_hex(output)


def main() -> int:
    env = os.environ.copy()
    env.setdefault("STARKNET_RPC", DEFAULT_RPC)

    account_path = Path(require_env(env, "STARKNET_ACCOUNT"))
    require_env(env, "STARKNET_KEYSTORE")
    require_env(env, "STARKNET_KEYSTORE_PASSWORD")

    owner_admin = deployed_address(account_path)

    for class_hash in (
        VERIFIER_CLASS_HASH,
        BRIDGE_CLASS_HASH,
        ADAPTER_CLASS_HASH,
        SEMAPHORE_CLASS_HASH,
    ):
        ensure_class_declared(class_hash, env)

    grants_class_hash = declare_grants_class(env)

    bridge_addr = deploy(BRIDGE_CLASS_HASH, [VERIFIER_CLASS_HASH, VK_HASH], env)
    adapter_addr = deploy(ADAPTER_CLASS_HASH, [bridge_addr, VK_HASH], env)
    semaphore_addr = deploy(SEMAPHORE_CLASS_HASH, [owner_admin], env)
    grants_addr = deploy(grants_class_hash, [owner_admin, semaphore_addr, STRK_TOKEN], env)

    invoke(semaphore_addr, "set_verifier", [DEPTH, adapter_addr], env)
    invoke(
        grants_addr,
        "create_community",
        [COMMUNITY_NAME, owner_admin, DEPTH, QUORUM, YES_THRESHOLD_BPS, MAX_ASK_BPS],
        env,
    )
    invoke(grants_addr, "add_community_member", ["1", ROOT_VALUE], env)

    print("")
    print("Live grants demo ready")
    print(f"bridge={bridge_addr}")
    print(f"adapter={adapter_addr}")
    print(f"semaphore={semaphore_addr}")
    print(f"grants={grants_addr}")
    print("community_id=1")
    print("proposal_id_for_bundled_proof=1")
    print("")
    print("Frontend env:")
    print(f"VITE_GRANTS_ADDRESS={grants_addr}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
