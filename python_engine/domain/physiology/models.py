from typing import List, Optional
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

