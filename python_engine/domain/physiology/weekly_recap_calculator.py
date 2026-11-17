import math
from typing import List, Optional, Dict
from .models import (
    SessionLoadInput,
    AthletePhysiologyProfile,
    PolarizationBreakdown,
    WoWDelta,
    MusculoskeletalStrain,
    WeeklyProRecapResponse,
)
from .banister_engine import calculate_session_load


def calculate_foster_srpe(sessions: List[SessionLoadInput]) -> float:
    """
    Computes Foster Session-RPE workload = sum(RPE * duration_minutes).
    If RPE is not explicitly set, estimates based on Heart Rate / Sport intensity.
    """
    total_srpe = 0.0
    for s in sessions:
        dur_min = s.duration_seconds / 60.0
        if dur_min <= 0:
            continue

        rpe = s.rpe
        if rpe is None or rpe <= 0:
            # Estimate RPE from heart rate or default to Zone 2 (RPE 3.5)
            if s.avg_hr and s.avg_hr >= 165:
                rpe = 8.0
            elif s.avg_hr and s.avg_hr >= 150:
                rpe = 6.0
            elif s.avg_hr and s.avg_hr >= 135:
                rpe = 4.0
            else:
                rpe = 3.5

        total_srpe += rpe * dur_min

    return round(total_srpe, 1)


def calculate_monotony_and_strain(
    sessions: List[SessionLoadInput],
    profile: Optional[AthletePhysiologyProfile],
) -> tuple[float, float]:
    """
    Computes Training Monotony (Mean daily load / SD) and Training Strain (Total Load * Monotony).
    Higher monotony (>2.0) with high strain (>4000) strongly predicts overtraining and illness.
    """
    daily_loads = [0.0] * 7
    for s in sessions:
        try:
            # Map start_date to day of week (0 to 6)
            date_part = s.start_date.split("T")[0]
            parts = [int(p) for p in date_part.split("-")]
            import datetime
            d = datetime.date(parts[0], parts[1], parts[2])
            day_idx = d.weekday()  # Monday = 0
            daily_loads[day_idx] += calculate_session_load(s, profile)
        except Exception:
            daily_loads[0] += calculate_session_load(s, profile)

    total_load = sum(daily_loads)
    if total_load <= 0:
        return 0.0, 0.0

    mean_load = total_load / 7.0
    variance = sum((l - mean_load) ** 2 for l in daily_loads) / 7.0
    sd = math.sqrt(variance)

    monotony = round(mean_load / max(1.0, sd), 2)
    strain = round(total_load * monotony, 1)
    return monotony, strain


