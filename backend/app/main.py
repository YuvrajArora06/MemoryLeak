"""FastAPI entry point for MemoryLeak.

Run locally from ``backend/`` with:

    uvicorn app.main:app --reload
"""

from fastapi import FastAPI

from .schemas import HealthResponse

APP_VERSION = "0.1.0"

app = FastAPI(
    title="MemoryLeak API",
    description="Security evaluation APIs for AI agents.",
    version=APP_VERSION,
)


@app.get("/api/v1/health", response_model=HealthResponse, tags=["system"])
def health_check() -> HealthResponse:
    """Report that the API process is available.

    Evaluation, persistence, policy, and payment routes are intentionally not
    registered yet; they belong to the next milestones.
    """

    return HealthResponse(status="ok", service="memoryleak-api", version=APP_VERSION)
