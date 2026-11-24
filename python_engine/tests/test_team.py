"""
Unit Tests for Intermittent Team, Field & Court Sports Physiology Engine (Phase 3).
"""

import pytest
from starlette.testclient import TestClient
from python_engine.main import app
from python_engine.domain.physiology.models import TeamSessionInput
from python_engine.domain.physiology.team_engine import (
    calculate_catapult_player_load,
    partition_bradley_hsr,
    evaluate_hamstring_strain_risk,
    evaluate_jump_shock_load,
    evaluate_cmj_decay,
    evaluate_futsal_micro_decelerations,
    evaluate_rugby_collisions,
    evaluate_hockey_lumbar_strain,
    evaluate_team_session,
)


def test_calculate_catapult_player_load():
    # Empty or single point
    assert calculate_catapult_player_load([]) == 0.0
    assert calculate_catapult_player_load([[0.0, 1.0, 0.0]]) == 0.0

    # Synthetic 3-sample series
    # t0 = [0, 0, 0], t1 = [3, 4, 0] -> diff = (4^2 + 3^2 + 0) / 100 = 25/100 = 0.25 -> sqrt = 0.5
    # t2 = [3, 4, 10] -> diff = (0 + 0 + 100) / 100 = 1.0 -> sqrt = 1.0
    # total = 0.5 + 1.0 = 1.50
    series = [[0.0, 0.0, 0.0], [3.0, 4.0, 0.0], [3.0, 4.0, 10.0]]
    pl = calculate_catapult_player_load(series)
    assert pl == 1.50


def test_partition_bradley_hsr_zones():
    # 10 samples @ 1s interval
    # 2s @ 2.0 m/s (low: 4m), 3s @ 4.5 m/s (mod: 13.5m), 3s @ 6.0 m/s (hsr: 18m), 2s @ 8.0 m/s (sprint: 16m)
    speeds = [2.0, 2.0, 4.5, 4.5, 4.5, 6.0, 6.0, 6.0, 8.0, 8.0]
    res = partition_bradley_hsr(speeds, sample_interval_s=1.0)
    assert res["total_distance_m"] == 51.5
    assert res["low_intensity_distance_m"] == 4.0
    assert res["moderate_distance_m"] == 13.5
    assert res["hsr_distance_m"] == 18.0
    assert res["sprint_distance_m"] == 16.0
    assert res["sprint_bouts_count"] == 1
    assert res["max_speed_kmh"] == 28.8  # 8.0 * 3.6


def test_evaluate_hamstring_strain_risk_acute_surge():
    # Safe sprint volume matching chronic baseline
    risk_low, msg_low = evaluate_hamstring_strain_risk(sprint_distance_m=180.0, chronic_avg_sprint_m=200.0)
    assert risk_low == "LOW"

    # Acute surge > 15% (e.g. 260m vs 200m baseline = +30%)
    risk_high, msg_high = evaluate_hamstring_strain_risk(sprint_distance_m=260.0, chronic_avg_sprint_m=200.0)
    assert risk_high == "HIGH"
    assert "strain biseps femoris" in msg_high


def test_evaluate_jump_shock_load_and_patellar_warning():
    # Safe session with 30 jumps
    res_safe = evaluate_jump_shock_load(athlete_weight_kg=70.0, default_jump_count=30, single_leg_count=10)
    assert res_safe["total_jumps"] == 30
    assert not res_safe["patellar_warning"]
    assert res_safe["plyometric_lock_hours"] == 0.0
    assert res_safe["jump_shock_load_kj"] > 0.0

    # Overload session with 75 jumps (> 60 trigger)
    res_overload = evaluate_jump_shock_load(athlete_weight_kg=70.0, default_jump_count=75)
    assert res_overload["patellar_warning"] is True
    assert res_overload["plyometric_lock_hours"] == 48.0


def test_evaluate_cmj_decay():
    # Pre: 0.50m, Post: 0.44m -> -12.0% decay (ELEVATED > 8%)
    res_elevated = evaluate_cmj_decay(pre_match_cmj_m=0.50, post_match_cmj_m=0.44)
    assert res_elevated["decay_percentage"] == -12.0
    assert res_elevated["neuromuscular_fatigue"] == "ELEVATED"

    # Pre: 0.50m, Post: 0.40m -> -20.0% decay (CRITICAL <= -15%)
    res_critical = evaluate_cmj_decay(pre_match_cmj_m=0.50, post_match_cmj_m=0.40)
    assert res_critical["decay_percentage"] == -20.0
    assert res_critical["neuromuscular_fatigue"] == "CRITICAL"

    # Preserved
    res_fresh = evaluate_cmj_decay(pre_match_cmj_m=0.50, post_match_cmj_m=0.51)
    assert res_fresh["decay_percentage"] == 2.0
    assert res_fresh["neuromuscular_fatigue"] == "FRESH"


def test_evaluate_futsal_micro_decelerations():
    # 30 decels in 40 minutes -> 7.5 per 10min, shock = 45.0
    res = evaluate_futsal_micro_decelerations(decel_count=30, duration_minutes=40.0)
    assert res["decel_rate_per_10min"] == 7.5
    assert res["quad_eccentric_shock_au"] == 45.0
    assert not res["high_quad_doms_alert"]

    # Overload: 70 decels in 40 minutes -> 17.5 per 10min
    res_high = evaluate_futsal_micro_decelerations(decel_count=70, duration_minutes=40.0)
    assert res_high["high_quad_doms_alert"] is True


