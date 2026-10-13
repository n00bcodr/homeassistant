"""Constants and wire-protocol data for the Govee H713B heater integration.

The login flow, AWS IoT topic scheme and the "multiSync" command bytes below
are reverse-engineered protocol details.

Command tables below are ported from homebridge-govee's lib/device/heater2.js
**as it stood in v9.4.2** (https://github.com/homebridge-plugins/homebridge-govee,
tag v9.4.2), not the current release. From v10.0.0 onward that plugin
reclassified the H713B into a different device family ("heater1") with no
light, no swing and only 3 fixed fan speeds - but on this unit the original
"heater2" commands (RGB night light, oscillation, fan-only/low/medium/high)
are what actually work, so that's what this integration ports.
"""
from __future__ import annotations

DOMAIN = "govee_h713b"

MODEL = "H713B"

# --- Govee cloud endpoints (same ones the homebridge plugin talks to) ---
LOGIN_URL = "https://app2.govee.com/account/rest/account/v2/login"
VERIFY_URL = "https://app2.govee.com/account/rest/account/v1/verification"
IOT_KEY_URL = "https://app2.govee.com/app/v1/account/iot/key"
DEVICE_LIST_URL = "https://app2.govee.com/bff-app/v1/device/list"

APP_VERSION = "7.4.10"
USER_AGENT = f"GoveeHome/{APP_VERSION} (com.ihoment.GoVeeSensor; build:8; iOS 26.5.0) Alamofire/5.11.0"

# --- Config entry keys ---
CONF_CLIENT_ID = "client_id"
CONF_DEVICE_ID = "device_id"
CONF_DEVICE_NAME = "device_name"
CONF_AWS_TOPIC = "aws_topic"

# Default AWS status-request cmdVersion (matches the plugin's default; only a
# couple of unrelated models need a different value).
AWS_STATUS_CMD_VERSION = 2

# Target temperature range, matching what the Govee app allows for this heater.
MIN_TEMP = 5
MAX_TEMP = 30

# --- "multiSync" command bytes, ported from homebridge-govee v9.4.2's heater2.js ---

# Power state.
POWER_ON_CODE = "MwEBAAAAAAAAAAAAAAAAAAAAADM="
POWER_OFF_CODE = "MwEAAAAAAAAAAAAAAAAAAAAAADI="

# Target temperature 5-30C while already in Auto mode.
TEMP_CODE_AUTO: dict[int, str] = {
    5: "MwUDAZAEAAAAAAAAAAAAAAAAAKA=",
    6: "MwUDAZBoAAAAAAAAAAAAAAAAAMw=",
    7: "MwUDAZEwAAAAAAAAAAAAAAAAAJU=",
    8: "MwUDAZH4AAAAAAAAAAAAAAAAAF0=",
    9: "MwUDAZLAAAAAAAAAAAAAAAAAAGY=",
    10: "MwUDAZOIAAAAAAAAAAAAAAAAAC8=",
    11: "MwUDAZPsAAAAAAAAAAAAAAAAAEs=",
    12: "MwUDAZS0AAAAAAAAAAAAAAAAABQ=",
    13: "MwUDAZV8AAAAAAAAAAAAAAAAAN0=",
    14: "MwUDAZZEAAAAAAAAAAAAAAAAAOY=",
    15: "MwUDAZcMAAAAAAAAAAAAAAAAAK8=",
    16: "MwUDAZdwAAAAAAAAAAAAAAAAANM=",
    17: "MwUDAZg4AAAAAAAAAAAAAAAAAJQ=",
    18: "MwUDAZkAAAAAAAAAAAAAAAAAAK0=",
    19: "MwUDAZnIAAAAAAAAAAAAAAAAAGU=",
    20: "MwUDAZqQAAAAAAAAAAAAAAAAAD4=",
    21: "MwUDAZr0AAAAAAAAAAAAAAAAAFo=",
    22: "MwUDAZu8AAAAAAAAAAAAAAAAABM=",
    23: "MwUDAZyEAAAAAAAAAAAAAAAAACw=",
    24: "MwUDAZ1MAAAAAAAAAAAAAAAAAOU=",
    25: "MwUDAZ4UAAAAAAAAAAAAAAAAAL4=",
    26: "MwUDAZ54AAAAAAAAAAAAAAAAANI=",
    27: "MwUDAZ9AAAAAAAAAAAAAAAAAAOs=",
    28: "MwUDAaAIAAAAAAAAAAAAAAAAAJw=",
    29: "MwUDAaDQAAAAAAAAAAAAAAAAAEQ=",
    30: "MwUDAaGYAAAAAAAAAAAAAAAAAA0=",
}

