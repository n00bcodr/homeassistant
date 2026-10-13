"""Govee cloud login + AWS IoT client for a single H713B heater.

Ported from the homebridge-govee plugin's lib/connection/http.js and
lib/connection/aws.js: log in with an email/password like the Govee app does,
fetch a per-account AWS IoT client certificate, then publish/subscribe
"multiSync" commands on the device's MQTT topic.
"""
from __future__ import annotations

import asyncio
import base64
import json
import logging
import ssl
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable

import aiohttp
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.serialization import pkcs12

from .const import (
    APP_VERSION,
    AWS_STATUS_CMD_VERSION,
    DEVICE_LIST_URL,
    IOT_KEY_URL,
    LOGIN_URL,
    MODEL,
    USER_AGENT,
    VERIFY_URL,
)

_LOGGER = logging.getLogger(__name__)

AMAZON_ROOT_CA1 = """-----BEGIN CERTIFICATE-----
MIIDQTCCAimgAwIBAgITBmyfz5m/jAo54vB4ikPmljZbyjANBgkqhkiG9w0BAQsF
ADA5MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6
b24gUm9vdCBDQSAxMB4XDTE1MDUyNjAwMDAwMFoXDTM4MDExNzAwMDAwMFowOTEL
MAkGA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJv
b3QgQ0EgMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALJ4gHHKeNXj
ca9HgFB0fW7Y14h29Jlo91ghYPl0hAEvrAIthtOgQ3pOsqTQNroBvo3bSMgHFzZM
9O6II8c+6zf1tRn4SWiw3te5djgdYZ6k/oI2peVKVuRF4fn9tBb6dNqcmzU5L/qw
IFAGbHrQgLKm+a/sRxmPUDgH3KKHOVj4utWp+UhnMJbulHheb4mjUcAwhmahRWa6
VOujw5H5SNz/0egwLX0tdHA114gk957EWW67c4cX8jJGKLhD+rcdqsq08p8kDi1L
93FcXmn/6pUCyziKrlA4b9v7LWIbxcceVOF34GfID5yHI9Y/QCB/IIDEgEw+OyQm
jgSubJrIqg0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMC
AYYwHQYDVR0OBBYEFIQYzIU07LwMlJQuCFmcx7IQTgoIMA0GCSqGSIb3DQEBCwUA
A4IBAQCY8jdaQZChGsV2USggNiMOruYou6r4lK5IpDB/G/wkjUu0yKGX9rbxenDI
U5PMCCjjmCXPI6T53iHTfIUJrU6adTrCC2qJeHZERxhlbI1Bjjt/msv0tadQ1wUs
N+gDS63pYaACbvXy8MWy7Vu33PqUXHeeE6V/Uq2V8viTO96LXFvKWlJbYK8U90vv
o/ufQJVtMVT8QtPHRh8jrdkPSHCa2XV4cdFyQzR1bldZwgJcJmApzyMZFo6IQ6XU
5MsI+yMRQ+hDKXJioaldXgjUkK642M4UwtBV8ob2xJNDd2ZhwLnoQdeXeGADbkpy
rqXRfboQnoZsG4q5WTP468SQvvG5
-----END CERTIFICATE-----
"""


class GoveeAuthError(Exception):
    """Raised when the email/password (or 2FA code) is rejected."""


class GoveeTwoFactorRequired(Exception):
    """Raised when Govee wants a verification code emailed to the account."""


def make_client_id(email: str) -> str:
    """A stable, opaque per-account client id, the same role as the plugin's."""
    return "ha" + uuid.uuid5(uuid.NAMESPACE_DNS, f"govee-h713b:{email}").hex[:30]


@dataclass
class GoveeSession:
    """Everything obtained from a successful login, needed to talk to AWS IoT."""

    account_id: str
    token: str
    account_topic: str
    iot_endpoint: str
    p12_b64: str
    p12_pass: str
    client_id: str


@dataclass
class GoveeDevice:
    device_id: str
    model: str
    device_name: str
    aws_topic: str
    raw: dict[str, Any] = field(default_factory=dict)


