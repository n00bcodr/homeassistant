"""Home Assistant integration for a single Govee H713B space heater.

Talks directly to Govee's cloud (email/password login + AWS IoT), the same
way the homebridge-govee plugin does, without pulling in the rest of that
plugin's ~100 other supported devices.
"""
from __future__ import annotations

import logging
from datetime import timedelta
from pathlib import Path
from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_PASSWORD, CONF_USERNAME, Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.event import async_track_time_interval

from . import api, protocol
from .const import (
    ATTR_CODE,
    CONF_AWS_TOPIC,
    CONF_CLIENT_ID,
    CONF_DEVICE_ID,
    CONF_DEVICE_NAME,
    DOMAIN,
    LOCK_OFF_CODE,
    LOCK_ON_CODE,
    MAX_TEMP,
    MIN_TEMP,
    POWER_OFF_CODE,
    POWER_ON_CODE,
    SERVICE_SEND_RAW_COMMAND,
    SPEED_CODE,
    SWING_OFF_CODE,
    SWING_ON_CODE,
    TEMP_CODE_AUTO,
    TEMP_CODE_AUTO_TURN,
)

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.CLIMATE, Platform.LIGHT]

STATUS_POLL_INTERVAL = timedelta(seconds=60)


class GoveeHeaterHub:
    """Owns the AWS IoT connection and the last-known state for one heater."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self.device_id: str = entry.data[CONF_DEVICE_ID]
        self.device_name: str = entry.data[CONF_DEVICE_NAME]
        self.aws_topic: str = entry.data[CONF_AWS_TOPIC]
        self.state: dict[str, Any] = {}
        self._listeners: list[Any] = []
        self._iot: api.GoveeIotClient | None = None
        self._unsub_poll = None

    def add_listener(self, callback) -> None:
        self._listeners.append(callback)

    def remove_listener(self, callback) -> None:
        if callback in self._listeners:
            self._listeners.remove(callback)

    def _notify(self) -> None:
        for cb in list(self._listeners):
            cb()

    async def async_setup(self) -> None:
        session = api.GoveeSession(
            account_id=self.entry.data["account_id"],
            token=self.entry.data["token"],
            account_topic=self.entry.data["account_topic"],
            iot_endpoint=self.entry.data["iot_endpoint"],
            p12_b64=self.entry.data["p12_b64"],
            p12_pass=self.entry.data["p12_pass"],
            client_id=self.entry.data[CONF_CLIENT_ID],
        )
        cert_dir = self.hass.config.path(".storage", DOMAIN, self.entry.entry_id)

        self._iot = api.GoveeIotClient(
            self.hass, Path(cert_dir), session, session.account_topic, self._handle_message
        )
        try:
            await self._iot.async_connect()
        except Exception:
            # The cached login/cert may simply have expired - Govee's own app
            # re-logs in silently in this situation, so do the same rather
            # than making the user remove and re-add the integration.
            _LOGGER.info(
                "Cached Govee session for %s did not connect, logging in again",
                self.device_name,
            )
            http_session = async_get_clientsession(self.hass)
            session = await api.login(
                http_session,
                self.entry.data[CONF_USERNAME],
                self.entry.data[CONF_PASSWORD],
                self.entry.data[CONF_CLIENT_ID],
            )
            self.hass.config_entries.async_update_entry(
                self.entry,
                data={
                    **self.entry.data,
                    "account_id": session.account_id,
                    "token": session.token,
                    "account_topic": session.account_topic,
                    "iot_endpoint": session.iot_endpoint,
                    "p12_b64": session.p12_b64,
                    "p12_pass": session.p12_pass,
                },
            )
            self._iot = api.GoveeIotClient(
                self.hass, Path(cert_dir), session, session.account_topic, self._handle_message
            )
            await self._iot.async_connect()

        self._unsub_poll = async_track_time_interval(
            self.hass, self._async_poll, STATUS_POLL_INTERVAL
        )
        await self.async_request_status()

    async def async_unload(self) -> None:
        if self._unsub_poll:
            self._unsub_poll()
            self._unsub_poll = None
        if self._iot:
            await self._iot.async_disconnect()

    async def _async_poll(self, _now) -> None:
        await self.async_request_status()

    async def async_request_status(self) -> None:
        try:
            await self._iot.async_request_status(self.aws_topic)
        except ConnectionError as err:
            _LOGGER.debug("Could not request status for %s: %s", self.device_name, err)

    def _handle_message(self, payload: dict[str, Any]) -> None:
        if payload.get("device") and payload["device"] != self.device_id:
            return

        changed = False

        state = payload.get("state")
        if isinstance(state, dict):
            if "onOff" in state:
                new_on = state["onOff"] in (1, 17)
                if self.state.get("on") != new_on:
                    self.state["on"] = new_on
                    changed = True

            sta = state.get("sta")
            if isinstance(sta, dict):
                if "curTem" in sta:
                    # Hundredths of a degree Fahrenheit, same as the plugin sees.
                    cur_f = sta["curTem"] / 100
                    if cur_f <= 100:
                        # A value this low is Govee's "not reported" sentinel for
                        # heaters without a room sensor, not a real Fahrenheit reading.
                        cur_c = round((cur_f - 32) * 5 / 9, 1)
                        if self.state.get("current_temp") != cur_c:
                            self.state["current_temp"] = cur_c
                            changed = True
                if "setTem" in sta:
                    set_f = sta["setTem"] / 100
                    set_c = round((set_f - 32) * 5 / 9)
                    if self.state.get("target_temp") != set_c:
                        self.state["target_temp"] = set_c
                        self.state["mode"] = "auto"
                        changed = True

        # Real-time / status-reply pushes also carry raw "aa..." status codes
        # for the light, swing, lock and fan speed/mode - decode those too.
        commands = payload.get("commands") or (payload.get("op") or {}).get("command") or []
        if commands:
            updates = protocol.decode_status_codes(commands)
            for key, value in updates.items():
                if self.state.get(key) != value:
                    self.state[key] = value
                    changed = True

        if changed:
            self._notify()

    async def async_set_power(self, on: bool) -> None:
        code = POWER_ON_CODE if on else POWER_OFF_CODE
        await self._iot.async_send_multisync(self.aws_topic, code)
        self.state["on"] = on
        self._notify()

    async def async_set_auto_temp(self, temp_c: float) -> None:
        """Switch to (or stay in) Auto mode at the given target temperature."""
        temp_c = max(MIN_TEMP, min(MAX_TEMP, round(temp_c)))
        table = TEMP_CODE_AUTO if self.state.get("mode") == "auto" else TEMP_CODE_AUTO_TURN
        await self._iot.async_send_multisync(self.aws_topic, table[temp_c])
        self.state["mode"] = "auto"
        self.state["target_temp"] = temp_c
        self._notify()

    async def async_set_speed(self, speed: int) -> None:
        """Fixed fan-speed modes: 25=fan-only, 50/75/100=heat low/medium/high."""
        await self._iot.async_send_multisync(self.aws_topic, SPEED_CODE[speed])
        self.state["mode"] = "fan_only" if speed == 25 else "heat"
        self.state["speed"] = speed
        self._notify()

    async def async_set_swing(self, on: bool) -> None:
        code = SWING_ON_CODE if on else SWING_OFF_CODE
        await self._iot.async_send_multisync(self.aws_topic, code)
        self.state["swing"] = on
        self._notify()

    async def async_set_lock(self, on: bool) -> None:
        code = LOCK_ON_CODE if on else LOCK_OFF_CODE
        await self._iot.async_send_multisync(self.aws_topic, code)
        self.state["lock"] = on
        self._notify()

    async def async_set_light_power(self, on: bool) -> None:
        await self._iot.async_send_multisync(self.aws_topic, protocol.light_power_code(on))
        self.state["light_on"] = on
        self._notify()

    async def async_set_light_brightness(self, percent: int) -> None:
        await self._iot.async_send_multisync(
            self.aws_topic, protocol.light_brightness_code(percent)
        )
        self.state["light_brightness"] = percent
        self.state["light_on"] = percent > 0
        self._notify()

    async def async_set_light_color(self, red: int, green: int, blue: int) -> None:
        await self._iot.async_send_multisync(
            self.aws_topic, protocol.light_color_code(red, green, blue)
        )
        self._notify()

    async def async_send_raw(self, code_b64: str) -> None:
        await self._iot.async_send_multisync(self.aws_topic, code_b64)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    hub = GoveeHeaterHub(hass, entry)
    await hub.async_setup()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = hub

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    if not hass.services.has_service(DOMAIN, SERVICE_SEND_RAW_COMMAND):
        async def _handle_send_raw(call: ServiceCall) -> None:
            for hub_ in hass.data[DOMAIN].values():
                await hub_.async_send_raw(call.data[ATTR_CODE])

        hass.services.async_register(
            DOMAIN,
            SERVICE_SEND_RAW_COMMAND,
            _handle_send_raw,
            schema=vol.Schema({vol.Required(ATTR_CODE): cv.string}),
        )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hub: GoveeHeaterHub = hass.data[DOMAIN].pop(entry.entry_id)
        await hub.async_unload()
        if not hass.data[DOMAIN]:
            hass.services.async_remove(DOMAIN, SERVICE_SEND_RAW_COMMAND)
    return unload_ok
