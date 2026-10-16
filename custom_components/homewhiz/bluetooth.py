import asyncio
import contextlib
import logging
from collections.abc import Callable
from datetime import datetime, timedelta
from time import monotonic
from typing import Any

from bleak import BleakClient, BLEDevice
from bleak_retry_connector import establish_connection
from homeassistant.components import bluetooth
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.event import (
    async_track_point_in_time,
    async_track_time_interval,
)

from .const import DEFAULT_BT_GRACE_PERIOD, DOMAIN
from .homewhiz import Command, HomewhizCoordinator

_LOGGER: logging.Logger = logging.getLogger(__package__)

# Seconds to wait between reconnect attempts; the last value repeats.
RECONNECT_BACKOFF = (2, 5, 10, 30)
# Request that makes the machine send its full state (sent on every connect).
REQUEST_STATE_PAYLOAD = bytearray.fromhex("02 04 00 04 00 1a 01 03")


class MessageAccumulator:
    def __init__(self) -> None:
        self._expected_index = 0
        self._accumulated: bytearray = bytearray()

    def accumulate_message(self, message: bytearray) -> bytearray | None:
        message_index = message[4]
        _LOGGER.debug("Message index: %d", message_index)
        if message_index == 0:
            self._accumulated = message[7:]
            self._expected_index = 1
        elif message_index == 1 and self._expected_index == 1:
            full_message = self._accumulated + message[7:]
            self._expected_index = 0
            return full_message
        else:
            # Unexpected sequence: reset to avoid getting permanently stuck
            _LOGGER.warning(
                "Unexpected message index %d, resetting accumulator", message_index
            )
            self._expected_index = 0
            self._accumulated = bytearray()
        return None


