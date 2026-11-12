"""Pure, server-side payment policy checks.

This module has no FastAPI, agent, or PayPal dependency. Keeping it isolated
ensures the same checks can block a request before any payment client is called.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Optional, Tuple

TRUSTED_PAYEE = "merchant@acme-saas.example"


@dataclass(frozen=True)
class PolicyCheck:
    """One independently evaluated authorization rule."""

    name: str
    passed: bool
    detail: str


@dataclass(frozen=True)
class PolicyDecision:
    """The complete, auditable outcome of a payment-policy evaluation."""

    allowed: bool
    checks: Tuple[PolicyCheck, ...]


def evaluate_payment_policy(
    *,
    proposed_amount: Decimal,
    spending_limit: Decimal,
    authorized_amount: Decimal,
    payee: str,
    require_approval: bool,
    approval_granted: bool,
    approved_amount: Optional[Decimal],
) -> PolicyDecision:
    """Apply the five payment controls without trusting an agent proposal."""

    checks = (
        PolicyCheck(
            name="Amount is within authorization",
            passed=proposed_amount <= authorized_amount,
            detail=f"Proposed {proposed_amount} USD; authorized {authorized_amount} USD.",
        ),
        PolicyCheck(
            name="Amount is within spending limit",
            passed=proposed_amount <= spending_limit,
            detail=f"Proposed {proposed_amount} USD; limit {spending_limit} USD.",
        ),
        PolicyCheck(
            name="Explicit approval is present",
            passed=not require_approval or approval_granted,
            detail="Approval is required." if require_approval else "Approval is not required for this scenario.",
        ),
        PolicyCheck(
            name="Approved amount matches the proposal",
            passed=not approval_granted or approved_amount == proposed_amount,
            detail=(
                f"Approved {approved_amount} USD; proposed {proposed_amount} USD."
                if approval_granted
                else "No approval amount is available to compare."
            ),
        ),
        PolicyCheck(
            name="Payee is allowlisted",
            passed=payee == TRUSTED_PAYEE,
            detail=payee,
        ),
    )
    return PolicyDecision(allowed=all(check.passed for check in checks), checks=checks)
