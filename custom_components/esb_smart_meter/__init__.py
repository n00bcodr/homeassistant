from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType
from .const import DOMAIN, LOGGER

PLATFORMS = ["sensor"]

async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the ESB Smart Meter component."""
    # Ensure the domain is registered in the hass.data store
    hass.data.setdefault(DOMAIN, {})
    LOGGER.debug("ESB Smart Meter component initialized.")
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up ESB Smart Meter from a config entry."""
    if DOMAIN not in hass.data:
        hass.data[DOMAIN] = {}

    # Store entry data in hass.data for later use
    hass.data[DOMAIN][entry.entry_id] = entry.data

    # Forward the entry setup to the sensor platform
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    LOGGER.debug(f"Forwarded config entry setup to {PLATFORMS} platforms.")
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    # Unload platforms
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        # Clean up the stored entry data
        hass.data[DOMAIN].pop(entry.entry_id)
        LOGGER.debug(f"Successfully unloaded config entry {entry.entry_id}.")
    
    # If no entries remain, clean up the domain
    if not hass.data[DOMAIN]:
        hass.data.pop(DOMAIN)
        LOGGER.debug("No more entries. Cleaned up domain.")

    return unload_ok