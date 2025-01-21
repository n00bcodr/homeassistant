import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers import entity_registry
from .const import DOMAIN, LOGGER

@callback
def configured_instances(hass):
    """Return a set of configured instances."""
    return {entry.data["mprn"] for entry in hass.config_entries.async_entries(DOMAIN)}

class ESBSmartMeterConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for ESB Smart Meter."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_CLOUD_POLL

    async def async_step_user(self, user_input=None):
        """Handle the initial user configuration step."""
        errors = {}

        if user_input is not None:
            if user_input["mprn"] in configured_instances(self.hass):
                # Use translations for the error message
                errors["base"] = self.hass.localize("esb_smart_meter.error_mprn_exists")
            else:
                try:
                    # Placeholder for API validation (if required)
                    # await validate_credentials(user_input["username"], user_input["password"])
                    return self.async_create_entry(title="ESB Smart Meter", data=user_input)
                except Exception as e:
                    LOGGER.error("Error validating credentials: %s", e)
                    errors["base"] = self.hass.localize("esb_smart_meter.error_connection_error")

        # Define the data schema
        data_schema = vol.Schema({
            vol.Required("username"): str,
            vol.Required("password"): str,
            vol.Required("mprn"): str,
        })

        # Return the form with any errors
        return self.async_show_form(step_id="user", data_schema=data_schema, errors=errors)
