import { pgPool, DEFAULT_USER_ID } from '../client';
import { getAthleteAvailability } from '../availabilityRepo';
import { getAthleteEquipment } from '../equipmentRepo';
import { getTodayWellness } from '../wellnessRepo';
import {
  AthleteMedicalAssessment,
  AthleteTrainingReadiness,
  AuthoritativeAthleteHealthContext,
  MedicalEvaluationStatus,
} from '@/types';
import { evaluateTrainingReadiness } from '@/lib/readinessEngine';

import { getAthleteProfile, upsertAthleteProfile } from './athleteProfileRepo';
import { getAthleteInjuries, createAthleteInjury } from './injuryRepo';
import { getAthletePainLogs, createAthletePainLog } from './painLogRepo';
import { getAthleteTrainingResponses, upsertAthleteTrainingResponse } from './trainingResponseRepo';
import {
  getAthleteMedicalAssessments,
  createAthleteMedicalAssessment,
  getLatestAthleteReadiness,
  saveAthleteReadiness,
} from './assessmentRepo';
import { logHealthAuditTrail } from './healthAuditRepo';

export * from './athleteProfileRepo';
export * from './injuryRepo';
export * from './painLogRepo';
export * from './trainingResponseRepo';
export * from './assessmentRepo';
export * from './healthAuditRepo';

export async function getAuthoritativeHealthContext(
  userId: string = DEFAULT_USER_ID
): Promise<AuthoritativeAthleteHealthContext> {
  const [profile, injuries, painLogs, responses, assessments, readiness, availability, equipment, todayWellness] =
    await Promise.all([
      getAthleteProfile(userId),
      getAthleteInjuries(userId),
      getAthletePainLogs(userId, 15),
      getAthleteTrainingResponses(userId, 15),
      getAthleteMedicalAssessments(userId),
      getLatestAthleteReadiness(userId),
      getAthleteAvailability(userId),
      getAthleteEquipment(userId),
      getTodayWellness(userId),
    ]);

  const clinicianRestrictions: string[] = [];
  for (const m of assessments) {
    if (
      m.verification_status === 'CLINICIAN_VERIFIED' &&
      m.clinician_restrictions &&
      m.clinician_restrictions.trim().length > 0
    ) {
      clinicianRestrictions.push(m.clinician_restrictions.trim());
    }
  }
  for (const inj of injuries) {
    if (inj.clinician_restrictions && inj.clinician_restrictions.trim().length > 0) {
      clinicianRestrictions.push(inj.clinician_restrictions.trim());
    }
  }

  return {
    profile,
    injuries,
    recentPainLogs: painLogs,
    recentResponses: responses,
    medicalAssessments: assessments,
    latestReadiness: readiness,
    clinicianRestrictions,
    availability,
    equipment,
    todayWellness,
  };
}

export interface RecordMedicalProcedureParams {
  injury_id?: string | null;
  assessment_date: string;
  healthcare_provider_type: string;
  provider_name?: string | null;
  clinical_findings: string;
  confirmed_diagnosis?: string | null;
  imaging_summary?: string | null;
  clinician_restrictions?: string | null;
  rehabilitation_protocol?: string | null;
  return_to_sport_criteria?: string | null;
  follow_up_date?: string | null;
  clearance_granted?: boolean;
  ankle_status?: MedicalEvaluationStatus;
  knee_status?: MedicalEvaluationStatus;
}

export async function recordMedicalProcedureAndAssessment(
  userId: string = DEFAULT_USER_ID,
  params: RecordMedicalProcedureParams
): Promise<{
  assessment: AthleteMedicalAssessment;
  readiness: AthleteTrainingReadiness | null;
}> {
  const restrictions = params.clearance_granted
    ? 'CLEARED_FOR_TRAINING'
    : params.clinician_restrictions || '';

  const assessment = await createAthleteMedicalAssessment({
    user_id: userId,
    injury_id: params.injury_id || null,
    assessment_date: params.assessment_date || new Date().toISOString().split('T')[0],
    healthcare_provider_type: params.healthcare_provider_type || 'Physiotherapist',
    provider_name: params.provider_name || null,
    clinical_findings: params.clinical_findings || 'Prosedur kesehatan dan evaluasi klinis berkala.',
    confirmed_diagnosis: params.confirmed_diagnosis || null,
    imaging_summary: params.imaging_summary || null,
    clinician_restrictions: restrictions,
    rehabilitation_protocol: params.rehabilitation_protocol || null,
    return_to_sport_criteria: params.return_to_sport_criteria || null,
    follow_up_date: params.follow_up_date || null,
    verification_status: params.clearance_granted ? 'CLINICIAN_VERIFIED' : 'ATHLETE_ENTERED',
  });

  // Update injury evaluation status if provided
  if (pgPool) {
    if (params.ankle_status) {
      await pgPool.query(
        `UPDATE athlete_injuries SET medical_evaluation_status = $1, updated_at = NOW()
         WHERE user_id = $2 AND body_region ILIKE '%Ankle%'`,
        [params.ankle_status, userId]
      );
    }
    if (params.knee_status) {
      await pgPool.query(
        `UPDATE athlete_injuries SET medical_evaluation_status = $1, updated_at = NOW()
         WHERE user_id = $2 AND body_region ILIKE '%Knee%'`,
        [params.knee_status, userId]
      );
    }
  }

  // Deterministically evaluate readiness with updated context
  let readiness: AthleteTrainingReadiness | null = null;
  try {
    const context = await getAuthoritativeHealthContext(userId);
    const computed = evaluateTrainingReadiness(context);
    readiness = await saveAthleteReadiness(computed);
  } catch (err) {
    console.warn('Failed to re-evaluate readiness after medical assessment:', err);
  }

  await logHealthAuditTrail({
    user_id: userId,
    entity_type: 'ATHLETE_MEDICAL_ASSESSMENT',
    entity_id: assessment.id,
    action: 'CREATE',
    state_before: null,
    state_after: {
      provider: assessment.provider_name,
      procedure: assessment.rehabilitation_protocol,
      clearance_granted: Boolean(params.clearance_granted),
    },
    modified_by: 'ATHLETE_OR_CLINICIAN',
  });

  return { assessment, readiness };
}
