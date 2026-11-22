import pytest
from starlette.testclient import TestClient
from python_engine.main import app
from python_engine.domain.physiology.combat_engine import (
    calculate_punch_density,
    partition_mma_workload,
    evaluate_concussion_scat6_gate,
    calculate_throw_kinetic_work,
    calculate_tibial_impact_index,
    evaluate_bjj_strain,
    evaluate_combat_session,
)
from python_engine.domain.physiology.models import (
    CombatRoundInput,
    CombatSessionInput,
)

client = TestClient(app)


def test_punch_density_calculation():
    # 180 punches in 3.0 minutes = 60.0 punches/min
    density = calculate_punch_density(180, 3.0)
    assert density == 60.0

    # 125 punches in 2.5 minutes = 50.0 punches/min
    assert calculate_punch_density(125, 2.5) == 50.0

    # Boundary conditions
    assert calculate_punch_density(0, 3.0) == 0.0
    assert calculate_punch_density(100, 0.0) == 0.0


def test_partition_mma_workload():
    # 10 min standup @ RPE 7, 5 min mat @ RPE 8
    # Strike load: 10 * 7 * 1.0 = 70.0
    # Grapple load: 5 * 8 * 1.35 = 54.0
    # Total: 124.0
    strike_load, grapple_load, total = partition_mma_workload(
        standup_minutes=10.0,
        mat_minutes=5.0,
        rpe_strike=7.0,
        rpe_grapple=8.0,
    )
    assert strike_load == 70.0
    assert grapple_load == 54.0
    assert total == 124.0


def test_scat6_concussion_gate_clear():
    # Normal sparring: 4 head impacts, no symptoms
    res = evaluate_concussion_scat6_gate(head_impacts=4, symptoms=[])
    assert res["gate_triggered"] is False
    assert res["action"] == "CLEAR_ROUTINE_MONITORING"
    assert res["recommended_rest_days"] == 1


def test_scat6_concussion_gate_high_impact_volume():
    # 18 hard head impacts without headgear (exceeds 15 threshold)
    res = evaluate_concussion_scat6_gate(head_impacts=18, symptoms=[])
    assert res["gate_triggered"] is True
    assert res["action"] == "HIGH_HEAD_IMPACT_SUSPENSION_7_DAYS"
    assert res["recommended_rest_days"] == 7
    assert "aksonal" in res["reason"].lower() or "benturan" in res["reason"].lower()


def test_scat6_concussion_gate_red_flag_symptoms():
    # Athlete reports dizziness and headache after sparring
    res = evaluate_concussion_scat6_gate(head_impacts=6, symptoms=["Dizziness", "Headache"])
    assert res["gate_triggered"] is True
    assert res["action"] == "MANDATORY_CONTACT_SUSPENSION_7_14_DAYS"
    assert res["recommended_rest_days"] == 14
    assert "dizziness" in res["reason"].lower()


def test_throw_kinetic_work_judo():
    # 75 kg partner, 10 throws, 1.2 m average lift height
    # W = 75 * 9.81 * 1.2 * 10 = 8829 J = 8.83 kJ
    work_kj = calculate_throw_kinetic_work(partner_weight_kg=75.0, throw_count=10, avg_lift_height_m=1.2)
    assert 8.8 <= work_kj <= 8.9

    # Boundary
    assert calculate_throw_kinetic_work(0.0, 10) == 0.0


def test_tibial_impact_index_muay_thai():
    # 50 kicks with shin guards (damping 0.45) = 50 * 1.0 * 0.45 = 22.5
    stress_protected = calculate_tibial_impact_index(kick_count=50, has_shin_guards=True, intensity_multiplier=1.0)
    assert stress_protected == 22.5

    # 50 kicks bare shin (damping 1.0) = 50.0
    stress_bare = calculate_tibial_impact_index(kick_count=50, has_shin_guards=False, intensity_multiplier=1.0)
    assert stress_bare == 50.0


def test_bjj_isometric_and_cervical_strain():
    # 30 min mat time @ RPE 8, 10 min inversion
    # Workload = 30 * 8 * 1.35 = 324.0 AU
    # Cervical strain = (10 * 2.5) + (30 * 0.2) = 25 + 6 = 31.0
    workload, cervical_strain = evaluate_bjj_strain(mat_time_minutes=30.0, avg_rpe=8.0, inversion_minutes=10.0)
    assert workload == 324.0
    assert cervical_strain == 31.0


