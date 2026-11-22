"""
Unit Tests for Systemic Fatigue Arbiter & Multi-Sport Ingress Engine (Phase 6).
"""

import pytest
from starlette.testclient import TestClient
from python_engine.main import app
from python_engine.domain.physiology.arbiter_models import (
    HybridSessionSummary,
    HybridArbitrationInput,
    CaborTelemetryIngressInput,
)
from python_engine.domain.physiology.systemic_arbiter import (
    evaluate_ampk_mtorc1_interference,
    calculate_cns_exhaustion_index,
    detect_joint_biomechanical_collisions,
    arbitrate_hybrid_athlete_schedule,
    dispatch_cabor_telemetry,
)


def test_evaluate_ampk_mtorc1_interference_safe_buffer():
    sessions = [
        HybridSessionSummary(sport_code="SPORT_RUNNING", modality_type="ENDURANCE", duration_minutes=60),
        HybridSessionSummary(sport_code="SPORT_POWERLIFTING", modality_type="STRENGTH", duration_minutes=45),
    ]
    res = evaluate_ampk_mtorc1_interference(sessions, buffer_hours=7.0)
    assert not res.detected
    assert res.severity == "NONE"


def test_evaluate_ampk_mtorc1_interference_high_risk():
    sessions = [
        HybridSessionSummary(sport_code="SPORT_RUNNING", modality_type="ENDURANCE", duration_minutes=60),
        HybridSessionSummary(sport_code="SPORT_POWERLIFTING", modality_type="STRENGTH", duration_minutes=45),
    ]
    res = evaluate_ampk_mtorc1_interference(sessions, buffer_hours=2.0)
    assert res.detected is True
    assert res.severity == "HIGH"
    assert "AMPK" in res.recommendation


def test_evaluate_ampk_mtorc1_interference_moderate():
    sessions = [
        HybridSessionSummary(sport_code="SPORT_CYCLING", modality_type="ENDURANCE", duration_minutes=60),
        HybridSessionSummary(sport_code="SPORT_WEIGHTLIFTING", modality_type="STRENGTH", duration_minutes=45),
    ]
    res = evaluate_ampk_mtorc1_interference(sessions, buffer_hours=4.5)
    assert res.detected is True
    assert res.severity == "MODERATE"


def test_calculate_cns_exhaustion_index_optimal():
    sessions = [
        HybridSessionSummary(sport_code="SPORT_ARCHERY", duration_minutes=60, explosiveness_rpe=3.0, intensity_rpe=5.0),
        HybridSessionSummary(sport_code="SPORT_CYCLING", duration_minutes=45, explosiveness_rpe=4.0, intensity_rpe=6.0),
    ]
    res = calculate_cns_exhaustion_index(sessions)
    assert res["status"] == "OPTIMAL"
    assert res["cleared_for_explosive_training"] is True


def test_calculate_cns_exhaustion_index_critical():
    sessions = [
        HybridSessionSummary(sport_code="SPORT_WEIGHTLIFTING", duration_minutes=90, explosiveness_rpe=9.5, intensity_rpe=9.0),
        HybridSessionSummary(sport_code="SPORT_BOXING", duration_minutes=75, explosiveness_rpe=9.0, intensity_rpe=8.5),
    ]
    res = calculate_cns_exhaustion_index(sessions)
    assert res["total_cns_drain_score"] >= 750.0
    assert res["status"] == "CRITICAL"
    assert res["cleared_for_explosive_training"] is False


def test_detect_joint_biomechanical_collisions_knee():
    sessions = [
        HybridSessionSummary(sport_code="SPORT_FOOTBALL", duration_minutes=90),
        HybridSessionSummary(sport_code="SPORT_FUTSAL", duration_minutes=45),
    ]
    alerts = detect_joint_biomechanical_collisions(sessions)
    knee_alert = next((a for a in alerts if a.joint == "KNEE"), None)
    assert knee_alert is not None
    assert knee_alert.severity in ("MODERATE", "HIGH")


