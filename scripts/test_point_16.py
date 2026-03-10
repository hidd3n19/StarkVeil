#!/usr/bin/env python3

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from runtime_test_helpers import run_snforge_filter


ROOT = Path(__file__).resolve().parent.parent


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)


def run_node_validation() -> None:
    result = subprocess.run(
        ["node", "scripts/test_point_16.mjs"],
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
        fail("off-chain join payload validation failed for implementation point 16 and testing point 16")


if __name__ == "__main__":
    run_node_validation()
    raise SystemExit(run_snforge_filter("point_16_", "implementation point 16 and testing point 16"))
