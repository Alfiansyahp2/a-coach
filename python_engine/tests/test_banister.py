from starlette.testclient import TestClient
from python_engine.main import app
from python_engine.domain.physiology.banister_engine import (
    calculate_trimp,
    calculate_session_load,
    calculate_pmc,
    get_tsb_interpretation,
)
from python_engine.domain.physiology.models import (
    TRIMPCalculationInput,
    SessionLoadInput,
    AthletePhysiologyProfile,
    DecouplingInput,
)
from python_engine.domain.physiology.decoupling_engine import calculate_session_debrief

client = TestClient(app)


def test_trimp_calculation():
    # 60 mins at HR 150 (rest 50, max 190) -> DeltaHR = 100/140 = 0.714
    inp = TRIMPCalculationInput(
        duration_minutes=60,
        avg_hr=150,
        max_hr=190,
        rest_hr=50,
        gender="male",
    )
    trimp = calculate_trimp(inp)
    assert trimp > 0
    # Expected: 60 * 0.714 * 0.64 * exp(1.92 * 0.714) ~= 60 * 0.714 * 0.64 * 3.94 ~= 108.2
    assert 90.0 <= trimp <= 125.0


def test_session_load():
    profile = AthletePhysiologyProfile(rest_hr=52, max_hr=185, ftp=200)
    session = SessionLoadInput(
        start_date="2026-11-10T08:00:00Z",
        duration_seconds=3600,
        avg_hr=140,
        sport_type="Ride",
    )
    load = calculate_session_load(session, profile)
    assert load > 0
    assert 40 <= load <= 120


def test_pmc_calculation():
    profile = AthletePhysiologyProfile()
    sessions = [
        SessionLoadInput(
            start_date="2026-11-01T08:00:00Z",
            duration_seconds=3600,
            avg_hr=140,
            sport_type="Ride",
        ),
        SessionLoadInput(
            start_date="2026-11-05T08:00:00Z",
            duration_seconds=5400,
            avg_hr=145,
            sport_type="Ride",
        ),
    ]
    pmc = calculate_pmc(sessions=sessions, profile=profile, days_history=14)
    assert len(pmc.data_points) == 14
    assert pmc.current_ctl >= 0
    assert pmc.current_atl >= 0
    assert pmc.current_zone in [
        "HIGH_FATIGUE_OVERREACHING",
        "OPTIMAL_OVERLOAD",
        "NEUTRAL_MAINTENANCE",
        "PEAK_RACE_FORM",
        "DETRAINING_TRANSITION",
    ]


def test_session_debrief_clean():
    inp = DecouplingInput(
        activity_id="act-test-1",
        duration_seconds=3600,
        avg_hr=135,
        target_hr_min=125,
        target_hr_max=145,
        pain_during=0,
        pain_after=0,
        swelling=False,
    )
    debrief = calculate_session_debrief(inp)
    assert debrief.activity_id == "act-test-1"
    assert debrief.zone_compliance_rating == "PATUH_OPTIMAL"
    assert "PERHATIAN KLINIS" not in debrief.coach_debrief_feedback


def test_session_debrief_with_pain_and_drift():
    inp = DecouplingInput(
        activity_id="act-test-2",
        duration_seconds=6000,
        avg_hr=158,
        target_hr_min=120,
        target_hr_max=140,
        pain_during=4,
        pain_after=5,
        swelling=True,
    )
    debrief = calculate_session_debrief(inp)
    assert debrief.has_cardiac_drift is True
    assert "PERHATIAN KLINIS" in debrief.coach_debrief_feedback
    assert "kompres es" in debrief.corrective_tactical_advice


def test_coach_api_endpoints():
    # Test /calculate/coach/trimp
    resp = client.post(
        "/calculate/coach/trimp",
        json={
            "duration_minutes": 60,
            "avg_hr": 145,
            "max_hr": 185,
            "rest_hr": 52,
            "gender": "male",
        },
    )
    assert resp.status_code == 200
    assert "trimp" in resp.json()

    # Test /calculate/coach/pmc
    resp = client.post(
        "/calculate/coach/pmc",
        json={
            "sessions": [
                {
                    "start_date": "2026-11-08T08:00:00Z",
                    "duration_seconds": 3600,
                    "avg_hr": 140,
                }
            ],
            "days_history": 7,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "current_ctl" in data
    assert "current_atl" in data
    assert "current_tsb" in data
    assert len(data["data_points"]) == 7

