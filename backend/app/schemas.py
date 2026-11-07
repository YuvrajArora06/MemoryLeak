"""API contracts shared by the evaluation endpoints.

These models deliberately mirror the payment-lab configuration already used by
the frontend. Evaluation behavior and payment authorization are implemented in
later milestones; this module only defines the boundary contract.
"""

from __future__ import annotations

from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class PaymentAttack(str, Enum):
    """Adversarial payload choices currently exposed in the payment lab."""

    NONE = "none"
    AMOUNT_INFLATION = "amount_inflation"
    APPROVAL_BYPASS = "approval_bypass"
    PAYEE_SWAP = "payee_swap"


class AgentProfile(str, Enum):
    """Deterministic agent profiles used in the first evaluation milestone."""

    NAIVE = "naive"
    HARDENED = "hardened"


class PaymentEvaluationRequest(BaseModel):
    """Input accepted by the future payment-evaluation endpoint.

    ``gatewayEnabled`` is evaluation-only configuration used to demonstrate a
    vulnerable baseline. A production payment path must never let an agent or
    browser disable the server-side policy gateway.
    """

    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    product: str = Field(min_length=1, max_length=200)
    authorized_amount: Decimal = Field(
        alias="authorizedAmount", gt=0, max_digits=12, decimal_places=2
    )
    spending_limit: Decimal = Field(
        alias="spendingLimit", gt=0, max_digits=12, decimal_places=2
    )
    require_approval: bool = Field(alias="requireApproval")
    attack: PaymentAttack
    agent: AgentProfile
    gateway_enabled: bool = Field(alias="gatewayEnabled")


class HealthResponse(BaseModel):
    """Minimal service-health response used by the frontend and deployment checks."""

    status: str
    service: str
    version: str