def test_evaluate_combat_session_boxing():
    session = CombatSessionInput(
        session_id="session_boxing_001",
        sport_code="SPORT_BOXING",
        has_headgear=True,
        has_shin_guards=False,
        rounds=[
            CombatRoundInput(round_number=1, duration_minutes=3.0, rpe=7.0, punches_thrown=75, head_impacts_count=2),
            CombatRoundInput(round_number=2, duration_minutes=3.0, rpe=8.0, punches_thrown=85, head_impacts_count=3),
            CombatRoundInput(round_number=3, duration_minutes=3.0, rpe=8.5, punches_thrown=90, head_impacts_count=3),
        ],
        symptoms_reported=[],
    )

    resp = evaluate_combat_session(session)

    assert resp.total_duration_minutes == 9.0
    assert resp.punch_density_per_min == round(250 / 9.0, 2)  # 27.78
    assert resp.striking_load_au > 0
    assert resp.grappling_load_au == 0.0
    assert resp.concussion_gate_triggered is False
    assert resp.recommended_rest_days >= 1
    assert "SPORT_BOXING" in resp.coach_verdict


def test_combat_api_endpoint():
    payload = {
        "session_id": "api_test_combat_001",
        "sport_code": "SPORT_MMA",
        "has_headgear": False,
        "has_shin_guards": True,
        "rounds": [
            {
                "round_number": 1,
                "duration_minutes": 5.0,
                "rpe": 8.0,
                "punches_thrown": 45,
                "kicks_thrown": 15,
                "mat_time_minutes": 2.5,
                "head_impacts_count": 4,
            },
            {
                "round_number": 2,
                "duration_minutes": 5.0,
                "rpe": 9.0,
                "punches_thrown": 50,
                "kicks_thrown": 20,
                "mat_time_minutes": 3.0,
                "head_impacts_count": 5,
            },
        ],
        "symptoms_reported": [],
    }

    response = client.post("/calculate/coach/combat/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["total_duration_minutes"] == 10.0
    assert data["striking_load_au"] > 0
    assert data["grappling_load_au"] > 0
    assert data["tibial_stress_score"] > 0
    assert "SPORT_MMA" in data["coach_verdict"]


def test_throw_kinetic_work_fallback_weight():
    # If partner_weight_kg is None or 0, fallback to default (75.0 kg)
    work_fallback = calculate_throw_kinetic_work(partner_weight_kg=None, throw_count=10, avg_lift_height_m=1.2)
    work_explicit = calculate_throw_kinetic_work(partner_weight_kg=75.0, throw_count=10, avg_lift_height_m=1.2)
    assert work_fallback == work_explicit
    assert 8.8 <= work_fallback <= 8.9


def test_scat6_rotational_impacts_trigger():
    # 6 rotational impacts (hooks/high kicks) trigger concussion gate even if total impacts < 15
    res = evaluate_concussion_scat6_gate(head_impacts=6, symptoms=[], rotational_impacts=6)
    assert res["gate_triggered"] is True
    assert res["action"] == "HIGH_HEAD_IMPACT_SUSPENSION_7_DAYS"
    assert res["recommended_rest_days"] == 7
    assert "rotasional" in res["reason"]


def test_bjj_gi_vs_nogi_fatigue_multiplier():
    # Gi training has 1.25x grip multiplier compared to No-Gi
    work_gi, _ = evaluate_bjj_strain(mat_time_minutes=30.0, avg_rpe=8.0, is_gi=True)
    work_nogi, _ = evaluate_bjj_strain(mat_time_minutes=30.0, avg_rpe=8.0, is_gi=False)
    assert work_gi == round(work_nogi * 1.25, 2)


def test_evaluate_combat_session_empty_safeguard():
    session = CombatSessionInput(
        session_id="session_empty",
        sport_code="SPORT_BOXING",
        rounds=[],
        symptoms_reported=[],
    )
    resp = evaluate_combat_session(session)
    assert resp.total_duration_minutes == 0.0
    assert resp.total_combat_workload_au == 0.0
    assert resp.concussion_gate_triggered is False
    assert "nihil" in resp.coach_verdict.lower()

