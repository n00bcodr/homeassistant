"""Combines a washer's main state and sub-state into one "machine status".

Kept free of Home Assistant imports so it can be unit tested directly.

Why not just show the sub-state: the machine keeps reporting the sub-state of
the previous cycle (e.g. "remove laundry") while the main state is already
"running" again, so the sub-state is only trusted while running, and the
"cycle complete" status is derived from a real running -> finished transition
seen by this tracker instead.
"""

from __future__ import annotations

STATE_OFF = "device_state_off"
STATE_ON = "device_state_on"
STATE_RUNNING = "device_state_running"
STATE_PAUSED = "device_state_paused"
STATE_DELAY_ACTIVE = "device_state_time_delay_active"
STATE_DELAY_PAUSED = "device_state_time_delay_paused"

SUBSTATE_OPENING_DOOR = "washer_substate_opening_door"
SUBSTATE_REMOVE_LAUNDRY = "washer_substate_remove_laundry"

# Sub-states that describe the running cycle. "remove_laundry" is deliberately
# absent: it is the real end-of-cycle value, but seen while running with time
# left it is a stale value of the last cycle (see update()).
RUNNING_SUBSTATES = {
    "washer_substate_washing": "washing",
    "washer_substate_prewash": "washing",
    "washer_substate_softener": "washing",
    "washer_substate_rinsing": "rinsing",
    "washer_substate_rinse_hold": "rinsing",
    "washer_substate_spin": "spinning",
    "washer_substate_drying": "drying",
    "washer_substate_paused": "paused",
    "washer_substate_time_delay_paused": "paused",
    "washer_substate_door_locked": "door_locked",
    "washer_substate_locking_door": "door_locked",
    "washer_substate_add_laundry": "add_laundry",
    "washer_water_intake": "starting",
    "washer_substate_program_started": "starting",
    "washer_substate_analysing": "starting",
}

STATUS_OPTIONS = [
    "off",
    "idle",
    "delayed_start",
    "starting",
    "running",
    "washing",
    "rinsing",
    "spinning",
    "drying",
    "paused",
    "door_locked",
    "add_laundry",
    "cycle_complete",
    "unavailable",
]


class MachineStatusTracker:
    def __init__(self) -> None:
        self.status: str | None = None
        self._seen_running = False
        self._complete = False

    def reset(self) -> None:
        """Forget the session (machine lost for longer than the grace period)."""
        self.status = None
        self._seen_running = False
        self._complete = False

    def update(
        self,
        state: str | None,
        sub_state: str | None,
        door_open: bool = False,
        remaining: int | None = None,
    ) -> str | None:
        if state == STATE_OFF:
            self._seen_running = self._complete = False
            self.status = "off"
        elif (
            state == STATE_RUNNING
            and sub_state == SUBSTATE_REMOVE_LAUNDRY
            and remaining == 0
        ):
            # finished, though the main state has not left "running" yet
            self._seen_running = False
            self._complete = True
            self.status = "cycle_complete"
        elif state == STATE_RUNNING:
            self._seen_running = True
            self._complete = False
            mapped = RUNNING_SUBSTATES.get(sub_state or "")
            if mapped is None:
                # stale/unknown sub-state: keep what we showed, never "complete"
                mapped = (
                    self.status
                    if self.status in RUNNING_SUBSTATES.values()
                    and self.status != "paused"
                    else "running"
                )
            self.status = mapped
        elif state in (STATE_PAUSED, STATE_DELAY_PAUSED):
            self._seen_running = True
            self._complete = False
            self.status = "paused"
        elif state == STATE_DELAY_ACTIVE:
            self._complete = False
            self.status = "delayed_start"
        elif state == STATE_ON:
            if door_open or sub_state == SUBSTATE_OPENING_DOOR:
                self._seen_running = self._complete = False
            elif self._seen_running:
                self._seen_running = False
                self._complete = True
            self.status = "cycle_complete" if self._complete else "idle"
        # state None / unmapped: keep the last status
        return self.status
