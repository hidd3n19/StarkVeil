#!/usr/bin/env python3

from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent.parent
DOC = ROOT / "upstream-source-of-truth.md"
PACKAGE_JSON = ROOT / "package.json"
ARTIFACT_MANIFEST = ROOT / "artifact-manifest.json"
SCAN_DIRS = [
    ROOT / "src",
    ROOT / "scripts",
    ROOT / "offchain",
]

PINNED_GIT_TAG = "v4.13.0"
PINNED_ARTIFACT_VERSION = "4.13.0"
EXPECTED_URLS = [
    "https://raw.githubusercontent.com/semaphore-protocol/semaphore/v4.13.0/packages/circuits/src/semaphore.circom",
    "https://snark-artifacts.pse.dev/semaphore/4.13.0/semaphore-20.wasm",
    "https://snark-artifacts.pse.dev/semaphore/4.13.0/semaphore-20.zkey",
    "https://snark-artifacts.pse.dev/semaphore/4.13.0/semaphore-20.json",
]


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)


def ensure_file(path: Path) -> str:
    if not path.exists():
        fail(f"missing required file: {path}")
    return path.read_text(encoding="utf-8")


def fetch_ok(url: str) -> None:
    request = Request(url, method="HEAD")
    try:
        with urlopen(request, timeout=20) as response:
            status = getattr(response, "status", 200)
            if status >= 400:
                fail(f"url returned bad status {status}: {url}")
            return
    except HTTPError as err:
        if err.code == 405:
            pass
        else:
            fail(f"url returned http error {err.code}: {url}")
    except URLError as err:
        fail(f"url could not be reached: {url} ({err})")

    get_request = Request(url, method="GET")
    try:
        with urlopen(get_request, timeout=20) as response:
            status = getattr(response, "status", 200)
            if status >= 400:
                fail(f"url returned bad status {status}: {url}")
    except (HTTPError, URLError) as err:
        fail(f"url could not be fetched: {url} ({err})")


def require_contains(text: str, needle: str, context: str) -> None:
    if needle not in text:
        fail(f"{context} does not contain expected value: {needle}")


def check_doc() -> None:
    text = ensure_file(DOC)
    require_contains(text, PINNED_GIT_TAG, str(DOC))
    require_contains(text, PINNED_ARTIFACT_VERSION, str(DOC))
    for url in EXPECTED_URLS:
        require_contains(text, url, str(DOC))


def check_local_alignment() -> None:
    package_text = ensure_file(PACKAGE_JSON)
    manifest_text = ensure_file(ARTIFACT_MANIFEST)

    require_contains(package_text, '"@semaphore-protocol/group": "4.13.0"', str(PACKAGE_JSON))
    require_contains(package_text, '"@semaphore-protocol/identity": "4.13.0"', str(PACKAGE_JSON))
    require_contains(manifest_text, '"git_tag": "v4.13.0"', str(ARTIFACT_MANIFEST))
    require_contains(manifest_text, '"artifact_version": "4.13.0"', str(ARTIFACT_MANIFEST))


def check_remote_alignment() -> None:
    for url in EXPECTED_URLS:
        fetch_ok(url)


def scan_for_legacy_circuit_misuse() -> None:
    offenders: list[Path] = []
    skip_paths = {
        DOC.resolve(),
        Path(__file__).resolve(),
    }

    for scan_dir in SCAN_DIRS:
        if not scan_dir.exists():
            continue
        for path in scan_dir.rglob("*"):
            if not path.is_file():
                continue
            if path.resolve() in skip_paths:
                continue
            if path.suffix not in {".cairo", ".py", ".sh", ".ts", ".md", ".json"}:
                continue
            text = path.read_text(encoding="utf-8", errors="ignore")
            if "circuits/semaphore.circom" in text:
                offenders.append(path)

    if offenders:
        fail(
            "legacy local circuit referenced in upstream-compatible path: "
            + ", ".join(str(path) for path in offenders)
        )


def main() -> None:
    check_doc()
    check_local_alignment()
    check_remote_alignment()
    scan_for_legacy_circuit_misuse()
    print("PASS: mixed artifact/source validation for implementation point 1 and testing point 1 is satisfied")


if __name__ == "__main__":
    main()
