import { NextRequest, NextResponse } from 'next/server';
import { connection } from 'next/server';
import {
  DEFAULT_USER_ID,
  getAthleteInjuries,
  createAthleteInjury,
  logHealthAuditTrail,
  getAuthoritativeHealthContext,
  saveAthleteReadiness,
} from '@/lib/db';
import { evaluateTrainingReadiness } from '@/lib/domain/readiness/readinessEngine';

/**
 * GET /api/athlete/injuries
 * Returns all recorded injuries for an athlete.
 */
export async function GET(req: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || DEFAULT_USER_ID;

    const injuries = await getAthleteInjuries(userId);
    return NextResponse.json({ success: true, injuries });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve injuries', message: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/athlete/injuries
 * Records a new injury history or symptom profile, logs an audit entry,
 * and deterministically updates sport training readiness.
 */
export async function POST(req: NextRequest) {
  await connection();
  try {
    const body = await req.json();
    const userId = body.user_id || DEFAULT_USER_ID;

    if (!body.body_region || !body.side || !body.injury_mechanism || !body.timeframe_description) {
      return NextResponse.json(
        { success: false, error: 'Missing mandatory fields: body_region, side, injury_mechanism, timeframe_description' },
        { status: 400 }
      );
    }

    const newInjury = await createAthleteInjury({
      user_id: userId,
      body_region: body.body_region,
      side: body.side,
      injury_mechanism: body.injury_mechanism,
      timeframe_description: body.timeframe_description,
      estimated_injury_date: body.estimated_injury_date || null,
      previous_symptoms: body.previous_symptoms || null,
      initial_severity: body.initial_severity || 'MODERATE',
      previous_swelling: Boolean(body.previous_swelling),
      previous_swelling_duration: body.previous_swelling_duration || null,
      medical_evaluation_status: body.medical_evaluation_status || 'PENDING_CLINICAL_ASSESSMENT',
      current_status: body.current_status || 'ACTIVE_SYMPTOMATIC',
      clinician_restrictions: body.clinician_restrictions || null,
      functional_limitations: body.functional_limitations || null,
      recovery_notes: body.recovery_notes || null,
    });

    // Re-evaluate readiness
    const freshContext = await getAuthoritativeHealthContext(userId);
    const newReadiness = evaluateTrainingReadiness(freshContext);
    const savedReadiness = await saveAthleteReadiness(newReadiness);

    // Audit log
    await logHealthAuditTrail({
      user_id: userId,
      entity_type: 'athlete_injuries',
      entity_id: newInjury.id,
      action: 'CREATE',
      state_after: newInjury,
      modified_by: 'ATHLETE_PORTAL',
    });

    return NextResponse.json({
      success: true,
      injury: newInjury,
      updatedReadiness: savedReadiness,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to record injury', message: err.message },
      { status: 500 }
    );
  }
}
