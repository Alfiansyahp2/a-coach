import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_USER_ID,
  upsertAthleteTrainingResponse,
  createAthletePainLog,
  getAuthoritativeHealthContext,
  saveAthleteReadiness,
  logHealthAuditTrail,
} from '@/lib/db';
import { evaluateTrainingReadiness } from '@/lib/domain/readiness/readinessEngine';

/**
 * POST /api/athlete/checkin
 * Records athlete post-activity symptoms (pain during/after/next-day, swelling, instability, RPE)
 * and triggers a deterministic recalculation of sport-specific training readiness.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.user_id || DEFAULT_USER_ID;

    if (!body.sport_type || body.distance_km === undefined || body.duration_seconds === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing mandatory fields: sport_type, distance_km, duration_seconds' },
        { status: 400 }
      );
    }

    // 1. Record Athlete Training Response
    const responseRecord = await upsertAthleteTrainingResponse({
      user_id: userId,
      activity_id: body.activity_id || null,
      strava_activity_id: body.strava_activity_id ? Number(body.strava_activity_id) : null,
      sport_type: body.sport_type,
      distance_km: Number(body.distance_km),
      duration_seconds: Number(body.duration_seconds),
      rpe_score: body.rpe_score !== undefined && body.rpe_score !== null ? Number(body.rpe_score) : null,
      pain_during_activity: body.pain_during_activity !== undefined && body.pain_during_activity !== null ? Number(body.pain_during_activity) : null,
      pain_after_activity: body.pain_after_activity !== undefined && body.pain_after_activity !== null ? Number(body.pain_after_activity) : null,
      pain_next_day: body.pain_next_day !== undefined && body.pain_next_day !== null ? Number(body.pain_next_day) : null,
      swelling_observed: Boolean(body.swelling_observed),
      instability_observed: Boolean(body.instability_observed),
      fatigue_response: body.fatigue_response || 'NORMAL',
      athlete_comments: body.athlete_comments || null,
      checkin_completed_at: new Date().toISOString(),
    });

    // 2. If pain or swelling is reported, create a dedicated pain log entry
    const maxPain = Math.max(
      body.pain_during_activity || 0,
      body.pain_after_activity || 0,
      body.pain_next_day || 0
    );

    if (maxPain > 0 || body.swelling_observed || body.instability_observed) {
      await createAthletePainLog({
        user_id: userId,
        injury_id: body.injury_id || null,
        body_region: body.body_region?.trim() || 'General / Unspecified Region',
        side: body.side?.trim().toUpperCase() || 'BILATERAL',
        pain_score: maxPain,
        pain_type: body.pain_type || 'ACHING',
        associated_activity: body.sport_type.toUpperCase(),
        pain_during_activity: body.pain_during_activity ?? null,
        pain_immediately_after: body.pain_after_activity ?? null,
        pain_24h_after: body.pain_next_day ?? null,
        swelling_present: Boolean(body.swelling_observed),
        joint_instability: Boolean(body.instability_observed),
        functional_limitations: body.functional_limitations || null,
        logged_at: new Date().toISOString(),
      });
    }

    // 3. Re-evaluate authoritative health context and compute fresh readiness
    const freshContext = await getAuthoritativeHealthContext(userId);
    const newReadiness = evaluateTrainingReadiness(freshContext);
    const savedReadiness = await saveAthleteReadiness(newReadiness);

    // 4. Audit Log
    await logHealthAuditTrail({
      user_id: userId,
      entity_type: 'athlete_training_responses',
      entity_id: responseRecord.id,
      action: 'CREATE',
      state_after: {
        response: responseRecord,
        readinessResult: savedReadiness,
      },
      modified_by: 'ATHLETE_CHECKIN',
    });

    return NextResponse.json({
      success: true,
      trainingResponse: responseRecord,
      updatedReadiness: savedReadiness,
    });
  } catch (err: any) {
    console.error('Error recording athlete checkin:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to record check-in', message: err.message },
      { status: 500 }
    );
  }
}

