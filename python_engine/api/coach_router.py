from fastapi import APIRouter
from python_engine.domain.physiology.models import (
    PMCPayload,
    PMCResponse,
    DecouplingInput,
    DecouplingResponse,
    TRIMPCalculationInput,
    WeeklyProRecapPayload,
    WeeklyProRecapResponse,
    StrengthSessionInput,
    StrengthSessionResponse,
    CombatSessionInput,
    CombatSessionResponse,
    TeamSessionInput,
    TeamSessionResponse,
    RacquetPrecisionSessionInput,
    RacquetPrecisionSessionResponse,
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
from python_engine.domain.physiology.strength_engine import (
    evaluate_strength_session,
)
from python_engine.domain.physiology.combat_engine import (
    evaluate_combat_session,
)
from python_engine.domain.physiology.team_engine import (
    evaluate_team_session,
)
from python_engine.domain.physiology.racquet_precision_engine import (
    evaluate_racquet_precision_session,
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


@router.post("/strength/evaluate", response_model=StrengthSessionResponse)
def compute_strength_session_evaluation(payload: StrengthSessionInput) -> StrengthSessionResponse:
    """
    Evaluates Phase 1 Strength, Power & Hypertrophy metrics: Volume Tonnage,
    Sheiko INOL, 1RM estimates, VBT fatigue, and CNS drain.
    """
    return evaluate_strength_session(payload)


@router.post("/combat/evaluate", response_model=CombatSessionResponse)
def compute_combat_session_evaluation(payload: CombatSessionInput) -> CombatSessionResponse:
    """
    Evaluates Phase 2 Combat Sports metrics: Punch Density, MMA Striking vs Grappling
    Partitioning, SCAT6 Concussion Gate, and Tibial/Cervical Strain.
    """
    return evaluate_combat_session(payload)


@router.post("/team/evaluate", response_model=TeamSessionResponse)
def compute_team_session_evaluation(payload: TeamSessionInput) -> TeamSessionResponse:
    """
    Evaluates Phase 3 Intermittent Team, Field & Court Sports metrics:
    Catapult PlayerLoad, Bradley HSR, Hamstring risk, Jump shock & Patellar warning,
    CMJ decay, Futsal decel shock, Rugby collisions, and Field Hockey lumbar strain.
    """
    return evaluate_team_session(payload)


@router.post("/racquet/evaluate", response_model=RacquetPrecisionSessionResponse)
def compute_racquet_session_evaluation(
    payload: RacquetPrecisionSessionInput,
) -> RacquetPrecisionSessionResponse:
    """
    Evaluates Phase 4 Racquet & Precision Sports metrics:
    Archery draw volume, Anchor hold tremor index, Cardio-somatic diastolic synchronization,
    Shoulder rotator kinetics, Badminton smash energy, Table Tennis micro-steps, and Postural sway.
    """
    return evaluate_racquet_precision_session(payload)




