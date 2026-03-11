#!/usr/bin/env python3

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
TMP = ROOT / "scripts" / ".tmp_point_31"
E2E_ROOT = ROOT / "starkveil_e2e"

DEFAULT_RPC = "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/demo"

VERIFIER_CLASS_HASH = "0x0598d0f4685f333914064bfb4632b50432fce3679c3566625fb04cf6aa0bc345"
BRIDGE_CLASS_HASH = "0x03780dbe7ea61ea2cf56f227d6d945f02caa4aabc9cddd5bf822e5cb2d5342d9"
ADAPTER_CLASS_HASH = "0x02dc879df25e6f0b0b7a815addc0917109d5ceb3961632b3a68df87b8da4dbdf"
SEMAPHORE_CLASS_HASH = "0x07b08d53f31257f3a25c41987252fe7dffe9f723ccdef49dc42c81ffc41a69a1"

VK_HASH = "777"
GROUP_ID = "1"
DEPTH = "20"


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)


def run(command: list[str], cwd: Path, env: dict[str, str], check: bool = True) -> str:
    result = subprocess.run(
        command,
        cwd=cwd,
        env=env,
        text=True,
        capture_output=True,
        check=False,
    )

    if result.stdout:
        print(result.stdout, end="")
    if result.stderr:
        print(result.stderr, end="", file=sys.stderr)

    if check and result.returncode != 0:
        fail(f"command failed: {' '.join(command)}")

    return result.stdout


def require_env(env: dict[str, str], key: str) -> str:
    value = env.get(key)
    if not value:
        fail(f"missing required env var: {key}")
    return value


def account_address(account_path: Path) -> str:
    data = json.loads(account_path.read_text(encoding="utf-8"))
    deployment = data.get("deployment", {})
    address = deployment.get("address")
    if not address:
        fail(f"account file has no deployed address: {account_path}")
    return address


def ensure_metadata_and_calldata(env: dict[str, str]) -> tuple[dict[str, str], list[str]]:
    run(["node", "scripts/test_point_31_prepare.mjs"], ROOT, env)

    metadata = json.loads((TMP / "metadata.json").read_text(encoding="utf-8"))
    garaga_output = run(
        [
            "garaga",
            "calldata",
            "--system",
            "groth16",
            "--vk",
            metadata["vkPath"],
            "--proof",
            str(TMP / "proof.json"),
            "--public-inputs",
            str(TMP / "public.json"),
            "--format",
            "array",
        ],
        ROOT,
        env,
    )

    values = re.findall(r"0x[0-9a-fA-F]+|\d+", garaga_output)
    if not values:
        fail("garaga calldata generation returned no values")

    (E2E_ROOT / "tests" / "point_31_full_calldata.txt").write_text(
        "\n".join(values) + "\n",
        encoding="utf-8",
    )

    return metadata, values


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


def parse_address(output: str) -> str:
    matches = re.findall(r"0x[0-9a-fA-F]+", output)
    if not matches:
        fail("could not parse contract address from starkli output")
    return matches[-1]


def deploy(class_hash: str, ctor_args: list[str], env: dict[str, str]) -> str:
    output = run(
        ["starkli", "deploy", "--account", env["STARKNET_ACCOUNT"], class_hash, *ctor_args, "--watch"],
        ROOT,
        env,
    )
    return parse_address(output)


def invoke(contract: str, selector: str, args: list[str], env: dict[str, str]) -> None:
    run(
        ["starkli", "invoke", "--account", env["STARKNET_ACCOUNT"], contract, selector, *args, "--watch"],
        ROOT,
        env,
    )


def call(contract: str, selector: str, args: list[str], env: dict[str, str]) -> str:
    return run(["starkli", "call", contract, selector, *args, "--rpc", env["STARKNET_RPC"]], ROOT, env)


def parse_bool(output: str) -> bool:
    values = re.findall(r"0x[0-9a-fA-F]+|\d+", output)
    if not values:
        fail("could not parse boolean output")
    return int(values[0], 16 if values[0].startswith("0x") else 10) != 0


def main() -> int:
    env = os.environ.copy()
    helper_paths = [
        Path.home() / ".asdf/shims",
        Path.home() / ".local/bin",
    ]
    env["PATH"] = ":".join([*(str(path) for path in helper_paths if path.exists()), env.get("PATH", "")])

    env.setdefault("STARKNET_RPC", DEFAULT_RPC)

    account_path = Path(require_env(env, "STARKNET_ACCOUNT"))
    require_env(env, "STARKNET_KEYSTORE")
    require_env(env, "STARKNET_KEYSTORE_PASSWORD")
    owner_admin = account_address(account_path)

    for class_hash in (
        VERIFIER_CLASS_HASH,
        BRIDGE_CLASS_HASH,
        ADAPTER_CLASS_HASH,
        SEMAPHORE_CLASS_HASH,
    ):
        ensure_class_declared(class_hash, env)

    metadata, proof = ensure_metadata_and_calldata(env)

    bridge_addr = deploy(BRIDGE_CLASS_HASH, [VERIFIER_CLASS_HASH, VK_HASH], env)
    adapter_addr = deploy(ADAPTER_CLASS_HASH, [bridge_addr, VK_HASH], env)
    semaphore_addr = deploy(SEMAPHORE_CLASS_HASH, [owner_admin], env)

    invoke(semaphore_addr, "create_group", [GROUP_ID, owner_admin, DEPTH], env)
    invoke(semaphore_addr, "set_verifier", [DEPTH, adapter_addr], env)
    invoke(semaphore_addr, "add_member", [GROUP_ID, metadata["root"]], env)

    root_is_known = parse_bool(call(semaphore_addr, "is_root", [GROUP_ID, metadata["root"]], env))
    if not root_is_known:
        fail("expected proof root to be stored on chain after add_member")

    adapter_ok = parse_bool(
        call(
            adapter_addr,
            "verify",
            [
                "4",
                metadata["root"],
                metadata["nullifier"],
                metadata["messageHash"],
                metadata["scopeHash"],
                str(len(proof)),
                *proof,
            ],
            env,
        )
    )
    if not adapter_ok:
        fail("adapter verification returned false for the upstream proof")

    invoke(
        semaphore_addr,
        "validate_proof",
        [
            GROUP_ID,
            DEPTH,
            metadata["root"],
            metadata["nullifier"],
            metadata["message"],
            metadata["scope"],
            metadata["messageHash"],
            metadata["scopeHash"],
            str(len(proof)),
            *proof,
        ],
        env,
    )

    nullifier_used = parse_bool(call(semaphore_addr, "is_nullifier_used", [metadata["nullifier"]], env))
    if not nullifier_used:
        fail("nullifier was not marked used after validate_proof")

    print(f"PASS: live Sepolia point 31 verified via {semaphore_addr}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
