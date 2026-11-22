"""
Pydantic data models for Systemic Fatigue Arbiter & Multi-Sport Ingress (Phase 6).
Evaluates AMPK vs mTORC1 molecular interference, cumulative CNS drain,
joint biomechanical collision matrix, and unified telemetry routing for all 33 sports.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class HybridSessionSummary(BaseModel):
    session_id: Optional[str] = None
    sport_code: str = Field(description="Sport code among 33 sports")
    start_time_iso: Optional[str] = None
    duration_minutes: float = Field(default=60.0, ge=0.0)
    intensity_rpe: float = Field(default=7.0, ge=1.0, le=10.0)
    explosiveness_rpe: float = Field(default=5.0, ge=1.0, le=10.0, description="Explosive effort intensity")
    modality_type: str = Field(
        default="ENDURANCE",
        description="ENDURANCE | STRENGTH | COMBAT | TEAM | RACQUET | EXTREME"
    )
    primary_joints: List[str] = Field(
        default_factory=list,
        description="List of stressed joints: KNEE | SHOULDER | LUMBAR | ANKLE | WRIST"
    )


class JointCollisionAlert(BaseModel):
    joint: str
    primary_sport: str
    conflicting_sport: str
    severity: str  # MODERATE | HIGH | CRITICAL
    clinical_risk: str
    mitigation_action: str


class MolecularInterferenceAlert(BaseModel):
    detected: bool
    buffer_hours: float
    endurance_sport: str
    strength_sport: str
    severity: str  # NONE | MODERATE | HIGH
    mechanism: str
    recommendation: str


class HybridArbitrationInput(BaseModel):
    athlete_id: Optional[str] = None
    evaluation_date: Optional[str] = None
    sessions_today: List[HybridSessionSummary] = Field(default_factory=list)
    buffer_hours_between_endurance_and_strength: Optional[float] = None
    known_injury_joints: List[str] = Field(default_factory=list)


class HybridArbitrationResponse(BaseModel):
    total_cns_drain_score: float
    cns_status: str  # OPTIMAL | ELEVATED | CRITICAL
    molecular_interference: MolecularInterferenceAlert
    joint_collisions: List[JointCollisionAlert]
    cleared_for_explosive_training: bool
    recommended_rest_hours: float
    coach_verdict: str


class CaborTelemetryIngressInput(BaseModel):
    sport_code: str
    payload: Dict[str, Any] = Field(default_factory=dict)
