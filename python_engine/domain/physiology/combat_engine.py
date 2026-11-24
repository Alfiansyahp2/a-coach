import math
from typing import List, Dict, Any, Optional, Tuple
from .models import (
    CombatRoundInput,
    CombatSessionInput,
    CombatSessionResponse,
)

RED_FLAG_CONCUSSION_SYMPTOMS = {
    "headache",
    "dizziness",
    "nausea",
    "amnesia",
    "confusion",
    "photophobia",
    "diplopia",
    "vomiting",
    "ringing_in_ears",
    "balance_loss",
}


def calculate_punch_density(total_punches: int, round_minutes: float) -> float:
    """Computes punch density per minute = Total Punches / Round Minutes."""
    if round_minutes <= 0.0 or total_punches <= 0:
        return 0.0
    return round(total_punches / round_minutes, 2)


def partition_mma_workload(
    standup_minutes: float,
    mat_minutes: float,
    rpe_strike: float = 7.0,
    rpe_grapple: float = 8.0,
) -> Tuple[float, float, float]:
    """Partitions MMA workload with a 1.35x metabolic multiplier for ground grappling."""
    standup_min = max(0.0, standup_minutes)
    mat_min = max(0.0, mat_minutes)

    strike_load = standup_min * max(1.0, rpe_strike) * 1.0
    grapple_load = mat_min * max(1.0, rpe_grapple) * 1.35
    total = strike_load + grapple_load

    return round(strike_load, 2), round(grapple_load, 2), round(total, 2)


def evaluate_concussion_scat6_gate(
    head_impacts: int,
    symptoms: List[str],
    has_headgear: bool = False,
    rotational_impacts: int = 0,
) -> Dict[str, Any]:
    """
    Evaluates traumatic brain injury risk using SCAT6 criteria.
    Rotational/angular impacts carry 1.5x higher midbrain shear weighting.
    """
    reported_lower = {s.lower().strip().replace(" ", "_") for s in symptoms if s}
    matched_red_flags = reported_lower.intersection(RED_FLAG_CONCUSSION_SYMPTOMS)

    if len(matched_red_flags) > 0:
        rest_days = 14 if len(matched_red_flags) >= 2 or "amnesia" in matched_red_flags or "vomiting" in matched_red_flags else 7
        return {
            "gate_triggered": True,
            "action": "MANDATORY_CONTACT_SUSPENSION_7_14_DAYS",
            "recommended_rest_days": rest_days,
            "reason": f"Gejala neurologis terdeteksi ({', '.join(sorted(matched_red_flags))}). Wajib evaluasi medis dan larangan kontak fisik {rest_days} hari.",
        }

    linear_impacts = max(0, head_impacts - rotational_impacts)
    effective_impacts = (linear_impacts * 1.0 + rotational_impacts * 1.5) * (0.85 if has_headgear else 1.0)

    if effective_impacts >= 15.0 or rotational_impacts >= 6:
        return {
            "gate_triggered": True,
            "action": "HIGH_HEAD_IMPACT_SUSPENSION_7_DAYS",
            "recommended_rest_days": 7,
            "reason": f"Volume benturan kepala tinggi ({head_impacts} benturan, {rotational_impacts} rotasional). Wajib protokol istirahat kontak 7 hari untuk pemulihan mikrotrauma aksonal.",
        }
    elif effective_impacts >= 8.0:
        return {
            "gate_triggered": False,
            "action": "MONITOR_POST_SPARRING_SYMPTOMS",
            "recommended_rest_days": 2,
            "reason": f"Benturan kepala moderat ({head_impacts} benturan). Monitor gejala pusing/fotofobia dalam 48 jam ke depan.",
        }

    return {
        "gate_triggered": False,
        "action": "CLEAR_ROUTINE_MONITORING",
        "recommended_rest_days": 1,
        "reason": "Beban benturan kepala dalam batas aman. Pemulihan rutin 24-48 jam.",
    }


def calculate_throw_kinetic_work(
    partner_weight_kg: Optional[float] = None,
    throw_count: int = 0,
    avg_lift_height_m: float = 1.2,
    fallback_weight_kg: float = 75.0,
) -> float:
    """Computes kinetic work output for Judo/Sambo throws (Nage-Waza) in kJ."""
    if throw_count <= 0:
        return 0.0

    if partner_weight_kg is None:
        p_weight = fallback_weight_kg
    elif partner_weight_kg <= 0:
        return 0.0
    else:
        p_weight = partner_weight_kg

    work_joules = p_weight * 9.81 * avg_lift_height_m * throw_count
    return round(work_joules / 1000.0, 2)


def calculate_tibial_impact_index(
    kick_count: int,
    has_shin_guards: bool = True,
    intensity_multiplier: float = 1.0,
) -> float:
    """Computes tibial bone stress. Shin guards provide ~55% force attenuation."""
    if kick_count <= 0:
        return 0.0

    damping = 0.45 if has_shin_guards else 1.0
    stress = kick_count * max(0.5, intensity_multiplier) * damping
    return round(stress, 2)


