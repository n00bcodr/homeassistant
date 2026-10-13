"""Dynamic "multiSync" command bytes and status-code decoding.

The fixed-value commands (power, temperature steps, fan speeds, swing) are
just literal tables in const.py, copied straight from the plugin. Light
brightness and colour take arbitrary values, so those are built here the same
way homebridge-govee's generateCodeFromHexValues() does: pack the bytes, pad
to 19 with zeros, then XOR-checksum the whole thing as the 20th byte.
"""
from __future__ import annotations

import base64
from typing import Any

from .const import (
    LIGHT_BRIGHTNESS_PREFIX,
    LIGHT_COLOR_PREFIX,
    LIGHT_POWER_PREFIX,
)


def generate_multisync_code(hex_values: list[int]) -> str:
    if len(hex_values) > 19:
        raise ValueError("Command is longer than a packet allows")
    body = bytearray(hex_values)
    body.extend([0] * (19 - len(body)))
    checksum = 0
    for byte in body:
        checksum ^= byte
    body.append(checksum)
    return base64.b64encode(bytes(body)).decode()


def light_power_code(on: bool) -> str:
    return generate_multisync_code([*LIGHT_POWER_PREFIX, 0x01 if on else 0x00])


def light_brightness_code(percent: int) -> str:
    percent = max(0, min(100, round(percent)))
    return generate_multisync_code([*LIGHT_BRIGHTNESS_PREFIX, percent])


def light_color_code(red: int, green: int, blue: int) -> str:
    return generate_multisync_code([*LIGHT_COLOR_PREFIX, red, green, blue])


def _rgb_to_hs(red: int, green: int, blue: int) -> tuple[float, float]:
    r, g, b = red / 255, green / 255, blue / 255
    max_c, min_c = max(r, g, b), min(r, g, b)
    diff = max_c - min_c

    if diff == 0:
        hue = 0.0
    elif max_c == r:
        hue = (60 * ((g - b) / diff) + 360) % 360
    elif max_c == g:
        hue = (60 * ((b - r) / diff) + 120) % 360
    else:
        hue = (60 * ((r - g) / diff) + 240) % 360

    sat = 0.0 if max_c == 0 else (diff / max_c) * 100
    return round(hue, 1), round(sat, 1)


def decode_status_codes(commands: list[str]) -> dict[str, Any]:
    """Decode the base64 `aa`-prefixed status codes the heater pushes back.

    Mirrors homebridge-govee v9.4.2's heater2.js externalUpdate() switch on
    hex bytes 2-3. Only a status push includes these (not every AWS message),
    so an empty dict back just means nothing recognised was in this batch.
    """
    updates: dict[str, Any] = {}

    for command in commands:
        try:
            raw = base64.b64decode(command)
        except (ValueError, TypeError):
            continue
        if len(raw) < 5 or raw[0] != 0xAA:
            continue

        function = (raw[1], raw[2])

        if function == (0x1B, 0x01):
            updates["light_on"] = raw[3] == 0x01
            updates["light_brightness"] = raw[4]
        elif function == (0x1B, 0x05) and len(raw) >= 8:
            updates["light_hs"] = _rgb_to_hs(raw[4], raw[5], raw[6])
        elif raw[1] == 0x1F and raw[2] in (0x00, 0x01):
            updates["swing"] = raw[2] == 0x01
            if len(raw) >= 4:
                updates["lock"] = raw[3] == 0x01
        elif function == (0x05, 0x09):
            updates["mode"] = "fan_only"
            updates["speed"] = 25
        elif function == (0x05, 0x01) and len(raw) >= 4:
            speed = {0x01: 50, 0x02: 75, 0x03: 100}.get(raw[3])
            if speed:
                updates["mode"] = "heat"
                updates["speed"] = speed
        elif function == (0x05, 0x03):
            updates["mode"] = "auto"

    return updates
