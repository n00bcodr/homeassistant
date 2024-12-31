import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers.typing import ConfigType
from homeassistant.config_entries import ConfigEntry
import homeassistant.helpers.config_validation as cv
from .services import handle_add_media, handle_add_overseerr_media
from .const import DOMAIN, SERVICE_ADD_RADARR_MOVIE, SERVICE_ADD_SONARR_TV_SHOW, SERVICE_ADD_OVERSEERR_MOVIE, SERVICE_ADD_OVERSEERR_TV_SHOW

ADD_RADARR_MOVIE_SCHEMA = vol.Schema({
    vol.Required("title"): cv.string,
})

ADD_SONARR_TV_SHOW_SCHEMA = vol.Schema({
    vol.Required("title"): cv.string,
})

ADD_OVERSEERR_MOVIE_SCHEMA = vol.Schema({
    vol.Required("title"): cv.string,
})

ADD_OVERSEERR_TV_SHOW_SCHEMA = vol.Schema({
    vol.Required("title"): cv.string,
})

def handle_add_movie(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle the service action to add a movie to Radarr.

    Args:
        hass (HomeAssistant): The Home Assistant instance.
        call (ServiceCall): The service call object.
    """
    handle_add_media(hass, call, "movie", "radarr")

def handle_add_tv_show(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle the service action to add a TV show to Sonarr.

    Args:
        hass (HomeAssistant): The Home Assistant instance.
        call (ServiceCall): The service call object.
    """
    handle_add_media(hass, call, "series", "sonarr")

def handle_add_overseerr_movie(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle the service action to add a movie to Overseerr.

    Args:
        hass (HomeAssistant): The Home Assistant instance.
        call (ServiceCall): The service call object.
    """
    handle_add_overseerr_media(hass, call, "movie")

def handle_add_overseerr_tv_show(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle the service action to add a TV show to Overseerr.

    Args:
        hass (HomeAssistant): The Home Assistant instance.
        call (ServiceCall): The service call object.
    """
    handle_add_overseerr_media(hass, call, "tv")

def setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Hassarr integration.

    Args:
        hass (HomeAssistant): The Home Assistant instance.
        config (ConfigType): The configuration dictionary.

    Returns:
        bool: True if setup was successful, False otherwise.
    """
    hass.services.register(DOMAIN, SERVICE_ADD_RADARR_MOVIE, lambda call: handle_add_movie(hass, call), schema=ADD_RADARR_MOVIE_SCHEMA)
    hass.services.register(DOMAIN, SERVICE_ADD_SONARR_TV_SHOW, lambda call: handle_add_tv_show(hass, call), schema=ADD_SONARR_TV_SHOW_SCHEMA)
    hass.services.register(DOMAIN, SERVICE_ADD_OVERSEERR_MOVIE, lambda call: handle_add_overseerr_movie(hass, call), schema=ADD_OVERSEERR_MOVIE_SCHEMA)
    hass.services.register(DOMAIN, SERVICE_ADD_OVERSEERR_TV_SHOW, lambda call: handle_add_overseerr_tv_show(hass, call), schema=ADD_OVERSEERR_TV_SHOW_SCHEMA)

    # Return boolean to indicate that initialization was successful.
    return True

async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Set up Hassarr from a config entry.

    Args:
        hass (HomeAssistant): The Home Assistant instance.
        config_entry (ConfigEntry): The configuration entry.

    Returns:
        bool: True if setup was successful, False otherwise.
    """
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN] = config_entry.data

    # Register services
    hass.services.async_register(DOMAIN, SERVICE_ADD_RADARR_MOVIE, lambda call: handle_add_movie(hass, call), schema=ADD_RADARR_MOVIE_SCHEMA)
    hass.services.async_register(DOMAIN, SERVICE_ADD_SONARR_TV_SHOW, lambda call: handle_add_tv_show(hass, call), schema=ADD_SONARR_TV_SHOW_SCHEMA)
    hass.services.async_register(DOMAIN, SERVICE_ADD_OVERSEERR_MOVIE, lambda call: handle_add_overseerr_movie(hass, call), schema=ADD_OVERSEERR_MOVIE_SCHEMA)
    hass.services.async_register(DOMAIN, SERVICE_ADD_OVERSEERR_TV_SHOW, lambda call: handle_add_overseerr_tv_show(hass, call), schema=ADD_OVERSEERR_TV_SHOW_SCHEMA)

    # Register update listener
    config_entry.async_on_unload(config_entry.add_update_listener(update_listener))

    return True

async def update_listener(hass: HomeAssistant, config_entry: ConfigEntry) -> None:
    """Handle options update."""
    hass.data[DOMAIN] = config_entry.data