class HomewhizBluetoothUpdateCoordinator(HomewhizCoordinator):
    def __init__(
        self,
        hass: HomeAssistant,
        address: str,
        reconnect_interval: int | None = None,
        grace_period: int = DEFAULT_BT_GRACE_PERIOD,
        keepalive_interval: int = 0,
    ) -> None:
        self.address = address
        self._accumulator = MessageAccumulator()
        self._hass = hass
        self._device: BLEDevice | None = None
        self._device_lock = asyncio.Lock()
        self._connection: BleakClient | None = None
        self._connection_lock = asyncio.Lock()
        self.alive = True
        # To ensure that only one reconnect is performed at a time
        self.reconnecting_lock = asyncio.Lock()
        # Allow users to configure regular Bluetooth reconnections
        self._reconnect_interval: int | None = reconnect_interval
        self._reconnect_interval_task: None | Callable = None
        # Keep last known values / availability for this long after a drop
        self._grace_period = grace_period
        self._disconnected_since: float | None = None
        self._grace_timer: asyncio.TimerHandle | None = None
        self._connected_since: float | None = None
        self._deliberate_disconnect = False
        self._keepalive_interval = keepalive_interval
        self._keepalive_unsub: Callable | None = None
        super().__init__(hass, _LOGGER, name=DOMAIN)

    async def connect(self) -> bool:
        if self.is_connected:
            _LOGGER.debug("Already connected, skipping connect()")
            return True
        async with self._connection_lock:
            if self.is_connected:  # double-checked locking
                _LOGGER.debug("Already connected, skipping connect()")
                return True
            _LOGGER.info("Connecting to %s", self.address)
            self._log_connection_paths()
            # A half received message from the previous link must not be
            # glued to the first message of the new one.
            self._accumulator = MessageAccumulator()
            async with self._device_lock:
                self._device = bluetooth.async_ble_device_from_address(
                    self._hass, self.address, connectable=True
                )
                # Self connection should be None
                if self._connection:
                    _LOGGER.warning(
                        "Trying to connect even though connection already exists!"
                    )
                if not self._device:
                    raise RuntimeError(f"Device not found for address {self.address}")

                # How to clear disconnected_callback?
                _LOGGER.debug("Establishing connection")
                self._connection = await establish_connection(
                    client_class=BleakClient,
                    device=self._device,
                    disconnected_callback=self.disconnected_callback,
                    name=self.address,
                )

            def _raise_cant_connect() -> None:
                msg = "Can't connect"
                raise RuntimeError(msg)

            try:
                if not self._connection.is_connected:
                    _raise_cant_connect()

                # Brief settle time before subscribing. The 0.5s is not
                # backed by a measurement, do not drop it untested.
                await asyncio.sleep(0.5)

                _LOGGER.debug("Starting notify")
                await self._connection.start_notify(
                    "0000ac02-0000-1000-8000-00805f9b34fb",
                    lambda sender, message: self.hass.create_task(
                        self.handle_notify(message)
                    ),
                )
                _LOGGER.debug("Sending initial command")
                await self._request_state()
            except Exception:
                # WARNING, not ERROR: this failure is transient and the
                # reconnect loop takes over; a persistent problem still
                # surfaces as ERROR via "Can't reconnect" every 30s.
                _LOGGER.warning(
                    "Failed to set up connection, cleaning up", exc_info=True
                )
                with contextlib.suppress(Exception):
                    await self._connection.disconnect()
                self._connection = None  # ensure clean state for next attempt
                raise

        # To retrieve RSSI value
        # https://developers.home-assistant.io/docs/core/bluetooth/api/#fetching-the-latest-bluetoothserviceinfobleak-for-a-device
        _LOGGER.debug("Fetching service info")
        service_info = bluetooth.async_last_service_info(
            self.hass, self.address, connectable=True
        )
        if service_info is not None:
            _LOGGER.info(
                "Successfully connected. Adapter/proxy source: %s, RSSI: %s",
                service_info.source,
                service_info.rssi,
            )
        else:
            _LOGGER.info("Successfully connected (RSSI not available)")

        self._mark_connected()

        # If reconnection is configured, set a task to reconnect after interval
        if self._reconnect_interval:
            self.create_reconnect_interval_task()
        else:
            _LOGGER.debug("Reconnect after interval task not set")

        return True

    def _log_connection_paths(self) -> None:
        """Evidence for "which adapter/proxy does HA use". HA picks the path
        itself (best RSSI/score) on every connect, it can not be pinned."""
        try:
            paths = bluetooth.async_scanner_devices_by_address(
                self.hass, self.address, connectable=True
            )
            _LOGGER.debug(
                "[%s] Connection paths: %s",
                self.address,
                ", ".join(
                    f"{p.scanner.name} (source={p.scanner.source}, "
                    f"rssi={p.advertisement.rssi})"
                    for p in paths
                )
                or "none",
            )
        except Exception:
            _LOGGER.debug("Could not list connection paths", exc_info=True)

    async def _request_state(self) -> None:
        assert self._connection is not None
        await self._connection.write_gatt_char(
            "0000ac01-0000-1000-8000-00805f9b34fb",
            REQUEST_STATE_PAYLOAD,
            response=False,
        )

    def _mark_connected(self) -> None:
        self._connected_since = monotonic()
        self._disconnected_since = None
        if self._grace_timer is not None:
            self._grace_timer.cancel()
            self._grace_timer = None
        self._start_keepalive()

    def _start_keepalive(self) -> None:
        self._stop_keepalive()
        if self._keepalive_interval > 0:
            self._keepalive_unsub = async_track_time_interval(
                self.hass,
                self._keepalive,
                timedelta(seconds=self._keepalive_interval),
            )

    def _stop_keepalive(self) -> None:
        if self._keepalive_unsub is not None:
            self._keepalive_unsub()
            self._keepalive_unsub = None

    async def _keepalive(self, _now: datetime) -> None:
        if not self.is_connected:
            return
        _LOGGER.debug("[%s] Keep-alive: requesting state", self.address)
        try:
            await self._request_state()
        except Exception:
            _LOGGER.debug("Keep-alive write failed", exc_info=True)

    @property
    def available(self) -> bool:
        if self.is_connected:
            return True
        return (
            self._disconnected_since is not None
            and monotonic() - self._disconnected_since < self._grace_period
        )

    @callback
    def _grace_expired(self) -> None:
        self._grace_timer = None
        if self.alive and not self.is_connected:
            _LOGGER.info(
                "[%s] Still disconnected after %ss grace period, "
                "marking entities unavailable",
                self.address,
                self._grace_period,
            )
            self.async_set_updated_data(None)

    def create_reconnect_interval_task(self) -> None:
        # Cancel any existing task
        if self._reconnect_interval_task:
            _LOGGER.debug(
                "Existing reconnect after %s hours task cancelled",
                self._reconnect_interval,
            )
            self._reconnect_interval_task()

        if not self._reconnect_interval:
            return

        self._reconnect_interval_task = async_track_point_in_time(
            hass=self.hass,
            action=self.reconnect_callback,
            point_in_time=datetime.now()
            + timedelta(hours=float(self._reconnect_interval)),
        )
        _LOGGER.debug("Reconnect after %s hours task set", self._reconnect_interval)

    @callback
    def disconnected_callback(self, client: BleakClient | None = None) -> None:
        _LOGGER.debug("Disconnected callback")
        # Prevent locking when home assistant is shutting down
        if not self.alive:
            _LOGGER.debug("Disconnected callback called but not alive")
            return
        self.hass.create_task(self.handle_disconnect(client))

    @callback
    def reconnect_callback(self, *args: Any) -> None:
        # Trigger a disconnect, the disconnected_callback will trigger the reconnect
        _LOGGER.debug("Reconnect callback")
        if self.alive:
            self._deliberate_disconnect = True
            connection = self._connection  # capture a local reference atomically
            if connection is not None:
                self.hass.create_task(connection.disconnect())

    async def try_reconnect(self) -> None:
        async with self.reconnecting_lock:
            _LOGGER.debug("[%s] Trying to reconnect", self.address)
            attempt = 0
            while self.alive and not self.is_connected:
                if not bluetooth.async_address_present(
                    self.hass, self.address, connectable=True
                ):
                    _LOGGER.debug(
                        "[%s] Device not seen by any adapter/proxy, waiting",
                        self.address,
                    )
                    await asyncio.sleep(5)
                    continue  # keep waiting instead of giving up
                try:
                    _LOGGER.debug(
                        "[%s] Establish connection from reconnect",
                        self.address,
                    )
                    await self.connect()
                    # Reconnect was successful!
                    _LOGGER.debug("Reconnecting was successful!")
                except Exception as err:
                    delay = RECONNECT_BACKOFF[min(attempt, len(RECONNECT_BACKOFF) - 1)]
                    attempt += 1
                    _LOGGER.warning(
                        "[%s] Can't reconnect (attempt %d): %s. Retrying in %ds",
                        self.address,
                        attempt,
                        err,
                        delay,
                    )
                    _LOGGER.debug("Reconnect failure details", exc_info=True)
                    await asyncio.sleep(delay)

    async def handle_disconnect(
        self, client: BleakClient | None = None, *args: Any
    ) -> None:
        _LOGGER.debug("Handling disconnect%s...", " by time interval" if args else "")
        async with self._connection_lock:
            # Only a disconnect of the live connection may tear it down.
            # A late callback from a superseded client would otherwise kill
            # a fresh, healthy connection established in the meantime.
            if (
                client is not None
                and self._connection is not None
                and client is not self._connection
            ):
                _LOGGER.debug("Ignoring disconnect from a stale connection")
                return
            if self._connected_since is not None:
                _LOGGER.info(
                    "[%s] Bluetooth link %s after %.0fs connected "
                    "(the BLE stack does not report a reason; check the "
                    "ESPHome proxy / bluetooth logs at the same timestamp)",
                    self.address,
                    "closed by us" if self._deliberate_disconnect else "dropped",
                    monotonic() - self._connected_since,
                )
            self._deliberate_disconnect = False
            self._connected_since = None
            self._stop_keepalive()
            async with self._device_lock:
                self._device = None
            # Ensure device is disconnected
            if self._connection:
                _LOGGER.info("Triggering disconnect")
                with contextlib.suppress(Exception):
                    await self._connection.disconnect()
            self._start_grace()
            self._connection = None
        # Spawn the task AFTER releasing the lock
        _LOGGER.info("[%s] Disconnected", self.address)
        self.hass.create_task(self.try_reconnect())

    def _start_grace(self) -> None:
        """Keep the last data and availability for the grace period instead of
        wiping everything on every short drop."""
        if self._disconnected_since is None:
            self._disconnected_since = monotonic()
        if self._grace_period <= 0:
            self.hass.add_job(self.async_set_updated_data, None)
            return
        if self._grace_timer is None:
            self._grace_timer = self.hass.loop.call_later(
                self._grace_period, self._grace_expired
            )
        # entities re-evaluate (they stay available, with their old data)
        self.hass.add_job(self.async_update_listeners)

    # @callback removed – the function is invoked via create_task, not called directly
    async def handle_notify(self, message: bytearray) -> None:
        _LOGGER.debug("Message received: %s", message)
        if len(message) < 10:
            _LOGGER.debug("Ignoring short message")
            return
        full_message = self._accumulator.accumulate_message(message)
        if full_message is not None:
            _LOGGER.debug(
                "Full message: %s",
                full_message,
            )
            self.async_set_updated_data(full_message)

    async def send_command(self, command: Command) -> None:
        _LOGGER.debug("Sending command %s:%s", command.index, command.value)
        async with self._connection_lock:
            if self._connection is None or not self._connection.is_connected:
                _LOGGER.warning("Cannot send command: not connected")
                raise HomeAssistantError("Device not connected")
            payload = bytearray([2, 4, 0, 4, 0, command.index, 1, command.value])
            try:
                await self._connection.write_gatt_char(
                    "0000ac01-0000-1000-8000-00805F9B34FB",
                    payload,
                )
            except Exception as e:
                _LOGGER.error("Failed to send command: %s", e)
                raise
            _LOGGER.debug("Command sent")

    @property
    def is_connected(self) -> bool:
        return self._connection is not None and self._connection.is_connected

    async def kill(self) -> None:
        _LOGGER.debug("[%s] Killing connection", self.address)
        self.alive = False  # set FIRST, before calling disconnect()
        self._stop_keepalive()
        if self._grace_timer is not None:
            self._grace_timer.cancel()
            self._grace_timer = None
        async with self._connection_lock:
            if self._connection is not None:
                with contextlib.suppress(Exception):
                    await self._connection.disconnect()
            if self._reconnect_interval_task:
                self._reconnect_interval_task()
            _LOGGER.debug("[%s] Connection killed", self.address)
