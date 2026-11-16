/**
 * Unified HTTP client connecting Next.js Gateway to the Python Sports Science & Telemetry Engine.
 * Implements Option A: FastAPI Micro-Engine architecture.
 */

import { Activity, ScheduledWorkout } from "@/types";
import { WeeklyStreakResult, calculateWeeklyStreak as fallbackCalculateWeeklyStreak } from "@/lib/domain/streak/streakEngine";

const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || "http://127.0.0.1:8000";

export async function checkPythonEngineHealth(): Promise<{ healthy: boolean; version?: string; error?: string }> {
  try {
    const res = await fetch(`${PYTHON_ENGINE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      return { healthy: true, version: data.version };
    }
    return { healthy: false, error: `HTTP ${res.status}` };
  } catch (err: any) {
    return { healthy: false, error: err.message || "Engine unreachable" };
  }
}

/**
 * Calculates athletic streak and thermodynamic flame stages via Python Engine.
 * Falls back gracefully to local deterministic math if the engine is offline.
 */
export async function computeStreakViaPython(
  activities: Activity[] = [],
  workouts: ScheduledWorkout[] = [],
  referenceDate?: Date | string
): Promise<WeeklyStreakResult> {
  const refDateStr =
    referenceDate instanceof Date
      ? referenceDate.toISOString()
      : typeof referenceDate === "string"
      ? referenceDate
      : new Date().toISOString();

  try {
    const payload = {
      activities: activities.map((a) => ({
        id: a.id,
        start_date: typeof a.start_date === "string" ? a.start_date : new Date(a.start_date).toISOString(),
        sport_type: a.sport_type,
        distance_meters: a.distance_meters,
        moving_time_seconds: a.moving_time_seconds,
      })),
      workouts: workouts.map((w) => ({
        id: w.id,
        status: w.status,
        scheduled_date: typeof w.scheduled_date === "string" ? w.scheduled_date : new Date(w.scheduled_date).toISOString(),
        workout_category: w.workout_category,
      })),
      reference_date: refDateStr,
    };

    const res = await fetch(`${PYTHON_ENGINE_URL}/calculate/streak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
      // Server-side cache bypass for real-time telemetry
      cache: "no-store",
    });

    if (res.ok) {
      const result = await res.json();
      return result as WeeklyStreakResult;
    }

    console.warn(`[PythonEngine] HTTP ${res.status} on /calculate/streak, using local fallback.`);
  } catch (err: any) {
    // Graceful offline fallback during localized Next.js standalone testing
    console.warn(`[PythonEngine] Connection notice: ${err.message || "Offline"}. Using local fallback.`);
  }

  // Graceful deterministic fallback
  const refDateObj = typeof referenceDate === "string" ? new Date(referenceDate) : referenceDate || new Date();
  return fallbackCalculateWeeklyStreak(activities, workouts, refDateObj);
}

