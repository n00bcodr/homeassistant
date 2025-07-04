"""Sensor platform for Google Home."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

import voluptuous as vol

from homeassistant.components.sensor import SensorDeviceClass
from homeassistant.const import STATE_UNAVAILABLE
from homeassistant.helpers import config_validation as cv, entity_platform
from homeassistant.helpers.entity import Entity, EntityCategory

from .const import (
    ALARM_AND_TIMER_ID_LENGTH,
    DATA_CLIENT,
    DATA_COORDINATOR,
    DOMAIN,
    GOOGLE_HOME_ALARM_DEFAULT_VALUE,
    ICON_ALARMS,
    ICON_TIMERS,
    ICON_TOKEN,
    LABEL_ALARMS,
    LABEL_DEVICE,
    LABEL_TIMERS,
    SERVICE_ATTR_ALARM_ID,
    SERVICE_ATTR_SKIP_REFRESH,
    SERVICE_ATTR_TIMER_ID,
    SERVICE_DELETE_ALARM,
    SERVICE_DELETE_TIMER,
    SERVICE_REBOOT,
    SERVICE_REFRESH,
)
from .entity import GoogleHomeBaseEntity
from .models import GoogleHomeAlarmStatus, GoogleHomeDevice, GoogleHomeTimerStatus

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant, ServiceCall
    from homeassistant.helpers.entity_platform import AddEntitiesCallback
    from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

    from .api import GlocaltokensApiClient
    from .types import (
        AlarmsAttributes,
        DeviceAttributes,
        GoogleHomeAlarmDict,
        GoogleHomeConfigEntry,
        GoogleHomeTimerDict,
        TimersAttributes,
    )

_LOGGER: logging.Logger = logging.getLogger(__package__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: GoogleHomeConfigEntry,
    async_add_devices: AddEntitiesCallback,
) -> bool:
    """Set up sensor platform."""
    client: GlocaltokensApiClient = hass.data[DOMAIN][entry.entry_id][DATA_CLIENT]
    coordinator: DataUpdateCoordinator[list[GoogleHomeDevice]] = hass.data[DOMAIN][
        entry.entry_id
    ][DATA_COORDINATOR]
    sensors: list[Entity] = []
    for device in coordinator.data:
        sensors.append(
            GoogleHomeDeviceSensor(
                coordinator,
                client,
                device.device_id,
                device.name,
                device.hardware,
            )
        )
        if device.auth_token and device.available:
            sensors += [
                GoogleHomeAlarmsSensor(
                    coordinator,
                    client,
                    device.device_id,
                    device.name,
                    device.hardware,
                ),
                GoogleHomeTimersSensor(
                    coordinator,
                    client,
                    device.device_id,
                    device.name,
                    device.hardware,
                ),
            ]
    async_add_devices(sensors)

    platform = entity_platform.async_get_current_platform()

    # Services
    platform.async_register_entity_service(
        SERVICE_DELETE_ALARM,
        {
            vol.Required(SERVICE_ATTR_ALARM_ID): cv.string,
            vol.Optional(SERVICE_ATTR_SKIP_REFRESH): cv.boolean,
        },
        GoogleHomeAlarmsSensor.async_delete_alarm,
    )

    platform.async_register_entity_service(
        SERVICE_DELETE_TIMER,
        {
            vol.Required(SERVICE_ATTR_TIMER_ID): cv.string,
            vol.Optional(SERVICE_ATTR_SKIP_REFRESH): cv.boolean,
        },
        GoogleHomeTimersSensor.async_delete_timer,
    )

    platform.async_register_entity_service(
        SERVICE_REBOOT,
        {},
        GoogleHomeDeviceSensor.async_reboot_device,
    )

    platform.async_register_entity_service(
        SERVICE_REFRESH,
        {},
        GoogleHomeDeviceSensor.async_refresh_devices,
    )

    return True


class GoogleHomeDeviceSensor(GoogleHomeBaseEntity):
    """Google Home Device sensor."""

    _attr_icon = ICON_TOKEN
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    @property
    def label(self) -> str:
        """Label to use for name and unique id."""
        return LABEL_DEVICE

    @property
    def state(self) -> str | None:
        """Return device IP address if any."""
        device = self.get_device()
        return device.ip_address if device else None

    @property
    def extra_state_attributes(self) -> DeviceAttributes:
        """Return the state attributes."""
        device = self.get_device()
        attributes: DeviceAttributes = {
            "device_id": None,
            "device_name": self.device_name,
            "auth_token": None,
            "ip_address": None,
            "available": False,
        }
        return self.get_device_attributes(device) if device else attributes

    @staticmethod
    def get_device_attributes(device: GoogleHomeDevice) -> DeviceAttributes:
        """Device representation as dictionary."""
        return {
            "device_id": device.device_id,
            "device_name": device.name,
            "auth_token": device.auth_token,
            "ip_address": device.ip_address,
            "available": device.available,
        }

    async def async_reboot_device(self, _call: ServiceCall) -> None:
        """Reboot the device."""
        device = self.get_device()

        if device is None:
            _LOGGER.error("Device %s is not found.", self.device_name)
            return

        await self.client.reboot_google_device(device)

    async def async_refresh_devices(self, _call: ServiceCall) -> None:
        """Refresh the devices."""
        await self.coordinator.async_request_refresh()


class GoogleHomeAlarmsSensor(GoogleHomeBaseEntity):
    """Google Home Alarms sensor."""

    _attr_icon = ICON_ALARMS
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    @property
    def label(self) -> str:
        """Label to use for name and unique id."""
        return LABEL_ALARMS

    @property
    def state(self) -> str | None:
        """Return next alarm if available."""
        device = self.get_device()
        if not device:
            return None
        next_alarm = device.get_next_alarm()
        return (
            next_alarm.local_time_iso
            if next_alarm
            and next_alarm.status
            not in (GoogleHomeAlarmStatus.INACTIVE, GoogleHomeAlarmStatus.MISSED)
            else STATE_UNAVAILABLE
        )

    @property
    def extra_state_attributes(self) -> AlarmsAttributes:
        """Return the state attributes."""
        return {
            "next_alarm_status": self._get_next_alarm_status(),
            "alarm_volume": self._get_alarm_volume(),
            "alarms": self._get_alarms_data(),
        }

    def _get_next_alarm_status(self) -> str:
        """Update next alarm status from coordinator."""
        device = self.get_device()
        next_alarm = device.get_next_alarm() if device else None
        return (
            next_alarm.status.name.lower()
            if next_alarm
            else GoogleHomeAlarmStatus.NONE.name.lower()
        )

    def _get_alarm_volume(self) -> float:
        """Update alarm volume status from coordinator."""
        device = self.get_device()
        alarm_volume = device.get_alarm_volume() if device else None
        return alarm_volume if alarm_volume else GOOGLE_HOME_ALARM_DEFAULT_VALUE

    def _get_alarms_data(self) -> list[GoogleHomeAlarmDict]:
        """Update alarms data extracting it from coordinator."""
        device = self.get_device()
        return (
            [alarm.as_dict() for alarm in device.get_sorted_alarms()] if device else []
        )

    @staticmethod
    def is_valid_alarm_id(alarm_id: str) -> bool:
        """Check if the alarm id provided is valid."""
        return (
            alarm_id.startswith("alarm/") and len(alarm_id) == ALARM_AND_TIMER_ID_LENGTH
        )

    async def async_delete_alarm(self, call: ServiceCall) -> None:
        """Service call to delete alarm on device."""
        device = self.get_device()

        if device is None:
            _LOGGER.error("Device %s is not found.", self.device_name)
            return

        alarm_id: str = call.data[SERVICE_ATTR_ALARM_ID]
        if not self.is_valid_alarm_id(alarm_id):
            _LOGGER.error(
                "Incorrect ID format! Please provide a valid alarm ID. "
                "See services tab for more info."
            )
            return

        await self.client.delete_alarm_or_timer(device=device, item_to_delete=alarm_id)
        if not call.data[SERVICE_ATTR_SKIP_REFRESH]:
            await self.coordinator.async_request_refresh()


class GoogleHomeTimersSensor(GoogleHomeBaseEntity):
    """Google Home Timers sensor."""

    _attr_icons = ICON_TIMERS
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    @property
    def label(self) -> str:
        """Label to use for name and unique id."""
        return LABEL_TIMERS

    @property
    def state(self) -> str | None:
        """Return next timer if available."""
        device = self.get_device()
        if not device:
            return None
        timer = device.get_next_timer()
        return (
            timer.local_time_iso
            if timer and timer.local_time_iso
            else STATE_UNAVAILABLE
        )

    @property
    def extra_state_attributes(self) -> TimersAttributes:
        """Return the state attributes."""
        return {
            "next_timer_status": self._get_next_timer_status(),
            "timers": self._get_timers_data(),
        }

    def _get_next_timer_status(self) -> str:
        """Update next timer status from coordinator."""
        device = self.get_device()
        next_timer = device.get_next_timer() if device else None
        return (
            next_timer.status.name.lower()
            if next_timer
            else GoogleHomeTimerStatus.NONE.name.lower()
        )

    def _get_timers_data(self) -> list[GoogleHomeTimerDict]:
        """Update timers data extracting it from coordinator."""
        device = self.get_device()
        return (
            [timer.as_dict() for timer in device.get_sorted_timers()] if device else []
        )

    @staticmethod
    def is_valid_timer_id(timer_id: str) -> bool:
        """Check if the timer id provided is valid."""
        return (
            timer_id.startswith("timer/") and len(timer_id) == ALARM_AND_TIMER_ID_LENGTH
        )

    async def async_delete_timer(self, call: ServiceCall) -> None:
        """Service call to delete alarm on device."""
        device = self.get_device()

        if device is None:
            _LOGGER.error("Device %s is not found.", self.device_name)
            return

        timer_id: str = call.data[SERVICE_ATTR_TIMER_ID]
        if not self.is_valid_timer_id(timer_id):
            _LOGGER.error(
                "Incorrect ID format! Please provide a valid timer ID. "
                "See services tab for more info."
            )
            return

        await self.client.delete_alarm_or_timer(device=device, item_to_delete=timer_id)
        if not call.data[SERVICE_ATTR_SKIP_REFRESH]:
            _LOGGER.debug("Refreshing Devices")
            await self.coordinator.async_request_refresh()
