from starlette.testclient import TestClient
from python_engine.main import app
from python_engine.domain.physiology.weekly_recap_calculator import (
    calculate_foster_srpe,
    calculate_seiler_polarization,
    calculate_wow_delta,
    compute_weekly_pro_recap,
)
from python_engine.domain.physiology.models import (
    SessionLoadInput,
    AthletePhysiologyProfile,
)

client = TestClient(app)


def test_foster_srpe_calculation():
    sessions = [
        SessionLoadInput(
            start_date="2026-11-03T08:00:00Z",
            duration_seconds=3600,  # 60 min
            rpe=4.0,
            sport_type="Ride",
        ),
        SessionLoadInput(
            start_date="2026-11-06T08:00:00Z",
            duration_seconds=5400,  # 90 min
            rpe=5.0,
            sport_type="Ride",
        ),
    ]
    # Expected: (4 * 60) + (5 * 90) = 240 + 450 = 690 AU
    srpe = calculate_foster_srpe(sessions)
    assert srpe == 690.0


def test_seiler_polarization():
    profile = AthletePhysiologyProfile(max_hr=185)
    # HR < 138 (75% HRmax) is Zone 1-2
    sessions = [
        SessionLoadInput(
            start_date="2026-11-03T08:00:00Z",
            duration_seconds=3600,
            avg_hr=130,  # Zone 1-2
            sport_type="Ride",
        ),
        SessionLoadInput(
            start_date="2026-11-08T08:00:00Z",
            duration_seconds=7200,
            avg_hr=132,  # Zone 1-2
            sport_type="Ride",
        ),
    ]
    pol = calculate_seiler_polarization(sessions, profile)
    assert pol.is_optimal_polarized is True
    assert pol.low_zone_pct == 100.0
    assert pol.classification == "OPTIMAL_POLARIZED_80_20"


def test_wow_delta():
    profile = AthletePhysiologyProfile()
    curr = [
        SessionLoadInput(
            start_date="2026-11-10T08:00:00Z",
            duration_seconds=3600,
            distance_meters=22000,
            avg_hr=135,
        )
    ]
    prev = [
        SessionLoadInput(
            start_date="2026-11-03T08:00:00Z",
            duration_seconds=3600,
            distance_meters=20000,
            avg_hr=135,
        )
    ]
    # Delta: (22 - 20) / 20 * 100 = +10%
    wow = calculate_wow_delta(curr, prev, profile)
    assert wow.distance_change_pct == 10.0
    assert wow.safety_flag == "SAFE"


def test_compute_weekly_pro_recap_endpoint():
    payload = {
        "current_week_activities": [
            {
                "start_date": "2026-11-08T08:00:00Z",
                "duration_seconds": 3600,
                "distance_meters": 25000,
                "avg_hr": 135,
                "sport_type": "Ride",
                "rpe": 4.0,
            }
        ],
        "prev_week_activities": [
            {
                "start_date": "2026-11-01T08:00:00Z",
                "duration_seconds": 3600,
                "distance_meters": 20000,
                "avg_hr": 135,
                "sport_type": "Ride",
            }
        ],
        "peak_pain_score": 0,
        "has_swelling": False,
    }
    resp = client.post("/calculate/coach/weekly-recap", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "foster_srpe_load" in data
    assert "weekly_tss" in data
    assert "polarization" in data
    assert "wow_delta" in data
    assert "musculoskeletal" in data
    assert data["periodization_phase"] in [
        "BASE_BUILD",
        "PROGRESSIVE_OVERLOAD",
        "PEAK_WEEK",
        "DELOAD_RECOVERY",
    ]

