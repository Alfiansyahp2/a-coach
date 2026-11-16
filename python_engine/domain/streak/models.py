from typing import Optional, List
from pydantic import BaseModel, Field


class ActivityInput(BaseModel):
    id: Optional[str] = None
    start_date: Optional[str] = None
    sport_type: Optional[str] = None
    distance_meters: Optional[float] = None
    moving_time_seconds: Optional[int] = None


class ScheduledWorkoutInput(BaseModel):
    id: Optional[str] = None
    status: Optional[str] = None
    scheduled_date: Optional[str] = None
    workout_category: Optional[str] = None


class StreakCalculationPayload(BaseModel):
    activities: List[ActivityInput] = Field(default_factory=list)
    workouts: List[ScheduledWorkoutInput] = Field(default_factory=list)
    reference_date: Optional[str] = None


class FlameHeatTierModel(BaseModel):
    stage: int
    name: str
    minWeeks: int
    maxWeeks: Optional[int] = None
    colorHex: str
    glowRgba: str
    temperatureText: str
    description: str
    nextTierWeeks: Optional[int] = None
    weeksToNextTier: Optional[int] = None


class WeeklyStreakResponse(BaseModel):
    totalContributions: int
    totalDateRange: str
    currentStreakWeeks: int
    currentStreakDateRange: str
    longestStreakWeeks: int
    longestStreakDateRange: str
    isFlameBurning: bool
    isFlameAtRisk: bool
    daysRemainingThisWeek: int
    flameStatusTitle: str
    flameStatusDescription: str
    activeWeeksCount: int
    heatTier: FlameHeatTierModel

