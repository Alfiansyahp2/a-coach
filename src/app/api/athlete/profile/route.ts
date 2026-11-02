import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_USER_ID,
  getUser,
  getAthleteProfile,
  getAuthoritativeHealthContext,
  updateUserProfile,
  recordMedicalProcedureAndAssessment,
} from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || DEFAULT_USER_ID;

    const [user, profile, healthContext] = await Promise.all([
      getUser(userId),
      getAthleteProfile(userId),
      getAuthoritativeHealthContext(userId),
    ]);

    return NextResponse.json({
      success: true,
      user,
      profile,
      healthContext,
    });
  } catch (err: any) {
    console.error("Error fetching athlete profile:", err);
    return NextResponse.json(
      { error: "Failed to fetch athlete profile", message: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.user_id || DEFAULT_USER_ID;

    // 1. Update basic biometric profile
    const profileResult = await updateUserProfile(userId, {
      name: body.name,
      age: body.age != null ? Number(body.age) : undefined,
      height_cm: body.height_cm != null ? Number(body.height_cm) : undefined,
      weight_kg: body.weight_kg != null ? Number(body.weight_kg) : undefined,
      resting_heart_rate: body.resting_heart_rate != null ? Number(body.resting_heart_rate) : undefined,
      training_days_per_week: body.training_days_per_week != null ? Number(body.training_days_per_week) : undefined,
    });

    // 2. If medical procedure / assessment data is present
    let medicalResult: any = null;
    if (body.has_medical_procedure || body.procedure_details || body.clinical_findings || body.clearance_granted) {
      medicalResult = await recordMedicalProcedureAndAssessment(userId, {
        assessment_date: body.procedure_date || new Date().toISOString().split("T")[0],
        healthcare_provider_type: body.provider_type || "Physiotherapist",
        provider_name: body.provider_name || null,
        clinical_findings: body.clinical_findings || "Prosedur fisioterapi dan evaluasi berkala sendi.",
        confirmed_diagnosis: body.confirmed_diagnosis || null,
        imaging_summary: body.imaging_summary || null,
        clinician_restrictions: body.clearance_granted ? "CLEARED_FOR_TRAINING" : (body.clinician_restrictions || "IMPACT_RESTRICTED"),
        rehabilitation_protocol: body.procedure_details || body.rehabilitation_protocol || null,
        return_to_sport_criteria: body.return_to_sport_criteria || null,
        follow_up_date: body.follow_up_date || null,
        clearance_granted: Boolean(body.clearance_granted),
        ankle_status: body.ankle_status || undefined,
        knee_status: body.knee_status || undefined,
      });
    }

    // Revalidate paths for instant client and SSR update
    revalidatePath("/");
    revalidatePath("/health");
    revalidatePath("/training");
    revalidatePath("/activities");

    return NextResponse.json({
      success: true,
      user: profileResult.user,
      profile: profileResult.profile,
      medicalAssessment: medicalResult?.assessment || null,
      readiness: medicalResult?.readiness || null,
    });
  } catch (err: any) {
    console.error("Error updating athlete profile and medical procedures:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui profil dan prosedur kesehatan", message: err.message },
      { status: 500 }
    );
  }
}

