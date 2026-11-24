"""
Team, Field & Court Sports Physiology Engine (Phase 3).
Calculates Catapult Tri-Axial PlayerLoad, Bradley HSR zones, Hamstring risk,
Jump shock loads, CMJ decay, Futsal decel shock, Rugby collisions, and Hockey strain.
"""

import math
from typing import List, Dict, Any, Optional, Tuple
from python_engine.domain.physiology.models import TeamSessionInput, TeamSessionResponse


def calculate_catapult_player_load(
    accel_series: List[List[float]],
    sampling_rate_hz: float = 100.0,
) -> float:
    """
    Computes Catapult Tri-Axial PlayerLoad (AU).
    If wearable accelerometer samples at a lower rate (e.g. 10 Hz GPS),
    sampling rate scaling preserves comparable cumulative impulse.
    """
    if not accel_series or len(accel_series) < 2:
        return 0.0

    rate_factor = math.sqrt(100.0 / max(1.0, sampling_rate_hz)) if sampling_rate_hz != 100.0 else 1.0

    total_load = 0.0
    for t in range(1, len(accel_series)):
        prev, curr = accel_series[t - 1], accel_series[t]
        dx, dy, dz = curr[0] - prev[0], curr[1] - prev[1], curr[2] - prev[2]
        total_load += math.sqrt((dy**2 + dx**2 + dz**2) / 100.0) * rate_factor

    return round(total_load, 2)


def partition_bradley_hsr(
    speed_samples_mps: List[float], sample_interval_s: float = 1.0
) -> Dict[str, Any]:
    """Partitions speed samples into Low, Moderate, HSR (19.8-25.1 km/h), Sprint (>=25.2 km/h)."""
    if not speed_samples_mps:
        return {
            "total_distance_m": 0.0, "low_intensity_distance_m": 0.0, "moderate_distance_m": 0.0,
            "hsr_distance_m": 0.0, "sprint_distance_m": 0.0, "sprint_bouts_count": 0, "max_speed_kmh": 0.0,
        }

    total_d = low_d = mod_d = hsr_d = sprint_d = max_v = 0.0
    sprint_bouts, in_sprint = 0, False

    for v in speed_samples_mps:
        vc = max(0.0, float(v))
        if vc > max_v:
            max_v = vc
        d = vc * sample_interval_s
        total_d += d

        if vc < 4.0:
            low_d += d
            in_sprint = False
        elif vc < 5.5:
            mod_d += d
            in_sprint = False
        elif vc < 7.0:
            hsr_d += d
            in_sprint = False
        else:
            sprint_d += d
            if not in_sprint:
                sprint_bouts += 1
                in_sprint = True

    return {
        "total_distance_m": round(total_d, 2),
        "low_intensity_distance_m": round(low_d, 2),
        "moderate_distance_m": round(mod_d, 2),
        "hsr_distance_m": round(hsr_d, 2),
        "sprint_distance_m": round(sprint_d, 2),
        "sprint_bouts_count": sprint_bouts,
        "max_speed_kmh": round(max_v * 3.6, 2),
    }


def evaluate_hamstring_strain_risk(
    sprint_distance_m: float, chronic_avg_sprint_m: Optional[float] = None
) -> Tuple[str, str]:
    """Evaluates eccentric hamstring injury risk based on sprint surge > 15% vs baseline."""
    if chronic_avg_sprint_m is not None and chronic_avg_sprint_m > 0:
        surge = ((sprint_distance_m - chronic_avg_sprint_m) / chronic_avg_sprint_m) * 100.0
        if surge > 15.0:
            return (
                "HIGH",
                f"Alarm risiko strain biseps femoris: Lonjakan sprint eksentrik melebihi batas 15% (+{round(surge, 1)}% vs baseline {chronic_avg_sprint_m}m).",
            )
        if sprint_distance_m > 400.0:
            return ("MODERATE", "Volume sprint tinggi, pastikan pendinginan rantai posterior memadai.")
        return ("LOW", "Volume sprint dalam rentang adaptif toleransi hamstring.")

    if sprint_distance_m > 300.0:
        return ("HIGH", "Paparan sprint akut tinggi (>300m) tanpa fondasi kronis 4 pekan. Risiko cedera eksentrik tinggi.")
    if sprint_distance_m > 150.0:
        return ("MODERATE", "Volume sprint moderat.")
    return ("LOW", "Volume sprint rendah dan aman.")


