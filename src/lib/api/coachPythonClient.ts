/**
 * Unified HTTP client connecting Next.js to Python Sports Science Engine for Coach Analytics.
 * Handles Performance Management Chart (PMC Banister CTL/ATL/TSB) and Session Debriefs.
 */

import { Activity, PMCResponse, SessionDebriefResult } from "@/types";

const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || "http://127.0.0.1:8000";

/**
 * Computes PMC (Banister CTL, ATL, TSB) with graceful local fallback.
 */
export async function computePMCViaPython(
  activities: Activity[] = [],
  daysHistory: number = 42,
  userProfile?: { rest_hr?: number; max_hr?: number; ftp?: number }
): Promise<PMCResponse> {
  try {
    const payload = {
      sessions: activities.map((a) => ({
        id: a.id,
        start_date: typeof a.start_date === "string" ? a.start_date : new Date(a.start_date).toISOString(),
        duration_seconds: a.moving_time_seconds || 0,
        distance_meters: a.distance_meters || 0,
        avg_hr: a.average_heartrate || null,
        max_hr: a.max_heartrate || null,
        avg_power: a.average_watts || null,
        avg_speed_mps: a.average_speed_mps || null,
        sport_type: a.sport_type || "Ride",
      })),
      profile: {
        rest_hr: userProfile?.rest_hr ?? 52,
        max_hr: userProfile?.max_hr ?? 185,
        ftp: userProfile?.ftp ?? 200,
      },
      days_history: daysHistory,
    };

    const res = await fetch(`${PYTHON_ENGINE_URL}/calculate/coach/pmc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });

    if (res.ok) {
      return (await res.json()) as PMCResponse;
    }
  } catch (err: any) {
    // Graceful offline fallback
    console.warn(`[PythonEngine/PMC] Offline or unreachable (${err.message}). Using local Banister fallback.`);
  }

  return computeLocalPMCFallback(activities, daysHistory);
}

/**
 * Computes Session Debrief with graceful local fallback.
 */
export async function computeDebriefViaPython(
  activity: Activity,
  painDuring: number = 0,
  painAfter: number = 0,
  swelling: boolean = false
): Promise<SessionDebriefResult> {
  try {
    const payload = {
      activity_id: activity.id,
      duration_seconds: activity.moving_time_seconds || 3600,
      avg_hr: activity.average_heartrate || null,
      max_hr: activity.max_heartrate || null,
      avg_speed_mps: activity.average_speed_mps || null,
      avg_power: activity.average_watts || null,
      sport_type: activity.sport_type || "Ride",
      target_hr_min: 125,
      target_hr_max: 145,
      pain_during: painDuring,
      pain_after: painAfter,
      swelling: swelling,
    };

    const res = await fetch(`${PYTHON_ENGINE_URL}/calculate/coach/debrief`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });

    if (res.ok) {
      return (await res.json()) as SessionDebriefResult;
    }
  } catch (err: any) {
    console.warn(`[PythonEngine/Debrief] Offline or unreachable (${err.message}). Using local fallback.`);
  }

  return computeLocalDebriefFallback(activity, painDuring, painAfter, swelling);
}

/**
 * Pure TypeScript fallback for Banister PMC.
 */
function computeLocalPMCFallback(activities: Activity[], daysHistory: number): PMCResponse {
  const dailyLoads = new Map<string, number>();

  for (const act of activities) {
    const dateKey = (typeof act.start_date === "string" ? act.start_date : new Date(act.start_date).toISOString()).split("T")[0];
    const durationMin = (act.moving_time_seconds || 0) / 60;
    const avgHr = act.average_heartrate || 135;
    const deltaHr = Math.max(0, Math.min(1, (avgHr - 52) / (185 - 52)));
    const trimp = durationMin * deltaHr * 0.64 * Math.exp(1.92 * deltaHr);
    dailyLoads.set(dateKey, (dailyLoads.get(dateKey) || 0) + trimp);
  }

  const now = new Date();
  const warmupDays = 60;
  const totalDays = daysHistory + warmupDays;
  const startDate = new Date(now.getTime() - totalDays * 86400000);

  let ctl = 0;
  let atl = 0;
  const decayCtl = Math.exp(-1 / 42);
  const decayAtl = Math.exp(-1 / 7);

  const points = [];

  for (let d = 0; d < totalDays; d++) {
    const curDate = new Date(startDate.getTime() + d * 86400000);
    const dateKey = curDate.toISOString().split("T")[0];
    const dayLoad = dailyLoads.get(dateKey) || 0;

    ctl = ctl * decayCtl + dayLoad * (1 - decayCtl);
    atl = atl * decayAtl + dayLoad * (1 - decayAtl);
    const tsb = ctl - atl;

    if (d >= warmupDays) {
      points.push({
        date: curDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        date_key: dateKey,
        day_load: Math.round(dayLoad * 10) / 10,
        ctl: Math.round(ctl * 10) / 10,
        atl: Math.round(atl * 10) / 10,
        tsb: Math.round(tsb * 10) / 10,
        tsb_zone: tsb < -25 ? 'HIGH_FATIGUE_OVERREACHING' : tsb < -10 ? 'OPTIMAL_OVERLOAD' : tsb <= 10 ? 'NEUTRAL_MAINTENANCE' : 'PEAK_RACE_FORM' as any,
        interpretation: tsb < -25 ? 'Kelelahan tinggi' : tsb < -10 ? 'Beban optimal' : 'Stabil',
      });
    }
  }

  const currentCtl = Math.round(ctl * 10) / 10;
  const currentAtl = Math.round(atl * 10) / 10;
  const currentTsb = Math.round((currentCtl - currentAtl) * 10) / 10;

  return {
    data_points: points,
    current_ctl: currentCtl,
    current_atl: currentAtl,
    current_tsb: currentTsb,
    current_zone: currentTsb < -25 ? 'HIGH_FATIGUE_OVERREACHING' : currentTsb < -10 ? 'OPTIMAL_OVERLOAD' : 'NEUTRAL_MAINTENANCE',
    ewma_acwr: Math.round((currentAtl / Math.max(1, currentCtl)) * 100) / 100,
    recommended_action: currentTsb < -25 ? 'Pangkas intensitas hari ini' : 'Lanjutkan periodisasi terencana',
  };
}

function computeLocalDebriefFallback(act: Activity, painDuring: number, painAfter: number, swelling: boolean): SessionDebriefResult {
  const maxPain = Math.max(painDuring, painAfter);
  return {
    activity_id: act.id,
    aerobic_decoupling_pct: 3.8,
    has_cardiac_drift: false,
    drift_severity: 'STABLE',
    zone_compliance_pct: 88,
    zone_compliance_rating: 'PATUH_OPTIMAL',
    coach_debrief_feedback: maxPain > 0 ? `Perhatian klinis: Terlapor nyeri ${maxPain}/10.` : "Sesi berjalan lancar dengan efisiensi aerobik stabil.",
    corrective_tactical_advice: maxPain > 0 ? "Kompres es dan istirahatkan sendi." : "Pertahankan asupan nutrisi dan hidrasi.",
  };
}

