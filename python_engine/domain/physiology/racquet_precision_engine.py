"""
Racquet & Precision Sports Physiology Engine (Phase 4).
Calculates Archery draw volume, Hold tremor amplitude index, Cardio-somatic
diastolic synchronization, Shoulder internal rotation load, Badminton smash
kinetics, and Table Tennis step-work density.
"""

from typing import List, Dict, Any, Optional
from python_engine.domain.physiology.racquet_models import (
    RacquetPrecisionSessionInput,
    RacquetPrecisionSessionResponse,
)

LBS_TO_KG = 0.45359237


def calculate_archery_draw_volume(draw_weight_lbs: float, arrow_count: int) -> Dict[str, Any]:
    """Computes total cumulative draw weight volume in lbs and kg."""
    vol_lbs = round(max(0.0, float(draw_weight_lbs)) * max(0, int(arrow_count)), 2)
    vol_kg = round(vol_lbs * LBS_TO_KG, 2)
    overload = vol_lbs > 4500.0
    return {
        "volume_lbs": vol_lbs,
        "volume_kg": vol_kg,
        "overload_alert": overload,
        "interpretation": "Beban tarikan skapula & rotator cuff melebihi batas 4500 lbs!" if overload else "Beban volume tarikan busur optimal.",
    }


def evaluate_hold_tremor_index(tremor_amplitudes_mm: List[float]) -> Dict[str, Any]:
    """Evaluates bow/hand tremor during anchor hold before clicker release."""
    if not tremor_amplitudes_mm:
        return {"mean_tremor_mm": 0.0, "max_tremor_mm": 0.0, "fatigue_level": "STABLE", "interpretation": "Data getaran tremor stabil."}

    valid = [max(0.0, float(t)) for t in tremor_amplitudes_mm]
    mean_t = round(sum(valid) / len(valid), 2)
    max_t = round(max(valid), 2)

    if mean_t >= 3.0 or max_t >= 5.0:
        lvl, msg = "CRITICAL", f"Tremor tangan kritis ({mean_t}mm). Kelelahan unit motorik deltoid & rotator cuff parah."
    elif mean_t >= 2.0:
        lvl, msg = "ELEVATED", f"Tremor tangan meningkat ({mean_t}mm). Penstabil skapula mulai mengalami kelelahan neuromuskular."
    else:
        lvl, msg = "STABLE", f"Stabilitas mikromotorik optimal ({mean_t}mm tremor rata-rata)."

    return {"mean_tremor_mm": mean_t, "max_tremor_mm": max_t, "fatigue_level": lvl, "interpretation": msg}


def calculate_diastolic_sync_rate(shots_diastole: int, total_shots: int) -> Dict[str, Any]:
    """
    Computes percentage of trigger releases occurring in late cardiac diastole:
    Sync Rate = (shots_in_diastole / total_shots) * 100%
    """
    if total_shots <= 0:
        return {"sync_rate_pct": 0.0, "classification": "UNKNOWN", "interpretation": "Tidak ada tembakan terdaftar."}

    synced = min(max(0, shots_diastole), total_shots)
    rate = round((synced / total_shots) * 100.0, 2)

    if rate >= 85.0:
        cls, msg = "ELITE", f"Sinkronisasi kardiomotorik diastolik kelas dunia ({rate}%)."
    elif rate >= 70.0:
        cls, msg = "PROFICIENT", f"Sinkronisasi kardiomotorik memadai ({rate}%). Ritme simpatis stabil."
    else:
        cls, msg = "DEGRADED", f"Sinkronisasi diastolik terdegradasi ({rate}% < 70%). Arousal simpatis atau takikardia mengganggu presisi."

    return {"sync_rate_pct": rate, "classification": cls, "interpretation": msg}


def calculate_shoulder_kinetic_load(
    serve_speeds_kmh: List[float], kick_serve_count: int = 0
) -> Dict[str, Any]:
    """
    Calculates internal rotation load from serves:
    Load = sum(Speed_kmh * Kinetic Factor). Factor = 1.0 (flat), 1.15 (kick).
    """
    if not serve_speeds_kmh:
        return {"total_serves": 0, "shoulder_load_au": 0.0, "rotator_cuff_overload_alert": False}

    kicks_remaining = max(0, kick_serve_count)
    total_load = 0.0
    for s in serve_speeds_kmh:
        speed = max(0.0, float(s))
        factor = 1.15 if kicks_remaining > 0 else 1.0
        if kicks_remaining > 0:
            kicks_remaining -= 1
        total_load += speed * factor

    tot_serves = len(serve_speeds_kmh)
    rounded_load = round(total_load, 2)
    overload = tot_serves > 100 or rounded_load > 16000.0
    return {
        "total_serves": tot_serves,
        "shoulder_load_au": rounded_load,
        "rotator_cuff_overload_alert": overload,
    }


def calculate_badminton_smash_energy(
    smash_count: int, avg_head_speed_kmh: float = 300.0, unilateral_landing_count: int = 0
) -> Dict[str, Any]:
    """Calculates angular smash kinetic load and unilateral lunge knee shock."""
    head_speed = max(100.0, float(avg_head_speed_kmh))
    smash_c = max(0, int(smash_count))
    lunge_c = max(0, int(unilateral_landing_count))

    kinetic_head_load = smash_c * ((head_speed / 100.0) ** 2) * 5.0
    lunge_shock_au = lunge_c * 2.5
    total_kinetic_load = round(kinetic_head_load + lunge_shock_au, 2)

    patellar_shoulder_warning = smash_c > 60 or lunge_c > 80
    return {
        "smash_count": smash_c,
        "lunge_count": lunge_c,
        "kinetic_load_au": total_kinetic_load,
        "patellar_shoulder_warning": patellar_shoulder_warning,
    }


