#!/usr/bin/env python3

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DEPLOYMENT_MANIFEST = ROOT / "deployment-manifest.json"
ARTIFACT_MANIFEST = ROOT / "artifact-manifest.json"


def main() -> int:
    deployment = json.loads(DEPLOYMENT_MANIFEST.read_text(encoding="utf-8"))
    artifact = json.loads(ARTIFACT_MANIFEST.read_text(encoding="utf-8"))

    assert deployment["schema_version"] == 1
    assert deployment["project"] == "starkveil-semaphore-port"
    assert deployment["deployment_flow"] == [
        "declare_backend",
        "deploy_backend",
        "declare_adapter",
        "deploy_adapter",
        "declare_semaphore",
        "deploy_semaphore",
        "create_group",
        "set_verifier",
    ]

    contracts = deployment["contracts"]
    assert contracts["backend"]["test_profile_class"] == "TestPublicInputAlignmentBackend"
    assert contracts["backend"]["production_profile_package"] == "starkveil_groth16_backend"
    assert contracts["backend"]["production_profile_class"] == "Groth16VerifierBN254"
    assert contracts["adapter"]["class"] == "Groth16VerifierAdapter"
    assert contracts["semaphore"]["class"] == "Semaphore"

    supported = deployment["supported_depths"]
    assert len(supported) >= 1
    depth20 = next(item for item in supported if item["depth"] == 20)
    assert depth20["vk_hash"] == "777"
    assert depth20["test_backend_profile"] == "alignment-test-backend"

    verification_key_names = {
        entry["name"] for entry in artifact["artifacts"] if entry["kind"] == "verification_key"
    }
    _, artifact_name = depth20["verification_key_artifact"].split(":", 1)
    assert artifact_name in verification_key_names

    print("PASS: deployment manifest is valid")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
