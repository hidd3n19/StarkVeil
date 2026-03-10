#!/usr/bin/env python3

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.error import HTTPError, URLError
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_MANIFEST = ROOT / "artifact-manifest.json"
EXPECTED_VERIFIER_ORDER = [
    "merkleTreeRoot",
    "nullifier",
    "messageHash",
    "scopeHash",
]


class ValidationError(Exception):
    pass


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_manifest(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as err:
        raise ValidationError(f"manifest not found: {path}") from err
    except json.JSONDecodeError as err:
        raise ValidationError(f"manifest is not valid JSON: {path}") from err


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValidationError(message)


def fetch_bytes(url: str) -> bytes:
    try:
        with urlopen(url, timeout=90) as response:
            return response.read()
    except (HTTPError, URLError) as err:
        raise ValidationError(f"failed to fetch artifact {url}: {err}") from err


def validate_semantics(manifest: dict) -> None:
    semantics = manifest.get("semantics")
    require(isinstance(semantics, dict), "manifest missing semantics block")

    verifier_inputs = semantics.get("verifier_public_inputs")
    require(
        verifier_inputs == EXPECTED_VERIFIER_ORDER,
        "manifest verifier public input order is incorrect",
    )

    hashing_rules = semantics.get("hashing_rules")
    require(isinstance(hashing_rules, dict), "manifest missing hashing rules")
    require(
        hashing_rules.get("message") == "hash(message) before verifier input packing",
        "manifest message hashing rule is incorrect",
    )
    require(
        hashing_rules.get("scope") == "hash(scope) before verifier input packing",
        "manifest scope hashing rule is incorrect",
    )


def validate_upstream_versions(manifest: dict) -> tuple[str, str]:
    upstream = manifest.get("upstream")
    require(isinstance(upstream, dict), "manifest missing upstream block")

    git_tag = upstream.get("git_tag")
    artifact_version = upstream.get("artifact_version")
    require(git_tag == "v4.13.0", "manifest git tag does not match pinned upstream tag")
    require(
        artifact_version == "4.13.0",
        "manifest artifact version does not match pinned upstream artifact version",
    )
    return git_tag, artifact_version


def validate_artifacts(manifest: dict, temp_dir: Path, git_tag: str, artifact_version: str) -> None:
    artifacts = manifest.get("artifacts")
    require(isinstance(artifacts, list) and artifacts, "manifest missing artifacts list")

    required_kinds = {"circuit_source", "wasm", "zkey", "verification_key"}
    found_kinds = set()

    for artifact in artifacts:
        require(isinstance(artifact, dict), "artifact entry must be an object")

        name = artifact.get("name")
        kind = artifact.get("kind")
        version = artifact.get("version")
        url = artifact.get("url")
        expected_hash = artifact.get("sha256")

        require(isinstance(name, str) and name, "artifact missing name")
        require(kind in required_kinds, f"artifact {name} has unsupported kind")
        require(isinstance(url, str) and url.startswith("https://"), f"artifact {name} has invalid url")
        require(
            isinstance(expected_hash, str) and len(expected_hash) == 64,
            f"artifact {name} has invalid sha256",
        )

        found_kinds.add(kind)

        if kind == "circuit_source":
            require(
                version == git_tag,
                f"artifact {name} does not use pinned git tag {git_tag}",
            )
            require(
                git_tag in url,
                f"artifact {name} url does not contain pinned git tag {git_tag}",
            )
        else:
            require(
                version == artifact_version,
                f"artifact {name} does not use pinned artifact version {artifact_version}",
            )
            require(
                f"/{artifact_version}/" in url,
                f"artifact {name} url does not contain pinned artifact version {artifact_version}",
            )

        data = fetch_bytes(url)
        downloaded_path = temp_dir / f"{name}.bin"
        downloaded_path.write_bytes(data)
        actual_hash = sha256_bytes(data)
        require(
            actual_hash == expected_hash,
            f"artifact {name} hash mismatch: expected {expected_hash}, got {actual_hash}",
        )

    require(found_kinds == required_kinds, "manifest does not cover all required artifact kinds")


def validate_manifest(path: Path) -> None:
    manifest = load_manifest(path)
    require(manifest.get("schema_version") == 1, "manifest schema_version must be 1")
    git_tag, artifact_version = validate_upstream_versions(manifest)
    validate_semantics(manifest)

    with TemporaryDirectory(prefix="starkveil-artifacts-") as temp_dir:
        validate_artifacts(manifest, Path(temp_dir), git_tag, artifact_version)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest", nargs="?", default=str(DEFAULT_MANIFEST))
    args = parser.parse_args()

    try:
        validate_manifest(Path(args.manifest).resolve())
    except ValidationError as err:
        print(f"FAIL: {err}")
        return 1

    print("PASS: artifact manifest is valid")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
