"""Live tests against the real PayPal sandbox. Skipped unless you opt in:

    PAYPAL_LIVE_TESTS=1 python -m pytest tests/test_paypal_sandbox_live.py

They need sandbox credentials in the repository-root .env. Each run creates a
few unapproved sandbox orders. Nothing is captured, so no money moves.
"""

from __future__ import annotations

import os
import uuid
from decimal import Decimal
from pathlib import Path

import pytest
from dotenv import load_dotenv

from paypal import PayPalClient, PayPalConfig, PayPalError
from security.payment_executor import execute_payment
from security.policy_gateway import PaymentPolicy, PaymentProposal, UserApproval

pytestmark = pytest.mark.skipif(
    os.environ.get("PAYPAL_LIVE_TESTS") != "1",
    reason="live sandbox tests are opt-in: set PAYPAL_LIVE_TESTS=1",
)

PAYEE = "merchant@acme-saas.example"
POLICY = PaymentPolicy.create(Decimal("20.00"), Decimal("50.00"), True, [PAYEE])
APPROVAL = UserApproval(Decimal("20.00"), PAYEE)


@pytest.fixture(scope="module")
def client():
    load_dotenv(Path(__file__).resolve().parents[2] / ".env")
    with PayPalClient(PayPalConfig.from_env()) as paypal:
        yield paypal


def test_credentials_are_accepted(client):
    assert client.get_access_token()


def test_wrong_credentials_are_rejected():
    with PayPalClient(PayPalConfig("not-a-real-id", "not-a-real-secret")) as bad:
        with pytest.raises(PayPalError) as caught:
            bad.get_access_token()
    assert caught.value.status_code == 401


def test_same_request_id_returns_the_original_order(client):
    request_id = str(uuid.uuid4())
    first = client.create_order("1.00", request_id=request_id)
    second = client.create_order("1.00", request_id=request_id)
    assert second["id"] == first["id"]


def test_different_request_ids_create_different_orders(client):
    first = client.create_order("1.00")
    second = client.create_order("1.00")
    assert first["id"] != second["id"]


def test_allowed_payment_creates_an_unapproved_order(client):
    result = execute_payment(POLICY, PaymentProposal(Decimal("20.00"), PAYEE), APPROVAL, client)
    assert result.decision.allowed
    assert result.outcome.sent
    assert result.outcome.status == "CREATED"
    assert result.outcome.recorded_amount == "20.00"


def test_executor_retry_returns_the_same_order(client):
    request_id = str(uuid.uuid4())
    proposal = PaymentProposal(Decimal("20.00"), PAYEE)
    first = execute_payment(POLICY, proposal, APPROVAL, client, request_id=request_id)
    second = execute_payment(POLICY, proposal, APPROVAL, client, request_id=request_id)
    assert second.outcome.order_id == first.outcome.order_id


@pytest.mark.parametrize(
    "proposal, approval",
    [
        (PaymentProposal(Decimal("200.00"), PAYEE), APPROVAL),
        (PaymentProposal(Decimal("20.00"), PAYEE), None),
        (PaymentProposal(Decimal("20.00"), "attacker@evil.example"), APPROVAL),
    ],
    ids=["amount_inflation", "approval_bypass", "payee_swap"],
)
def test_attacks_are_denied_before_reaching_paypal(client, proposal, approval):
    result = execute_payment(POLICY, proposal, approval, client)
    assert not result.decision.allowed
    assert result.outcome.status == "NOT_SENT"
    assert result.outcome.order_id is None
