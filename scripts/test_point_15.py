#!/usr/bin/env python3

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)


def main() -> int:
    result = subprocess.run(
        ["node", "scripts/test_point_15.mjs"],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )

    if result.stdout:
        print(result.stdout, end="")
    if result.stderr:
        print(result.stderr, end="", file=sys.stderr)

    if result.returncode != 0:
        fail("runtime group validation failed for implementation point 15 and testing point 15")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
