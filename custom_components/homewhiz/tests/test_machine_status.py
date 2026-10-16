"""Rules of the washer "machine status" (pure logic, no Home Assistant)."""

from custom_components.homewhiz.machine_status import MachineStatusTracker

OFF = "device_state_off"
ON = "device_state_on"
RUNNING = "device_state_running"
PAUSED = "device_state_paused"
DELAY = "device_state_time_delay_active"
DELAY_PAUSED = "device_state_time_delay_paused"
WASH = "washer_substate_washing"
RINSE = "washer_substate_rinsing"
SPIN = "washer_substate_spin"
REMOVE = "washer_substate_remove_laundry"
OPENING = "washer_substate_opening_door"


def test_off() -> None:
    assert MachineStatusTracker().update(OFF, REMOVE) == "off"


def test_running_uses_sub_state() -> None:
    t = MachineStatusTracker()
    assert t.update(RUNNING, WASH) == "washing"
    assert t.update(RUNNING, RINSE) == "rinsing"
    assert t.update(RUNNING, SPIN) == "spinning"
    assert t.update(RUNNING, "washer_substate_drying") == "drying"
    assert t.update(RUNNING, "washer_substate_door_locked") == "door_locked"
    assert t.update(RUNNING, "washer_substate_paused") == "paused"


def test_stale_remove_laundry_ignored_while_running_fresh_start() -> None:
    assert MachineStatusTracker().update(RUNNING, REMOVE) == "running"


def test_stale_remove_laundry_ignored_while_running_after_reconnect() -> None:
    """Reconnect: main state running, sub-state still the old cycle's value."""
    t = MachineStatusTracker()
    assert t.update(RUNNING, SPIN) == "spinning"
    assert t.update(RUNNING, REMOVE) == "spinning"
    assert t.update(RUNNING, None) == "spinning"


def test_stale_value_does_not_keep_paused() -> None:
    t = MachineStatusTracker()
    t.update(RUNNING, "washer_substate_paused")
    assert t.update(RUNNING, REMOVE) == "running"


def test_cycle_complete_after_real_running_to_finished() -> None:
    t = MachineStatusTracker()
    t.update(RUNNING, SPIN)
    assert t.update(ON, REMOVE) == "cycle_complete"
    assert t.update(ON, REMOVE) == "cycle_complete"  # stays


def test_cycle_complete_after_pause_then_finish() -> None:
    t = MachineStatusTracker()
    t.update(RUNNING, WASH)
    assert t.update(PAUSED, None) == "paused"
    assert t.update(ON, REMOVE) == "cycle_complete"


def test_no_cycle_complete_on_fresh_start() -> None:
    assert MachineStatusTracker().update(ON, REMOVE) == "idle"


def test_no_cycle_complete_after_reconnect_session_reset() -> None:
    t = MachineStatusTracker()
    t.update(RUNNING, SPIN)
    t.reset()  # lost for longer than the grace period
    assert t.update(ON, REMOVE) == "idle"


def test_cycle_complete_survives_short_drop() -> None:
    """Within the grace period the session is kept, the same data is replayed."""
    t = MachineStatusTracker()
    t.update(RUNNING, SPIN)
    t.update(ON, REMOVE)
    assert t.update(ON, REMOVE) == "cycle_complete"


def test_cycle_complete_cleared_by_door_sub_state() -> None:
    t = MachineStatusTracker()
    t.update(RUNNING, SPIN)
    t.update(ON, REMOVE)
    assert t.update(ON, OPENING) == "idle"
    assert t.update(ON, REMOVE) == "idle"  # does not come back


def test_cycle_complete_cleared_by_door_open_flag() -> None:
    t = MachineStatusTracker()
    t.update(RUNNING, SPIN)
    t.update(ON, REMOVE)
    assert t.update(ON, REMOVE, door_open=True) == "idle"
    assert t.update(ON, REMOVE, door_open=False) == "idle"


def test_cycle_complete_cleared_by_off() -> None:
    t = MachineStatusTracker()
    t.update(RUNNING, SPIN)
    t.update(ON, REMOVE)
    assert t.update(OFF, REMOVE) == "off"
    assert t.update(ON, REMOVE) == "idle"


def test_new_cycle_clears_cycle_complete() -> None:
    t = MachineStatusTracker()
    t.update(RUNNING, SPIN)
    t.update(ON, REMOVE)
    assert t.update(RUNNING, REMOVE) == "running"


def test_delayed_start_and_paused_states() -> None:
    t = MachineStatusTracker()
    assert t.update(DELAY, "washer_substate_time_delay_enabled") == "delayed_start"
    assert t.update(DELAY_PAUSED, None) == "paused"
    assert t.update(PAUSED, None) == "paused"


def test_unknown_state_keeps_last_status() -> None:
    t = MachineStatusTracker()
    t.update(RUNNING, RINSE)
    assert t.update(None, None) == "rinsing"
    assert t.update("device_state_cancelling", None) == "rinsing"


def test_remove_laundry_while_running_with_time_left_is_stale() -> None:
    t = MachineStatusTracker()
    t.update(RUNNING, SPIN, remaining=20)
    assert t.update(RUNNING, REMOVE, remaining=20) == "spinning"


def test_remove_laundry_while_running_with_no_time_left_is_complete() -> None:
    t = MachineStatusTracker()
    t.update(RUNNING, SPIN, remaining=1)
    assert t.update(RUNNING, REMOVE, remaining=0) == "cycle_complete"
    assert t.update(RUNNING, REMOVE, remaining=0) == "cycle_complete"
    assert t.update(ON, OPENING) == "idle"
