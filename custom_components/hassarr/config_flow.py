from urllib.parse import urljoin
import voluptuous as vol
from homeassistant import config_entries
import aiohttp

from .const import DOMAIN

class HassarrConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        if user_input is None:
            return self.async_show_form(
                step_id="user",
                data_schema=vol.Schema({
                    vol.Required("integration_type"): vol.In(["Radarr & Sonarr", "Overseerr"])
                })
            )

        self.integration_type = user_input["integration_type"]
        if self.integration_type == "Radarr & Sonarr":
            return await self.async_step_radarr_sonarr()
        else:
            return await self.async_step_overseerr()
    
    async def async_step_reconfigure(self, user_input=None):
        """Handle reconfiguration of an existing entry."""
        if user_input is not None:
            self.integration_type = user_input["integration_type"]
            if self.integration_type == "Radarr & Sonarr":
                return await self.async_step_reconfigure_radarr_sonarr()
            else:
                return await self.async_step_reconfigure_overseerr()

        # Get existing data to pre-fill the form
        existing_data = self._get_reconfigure_entry().data
        integration_type = existing_data.get("integration_type", "Radarr & Sonarr")

        return self.async_show_form(
            step_id="reconfigure",
            data_schema=vol.Schema({
                vol.Required("integration_type", default=integration_type): vol.In(["Radarr & Sonarr", "Overseerr"]),
            })
        )


    async def async_step_reconfigure_overseerr(self, user_input=None):
        """Handle reconfiguration for Overseerr."""
        if user_input is not None:
            # Update the existing config entry
            data = dict(self._get_reconfigure_entry().data)
            data.update(user_input)
            self.hass.config_entries.async_update_entry(
                self._get_reconfigure_entry(),
                data=data
            )
            return await self.async_step_reconfigure_overseerr_user()

        # Get existing data to pre-fill the form
        existing_data = self._get_reconfigure_entry().data

        return self.async_show_form(
            step_id="reconfigure_overseerr",
            data_schema=vol.Schema({
                vol.Optional("overseerr_url", default=existing_data.get("overseerr_url", "")): str,
                vol.Optional("overseerr_api_key", default=existing_data.get("overseerr_api_key", "")): str,
            })
        )

    async def async_step_reconfigure_overseerr_user(self, user_input=None):
        """Handle reconfiguration for Overseerr user selection."""
        if user_input is not None:
            # Update the existing config entry
            data = dict(self._get_reconfigure_entry().data)
            data.update(user_input)
            self.hass.config_entries.async_update_entry(
                self._get_reconfigure_entry(),
                data=data
            )
            return self.async_update_reload_and_abort(
                self._get_reconfigure_entry(),
                data_updates=user_input,
            )

        # Get existing data to pre-fill the form
        existing_data = self._get_reconfigure_entry().data
        overseerr_url = existing_data.get("overseerr_url")
        overseerr_api_key = existing_data.get("overseerr_api_key")

        # Fetch users from Overseerr API
        users = await self._fetch_overseerr_users(overseerr_url, overseerr_api_key)
        user_options = {user["id"]: user["username"] for user in users}

        return self.async_show_form(
            step_id="reconfigure_overseerr_user",
            data_schema=vol.Schema({
                vol.Required("overseerr_user_id"): vol.In(user_options),
            })
        )

    async def async_step_reconfigure_radarr_sonarr(self, user_input=None):
        """Handle reconfiguration for Radarr & Sonarr."""
        if user_input is not None:
            # Update the existing config entry
            data = dict(self._get_reconfigure_entry().data)
            data.update(user_input)
            self.hass.config_entries.async_update_entry(
                self._get_reconfigure_entry(),
                data=data
            )
            return await self.async_step_reconfigure_radarr_sonarr_quality_profiles()

        # Get existing data to pre-fill the form
        existing_data = self._get_reconfigure_entry().data

        return self.async_show_form(
            step_id="reconfigure_radarr_sonarr",
            data_schema=vol.Schema({
                vol.Optional("radarr_url", default=existing_data.get("radarr_url", "")): str,
                vol.Optional("sonarr_url", default=existing_data.get("sonarr_url", "")): str,
                vol.Optional("radarr_api_key", default=existing_data.get("radarr_api_key", "")): str,
                vol.Optional("sonarr_api_key", default=existing_data.get("sonarr_api_key", "")): str,
            })
        )

    async def async_step_reconfigure_radarr_sonarr_quality_profiles(self, user_input=None):
        """Handle reconfiguration for Radarr & Sonarr quality profiles."""
        if user_input is not None:
            # Update the existing config entry
            data = dict(self._get_reconfigure_entry().data)
            data.update(user_input)
            self.hass.config_entries.async_update_entry(
                self._get_reconfigure_entry(),
                data=data
            )
            return self.async_update_reload_and_abort(
                self._get_reconfigure_entry(),
                data_updates=user_input,
            )

        # Get existing data to pre-fill the form
        existing_data = self._get_reconfigure_entry().data
        radarr_url = existing_data.get("radarr_url")
        radarr_api_key = existing_data.get("radarr_api_key")
        sonarr_url = existing_data.get("sonarr_url")
        sonarr_api_key = existing_data.get("sonarr_api_key")

        # Fetch quality profiles from Radarr and Sonarr APIs
        radarr_profiles = await self._fetch_quality_profiles(radarr_url, radarr_api_key)
        sonarr_profiles = await self._fetch_quality_profiles(sonarr_url, sonarr_api_key)

        radarr_options = {profile["id"]: profile["name"] for profile in radarr_profiles}
        sonarr_options = {profile["id"]: profile["name"] for profile in sonarr_profiles}

        return self.async_show_form(
            step_id="reconfigure_radarr_sonarr_quality_profiles",
            data_schema=vol.Schema({
                vol.Required("radarr_quality_profile_id"): vol.In(radarr_options),
                vol.Required("sonarr_quality_profile_id"): vol.In(sonarr_options),
            })
        )

    async def async_step_radarr_sonarr(self, user_input=None):
        if user_input is None:
            return self.async_show_form(step_id="radarr_sonarr", data_schema=self._get_radarr_sonarr_schema())

        # Validate user input
        errors = {}
        if not user_input.get("radarr_url") or not user_input.get("radarr_api_key"):
            errors["base"] = "missing_radarr_info"
        if not user_input.get("sonarr_url") or not user_input.get("sonarr_api_key"):
            errors["base"] = "missing_sonarr_info"

        if errors:
            return self.async_show_form(step_id="radarr_sonarr", data_schema=self._get_radarr_sonarr_schema(), errors=errors)

        # Save the radarr_url and radarr_api_key and proceed to quality profile selection step
        self.radarr_url = user_input["radarr_url"]
        self.radarr_api_key = user_input["radarr_api_key"]
        self.sonarr_url = user_input["sonarr_url"]
        self.sonarr_api_key = user_input["sonarr_api_key"]
        return await self.async_step_radarr_sonarr_quality_profiles()

    async def async_step_radarr_sonarr_quality_profiles(self, user_input=None):
        if user_input is None:
            # Fetch quality profiles from Radarr and Sonarr APIs
            radarr_profiles = await self._fetch_quality_profiles(self.radarr_url, self.radarr_api_key)
            sonarr_profiles = await self._fetch_quality_profiles(self.sonarr_url, self.sonarr_api_key)

            radarr_options = {profile["id"]: profile["name"] for profile in radarr_profiles}
            sonarr_options = {profile["id"]: profile["name"] for profile in sonarr_profiles}

            return self.async_show_form(
                step_id="radarr_sonarr_quality_profiles",
                data_schema=vol.Schema({
                    vol.Required("radarr_quality_profile_id"): vol.In(radarr_options),
                    vol.Required("sonarr_quality_profile_id"): vol.In(sonarr_options),
                })
            )

        # Create the entry with the selected quality profile IDs
        user_input.update({
            "radarr_url": self.radarr_url,
            "radarr_api_key": self.radarr_api_key,
            "sonarr_url": self.sonarr_url,
            "sonarr_api_key": self.sonarr_api_key
        })
        return self.async_create_entry(title="Hassarr", data=user_input)

    async def async_step_overseerr(self, user_input=None):
        if user_input is None:
            return self.async_show_form(step_id="overseerr", data_schema=self._get_overseerr_schema())

        # Validate user input
        errors = {}
        if not user_input.get("overseerr_url") or not user_input.get("overseerr_api_key"):
            errors["base"] = "missing_overseerr_info"

        if errors:
            return self.async_show_form(step_id="overseerr", data_schema=self._get_overseerr_schema(), errors=errors)

        # Save the overseerr_url and overseerr_api_key and proceed to user selection step
        self.overseerr_url = user_input["overseerr_url"]
        self.overseerr_api_key = user_input["overseerr_api_key"]
        return await self.async_step_overseerr_user()

    async def async_step_overseerr_user(self, user_input=None):
        if user_input is None:
            # Fetch users from Overseerr API
            users = await self._fetch_overseerr_users(self.overseerr_url, self.overseerr_api_key)
            user_options = {user["id"]: user["username"] for user in users}

            return self.async_show_form(
                step_id="overseerr_user",
                data_schema=vol.Schema({
                    vol.Required("overseerr_user_id"): vol.In(user_options),
                })
            )

        # Create the entry with the selected user ID
        user_input.update({
            "overseerr_url": self.overseerr_url,
            "overseerr_api_key": self.overseerr_api_key
        })
        return self.async_create_entry(title="Hassarr", data=user_input)

    async def _fetch_overseerr_users(self, url, api_key):
        """Fetch users from the Overseerr API."""
        async with aiohttp.ClientSession() as session:
            url = urljoin(url, "api/v1/user")
            async with session.get(url, headers={"X-Api-Key": api_key}) as response:
                response.raise_for_status()
                data = await response.json()
                return data["results"]

    async def _fetch_quality_profiles(self, url, api_key):
        """Fetch quality profiles from the Radarr/Sonarr API."""
        async with aiohttp.ClientSession() as session:
            url = urljoin(url, "api/v3/qualityprofile")
            async with session.get(url, headers={"X-Api-Key": api_key}) as response:
                response.raise_for_status()
                data = await response.json()
                return data

    @staticmethod
    def _get_radarr_sonarr_schema():
        return vol.Schema({
            vol.Required("radarr_url"): str,
            vol.Required("radarr_api_key"): str,
            vol.Required("sonarr_url"): str,
            vol.Required("sonarr_api_key"): str,
        })

    @staticmethod
    def _get_overseerr_schema():
        return vol.Schema({
            vol.Required("overseerr_url"): str,
            vol.Required("overseerr_api_key"): str
        })