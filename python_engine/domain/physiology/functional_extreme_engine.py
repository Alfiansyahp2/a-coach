"""
Functional Fitness & Extreme Sports Physiology Engine (Phase 5).
Calculates Metcon Power Output, Finger Pulley Tension, Drop Shock GRF,
Surfing Paddle Ratio, Skateboard Asymmetry, and Gymnastics Wrist Compression.
"""

import math
from typing import Dict, Any, Optional
from python_engine.domain.physiology.extreme_models import (
    FunctionalExtremeSessionInput,
    FunctionalExtremeSessionResponse,
)

G_ACCEL = 9.80665


def calculate_metcon_power_output(
    work_joules: float, total_sec: float, transition_sec: float = 0.0
) -> Dict[str, Any]:
    """Computes mean power output during active work and transition penalty percentage."""
    tot_s = max(1.0, float(total_sec))
    trans_s = max(0.0, min(float(transition_sec), tot_s - 1.0))
    active_s = tot_s - trans_s

    power_w = round(max(0.0, float(work_joules)) / active_s, 2)
    trans_penalty = round((trans_s / tot_s) * 100.0, 2)
    return {
        "mean_power_watts": power_w,
        "active_seconds": active_s,
        "transition_penalty_pct": trans_penalty,
    }


def calculate_finger_pulley_tension(
    fingertip_force_n: float,
    crimp_lever_factor: float = 3.5,
    crimp_count: int = 0,
    athlete_weight_kg: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Computes A2/A4 flexor tendon pulley tension: F_pulley = F_fingertip * Lever_factor.
    Closed crimp multiplies fingertip reaction force by 3.0 - 4.0x.
    If sensor force is unlisted but crimps are performed, estimates force from body weight.
    """
    f_tip = max(0.0, float(fingertip_force_n))
    c_count = max(0, int(crimp_count))
    if f_tip == 0.0 and c_count > 0 and athlete_weight_kg is not None and athlete_weight_kg > 0:
        f_tip = round(athlete_weight_kg * G_ACCEL * 0.40, 2)

    lever = max(1.0, float(crimp_lever_factor))
    f_pulley = round(f_tip * lever, 2)

    if f_pulley >= 400.0 or (c_count >= 40 and f_pulley >= 300.0):
        risk = "HIGH"
        msg = f"Risiko ruptur/strain katrol A2/A4 TINGGI ({f_pulley}N pada {c_count} crimp). Wajib istirahat 48-72 jam."
    elif f_pulley >= 250.0 or c_count >= 25:
        risk = "MODERATE"
        msg = f"Beban katrol tendon jari moderat ({f_pulley}N). Batasi crimping agresif pada rute berikutnya."
    else:
        risk = "LOW"
        msg = f"Tegangan katrol jari dalam batas adaptasi aman ({f_pulley}N)."

    return {
        "pulley_peak_tension_n": f_pulley,
        "risk_level": risk,
        "interpretation": msg,
    }


def evaluate_landing_peak_grf(
    drop_height_m: float,
    athlete_weight_kg: float,
    mat_damping_factor: float = 0.55,
    decel_distance_m: float = 0.35,
) -> Dict[str, Any]:
    """
    Calculates Peak Ground Reaction Force (GRF) upon landing from bouldering or gymnastics:
    Work done by impact = m * g * h = F_net * d * (1 + damping).
    """
    h = max(0.0, float(drop_height_m))
    m = max(30.0, float(athlete_weight_kg))
    damping = max(0.1, float(mat_damping_factor))
    d = max(0.1, float(decel_distance_m))

    if h <= 0.0:
        return {"peak_grf_n": 0.0, "peak_grf_bw": 0.0, "high_impact_alert": False}

    potential_e = m * G_ACCEL * h
    f_decel = potential_e / (d * (1.0 + damping))
    total_peak_grf = round(f_decel + (m * G_ACCEL), 2)
    grf_bw = round(total_peak_grf / (m * G_ACCEL), 2)
    alert = grf_bw >= 8.0

    return {
        "peak_grf_n": total_peak_grf,
        "peak_grf_bw": grf_bw,
        "high_impact_alert": alert,
    }


def calculate_surf_paddle_ratio(
    paddle_min: float, wave_ride_min: float, wave_count: int = 0
) -> Dict[str, Any]:
    """Calculates ratio of paddling time to active wave riding time in Surfing."""
    p_min = max(0.0, float(paddle_min))
    w_min = max(0.05, float(wave_ride_min))
    ratio = round(p_min / w_min, 2)
    fatigue_alert = p_min > 90.0

    return {
        "paddle_to_wave_ratio": ratio,
        "paddling_strain_au": round(p_min * 1.2, 2),
        "thoracic_fatigue_alert": fatigue_alert,
        "interpretation": f"Rasio dayung:ombak {ratio}:1 ({p_min}m dayung vs {round(w_min, 1)}m ombak).",
    }


def evaluate_skateboard_asymmetry_load(
    push_kicks_count: int, drops_count: int = 0, stance: str = "REGULAR"
) -> Dict[str, Any]:
    """Evaluates unilateral asymmetry between stance leg (quad/knee) and push leg (hip extension)."""
    pushes = max(0, int(push_kicks_count))
    drops = max(0, int(drops_count))
    strain_idx = round((pushes * 0.15) + (drops * 1.8), 2)
    alert = pushes > 300 or drops > 25

    return {
        "asymmetry_strain_index": strain_idx,
        "asymmetry_overload_alert": alert,
        "stance": stance,
    }


def evaluate_gymnastics_wrist_compression(
    handstand_seconds: float,
    athlete_weight_kg: float,
    apparatus: Optional[str] = None,
) -> Dict[str, Any]:
    """Computes wrist axial compressive stress based on apparatus and inversion duration."""
    sec = max(0.0, float(handstand_seconds))
    m = max(30.0, float(athlete_weight_kg))

    apparatus_factors = {
        "FLOOR": 1.0,
        "POMMEL_HORSE": 1.4,
        "VAULT": 1.6,
        "RINGS": 0.7,
        "HIGH_BAR": 0.5,
    }
    factor = apparatus_factors.get((apparatus or "FLOOR").upper(), 1.0)
    load_au = round((sec / 60.0) * m * factor, 2)
    alert = sec > 300.0 or load_au > 500.0

    return {
        "wrist_axial_load_au": load_au,
        "wrist_overload_alert": alert,
    }


def evaluate_functional_extreme_session(
    session: FunctionalExtremeSessionInput,
) -> FunctionalExtremeSessionResponse:
    """Master evaluator for Functional Fitness & Extreme Sports (Phase 5)."""
    if session.duration_minutes <= 0.0:
        return FunctionalExtremeSessionResponse(
            total_duration_minutes=0.0,
            sport_code=session.sport_code,
            metcon_mean_power_watts=0.0,
            transition_penalty_pct=0.0,
            finger_pulley_peak_tension_n=0.0,
            pulley_rupture_risk_level="LOW",
            peak_ground_reaction_force_bw=0.0,
            paddle_to_wave_ratio=0.0,
            asymmetry_strain_index=0.0,
            wrist_axial_compressive_load_au=0.0,
            recommended_recovery_hours=0.0,
            coach_verdict="Tidak ada aktivitas fungsional/ekstrem aktif tercatat. Beban fisik nihil.",
        )

    # 1. Metcon Power Output
    est_work = session.total_work_joules
    if est_work <= 0.0 and session.sport_code == "SPORT_FUNCTIONAL_FITNESS":
        # Standard estimation from duration, RPE and weight (~15 kcal/min scaled)
        est_work = session.duration_minutes * 15.0 * 4184.0 * (session.rpe / 10.0)

    metcon_res = calculate_metcon_power_output(est_work, session.duration_minutes * 60.0, session.transition_seconds)

    # 2. Climbing Tendon Pulley Tension & Bouldering GRF
    crimp_res = calculate_finger_pulley_tension(
        session.fingertip_peak_force_n,
        session.crimp_lever_factor,
        session.crimp_grip_count,
        athlete_weight_kg=session.athlete_weight_kg,
    )
    bouldering_grf = evaluate_landing_peak_grf(session.avg_drop_height_m, session.athlete_weight_kg)

    # 3. Surfing Paddle Ratio
    surf_res = calculate_surf_paddle_ratio(session.paddle_minutes, session.wave_ride_minutes, session.wave_count)

    # 4. Skateboard Asymmetry
    skate_res = evaluate_skateboard_asymmetry_load(
        session.push_kicks_count, session.stair_gap_drops_count, session.stance_dominant_leg
    )

    # 5. Gymnastics Wrist Compression
    gym_res = evaluate_gymnastics_wrist_compression(
        session.handstand_seconds, session.athlete_weight_kg, session.apparatus
    )

    # 6. Recovery Hours Prescription
    rec_h = 24.0
    if crimp_res["risk_level"] == "HIGH":
        rec_h = max(rec_h, 72.0)
    elif crimp_res["risk_level"] == "MODERATE":
        rec_h = max(rec_h, 48.0)

    if bouldering_grf["high_impact_alert"] or gym_res["wrist_overload_alert"]:
        rec_h = max(rec_h, 48.0)

    if surf_res["thoracic_fatigue_alert"] or skate_res["asymmetry_overload_alert"]:
        rec_h = max(rec_h, 36.0)

    # 7. Coach Verdict
    verdict = f"Evaluasi Fungsional & Ekstrem ({session.sport_code}): Durasi {session.duration_minutes}m (RPE {session.rpe}). "
    if session.sport_code == "SPORT_FUNCTIONAL_FITNESS":
        verdict += f"Daya Rata-Rata: {metcon_res['mean_power_watts']}W (Penalti Transisi: {metcon_res['transition_penalty_pct']}%). "
    elif session.sport_code == "SPORT_CLIMBING":
        verdict += f"Tegangan Katrol Jari: {crimp_res['pulley_peak_tension_n']}N ({crimp_res['risk_level']}). "
        if bouldering_grf["peak_grf_bw"] > 0:
            verdict += f"Gaya Impak Pendaratan: {bouldering_grf['peak_grf_bw']} BW. "
    elif session.sport_code == "SPORT_SURFING":
        verdict += f"{surf_res['interpretation']} "
    elif session.sport_code == "SPORT_SKATEBOARDING":
        verdict += f"Indeks Regangan Asimetris: {skate_res['asymmetry_strain_index']} AU (Kaki Dominan: {session.stance_dominant_leg}). "
    elif session.sport_code == "SPORT_GYMNASTICS":
        verdict += f"Beban Aksial Pergelangan Tangan: {gym_res['wrist_axial_load_au']} AU ({session.apparatus or 'Lantai'}). "

    verdict += f"Preskripsi jendela pemulihan: {int(rec_h)} jam."

    return FunctionalExtremeSessionResponse(
        total_duration_minutes=session.duration_minutes,
        sport_code=session.sport_code,
        metcon_mean_power_watts=metcon_res["mean_power_watts"],
        transition_penalty_pct=metcon_res["transition_penalty_pct"],
        finger_pulley_peak_tension_n=crimp_res["pulley_peak_tension_n"],
        pulley_rupture_risk_level=crimp_res["risk_level"],
        peak_ground_reaction_force_bw=bouldering_grf["peak_grf_bw"],
        paddle_to_wave_ratio=surf_res["paddle_to_wave_ratio"],
        asymmetry_strain_index=skate_res["asymmetry_strain_index"],
        wrist_axial_compressive_load_au=gym_res["wrist_axial_load_au"],
        recommended_recovery_hours=rec_h,
        coach_verdict=verdict,
    )
