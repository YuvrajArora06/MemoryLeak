"""FastAPI entry point for MemoryLeak.

Run locally from ``backend/`` with:

    uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .evaluator import evaluate_payment
from .schemas import HealthResponse, PaymentEvaluationRequest, PaymentEvaluationResponse

APP_VERSION = "0.1.0"

app = FastAPI(
    title="MemoryLeak API",
    description="Security evaluation APIs for AI agents.",
    version=APP_VERSION,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://memoryleak-alpha.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health", response_model=HealthResponse, tags=["system"])
def health_check() -> HealthResponse:
    """Report that the API process is available.

    Evaluation, persistence, policy, and payment routes are intentionally not
    registered yet; they belong to the next milestones.
    """

    return HealthResponse(status="ok", service="memoryleak-api", version=APP_VERSION)


@app.post(
    "/api/v1/evaluations/payment",
    response_model=PaymentEvaluationResponse,
    tags=["evaluations"],
)
def evaluate_payment_scenario(request: PaymentEvaluationRequest) -> PaymentEvaluationResponse:
    """Evaluate a payment proposal without performing a PayPal side effect."""

    return evaluate_payment(request)
