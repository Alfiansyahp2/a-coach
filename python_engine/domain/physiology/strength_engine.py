import math
from typing import List, Dict, Any, Optional, Tuple
from .models import (
    StrengthSetInput,
    StrengthSessionInput,
    StrengthSessionResponse,
)

CALISTHENICS_LEVER_PROGRESSIONS: Dict[str, float] = {
    "TUCK": 0.50,          # Knee to chest (shortened lever)
    "ADVANCED_TUCK": 0.65, # Hips at 90 degrees
    "STRADDLE": 0.82,      # Legs spread wide
    "FULL": 1.00,          # Full straight body (maximum torque)
}


def calculate_brzycki_1rm(
    weight: float, reps: int, rpe: Optional[float] = None
) -> float:
    """
    Computes estimated 1RM using Matt Brzycki formula (1993) with RTS RPE/RIR calibration.
    Formula: 1RM = weight / (1.0278 - (0.0278 * effective_reps))
    effective_reps = reps + max(0.0, 10.0 - rpe)
    """
    if reps <= 0 or weight <= 0:
        return 0.0

    effective_reps = float(reps)
    if rpe is not None and 1.0 <= rpe <= 10.0:
        effective_reps += max(0.0, 10.0 - rpe)

    if effective_reps <= 1.0:
        return round(weight, 2)

    clamped_reps = min(20.0, effective_reps)
    denom = 1.0278 - (0.0278 * clamped_reps)
    if denom <= 0.1:
        denom = 0.1
    one_rm = weight / denom
    return round(one_rm, 2)


def calculate_epley_1rm(
    weight: float, reps: int, rpe: Optional[float] = None
) -> float:
    """
    Computes estimated 1RM using Epley formula (1985) with RPE/RIR adjustment.
    Formula: 1RM = weight * (1 + effective_reps / 30.0)
    """
    if reps <= 0 or weight <= 0:
        return 0.0

    effective_reps = float(reps)
    if rpe is not None and 1.0 <= rpe <= 10.0:
        effective_reps += max(0.0, 10.0 - rpe)

    if effective_reps <= 1.0:
        return round(weight, 2)

    one_rm = weight * (1.0 + (effective_reps / 30.0))
    return round(one_rm, 2)


def calculate_volume_tonnage(
    sets: List[StrengthSetInput],
    include_warmup: bool = False,
) -> float:
    """Computes cumulative volume tonnage (kg) = sum(weight_kg * reps)."""
    total = 0.0
    for s in sets:
        if not include_warmup and s.is_warmup:
            continue
        total += s.weight_kg * s.reps
    return round(total, 2)


def calculate_sheiko_inol(reps: int, pct_1rm: float) -> float:
    """
    Computes Boris Sheiko Intensity of Number of Lifts (INOL).
    Formula: INOL = Reps / (100 - %1RM)
    """
    if reps <= 0 or pct_1rm <= 0.0:
        return 0.0

    clamped_pct = min(99.0, pct_1rm)
    inol = reps / (100.0 - clamped_pct)
    return round(inol, 3)


def calculate_session_inol(
    sets: List[StrengthSetInput],
    known_1rm_map: Dict[str, float],
) -> Tuple[Dict[str, float], float, Dict[str, float]]:
    """
    Computes INOL breakdown per exercise and total session INOL.
    Preserves known 1RMs and applies RPE calibration for missing estimates.
    """
    exercise_inol: Dict[str, float] = {}
    estimated_1rm_map: Dict[str, float] = dict(known_1rm_map)

    # First pass: preserve known 1RMs, estimate for missing ones (or if lifted weight > known 1RM)
    for s in sets:
        if s.is_warmup or s.weight_kg <= 0 or s.reps <= 0:
            continue
        known = estimated_1rm_map.get(s.exercise_name, 0.0)
        if known <= 0.0:
            calc_1rm = calculate_brzycki_1rm(s.weight_kg, s.reps, rpe=s.rpe)
            curr = estimated_1rm_map.get(s.exercise_name, 0.0)
            if calc_1rm > curr:
                estimated_1rm_map[s.exercise_name] = calc_1rm
        elif s.weight_kg > known:
            estimated_1rm_map[s.exercise_name] = s.weight_kg

    # Second pass: compute INOL
    total_inol = 0.0
    for s in sets:
        if s.is_warmup or s.weight_kg <= 0 or s.reps <= 0:
            continue
        one_rm = estimated_1rm_map.get(s.exercise_name, 0.0)
        if one_rm <= 0.0:
            continue

        pct = (s.weight_kg / one_rm) * 100.0
        set_inol = calculate_sheiko_inol(s.reps, pct)
        exercise_inol[s.exercise_name] = round(
            exercise_inol.get(s.exercise_name, 0.0) + set_inol, 3
        )
        total_inol += set_inol

    return exercise_inol, round(total_inol, 3), estimated_1rm_map


def evaluate_velocity_loss_cutoff(
    initial_velocity: float,
    current_velocity: float,
    threshold_pct: float = 10.0,
) -> Dict[str, Any]:
    """Evaluates concentric bar velocity loss for Velocity-Based Training (VBT)."""
    if initial_velocity <= 0.0 or current_velocity <= 0.0:
        return {
            "velocity_loss_pct": 0.0,
            "should_terminate_set": False,
            "fatigue_level": "UNKNOWN",
        }

    loss_pct = ((initial_velocity - current_velocity) / initial_velocity) * 100.0
    loss_pct = max(0.0, round(loss_pct, 2))
    should_terminate = loss_pct >= threshold_pct

    fatigue_level = "MINIMAL"
    if loss_pct >= 20.0:
        fatigue_level = "SEVERE_CNS_DEPLETION"
    elif loss_pct >= 10.0:
        fatigue_level = "MODERATE_POWER_DECAY"

    return {
        "velocity_loss_pct": loss_pct,
        "should_terminate_set": should_terminate,
        "fatigue_level": fatigue_level,
    }


