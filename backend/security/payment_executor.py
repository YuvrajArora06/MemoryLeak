"""Sends a payment to the PayPal sandbox only after the policy gateway allows it.

The executor runs the gateway itself rather than accepting a decision from the
caller, so there's no way to hand it a forged or stale "allowed" result.

Orders are created and read back but never captured, so no money moves. The
order's payee is the sandbox app's own merchant account; the payee in the
proposal is only checked against the allowlist.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from paypal.client import PayPalClient, format_amount

from .policy_gateway import (
    PaymentPolicy,
    PaymentProposal,
    PolicyDecision,
    UserApproval,
    evaluate,
)

STATUS_NOT_SENT = "NOT_SENT"


class OrderMismatchError(RuntimeError):
    """PayPal recorded a different amount than the gateway allowed."""


@dataclass(frozen=True)
class PaymentOutcome:
    sent: bool
    status: str
    order_id: Optional[str] = None
    recorded_amount: Optional[str] = None


@dataclass(frozen=True)
class PaymentResult:
    decision: PolicyDecision
    outcome: PaymentOutcome


def execute_payment(
    policy: PaymentPolicy,
    proposal: PaymentProposal,
    approval: Optional[UserApproval],
    client: PayPalClient,
    request_id: Optional[str] = None,
) -> PaymentResult:
    """Evaluate the proposal and, only if allowed, create a sandbox order.

    A denied proposal makes no PayPal call at all. Reusing a request_id makes
    retries return the original order instead of creating a duplicate.
    """
    decision = evaluate(policy, proposal, approval)
    if not decision.allowed:
        return PaymentResult(decision, PaymentOutcome(sent=False, status=STATUS_NOT_SENT))

    created = client.create_order(proposal.amount, request_id=request_id)
    # PayPal's own record is the evidence, not what we asked it to do.
    fetched = client.get_order(created["id"])
    recorded = fetched["purchase_units"][0]["amount"]["value"]

    if recorded != format_amount(proposal.amount):
        raise OrderMismatchError(
            f"Order {created['id']} recorded {recorded}, "
            f"gateway allowed {format_amount(proposal.amount)}"
        )

    return PaymentResult(
        decision,
        PaymentOutcome(
            sent=True,
            status=fetched["status"],
            order_id=created["id"],
            recorded_amount=recorded,
        ),
    )
