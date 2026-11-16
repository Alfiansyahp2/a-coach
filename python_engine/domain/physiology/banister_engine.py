import math
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from .models import (
    TRIMPCalculationInput,
    SessionLoadInput,
    PMCDataPoint,
    AthletePhysiologyProfile,
    PMCResponse,
)


def calculate_trimp(inp: TRIMPCalculationInput) -> float:
    """
    Computes Banister Exponential Training Impulse (TRIMP).
    Formula: Duration (min) * DeltaHR * a * exp(b * DeltaHR)
    DeltaHR = (HR_avg - HR_rest) / (HR_max - HR_rest)
    Male coefficients: a = 0.64, b = 1.92
    Female coefficients: a = 0.86, b = 1.67
    """
    hr_range = max(1.0, inp.max_hr - inp.rest_hr)
    clamped_avg = min(inp.max_hr, max(inp.rest_hr, inp.avg_hr))
    delta_hr = (clamped_avg - inp.rest_hr) / hr_range

    is_female = inp.gender.lower().strip() == "female"
    a = 0.86 if is_female else 0.64
    b = 1.67 if is_female else 1.92

    trimp = inp.duration_minutes * delta_hr * a * math.exp(b * delta_hr)
    return round(trimp, 2)


def calculate_session_load(
    session: SessionLoadInput,
    profile: Optional[AthletePhysiologyProfile] = None,
) -> float:
    """
    Estimates session training load in normalized stress points (equivalent to TSS).
    If Heart Rate data is present, uses Banister TRIMP normalized to ~100 per hour at threshold.
    If only duration/speed is present, estimates based on RPE / aerobic pace.
    """
    duration_min = session.duration_seconds / 60.0
    if duration_min <= 0:
        return 0.0

    prof = profile or AthletePhysiologyProfile()

    # 1. Primary: Heart Rate TRIMP
    if session.avg_hr and session.avg_hr > prof.rest_hr:
        raw_trimp = calculate_trimp(
            TRIMPCalculationInput(
                duration_minutes=duration_min,
                avg_hr=session.avg_hr,
                max_hr=prof.max_hr,
                rest_hr=prof.rest_hr,
                gender=prof.gender,
            )
        )
        # Normalize: 1 hr at lactate threshold (~85% HRR) = ~100 load points
        normalized_load = raw_trimp * 0.95
        return round(normalized_load, 1)

    # 2. Power-based TSS if avg_power is present and FTP is known
    if session.avg_power and session.avg_power > 0 and prof.ftp and prof.ftp > 0:
        intensity_factor = session.avg_power / prof.ftp
        tss = (session.duration_seconds * session.avg_power * intensity_factor) / (prof.ftp * 3600.0) * 100.0
        return round(tss, 1)

    # 3. Fallback: Aerobic default load (~45 points per hour of steady endurance)
    hourly_rate = 50.0 if "run" in session.sport_type.lower() else 42.0
    fallback_load = (duration_min / 60.0) * hourly_rate
    return round(fallback_load, 1)


def get_tsb_interpretation(tsb: float) -> Dict[str, str]:
    """
    Categorizes Training Stress Balance (TSB = CTL - ATL) into clinical endurance coaching zones.
    """
    if tsb < -25.0:
        return {
            "zone": "HIGH_FATIGUE_OVERREACHING",
            "interpretation": "Kelelahan ekstrem terakumulasi (Risiko cedera tinggi / Overreaching)",
            "action": "Batalkan sesi intensitas tinggi. Alihkan ke Active Recovery Zone 1 (<=45 mnt) atau istirahat total.",
        }
    if tsb < -10.0:
        return {
            "zone": "OPTIMAL_OVERLOAD",
            "interpretation": "Beban adaptif optimal (Membangun kebugaran fondasi secara terukur)",
            "action": "Lanjutkan jadwal latihan sesuai periodisasi. Jaga hidrasi, asupan karbohidrat, dan tidur 7-8 jam.",
        }
    if tsb <= 10.0:
        return {
            "zone": "NEUTRAL_MAINTENANCE",
            "interpretation": "Keseimbangan beban dan pemulihan stabil",
            "action": "Kondisi stabil. Siap mengeksekusi sesi spesifik (Tempo atau Long Aerobic Ride).",
        }
    if tsb <= 25.0:
        return {
            "zone": "PEAK_RACE_FORM",
            "interpretation": "Form puncak / Segar (Tapering berhasil, siap performa maksimal)",
            "action": "Kondisi fisik prima untuk event balapan atau menuntaskan target 100K Century Ride!",
        }
    return {
        "zone": "DETRAINING_TRANSITION",
        "interpretation": "Pemulihan berkepanjangan (Risiko penurunan kapasitas aerobik)",
        "action": "Segera jadwalkan sesi aerobik Zone 2 untuk mengaktifkan kembali adaptasi mitokondria.",
    }


