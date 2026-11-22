from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class TRIMPCalculationInput(BaseModel):
    duration_minutes: float = Field(..., ge=0, description="Duration of exercise in minutes")
    avg_hr: float = Field(..., ge=30, le=250, description="Average heart rate during session")
    max_hr: float = Field(default=185.0, ge=100, le=250, description="Max heart rate of athlete")
    rest_hr: float = Field(default=52.0, ge=30, le=120, description="Resting heart rate of athlete")
    gender: str = Field(default="male", description="Biological sex ('male' or 'female')")


class SessionLoadInput(BaseModel):
    id: Optional[str] = None
    start_date: str = Field(..., description="ISO 8601 date string of the session")
    duration_seconds: float = Field(..., ge=0, description="Total moving duration in seconds")
    distance_meters: float = Field(default=0.0, ge=0)
    avg_hr: Optional[float] = Field(default=None, ge=30, le=250)
    max_hr: Optional[float] = Field(default=None, ge=30, le=250)
    avg_power: Optional[float] = Field(default=None, ge=0)
    avg_speed_mps: Optional[float] = Field(default=None, ge=0)
    sport_type: str = Field(default="Ride")
    rpe: Optional[float] = Field(default=None, ge=1, le=10)


class PMCDataPoint(BaseModel):
    date: str
    date_key: str
    day_load: float
    ctl: float
    atl: float
    tsb: float
    tsb_zone: str
    interpretation: str


class AthletePhysiologyProfile(BaseModel):
    rest_hr: float = Field(default=52.0)
    max_hr: float = Field(default=185.0)
    gender: str = Field(default="male")
    ftp: Optional[float] = Field(default=200.0)
    threshold_pace_sec: Optional[float] = Field(default=300.0)


class PMCPayload(BaseModel):
    sessions: List[SessionLoadInput] = Field(default_factory=list)
    profile: Optional[AthletePhysiologyProfile] = None
    days_history: int = Field(default=42, ge=7, le=365)


class PMCResponse(BaseModel):
    data_points: List[PMCDataPoint]
    current_ctl: float
    current_atl: float
    current_tsb: float
    current_zone: str
    ewma_acwr: float
    recommended_action: str


class DecouplingInput(BaseModel):
    activity_id: str
    duration_seconds: float = Field(..., ge=60)
    avg_hr: Optional[float] = None
    max_hr: Optional[float] = None
    avg_speed_mps: Optional[float] = None
    avg_power: Optional[float] = None
    sport_type: str = Field(default="Ride")
    target_hr_min: Optional[float] = None
    target_hr_max: Optional[float] = None
    pain_during: int = Field(default=0, ge=0, le=10)
    pain_after: int = Field(default=0, ge=0, le=10)
    swelling: bool = Field(default=False)


class DecouplingResponse(BaseModel):
    activity_id: str
    aerobic_decoupling_pct: Optional[float]
    has_cardiac_drift: bool
    drift_severity: str
    zone_compliance_pct: float
    zone_compliance_rating: str
    coach_debrief_feedback: str
    corrective_tactical_advice: str


# =========================================================================
# PRO WEEKLY RECAP MODELS
# =========================================================================

class PolarizationBreakdown(BaseModel):
    low_zone_pct: float = Field(..., description="Zone 1-2 percentage (Aerobic Foundation)")
    moderate_zone_pct: float = Field(..., description="Zone 3 percentage (Tempo / Sweetspot)")
    high_zone_pct: float = Field(..., description="Zone 4-5 percentage (Threshold / Anaerobic)")
    is_optimal_polarized: bool
    classification: str
    verdict: str


class WoWDelta(BaseModel):
    distance_change_pct: float
    tss_change_pct: float
    safety_flag: str  # SAFE | MODERATE_SURGE | SPIKE_WARNING
    interpretation: str


class MusculoskeletalStrain(BaseModel):
    impact_running_pct: float
    non_impact_cycling_pct: float
    joint_safety_rating: str
    pain_gradient_note: str


class WeeklyProRecapPayload(BaseModel):
    current_week_activities: List[SessionLoadInput] = Field(default_factory=list)
    prev_week_activities: List[SessionLoadInput] = Field(default_factory=list)
    profile: Optional[AthletePhysiologyProfile] = None
    peak_pain_score: int = Field(default=0, ge=0, le=10)
    has_swelling: bool = Field(default=False)


