"""Check that your sandbox credentials work end to end.

Run from the backend/ directory:

    python -m paypal.check_connection

This creates one unapproved $1.00 sandbox order, reads it back, and resends
the same request to confirm PayPal returns the original order instead of a
duplicate. It can't move any money, not even sandbox money, because the order
is never captured.
"""

from __future__ import annotations

import sys
import uuid
from pathlib import Path

import httpx
from dotenv import load_dotenv

from .client import PayPalClient, PayPalError
from .config import SANDBOX_BASE_URL, MissingCredentialsError, PayPalConfig

REPO_ROOT = Path(__file__).resolve().parents[2]
TEST_AMOUNT = "1.00"


def main() -> int:
    load_dotenv(REPO_ROOT / ".env")

    try:
        config = PayPalConfig.from_env()
    except MissingCredentialsError as exc:
        print(f"FAILED: {exc}", file=sys.stderr)
        return 1

    print(f"Using {SANDBOX_BASE_URL}")
    with PayPalClient(config) as client:
        try:
            client.get_access_token()
            print("OK: got an access token")

            request_id = str(uuid.uuid4())
            created = client.create_order(TEST_AMOUNT, request_id=request_id)
            print(f"OK: created order {created['id']} ({created['status']})")

            fetched = client.get_order(created["id"])
            retried = client.create_order(TEST_AMOUNT, request_id=request_id)
        except PayPalError as exc:
            print(f"FAILED: {exc} (debug_id: {exc.debug_id})", file=sys.stderr)
            return 1
        except httpx.HTTPError as exc:
            print(f"FAILED: couldn't reach PayPal: {exc}", file=sys.stderr)
            return 1

    recorded = fetched["purchase_units"][0]["amount"]["value"]
    if recorded != TEST_AMOUNT:
        print(
            f"FAILED: PayPal recorded {recorded}, expected {TEST_AMOUNT}",
            file=sys.stderr,
        )
        return 1

    print(f"OK: read the order back, PayPal recorded ${recorded}")

    if retried["id"] != created["id"]:
        print(
            f"FAILED: retry created a duplicate order {retried['id']}",
            file=sys.stderr,
        )
        return 1
    print("OK: retrying with the same request ID returned the same order")
    print("Sandbox connection works.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
