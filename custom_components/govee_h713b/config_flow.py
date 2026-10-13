"""Config flow: Govee email/password login, then pick the H713B to add."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_PASSWORD, CONF_USERNAME
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from . import api
from .const import (
    CONF_AWS_TOPIC,
    CONF_CLIENT_ID,
    CONF_DEVICE_ID,
    CONF_DEVICE_NAME,
    DOMAIN,
    MODEL,
)

_LOGGER = logging.getLogger(__name__)

STEP_USER_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_USERNAME): str,
        vol.Required(CONF_PASSWORD): str,
    }
)

STEP_2FA_SCHEMA = vol.Schema({vol.Required("code"): str})


class GoveeH713BConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    def __init__(self) -> None:
        self._email: str | None = None
        self._password: str | None = None
        self._client_id: str | None = None
        self._session: api.GoveeSession | None = None
        self._devices: list[api.GoveeDevice] = []

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            self._email = user_input[CONF_USERNAME]
            self._password = user_input[CONF_PASSWORD]
            self._client_id = api.make_client_id(self._email)
            return await self._async_try_login(errors)

        return self.async_show_form(
            step_id="user", data_schema=STEP_USER_SCHEMA, errors=errors
        )

    async def async_step_two_factor(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            return await self._async_try_login(errors, code=user_input["code"])

        return self.async_show_form(
            step_id="two_factor", data_schema=STEP_2FA_SCHEMA, errors=errors
        )

    async def _async_try_login(
        self, errors: dict[str, str], code: str | None = None
    ) -> config_entries.ConfigFlowResult:
        session = async_get_clientsession(self.hass)
        try:
            self._session = await api.login(
                session, self._email, self._password, self._client_id, code=code
            )
        except api.GoveeTwoFactorRequired:
            return self.async_show_form(
                step_id="two_factor", data_schema=STEP_2FA_SCHEMA, errors={}
            )
        except api.GoveeAuthError as err:
            _LOGGER.warning("Govee login failed: %s", err)
            errors["base"] = "invalid_auth"
            return self.async_show_form(
                step_id="user", data_schema=STEP_USER_SCHEMA, errors=errors
            )
        except Exception:  # noqa: BLE001
            _LOGGER.exception("Unexpected error logging in to Govee")
            errors["base"] = "cannot_connect"
            return self.async_show_form(
                step_id="user", data_schema=STEP_USER_SCHEMA, errors=errors
            )

        self._devices = await api.get_devices(
            session, self._client_id, self._session.token
        )

        if not self._devices:
            return self.async_abort(reason="no_h713b_found")

        if len(self._devices) == 1:
            return await self._async_create_entry(self._devices[0])

        return await self.async_step_pick_device()

    async def async_step_pick_device(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        by_name = {d.device_name: d for d in self._devices}
        if user_input is not None:
            return await self._async_create_entry(by_name[user_input["device"]])

        return self.async_show_form(
            step_id="pick_device",
            data_schema=vol.Schema(
                {vol.Required("device"): vol.In(list(by_name.keys()))}
            ),
        )

    async def _async_create_entry(
        self, device: api.GoveeDevice
    ) -> config_entries.ConfigFlowResult:
        await self.async_set_unique_id(device.device_id)
        self._abort_if_unique_id_configured()

        return self.async_create_entry(
            title=f"{device.device_name} ({MODEL})",
            data={
                CONF_USERNAME: self._email,
                CONF_PASSWORD: self._password,
                CONF_CLIENT_ID: self._client_id,
                CONF_DEVICE_ID: device.device_id,
                CONF_DEVICE_NAME: device.device_name,
                CONF_AWS_TOPIC: device.aws_topic,
                "account_id": self._session.account_id,
                "token": self._session.token,
                "account_topic": self._session.account_topic,
                "iot_endpoint": self._session.iot_endpoint,
                "p12_b64": self._session.p12_b64,
                "p12_pass": self._session.p12_pass,
            },
        )
