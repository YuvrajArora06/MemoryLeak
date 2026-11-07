"""Minimal client for the PayPal sandbox: OAuth and Orders v2.

There is deliberately no capture method yet. Capture is the step that moves
funds, so it should be added behind the payment policy gateway.
"""

from __future__ import annotations

import time
import uuid
from decimal import Decimal, InvalidOperation
from typing import Any
from urllib.parse import quote

import httpx

from .config import SANDBOX_BASE_URL, PayPalConfig

CURRENCY = "USD"
# Refresh tokens slightly early so one can't expire while a request is in flight.
TOKEN_EXPIRY_MARGIN_SECONDS = 60


class PayPalError(Exception):
    """PayPal rejected a request. Quote debug_id when asking PayPal for support."""

    def __init__(
        self, status_code: int, message: str, debug_id: str | None = None
    ) -> None:
        super().__init__(f"PayPal returned {status_code}: {message}")
        self.status_code = status_code
        self.message = message
        self.debug_id = debug_id


def format_amount(amount: str | Decimal) -> str:
    """Return a positive USD amount as PayPal expects it, e.g. "20.00".

    Floats and sub-cent values are rejected rather than rounded, so a payment
    is never created for a different amount than the caller asked for.
    """
    if not isinstance(amount, (str, Decimal)):
        raise TypeError("amount must be a str or Decimal, not a float or int")
    try:
        value = Decimal(amount)
        cents = value.quantize(Decimal("0.01"))
    except InvalidOperation:
        raise ValueError(f"invalid amount: {amount!r}") from None
    if not value.is_finite() or value <= 0 or cents != value:
        raise ValueError(
            f"amount must be positive with at most 2 decimals: {amount!r}"
        )
    return format(cents, "f")


class PayPalClient:
    def __init__(
        self,
        config: PayPalConfig,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        self._config = config
        self._http = httpx.Client(
            base_url=SANDBOX_BASE_URL, transport=transport, timeout=15.0
        )
        self._token: str | None = None
        self._token_expires_at = 0.0

    def __enter__(self) -> "PayPalClient":
        return self

    def __exit__(self, *exc_info: object) -> None:
        self.close()

    def close(self) -> None:
        self._http.close()

    def get_access_token(self) -> str:
        """Return a cached OAuth token, fetching a new one when it's near expiry."""
        if self._token and time.monotonic() < self._token_expires_at:
            return self._token

        response = self._http.post(
            "/v1/oauth2/token",
            auth=(self._config.client_id, self._config.client_secret),
            data={"grant_type": "client_credentials"},
        )
        body = _parse(response)
        self._token = body["access_token"]
        self._token_expires_at = (
            time.monotonic() + body["expires_in"] - TOKEN_EXPIRY_MARGIN_SECONDS
        )
        return self._token

    def create_order(
        self, amount: str | Decimal, request_id: str | None = None
    ) -> dict[str, Any]:
        """Create an order. No money moves until a buyer approves and it's captured.

        Reusing a request_id makes PayPal return the original order instead of
        creating a duplicate, so retries are safe.
        """
        response = self._http.post(
            "/v2/checkout/orders",
            headers={
                **self._auth_header(),
                "PayPal-Request-Id": request_id or str(uuid.uuid4()),
            },
            json={
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "amount": {
                            "currency_code": CURRENCY,
                            "value": format_amount(amount),
                        }
                    }
                ],
            },
        )
        return _parse(response)

    def get_order(self, order_id: str) -> dict[str, Any]:
        """Fetch an order. PayPal's record is the source of truth for its outcome."""
        # Order IDs may originate from an untrusted agent, so keep them to one
        # path segment.
        response = self._http.get(
            f"/v2/checkout/orders/{quote(order_id, safe='')}",
            headers=self._auth_header(),
        )
        return _parse(response)

    def _auth_header(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.get_access_token()}"}


def _parse(response: httpx.Response) -> dict[str, Any]:
    try:
        body = response.json()
    except ValueError:
        body = {}
    if not isinstance(body, dict):
        body = {}

    if response.is_success:
        return body

    # Orders errors use message/debug_id; OAuth errors use error_description.
    raise PayPalError(
        status_code=response.status_code,
        message=(
            body.get("message")
            or body.get("error_description")
            or response.reason_phrase
        ),
        debug_id=body.get("debug_id") or response.headers.get("paypal-debug-id"),
    )
