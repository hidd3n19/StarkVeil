#!/usr/bin/env python3

from __future__ import annotations

import json
import sys
from pathlib import Path

from upstream_semantics import (
    build_verifier_public_inputs,
    compute_public_input_semantics,
    encode_bytes32_string,
    hash_to_field,
    normalize_to_bigint,
)


ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "artifact-manifest.json"

EXPECTED_MESSAGE_NUM_HASH = 150906799200079657633910150837990539630288351676905758157641815742042400788
EXPECTED_SCOPE_NUM_HASH = 248897036173242332360694606720876884358516153651049121320063493420254535521
EXPECTED_MESSAGE_STR_HASH = 8665846418922331996225934941481656421248110469944536651334918563951783029
EXPECTED_SCOPE_STR_HASH = 170164770795872309789133717676167925425155944778337387941930839678899666300


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)


def main() -> int:
    if normalize_to_bigint(123) != 123:
        fail("numeric normalization is incorrect")

    if normalize_to_bigint("456") != 456:
        fail("numeric string normalization is incorrect")

    expected_message_string = 32745724963520510550185023804391900974863477733501474067656557556163468591104
    expected_scope_string = 37717653415819232215590989865455204849443869931268328771929128739472152723456

    if encode_bytes32_string("Hello world") != expected_message_string:
        fail("bytes32 string encoding for message is incorrect")

    if normalize_to_bigint("Hello world") != expected_message_string:
        fail("string normalization for message is incorrect")

    if normalize_to_bigint("Scope") != expected_scope_string:
        fail("string normalization for scope is incorrect")

    if hash_to_field(123) != EXPECTED_MESSAGE_NUM_HASH:
        fail("numeric message hash is incorrect")

    if hash_to_field(456) != EXPECTED_SCOPE_NUM_HASH:
        fail("numeric scope hash is incorrect")

    if hash_to_field("Hello world") != EXPECTED_MESSAGE_STR_HASH:
        fail("string message hash is incorrect")

    if hash_to_field("Scope") != EXPECTED_SCOPE_STR_HASH:
        fail("string scope hash is incorrect")

    root = 12345678901234567890
    nullifier = 98765432109876543210
    expected_verifier_inputs = [
        root,
        nullifier,
        EXPECTED_MESSAGE_NUM_HASH,
        EXPECTED_SCOPE_NUM_HASH,
    ]

    verifier_inputs = build_verifier_public_inputs(root, nullifier, 123, 456)
    if verifier_inputs != expected_verifier_inputs:
        fail(f"verifier public input ordering is incorrect: {verifier_inputs}")

    semantics = compute_public_input_semantics(123, 456, root, nullifier)
    if semantics.verifier_public_inputs != expected_verifier_inputs:
        fail("computed public semantics do not match expected verifier inputs")

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    expected_manifest_order = ["merkleTreeRoot", "nullifier", "messageHash", "scopeHash"]
    if manifest["semantics"]["verifier_public_inputs"] != expected_manifest_order:
        fail("artifact manifest verifier public input order does not match point 3 semantics")

    expected_message_rule = "hash(message) before verifier input packing"
    expected_scope_rule = "hash(scope) before verifier input packing"
    if manifest["semantics"]["hashing_rules"]["message"] != expected_message_rule:
        fail("artifact manifest message hashing rule does not match point 3 semantics")
    if manifest["semantics"]["hashing_rules"]["scope"] != expected_scope_rule:
        fail("artifact manifest scope hashing rule does not match point 3 semantics")

    print("PASS: semantics validation for implementation point 3 and testing point 3 is satisfied")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
