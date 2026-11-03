import { NextRequest, NextResponse } from "next/server";
import { getActivities, createManualActivity, DEFAULT_USER_ID } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 50;
    const sportType = searchParams.get("sport_type") || undefined;

    const activities = await getActivities(DEFAULT_USER_ID, {
      limit,
      sportType,
    });

    return NextResponse.json({ success: true, activities });
  } catch (err: any) {
    console.error("Error fetching activities:", err);
    return NextResponse.json(
      { error: "Failed to fetch activities", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.sport_type) {
      return NextResponse.json(
        { error: "Nama aktivitas dan jenis olahraga wajib diisi" },
        { status: 400 }
      );
    }

    const result = await createManualActivity(DEFAULT_USER_ID, {
      name: body.name.trim(),
      sport_type: body.sport_type.trim(),
      start_date: body.start_date || new Date().toISOString(),
      distance_meters: body.distance_meters != null ? Number(body.distance_meters) : 0,
      moving_time_seconds: body.moving_time_seconds != null ? Number(body.moving_time_seconds) : 0,
      elapsed_time_seconds: body.elapsed_time_seconds != null ? Number(body.elapsed_time_seconds) : Number(body.moving_time_seconds || 0),
      elevation_gain_meters: body.elevation_gain_meters != null ? Number(body.elevation_gain_meters) : 0,
      average_speed_mps: body.average_speed_mps != null ? Number(body.average_speed_mps) : undefined,
      max_speed_mps: body.max_speed_mps != null ? Number(body.max_speed_mps) : undefined,
      average_heartrate: body.average_heartrate != null ? Number(body.average_heartrate) : undefined,
      max_heartrate: body.max_heartrate != null ? Number(body.max_heartrate) : undefined,
      average_cadence: body.average_cadence != null ? Number(body.average_cadence) : undefined,
      average_watts: body.average_watts != null ? Number(body.average_watts) : undefined,
      calories: body.calories != null ? Number(body.calories) : undefined,
      description: body.description?.trim() || null,
      workout_id: body.workout_id || undefined,
      rpe_score: body.rpe_score != null ? Number(body.rpe_score) : undefined,
      pain_during_activity: body.pain_during_activity != null ? Number(body.pain_during_activity) : undefined,
      pain_after_activity: body.pain_after_activity != null ? Number(body.pain_after_activity) : undefined,
      pain_next_day: body.pain_next_day != null ? Number(body.pain_next_day) : undefined,
      swelling_observed: body.swelling_observed != null ? Boolean(body.swelling_observed) : undefined,
      instability_observed: body.instability_observed != null ? Boolean(body.instability_observed) : undefined,
      athlete_comments: body.athlete_comments?.trim() || undefined,
    });

    // Invalidate caches
    revalidatePath("/");
    revalidatePath("/activities");
    revalidatePath("/training");

    return NextResponse.json({
      success: true,
      activity: result.activity,
      matchedWorkout: result.matchedWorkout,
      match: result.match,
      trainingResponse: result.trainingResponse,
    });
  } catch (err: any) {
    console.error("Error creating manual activity:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan aktivitas manual", message: err.message },
      { status: 500 }
    );
  }
}
