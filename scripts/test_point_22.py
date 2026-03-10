#!/usr/bin/env python3

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
BACKEND_ROOT = ROOT / "starkveil_groth16_backend"


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)


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

    result = subprocess.run(
        ["snforge", "test", "point_22_"],
        cwd=BACKEND_ROOT,
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
        fail("runtime validation failed for implementation point 22 and testing point 22")

    print("PASS: runtime validation for implementation point 22 and testing point 22 is satisfied")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
