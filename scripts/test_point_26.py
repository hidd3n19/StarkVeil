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


def main() -> int:
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
        ["snforge", "test", "point_26_"],
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
        fail("command failed: snforge test point_26_")

    print("PASS: runtime validation for implementation point 26 and testing point 26 is satisfied")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