def calculate_seiler_polarization(
    sessions: List[SessionLoadInput],
    profile: Optional[AthletePhysiologyProfile],
) -> PolarizationBreakdown:
    """
    Groups weekly volume into Stephen Seiler's 3-zone polarized model:
    - Zone 1-2 (Low Intensity): <75% HRmax (Aerobic Foundation, Fat Oxidation)
    - Zone 3 (Moderate Intensity): 75-85% HRmax (Tempo / Sweetspot / Threshold Transition)
    - Zone 4-5 (High Intensity): >85% HRmax (VO2max / Anaerobic Capacity)
    """
    prof = profile or AthletePhysiologyProfile()
    total_sec = sum(s.duration_seconds for s in sessions)

    if total_sec <= 0:
        return PolarizationBreakdown(
            low_zone_pct=100.0,
            moderate_zone_pct=0.0,
            high_zone_pct=0.0,
            is_optimal_polarized=True,
            classification="RECOVERY_WEEK",
            verdict="Tidak ada durasi latihan tercatat minggu ini.",
        )

    z1_2_sec = 0.0
    z3_sec = 0.0
    z4_5_sec = 0.0

    hr_z3_threshold = prof.max_hr * 0.75
    hr_z4_threshold = prof.max_hr * 0.85

    for s in sessions:
        dur = s.duration_seconds
        avg_hr = s.avg_hr

        if avg_hr and avg_hr > 0:
            if avg_hr < hr_z3_threshold:
                z1_2_sec += dur
            elif avg_hr < hr_z4_threshold:
                z3_sec += dur
            else:
                z4_5_sec += dur
        else:
            # Fallback based on sport type: MTB sessions default 85% Zone 1-2, 15% Zone 3
            z1_2_sec += dur * 0.85
            z3_sec += dur * 0.15

    low_pct = round((z1_2_sec / total_sec) * 100.0, 1)
    mod_pct = round((z3_sec / total_sec) * 100.0, 1)
    high_pct = round((z4_5_sec / total_sec) * 100.0, 1)

    is_optimal = low_pct >= 75.0
    has_black_hole = mod_pct > 25.0

    if is_optimal:
        classification = "OPTIMAL_POLARIZED_80_20"
        verdict = f"Distribusi intensitas ideal ({low_pct}% Zone 1-2). Menjaga adaptasi mitokondria murni tanpa kelelahan saraf berlebih."
    elif has_black_hole:
        classification = "BLACK_HOLE_WARNING"
        verdict = f"Peringatan 'Black Hole': {mod_pct}% durasi dihabiskan di Zone 3 (Tempo). Terlalu intens untuk pemulihan, namun kurang tajam untuk stimulasi puncak."
    else:
        classification = "THRESHOLD_DOMINANT"
        verdict = f"Distribusi moderat ({low_pct}% Z1-2, {mod_pct}% Z3, {high_pct}% Z4-5). Cukup produktif namun perhatikan cadangan glikogen."

    return PolarizationBreakdown(
        low_zone_pct=low_pct,
        moderate_zone_pct=mod_pct,
        high_zone_pct=high_pct,
        is_optimal_polarized=is_optimal,
        classification=classification,
        verdict=verdict,
    )


def calculate_wow_delta(
    curr_sessions: List[SessionLoadInput],
    prev_sessions: List[SessionLoadInput],
    profile: Optional[AthletePhysiologyProfile],
) -> WoWDelta:
    """
    Computes Week-over-Week delta for distance and physiological TSS.
    """
    curr_dist = sum(s.distance_meters for s in curr_sessions) / 1000.0
    prev_dist = sum(s.distance_meters for s in prev_sessions) / 1000.0

    curr_tss = sum(calculate_session_load(s, profile) for s in curr_sessions)
    prev_tss = sum(calculate_session_load(s, profile) for s in prev_sessions)

    if prev_dist <= 0:
        dist_delta = 0.0 if curr_dist <= 0 else 100.0
    else:
        dist_delta = round(((curr_dist - prev_dist) / prev_dist) * 100.0, 1)

    if prev_tss <= 0:
        tss_delta = 0.0 if curr_tss <= 0 else 100.0
    else:
        tss_delta = round(((curr_tss - prev_tss) / prev_tss) * 100.0, 1)

    if dist_delta > 20.0 or tss_delta > 25.0:
        flag = "SPIKE_WARNING"
        interp = f"Lonjakan beban signifikan (+{dist_delta}% jarak, +{tss_delta}% TSS). Melanggar kaidah 10% volume. Pantau respons tendon."
    elif dist_delta > 10.0:
        flag = "MODERATE_SURGE"
        interp = f"Kenaikan terukur (+{dist_delta}% jarak). Stabilkan volume minggu depan sebelum menambah jarak."
    elif dist_delta < -25.0:
        flag = "DELOAD_DETECTED"
        interp = f"Penurunan volume terencana ({dist_delta}%). Sangat tepat untuk superkompensasi fisiologis."
    else:
        flag = "SAFE"
        interp = f"Progresi stabil (+{dist_delta}% jarak). Menjaga adaptasi aerobik optimal."

    return WoWDelta(
        distance_change_pct=dist_delta,
        tss_change_pct=tss_delta,
        safety_flag=flag,
        interpretation=interp,
    )


