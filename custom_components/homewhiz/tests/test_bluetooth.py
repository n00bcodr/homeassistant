"""Tests for the Bluetooth coordinator's disconnect handling.

The coordinator is built without DataUpdateCoordinator.__init__, and async code
runs through asyncio.run() from sync tests, so no extra plugin is needed.
Setting up that state requires touching private attributes.
"""

# ruff: noqa: SLF001

import asyncio
from typing import Any
from unittest.mock import Mock, patch

from custom_components.homewhiz.bluetooth import HomewhizBluetoothUpdateCoordinator


class _FakeClient:
    def __init__(self, connected: bool = True) -> None:
        self.disconnect_calls = 0
        self._connected = connected

    @property
    def is_connected(self) -> bool:
        return self._connected

    async def disconnect(self) -> None:
        self.disconnect_calls += 1
        self._connected = False


def _make_coordinator(scheduled: list) -> HomewhizBluetoothUpdateCoordinator:
    coord = object.__new__(HomewhizBluetoothUpdateCoordinator)
    coord.address = "00:11:22:33:44:55"
    coord.alive = True
    coord._connection = None
    coord._connection_lock = asyncio.Lock()
    coord._device = None
    coord._device_lock = asyncio.Lock()
    hass = Mock()
    hass.create_task = scheduled.append
    hass.add_job = Mock()
    coord.hass = hass
    coord.async_update_listeners = Mock()
    coord.async_set_updated_data = Mock()
    coord._grace_period = 180
    coord._disconnected_since = None
    coord._grace_timer = None
    coord._connected_since = None
    coord._deliberate_disconnect = False
    coord._keepalive_interval = 0
    coord._keepalive_unsub = None
    return coord


def test_stale_client_disconnect_is_ignored() -> None:
    scheduled: list = []
    coord = _make_coordinator(scheduled)
    superseded: Any = _FakeClient(connected=False)
    live: Any = _FakeClient()
    coord._connection = live

    asyncio.run(coord.handle_disconnect(superseded))
    for coro in scheduled:
        coro.close()

    assert live.disconnect_calls == 0
    assert coord._connection is live


def test_live_client_disconnect_tears_down() -> None:
    scheduled: list = []
    coord = _make_coordinator(scheduled)
    live: Any = _FakeClient()
    coord._connection = live

    asyncio.run(coord.handle_disconnect(live))
    for coro in scheduled:
        coro.close()

    assert coord._connection is None
    assert live.disconnect_calls == 1


def test_disconnect_without_client_tears_down() -> None:
    """Callers that pass no client (e.g. interval reconnect) keep working."""
    scheduled: list = []
    coord = _make_coordinator(scheduled)
    live: Any = _FakeClient()
    coord._connection = live

    asyncio.run(coord.handle_disconnect())
    for coro in scheduled:
        coro.close()

    assert coord._connection is None
    assert live.disconnect_calls == 1


_NOW = "custom_components.homewhiz.bluetooth.monotonic"


def _drop(coord: HomewhizBluetoothUpdateCoordinator, scheduled: list) -> _FakeClient:
    live: Any = _FakeClient()
    coord._connection = live
    asyncio.run(coord.handle_disconnect(live))
    for coro in scheduled:
        coro.close()
    return live


def test_never_connected_is_unavailable() -> None:
    assert not _make_coordinator([]).available


def test_short_drop_keeps_available_and_data_until_grace_expires() -> None:
    scheduled: list = []
    coord = _make_coordinator(scheduled)
    with patch(_NOW, return_value=100.0):
        _drop(coord, scheduled)
    # data is not wiped, entities are only asked to re-evaluate
    coord.hass.add_job.assert_called_once_with(coord.async_update_listeners)
    coord.hass.loop.call_later.assert_called_once_with(180, coord._grace_expired)
    with patch(_NOW, return_value=279.0):
        assert coord.available
    with patch(_NOW, return_value=281.0):
        assert not coord.available


def test_grace_expiry_clears_data_if_still_disconnected() -> None:
    coord = _make_coordinator([])
    coord._grace_expired()
    coord.async_set_updated_data.assert_called_once_with(None)


def test_grace_expiry_does_nothing_if_reconnected() -> None:
    coord = _make_coordinator([])
    coord._connection = _FakeClient()
    coord._grace_expired()
    coord.async_set_updated_data.assert_not_called()


def test_zero_grace_goes_unavailable_and_clears_data_immediately() -> None:
    scheduled: list = []
    coord = _make_coordinator(scheduled)
    coord._grace_period = 0
    with patch(_NOW, return_value=100.0):
        _drop(coord, scheduled)
        assert not coord.available
    coord.hass.add_job.assert_called_once_with(coord.async_set_updated_data, None)
    coord.hass.loop.call_later.assert_not_called()


def test_repeated_drops_keep_the_first_grace_deadline() -> None:
    scheduled: list = []
    coord = _make_coordinator(scheduled)
    with patch(_NOW, return_value=100.0):
        _drop(coord, scheduled)
    with patch(_NOW, return_value=150.0):
        _drop(coord, scheduled)
    assert coord._disconnected_since == 100.0
    coord.hass.loop.call_later.assert_called_once()
