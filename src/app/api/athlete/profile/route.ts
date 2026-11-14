import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import {
  getUser,
  getAthleteProfile,
  getAuthoritativeHealthContext,
  getAthleteEquipment,
  updateUserProfile,
  recordMedicalProcedureAndAssessment,
} from "@/lib/db";
import { calculatePhysiologicalCapacities } from "@/lib/domain/physiology/heartRateZones";
import { revalidatePath } from "next/cache";
import { verifyUserAuthorization } from "@/lib/auth/authGuard";

export async function GET(req: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(req.url);
    const auth = verifyUserAuthorization(req, searchParams.get("userId"));
    if (!auth.authorized) return auth.response!;
    const userId = auth.userId;

    const [user, profile, healthContext, equipment] = await Promise.all([
      getUser(userId),
      getAthleteProfile(userId),
      getAuthoritativeHealthContext(userId),
      getAthleteEquipment(userId),
    ]);

    const capacities = calculatePhysiologicalCapacities({
      age: profile?.age ?? 22,
      height_cm: user?.height_cm ?? profile?.height_cm ?? 170.0,
      weight_kg: user?.weight_kg ?? profile?.weight_kg ?? 65.0,
      resting_heart_rate: user?.resting_heart_rate ?? profile?.resting_heart_rate ?? 68,
      max_heart_rate: user?.max_heart_rate ?? 188,
      ftp_watts: profile?.physiological_measurements?.ftp_watts ?? null,
      vo2_max: profile?.physiological_measurements?.vo2_max ?? null,
      running_threshold_pace_sec: profile?.physiological_measurements?.running_threshold_pace_sec ?? null,
    });

    return NextResponse.json({
      success: true,
      user,
      profile,
      healthContext,
      equipment,
      capacities,
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
  await connection();
  try {
    const body = await req.json();
    const auth = verifyUserAuthorization(req, body.user_id);
    if (!auth.authorized) return auth.response!;
    const userId = auth.userId;

    // 1. Update basic biometric & athletic profile
    const profileResult = await updateUserProfile(userId, {
      name: body.name,
      avatar_url: body.avatar_url,
      age: body.age != null ? Number(body.age) : undefined,
      height_cm: body.height_cm != null ? Number(body.height_cm) : undefined,
      weight_kg: body.weight_kg != null ? Number(body.weight_kg) : undefined,
      resting_heart_rate: body.resting_heart_rate != null ? Number(body.resting_heart_rate) : undefined,
      max_heart_rate: body.max_heart_rate != null ? Number(body.max_heart_rate) : undefined,
      training_days_per_week: body.training_days_per_week != null ? Number(body.training_days_per_week) : undefined,
      preferred_sports: body.preferred_sports,
      training_experience: body.training_experience,
      performance_objectives: body.performance_objectives,
      physiological_measurements: body.physiological_measurements,
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
    revalidatePath("/profile");
    revalidatePath("/");
    revalidatePath("/health");
    revalidatePath("/training");
    revalidatePath("/activities");

    const capacities = calculatePhysiologicalCapacities({
      age: profileResult.profile.age,
      height_cm: profileResult.user.height_cm,
      weight_kg: profileResult.user.weight_kg,
      resting_heart_rate: profileResult.user.resting_heart_rate,
      max_heart_rate: profileResult.user.max_heart_rate,
      ftp_watts: profileResult.profile.physiological_measurements?.ftp_watts ?? null,
      vo2_max: profileResult.profile.physiological_measurements?.vo2_max ?? null,
      running_threshold_pace_sec: profileResult.profile.physiological_measurements?.running_threshold_pace_sec ?? null,
    });

    return NextResponse.json({
      success: true,
      user: profileResult.user,
      profile: profileResult.profile,
      capacities,
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
