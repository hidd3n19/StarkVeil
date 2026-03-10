#!/usr/bin/env python3

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory


ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "artifact-manifest.json"
VALIDATOR = ROOT / "scripts/validate_artifact_manifest.py"


def run_validator(manifest_path: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(VALIDATOR), str(manifest_path)],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)


def main() -> int:
    good_run = run_validator(MANIFEST)
    if good_run.returncode != 0:
        fail(f"validator rejected the real manifest:\n{good_run.stdout}{good_run.stderr}")

    with TemporaryDirectory(prefix="starkveil-manifest-test-") as temp_dir:
        temp_dir_path = Path(temp_dir)
        tampered_manifest = temp_dir_path / "artifact-manifest-tampered.json"

        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        manifest["artifacts"][1]["sha256"] = "0" * 64
        tampered_manifest.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

        bad_run = run_validator(tampered_manifest)
        if bad_run.returncode == 0:
            fail("validator accepted a tampered manifest")

    print("PASS: artifact validation for implementation point 2 and testing point 2 is satisfied")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
