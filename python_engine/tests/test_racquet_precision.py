"""
Unit Tests for Racquet & Precision Sports Physiology Engine (Phase 4).
"""

import pytest
from starlette.testclient import TestClient
from python_engine.main import app
from python_engine.domain.physiology.racquet_models import RacquetPrecisionSessionInput
from python_engine.domain.physiology.racquet_precision_engine import (
    calculate_archery_draw_volume,
    evaluate_hold_tremor_index,
    calculate_diastolic_sync_rate,
    calculate_shoulder_kinetic_load,
    calculate_badminton_smash_energy,
    evaluate_table_tennis_density,
    evaluate_postural_sway_degradation,
    evaluate_racquet_precision_session,
)


def test_calculate_archery_draw_volume_standard_and_overload():
    # 120 arrows with 42 lbs bow = 5040 lbs (~2286.1 kg) -> overload alert
    res_overload = calculate_archery_draw_volume(draw_weight_lbs=42.0, arrow_count=120)
    assert res_overload["volume_lbs"] == 5040.0
    assert abs(res_overload["volume_kg"] - 2286.11) < 0.1
    assert res_overload["overload_alert"] is True

    # 60 arrows with 30 lbs bow = 1800 lbs (~816.5 kg) -> optimal
    res_safe = calculate_archery_draw_volume(draw_weight_lbs=30.0, arrow_count=60)
    assert res_safe["volume_lbs"] == 1800.0
    assert res_safe["overload_alert"] is False


def test_evaluate_hold_tremor_index():
    # Empty -> STABLE
    assert evaluate_hold_tremor_index([])["fatigue_level"] == "STABLE"

    # Stable micro-tremor
    res_stable = evaluate_hold_tremor_index([1.2, 1.4, 1.1, 1.3])
    assert res_stable["mean_tremor_mm"] == 1.25
    assert res_stable["fatigue_level"] == "STABLE"

    # Elevated tremor
    res_elevated = evaluate_hold_tremor_index([2.1, 2.3, 2.0, 2.4])
    assert res_elevated["mean_tremor_mm"] == 2.2
    assert res_elevated["fatigue_level"] == "ELEVATED"

    # Critical tremor
    res_critical = evaluate_hold_tremor_index([3.2, 3.8, 4.1])
    assert res_critical["fatigue_level"] == "CRITICAL"


def test_calculate_diastolic_sync_rate():
    # 54 of 60 in diastole = 90% (ELITE)
    res_elite = calculate_diastolic_sync_rate(shots_diastole=54, total_shots=60)
    assert res_elite["sync_rate_pct"] == 90.0
    assert res_elite["classification"] == "ELITE"

    # 45 of 60 in diastole = 75% (PROFICIENT)
    res_prof = calculate_diastolic_sync_rate(shots_diastole=45, total_shots=60)
    assert res_prof["sync_rate_pct"] == 75.0
    assert res_prof["classification"] == "PROFICIENT"

    # 36 of 60 in diastole = 60% (DEGRADED)
    res_deg = calculate_diastolic_sync_rate(shots_diastole=36, total_shots=60)
    assert res_deg["sync_rate_pct"] == 60.0
    assert res_deg["classification"] == "DEGRADED"

    # 0 shots
    assert calculate_diastolic_sync_rate(0, 0)["classification"] == "UNKNOWN"


def test_calculate_shoulder_kinetic_load_tennis_serves():
    # 10 serves @ 160 km/h with 10 kick serves (1.15 factor) -> 10 * 160 * 1.15 = 1840 AU
    # plus 20 serves @ 180 km/h (1.0 factor) -> 20 * 180 = 3600 AU
    # total = 5440 AU
    speeds = [160.0] * 10 + [180.0] * 20
    res = calculate_shoulder_kinetic_load(speeds, kick_serve_count=10)
    assert res["total_serves"] == 30
    assert res["shoulder_load_au"] == 5440.0
    assert not res["rotator_cuff_overload_alert"]


def test_calculate_badminton_smash_energy():
    # 40 smashes @ 300 km/h -> 40 * (3)^2 * 5 = 1800 AU
    # 30 unilateral lunges -> 30 * 2.5 = 75 AU
    # total = 1875 AU
    res = calculate_badminton_smash_energy(smash_count=40, avg_head_speed_kmh=300.0, unilateral_landing_count=30)
    assert res["kinetic_load_au"] == 1875.0
    assert not res["patellar_shoulder_warning"]

    # Overload
    res_overload = calculate_badminton_smash_energy(smash_count=70, unilateral_landing_count=90)
    assert res_overload["patellar_shoulder_warning"] is True


def test_evaluate_table_tennis_density():
    # 1200 micro steps in 30 min -> 40.0 steps/min, 60 loops -> 75.0 AU
    res = evaluate_table_tennis_density(micro_steps=1200, duration_minutes=30.0, forehand_loops=60)
    assert res["step_density_per_min"] == 40.0
    assert res["loop_rotational_impulse_au"] == 75.0
    assert not res["high_intensity_alert"]

    # High intensity
    res_hi = evaluate_table_tennis_density(micro_steps=1800, duration_minutes=30.0, forehand_loops=130)
    assert res_hi["step_density_per_min"] == 60.0
    assert res_hi["high_intensity_alert"] is True


def test_evaluate_postural_sway_degradation():
    # Early 4.0mm, Late 5.6mm -> +40.0% degradation
    deg = evaluate_postural_sway_degradation(early_sway_mm=4.0, late_sway_mm=5.6)
    assert deg == 40.0
    assert evaluate_postural_sway_degradation(None, 5.0) is None


def test_evaluate_racquet_precision_session_archery_flow():
    session = RacquetPrecisionSessionInput(
        sport_code="SPORT_ARCHERY",
        duration_minutes=90.0,
        rpe=7.0,
        draw_weight_lbs=42.0,
        arrow_count=120,
        tremor_amplitudes_mm=[2.2, 2.5, 2.4, 2.6],  # Elevated
    )
    res = evaluate_racquet_precision_session(session)
    assert res.cumulative_draw_volume_lbs == 5040.0
    assert res.tremor_fatigue_level == "ELEVATED"
    assert res.recommended_recovery_hours >= 36.0
    assert "Evaluasi Presisi & Raket (SPORT_ARCHERY)" in res.coach_verdict


def test_evaluate_racquet_precision_session_shooting_flow():
    session = RacquetPrecisionSessionInput(
        sport_code="SPORT_SHOOTING",
        duration_minutes=60.0,
        rpe=5.0,
        total_shots=60,
        diastolic_shots_count=54,  # 90% ELITE
        early_sway_radius_mm=3.0,
        late_sway_radius_mm=3.6,  # 20% degradation
    )
    res = evaluate_racquet_precision_session(session)
    assert res.cardio_diastolic_sync_rate_pct == 90.0
    assert res.sync_classification == "ELITE"
    assert res.postural_sway_degradation_pct == 20.0
    assert "Sinkronisasi Diastolik: 90.0% (ELITE)" in res.coach_verdict


def test_racquet_api_endpoint():
    client = TestClient(app)
    payload = {
        "sport_code": "SPORT_BADMINTON",
        "duration_minutes": 75.0,
        "rpe": 8.0,
        "smash_count": 45,
        "unilateral_lunges_count": 50,
    }
    resp = client.post("/calculate/coach/racquet/evaluate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["sport_code"] == "SPORT_BADMINTON"
    assert data["shoulder_rotator_load_au"] > 0
    assert data["recommended_recovery_hours"] >= 24.0
