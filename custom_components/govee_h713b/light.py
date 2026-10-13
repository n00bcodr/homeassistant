"""The H713B's night light, as an RGB + brightness light entity.

Command bytes ported from homebridge-govee v9.4.2's heater2.js, which is
what this heater's light actually responds to (see const.py for why the
current upstream plugin doesn't have this anymore).
"""
from __future__ import annotations

import colorsys

from homeassistant.components.light import ATTR_BRIGHTNESS, ATTR_HS_COLOR, ColorMode, LightEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import GoveeHeaterHub
from .const import DOMAIN, MODEL


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    hub: GoveeHeaterHub = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([GoveeHeaterDisplayLight(hub)])


class GoveeHeaterDisplayLight(LightEntity):
    _attr_has_entity_name = True
    _attr_translation_key = "night_light"
    _attr_color_mode = ColorMode.HS
    _attr_supported_color_modes = {ColorMode.HS}
    _attr_assumed_state = True

    def __init__(self, hub: GoveeHeaterHub) -> None:
        self._hub = hub
        self._attr_unique_id = f"{hub.device_id}_night_light"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, hub.device_id)},
            name=hub.device_name,
            manufacturer="Govee",
            model=MODEL,
        )

    async def async_added_to_hass(self) -> None:
        self._hub.add_listener(self._on_hub_update)

    async def async_will_remove_from_hass(self) -> None:
        self._hub.remove_listener(self._on_hub_update)

    def _on_hub_update(self) -> None:
        self.async_write_ha_state()

    @property
    def is_on(self) -> bool | None:
        return self._hub.state.get("light_on")

    @property
    def brightness(self) -> int | None:
        pct = self._hub.state.get("light_brightness")
        return None if pct is None else round(pct * 255 / 100)

    @property
    def hs_color(self) -> tuple[float, float] | None:
        return self._hub.state.get("light_hs")

    async def async_turn_on(self, **kwargs) -> None:
        if not self._hub.state.get("light_on"):
            await self._hub.async_set_light_power(True)

        if ATTR_HS_COLOR in kwargs:
            hue, sat = kwargs[ATTR_HS_COLOR]
            r, g, b = (round(c * 255) for c in colorsys.hsv_to_rgb(hue / 360, sat / 100, 1))
            await self._hub.async_set_light_color(r, g, b)
            self._hub.state["light_hs"] = (hue, sat)

        if ATTR_BRIGHTNESS in kwargs:
            percent = round(kwargs[ATTR_BRIGHTNESS] * 100 / 255)
            await self._hub.async_set_light_brightness(percent)

        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs) -> None:
        await self._hub.async_set_light_power(False)
        self.async_write_ha_state()
