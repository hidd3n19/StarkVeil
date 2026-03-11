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


def run(command: list[str], cwd: Path, env: dict[str, str]) -> None:
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


def main() -> int:
    env = os.environ.copy()
    path_parts = []

    helper_paths = [
        Path.home() / ".asdf/shims",
        Path.home() / ".local/bin",
    ]

    for path in helper_paths:
        if path.exists():
            path_parts.append(str(path))

    path_parts.append(env.get("PATH", ""))
    env["PATH"] = ":".join(part for part in path_parts if part)

    run(["python3", "scripts/test_point_29_fixtures.py"], ROOT, env)
    run(["snforge", "test", "point_29_"], BACKEND_ROOT, env)
    print("PASS: runtime validation for implementation point 29 and testing point 29 is satisfied")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
