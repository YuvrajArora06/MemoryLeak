"""PayPal client tests. These use a fake transport and never touch the network."""

from __future__ import annotations

import base64
import json
from decimal import Decimal

import httpx
import pytest

from paypal import (
    SANDBOX_BASE_URL,
    MissingCredentialsError,
    PayPalClient,
    PayPalConfig,
    PayPalError,
)
from paypal.client import format_amount

CONFIG = PayPalConfig(client_id="test-id", client_secret="test-secret")
ORDER = {"id": "ORDER123", "status": "CREATED"}


class FakePayPal:
    """Answers like PayPal and records every request it receives."""

    def __init__(self, expires_in: int = 3600) -> None:
        self.requests: list[httpx.Request] = []
        self.expires_in = expires_in

    def __call__(self, request: httpx.Request) -> httpx.Response:
        self.requests.append(request)
        if request.url.path == "/v1/oauth2/token":
            return httpx.Response(
                200, json={"access_token": "token", "expires_in": self.expires_in}
            )
        return httpx.Response(201, json=ORDER)

    def paths(self) -> list[str]:
        return [request.url.path for request in self.requests]


def make_client(handler) -> PayPalClient:
    return PayPalClient(CONFIG, transport=httpx.MockTransport(handler))


def test_all_requests_go_to_the_sandbox():
    fake = FakePayPal()
    make_client(fake).create_order("20.00")

    assert SANDBOX_BASE_URL == "https://api-m.sandbox.paypal.com"
    assert {request.url.host for request in fake.requests} == {
        "api-m.sandbox.paypal.com"
    }


def test_token_request_uses_client_credentials():
    fake = FakePayPal()
    assert make_client(fake).get_access_token() == "token"

    request = fake.requests[0]
    expected = base64.b64encode(b"test-id:test-secret").decode()
    assert request.headers["authorization"] == f"Basic {expected}"
    assert request.content == b"grant_type=client_credentials"


def test_token_is_reused_until_it_nears_expiry():
    fake = FakePayPal()
    client = make_client(fake)
    client.get_access_token()
    client.get_access_token()
    assert fake.paths().count("/v1/oauth2/token") == 1


def test_token_is_refreshed_inside_the_expiry_margin():
    fake = FakePayPal(expires_in=30)
    client = make_client(fake)
    client.get_access_token()
    client.get_access_token()
    assert fake.paths().count("/v1/oauth2/token") == 2


def test_create_order_sends_exact_amount_and_auth():
    fake = FakePayPal()
    order = make_client(fake).create_order("20.00", request_id="req-1")

    assert order == ORDER
    request = fake.requests[-1]
    assert request.url.path == "/v2/checkout/orders"
    assert request.headers["authorization"] == "Bearer token"
    assert request.headers["paypal-request-id"] == "req-1"
    assert json.loads(request.content) == {
        "intent": "CAPTURE",
        "purchase_units": [{"amount": {"currency_code": "USD", "value": "20.00"}}],
    }


def test_each_order_gets_its_own_request_id_by_default():
    fake = FakePayPal()
    client = make_client(fake)
    client.create_order("20.00")
    client.create_order("20.00")

    orders = [r for r in fake.requests if r.url.path == "/v2/checkout/orders"]
    assert orders[0].headers["paypal-request-id"] != (
        orders[1].headers["paypal-request-id"]
    )


def test_get_order_cannot_escape_the_orders_path():
    fake = FakePayPal()
    make_client(fake).get_order("../../v1/oauth2/token")

    assert fake.requests[-1].url.raw_path == (
        b"/v2/checkout/orders/..%2F..%2Fv1%2Foauth2%2Ftoken"
    )


@pytest.mark.parametrize(
    "amount, expected",
    [("20", "20.00"), ("20.5", "20.50"), ("0.01", "0.01"), (Decimal("200.00"), "200.00")],
)
def test_format_amount_accepts_valid_values(amount, expected):
    assert format_amount(amount) == expected


@pytest.mark.parametrize(
    "amount",
    ["0", "-20.00", "20.005", "abc", "", "NaN", "Infinity", "1e100"],
)
def test_format_amount_rejects_invalid_values(amount):
    with pytest.raises(ValueError):
        format_amount(amount)


@pytest.mark.parametrize("amount", [20.0, 20, None])
def test_format_amount_rejects_non_decimal_types(amount):
    with pytest.raises(TypeError):
        format_amount(amount)


def test_invalid_amount_never_reaches_paypal():
    fake = FakePayPal()
    with pytest.raises(ValueError):
        make_client(fake).create_order("-200.00")
    assert "/v2/checkout/orders" not in fake.paths()


def test_order_error_exposes_status_message_and_debug_id():
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/v1/oauth2/token":
            return httpx.Response(200, json={"access_token": "t", "expires_in": 3600})
        return httpx.Response(
            422, json={"message": "Unprocessable", "debug_id": "abc123"}
        )

    with pytest.raises(PayPalError) as caught:
        make_client(handler).create_order("20.00")

    assert caught.value.status_code == 422
    assert caught.value.message == "Unprocessable"
    assert caught.value.debug_id == "abc123"


def test_oauth_error_format_is_understood():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            401,
            json={
                "error": "invalid_client",
                "error_description": "Client Authentication failed",
            },
            headers={"paypal-debug-id": "def456"},
        )

    with pytest.raises(PayPalError) as caught:
        make_client(handler).get_access_token()

    assert caught.value.status_code == 401
    assert caught.value.message == "Client Authentication failed"
    assert caught.value.debug_id == "def456"
    assert "test-secret" not in str(caught.value)


def test_non_json_error_still_raises_paypal_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(503, text="<html>down</html>")

    with pytest.raises(PayPalError) as caught:
        make_client(handler).get_access_token()
    assert caught.value.status_code == 503


def test_secret_is_hidden_from_config_repr():
    assert "test-secret" not in repr(CONFIG)


def test_from_env_reads_credentials(monkeypatch):
    monkeypatch.setenv("PAYPAL_CLIENT_ID", " id ")
    monkeypatch.setenv("PAYPAL_CLIENT_SECRET", "secret")
    assert PayPalConfig.from_env() == PayPalConfig("id", "secret")


def test_from_env_names_what_is_missing(monkeypatch):
    monkeypatch.setenv("PAYPAL_CLIENT_ID", "id")
    monkeypatch.setenv("PAYPAL_CLIENT_SECRET", "   ")
    with pytest.raises(MissingCredentialsError, match="PAYPAL_CLIENT_SECRET"):
        PayPalConfig.from_env()
