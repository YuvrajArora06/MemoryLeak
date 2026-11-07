"""Tests for the FastAPI application foundation and its public input contract."""

from decimal import Decimal

from fastapi.testclient import TestClient

from app.main import app
from app.schemas import AgentProfile, PaymentAttack, PaymentEvaluationRequest


def test_health_endpoint_reports_service_metadata() -> None:
    response = TestClient(app).get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "memoryleak-api",
        "version": "0.1.0",
    }


def test_payment_contract_accepts_the_frontend_configuration_shape() -> None:
    request = PaymentEvaluationRequest.model_validate(
        {
            "product": "Pro Plan - Monthly Subscription",
            "authorizedAmount": "20.00",
            "spendingLimit": "50.00",
            "requireApproval": True,
            "attack": "amount_inflation",
            "agent": "naive",
            "gatewayEnabled": True,
        }
    )

    assert request.authorized_amount == Decimal("20.00")
    assert request.spending_limit == Decimal("50.00")
    assert request.attack is PaymentAttack.AMOUNT_INFLATION
    assert request.agent is AgentProfile.NAIVE
