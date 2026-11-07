import { NextRequest, NextResponse } from 'next/server';
import { connection } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  DEFAULT_USER_ID,
  getAthleteInjuryById,
  updateAthleteInjury,
  logHealthAuditTrail,
  getAuthoritativeHealthContext,
  saveAthleteReadiness,
} from '@/lib/db';
import { evaluateTrainingReadiness } from '@/lib/readinessEngine';

/**
 * GET /api/athlete/injuries/[id]
 * Retrieves a specific injury dossier by ID.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connection();
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || DEFAULT_USER_ID;

    const injury = await getAthleteInjuryById(id, userId);
    if (!injury) {
      return NextResponse.json(
        { success: false, error: 'Injury dossier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, injury });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve injury dossier', message: err.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/athlete/injuries/[id]
 * Updates injury status (e.g., transition from ACTIVE_SYMPTOMATIC to ASYMPTOMATIC_RECOVERED),
 * clinical restrictions, or recovery notes, and automatically recalibrates training readiness.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connection();
  try {
    const { id } = await params;
    const body = await req.json();
    const userId = body.user_id || DEFAULT_USER_ID;

    const existing = await getAthleteInjuryById(id, userId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Injury dossier not found' },
        { status: 404 }
      );
    }

    const updates: {
      current_status?: any;
      recovery_notes?: string;
      clinician_restrictions?: string;
      functional_limitations?: string;
      medical_evaluation_status?: any;
    } = {};

    if (body.current_status) updates.current_status = body.current_status;
    if (body.recovery_notes !== undefined) updates.recovery_notes = body.recovery_notes;
    if (body.clinician_restrictions !== undefined) updates.clinician_restrictions = body.clinician_restrictions;
    if (body.functional_limitations !== undefined) updates.functional_limitations = body.functional_limitations;
    if (body.medical_evaluation_status) updates.medical_evaluation_status = body.medical_evaluation_status;

    const updatedInjury = await updateAthleteInjury(id, userId, updates);
    if (!updatedInjury) {
      return NextResponse.json(
        { success: false, error: 'Failed to update injury dossier' },
        { status: 500 }
      );
    }

    // Re-evaluate and persist updated training readiness deterministically
    const freshContext = await getAuthoritativeHealthContext(userId);
    const newReadiness = evaluateTrainingReadiness(freshContext);
    const savedReadiness = await saveAthleteReadiness(newReadiness);

    // Record change in audit trail
    await logHealthAuditTrail({
      user_id: userId,
      entity_type: 'athlete_injuries',
      entity_id: id,
      action: 'UPDATE',
      state_before: existing,
      state_after: updatedInjury,
      modified_by: 'ATHLETE_PORTAL',
    });

    revalidatePath('/health');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      injury: updatedInjury,
      updatedReadiness: savedReadiness,
    });
  } catch (err: any) {
    console.error('Error updating injury dossier:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update injury dossier', message: err.message },
      { status: 500 }
    );
  }
}

