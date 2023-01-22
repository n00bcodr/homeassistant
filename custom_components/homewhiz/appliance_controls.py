import logging
from abc import ABC, abstractmethod
from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass, fields
from typing import Any, Generic, Optional, TypeVar

from bidict import bidict
from homeassistant.components.climate import (  # type: ignore[import]
    SWING_BOTH,
    SWING_HORIZONTAL,
    SWING_OFF,
    SWING_VERTICAL,
    HVACMode,
)

from custom_components.homewhiz.appliance_config import (
    ApplianceConfiguration,
    ApplianceFeature,
    ApplianceFeatureBoundedOption,
    ApplianceFeatureEnumOption,
    ApplianceProgram,
    ApplianceProgress,
    ApplianceProgressFeature,
    ApplianceRemoteControl,
    ApplianceState,
    ApplianceSubState,
    ApplianceWarning,
)
from custom_components.homewhiz.helper import unit_for_key

from .homewhiz import Command

_LOGGER: logging.Logger = logging.getLogger(__package__)


def clamp(value: int) -> int:
    return value if value < 128 else value - 128


class Control(ABC):
    key: str

    def get_value(self, data: bytearray) -> Any:
        pass


class DebugControl(Control):
    def __init__(self, key: str, read_index: int):
        self.key = key
        self.read_index = read_index

    def get_value(self, data: bytearray) -> Any:
        return data[self.read_index]


_Options = TypeVar("_Options", bound=Mapping[int, str])


class EnumControl(Control, Generic[_Options]):
    def __init__(self, key: str, read_index: int, options: _Options):
        self.key = key
        self.read_index = read_index
        self.options = options

    def get_value(self, data: bytearray) -> str | None:
        byte = clamp(data[self.read_index])
        if byte in self.options:
            return self.options[byte]
        return None


class WriteEnumControl(EnumControl[bidict[int, str]]):
    def __init__(
        self, key: str, read_index: int, write_index: int, options: bidict[int, str]
    ):
        super().__init__(key, read_index, options)
        self.write_index = write_index

    def set_value(self, value: str) -> Command:
        byte = self.options.inverse[value]
        return Command(self.write_index, byte)


class NumericControl(Control):
    def __init__(
        self, key: str, read_index: int, bounds: ApplianceFeatureBoundedOption
    ):
        self.key = key
        self.read_index = read_index
        self.bounds = bounds

    def get_value(self, data: bytearray) -> float | None:
        byte = clamp(data[self.read_index])
        return byte * self.bounds.factor


class WriteNumericControl(NumericControl):
    def __init__(
        self,
        key: str,
        read_index: int,
        write_index: int,
        bounds: ApplianceFeatureBoundedOption,
    ):
        super().__init__(key, read_index, bounds)
        self.write_index = write_index

    def set_value(self, value: float) -> Command:
        return Command(index=self.write_index, value=int(value / self.bounds.factor))


class TimeControl(Control):
    def __init__(self, key: str, hour_index: int, minute_index: Optional[int]):
        self.key = key
        self.hour_index = hour_index
        self.minute_index = minute_index

    def get_value(self, data: bytearray) -> int:
        hours = clamp(data[self.hour_index])
        minutes = clamp(data[self.minute_index]) if self.minute_index is not None else 0
        return hours * 60 + minutes


class BooleanControl(Control):
    @abstractmethod
    def get_value(self, data: bytearray) -> bool:
        pass


class BooleanCompareControl(BooleanControl):
    def __init__(self, key: str, read_index: int, compare_value: int):
        self.key = key
        self.read_index = read_index
        self.compare_value = compare_value

    def get_value(self, data: bytearray) -> bool:
        return data[self.read_index] == self.compare_value


class BooleanBitmaskControl(BooleanControl):
    def __init__(self, key: str, read_index: int, bit: int):
        self.key = key
        self.read_index = read_index
        self.bit = bit

    def get_value(self, data: bytearray) -> bool:
        return data[self.read_index] & (1 << self.bit) != 0


@dataclass
class WriteBooleanControl(BooleanControl):
    def __init__(
        self, key: str, read_index: int, write_index: int, value_on: int, value_off: int
    ):
        self.key = key
        self.read_index = read_index
        self.write_index = write_index
        self.value_on = value_on
        self.value_off = value_off

    def get_value(self, data: bytearray) -> bool:
        byte = clamp(data[self.read_index])
        return byte == self.value_on

    def set_value(self, value: bool) -> Command:
        return Command(
            index=self.write_index, value=self.value_on if value else self.value_off
        )


