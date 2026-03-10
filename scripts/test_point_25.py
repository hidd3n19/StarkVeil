#!/usr/bin/env python3

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)


def run(command: list[str], cwd: Path) -> None:
    env = os.environ.copy()
    env["PATH"] = ":".join(
        part
        for part in [
            str(Path.home() / ".asdf/shims"),
            str(Path.home() / ".local/bin"),
            env.get("PATH", ""),
        ]
        if part
    )

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
    run(["node", "scripts/test_point_25_fixture.mjs"], ROOT)
    run(["snforge", "test", "point_25_"], ROOT)
    print("PASS: runtime validation for implementation point 25 and testing point 25 is satisfied")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
