import pytest
from starlette.testclient import TestClient
from python_engine.main import app
from python_engine.domain.physiology.strength_engine import (
    calculate_brzycki_1rm,
    calculate_epley_1rm,
    calculate_volume_tonnage,
    calculate_sheiko_inol,
    calculate_session_inol,
    evaluate_velocity_loss_cutoff,
    calculate_calisthenics_torque,
    evaluate_strength_session,
)
from python_engine.domain.physiology.models import (
    StrengthSetInput,
    StrengthSessionInput,
)

client = TestClient(app)


def test_brzycki_and_epley_1rm_estimation():
    # 1 rep max should return exact weight
    assert calculate_brzycki_1rm(120.0, 1) == 120.0
    assert calculate_epley_1rm(120.0, 1) == 120.0

    # 100 kg for 5 reps Brzycki: 100 / (1.0278 - (0.0278 * 5)) = 100 / 0.8888 = 112.51
    brz_5 = calculate_brzycki_1rm(100.0, 5)
    assert 112.0 <= brz_5 <= 113.0

    # 100 kg for 10 reps Epley: 100 * (1 + 10/30) = 133.33
    epl_10 = calculate_epley_1rm(100.0, 10)
    assert 133.0 <= epl_10 <= 134.0

    # Boundary conditions
    assert calculate_brzycki_1rm(0.0, 5) == 0.0
    assert calculate_brzycki_1rm(100.0, 0) == 0.0


def test_volume_tonnage_calculation():
    sets = [
        StrengthSetInput(exercise_name="Back Squat", weight_kg=60.0, reps=10, is_warmup=True),
        StrengthSetInput(exercise_name="Back Squat", weight_kg=100.0, reps=5, is_warmup=False),
        StrengthSetInput(exercise_name="Back Squat", weight_kg=100.0, reps=5, is_warmup=False),
        StrengthSetInput(exercise_name="Back Squat", weight_kg=100.0, reps=5, is_warmup=False),
    ]

    # Exclude warm-up: 3 * (100 * 5) = 1500 kg
    tonnage_work = calculate_volume_tonnage(sets, include_warmup=False)
    assert tonnage_work == 1500.0

    # Include warm-up: 1500 + 600 = 2100 kg
    tonnage_all = calculate_volume_tonnage(sets, include_warmup=True)
    assert tonnage_all == 2100.0


def test_sheiko_inol_calculation():
    # 5 reps at 80% 1RM: 5 / (100 - 80) = 5 / 20 = 0.25 INOL
    inol = calculate_sheiko_inol(reps=5, pct_1rm=80.0)
    assert inol == 0.25

    # 3 reps at 90% 1RM: 3 / (100 - 90) = 3 / 10 = 0.3 INOL
    assert calculate_sheiko_inol(reps=3, pct_1rm=90.0) == 0.3

    # Zero or invalid inputs
    assert calculate_sheiko_inol(0, 80.0) == 0.0
    assert calculate_sheiko_inol(5, 0.0) == 0.0


def test_session_inol_accumulation():
    sets = [
        StrengthSetInput(exercise_name="Back Squat", weight_kg=120.0, reps=5, is_warmup=False),
        StrengthSetInput(exercise_name="Back Squat", weight_kg=120.0, reps=5, is_warmup=False),
        StrengthSetInput(exercise_name="Bench Press", weight_kg=90.0, reps=5, is_warmup=False),
    ]
    known_1rm = {"Back Squat": 150.0, "Bench Press": 100.0}

    # Squat: 120/150 = 80% -> 5 / (100 - 80) = 0.25 * 2 = 0.50 INOL
    # Bench: 90/100 = 90% -> 5 / (100 - 90) = 5 / 10 = 0.50 INOL
    # Total session INOL = 1.00
    ex_inol, total_inol, est_1rm = calculate_session_inol(sets, known_1rm)

    assert ex_inol["Back Squat"] == 0.5
    assert ex_inol["Bench Press"] == 0.5
    assert total_inol == 1.0


def test_velocity_based_training_loss_cutoff():
    # Minor drop: 0.80 m/s -> 0.76 m/s (5% drop, safe)
    res_safe = evaluate_velocity_loss_cutoff(initial_velocity=0.80, current_velocity=0.76, threshold_pct=10.0)
    assert res_safe["velocity_loss_pct"] == 5.0
    assert res_safe["should_terminate_set"] is False
    assert res_safe["fatigue_level"] == "MINIMAL"

    # Moderate drop: 0.80 m/s -> 0.70 m/s (12.5% drop >= 10% threshold)
    res_mod = evaluate_velocity_loss_cutoff(initial_velocity=0.80, current_velocity=0.70, threshold_pct=10.0)
    assert res_mod["velocity_loss_pct"] == 12.5
    assert res_mod["should_terminate_set"] is True
    assert res_mod["fatigue_level"] == "MODERATE_POWER_DECAY"

    # Severe drop: 0.80 m/s -> 0.60 m/s (25% drop >= 20%)
    res_sev = evaluate_velocity_loss_cutoff(initial_velocity=0.80, current_velocity=0.60, threshold_pct=10.0)
    assert res_sev["velocity_loss_pct"] == 25.0
    assert res_sev["should_terminate_set"] is True
    assert res_sev["fatigue_level"] == "SEVERE_CNS_DEPLETION"