class WeeklyProRecapResponse(BaseModel):
    foster_srpe_load: float
    weekly_tss: float
    training_monotony: float
    training_strain: float
    polarization: PolarizationBreakdown
    wow_delta: WoWDelta
    musculoskeletal: MusculoskeletalStrain
    periodization_phase: str  # BASE_BUILD | PROGRESSIVE_OVERLOAD | PEAK_WEEK | DELOAD_RECOVERY
    pro_coach_verdict: str
    next_week_bridge_advice: str


# ==============================================================================
# PHASE 1: STRENGTH, POWER & HYPERTROPHY MODELS
# ==============================================================================

class StrengthSetInput(BaseModel):
    exercise_name: str = Field(..., description="Name of the exercise (e.g. 'Back Squat', 'Bench Press', 'Deadlift')")
    weight_kg: float = Field(..., ge=0, description="Load in kilograms")
    reps: int = Field(..., ge=1, le=100, description="Completed valid repetitions")
    rpe: Optional[float] = Field(default=None, ge=1, le=10, description="Rate of Perceived Exertion (Borg CR10)")
    rir: Optional[int] = Field(default=None, ge=0, le=10, description="Reps In Reserve")
    bar_velocity_mps: Optional[float] = Field(default=None, ge=0, description="Mean concentric bar velocity in m/s")
    is_warmup: bool = Field(default=False, description="Whether this is a warm-up set (excluded from hard set tonnages)")


class StrengthSessionInput(BaseModel):
    session_id: Optional[str] = None
    sport_code: str = Field(default="SPORT_POWERLIFTING")
    sets: List[StrengthSetInput] = Field(default_factory=list)
    known_1rm_map: Dict[str, float] = Field(default_factory=dict, description="Known 1RM per exercise")
    bodyweight_kg: float = Field(default=70.0, ge=30, le=300)
    duration_minutes: float = Field(default=60.0, ge=1)


class StrengthSessionResponse(BaseModel):
    total_tonnage_kg: float
    total_reps: int
    hard_sets_count: int
    exercise_inol_map: Dict[str, float]
    total_session_inol: float
    estimated_1rm_map: Dict[str, float]
    fatigue_classification: str  # RECOVERY | OPTIMAL_ACCUMULATION | HIGH_FATIGUE | CRITICAL_OVERREACHING
    cns_drain_score: float  # 0 to 10 scale
    recommended_recovery_hours: float
    coach_verdict: str


# ==============================================================================
# PHASE 2: HIGH-INTENSITY COMBAT & MARTIAL ARTS MODELS
# ==============================================================================

class CombatRoundInput(BaseModel):
    round_number: int = Field(default=1, ge=1, description="Round sequence number")
    duration_minutes: float = Field(default=3.0, ge=0.5, le=15.0, description="Round duration in minutes (e.g. 3 min boxing, 5 min MMA)")
    rpe: float = Field(default=7.0, ge=1.0, le=10.0, description="Round RPE (Borg CR10)")
    punches_thrown: int = Field(default=0, ge=0, description="Count of punches thrown")
    kicks_thrown: int = Field(default=0, ge=0, description="Count of roundhouse/low/body kicks")
    takedowns_attempted: int = Field(default=0, ge=0, description="Count of takedown / throw attempts")
    mat_time_minutes: float = Field(default=0.0, ge=0, description="Time spent in ground fighting / grappling")
    head_impacts_count: int = Field(default=0, ge=0, description="Count of hard head blows received during round")
    inversion_minutes: float = Field(default=0.0, ge=0, description="Time spent inverted (BJJ guard / stacking)")


class CombatSessionInput(BaseModel):
    session_id: Optional[str] = None
    sport_code: str = Field(default="SPORT_BOXING", description="SPORT_BOXING | SPORT_MMA | SPORT_BJJ | SPORT_PENCAK_SILAT | SPORT_JUDO | SPORT_MUAY_THAI")
    partner_weight_kg: Optional[float] = Field(default=None, ge=30.0, le=200.0, description="Sparring partner bodyweight in kg")
    has_headgear: bool = Field(default=False, description="Whether athlete used headgear during sparring")
    has_shin_guards: bool = Field(default=True, description="Whether shin guards were worn during kicking")
    rounds: List[CombatRoundInput] = Field(default_factory=list, description="Array of rounds completed")
    symptoms_reported: List[str] = Field(default_factory=list, description="Symptoms e.g. 'headache', 'dizziness', 'nausea', 'photophobia'")


class CombatSessionResponse(BaseModel):
    total_duration_minutes: float
    total_combat_workload_au: float
    punch_density_per_min: float
    striking_load_au: float
    grappling_load_au: float
    concussion_gate_triggered: bool
    concussion_action: str
    tibial_stress_score: float
    cervical_strain_index: float
    recommended_rest_days: int
    coach_verdict: str