def test_evaluate_rugby_collisions():
    # Moderate collisions: high_g=10, severe_g=2, rhie=4 -> 10 + 5 + 7.2 = 22.2
    res_mod = evaluate_rugby_collisions(high_g=10, severe_g=2, rhie=4)
    assert res_mod["collision_impact_score"] == 22.2
    assert res_mod["collision_risk_level"] == "MODERATE"
    assert res_mod["recovery_hours"] == 48.0

    # Severe collisions: severe_g=12 -> HIGH risk & 72h recovery
    res_high = evaluate_rugby_collisions(high_g=10, severe_g=12, rhie=5)
    assert res_high["collision_risk_level"] == "HIGH"
    assert res_high["recovery_hours"] == 72.0


def test_evaluate_hockey_lumbar_strain():
    # Safe flexion: 15 min in 60 min session
    res_safe = evaluate_hockey_lumbar_strain(flexion_min=15.0, duration_min=60.0)
    assert res_safe["lumbar_strain_index"] == 18.0
    assert res_safe["flexion_ratio"] == 0.25
    assert not res_safe["erector_spinae_fatigue_alert"]

    # Extreme flexion: 35 min in 60 min session
    res_alert = evaluate_hockey_lumbar_strain(flexion_min=35.0, duration_min=60.0)
    assert res_alert["erector_spinae_fatigue_alert"] is True


def test_evaluate_team_session_football_full_flow():
    session = TeamSessionInput(
        sport_code="SPORT_FOOTBALL",
        duration_minutes=90.0,
        athlete_weight_kg=72.0,
        rpe=8.0,
        speed_samples_mps=[3.0] * 50 + [6.0] * 20 + [8.0] * 10,
        chronic_sprint_distance_m=50.0,  # Sprint dist is 80m (+60% surge) -> HIGH risk
        jump_count=25,
        pre_match_cmj_m=0.48,
        post_match_cmj_m=0.42,  # -12.5% decay -> ELEVATED
    )
    res = evaluate_team_session(session)
    assert res.total_player_load > 0
    assert res.sprint_distance_meters == 80.0
    assert res.hamstring_strain_risk == "HIGH"
    assert res.neuromuscular_fatigue_level == "ELEVATED"
    assert res.recommended_recovery_hours >= 36.0
    assert "Evaluasi Beregu (SPORT_FOOTBALL)" in res.coach_verdict


def test_team_api_endpoint():
    client = TestClient(app)
    payload = {
        "sport_code": "SPORT_BASKETBALL",
        "duration_minutes": 60.0,
        "athlete_weight_kg": 85.0,
        "rpe": 7.5,
        "jump_count": 65,  # > 60 jumps trigger
        "single_leg_landings_count": 20,
    }
    resp = client.post("/calculate/coach/team/evaluate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["patellar_overload_warning"] is True
    assert data["jump_shock_load_kj"] > 0
    assert data["recommended_recovery_hours"] >= 48.0


def test_catapult_sampling_rate_scaling():
    series = [[0.0, 0.0, 0.0], [3.0, 4.0, 0.0], [3.0, 4.0, 10.0]]
    # At 100 Hz (default baseline): 1.50 AU
    pl_100 = calculate_catapult_player_load(series, sampling_rate_hz=100.0)
    assert pl_100 == 1.50

    # At 10 Hz (GPS wearable): scaled by sqrt(100/10) = sqrt(10) ~ 3.1623
    pl_10 = calculate_catapult_player_load(series, sampling_rate_hz=10.0)
    assert pl_10 == round(1.50 * (10.0**0.5), 2)  # 4.74 AU


def test_hamstring_acute_unconditioned_exposure():
    # > 300m acute sprint without chronic baseline -> HIGH risk
    risk, msg = evaluate_hamstring_strain_risk(sprint_distance_m=350.0, chronic_avg_sprint_m=None)
    assert risk == "HIGH"
    assert "Paparan sprint akut tinggi" in msg

    # Safe sprint < 150m without chronic baseline -> LOW risk
    risk_low, msg_low = evaluate_hamstring_strain_risk(sprint_distance_m=120.0, chronic_avg_sprint_m=None)
    assert risk_low == "LOW"


def test_jump_shock_energy_overload():
    # 50 jumps (<= 60 count) but high drop height generating > 200 kJ shock energy
    heights = [3.5] * 50
    res = evaluate_jump_shock_load(athlete_weight_kg=100.0, jump_heights_m=heights, single_leg_count=50)
    assert res["total_jumps"] == 50
    assert res["jump_shock_load_kj"] >= 200.0
    assert res["patellar_warning"] is True
    assert res["plyometric_lock_hours"] == 48.0


def test_team_session_empty_safeguard():
    session = TeamSessionInput(
        sport_code="SPORT_FOOTBALL",
        duration_minutes=0.0,
        athlete_weight_kg=75.0,
    )
    res = evaluate_team_session(session)
    assert res.total_player_load == 0.0
    assert res.player_load_per_minute == 0.0
    assert res.recommended_recovery_hours == 0.0
    assert "nihil" in res.coach_verdict.lower()

