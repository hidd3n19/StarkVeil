#!/usr/bin/env python3

from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
BACKEND_TESTS = ROOT / "starkveil_groth16_backend" / "tests"
VALID = BACKEND_TESTS / "point_22_valid_proof_calldata.txt"
INVALID_PROOF = BACKEND_TESTS / "point_29_invalid_proof_points_calldata.txt"
INVALID_PUBLIC_INPUTS = BACKEND_TESTS / "point_29_invalid_public_inputs_calldata.txt"


def mutate_hex_word(hex_word: str) -> str:
    return hex(int(hex_word, 16) + 1)


def main() -> int:
    values = VALID.read_text(encoding="utf-8").split()

    proof_values = list(values)
    proof_values[0] = mutate_hex_word(proof_values[0])
    INVALID_PROOF.write_text(" ".join(proof_values) + "\n", encoding="utf-8")

    public_input_values = list(values)
    public_input_values[33] = mutate_hex_word(public_input_values[33])
    INVALID_PUBLIC_INPUTS.write_text(" ".join(public_input_values) + "\n", encoding="utf-8")

    print("PASS: point 29 fixtures generated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