def evaluate_table_tennis_density(
    micro_steps: int, duration_minutes: float, forehand_loops: int = 0
) -> Dict[str, Any]:
    """Computes micro-step density per minute and forehand loop rotational impulse."""
    dur = max(1.0, float(duration_minutes))
    steps = max(0, int(micro_steps))
    loops = max(0, int(forehand_loops))

    step_density = round(steps / dur, 2)
    loop_impulse = round(loops * 1.25, 2)
    high_intensity = step_density > 50.0 or loops > 120

    return {
        "step_density_per_min": step_density,
        "loop_rotational_impulse_au": loop_impulse,
        "high_intensity_alert": high_intensity,
    }


def evaluate_postural_sway_degradation(
    early_sway_mm: Optional[float], late_sway_mm: Optional[float]
) -> Optional[float]:
    """Calculates center-of-pressure postural sway degradation percentage."""
    if early_sway_mm is None or late_sway_mm is None or early_sway_mm <= 0.0:
        return None
    return round(((late_sway_mm - early_sway_mm) / early_sway_mm) * 100.0, 2)


def evaluate_racquet_precision_session(
    session: RacquetPrecisionSessionInput,
) -> RacquetPrecisionSessionResponse:
    """Master evaluator for Racquet & Precision Sports (Phase 4)."""
    # 1. Archery Draw Volume
    archery_res = calculate_archery_draw_volume(session.draw_weight_lbs, session.arrow_count)

    # 2. Hold Tremor Amplitude
    tremor_res = evaluate_hold_tremor_index(session.tremor_amplitudes_mm)

    # 3. Cardio Diastolic Synchronization
    diastolic_res = calculate_diastolic_sync_rate(session.diastolic_shots_count, session.total_shots)

    # 4. Shoulder & Smash Kinetics
    shoulder_res = calculate_shoulder_kinetic_load(session.serve_speeds_kmh, session.kick_serve_count)
    badminton_res = calculate_badminton_smash_energy(session.smash_count, 300.0, session.unilateral_lunges_count)

    # 5. Table Tennis Footwork & Postural Sway
    tt_res = evaluate_table_tennis_density(session.micro_steps_count, session.duration_minutes, session.forehand_loops_count)
    sway_deg = evaluate_postural_sway_degradation(session.early_sway_radius_mm, session.late_sway_radius_mm)

    # 6. Combined Shoulder Rotator Load
    combined_shoulder_load = round(shoulder_res["shoulder_load_au"] + badminton_res["kinetic_load_au"], 2)

    # 7. Recovery Hours Prescription
    rec_hours = 24.0
    if tremor_res["fatigue_level"] == "CRITICAL" or archery_res["overload_alert"]:
        rec_hours = max(rec_hours, 48.0)
    elif tremor_res["fatigue_level"] == "ELEVATED" or shoulder_res["rotator_cuff_overload_alert"]:
        rec_hours = max(rec_hours, 36.0)
    elif badminton_res["patellar_shoulder_warning"]:
        rec_hours = max(rec_hours, 36.0)

    # 8. Coach Verdict
    verdict = f"Evaluasi Presisi & Raket ({session.sport_code}): Durasi {session.duration_minutes}m (RPE {session.rpe}). "
    if session.sport_code == "SPORT_ARCHERY":
        verdict += f"Volume Tarikan: {archery_res['volume_lbs']} lbs ({archery_res['volume_kg']} kg). Tremor: {tremor_res['mean_tremor_mm']}mm ({tremor_res['fatigue_level']}). "
    elif session.sport_code == "SPORT_SHOOTING":
        verdict += f"Sinkronisasi Diastolik: {diastolic_res['sync_rate_pct']}% ({diastolic_res['classification']}). "
        if sway_deg is not None:
            verdict += f"Degradasi Postural Sway: {sway_deg}%. "
    elif session.sport_code == "SPORT_BADMINTON":
        verdict += f"Beban Smash & Lunge Kinetik: {badminton_res['kinetic_load_au']} AU ({session.smash_count} smash, {session.unilateral_lunges_count} lunge). "
    elif session.sport_code == "SPORT_TENNIS":
        verdict += f"Beban Rotasi Bahu Servis: {shoulder_res['shoulder_load_au']} AU ({shoulder_res['total_serves']} servis). "
    elif session.sport_code == "SPORT_TABLE_TENNIS":
        verdict += f"Densitas Langkah Kaki: {tt_res['step_density_per_min']} langkah/min ({session.forehand_loops_count} loops). "

    verdict += f"Preskripsi jendela pemulihan neuromuskular: {int(rec_hours)} jam."

    return RacquetPrecisionSessionResponse(
        total_duration_minutes=session.duration_minutes,
        sport_code=session.sport_code,
        shoulder_rotator_load_au=combined_shoulder_load,
        cumulative_draw_volume_lbs=archery_res["volume_lbs"],
        cumulative_draw_volume_kg=archery_res["volume_kg"],
        hold_tremor_index_mm=tremor_res["mean_tremor_mm"],
        tremor_fatigue_level=tremor_res["fatigue_level"],
        cardio_diastolic_sync_rate_pct=diastolic_res["sync_rate_pct"],
        sync_classification=diastolic_res["classification"],
        postural_sway_degradation_pct=sway_deg,
        step_density_per_min=tt_res["step_density_per_min"],
        recommended_recovery_hours=rec_hours,
        coach_verdict=verdict,
    )
