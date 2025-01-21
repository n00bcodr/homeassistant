import logging
import asyncio
from datetime import timedelta, datetime
import homeassistant.helpers.config_validation as cv
import voluptuous as vol
import requests
import csv
import re
import json
from bs4 import BeautifulSoup
from io import StringIO
from abc import abstractmethod

from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import UnitOfEnergy
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import DOMAIN

LOGGER = logging.getLogger(__name__)

MIN_TIME_BETWEEN_UPDATES = timedelta(minutes=5)

async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Set up the ESB Smart Meter sensor."""
    pass

async def async_setup_entry(hass, entry, async_add_entities):
    """Set up the ESB Smart Meter sensor based on a config entry."""
    username = entry.data["username"]
    password = entry.data["password"]
    mprn = entry.data["mprn"]

    session = async_get_clientsession(hass)
    esb_api = ESBCachingApi(ESBDataApi(hass=hass,
                                       session=session,
                                       username=username,
                                       password=password,
                                       mprn=mprn))

    async_add_entities([
        TodaySensor(esb_api=esb_api, name='ESB Electricity Usage: Today'),
        Last24HoursSensor(esb_api=esb_api, name='ESB Electricity Usage: Last 24 Hours'),
        ThisWeekSensor(esb_api=esb_api, name='ESB Electricity Usage: This Week'),
        Last7DaysSensor(esb_api=esb_api, name='ESB Electricity Usage: Last 7 Days'),
        ThisMonthSensor(esb_api=esb_api, name='ESB Electricity Usage: This Month'),
        Last30DaysSensor(esb_api=esb_api, name='ESB Electricity Usage: Last 30 Days')
    ], True)


class BaseSensor(Entity):
    def __init__(self, *, esb_api, name):
        self._name = name
        self._state = None
        self._esb_api = esb_api

    @property
    def name(self):
        return self._name

    @property
    def state(self):
        return self._state

    @property
    def unit_of_measurement(self):
        return UnitOfEnergy.KILO_WATT_HOUR
    
    @abstractmethod
    def _get_data(self, *, esb_data):
        pass

    async def async_update(self):
        self._state = self._get_data(esb_data=await self._esb_api.fetch())
    
class TodaySensor(BaseSensor):
    def _get_data(self, *, esb_data):
        return esb_data.today


class Last24HoursSensor(BaseSensor):
    def _get_data(self, *, esb_data):
        return esb_data.last_24_hours


class ThisWeekSensor(BaseSensor):
    def _get_data(self, *, esb_data):
        return esb_data.this_week


class Last7DaysSensor(BaseSensor):
    def _get_data(self, *, esb_data):
        return esb_data.last_7_days


class ThisMonthSensor(BaseSensor):
    def _get_data(self, *, esb_data):
        return esb_data.this_month


class Last30DaysSensor(BaseSensor):
    def _get_data(self, *, esb_data):
        return esb_data.last_30_days


class ESBData:
    """Class to manipulate data retrieved from ESB"""
    
    def __init__(self, *, data):
        self._data = data
    
    def __get_data_since(self, *, since):
        return [row
                for row
                in self._data
                if datetime.strptime(row['Read Date and End Time'], '%d-%m-%Y %H:%M') >= since]
    
    def __sum_data_since(self, *, since):
        return sum([float(row['Read Value'])
                    for row
                    in self.__get_data_since(since=since)])
    
    @property
    def today(self):
        return self.__sum_data_since(since=datetime.now().replace(hour=0, minute=0, second=0, microsecond=0))
    
    @property
    def last_24_hours(self):
        return self.__sum_data_since(since=datetime.now() - timedelta(days=1))
    
    @property
    def this_week(self):
        return self.__sum_data_since(since=datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=datetime.now().weekday()))
    
    @property
    def last_7_days(self):
        return self.__sum_data_since(since=datetime.now() - timedelta(days=7))
        
    @property
    def this_month(self):
        return self.__sum_data_since(since=datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0))
    
    @property
    def last_30_days(self):
        return self.__sum_data_since(since=datetime.now() - timedelta(days=30))


class ESBCachingApi:
    """To not poll ESB constantly. The data only updates like once a day anyway."""
    
    def __init__(self, esb_api) -> None:
        self._esb_api = esb_api
        self._cached_data = None
        self._cached_data_timestamp = None
    
    async def fetch(self):
        if self._cached_data_timestamp is None or \
            self._cached_data_timestamp < datetime.now() - MIN_TIME_BETWEEN_UPDATES:
            try:
                self._cached_data = await self._esb_api.fetch()
                self._cached_data_timestamp = datetime.now()
            except Exception as err:
                LOGGER.error("Error fetching data: %s", err)
                self._cached_data = None
                self._cached_data_timestamp = None
                raise err

        return self._cached_data
    

class ESBDataApi:
    """Class for handling the data retrieval."""

    def __init__(self, *, hass, session, username, password, mprn):
        """Initialize the data object."""
        self._hass = hass
        self._session = session
        self._username = username
        self._password = password
        self._mprn = mprn

    def __login(self):

        LOGGER.info("Start session")
        session = requests.Session()

        # Get CSRF token and other stuff
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        })
        login_page = session.get('https://myaccount.esbnetworks.ie/',allow_redirects=True,timeout=10)
        login_page.raise_for_status()
        print("Login Page content %s", login_page.content)

        settings_var = re.findall(r"(?<=var SETTINGS = )\S*;", str(login_page.content))[0][:-1]
        settings = json.loads(settings_var)
        LOGGER.debug("Retrieved CSRF Token for login: %s", settings['csrf'])
        LOGGER.debug("Retrieved Transaction Token: %s", settings['transId'])

        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'x-csrf-token': settings['csrf'],
        })

        # Login
        login_response = session.post(
            'https://login.esbnetworks.ie/esbntwkscustportalprdb2c01.onmicrosoft.com/B2C_1A_signup_signin/SelfAsserted?tx=' + settings['transId'] + '&p=B2C_1A_signup_signin', 
            data={
                'signInName': self._username, 
                'password': self._password, 
                'request_type': 'RESPONSE'
            },
            headers={
                'x-csrf-token': settings['csrf'],
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout=10)
        login_response.raise_for_status()
        
        confirm_login_response = session.get('https://login.esbnetworks.ie/esbntwkscustportalprdb2c01.onmicrosoft.com/B2C_1A_signup_signin/api/CombinedSigninAndSignup/confirmed',
                                             params={
                                                'rememberMe': False,
                                                'csrf_token': settings['csrf'],
                                                'tx': settings['transId'],
                                                'p': 'B2C_1A_signup_signin'
                                             },
                                             timeout=10)
        confirm_login_response.raise_for_status()
        soup = BeautifulSoup(confirm_login_response.content, 'html.parser')
        
        # Find the login form
        form = soup.find('form', {"id": "localAccountForm"})
        if not form:
            raise ValueError("Login form not found on the login page")

        # Validate the Email Address value
        email_info_input = form.find("input", {"name": "Email Address"})
        if email_info_input is None or "value" not in email_info_input.attrs:
            raise ValueError("Email address input element not found on the login page")
        email_info = email_info_input["value"]

        # Validate the Password element
        pass_input = form.find("input", {"name": "Password"})
        if pass_input is None or "value" not in pass_input.attrs:
            raise ValueError("Password input element not found on the login page")
        password = pass_input["value"]

        LOGGER.info("Submitting login form")
        submit=session.post(
            form['action'],
            data={
                'state': state,
                'client_info': client_info,
                'code': code
            },
            timeout=10
        ).raise_for_status()

        LOGGER.info("Status Code %s", submit.status_code)
        LOGGER.info("Logged in Successfully Let's test the page")

        user_welcome_soup = BeautifulSoup(submit.text,'html.parser')
        user_elements = user_welcome_soup.find('h1', class_='esb-title-h1')
        if user_elements.text[:2] == "We":
            print("[!] Confirmed User Login: ", user_elements.text)    # It should return "Welcome, Name Surname"
        else:
            LOGGER.info("[!!!] No Welcome message, User is not logged in.")
            session.close()
        
        return session
    
    def __fetch_data(self, requests_session):
        """Fetch the power usage data from ESB"""
        csv_data_response = requests_session.get('https://myaccount.esbnetworks.ie/DataHub/DownloadHdf?mprn=' + self._mprn,
                                                 timeout=10)
        csv_data_response.raise_for_status()
        csv_data = csv_data_response.content.decode('utf-8')

        return csv_data
    
    def __csv_to_dict(self, csv_data):
        reader = csv.DictReader(StringIO(csv_data))
        return [r for r in reader]

    async def fetch(self):
        session = await self._hass.async_add_executor_job(self.__login)
        csv_data = await self._hass.async_add_executor_job(self.__fetch_data, session)
        data = await self._hass.async_add_executor_job(self.__csv_to_dict, csv_data)
        
        return ESBData(data=data)
