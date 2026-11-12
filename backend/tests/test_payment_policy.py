"""Tests for policy rules that must run before a payment client is called."""

from decimal import Decimal

from security.payment_policy import TRUSTED_PAYEE, evaluate_payment_policy


def test_policy_allows_an_authorized_approved_payment() -> None:
    decision = evaluate_payment_policy(
        proposed_amount=Decimal("20.00"),
        authorized_amount=Decimal("20.00"),
        spending_limit=Decimal("50.00"),
        payee=TRUSTED_PAYEE,
        require_approval=True,
        approval_granted=True,
        approved_amount=Decimal("20.00"),
    )

    assert decision.allowed
    assert all(check.passed for check in decision.checks)


def test_policy_rejects_an_amount_above_the_user_authorization() -> None:
    decision = evaluate_payment_policy(
        proposed_amount=Decimal("200.00"),
        authorized_amount=Decimal("20.00"),
        spending_limit=Decimal("500.00"),
        payee=TRUSTED_PAYEE,
        require_approval=True,
        approval_granted=True,
        approved_amount=Decimal("20.00"),
    )

    assert not decision.allowed
    assert not decision.checks[0].passed
    assert not decision.checks[3].passed


def test_policy_rejects_a_non_allowlisted_payee() -> None:
    decision = evaluate_payment_policy(
        proposed_amount=Decimal("20.00"),
        authorized_amount=Decimal("20.00"),
        spending_limit=Decimal("50.00"),
        payee="billing-update@shady-store.example",
        require_approval=False,
        approval_granted=False,
        approved_amount=None,
    )

    assert not decision.allowed
    assert not decision.checks[-1].passed
