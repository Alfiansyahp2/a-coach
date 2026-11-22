"""
Systemic Fatigue Arbiter & Multi-Sport Ingress Engine (Phase 6).
Evaluates AMPK vs mTORC1 molecular interference, cumulative CNS drain,
joint biomechanical collision matrix, and unified telemetry routing for all 33 sports.
"""

from typing import List, Dict, Any, Optional
from python_engine.domain.physiology.arbiter_models import (
    HybridSessionSummary,
    JointCollisionAlert,
    MolecularInterferenceAlert,
    HybridArbitrationInput,
    HybridArbitrationResponse,
    CaborTelemetryIngressInput,
)

CNS_COEFFICIENTS: Dict[str, float] = {
    "SPORT_WEIGHTLIFTING": 1.0, "SPORT_POWERLIFTING": 1.0, "SPORT_BOXING": 1.0, "SPORT_MMA": 1.0,
    "SPORT_RUGBY": 0.85, "SPORT_FOOTBALL": 0.85, "SPORT_BASKETBALL": 0.85, "SPORT_JUDO": 0.85, "SPORT_FUNCTIONAL_FITNESS": 0.85,
    "SPORT_BADMINTON": 0.70, "SPORT_TENNIS": 0.70, "SPORT_CLIMBING": 0.70, "SPORT_VOLLEYBALL": 0.70, "SPORT_FUTSAL": 0.70,
    "SPORT_CYCLING": 0.50, "SPORT_RUNNING": 0.50, "SPORT_SWIMMING": 0.50, "SPORT_ROWING": 0.50, "SPORT_SKATEBOARDING": 0.50, "SPORT_GYMNASTICS": 0.50,
    "SPORT_ARCHERY": 0.30, "SPORT_SHOOTING": 0.30, "SPORT_TABLE_TENNIS": 0.30,
}

JOINT_TAXONOMY: Dict[str, List[str]] = {
    "KNEE": ["SPORT_FOOTBALL", "SPORT_FUTSAL", "SPORT_BASKETBALL", "SPORT_VOLLEYBALL", "SPORT_RUNNING", "SPORT_POWERLIFTING"],
    "SHOULDER": ["SPORT_SWIMMING", "SPORT_TENNIS", "SPORT_BADMINTON", "SPORT_ARCHERY", "SPORT_BOXING", "SPORT_WEIGHTLIFTING", "SPORT_GYMNASTICS"],
    "LUMBAR": ["SPORT_POWERLIFTING", "SPORT_ROWING", "SPORT_CYCLING", "SPORT_FIELD_HOCKEY"],
    "ANKLE": ["SPORT_RUNNING", "SPORT_BASKETBALL", "SPORT_SKATEBOARDING", "SPORT_BADMINTON"],
    "WRIST": ["SPORT_CLIMBING", "SPORT_GYMNASTICS"],
}


def evaluate_ampk_mtorc1_interference(
    sessions: List[HybridSessionSummary], buffer_hours: Optional[float] = None
) -> MolecularInterferenceAlert:
    """Evaluates AMPK vs mTORC1 molecular pathway interference in concurrent training."""
    endurance_sess = next((s for s in sessions if s.modality_type == "ENDURANCE" or "RUN" in s.sport_code or "CYCLE" in s.sport_code), None)
    strength_sess = next((s for s in sessions if s.modality_type == "STRENGTH" or "POWERLIFTING" in s.sport_code or "WEIGHTLIFTING" in s.sport_code), None)

    if not endurance_sess or not strength_sess:
        return MolecularInterferenceAlert(
            detected=False, buffer_hours=24.0, endurance_sport=endurance_sess.sport_code if endurance_sess else "NONE",
            strength_sport=strength_sess.sport_code if strength_sess else "NONE", severity="NONE",
            mechanism="Tidak ada sesi bersamaan ketahanan dan kekuatan hipertrofi.", recommendation="Jadwal bebas interferensi molekuler.",
        )

    buf = 4.0 if buffer_hours is None else float(buffer_hours)
    if buf >= 6.0:
        return MolecularInterferenceAlert(
            detected=False, buffer_hours=buf, endurance_sport=endurance_sess.sport_code, strength_sport=strength_sess.sport_code,
            severity="NONE", mechanism="Jeda >= 6 jam memadai untuk transkripsi genetik terpisah.", recommendation="Aman untuk adaptasi ganda.",
        )

    sev = "HIGH" if buf < 3.0 else "MODERATE"
    rec = (
        f"Jeda {buf} jam (<6 jam) memicu aktivasi AMPK yang menghambat kaskade mTORC1 dan sintesis protein otot (MPS). "
        "Pisahkan minimal 6 jam atau berikan nutrisi tinggi leusin segera pasca sesi."
    )
    return MolecularInterferenceAlert(
        detected=True, buffer_hours=buf, endurance_sport=endurance_sess.sport_code, strength_sport=strength_sess.sport_code,
        severity=sev, mechanism="Inhibisi fosforilasi mTORC1 oleh protein kinase AMPK aktif.", recommendation=rec,
    )


