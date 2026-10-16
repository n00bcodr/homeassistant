from __future__ import annotations

import logging
import math
from collections.abc import Mapping, Sequence
from datetime import UTC, date, datetime
from decimal import Decimal
from typing import Any

from homeassistant.components.sensor import (
    RestoreSensor,
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .appliance_controls import (
    BooleanControl,
    Control,
    DebugControl,
    EnumControl,
    NumericControl,
    StateAwareRemainingTimeControl,
    SummedTimestampControl,
    TimeControl,
    generate_controls_from_config,
)
from .config_flow import EntryData
from .const import DOMAIN
from .entity import HomeWhizEntity
from .helper import build_entry_data
from .homewhiz import HomewhizCoordinator
from .machine_status import STATUS_OPTIONS, MachineStatusTracker

_LOGGER: logging.Logger = logging.getLogger(__package__)

# The only NumericControl currently known to need a corrected unit/device
# class. Arcelik's CONFIGURATION endpoint reports this field with a "hw"
# unit label (see the matching factor fix in appliance_controls.py's
# extract_ac_control) which isn't a real HA unit, so we map it to kW here.
# Scoped to this single key on purpose - other NumericControl sensors keep
# their previous (no explicit unit/device_class) behavior.
INSTANT_CONSUMPTION_KEY = "air_conditioner_instant_consumption"
# The bogus unit label that marks the affected reports. A device sending the
# same key with a real unit is left alone, matching the factor fix.
INSTANT_CONSUMPTION_BOGUS_UNIT = "hw"

# If the coordinator hasn't pushed an update for longer than this, we don't
# trust the "constant power over the gap" assumption (e.g. HA was down, or
# the appliance dropped offline) - skip integrating that particular gap
# instead of risking a bogus energy spike/dip on the Energy dashboard.
MAX_INTEGRATION_GAP_HOURS = 1.0


class HomeWhizSensorEntity(HomeWhizEntity, SensorEntity):
    def __init__(
        self,
        coordinator: HomewhizCoordinator,
        control: TimeControl
        | EnumControl
        | NumericControl
        | DebugControl
        | SummedTimestampControl
        | StateAwareRemainingTimeControl,
        device_name: str,
        data: EntryData,
    ):
        super().__init__(coordinator, device_name, control.key, data)
        self._control = control
        if isinstance(control, (TimeControl, StateAwareRemainingTimeControl)):
            self._attr_icon = "mdi:clock-outline"
            self._attr_native_unit_of_measurement = "min"
            self._attr_device_class = SensorDeviceClass.DURATION
        elif isinstance(control, EnumControl):
            self._attr_device_class = SensorDeviceClass.ENUM  # type:ignore
            self._attr_options = list(self._control.options.values())  # type:ignore
        elif (
            isinstance(control, NumericControl)
            and control.key == INSTANT_CONSUMPTION_KEY
            and control.bounds.unit == INSTANT_CONSUMPTION_BOGUS_UNIT
        ):
            self._attr_native_unit_of_measurement = "kW"
            self._attr_device_class = SensorDeviceClass.POWER
            self._attr_state_class = SensorStateClass.MEASUREMENT
        elif isinstance(control, SummedTimestampControl):
            self._attr_icon = "mdi:camera-timer"
            self._attr_device_class = SensorDeviceClass.TIMESTAMP

    @property
    def extra_state_attributes(self) -> Mapping[str, Any] | None:  # type: ignore[override]
        """Attribute to identify the origin of the data used"""
        if isinstance(self._control, SummedTimestampControl):
            return {
                "sources": [
                    x.my_entity_ids
                    for x in self._control.sensors
                    if hasattr(x, "my_entity_ids")
                ]
            }
        return None

    @property
    def native_value(  # type: ignore[override]
        self,
    ) -> float | int | str | datetime | None:
        _LOGGER.debug(
            "Native value for entity %s, id: %s, info: %s, class:%s, is %s",
            self.entity_key,
            self._attr_unique_id,
            self._attr_device_info,
            self._attr_device_class,
            self.coordinator.data,
        )

        if self.coordinator.data is None:
            return None
        return self._control.get_value(self.coordinator.data)


class HomeWhizMachineStatusEntity(HomeWhizEntity, SensorEntity):
    """One status for a washer, from its main state and sub-state.

    Always "available" itself: a lost connection is reported as the
    "unavailable" status, after the coordinator's grace period (until then the
    last data is still served, so the last status stays).
    """

    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = STATUS_OPTIONS

    def __init__(
        self,
        coordinator: HomewhizCoordinator,
        device_name: str,
        data: EntryData,
        state_control: EnumControl,  # type: ignore[type-arg]
        sub_state_control: EnumControl,  # type: ignore[type-arg]
        remaining_control: Control | None = None,
        delay_control: Control | None = None,
        door_control: BooleanControl | None = None,
    ):
        super().__init__(coordinator, device_name, "machine_status", data)
        # HomeWhizEntity sets a placeholder device class, restore the real one
        self._attr_device_class = SensorDeviceClass.ENUM
        self._state_control = state_control
        self._sub_state_control = sub_state_control
        self._remaining_control = remaining_control
        self._delay_control = delay_control
        self._door_control = door_control
        self._tracker = MachineStatusTracker()
        self._status: str | None = None
        self._attributes: dict[str, Any] = {}

    @property
    def available(self) -> bool:  # type: ignore[override]
        return True

    @property
    def native_value(self) -> str | None:  # type: ignore[override]
        return self._status

    @property
    def extra_state_attributes(self) -> Mapping[str, Any] | None:  # type: ignore[override]
        return self._attributes

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self._refresh()

    def _handle_coordinator_update(self) -> None:
        self._refresh()
        super()._handle_coordinator_update()

    def _refresh(self) -> None:
        coordinator = self.coordinator
        data = coordinator.data
        if not coordinator.available:
            self._tracker.reset()
            self._status = "unavailable"
            self._attributes = {"connected": False}
            return
        if data is None:
            return
        state = self._state_control.get_value(data)
        sub_state = self._sub_state_control.get_value(data)
        door_open = bool(self._door_control and self._door_control.get_value(data))
        remaining = (
            self._remaining_control.get_value(data)
            if self._remaining_control is not None
            else None
        )
        self._status = self._tracker.update(state, sub_state, door_open, remaining)
        self._attributes = {
            "connected": coordinator.is_connected,
            "raw_state": state,
            "raw_sub_state": sub_state,
        }
        if remaining is not None:
            self._attributes["remaining_minutes"] = remaining
        if self._delay_control is not None:
            self._attributes["delay_minutes"] = self._delay_control.get_value(data)
        _LOGGER.debug("Machine status %s from %s", self._status, self._attributes)


def _find_machine_status_controls(
    controls: Sequence[Control],
) -> dict[str, Any] | None:
    """Washers only: needs a state and a washer sub-state control."""
    by_key = {c.key: c for c in controls}
    state = by_key.get("state")
    sub_state = by_key.get("sub_state")
    if not (
        isinstance(state, EnumControl)
        and isinstance(sub_state, EnumControl)
        and "washer_substate_washing" in sub_state.options.values()
    ):
        return None
    door = by_key.get("washer_warning_door_is_open")
    return {
        "state_control": state,
        "sub_state_control": sub_state,
        "remaining_control": by_key.get("washer_remaining"),
        "delay_control": next(
            (
                c
                for c in controls
                if c.key.startswith("delay_start#") and isinstance(c, TimeControl)
            ),
            None,
        ),
        "door_control": door if isinstance(door, BooleanControl) else None,
    }


class HomeWhizEnergyEntity(HomeWhizEntity, RestoreSensor):
    """Integrates the instant-consumption power (kW) sensor over time into
    an accumulated kWh total, ready to be added to the HA Energy dashboard.

    The appliance itself does not report a running kWh total, only
    instantaneous power - this entity does a trapezoidal integration of
    that value every time the coordinator pushes new data, and persists
    the running total across HA restarts via RestoreSensor (which stores
    the typed native_value directly, rather than the published state
    string - so a transient "unavailable"/"unknown" published state can't
    wipe out the accumulated total on restart).

    Scoped with the exact same key+unit check as the kW sensor above, on
    purpose - only appliances confirmed to expose the buggy "hw"-labeled
    instant-consumption field get this companion entity.
    """

    # Matches HA's own IntegrationSensor helper: TOTAL (not
    # TOTAL_INCREASING) because a restore/reset can legitimately bring the
    # value back down, and TOTAL_INCREASING would treat that as an error.
    _attr_state_class = SensorStateClass.TOTAL
    _attr_native_unit_of_measurement = "kWh"
    _attr_icon = "mdi:lightning-bolt"

    def __init__(
        self,
        coordinator: HomewhizCoordinator,
        power_control: NumericControl,
        device_name: str,
        data: EntryData,
    ):
        super().__init__(coordinator, device_name, f"{power_control.key}_total", data)
        # HomeWhizEntity.__init__ (called just above) unconditionally sets
        # self._attr_device_class to a homewhiz-internal placeholder value.
        # There is no class-level SensorDeviceClass.ENERGY to fall back on,
        # so it must be (re-)assigned here, or this entity would report the
        # wrong device_class and the Energy dashboard would reject it with
        # "Unexpected device class".
        self._attr_device_class = SensorDeviceClass.ENERGY
        self._power_control = power_control
        self._total_kwh: float = 0.0
        self._last_update: datetime | None = None
        self._last_power_kw: float | None = None

    @property
    def translation_key(self) -> str | None:  # type: ignore[override]
        """No translation entry exists for the "..._total" key this entity
        generates (see HomeWhizEntity.translation_key), and
        scripts/generate_translations.py would drop a manually-added entry
        on its next run anyway. Return None so HA falls back to the
        device class name instead of the raw, untranslated key."""
        return None

    @staticmethod
    def parse_restored_total(
        native_value: str | float | date | datetime | Decimal | None,
    ) -> float:
        """Pure helper: turn a restored native_value (from
        RestoreSensor.async_get_last_sensor_data(), already typed - not a
        published-state string, so it's never "unknown"/"unavailable")
        back into a kWh total. Anything that isn't a plain finite number
        (missing, a date/datetime, or somehow garbage) resets to 0.0
        rather than raising or silently carrying over a stale/invalid
        value."""
        if not isinstance(native_value, str | int | float | Decimal):
            return 0.0
        try:
            value = float(native_value)
        except TypeError, ValueError:
            return 0.0
        if not math.isfinite(value):
            return 0.0
        return value

    @staticmethod
    def integrate_delta(
        last_power_kw: float | None, power_kw: float, elapsed_hours: float
    ) -> float:
        """Pure helper: trapezoidal kWh delta for one step between two
        power (kW) samples elapsed_hours apart. Returns 0.0 (a no-op) when
        there's no previous sample yet, or when the gap is too large to
        trust the "constant power over the gap" assumption - e.g. HA was
        down or the appliance was offline for a while."""
        if last_power_kw is None:
            return 0.0
        if elapsed_hours <= 0 or elapsed_hours > MAX_INTEGRATION_GAP_HOURS:
            return 0.0
        avg_power_kw = (last_power_kw + power_kw) / 2
        return avg_power_kw * elapsed_hours

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last_sensor_data = await self.async_get_last_sensor_data()
        self._total_kwh = self.parse_restored_total(
            last_sensor_data.native_value if last_sensor_data is not None else None
        )
        # Prime the integration baseline now, so the very first coordinator
        # update after startup doesn't integrate over the (possibly huge)
        # gap since HA was last running.
        self._last_update = datetime.now(UTC)
        current = self._current_power_kw()
        if current is not None:
            self._last_power_kw = current

    def _current_power_kw(self) -> float | None:
        if self.coordinator.data is None:
            return None
        value = self._power_control.get_value(self.coordinator.data)
        return float(value) if value is not None else None

    def _advance_integration(self, now: datetime) -> None:
        """Pure state update: no HA runtime/event-loop needed, so this can
        be unit tested directly without a real hass instance."""
        power_kw = self._current_power_kw()

        if power_kw is None:
            # No usable sample right now (appliance/coordinator data
            # unavailable). Clear the baseline entirely rather than leaving
            # it in place - otherwise the next valid sample would integrate
            # across the *entire* gap as if power had been constant the
            # whole time, silently fabricating energy that was never
            # measured.
            self._last_power_kw = None
            self._last_update = None
            return

        if self._last_update is not None:
            elapsed_hours = (now - self._last_update).total_seconds() / 3600
            self._total_kwh += self.integrate_delta(
                self._last_power_kw, power_kw, elapsed_hours
            )
        self._last_power_kw = power_kw
        self._last_update = now

    def _handle_coordinator_update(self) -> None:
        self._advance_integration(datetime.now(UTC))
        super()._handle_coordinator_update()

    @property
    def native_value(self) -> float:  # type: ignore[override]
        return round(self._total_kwh, 4)


def _find_instant_consumption_controls(
    sensor_controls: Sequence[Control],
) -> list[NumericControl]:
    """The exact same key+unit signature used by HomeWhizSensorEntity above
    to decide which sensor gets the kW/POWER/MEASUREMENT treatment - reused
    here so the companion kWh entity only ever appears for the same,
    verified-affected appliances."""
    return [
        c
        for c in sensor_controls
        if isinstance(c, NumericControl)
        and c.key == INSTANT_CONSUMPTION_KEY
        and c.bounds.unit == INSTANT_CONSUMPTION_BOGUS_UNIT
    ]


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    data = build_entry_data(entry)
    coordinator = hass.data[DOMAIN][entry.entry_id]
    controls = generate_controls_from_config(entry.entry_id, data.contents.config)
    _LOGGER.debug("Generated controls: %s", controls)
    sensor_controls = [
        c
        for c in controls
        if isinstance(
            c,
            (
                TimeControl,
                EnumControl,
                NumericControl,
                DebugControl,
                SummedTimestampControl,
                StateAwareRemainingTimeControl,
            ),
        )
    ]

    _LOGGER.debug("Sensors: %s", [c.key for c in sensor_controls])

    homewhiz_sensor_entities: list[HomeWhizSensorEntity | HomeWhizEnergyEntity] = [
        HomeWhizSensorEntity(coordinator, control, entry.title, data)
        for control in sensor_controls
    ]

    homewhiz_sensor_entities.extend(
        HomeWhizEnergyEntity(coordinator, control, entry.title, data)
        for control in _find_instant_consumption_controls(sensor_controls)
    )

    machine_status = _find_machine_status_controls(controls)
    status_entities: list[HomeWhizMachineStatusEntity] = (
        [HomeWhizMachineStatusEntity(coordinator, entry.title, data, **machine_status)]
        if machine_status is not None
        else []
    )

    _LOGGER.debug(
        "Entities: %s",
        {entity.entity_key: entity for entity in homewhiz_sensor_entities},
    )
    async_add_entities([*homewhiz_sensor_entities, *status_entities])
