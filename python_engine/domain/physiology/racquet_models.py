"""
Pydantic data models for Racquet & Precision Sports Physiology Engine (Phase 4).
Covers Badminton, Tennis, Table Tennis, Archery, and Precision Shooting.
"""

from typing import Optional, List
from pydantic import BaseModel, Field


class RacquetPrecisionSessionInput(BaseModel):
    session_id: Optional[str] = None
    sport_code: str = Field(
        default="SPORT_BADMINTON",
        description="SPORT_BADMINTON | SPORT_TENNIS | SPORT_TABLE_TENNIS | SPORT_ARCHERY | SPORT_SHOOTING",
    )
    duration_minutes: float = Field(default=60.0, ge=1.0)
    rpe: float = Field(default=6.5, ge=1.0, le=10.0)

    # Tennis & Badminton
    serve_speeds_kmh: List[float] = Field(default_factory=list, description="Recorded serve speeds in km/h")
    kick_serve_count: int = Field(default=0, ge=0, description="Count of kick/topspin serves with higher torque")
    smash_count: int = Field(default=0, ge=0, description="Jump smashes / overhead kills")
    unilateral_lunges_count: int = Field(default=0, ge=0, description="Deep asymmetric lunges onto dominant leg")
    long_rallies_count: int = Field(default=0, ge=0, description="Rallies > 8 shots")
    short_rallies_count: int = Field(default=0, ge=0, description="Rallies < 4 shots")

    # Table Tennis
    micro_steps_count: int = Field(default=0, ge=0, description="Rapid side-to-side micro steps count")
    forehand_loops_count: int = Field(default=0, ge=0, description="High-RPM forehand loop drives count")

    # Archery
    draw_weight_lbs: float = Field(default=0.0, ge=0.0, description="Bow draw weight in pounds (e.g. 42 lbs)")
    arrow_count: int = Field(default=0, ge=0, description="Number of arrows released")
    tremor_amplitudes_mm: List[float] = Field(default_factory=list, description="Anchor hold tremor deviation in mm")

    # Precision Shooting
    total_shots: int = Field(default=0, ge=0, description="Total match / practice shots fired")
    diastolic_shots_count: int = Field(default=0, ge=0, description="Shots triggered during late cardiac diastole")
    early_sway_radius_mm: Optional[float] = Field(default=None, ge=0.0, description="Initial center-of-pressure sway")
    late_sway_radius_mm: Optional[float] = Field(default=None, ge=0.0, description="Final center-of-pressure sway")


class RacquetPrecisionSessionResponse(BaseModel):
    total_duration_minutes: float
    sport_code: str
    shoulder_rotator_load_au: float
    cumulative_draw_volume_lbs: float
    cumulative_draw_volume_kg: float
    hold_tremor_index_mm: float
    tremor_fatigue_level: str  # STABLE | ELEVATED | CRITICAL
    cardio_diastolic_sync_rate_pct: float
    sync_classification: str   # ELITE | PROFICIENT | DEGRADED | UNKNOWN
    postural_sway_degradation_pct: Optional[float]
    step_density_per_min: float
    recommended_recovery_hours: float
    coach_verdict: str