def test_calisthenics_lever_torque():
    # 70kg athlete on 0.8m lever horizontally (cos(0) = 1.0)
    # tau = 70 * 9.81 * 0.8 = 549.36 Nm
    torque = calculate_calisthenics_torque(bodyweight_kg=70.0, lever_length_m=0.8, angle_deg=0.0)
    assert 549.0 <= torque <= 550.0

    # Zero bodyweight
    assert calculate_calisthenics_torque(0.0, 0.8) == 0.0


def test_evaluate_strength_session_full_lifecycle():
    session = StrengthSessionInput(
        session_id="session_sbd_001",
        sport_code="SPORT_POWERLIFTING",
        bodyweight_kg=75.0,
        known_1rm_map={"Back Squat": 160.0, "Bench Press": 110.0},
        sets=[
            StrengthSetInput(exercise_name="Back Squat", weight_kg=128.0, reps=5, rpe=8.0),
            StrengthSetInput(exercise_name="Back Squat", weight_kg=128.0, reps=5, rpe=8.5),
            StrengthSetInput(exercise_name="Back Squat", weight_kg=128.0, reps=5, rpe=9.0),
            StrengthSetInput(exercise_name="Bench Press", weight_kg=88.0, reps=5, rpe=7.5),
            StrengthSetInput(exercise_name="Bench Press", weight_kg=88.0, reps=5, rpe=8.0),
        ],
    )

    resp = evaluate_strength_session(session)

    # 3 sets of 128*5 (1920) + 2 sets of 88*5 (880) = 2800 kg
    assert resp.total_tonnage_kg == 2800.0
    assert resp.total_reps == 25
    assert resp.hard_sets_count == 5
    assert resp.total_session_inol > 0
    assert resp.cns_drain_score > 0
    assert resp.recommended_recovery_hours >= 36.0
    assert "Back Squat" in resp.exercise_inol_map
    assert "Bench Press" in resp.exercise_inol_map


def test_strength_api_endpoint():
    payload = {
        "session_id": "api_test_001",
        "sport_code": "SPORT_POWERLIFTING",
        "bodyweight_kg": 80.0,
        "known_1rm_map": {"Deadlift": 200.0},
        "sets": [
            {"exercise_name": "Deadlift", "weight_kg": 160.0, "reps": 4, "rpe": 8.0, "is_warmup": False},
            {"exercise_name": "Deadlift", "weight_kg": 160.0, "reps": 4, "rpe": 8.5, "is_warmup": False},
        ],
    }

    response = client.post("/calculate/coach/strength/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["total_tonnage_kg"] == 1280.0  # 160 * 4 * 2
    assert data["total_reps"] == 8
    assert data["hard_sets_count"] == 2
    assert "Deadlift" in data["exercise_inol_map"]
    assert data["total_session_inol"] > 0
    assert "Beban" in data["coach_verdict"] or "Stimulus" in data["coach_verdict"] or "Akumulasi" in data["coach_verdict"] or "Sesi" in data["coach_verdict"]


def test_rpe_calibrated_1rm_estimation():
    # 100 kg for 5 reps @ RPE 10 (RIR 0) -> 112.51 kg
    brz_10 = calculate_brzycki_1rm(100.0, 5, rpe=10.0)
    assert 112.0 <= brz_10 <= 113.0

    # 100 kg for 5 reps @ RPE 8.0 (RIR 2 -> effective 7 reps) -> 120.0 kg
    brz_8 = calculate_brzycki_1rm(100.0, 5, rpe=8.0)
    assert 119.5 <= brz_8 <= 120.5
    assert brz_8 > brz_10  # RPE 8 indicates higher reserve capacity


def test_calisthenics_progression_levers():
    # 70kg athlete on 0.8m lever
    full = calculate_calisthenics_torque(70.0, 0.8, progression="FULL")
    tuck = calculate_calisthenics_torque(70.0, 0.8, progression="TUCK")
    straddle = calculate_calisthenics_torque(70.0, 0.8, progression="STRADDLE")

    assert full == 549.36
    assert tuck == 274.68  # 50% lever
    assert straddle == 450.48  # 82% lever
    assert tuck < straddle < full


def test_empty_strength_session_safeguard():
    session = StrengthSessionInput(
        sport_code="SPORT_POWERLIFTING",
        sets=[],
        known_1rm_map={"Squat": 150.0},
    )
    res = evaluate_strength_session(session)
    assert res.total_tonnage_kg == 0.0
    assert res.cns_drain_score == 0.0
    assert res.fatigue_classification == "RECOVERY"
    assert "Tidak ada set beban kerja aktif" in res.coach_verdict


def test_heavy_singles_cns_drain_scaling():
    session = StrengthSessionInput(
        sport_code="SPORT_POWERLIFTING",
        known_1rm_map={"Deadlift": 200.0},
        sets=[
            StrengthSetInput(exercise_name="Deadlift", weight_kg=190.0, reps=1, rpe=9.5),  # 95% 1RM
            StrengthSetInput(exercise_name="Deadlift", weight_kg=190.0, reps=1, rpe=9.5),  # 95% 1RM
            StrengthSetInput(exercise_name="Deadlift", weight_kg=190.0, reps=1, rpe=10.0), # 95% 1RM
        ],
    )
    res = evaluate_strength_session(session)
    assert res.cns_drain_score > 0
    assert res.hard_sets_count == 3

