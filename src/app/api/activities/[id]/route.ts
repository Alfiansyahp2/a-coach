import { NextRequest, NextResponse } from "next/server";
import { updateActivity, getActivityById, DEFAULT_USER_ID } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activity = await getActivityById(id, DEFAULT_USER_ID);

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ activity });
  } catch (err: any) {
    console.error("Error fetching activity:", err);
    return NextResponse.json(
      { error: "Failed to fetch activity", message: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updates: {
      name?: string;
      sport_type?: string;
      start_date?: string;
      description?: string;
      distance_meters?: number;
      moving_time_seconds?: number;
      elevation_gain_meters?: number;
    } = {};

    if (typeof body.name === "string" && body.name.trim().length > 0) {
      updates.name = body.name.trim();
    }
    if (typeof body.sport_type === "string" && body.sport_type.trim().length > 0) {
      updates.sport_type = body.sport_type.trim();
    }
    if (
      typeof body.start_date === "string" &&
      !isNaN(new Date(body.start_date).getTime())
    ) {
      updates.start_date = new Date(body.start_date).toISOString();
    }
    if (typeof body.description === "string") {
      updates.description = body.description.trim();
    }
    if (typeof body.distance_meters === "number" && !isNaN(body.distance_meters)) {
      updates.distance_meters = body.distance_meters;
    }
    if (typeof body.moving_time_seconds === "number" && !isNaN(body.moving_time_seconds)) {
      updates.moving_time_seconds = body.moving_time_seconds;
    }
    if (typeof body.elevation_gain_meters === "number" && !isNaN(body.elevation_gain_meters)) {
      updates.elevation_gain_meters = body.elevation_gain_meters;
    }

    const updated = await updateActivity(id, DEFAULT_USER_ID, updates);

    if (!updated) {
      return NextResponse.json(
        { error: "Activity not found or update failed" },
        { status: 404 }
      );
    }

    // Invalidate Next.js cache so SSR detail and dashboard reflect changes immediately
    revalidatePath(`/activities/${id}`);
    revalidatePath("/");

    return NextResponse.json({ success: true, activity: updated });
  } catch (err: any) {
    console.error("Error updating activity:", err);
    return NextResponse.json(
      { error: "Failed to update activity", message: err.message },
      { status: 500 }
    );
  }
}
