#!/usr/bin/env python3

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
ACCOUNT_DEFAULT_RPC = "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/demo"
BRIDGE_CLASS_HASH = "0x03780dbe7ea61ea2cf56f227d6d945f02caa4aabc9cddd5bf822e5cb2d5342d9"
ADAPTER_CLASS_HASH = "0x02dc879df25e6f0b0b7a815addc0917109d5ceb3961632b3a68df87b8da4dbdf"
SEMAPHORE_CLASS_HASH = "0x07b08d53f31257f3a25c41987252fe7dffe9f723ccdef49dc42c81ffc41a69a1"
VERIFIER_CLASS_HASH = "0x0598d0f4685f333914064bfb4632b50432fce3679c3566625fb04cf6aa0bc345"
VK_HASH = "777"
GROUP_ID = "1"
DEPTH = "20"
ROOT_VALUE = "1915826951860152537973846421180435708428200415375148218822513943503006881772"


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


def parse_address(output: str) -> str:
    import re

    matches = re.findall(r"0x[0-9a-fA-F]+", output)
    if not matches:
        fail("could not parse contract address from starkli output")
    return matches[-1]


def deploy(class_hash: str, ctor_args: list[str], env: dict[str, str]) -> str:
    output = run(
        ["starkli", "deploy", "--account", env["STARKNET_ACCOUNT"], class_hash, *ctor_args, "--watch"],
        env,
    )
    return parse_address(output)


def invoke(contract: str, selector: str, args: list[str], env: dict[str, str]) -> None:
    run(
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


def main() -> int:
    env = os.environ.copy()
    env.setdefault("STARKNET_RPC", ACCOUNT_DEFAULT_RPC)

    account_path = Path(require_env(env, "STARKNET_ACCOUNT"))
    require_env(env, "STARKNET_KEYSTORE")
    require_env(env, "STARKNET_KEYSTORE_PASSWORD")

    owner_admin = deployed_address(account_path)

    bridge_addr = deploy(BRIDGE_CLASS_HASH, [VERIFIER_CLASS_HASH, VK_HASH], env)
    adapter_addr = deploy(ADAPTER_CLASS_HASH, [bridge_addr, VK_HASH], env)
    semaphore_addr = deploy(SEMAPHORE_CLASS_HASH, [owner_admin], env)

    invoke(semaphore_addr, "create_group", [GROUP_ID, owner_admin, DEPTH], env)
    invoke(semaphore_addr, "set_verifier", [DEPTH, adapter_addr], env)
    invoke(semaphore_addr, "add_member", [GROUP_ID, ROOT_VALUE], env)

    print("")
    print("Demo stack ready")
    print(f"bridge={bridge_addr}")
    print(f"adapter={adapter_addr}")
    print(f"semaphore={semaphore_addr}")
    print(f"group_id={GROUP_ID}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