class DisabledSwingAxisControl(Control):
    key = "DISABLED"
    enabled = False

    def get_value(self, data: bytearray) -> bool:
        return False

    def set_value(self, value: bool, current_data: bytearray) -> list[Command]:
        return []


class SwingAxisControl(Control):
    enabled = True

    def __init__(self, parent: WriteEnumControl):
        self.key = parent.key
        self.parent = parent

    def get_value(self, data: bytearray) -> bool:
        option = self.parent.get_value(data)
        return option is not None and not option.endswith("_OFF")

    def _option_with_suffix(self, suffix: str) -> Optional[str]:
        return next(
            (
                option
                for option in self.parent.options.values()
                if option.endswith(suffix)
            ),
            None,
        )

    def set_value(self, value: bool, current_data: bytearray) -> list[Command]:
        current_value = self.get_value(current_data)
        if current_value == value:
            return []
        selected_option = (
            self._option_with_suffix("_AUTO")
            if value
            else self._option_with_suffix("_OFF")
        )
        if selected_option is None:
            raise Exception(f"Cannot change swing for axis {self.key}")
        return [self.parent.set_value(selected_option)]


def build_swing_control_from_optional(
    parent: Optional[WriteEnumControl],
) -> DisabledSwingAxisControl | SwingAxisControl:
    if parent is None:
        return DisabledSwingAxisControl()
    return SwingAxisControl(parent)


class SwingControl(Control):
    key = "SWING"

    def __init__(
        self,
        horizontal: Optional[WriteEnumControl],
        vertical: Optional[WriteEnumControl],
    ):
        self.horizontal = build_swing_control_from_optional(horizontal)
        self.vertical = build_swing_control_from_optional(vertical)
        self.enabled = self.horizontal.enabled or self.vertical.enabled

    @property
    def options(self) -> list[str]:
        result: list[str] = [SWING_OFF]
        if self.horizontal.enabled:
            result.append(SWING_HORIZONTAL)
        if self.vertical.enabled:
            result.append(SWING_VERTICAL)
        if self.horizontal.enabled and self.vertical.enabled:
            result.append(SWING_BOTH)
        return result

    def get_value(self, data: bytearray) -> str:
        value_horizontal = self.horizontal.get_value(data)
        value_vertical = self.vertical.get_value(data)
        if value_horizontal and value_vertical:
            return SWING_BOTH
        if value_horizontal:
            return SWING_HORIZONTAL
        if value_vertical:
            return SWING_VERTICAL
        return SWING_OFF

    def set_value(self, value: str, current_data: bytearray) -> list[Command]:
        value_horizontal = value == SWING_HORIZONTAL or value == SWING_BOTH
        value_vertical = value == SWING_VERTICAL or value == SWING_BOTH
        return self.horizontal.set_value(
            value_horizontal, current_data
        ) + self.vertical.set_value(value_vertical, current_data)


program_suffix_to_hvac_mode = {
    "COOLING": HVACMode.COOL,
    "AUTO": HVACMode.AUTO,
    "DRY": HVACMode.DRY,
    "DEHUMIDIFICATION": HVACMode.DRY,
    "HEATING": HVACMode.HEAT,
    "FAN": HVACMode.FAN_ONLY,
}


class HvacControl(Control):
    key = "HVAC"

    def __init__(self, program: WriteEnumControl, state: WriteBooleanControl):
        self.program = program
        self.state = state
        self._program_dict = bidict(
            {
                option: program_suffix_to_hvac_mode[option.split("_")[-1]]
                for option in program.options.values()
            }
        )

    def _hvac_mode_raw(self, data: bytearray) -> HVACMode | None:
        option = self.program.get_value(data)
        if option is None:
            return None
        return self._program_dict[option]

    def get_value(self, data: bytearray) -> HVACMode | None:
        if not self.state.get_value(data):
            return HVACMode.OFF
        return self._hvac_mode_raw(data)

    def set_value(self, hvac_mode: HVACMode, current_data: bytearray) -> list[Command]:
        if hvac_mode == HVACMode.OFF:
            return [self.state.set_value(False)]
        result: list[Command] = []
        if not self.state.get_value(current_data):
            result.append(self.state.set_value(True))
        if self._hvac_mode_raw(current_data) != hvac_mode:
            program_key = self._program_dict.inverse.get(hvac_mode)
            if program_key is None:
                raise Exception(f"Unrecognized fan mode {hvac_mode}")
            result.append(self.program.set_value(program_key))
        return result

    @property
    def options(self) -> list[HVACMode]:
        return [
            self._program_dict[program] for program in self.program.options.values()
        ] + [HVACMode.OFF]


