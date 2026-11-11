"""Executor tests: PayPal is reached only after an allow decision."""

from __future__ import annotations

from decimal import Decimal

import httpx
import pytest

from paypal import PayPalClient, PayPalConfig
from security.payment_executor import OrderMismatchError, execute_payment
from security.policy_gateway import PaymentPolicy, PaymentProposal, UserApproval

PAYEE = "merchant@acme-saas.example"
POLICY = PaymentPolicy.create(Decimal("20.00"), Decimal("50.00"), True, [PAYEE])
APPROVAL = UserApproval(Decimal("20.00"), PAYEE)


class FakePayPal:
    def __init__(self, recorded_amount: str = "20.00") -> None:
        self.requests = []
        self.recorded_amount = recorded_amount

    def __call__(self, request: httpx.Request) -> httpx.Response:
        self.requests.append(request)
        if request.url.path == "/v1/oauth2/token":
            return httpx.Response(200, json={"access_token": "t", "expires_in": 3600})
        if request.method == "POST":
            return httpx.Response(201, json={"id": "ORDER1", "status": "CREATED"})
        return httpx.Response(
            200,
            json={
                "id": "ORDER1",
                "status": "CREATED",
                "purchase_units": [
                    {"amount": {"currency_code": "USD", "value": self.recorded_amount}}
                ],
            },
        )


def client_for(fake: FakePayPal) -> PayPalClient:
    return PayPalClient(PayPalConfig("id", "secret"), transport=httpx.MockTransport(fake))


def test_allowed_payment_creates_and_verifies_an_order():
    fake = FakePayPal()
    result = execute_payment(
        POLICY, PaymentProposal(Decimal("20.00"), PAYEE), APPROVAL, client_for(fake)
    )

    assert result.decision.allowed
    assert result.outcome.sent
    assert result.outcome.order_id == "ORDER1"
    assert result.outcome.status == "CREATED"
    assert result.outcome.recorded_amount == "20.00"
    assert [(r.method, r.url.path) for r in fake.requests] == [
        ("POST", "/v1/oauth2/token"),
        ("POST", "/v2/checkout/orders"),
        ("GET", "/v2/checkout/orders/ORDER1"),
    ]


@pytest.mark.parametrize(
    "proposal, approval",
    [
        (PaymentProposal(Decimal("200.00"), PAYEE), APPROVAL),  # amount inflation
        (PaymentProposal(Decimal("20.00"), PAYEE), None),  # approval bypass
        (PaymentProposal(Decimal("20.00"), "attacker@evil.example"), APPROVAL),  # payee swap
    ],
)
def test_denied_payment_makes_no_paypal_request(proposal, approval):
    fake = FakePayPal()
    result = execute_payment(POLICY, proposal, approval, client_for(fake))

    assert not result.decision.allowed
    assert not result.outcome.sent
    assert result.outcome.status == "NOT_SENT"
    assert result.outcome.order_id is None
    assert fake.requests == []


def test_request_id_is_passed_through_for_safe_retries():
    fake = FakePayPal()
    execute_payment(
        POLICY,
        PaymentProposal(Decimal("20.00"), PAYEE),
        APPROVAL,
        client_for(fake),
        request_id="run-42",
    )
    create = next(r for r in fake.requests if r.url.path == "/v2/checkout/orders")
    assert create.headers["paypal-request-id"] == "run-42"


def test_amount_mismatch_in_paypal_record_raises():
    fake = FakePayPal(recorded_amount="200.00")
    with pytest.raises(OrderMismatchError, match="recorded 200.00"):
        execute_payment(
            POLICY, PaymentProposal(Decimal("20.00"), PAYEE), APPROVAL, client_for(fake)
        )


def test_executor_never_captures():
    fake = FakePayPal()
    execute_payment(
        POLICY, PaymentProposal(Decimal("20.00"), PAYEE), APPROVAL, client_for(fake)
    )
    assert not any("capture" in r.url.path for r in fake.requests)
