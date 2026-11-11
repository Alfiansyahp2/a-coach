from fastapi import APIRouter
from python_engine.domain.physiology.models import (
    PMCPayload,
    PMCResponse,
    DecouplingInput,
    DecouplingResponse,
    TRIMPCalculationInput,
    WeeklyProRecapPayload,
    WeeklyProRecapResponse,
)
from python_engine.domain.physiology.banister_engine import (
    calculate_pmc,
    calculate_trimp,
)
from python_engine.domain.physiology.decoupling_engine import (
    calculate_session_debrief,
)
from python_engine.domain.physiology.weekly_recap_calculator import (
    compute_weekly_pro_recap,
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


@router.post("/weekly-recap", response_model=WeeklyProRecapResponse)
def compute_pro_weekly_recap(payload: WeeklyProRecapPayload) -> WeeklyProRecapResponse:
    """
    Computes Pro-Level Weekly Recap: Foster sRPE, Weekly TSS, Seiler 80/20 polarization,
    Week-over-Week delta, and Musculoskeletal Impact Strain.
    """
    return compute_weekly_pro_recap(
        curr_sessions=payload.current_week_activities,
        prev_sessions=payload.prev_week_activities,
        profile=payload.profile,
        peak_pain=payload.peak_pain_score,
        has_swelling=payload.has_swelling,
    )
