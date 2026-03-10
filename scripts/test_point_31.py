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


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)


def run(command: list[str], cwd: Path, env: dict[str, str] | None = None) -> str:
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

    if result.returncode != 0:
        fail(f"command failed: {' '.join(command)}")

    return result.stdout


def write_point31_files() -> None:
    metadata = json.loads((TMP / "metadata.json").read_text(encoding="utf-8"))

    metadata_values = [
        hex(int(metadata["root"])),
        hex(int(metadata["nullifier"])),
        hex(int(metadata["message"])),
        hex(int(metadata["scope"])),
        hex(int(metadata["messageHash"])),
        hex(int(metadata["scopeHash"])),
        hex(int(metadata["rootU256"]["low"])),
        hex(int(metadata["rootU256"]["high"])),
        hex(int(metadata["nullifierU256"]["low"])),
        hex(int(metadata["nullifierU256"]["high"])),
        hex(int(metadata["messageHashU256"]["low"])),
        hex(int(metadata["messageHashU256"]["high"])),
        hex(int(metadata["scopeHashU256"]["low"])),
        hex(int(metadata["scopeHashU256"]["high"])),
    ]
    (E2E_ROOT / "tests" / "point_31_metadata.txt").write_text(
        "\n".join(metadata_values) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    env = os.environ.copy()
    path_parts = []
    preferred_tool_paths = [
        Path.home() / ".asdf/installs/starknet-foundry/0.53.0/bin",
        Path.home() / ".asdf/installs/scarb/2.14.0/bin",
        Path("/tmp/scarb-2.14.0/bin"),
        Path.home() / ".asdf/shims",
        Path.home() / ".local/bin",
    ]
    for path in preferred_tool_paths:
        if path.exists():
            path_parts.append(str(path))
    path_parts.append(env.get("PATH", ""))
    env["PATH"] = ":".join(part for part in path_parts if part)

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
    write_point31_files()

    run(["snforge", "test", "point_31_"], E2E_ROOT, env)
    print("PASS: runtime validation for implementation point 31 and testing point 31 is satisfied")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