def calculate_calisthenics_torque(
    bodyweight_kg: float,
    lever_length_m: float,
    angle_deg: float = 0.0,
    progression: Optional[str] = None,
) -> float:
    """
    Computes joint torque for calisthenics static holds (Planche, Front Lever)
    with leverage progression scaling: Tuck (0.50), Adv Tuck (0.65), Straddle (0.82), Full (1.00).
    Formula: tau = m * g * L_effective * cos(angle)
    """
    if bodyweight_kg <= 0 or lever_length_m <= 0:
        return 0.0

    mult = 1.0
    if progression:
        mult = CALISTHENICS_LEVER_PROGRESSIONS.get(progression.upper(), 1.0)

    effective_lever = lever_length_m * mult
    angle_rad = math.radians(angle_deg)
    torque = bodyweight_kg * 9.81 * effective_lever * math.cos(angle_rad)
    return round(torque, 2)


def evaluate_strength_session(session: StrengthSessionInput) -> StrengthSessionResponse:
    """
    Full Phase 1 Physiological Strength & Power Session Evaluator.
    Handles empty sessions safely and scales CNS fatigue with Sheiko heavy lifts.
    """
    # Safe guard for empty session
    active_sets = [s for s in session.sets if not s.is_warmup and s.reps > 0 and s.weight_kg > 0]
    if not active_sets:
        return StrengthSessionResponse(
            total_tonnage_kg=0.0,
            total_reps=0,
            hard_sets_count=0,
            exercise_inol_map={},
            total_session_inol=0.0,
            estimated_1rm_map=dict(session.known_1rm_map),
            fatigue_classification="RECOVERY",
            cns_drain_score=0.0,
            recommended_recovery_hours=24.0,
            coach_verdict="Tidak ada set beban kerja aktif yang tercatat. Sistem saraf pusat berada pada kesiapan penuh.",
        )

    tonnage = calculate_volume_tonnage(session.sets, include_warmup=False)
    total_reps = sum(s.reps for s in active_sets)
    hard_sets = [s for s in active_sets if s.rpe is None or s.rpe >= 7.0]

    exercise_inol, total_inol, est_1rm = calculate_session_inol(
        session.sets,
        session.known_1rm_map,
    )

    # CNS Drain Score (0 to 10 scale)
    avg_rpe = 7.5
    valid_rpes = [s.rpe for s in active_sets if s.rpe is not None]
    if valid_rpes:
        avg_rpe = sum(valid_rpes) / len(valid_rpes)

    # Heavy lifts >= 90% impose exponential CNS strain
    heavy_count = sum(
        1 for s in active_sets
        if est_1rm.get(s.exercise_name, 0.0) > 0 and (s.weight_kg / est_1rm[s.exercise_name]) >= 0.90
    )
    cns_drain = min(10.0, round((total_inol * 2.2) + (avg_rpe * 0.35) + (heavy_count * 0.25), 1))

    # Fatigue Classification
    if total_inol > 3.0 or cns_drain >= 8.5:
        fatigue_class = "CRITICAL_OVERREACHING"
        rec_recovery_hrs = 72.0
        verdict = (
            f"Beban neuromuskular ekstrem (INOL {total_inol:.2f}, CNS Drain {cns_drain}/10). "
            f"Wajib istirahat 72 jam sebelum melatih kelompok otot yang sama untuk mencegah avulsi tendon."
        )
    elif total_inol >= 2.0 or cns_drain >= 6.5:
        fatigue_class = "HIGH_FATIGUE"
        rec_recovery_hrs = 48.0
        verdict = (
            f"Akumulasi kelelahan tinggi (INOL {total_inol:.2f}, Tonase {tonnage:,.0f} kg). "
            f"Berikan jeda minimal 48 jam dan prioritaskan asupan protein (1.6-2.2 g/kg)."
        )
    elif total_inol >= 1.0:
        fatigue_class = "OPTIMAL_ACCUMULATION"
        rec_recovery_hrs = 36.0
        verdict = (
            f"Stimulus adaptasi hipertrofi dan kekuatan optimal (INOL {total_inol:.2f}, {len(hard_sets)} set keras). "
            f"Pemulihan normal 36-48 jam."
        )
    else:
        fatigue_class = "RECOVERY"
        rec_recovery_hrs = 24.0
        verdict = (
            f"Sesi beban ringan / aktif (INOL {total_inol:.2f}). "
            f"Sistem saraf pusat segar dan siap untuk sesi intensif berikutnya."
        )

    return StrengthSessionResponse(
        total_tonnage_kg=tonnage,
        total_reps=total_reps,
        hard_sets_count=len(hard_sets),
        exercise_inol_map=exercise_inol,
        total_session_inol=total_inol,
        estimated_1rm_map=est_1rm,
        fatigue_classification=fatigue_class,
        cns_drain_score=cns_drain,
        recommended_recovery_hours=rec_recovery_hrs,
        coach_verdict=verdict,
    )