def evaluate_jump_shock_load(
    athlete_weight_kg: float,
    jump_heights_m: Optional[List[float]] = None,
    single_leg_count: int = 0,
    default_jump_count: int = 0,
) -> Dict[str, Any]:
    """Computes landing shock energy (kJ) and flags patellar warning if total jumps > 60 or > 1500 kJ."""
    g = 9.80665
    heights = jump_heights_m or []
    total_jumps = len(heights) if heights else max(0, default_jump_count)

    if total_jumps == 0:
        return {"total_jumps": 0, "jump_shock_load_kj": 0.0, "patellar_warning": False, "plyometric_lock_hours": 0.0}

    total_joules = 0.0
    if heights:
        single_remaining = max(0, single_leg_count)
        for h in heights:
            factor = 1.8 if single_remaining > 0 else 1.0
            if single_remaining > 0:
                single_remaining -= 1
            total_joules += athlete_weight_kg * g * max(0.05, float(h)) * factor
    else:
        unilateral = min(total_jumps, max(0, single_leg_count))
        bilateral = total_jumps - unilateral
        total_joules += bilateral * (athlete_weight_kg * g * 0.40 * 1.0)
        total_joules += unilateral * (athlete_weight_kg * g * 0.40 * 1.8)

    patellar_warn = total_jumps > 60 or (total_joules >= 200000.0)
    return {
        "total_jumps": total_jumps,
        "jump_shock_load_kj": round(total_joules / 1000.0, 2),
        "patellar_warning": patellar_warn,
        "plyometric_lock_hours": 48.0 if patellar_warn else 0.0,
    }


def evaluate_cmj_decay(pre_match_cmj_m: float, post_match_cmj_m: float) -> Dict[str, Any]:
    """Evaluates Countermovement Jump decay: decay > 8% indicates peripheral fatigue."""
    if pre_match_cmj_m <= 0.0:
        return {"decay_percentage": 0.0, "neuromuscular_fatigue": "FRESH", "interpretation": "Data CMJ tidak valid."}

    decay = round(((post_match_cmj_m - pre_match_cmj_m) / pre_match_cmj_m) * 100.0, 2)
    if decay <= -15.0:
        fatigue, msg = "CRITICAL", f"Kelelahan neuromuskular berat (penurunan CMJ {decay}%)."
    elif decay <= -8.0:
        fatigue, msg = "ELEVATED", f"Kelelahan neuromuskular perifer signifikan (penurunan CMJ {decay}% > 8%)."
    elif decay < 0.0:
        fatigue, msg = "MILD", f"Kelelahan ringan khas pasca-tanding (penurunan CMJ {decay}%)."
    else:
        fatigue, msg = "FRESH", f"Kapasitas neuromuskular optimal (perubahan CMJ +{decay}%)."

    return {"decay_percentage": decay, "neuromuscular_fatigue": fatigue, "interpretation": msg}


def evaluate_futsal_micro_decelerations(decel_count: int, duration_minutes: float) -> Dict[str, Any]:
    """Computes rapid deceleration rate (< -3.0 m/s^2) on hard court and quad shock (1.5x grass)."""
    rate = decel_count / (max(1.0, duration_minutes) / 10.0)
    return {
        "decel_rate_per_10min": round(rate, 2),
        "quad_eccentric_shock_au": round(decel_count * 1.5, 2),
        "high_quad_doms_alert": rate > 12.0 or decel_count > 60,
    }


def evaluate_rugby_collisions(high_g: int, severe_g: int, rhie: int) -> Dict[str, Any]:
    """Score = (high_g * 1.0) + (severe_g * 2.5) + (rhie * 1.8)."""
    score = (high_g * 1.0) + (severe_g * 2.5) + (rhie * 1.8)
    if severe_g >= 10 or score >= 40.0:
        risk, recovery_h = "HIGH", 72.0
    elif score >= 20.0:
        risk, recovery_h = "MODERATE", 48.0
    else:
        risk, recovery_h = "LOW", 24.0
    return {"collision_impact_score": round(score, 2), "collision_risk_level": risk, "recovery_hours": recovery_h}


def evaluate_hockey_lumbar_strain(flexion_min: float, duration_min: float) -> Dict[str, Any]:
    """Evaluates trunk flexion (< 45 deg) strain in Field Hockey."""
    clamped_dur = max(1.0, duration_min)
    ratio = round(flexion_min / clamped_dur, 2)
    return {
        "lumbar_strain_index": round(flexion_min * 1.2, 2),
        "flexion_ratio": ratio,
        "erector_spinae_fatigue_alert": flexion_min > 30.0 or ratio > 0.40,
    }


