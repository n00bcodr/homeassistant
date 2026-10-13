"""Climate entity for the Govee H713B heater.

Modelled on the verified v9.4.2 "heater2" behaviour for this unit:
- Auto: thermostatic, driven by a target temperature (5-30C)
- Heat: fixed output at low/medium/high (no target temperature)
- Fan only: blows air with no heat
- Off
Plus oscillation (swing).
"""
from __future__ import annotations

from homeassistant.components.climate import (
    ClimateEntity,
    ClimateEntityFeature,
    HVACMode,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_TEMPERATURE, UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import GoveeHeaterHub
from .const import DOMAIN, LABEL_SPEED, MAX_TEMP, MIN_TEMP, MODEL

FAN_MODES = ["low", "medium", "high"]
SWING_MODES = ["off", "on"]


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    hub: GoveeHeaterHub = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([GoveeHeaterClimate(hub)])


class GoveeHeaterClimate(ClimateEntity):
    _attr_has_entity_name = True
    _attr_name = None
    _attr_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_min_temp = MIN_TEMP
    _attr_max_temp = MAX_TEMP
    _attr_target_temperature_step = 1
    _attr_hvac_modes = [HVACMode.OFF, HVACMode.AUTO, HVACMode.HEAT, HVACMode.FAN_ONLY]
    _attr_fan_modes = FAN_MODES
    _attr_swing_modes = SWING_MODES
    _attr_supported_features = (
        ClimateEntityFeature.TARGET_TEMPERATURE
        | ClimateEntityFeature.FAN_MODE
        | ClimateEntityFeature.SWING_MODE
        | ClimateEntityFeature.TURN_ON
        | ClimateEntityFeature.TURN_OFF
    )
    # This integration only talks to Govee's cloud, so state shown here is
    # either the last real device reply or the last command we sent - not a
    # live local reading in between.
    _attr_assumed_state = True

    def __init__(self, hub: GoveeHeaterHub) -> None:
        self._hub = hub
        self._attr_unique_id = f"{hub.device_id}_climate"
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
    def current_temperature(self) -> float | None:
        return self._hub.state.get("current_temp")

    @property
    def target_temperature(self) -> float | None:
        # Only Auto mode is thermostat-driven; low/medium/high heat and
        # fan-only run at a fixed output with no temperature target.
        if self._hub.state.get("mode") != "auto":
            return None
        return self._hub.state.get("target_temp")

    @property
    def hvac_mode(self) -> HVACMode:
        if not self._hub.state.get("on"):
            return HVACMode.OFF
        mode = self._hub.state.get("mode")
        if mode == "auto":
            return HVACMode.AUTO
        if mode == "fan_only":
            return HVACMode.FAN_ONLY
        return HVACMode.HEAT

    @property
    def fan_mode(self) -> str | None:
        if self._hub.state.get("mode") != "heat":
            return None
        return LABEL_SPEED.get(self._hub.state.get("speed"))

    @property
    def swing_mode(self) -> str | None:
        return "on" if self._hub.state.get("swing") else "off"

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        if hvac_mode == HVACMode.OFF:
            await self._hub.async_set_power(False)
            self.async_write_ha_state()
            return

        if not self._hub.state.get("on"):
            await self._hub.async_set_power(True)

        if hvac_mode == HVACMode.AUTO:
            target = self._hub.state.get("target_temp") or MIN_TEMP
            await self._hub.async_set_auto_temp(target)
        elif hvac_mode == HVACMode.FAN_ONLY:
            await self._hub.async_set_speed(25)
        else:  # HEAT
            speed = self._hub.state.get("speed")
            await self._hub.async_set_speed(speed if speed in (50, 75, 100) else 50)

        self.async_write_ha_state()

    async def async_set_temperature(self, **kwargs) -> None:
        temp = kwargs.get(ATTR_TEMPERATURE)
        if temp is None:
            return

        if not self._hub.state.get("on"):
            await self._hub.async_set_power(True)

        # Setting a temperature always means (and switches to) Auto mode -
        # there's no target temperature in Heat/Fan-only.
        await self._hub.async_set_auto_temp(temp)
        self.async_write_ha_state()

    async def async_set_fan_mode(self, fan_mode: str) -> None:
        speed = {"low": 50, "medium": 75, "high": 100}[fan_mode]

        if not self._hub.state.get("on"):
            await self._hub.async_set_power(True)

        # Selecting a fixed speed always means (and switches to) Heat mode.
        await self._hub.async_set_speed(speed)
        self.async_write_ha_state()

    async def async_set_swing_mode(self, swing_mode: str) -> None:
        await self._hub.async_set_swing(swing_mode == "on")
        self.async_write_ha_state()

    async def async_turn_on(self) -> None:
        await self._hub.async_set_power(True)
        self.async_write_ha_state()

    async def async_turn_off(self) -> None:
        await self._hub.async_set_power(False)
        self.async_write_ha_state()