# Target temperature 5-30C, switching INTO Auto mode from something else
# (turns the heater into Auto and sets the temperature in the same command).
TEMP_CODE_AUTO_TURN: dict[int, str] = {
    5: "OgUDAZAEAAAAAAAAAAAAAAAAAKk=",
    6: "OgUDAZBoAAAAAAAAAAAAAAAAAMU=",
    7: "OgUDAZEwAAAAAAAAAAAAAAAAAJw=",
    8: "OgUDAZH4AAAAAAAAAAAAAAAAAFQ=",
    9: "OgUDAZLAAAAAAAAAAAAAAAAAAG8=",
    10: "OgUDAZOIAAAAAAAAAAAAAAAAACY=",
    11: "OgUDAZPsAAAAAAAAAAAAAAAAAEI=",
    12: "OgUDAZS0AAAAAAAAAAAAAAAAAB0=",
    13: "OgUDAZV8AAAAAAAAAAAAAAAAANQ=",
    14: "OgUDAZZEAAAAAAAAAAAAAAAAAO8=",
    15: "OgUDAZcMAAAAAAAAAAAAAAAAAKY=",
    16: "OgUDAZdwAAAAAAAAAAAAAAAAANo=",
    17: "OgUDAZg4AAAAAAAAAAAAAAAAAJ0=",
    18: "OgUDAZkAAAAAAAAAAAAAAAAAAKQ=",
    19: "OgUDAZnIAAAAAAAAAAAAAAAAAGw=",
    20: "OgUDAZqQAAAAAAAAAAAAAAAAADc=",
    21: "OgUDAZr0AAAAAAAAAAAAAAAAAFM=",
    22: "OgUDAZu8AAAAAAAAAAAAAAAAABo=",
    23: "OgUDAZyEAAAAAAAAAAAAAAAAACU=",
    24: "OgUDAZ1MAAAAAAAAAAAAAAAAAOw=",
    25: "OgUDAZ4UAAAAAAAAAAAAAAAAALc=",
    26: "OgUDAZ54AAAAAAAAAAAAAAAAANs=",
    27: "OgUDAZ9AAAAAAAAAAAAAAAAAAOI=",
    28: "OgUDAaAIAAAAAAAAAAAAAAAAAJU=",
    29: "OgUDAaDQAAAAAAAAAAAAAAAAAE0=",
    30: "OgUDAaGYAAAAAAAAAAAAAAAAAAQ=",
}

# Fixed fan/heat-output speeds: 25% is fan-only (no heat), the rest are Heat
# mode at low/medium/high fixed output (no target temperature in this mode).
SPEED_CODE: dict[int, str] = {
    25: "OgUJAAAAAAAAAAAAAAAAAAAAADY=",
    50: "OgUBAQAAAAAAAAAAAAAAAAAAAD8=",
    75: "OgUBAgAAAAAAAAAAAAAAAAAAADw=",
    100: "OgUBAwAAAAAAAAAAAAAAAAAAAD0=",
}
SPEED_LABEL: dict[int, str] = {25: "fan_only", 50: "low", 75: "medium", 100: "high"}
LABEL_SPEED: dict[str, int] = {v: k for k, v in SPEED_LABEL.items()}

# Oscillation.
SWING_ON_CODE = "Mx8BAQAAAAAAAAAAAAAAAAAAACw="
SWING_OFF_CODE = "Mx8BAAAAAAAAAAAAAAAAAAAAAC0="

# Child lock (not exposed as an entity yet, kept for parity/future use).
LOCK_ON_CODE = "Mx8CAQAAAAAAAAAAAAAAAAAAAC8="
LOCK_OFF_CODE = "Mx8CAAAAAAAAAAAAAAAAAAAAAC4="

# Night light command prefixes - the rest of the payload (on/off flag,
# brightness 0-100, or r/g/b) is filled in and checksummed at send time,
# see protocol.py.
LIGHT_POWER_PREFIX = (0x3A, 0x1B, 0x01, 0x01)
LIGHT_BRIGHTNESS_PREFIX = (0x3A, 0x1B, 0x01, 0x02)
LIGHT_COLOR_PREFIX = (0x3A, 0x1B, 0x05, 0x0D)

SERVICE_SEND_RAW_COMMAND = "send_raw_command"
ATTR_CODE = "code"
