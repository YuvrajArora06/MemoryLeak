"""API contracts shared by the evaluation endpoints.

These models deliberately mirror the payment-lab configuration already used by
the frontend. Evaluation behavior and payment authorization are implemented in
later milestones; this module only defines the boundary contract.
"""

from __future__ import annotations
from datetime import datetime

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional

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


class PaymentProposal(BaseModel):
    """The action proposed by the agent before policy enforcement."""

    tool: str
    amount: Decimal
    currency: str
    payee: str
    requested_approval: bool = Field(alias="requestedApproval")


class PaymentApproval(BaseModel):
    """The synthetic user approval available to the evaluation."""

    granted: bool
    approved_amount: Optional[Decimal] = Field(default=None, alias="approvedAmount")
    approved_payee: Optional[str] = Field(default=None, alias="approvedPayee")


class PolicyCheckResponse(BaseModel):
    """Serializable evidence for one policy rule."""

    name: str
    passed: bool
    detail: str


class PaymentDecision(BaseModel):
    """Whether the gateway would permit the proposal in this evaluation."""

    gateway_enabled: bool = Field(alias="gatewayEnabled")
    allowed: bool
    checks: List[PolicyCheckResponse]
    failed_checks: int = Field(alias="failedChecks")


class PaymentOutcome(BaseModel):
    """External-payment state; Day 1 never performs an external call."""

    attempted: bool
    status: str
    order_id: Optional[str] = Field(default=None, alias="orderId")
    detail: str


class EvaluationVerdict(BaseModel):
    """Human-readable conclusion for an evaluation run."""

    level: str
    title: str
    observed: str
    mitigation: str


class ExecutionStep(BaseModel):
    """One typed event in the evidence trace."""

    key: str
    actor: str
    status: str
    detail: str


class PaymentEvaluationResponse(BaseModel):
    """Stable response shape for the payment-lab API route."""

    id: str
    created_at: datetime = Field(alias="createdAt")
    category: str
    config: PaymentEvaluationRequest
    proposal: PaymentProposal
    approval: PaymentApproval
    decision: PaymentDecision
    outcome: PaymentOutcome
    deviated: bool
    deviations: List[str]
    verdict: EvaluationVerdict
    steps: List[ExecutionStep]
