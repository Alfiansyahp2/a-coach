import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { DEFAULT_USER_ID, getAthleteEquipment, upsertEquipment } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || DEFAULT_USER_ID;
    const sportType = searchParams.get("sportType") || undefined;

    const equipment = await getAthleteEquipment(userId, sportType);

    return NextResponse.json({
      success: true,
      equipment,
    });
  } catch (err: any) {
    console.error("Error fetching athlete equipment:", err);
    return NextResponse.json(
      { error: "Failed to fetch equipment", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await connection();
  try {
    const body = await req.json();
    const userId = body.user_id || DEFAULT_USER_ID;

    if (!body.name || !body.sport_type || !body.gear_type) {
      return NextResponse.json(
        { error: "Nama, cabang olahraga, dan tipe perlengkapan wajib diisi" },
        { status: 400 }
      );
    }

    const saved = await upsertEquipment(userId, {
      id: body.id || undefined,
      sport_type: body.sport_type,
      name: body.name,
      brand: body.brand || "",
      model: body.model || "",
      accumulated_distance_meters: body.accumulated_distance_meters != null ? Number(body.accumulated_distance_meters) : 0,
      max_recommended_distance_meters: body.max_recommended_distance_meters != null ? Number(body.max_recommended_distance_meters) : 800000,
      gear_type: body.gear_type,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      is_retired: body.is_retired !== undefined ? Boolean(body.is_retired) : false,
      notes: body.notes || "",
    });

    revalidatePath("/profile");
    revalidatePath("/health");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      equipment: saved,
    });
  } catch (err: any) {
    console.error("Error upserting athlete equipment:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan perlengkapan atlet", message: err.message },
      { status: 500 }
    );
  }
}

