export interface SubmitActivityPayload {
  name: string;
  sportType: string;
  startDate: string;
  numericDistanceKm: number;
  totalDurationSeconds: number;
  elevationMeters: string;
  description: string;
  workoutId?: string;
  // Post-Activity Check-in
  painDuring: number;
  painAfter: number;
  painNextDay: number;
  swellingObserved: boolean;
  instabilityObserved: boolean;
  rpeScore: number;
  subjectiveNotes: string;
  // New Injury Assessment
  hasNewInjury: boolean;
  injuryRegion: string;
  injurySide: 'RIGHT' | 'LEFT' | 'BILATERAL' | 'AXIAL';
  injurySeverity: 'MILD' | 'MODERATE' | 'SEVERE';
  injuryMechanism: string;
  injuryNotes: string;
}

export interface SubmitActivityResult {
  success: boolean;
  activity: any;
  matchedWorkout?: any;
  injury?: any;
  message: string;
}

export async function submitActivityWithCheckinAndInjury(
  params: SubmitActivityPayload
): Promise<SubmitActivityResult> {
  const distanceMeters = Math.round(params.numericDistanceKm * 1000);
  const avgSpeedMps =
    params.totalDurationSeconds > 0 && distanceMeters > 0
      ? Number((distanceMeters / params.totalDurationSeconds).toFixed(2))
      : 0;

  // 1. Submit activity record
  const actPayload = {
    name: params.name.trim(),
    sport_type: params.sportType,
    start_date: params.startDate ? new Date(params.startDate).toISOString() : new Date().toISOString(),
    distance_meters: distanceMeters,
    moving_time_seconds: params.totalDurationSeconds,
    elapsed_time_seconds: params.totalDurationSeconds,
    elevation_gain_meters: parseInt(params.elevationMeters || "0", 10) || 0,
    average_speed_mps: avgSpeedMps,
    description: params.description.trim() || undefined,
    workout_id: params.workoutId || undefined,
    rpe_score: params.rpeScore,
    pain_during_activity: params.painDuring,
    pain_after_activity: params.painAfter,
    pain_next_day: params.painNextDay,
    swelling_observed: params.swellingObserved,
    instability_observed: params.instabilityObserved,
    athlete_comments: params.subjectiveNotes.trim() || params.description.trim() || undefined,
  };

  const res = await fetch("/api/activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(actPayload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Gagal menyimpan aktivitas ke buku jurnal.");
  }

  // 2. Persist post-activity check-in & trigger clinical readiness re-evaluation
  try {
    await fetch("/api/athlete/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activity_id: data.activity.id,
        sport_type: params.sportType,
        distance_km: params.numericDistanceKm,
        duration_seconds: params.totalDurationSeconds,
        pain_during_activity: params.painDuring,
        pain_after_activity: params.painAfter,
        pain_next_day: params.painNextDay,
        swelling_observed: params.swellingObserved,
        instability_observed: params.instabilityObserved,
        rpe_score: params.rpeScore,
        athlete_comments: params.subjectiveNotes.trim() || undefined,
        body_region: params.hasNewInjury ? params.injuryRegion : undefined,
        side: params.hasNewInjury ? params.injurySide : undefined,
      }),
    });
  } catch (err) {
    console.warn("Gagal sinkronisasi data check-in pasca sesi:", err);
  }

  // 3. Register new injury if reported by athlete
  let createdInjury: any = null;
  if (params.hasNewInjury) {
    const injuryRes = await fetch("/api/athlete/injuries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body_region: params.injuryRegion || "Sendi / Area Kustom",
        side: params.injurySide || "RIGHT",
        injury_mechanism: params.injuryMechanism || "Insiden saat sesi latihan",
        timeframe_description: `Insiden sesi ${params.name.trim()} (${params.startDate ? params.startDate.split("T")[0] : "Hari Ini"})`,
        estimated_injury_date: params.startDate ? params.startDate.split("T")[0] : new Date().toISOString().split("T")[0],
        initial_severity: params.injurySeverity || "MODERATE",
        previous_swelling: params.swellingObserved,
        previous_symptoms: params.injuryNotes.trim() || `Keluhan akut pada ${params.injuryRegion}`,
        recovery_notes: params.injuryNotes.trim() || undefined,
        functional_limitations: params.instabilityObserved ? "Sendi teramati goyang / instabilitas" : undefined,
      }),
    });

    const injuryData = await injuryRes.json();
    if (injuryRes.ok && injuryData.success) {
      createdInjury = injuryData.injury;
    }
  }

  let message = "Catatan sesi berhasil ditulis ke buku jurnal telemetri!";
  if (params.hasNewInjury) {
    message = "Aktivitas, check-in, dan rekam insiden cedera baru berhasil didaftarkan ke rekam medis!";
  } else if (data.matchedWorkout) {
    message = `Sesi tercatat & tersinkronisasi ke: ${data.matchedWorkout.workout_category}!`;
  }

  return {
    success: true,
    activity: data.activity,
    matchedWorkout: data.matchedWorkout,
    injury: createdInjury,
    message,
  };
}