def calculate_pmc(
    sessions: List[SessionLoadInput],
    profile: Optional[AthletePhysiologyProfile] = None,
    days_history: int = 42,
    reference_date: Optional[datetime] = None,
) -> PMCResponse:
    """
    Builds the daily Performance Management Chart (PMC):
    - Chronic Training Load (CTL, tau = 42 days) -> Fitness
    - Acute Training Load (ATL, tau = 7 days) -> Fatigue
    - Training Stress Balance (TSB = CTL - ATL) -> Form / Freshness
    - EWMA Acute:Chronic Workload Ratio (ACWR = ATL / CTL)
    """
    ref_dt = reference_date or datetime.now()
    ref_date_only = ref_dt.date()

    # Aggregate session loads by date (YYYY-MM-DD)
    daily_loads: Dict[str, float] = {}
    for s in sessions:
        try:
            # Parse ISO date string
            clean_date_str = s.start_date.split("T")[0]
            load = calculate_session_load(s, profile)
            daily_loads[clean_date_str] = daily_loads.get(clean_date_str, 0.0) + load
        except Exception:
            continue

    # Timeline calculation starting 90 days before reference date to establish steady EWMA state
    warmup_days = 60
    total_days = days_history + warmup_days
    start_date = ref_date_only - timedelta(days=total_days - 1)

    ctl = 0.0
    atl = 0.0

    # Exponential time constants
    decay_ctl = math.exp(-1.0 / 42.0)
    decay_atl = math.exp(-1.0 / 7.0)

    all_points: List[PMCDataPoint] = []

    for d in range(total_days):
        current_date = start_date + timedelta(days=d)
        date_key = current_date.strftime("%Y-%m-%d")
        day_load = daily_loads.get(date_key, 0.0)

        # Banister EWMA step
        ctl = ctl * decay_ctl + day_load * (1.0 - decay_ctl)
        atl = atl * decay_atl + day_load * (1.0 - decay_atl)
        tsb = ctl - atl

        # Only retain points within the requested days_history window
        if d >= warmup_days:
            interp = get_tsb_interpretation(tsb)
            all_points.append(
                PMCDataPoint(
                    date=current_date.strftime("%d %b"),
                    date_key=date_key,
                    day_load=round(day_load, 1),
                    ctl=round(ctl, 1),
                    atl=round(atl, 1),
                    tsb=round(tsb, 1),
                    tsb_zone=interp["zone"],
                    interpretation=interp["interpretation"],
                )
            )

    curr_ctl = round(ctl, 1)
    curr_atl = round(atl, 1)
    curr_tsb = round(curr_ctl - curr_atl, 1)
    current_interp = get_tsb_interpretation(curr_tsb)

    # EWMA ACWR = ATL / CTL
    ewma_acwr = round(curr_atl / max(1.0, curr_ctl), 2)

    return PMCResponse(
        data_points=all_points,
        current_ctl=curr_ctl,
        current_atl=curr_atl,
        current_tsb=curr_tsb,
        current_zone=current_interp["zone"],
        ewma_acwr=ewma_acwr,
        recommended_action=current_interp["action"],
    )

