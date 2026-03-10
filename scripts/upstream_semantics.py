#!/usr/bin/env python3

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


_MASK_64 = (1 << 64) - 1
_ROUND_CONSTANTS = [
    0x0000000000000001,
    0x0000000000008082,
    0x800000000000808A,
    0x8000000080008000,
    0x000000000000808B,
    0x0000000080000001,
    0x8000000080008081,
    0x8000000000008009,
    0x000000000000008A,
    0x0000000000000088,
    0x0000000080008009,
    0x000000008000000A,
    0x000000008000808B,
    0x800000000000008B,
    0x8000000000008089,
    0x8000000000008003,
    0x8000000000008002,
    0x8000000000000080,
    0x000000000000800A,
    0x800000008000000A,
    0x8000000080008081,
    0x8000000000008080,
    0x0000000080000001,
    0x8000000080008008,
]
_ROTATION_OFFSETS = [
    [0, 36, 3, 41, 18],
    [1, 44, 10, 45, 2],
    [62, 6, 43, 15, 61],
    [28, 55, 25, 21, 56],
    [27, 20, 39, 8, 14],
]


@dataclass(frozen=True)
class PublicInputSemantics:
    message: int
    scope: int
    message_hash: int
    scope_hash: int
    verifier_public_inputs: list[int]


def _rotl64(value: int, shift: int) -> int:
    shift %= 64
    return ((value << shift) | (value >> (64 - shift))) & _MASK_64


def _keccak_f1600(state: list[int]) -> None:
    for round_constant in _ROUND_CONSTANTS:
        c = [state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20] for x in range(5)]
        d = [c[(x - 1) % 5] ^ _rotl64(c[(x + 1) % 5], 1) for x in range(5)]

        for x in range(5):
            for y in range(5):
                state[x + 5 * y] ^= d[x]

        b = [0] * 25
        for x in range(5):
            for y in range(5):
                b[y + 5 * ((2 * x + 3 * y) % 5)] = _rotl64(state[x + 5 * y], _ROTATION_OFFSETS[x][y])

        for x in range(5):
            for y in range(5):
                state[x + 5 * y] = b[x + 5 * y] ^ ((~b[((x + 1) % 5) + 5 * y]) & b[((x + 2) % 5) + 5 * y])

        state[0] ^= round_constant


def keccak256(data: bytes) -> bytes:
    rate_bytes = 136
    state = [0] * 25
    padded = bytearray(data)
    padded.append(0x01)
    while (len(padded) % rate_bytes) != rate_bytes - 1:
        padded.append(0x00)
    padded.append(0x80)

    for offset in range(0, len(padded), rate_bytes):
        block = padded[offset : offset + rate_bytes]
        for lane_index in range(rate_bytes // 8):
            lane = int.from_bytes(block[lane_index * 8 : (lane_index + 1) * 8], "little")
            state[lane_index] ^= lane
        _keccak_f1600(state)

    out = bytearray()
    while len(out) < 32:
        for lane in state[: rate_bytes // 8]:
            out.extend(lane.to_bytes(8, "little"))
            if len(out) >= 32:
                return bytes(out[:32])
        _keccak_f1600(state)

    return bytes(out[:32])


def encode_bytes32_string(value: str) -> int:
    encoded = value.encode("utf-8")
    if len(encoded) > 31:
        raise ValueError("string values must be at most 31 bytes to fit encodeBytes32String semantics")
    return int.from_bytes(encoded + b"\x00" + (b"\x00" * (31 - len(encoded))), "big")


def normalize_to_bigint(value: Any) -> int:
    if isinstance(value, bool):
        return int(value)

    if isinstance(value, int):
        if value < 0:
            raise ValueError("numeric values must be non-negative")
        return value

    if isinstance(value, (bytes, bytearray)):
        if len(value) > 32:
            raise ValueError("byte values must be at most 32 bytes")
        return int.from_bytes(bytes(value), "big")

    if isinstance(value, str):
        try:
            parsed = int(value, 0)
            if parsed < 0:
                raise ValueError("numeric string values must be non-negative")
            return parsed
        except ValueError:
            return encode_bytes32_string(value)

    raise TypeError(f"unsupported value type: {type(value)!r}")


def hash_to_field(value: Any) -> int:
    normalized = normalize_to_bigint(value)
    encoded = normalized.to_bytes(32, "big")
    return int.from_bytes(keccak256(encoded), "big") >> 8


def build_verifier_public_inputs(merkle_tree_root: Any, nullifier: Any, message: Any, scope: Any) -> list[int]:
    return [
        normalize_to_bigint(merkle_tree_root),
        normalize_to_bigint(nullifier),
        hash_to_field(message),
        hash_to_field(scope),
    ]


def compute_public_input_semantics(message: Any, scope: Any, merkle_tree_root: Any, nullifier: Any) -> PublicInputSemantics:
    normalized_message = normalize_to_bigint(message)
    normalized_scope = normalize_to_bigint(scope)

    return PublicInputSemantics(
        message=normalized_message,
        scope=normalized_scope,
        message_hash=hash_to_field(normalized_message),
        scope_hash=hash_to_field(normalized_scope),
        verifier_public_inputs=build_verifier_public_inputs(merkle_tree_root, nullifier, normalized_message, normalized_scope),
    )