def _headers(client_id: str, token: str | None = None) -> dict[str, str]:
    headers = {
        "appVersion": APP_VERSION,
        "clientId": client_id,
        "clientType": "1",
        "iotVersion": "0",
        "timestamp": str(int(time.time() * 1000)),
        "User-Agent": USER_AGENT,
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


async def login(
    session: aiohttp.ClientSession,
    email: str,
    password: str,
    client_id: str,
    code: str | None = None,
) -> GoveeSession:
    """Log in with a Govee account, mirroring the mobile app's login flow."""
    data = {"email": email, "password": password, "client": client_id}
    if code:
        data["code"] = code

    async with session.post(LOGIN_URL, json=data, headers=_headers(client_id)) as resp:
        body = await resp.json(content_type=None)

    if body.get("status") == 454:
        if code:
            raise GoveeAuthError("The verification code was not accepted")
        async with session.post(
            VERIFY_URL,
            json={"type": 8, "email": email},
            headers=_headers(client_id),
        ):
            pass
        raise GoveeTwoFactorRequired(
            "Govee sent a verification code to your email - enter it to continue"
        )

    client = body.get("client") or {}
    if not client.get("token"):
        raise GoveeAuthError(body.get("message") or "Govee did not return a login token")

    token = client["token"]

    async with session.get(IOT_KEY_URL, headers=_headers(client_id, token)) as resp:
        iot_body = await resp.json(content_type=None)
    iot_data = (iot_body or {}).get("data") or {}
    if not iot_data.get("p12"):
        raise GoveeAuthError("Govee did not return AWS IoT credentials")

    return GoveeSession(
        account_id=client["accountId"],
        token=token,
        account_topic=client["topic"],
        iot_endpoint=iot_data["endpoint"],
        p12_b64=iot_data["p12"],
        p12_pass=iot_data["p12Pass"],
        client_id=client_id,
    )


async def get_devices(
    session: aiohttp.ClientSession, client_id: str, token: str
) -> list[GoveeDevice]:
    """Fetch the account's device list and return only H713B heaters."""
    async with session.get(DEVICE_LIST_URL, headers=_headers(client_id, token)) as resp:
        body = await resp.json(content_type=None)

    devices = ((body or {}).get("data") or {}).get("devices") or []
    result: list[GoveeDevice] = []
    for raw in devices:
        if raw.get("sku") != MODEL:
            continue
        ext = raw.get("deviceExt") or {}
        settings_raw = ext.get("deviceSettings")
        topic = None
        if settings_raw:
            try:
                topic = json.loads(settings_raw).get("topic")
            except (TypeError, ValueError):
                topic = None
        if not topic:
            # No AWS topic means this device can't be controlled over the
            # cloud MQTT connection this integration uses.
            continue
        result.append(
            GoveeDevice(
                device_id=raw["device"],
                model=raw["sku"],
                device_name=raw.get("deviceName") or raw["device"],
                aws_topic=topic,
                raw=raw,
            )
        )
    return result


def _p12_to_pem(p12_b64: str, p12_pass: str) -> tuple[bytes, bytes]:
    """Return (cert_pem, key_pem) extracted from Govee's per-account p12 blob."""
    p12_bytes = base64.b64decode(p12_b64)
    key, cert, _ = pkcs12.load_key_and_certificates(
        p12_bytes, p12_pass.encode("utf-8")
    )
    key_pem = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    cert_pem = cert.public_bytes(serialization.Encoding.PEM)
    return cert_pem, key_pem


class GoveeIotClient:
    """A minimal AWS IoT MQTT client for publishing/receiving multiSync commands.

    Uses paho-mqtt's own network thread (loop_start) since AWS IoT here is
    just MQTT-over-TLS with mutual-cert auth - the full aws-iot-device-sdk
    the plugin uses isn't needed for this.
    """

    def __init__(
        self,
        hass,
        cert_dir: Path,
        session: GoveeSession,
        account_topic: str,
        on_message: Callable[[dict[str, Any]], None],
    ) -> None:
        self._hass = hass
        self._cert_dir = cert_dir
        self._session = session
        self._account_topic = account_topic
        self._on_message = on_message
        self._client = None
        self._connected = asyncio.Event()

    async def async_connect(self) -> None:
        import paho.mqtt.client as mqtt

        cert_pem, key_pem = await self._hass.async_add_executor_job(
            _p12_to_pem, self._session.p12_b64, self._session.p12_pass
        )

        self._cert_dir.mkdir(parents=True, exist_ok=True)
        ca_path = self._cert_dir / "AmazonRootCA1.pem"
        cert_path = self._cert_dir / "client.pem"
        key_path = self._cert_dir / "client.key"

        def write_files() -> None:
            ca_path.write_text(AMAZON_ROOT_CA1)
            cert_path.write_bytes(cert_pem)
            key_path.write_bytes(key_pem)

        await self._hass.async_add_executor_job(write_files)

        client_id = f"AP/{self._session.account_id}/{self._session.client_id}"
        try:
            # paho-mqtt >=2.0 requires this explicitly; older 1.x has no such enum.
            client = mqtt.Client(
                callback_api_version=mqtt.CallbackAPIVersion.VERSION1,
                client_id=client_id,
                protocol=mqtt.MQTTv311,
            )
        except AttributeError:
            client = mqtt.Client(client_id=client_id, protocol=mqtt.MQTTv311)
        client.tls_set(
            ca_certs=str(ca_path),
            certfile=str(cert_path),
            keyfile=str(key_path),
            tls_version=ssl.PROTOCOL_TLS_CLIENT,
        )

        loop = asyncio.get_event_loop()

        def _on_connect(_client, _userdata, _flags, rc, *_args):
            if rc == 0:
                client.subscribe(self._account_topic)
                loop.call_soon_threadsafe(self._connected.set)
            else:
                _LOGGER.warning("Govee AWS IoT connect failed, rc=%s", rc)

        def _on_message(_client, _userdata, msg) -> None:
            try:
                payload = json.loads(msg.payload.decode("utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError):
                return
            if isinstance(payload.get("msg"), str):
                try:
                    payload = json.loads(payload["msg"])
                except (TypeError, json.JSONDecodeError):
                    return
            if isinstance(payload.get("data"), str):
                try:
                    payload["data"] = json.loads(payload["data"])
                except (TypeError, json.JSONDecodeError):
                    pass
            loop.call_soon_threadsafe(self._on_message, payload)

        def _on_disconnect(_client, _userdata, rc, *_args):
            loop.call_soon_threadsafe(self._connected.clear)

        client.on_connect = _on_connect
        client.on_message = _on_message
        client.on_disconnect = _on_disconnect

        self._client = client
        await self._hass.async_add_executor_job(
            client.connect, self._session.iot_endpoint, 8883, 60
        )
        client.loop_start()

        await asyncio.wait_for(self._connected.wait(), timeout=15)

    async def async_disconnect(self) -> None:
        if self._client is not None:
            await self._hass.async_add_executor_job(self._client.loop_stop)
            await self._hass.async_add_executor_job(self._client.disconnect)

    @property
    def connected(self) -> bool:
        return self._connected.is_set()

    async def async_publish(self, device_topic: str, cmd: str, data: dict[str, Any]) -> None:
        if self._client is None or not self.connected:
            raise ConnectionError("Not connected to Govee's AWS IoT endpoint")
        payload = {
            "msg": {
                "cmd": cmd,
                "cmdVersion": 0,
                "data": data,
                "transaction": f"v_{int(time.time() * 1000)}000",
                "type": 1,
                "accountTopic": self._account_topic,
            }
        }
        await self._hass.async_add_executor_job(
            self._client.publish, device_topic, json.dumps(payload)
        )

    async def async_request_status(self, device_topic: str) -> None:
        if self._client is None or not self.connected:
            raise ConnectionError("Not connected to Govee's AWS IoT endpoint")
        payload = {
            "msg": {
                "cmd": "status",
                "cmdVersion": AWS_STATUS_CMD_VERSION,
                "transaction": f"v_{int(time.time() * 1000)}000",
                "type": 0,
                "accountTopic": self._account_topic,
            }
        }
        await self._hass.async_add_executor_job(
            self._client.publish, device_topic, json.dumps(payload)
        )

    async def async_send_multisync(self, device_topic: str, code_b64: str) -> None:
        await self.async_publish(device_topic, "ptReal", {"command": [code_b64]})