def calculate_cns_exhaustion_index(sessions: List[HybridSessionSummary]) -> Dict[str, Any]:
    """Computes total CNS drain score across multi-sport sessions."""
    total_drain = 0.0
    for s in sessions:
        coeff = CNS_COEFFICIENTS.get(s.sport_code.upper(), 0.50)
        drain = s.explosiveness_rpe * s.duration_minutes * coeff * (s.intensity_rpe / 10.0)
        total_drain += drain

    rounded_drain = round(total_drain, 2)
    if rounded_drain >= 750.0:
        status, cleared = "CRITICAL", False
    elif rounded_drain >= 450.0:
        status, cleared = "ELEVATED", False
    else:
        status, cleared = "OPTIMAL", True

    return {"total_cns_drain_score": rounded_drain, "status": status, "cleared_for_explosive_training": cleared}


def detect_joint_biomechanical_collisions(
    sessions: List[HybridSessionSummary], known_injury_joints: Optional[List[str]] = None
) -> List[JointCollisionAlert]:
    """Identifies overlapping mechanical stress on vulnerable anatomical structures."""
    alerts: List[JointCollisionAlert] = []
    injury_set = set(j.upper() for j in (known_injury_joints or []))

    for joint, sports in JOINT_TAXONOMY.items():
        matched = [s for s in sessions if s.sport_code.upper() in sports or joint in [j.upper() for j in s.primary_joints]]
        if len(matched) >= 2:
            is_injured = joint in injury_set
            sev = "CRITICAL" if is_injured else ("HIGH" if len(matched) >= 3 else "MODERATE")
            s1, s2 = matched[0].sport_code, matched[1].sport_code
            clin_risk = f"Kelebihan beban mikrotrauma eksentrik kumulatif pada sendi {joint}."
            if is_injured:
                clin_risk += f" [PERINGATAN: Sendi {joint} terdaftar dalam riwayat cedera aktif atlet!]"
            mitigation = f"Hindari beban deselerasi tinggi pada {s2} atau ganti dengan latihan non-impak (Zona 1 renang/sepeda statis)."
            alerts.append(JointCollisionAlert(
                joint=joint, primary_sport=s1, conflicting_sport=s2, severity=sev, clinical_risk=clin_risk, mitigation_action=mitigation
            ))

    return alerts


def arbitrate_hybrid_athlete_schedule(request: HybridArbitrationInput) -> HybridArbitrationResponse:
    """Master Arbiter: Evaluates molecular interference, CNS drain, and joint collisions."""
    cns_res = calculate_cns_exhaustion_index(request.sessions_today)
    mol_res = evaluate_ampk_mtorc1_interference(request.sessions_today, request.buffer_hours_between_endurance_and_strength)
    joint_alerts = detect_joint_biomechanical_collisions(request.sessions_today, request.known_injury_joints)

    rec_hours = 24.0
    if cns_res["status"] == "CRITICAL":
        rec_hours = max(rec_hours, 48.0)
    elif cns_res["status"] == "ELEVATED":
        rec_hours = max(rec_hours, 36.0)

    if any(a.severity == "CRITICAL" for a in joint_alerts):
        rec_hours = max(rec_hours, 48.0)
    elif joint_alerts:
        rec_hours = max(rec_hours, 36.0)

    verdict = (
        f"Arbitrase Atlet Hibrida: Status SSP {cns_res['status']} ({cns_res['total_cns_drain_score']} AU). "
        f"Izin Sesi Eksplosif: {'YA' if cns_res['cleared_for_explosive_training'] else 'TIDAK'}. "
    )
    if mol_res.detected:
        verdict += f"Interferensi AMPK/mTORC1 ({mol_res.severity}): {mol_res.recommendation} "
    if joint_alerts:
        verdict += f"Terdeteksi {len(joint_alerts)} benturan biomekanis sendi ({', '.join(a.joint for a in joint_alerts)}). "
    verdict += f"Preskripsi jendela pemulihan sistemik: {int(rec_hours)} jam."

    return HybridArbitrationResponse(
        total_cns_drain_score=cns_res["total_cns_drain_score"],
        cns_status=cns_res["status"],
        molecular_interference=mol_res,
        joint_collisions=joint_alerts,
        cleared_for_explosive_training=cns_res["cleared_for_explosive_training"],
        recommended_rest_hours=rec_hours,
        coach_verdict=verdict,
    )