def test_detect_joint_biomechanical_collisions_with_known_injury():
    sessions = [
        HybridSessionSummary(sport_code="SPORT_SWIMMING", duration_minutes=60),
        HybridSessionSummary(sport_code="SPORT_BADMINTON", duration_minutes=60),
    ]
    alerts = detect_joint_biomechanical_collisions(sessions, known_injury_joints=["SHOULDER"])
    shoulder_alert = next((a for a in alerts if a.joint == "SHOULDER"), None)
    assert shoulder_alert is not None
    assert shoulder_alert.severity == "CRITICAL"
    assert "PERINGATAN: Sendi SHOULDER terdaftar" in shoulder_alert.clinical_risk


def test_arbitrate_hybrid_athlete_schedule_full_flow():
    req = HybridArbitrationInput(
        athlete_id="ATHLETE_001",
        sessions_today=[
            HybridSessionSummary(sport_code="SPORT_RUNNING", modality_type="ENDURANCE", duration_minutes=60, explosiveness_rpe=5.0),
            HybridSessionSummary(sport_code="SPORT_POWERLIFTING", modality_type="STRENGTH", duration_minutes=60, explosiveness_rpe=9.0),
        ],
        buffer_hours_between_endurance_and_strength=2.5,  # High molecular interference
        known_injury_joints=["KNEE"],
    )
    res = arbitrate_hybrid_athlete_schedule(req)
    assert res.molecular_interference.detected is True
    assert res.molecular_interference.severity == "HIGH"
    assert res.recommended_rest_hours >= 36.0
    assert "Arbitrase Atlet Hibrida" in res.coach_verdict


def test_dispatch_cabor_telemetry_strength():
    ingress = CaborTelemetryIngressInput(
        sport_code="SPORT_POWERLIFTING",
        payload={
            "duration_minutes": 60.0,
            "sets": [{"exercise_name": "Squat", "weight_kg": 140.0, "reps": 5, "rpe": 8.0}],
        },
    )
    res = dispatch_cabor_telemetry(ingress)
    assert res["total_tonnage_kg"] == 700.0


def test_dispatch_cabor_telemetry_combat():
    ingress = CaborTelemetryIngressInput(
        sport_code="SPORT_BOXING",
        payload={
            "rounds": [{"round_number": 1, "duration_minutes": 3.0, "punches_thrown": 90, "rpe": 7.0}],
        },
    )
    res = dispatch_cabor_telemetry(ingress)
    assert res["punch_density_per_min"] == 30.0


def test_dispatch_cabor_telemetry_and_api():
    client = TestClient(app)

    # Ingress endpoint
    resp_ing = client.post("/calculate/coach/cabor-telemetry", json={"sport_code": "SPORT_CYCLING", "payload": {"duration_minutes": 90.0, "avg_heart_rate": 150.0}})
    assert resp_ing.status_code == 200
    assert resp_ing.json()["trimp_load"] > 0

    # Arbitration endpoint
    resp_arb = client.post("/calculate/coach/hybrid-arbitration", json={
        "sessions_today": [{"sport_code": "SPORT_RUNNING", "duration_minutes": 45.0, "explosiveness_rpe": 4.0}]
    })
    assert resp_arb.status_code == 200
    assert resp_arb.json()["cns_status"] == "OPTIMAL"


def test_joint_collisions_expanded_taxonomy():
    # Weightlifting and Football both load KNEE in expanded taxonomy
    sessions = [
        HybridSessionSummary(sport_code="SPORT_WEIGHTLIFTING", duration_minutes=60),
        HybridSessionSummary(sport_code="SPORT_FOOTBALL", duration_minutes=90),
    ]
    alerts = detect_joint_biomechanical_collisions(sessions)
    knee_alert = next((a for a in alerts if a.joint == "KNEE"), None)
    assert knee_alert is not None
    assert knee_alert.severity in ("MODERATE", "HIGH")


def test_arbitrate_hybrid_empty_schedule_safeguard():
    req = HybridArbitrationInput(sessions_today=[])
    res = arbitrate_hybrid_athlete_schedule(req)
    assert res.total_cns_drain_score == 0.0
    assert res.cns_status == "OPTIMAL"
    assert res.cleared_for_explosive_training is True
    assert res.recommended_rest_hours == 0.0
    assert "optimal" in res.coach_verdict.lower()