class ClimateControl(Control):
    key = "AC"

    def __init__(
        self,
        hvac_mode: HvacControl,
        target_temperature: WriteNumericControl,
        current_temperature: NumericControl,
        fan_mode: WriteEnumControl,
        swing: SwingControl,
    ):
        self.hvac_mode = hvac_mode
        self.target_temperature = target_temperature
        self.current_temperature = current_temperature
        self.fan_mode = fan_mode
        self.swing = swing
        self._controls = [
            hvac_mode,
            target_temperature,
            current_temperature,
            fan_mode,
            swing,
        ]

    def get_value(self, data: bytearray) -> dict[str, Any]:
        return {c.key: c.get_value(data) for c in self._controls}


def get_bounded_values_options(
    key: str, values: ApplianceFeatureBoundedOption
) -> bidict[int, str]:
    result: bidict[int, str] = bidict()
    value = float(values.lowerLimit)
    while value <= values.upperLimit:
        wifiValue = int(value / values.factor)
        unit = unit_for_key(key)
        value_str = f"{value:g}"
        name = f"{value_str} {unit}" if unit is not None else value_str
        result[wifiValue] = name
        value += values.step
    return result


def get_options_from_feature(key: str, feature: ApplianceFeature) -> bidict[int, str]:
    options: bidict[int, str] = bidict()
    if feature.enumValues is not None:
        options = options | {
            option.wifiArrayValue: option.strKey for option in feature.enumValues
        }
    if feature.boundedValues is not None:
        for boundedValues in feature.boundedValues:
            options = get_bounded_values_options(key, boundedValues) | options
    return bidict(sorted(options.items()))


def get_options_from_enum_options(
    options: Sequence[ApplianceFeatureEnumOption],
) -> dict[int, str]:
    return {option.wifiArrayValue: option.strKey for option in options}


def build_read_control_from_feature(feature: ApplianceFeature) -> Optional[Control]:
    key = feature.strKey
    if key is None:
        return None
    if (
        feature.enumValues is None
        and feature.boundedValues is not None
        and len(feature.boundedValues) == 1
    ):
        return NumericControl(
            key=key,
            read_index=feature.wifiArrayIndex,
            bounds=feature.boundedValues[0],
        )
    return EnumControl(
        key=key,
        read_index=feature.wifiArrayIndex,
        options=get_options_from_feature(key, feature),
    )


def build_write_control_from_feature(feature: ApplianceFeature) -> Optional[Control]:
    write_index = (
        feature.wfaWriteIndex
        if feature.wfaWriteIndex is not None
        else feature.wifiArrayIndex
    )
    key = feature.strKey
    if key is None:
        return None
    if (
        feature.enumValues is None
        and feature.boundedValues is not None
        and len(feature.boundedValues) == 1
    ):
        return WriteNumericControl(
            key=key,
            read_index=feature.wifiArrayIndex,
            write_index=write_index,
            bounds=feature.boundedValues[0],
        )
    return WriteEnumControl(
        key=key,
        read_index=feature.wifiArrayIndex,
        write_index=write_index,
        options=get_options_from_feature(key, feature),
    )


def build_control_from_program(program: ApplianceProgram) -> Control:
    return WriteEnumControl(
        key=program.strKey,
        read_index=program.wifiArrayIndex,
        write_index=(
            program.wfaWriteIndex
            if program.wfaWriteIndex is not None
            else program.wifiArrayIndex
        ),
        options=bidict(get_options_from_enum_options(program.values)),
    )


def build_control_from_substate(
    sub_states: Optional[ApplianceSubState],
) -> Optional[Control]:
    if sub_states is None:
        return None
    return EnumControl(
        key="SUB_STATE",
        read_index=sub_states.wifiArrayReadIndex,
        options=get_options_from_enum_options(sub_states.subStates),
    )


def build_controls_from_monitorings(
    monitorings: Optional[list[ApplianceFeature]],
) -> Iterable[Optional[Control]]:
    if monitorings is None:
        return []
    return map(build_read_control_from_feature, monitorings)


def build_control_from_state(state: Optional[ApplianceState]) -> Optional[Control]:
    if state is None:
        return None
    read_index = state.wifiArrayReadIndex
    write_index = (
        state.wifiArrayWriteIndex
        if state.wifiArrayWriteIndex is not None
        else state.wfaIndex
    )
    if read_index is None or write_index is None:
        return None
    return WriteEnumControl(
        key="STATE",
        read_index=read_index,
        write_index=write_index,
        options=bidict(get_options_from_enum_options(state.states)),
    )