def dispatch_cabor_telemetry(ingress: CaborTelemetryIngressInput) -> Dict[str, Any]:
    """Unified Ingress: Routes any sport telemetry to its specialized physiological engine."""
    sp = ingress.sport_code.upper()
    data = ingress.payload

    if sp in ("SPORT_POWERLIFTING", "SPORT_WEIGHTLIFTING", "SPORT_CALISTHENICS", "SPORT_STRONGMAN", "SPORT_BODYBUILDING"):
        from python_engine.domain.physiology.strength_engine import evaluate_strength_session
        from python_engine.domain.physiology.models import StrengthSessionInput
        return evaluate_strength_session(StrengthSessionInput(sport_code=sp, **data)).model_dump()

    if sp in ("SPORT_BOXING", "SPORT_MMA", "SPORT_BJJ", "SPORT_PENCAK_SILAT", "SPORT_JUDO", "SPORT_MUAY_THAI"):
        from python_engine.domain.physiology.combat_engine import evaluate_combat_session
        from python_engine.domain.physiology.models import CombatSessionInput
        return evaluate_combat_session(CombatSessionInput(sport_code=sp, **data)).model_dump()

    if sp in ("SPORT_FOOTBALL", "SPORT_BASKETBALL", "SPORT_VOLLEYBALL", "SPORT_FUTSAL", "SPORT_RUGBY", "SPORT_FIELD_HOCKEY"):
        from python_engine.domain.physiology.team_engine import evaluate_team_session
        from python_engine.domain.physiology.models import TeamSessionInput
        return evaluate_team_session(TeamSessionInput(sport_code=sp, **data)).model_dump()

    if sp in ("SPORT_BADMINTON", "SPORT_TENNIS", "SPORT_TABLE_TENNIS", "SPORT_ARCHERY", "SPORT_SHOOTING"):
        from python_engine.domain.physiology.racquet_precision_engine import evaluate_racquet_precision_session
        from python_engine.domain.physiology.racquet_models import RacquetPrecisionSessionInput
        return evaluate_racquet_precision_session(RacquetPrecisionSessionInput(sport_code=sp, **data)).model_dump()

    if sp in ("SPORT_FUNCTIONAL_FITNESS", "SPORT_CLIMBING", "SPORT_GYMNASTICS", "SPORT_SURFING", "SPORT_SKATEBOARDING"):
        from python_engine.domain.physiology.functional_extreme_engine import evaluate_functional_extreme_session
        from python_engine.domain.physiology.extreme_models import FunctionalExtremeSessionInput
        return evaluate_functional_extreme_session(FunctionalExtremeSessionInput(sport_code=sp, **data)).model_dump()

    # Endurance fallback (Running, Cycling, Swimming, Rowing, etc.)
    dur = float(data.get("duration_minutes", 60.0))
    hr_avg = float(data.get("avg_heart_rate", 145.0))
    rpe = float(data.get("rpe", 7.0))
    trimp = round(dur * (hr_avg / 190.0) * (rpe / 10.0) * 1.5, 2)
    return {
        "sport_code": sp,
        "engine": "endurance_banister_fallback",
        "duration_minutes": dur,
        "trimp_load": trimp,
        "verdict": f"Evaluasi Ketahanan ({sp}): TRIMP terestimasi {trimp} AU.",
    }
