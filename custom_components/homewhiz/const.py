# Base component constants
from homeassistant.const import Platform

DOMAIN = "homewhiz"
PLATFORMS = [
    Platform.SELECT,
    Platform.SENSOR,
    Platform.NUMBER,
    Platform.CLIMATE,
    Platform.SWITCH,
    Platform.BINARY_SENSOR,
]

# Configuration
CONF_BT_RECONNECT_INTERVAL = "bt_reconnect_interval"

# Seconds to keep the last known values (and entities available) after a
# Bluetooth disconnect. 0 = go unavailable immediately.
CONF_BT_GRACE_PERIOD = "bt_grace_period"
DEFAULT_BT_GRACE_PERIOD = 180
# Seconds between "request state" writes while connected. 0 = off.
CONF_BT_KEEPALIVE_INTERVAL = "bt_keepalive_interval"
