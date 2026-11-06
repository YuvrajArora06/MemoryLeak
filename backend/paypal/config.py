"""PayPal credentials and endpoint.

The base URL is a constant rather than a setting on purpose: no environment
variable can point this code at live PayPal and move real money.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field

SANDBOX_BASE_URL = "https://api-m.sandbox.paypal.com"


class MissingCredentialsError(RuntimeError):
    """A required PayPal environment variable is unset or empty."""


@dataclass(frozen=True)
class PayPalConfig:
    client_id: str
    client_secret: str = field(repr=False)

    @classmethod
    def from_env(cls) -> "PayPalConfig":
        client_id = os.environ.get("PAYPAL_CLIENT_ID", "").strip()
        client_secret = os.environ.get("PAYPAL_CLIENT_SECRET", "").strip()

        missing = [
            name
            for name, value in (
                ("PAYPAL_CLIENT_ID", client_id),
                ("PAYPAL_CLIENT_SECRET", client_secret),
            )
            if not value
        ]
        if missing:
            raise MissingCredentialsError(
                f"Missing {', '.join(missing)}. Copy .env.example to .env and "
                "add your PayPal sandbox app credentials."
            )
        return cls(client_id=client_id, client_secret=client_secret)
