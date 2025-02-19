# Base component constants
from homeassistant.const import Platform

DOMAIN = "homewhiz"
PLATFORMS = [
    Platform.SELECT,
    Platform.SENSOR,
    Platform.CLIMATE,
    Platform.SWITCH,
    Platform.BINARY_SENSOR,
]

# Configuration
CONF_BT_RECONNECT_INTERVAL = "bt_reconnect_interval"
