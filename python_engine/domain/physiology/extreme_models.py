"""
Pydantic data models for Functional Fitness & Extreme Sports Physiology Engine (Phase 5).
Covers CrossFit/Hyrox, Sport Climbing/Bouldering, Gymnastics, Surfing, and Skateboarding.
"""

from typing import Optional, List
from pydantic import BaseModel, Field


class FunctionalExtremeSessionInput(BaseModel):
    session_id: Optional[str] = None
    sport_code: str = Field(
        default="SPORT_FUNCTIONAL_FITNESS",
        description="SPORT_FUNCTIONAL_FITNESS | SPORT_CLIMBING | SPORT_GYMNASTICS | SPORT_SURFING | SPORT_SKATEBOARDING",
    )
    duration_minutes: float = Field(default=60.0, ge=0.0)
    athlete_weight_kg: float = Field(default=70.0, ge=30.0, le=200.0)
    rpe: float = Field(default=7.5, ge=1.0, le=10.0)

    # Metcon / CrossFit / Hyrox
    total_work_joules: float = Field(default=0.0, ge=0.0, description="Estimated work in Joules")
    transition_seconds: float = Field(default=0.0, ge=0.0, description="Total transition / idle time in seconds")

    # Climbing / Bouldering
    crimp_grip_count: int = Field(default=0, ge=0, description="Closed crimp grip attempts")
    fingertip_peak_force_n: float = Field(default=0.0, ge=0.0, description="Peak fingertip force in Newtons")
    crimp_lever_factor: float = Field(default=3.5, ge=1.0, le=5.0, description="Tendon pulley lever multiplier (3.0-4.0x)")
    bouldering_drops_count: int = Field(default=0, ge=0, description="High falls/drops onto crash pad")
    avg_drop_height_m: float = Field(default=0.0, ge=0.0, description="Average drop height in meters")

    # Gymnastics
    dismount_drops_count: int = Field(default=0, ge=0, description="Dismount drops from apparatus")
    handstand_seconds: float = Field(default=0.0, ge=0.0, description="Total time under wrist axial compression")
    apparatus: Optional[str] = Field(default=None, description="FLOOR | RINGS | VAULT | HIGH_BAR | POMMEL_HORSE")

    # Surfing
    paddle_minutes: float = Field(default=0.0, ge=0.0, description="Minutes spent paddling board")
    wave_ride_minutes: float = Field(default=0.0, ge=0.0, description="Minutes riding waves")
    wave_count: int = Field(default=0, ge=0, description="Total waves caught")

    # Skateboarding
    push_kicks_count: int = Field(default=0, ge=0, description="Total propulsion push kicks")
    stance_dominant_leg: str = Field(default="REGULAR", description="REGULAR (left forward) | GOOFY (right forward)")
    stair_gap_drops_count: int = Field(default=0, ge=0, description="Drops from stairs/gaps/ledges")


class FunctionalExtremeSessionResponse(BaseModel):
    total_duration_minutes: float
    sport_code: str
    metcon_mean_power_watts: float
    transition_penalty_pct: float
    finger_pulley_peak_tension_n: float
    pulley_rupture_risk_level: str  # LOW | MODERATE | HIGH
    peak_ground_reaction_force_bw: float  # Multiples of Body Weight (BW)
    paddle_to_wave_ratio: float
    asymmetry_strain_index: float
    wrist_axial_compressive_load_au: float
    recommended_recovery_hours: float
    coach_verdict: str
