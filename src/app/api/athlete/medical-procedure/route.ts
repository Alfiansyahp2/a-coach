import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_USER_ID, recordMedicalProcedureAndAssessment } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.user_id || DEFAULT_USER_ID;

    const result = await recordMedicalProcedureAndAssessment(userId, {
      assessment_date: body.assessment_date || body.procedure_date || new Date().toISOString().split("T")[0],
      healthcare_provider_type: body.healthcare_provider_type || body.provider_type || "Physiotherapist",
      provider_name: body.provider_name || null,
      clinical_findings: body.clinical_findings || "Pemeriksaan klinis berkala & monitoring toleransi sendi.",
      confirmed_diagnosis: body.confirmed_diagnosis || null,
      imaging_summary: body.imaging_summary || null,
      clinician_restrictions: body.clearance_granted
        ? "CLEARED_FOR_TRAINING"
        : (body.clinician_restrictions || "IMPACT_RESTRICTED"),
      rehabilitation_protocol: body.rehabilitation_protocol || body.procedure_details || null,
      return_to_sport_criteria: body.return_to_sport_criteria || null,
      follow_up_date: body.follow_up_date || null,
      clearance_granted: Boolean(body.clearance_granted),
      ankle_status: body.ankle_status || undefined,
      knee_status: body.knee_status || undefined,
    });

    revalidatePath("/");
    revalidatePath("/health");
    revalidatePath("/training");

    return NextResponse.json({
      success: true,
      assessment: result.assessment,
      readiness: result.readiness,
    });
  } catch (err: any) {
    console.error("Error recording medical procedure:", err);
    return NextResponse.json(
      { error: "Gagal mencatat prosedur medis", message: err.message },
      { status: 500 }
    );
  }
}

