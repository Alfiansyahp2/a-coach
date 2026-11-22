"""
Unit Tests for Functional Fitness & Extreme Sports Physiology Engine (Phase 5).
"""

import pytest
from starlette.testclient import TestClient
from python_engine.main import app
from python_engine.domain.physiology.extreme_models import FunctionalExtremeSessionInput
from python_engine.domain.physiology.functional_extreme_engine import (
    calculate_metcon_power_output,
    calculate_finger_pulley_tension,
    evaluate_landing_peak_grf,
    calculate_surf_paddle_ratio,
    evaluate_skateboard_asymmetry_load,
    evaluate_gymnastics_wrist_compression,
    evaluate_functional_extreme_session,
)


def test_calculate_metcon_power_output():
    # 120,000 J over 600s total with 60s transitions -> active 540s -> 222.22W, 10% penalty
    res = calculate_metcon_power_output(work_joules=120000.0, total_sec=600.0, transition_sec=60.0)
    assert res["mean_power_watts"] == 222.22
    assert res["active_seconds"] == 540.0
    assert res["transition_penalty_pct"] == 10.0


def test_calculate_finger_pulley_tension_safe():
    # 60N fingertip * 3.5 = 210.0N -> LOW risk
    res = calculate_finger_pulley_tension(fingertip_force_n=60.0, crimp_lever_factor=3.5, crimp_count=15)
    assert res["pulley_peak_tension_n"] == 210.0
    assert res["risk_level"] == "LOW"


def test_calculate_finger_pulley_tension_high_risk():
    # 120N fingertip * 3.5 = 420.0N -> HIGH risk (>=400N)
    res = calculate_finger_pulley_tension(fingertip_force_n=120.0, crimp_lever_factor=3.5, crimp_count=20)
    assert res["pulley_peak_tension_n"] == 420.0
    assert res["risk_level"] == "HIGH"
    assert "TINGGI" in res["interpretation"]


def test_evaluate_landing_peak_grf_bouldering():
    # 0m drop
    assert evaluate_landing_peak_grf(0.0, 70.0)["peak_grf_n"] == 0.0

    # 2.5m drop onto mat for 70kg climber -> severe shock
    res = evaluate_landing_peak_grf(drop_height_m=2.5, athlete_weight_kg=70.0, mat_damping_factor=0.55, decel_distance_m=0.35)
    assert res["peak_grf_n"] > 3500.0
    assert res["peak_grf_bw"] >= 5.0


def test_calculate_surf_paddle_ratio():
    # 100 min paddle vs 5 min wave riding -> 20.0 ratio, alert active
    res_alert = calculate_surf_paddle_ratio(paddle_min=100.0, wave_ride_min=5.0)
    assert res_alert["paddle_to_wave_ratio"] == 20.0
    assert res_alert["thoracic_fatigue_alert"] is True

    # 30 min paddle vs 3 min wave riding -> 10.0 ratio, no alert
    res_safe = calculate_surf_paddle_ratio(paddle_min=30.0, wave_ride_min=3.0)
    assert res_safe["paddle_to_wave_ratio"] == 10.0
    assert res_safe["thoracic_fatigue_alert"] is False


def test_evaluate_skateboard_asymmetry_load():
    # 200 pushes, 10 drops -> 200*0.15 + 10*1.8 = 30 + 18 = 48.0 AU
    res_safe = evaluate_skateboard_asymmetry_load(push_kicks_count=200, drops_count=10, stance="REGULAR")
    assert res_safe["asymmetry_strain_index"] == 48.0
    assert res_safe["asymmetry_overload_alert"] is False

    # 400 pushes -> alert
    res_alert = evaluate_skateboard_asymmetry_load(push_kicks_count=400, drops_count=10)
    assert res_alert["asymmetry_overload_alert"] is True


def test_evaluate_gymnastics_wrist_compression():
    # 120s handstand on Floor for 65kg athlete -> (120/60)*65*1.0 = 130.0 AU
    res_safe = evaluate_gymnastics_wrist_compression(handstand_seconds=120.0, athlete_weight_kg=65.0, apparatus="FLOOR")
    assert res_safe["wrist_axial_load_au"] == 130.0
    assert res_safe["wrist_overload_alert"] is False

    # 360s handstand (>300s) on Vault (1.6 factor) -> alert
    res_alert = evaluate_gymnastics_wrist_compression(handstand_seconds=360.0, athlete_weight_kg=65.0, apparatus="VAULT")
    assert res_alert["wrist_overload_alert"] is True


def test_evaluate_functional_extreme_session_crossfit_flow():
    session = FunctionalExtremeSessionInput(
        sport_code="SPORT_FUNCTIONAL_FITNESS",
        duration_minutes=45.0,
        rpe=8.5,
        total_work_joules=180000.0,
        transition_seconds=180.0,
    )
    res = evaluate_functional_extreme_session(session)
    assert res.metcon_mean_power_watts > 0
    assert res.transition_penalty_pct > 0
    assert res.recommended_recovery_hours >= 24.0
    assert "SPORT_FUNCTIONAL_FITNESS" in res.coach_verdict


def test_evaluate_functional_extreme_session_climbing_high_pulley_flow():
    session = FunctionalExtremeSessionInput(
        sport_code="SPORT_CLIMBING",
        duration_minutes=90.0,
        athlete_weight_kg=68.0,
        rpe=8.0,
        fingertip_peak_force_n=120.0,
        crimp_lever_factor=3.5,  # 420N -> HIGH risk
        crimp_grip_count=35,
        avg_drop_height_m=2.0,
    )
    res = evaluate_functional_extreme_session(session)
    assert res.finger_pulley_peak_tension_n == 420.0
    assert res.pulley_rupture_risk_level == "HIGH"
    assert res.recommended_recovery_hours >= 72.0
    assert "SPORT_CLIMBING" in res.coach_verdict


def test_extreme_api_endpoint():
    client = TestClient(app)
    payload = {
        "sport_code": "SPORT_SURFING",
        "duration_minutes": 120.0,
        "rpe": 7.0,
        "paddle_minutes": 95.0,
        "wave_ride_minutes": 5.0,
        "wave_count": 8,
    }
    resp = client.post("/calculate/coach/extreme/evaluate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["sport_code"] == "SPORT_SURFING"
    assert data["paddle_to_wave_ratio"] == 19.0
    assert data["recommended_recovery_hours"] >= 36.0


def test_finger_pulley_tension_bodyweight_fallback():
    # When fingertip force is 0, estimate from athlete weight 70kg (40% BW * g = ~274.58N tip force)
    res = calculate_finger_pulley_tension(
        fingertip_force_n=0.0,
        crimp_lever_factor=3.5,
        crimp_count=20,
        athlete_weight_kg=70.0,
    )
    assert res["pulley_peak_tension_n"] > 500.0  # 274.58 * 3.5 = ~961.0N -> HIGH risk
    assert res["risk_level"] == "HIGH"


def test_functional_extreme_session_empty_safeguard():
    session = FunctionalExtremeSessionInput(
        sport_code="SPORT_CLIMBING",
        duration_minutes=0.0,
    )
    res = evaluate_functional_extreme_session(session)
    assert res.total_duration_minutes == 0.0
    assert res.finger_pulley_peak_tension_n == 0.0
    assert res.recommended_recovery_hours == 0.0
    assert "nihil" in res.coach_verdict.lower()

