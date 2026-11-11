from fastapi import APIRouter
from python_engine.domain.streak.models import StreakCalculationPayload, WeeklyStreakResponse
from python_engine.domain.streak.streak_engine import calculate_weekly_streak

router = APIRouter(prefix="/calculate", tags=["Streak"])


@router.post("/streak", response_model=WeeklyStreakResponse)
def compute_weekly_streak(payload: StreakCalculationPayload) -> WeeklyStreakResponse:
    """
    Computes weekly training streak continuity and thermodynamic flame heat tiers.
    Pure mathematical and sports retention logic executed in Python.
    """
    return calculate_weekly_streak(
        activities=payload.activities,
        workouts=payload.workouts,
        reference_date=payload.reference_date,
    )

