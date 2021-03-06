import logging

from homeassistant.const import (
    ATTR_CONFIGURATION_URL,
    ATTR_IDENTIFIERS,
    ATTR_MANUFACTURER,
    ATTR_MODEL,
    ATTR_NAME,
)
from homeassistant.helpers.device_registry import async_get

from ..helpers.const import *
from ..managers.HPDeviceData import HPDeviceData

_LOGGER = logging.getLogger(__name__)


class DeviceManager:
    def __init__(self, hass, ha):
        self._hass = hass
        self._ha = ha

        self._devices = {}

    @property
    def data_manager(self) -> HPDeviceData:
        return self._ha.data_manager

    @property
    def data(self):
        return self.data_manager.device_data

    @property
    def name(self):
        return self.data_manager.name

    async def async_remove_entry(self, entry_id):
        dr = async_get(self._hass)
        dr.async_clear_config_entry(entry_id)

    async def delete_device(self, name):
        _LOGGER.info(f"Deleting device {name}")

        device = self._devices[name]

        device_identifiers = device.get("identifiers")
        device_connections = device.get("connections", {})

        dr = async_get(self._hass)

        device = dr.async_get_device(device_identifiers, device_connections)

        if device is not None:
            dr.async_remove_device(device.id)

    async def async_remove(self):
        for device_name in self._devices:
            await self.delete_device(device_name)

    def get(self, name):
        return self._devices.get(name, {})

    def set(self, name, device_info):
        self._devices[name] = device_info

    def update(self):
        self.generate_device_info()

    def generate_device_info(self):
        device_model = self.data.get(ENTITY_MODEL, self.name)
        device_model_family = self.data.get(ENTITY_MODEL_FAMILY, self.name)

        device_id = f"{DEFAULT_NAME}-{self.name}-{device_model_family}"

        device_info = {
            ATTR_IDENTIFIERS: {(DOMAIN, device_id)},
            ATTR_NAME: device_model_family,
            ATTR_MANUFACTURER: MANUFACTURER,
            ATTR_MODEL: device_model,
        }

        if self.data_manager.device_data[HP_DEVICE_IS_ONLINE]:
            device_info[
                ATTR_CONFIGURATION_URL
            ] = f"{PROTOCOLS[self.data_manager.config_data.ssl]}://{self.data_manager.config_data.host}"

        self.set(DEFAULT_NAME, device_info)