def compute_weekly_pro_recap(
    curr_sessions: List[SessionLoadInput],
    prev_sessions: List[SessionLoadInput],
    profile: Optional[AthletePhysiologyProfile] = None,
    peak_pain: int = 0,
    has_swelling: bool = False,
) -> WeeklyProRecapResponse:
    """
    Master calculator generating the full Pro Endurance Weekly Recap.
    """
    prof = profile or AthletePhysiologyProfile()

    # 1. Internal Loads
    foster_srpe = calculate_foster_srpe(curr_sessions)
    weekly_tss = round(sum(calculate_session_load(s, prof) for s in curr_sessions), 1)
    monotony, strain = calculate_monotony_and_strain(curr_sessions, prof)

    # 2. Polarization & WoW
    polarization = calculate_seiler_polarization(curr_sessions, prof)
    wow = calculate_wow_delta(curr_sessions, prev_sessions, prof)

    # 3. Musculoskeletal Impact Breakdown
    total_sec = max(1.0, sum(s.duration_seconds for s in curr_sessions))
    run_sec = sum(s.duration_seconds for s in curr_sessions if "run" in s.sport_type.lower())
    ride_sec = sum(s.duration_seconds for s in curr_sessions if "ride" in s.sport_type.lower() or "cycl" in s.sport_type.lower())

    impact_pct = round((run_sec / total_sec) * 100.0, 1)
    non_impact_pct = round((ride_sec / total_sec) * 100.0, 1)

    if has_swelling or peak_pain >= 5:
        joint_rating = "HIGH_RISK_INFLAMMATION"
        pain_note = f"Gejala aktif terdeteksi (Nyeri {peak_pain}/10). Beban impak harus dinolkan segera."
    elif impact_pct == 0.0:
        joint_rating = "PROTECTIVE_ASYMMETRY"
        pain_note = "Disiplin proteksi sempurna: 100% volume dialihkan ke sepeda closed-chain tanpa impak ke engkel/lutut."
    else:
        joint_rating = "OPTIMAL_TOLERANCE"
        pain_note = f"Beban impak lari terkontrol ({impact_pct}%). Toleransi sendi stabil."

    musculoskeletal = MusculoskeletalStrain(
        impact_running_pct=impact_pct,
        non_impact_cycling_pct=non_impact_pct,
        joint_safety_rating=joint_rating,
        pain_gradient_note=pain_note,
    )

    # 4. Periodization Phase
    if wow.safety_flag == "DELOAD_DETECTED":
        periodization_phase = "DELOAD_RECOVERY"
        bridge_advice = "Minggu ini berhasil menyerap fase deload. Minggu depan siap memulai blok progressive overload baru."
    elif weekly_tss > 350.0:
        periodization_phase = "PEAK_WEEK"
        bridge_advice = "Puncak volume tercapai. Wajib menjadwalkan 1 minggu deload (-30% volume) setelah blok ini selesai."
    elif wow.safety_flag == "MODERATE_SURGE" or wow.safety_flag == "SAFE":
        periodization_phase = "BASE_BUILD"
        bridge_advice = "Fondasi mitokondria bertambah kokoh. Pertahankan Long Ride akhir pekan di Zone 2 dan nutrisi teratur."
    else:
        periodization_phase = "PROGRESSIVE_OVERLOAD"
        bridge_advice = "Beban latihan terakumulasi cepat. Utamakan tidur 8 jam dan hidrasi elektrolit tinggi."

    verdict = (
        f"Rekap Mingguan Pro: Total TSS {weekly_tss} (sRPE: {foster_srpe:.0f} AU). "
        f"Distribusi intensitas {polarization.low_zone_pct}% Zone 1-2 ({polarization.classification}). "
        f"{musculoskeletal.pain_gradient_note}"
    )

    return WeeklyProRecapResponse(
        foster_srpe_load=foster_srpe,
        weekly_tss=weekly_tss,
        training_monotony=monotony,
        training_strain=strain,
        polarization=polarization,
        wow_delta=wow,
        musculoskeletal=musculoskeletal,
        periodization_phase=periodization_phase,
        pro_coach_verdict=verdict,
        next_week_bridge_advice=bridge_advice,
    )

