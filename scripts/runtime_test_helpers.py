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


def run_snforge_filter(filter_name: str, point_label: str) -> int:
    env = os.environ.copy()
    path_parts = [
        str(Path.home() / ".asdf/shims"),
        str(Path.home() / ".local/bin"),
        env.get("PATH", ""),
    ]
    env["PATH"] = ":".join(part for part in path_parts if part)

    try:
        result = subprocess.run(
            ["snforge", "test", filter_name],
            cwd=ROOT,
            env=env,
            text=True,
            capture_output=True,
            check=False,
        )
    except FileNotFoundError as err:
        fail(f"snforge is not installed or not on PATH: {err}")

    if result.stdout:
        print(result.stdout, end="")
    if result.stderr:
        print(result.stderr, end="", file=sys.stderr)

    if result.returncode != 0:
        fail(f"runtime validation failed for {point_label}")

    print(f"PASS: runtime validation for {point_label} is satisfied")
    return 0