def evaluate_bjj_strain(
    mat_time_minutes: float,
    avg_rpe: float,
    inversion_minutes: float = 0.0,
    is_gi: bool = False,
) -> Tuple[float, float]:
    """
    Computes BJJ grappling isometric workload and cervical/lumbar spine strain index.
    Gi training carries 1.25x higher isometric forearm/grip flexor fatigue.
    """
    mat_min = max(0.0, mat_time_minutes)
    rpe = max(1.0, avg_rpe)
    inv_min = max(0.0, inversion_minutes)

    grip_factor = 1.25 if is_gi else 1.0
    workload = mat_min * rpe * 1.35 * grip_factor
    cervical_strain = (inv_min * 2.5) + (mat_min * 0.2)

    return round(workload, 2), round(cervical_strain, 2)


def evaluate_combat_session(session: CombatSessionInput) -> CombatSessionResponse:
    """Full Phase 2 Physiological Combat Sports Evaluator with safeguards and Judo throw work."""
    active_rounds = [r for r in session.rounds if r.duration_minutes > 0]
    if not active_rounds:
        return CombatSessionResponse(
            total_duration_minutes=0.0,
            total_combat_workload_au=0.0,
            punch_density_per_min=0.0,
            striking_load_au=0.0,
            grappling_load_au=0.0,
            concussion_gate_triggered=False,
            concussion_action="CLEAR_ROUTINE_MONITORING",
            tibial_stress_score=0.0,
            cervical_strain_index=0.0,
            recommended_rest_days=1,
            coach_verdict="Tidak ada ronde pertarungan aktif yang tercatat. Beban kontak fisik nihil.",
        )

    total_duration = sum(r.duration_minutes for r in active_rounds)
    total_punches = sum(r.punches_thrown for r in active_rounds)
    total_kicks = sum(r.kicks_thrown for r in active_rounds)
    total_head_impacts = sum(r.head_impacts_count for r in active_rounds)
    total_mat_time = sum(r.mat_time_minutes for r in active_rounds)
    total_inversion = sum(r.inversion_minutes for r in active_rounds)
    total_takedowns = sum(r.takedowns_attempted for r in active_rounds)

    punch_density = calculate_punch_density(total_punches, total_duration)
    standup_time = max(0.0, total_duration - total_mat_time)
    avg_rpe = sum(r.rpe * r.duration_minutes for r in active_rounds) / total_duration

    strike_load, grapple_load, total_workload = partition_mma_workload(
        standup_minutes=standup_time,
        mat_minutes=total_mat_time,
        rpe_strike=avg_rpe,
        rpe_grapple=avg_rpe,
    )

    concussion_result = evaluate_concussion_scat6_gate(
        head_impacts=total_head_impacts,
        symptoms=session.symptoms_reported,
        has_headgear=session.has_headgear,
    )

    intensity_mult = avg_rpe / 7.0
    tibial_stress = calculate_tibial_impact_index(
        kick_count=total_kicks,
        has_shin_guards=session.has_shin_guards,
        intensity_multiplier=intensity_mult,
    )

    _, cervical_strain = evaluate_bjj_strain(
        mat_time_minutes=total_mat_time,
        avg_rpe=avg_rpe,
        inversion_minutes=total_inversion,
        is_gi=True,
    )

    # Judo Nage-Waza Throw Workload
    throw_work_kj = 0.0
    if total_takedowns > 0:
        p_weight = session.partner_weight_kg if (session.partner_weight_kg and session.partner_weight_kg > 0) else 75.0
        throw_work_kj = calculate_throw_kinetic_work(p_weight, total_takedowns)

    rest_days = concussion_result["recommended_rest_days"]
    if total_workload > 600.0 and rest_days < 2:
        rest_days = 2
    if tibial_stress > 80.0 and rest_days < 3:
        rest_days = 3

    verdict = (
        f"Sesi {session.sport_code}: Beban Total {total_workload:.0f} AU "
        f"(Striking {strike_load:.0f} AU, Grappling {grapple_load:.0f} AU). "
    )
    if throw_work_kj > 0:
        verdict += f"Kerja Lemparan {throw_work_kj:.1f} kJ ({total_takedowns} bantingan). "
    verdict += f"{concussion_result['reason']}"

    return CombatSessionResponse(
        total_duration_minutes=round(total_duration, 1),
        total_combat_workload_au=total_workload,
        punch_density_per_min=punch_density,
        striking_load_au=strike_load,
        grappling_load_au=grapple_load,
        concussion_gate_triggered=concussion_result["gate_triggered"],
        concussion_action=concussion_result["action"],
        tibial_stress_score=tibial_stress,
        cervical_strain_index=cervical_strain,
        recommended_rest_days=rest_days,
        coach_verdict=verdict,
    )
