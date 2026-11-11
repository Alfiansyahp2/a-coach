from fastapi import APIRouter
from python_engine.domain.physiology.models import (
    PMCPayload,
    PMCResponse,
    DecouplingInput,
    DecouplingResponse,
    TRIMPCalculationInput,
)
from python_engine.domain.physiology.banister_engine import (
    calculate_pmc,
    calculate_trimp,
)
from python_engine.domain.physiology.decoupling_engine import (
    calculate_session_debrief,
)

router = APIRouter(prefix="/calculate/coach", tags=["Coach & Physiology"])


@router.post("/pmc", response_model=PMCResponse)
def compute_performance_management_chart(payload: PMCPayload) -> PMCResponse:
    """
    Computes daily Banister Fitness (CTL), Fatigue (ATL), and Form (TSB) metrics.
    """
    return calculate_pmc(
        sessions=payload.sessions,
        profile=payload.profile,
        days_history=payload.days_history,
    )


@router.post("/debrief", response_model=DecouplingResponse)
def compute_session_debrief(payload: DecouplingInput) -> DecouplingResponse:
    """
    Evaluates session compliance, cardiac drift, and clinical tolerance to generate coach debrief.
    """
    return calculate_session_debrief(payload)


@router.post("/trimp")
def compute_session_trimp(payload: TRIMPCalculationInput):
    """
    Computes Banister TRIMP score for a single workout session.
    """
    return {"trimp": calculate_trimp(payload)}

