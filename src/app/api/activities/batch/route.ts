import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import { batchUpdateActivities, DEFAULT_USER_ID } from "@/lib/db";

/**
 * POST /api/activities/batch
 * Performs atomic batch updates on multiple activities (e.g. bulk sport_type reassignment).
 */
export async function POST(req: NextRequest) {
  await connection();
  try {
    const body = await req.json();
    const ids = Array.isArray(body.activity_ids) ? body.activity_ids : [];
    const updates = body.updates || {};

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "activity_ids array is required and cannot be empty" },
        { status: 400 }
      );
    }

    const updatedCount = await batchUpdateActivities(ids, updates, DEFAULT_USER_ID);

    revalidatePath("/activities");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} activities`,
      updatedCount,
    });
  } catch (err: any) {
    console.error("Batch update error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to perform batch update", message: err.message },
      { status: 500 }
    );
  }
}