def evaluate_team_session(session: TeamSessionInput) -> TeamSessionResponse:
    """Master evaluator for Team, Field & Court Sports (Phase 3)."""
    if session.duration_minutes <= 0.0:
        return TeamSessionResponse(
            total_player_load=0.0,
            player_load_per_minute=0.0,
            total_distance_meters=0.0,
            hsr_distance_meters=0.0,
            sprint_distance_meters=0.0,
            hamstring_strain_risk="LOW",
            jump_shock_load_kj=0.0,
            patellar_overload_warning=False,
            cmj_decay_percentage=None,
            neuromuscular_fatigue_level="FRESH",
            collision_impact_score=0.0,
            quad_eccentric_shock_au=0.0,
            lumbar_strain_index=0.0,
            recommended_recovery_hours=0.0,
            coach_verdict="Tidak ada aktivitas beregu aktif tercatat. Beban fisik nihil.",
        )

    # 1. PlayerLoad
    if session.triaxial_accel_series and len(session.triaxial_accel_series) >= 2:
        total_pl = calculate_catapult_player_load(session.triaxial_accel_series)
    else:
        mult = 1.0 + (session.rpe / 10.0) * 0.5
        total_pl = round(session.duration_minutes * 7.5 * mult, 2)
    pl_per_min = round(total_pl / max(1.0, session.duration_minutes), 2)

    # 2. Bradley HSR & Hamstring Risk
    bradley = partition_bradley_hsr(session.speed_samples_mps, session.sample_interval_s)
    total_dist, hsr_dist, sprint_dist = bradley["total_distance_m"], bradley["hsr_distance_m"], bradley["sprint_distance_m"]
    hamstring_risk, _ = evaluate_hamstring_strain_risk(sprint_dist, session.chronic_sprint_distance_m)

    # 3. Jumps, CMJ Decay & Impacts
    jumps = evaluate_jump_shock_load(session.athlete_weight_kg, session.jump_heights_m, session.single_leg_landings_count, session.jump_count)
    cmj_decay, fatigue_lvl = None, "FRESH"
    if session.pre_match_cmj_m is not None and session.post_match_cmj_m is not None:
        cmj_res = evaluate_cmj_decay(session.pre_match_cmj_m, session.post_match_cmj_m)
        cmj_decay, fatigue_lvl = cmj_res["decay_percentage"], cmj_res["neuromuscular_fatigue"]

    rugby = evaluate_rugby_collisions(session.high_g_collisions_count, session.severe_collisions_count, session.repeated_high_intensity_efforts)
    futsal = evaluate_futsal_micro_decelerations(session.micro_decelerations_count, session.duration_minutes)
    hockey = evaluate_hockey_lumbar_strain(session.lumbar_flexion_minutes, session.duration_minutes)

    # 4. Recovery
    rec_h = max(24.0, rugby["recovery_hours"], jumps["plyometric_lock_hours"])
    if fatigue_lvl == "CRITICAL" or hamstring_risk == "HIGH":
        rec_h = max(rec_h, 48.0)
    elif fatigue_lvl == "ELEVATED":
        rec_h = max(rec_h, 36.0)

    # 5. Verdict
    verdict = (
        f"Evaluasi Beregu ({session.sport_code}): PlayerLoad {total_pl} AU ({pl_per_min} AU/min). "
        f"HSR: {hsr_dist}m, Sprint: {sprint_dist}m (Risiko Hamstring: {hamstring_risk}). "
    )
    if jumps["patellar_warning"]:
        verdict += "PERINGATAN PATELLAR: >60 lonjakan, kunci pliometrik 48 jam. "
    if fatigue_lvl in ("CRITICAL", "ELEVATED"):
        verdict += f"Kelelahan Neuromuskular CMJ: {fatigue_lvl} ({cmj_decay}%). "
    if rugby["collision_risk_level"] != "LOW":
        verdict += f"Tubrukan {rugby['collision_impact_score']} ({rugby['collision_risk_level']}). "
    verdict += f"Pemulihan direkomendasikan: {int(rec_h)} jam."

    return TeamSessionResponse(
        total_player_load=total_pl,
        player_load_per_minute=pl_per_min,
        total_distance_meters=total_dist,
        hsr_distance_meters=hsr_dist,
        sprint_distance_meters=sprint_dist,
        hamstring_strain_risk=hamstring_risk,
        jump_shock_load_kj=jumps["jump_shock_load_kj"],
        patellar_overload_warning=jumps["patellar_warning"],
        cmj_decay_percentage=cmj_decay,
        neuromuscular_fatigue_level=fatigue_lvl,
        collision_impact_score=rugby["collision_impact_score"],
        quad_eccentric_shock_au=futsal["quad_eccentric_shock_au"],
        lumbar_strain_index=hockey["lumbar_strain_index"],
        recommended_recovery_hours=rec_h,
        coach_verdict=verdict,
    )