def build_controls_from_progress_variables(
    progress_variables: Optional[ApplianceProgress],
) -> list[Control]:
    if progress_variables is None:
        return []
    result: list[Control] = []
    for field in fields(progress_variables):
        feature: Optional[ApplianceProgressFeature] = getattr(
            progress_variables, field.name
        )
        if feature is not None:
            result.append(
                TimeControl(
                    key=feature.strKey,
                    hour_index=feature.hour.wifiArrayIndex,
                    minute_index=feature.minute.wifiArrayIndex
                    if feature.minute is not None
                    else None,
                )
            )
    return result


def build_control_from_remote_control(
    remote_control: Optional[ApplianceRemoteControl],
) -> Optional[Control]:
    if remote_control is None:
        return None
    return BooleanCompareControl(
        key="REMOTE_CONTROL",
        read_index=remote_control.wifiArrayReadIndex,
        compare_value=remote_control.wifiArrayValue,
    )


def build_controls_from_warnings(warnings: Optional[ApplianceWarning]) -> list[Control]:
    if warnings is None:
        return []

    return [
        BooleanBitmaskControl(
            key=warn.strKey, read_index=warnings.wifiArrayReadIndex, bit=warn.bitIndex
        )
        for warn in warnings.warnings
    ]


def build_controls_from_features(
    settings: Optional[list[ApplianceFeature]],
) -> list[Optional[Control]]:
    if settings is None:
        return []

    return [build_write_control_from_feature(s) for s in settings]


def convert_to_bool_control_if_possible(control: Control) -> Control:
    if not isinstance(control, WriteEnumControl):
        return control
    options = control.options.inverse
    option_keys = list(options.keys())
    option_keys.sort()
    if (
        len(option_keys) == 2
        and option_keys[0].endswith("_OFF")
        and option_keys[1].endswith("_ON")
    ):
        return WriteBooleanControl(
            key=control.key,
            read_index=control.read_index,
            write_index=control.write_index,
            value_off=options[option_keys[0]],
            value_on=options[option_keys[1]],
        )
    return control


def extract_ac_control(controls: list[Control]) -> list[Control]:
    controls_dict = {control.key: control for control in controls}
    keys = controls_dict.keys()
    if "AIR_CONDITIONER_PROGRAM" in keys:
        state = controls_dict["STATE"]
        assert isinstance(state, WriteBooleanControl)
        program = controls_dict["AIR_CONDITIONER_PROGRAM"]
        assert isinstance(program, WriteEnumControl)
        current_temperature = controls_dict["AIR_CONDITIONER_ROOM_TEMPERATURE"]
        assert isinstance(current_temperature, NumericControl)
        target_temperature = controls_dict["AIR_CONDITIONER_TARGET_TEMPERATURE"]
        assert isinstance(target_temperature, WriteNumericControl)
        fan_mode = controls_dict["AIR_CONDITIONER_WIND_STRENGTH"]
        assert isinstance(fan_mode, WriteEnumControl)
        vertical_swing_control = controls_dict.get(
            "AIR_CONDITIONER_UP_DOWN_VANE_CONTROL"
        )
        assert vertical_swing_control is None or isinstance(
            vertical_swing_control, WriteEnumControl
        )
        horizontal_swing_control = controls_dict.get(
            "AIR_CONDITIONER_LEFT_RIGHT_VANE_CONTROL"
        )
        assert horizontal_swing_control is None or isinstance(
            horizontal_swing_control, WriteEnumControl
        )

        climate = ClimateControl(
            hvac_mode=HvacControl(program, state),
            current_temperature=current_temperature,
            target_temperature=target_temperature,
            fan_mode=fan_mode,
            swing=SwingControl(horizontal_swing_control, vertical_swing_control),
        )
        excluded_controls = [
            program,
            state,
            current_temperature,
            target_temperature,
            fan_mode,
        ]
        return [c for c in controls if c not in excluded_controls] + [climate]
    return controls


def generate_controls_from_config(
    config: ApplianceConfiguration,
) -> list[Control]:
    possible_controls: list[Control | None] = [
        build_control_from_state(config.deviceStates),
        build_control_from_program(config.program),
        build_control_from_substate(config.deviceSubStates),
        *build_controls_from_features(config.subPrograms),
        *build_controls_from_features(config.customSubPrograms),
        *build_controls_from_monitorings(config.monitorings),
        *build_controls_from_progress_variables(config.progressVariables),
        build_control_from_remote_control(config.remoteControl),
        *build_controls_from_warnings(config.deviceWarnings),
        *build_controls_from_warnings(config.warnings),
        *build_controls_from_features(config.settings),
    ]
    controls = [
        convert_to_bool_control_if_possible(control)
        for control in possible_controls
        if control is not None
    ]
    controls = extract_ac_control(controls)

    return controls
