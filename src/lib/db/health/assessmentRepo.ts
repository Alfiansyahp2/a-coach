import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID, formatDateOnly } from '../client';
import { AthleteMedicalAssessment, AthleteTrainingReadiness } from '@/types';

export async function getAthleteMedicalAssessments(
  userId: string = DEFAULT_USER_ID
): Promise<AthleteMedicalAssessment[]> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_medical_assessments WHERE user_id = $1 ORDER BY assessment_date DESC',
      [userId]
    );
    return res.rows.map((r) => ({
      ...r,
      assessment_date: formatDateOnly(r.assessment_date),
      follow_up_date: r.follow_up_date ? formatDateOnly(r.follow_up_date) : null,
    }));
  }

  const store = ensureLocalStore();
  return store.athlete_medical_assessments.filter((m) => m.user_id === userId);
}

export async function createAthleteMedicalAssessment(
  assessment: Omit<AthleteMedicalAssessment, 'id' | 'created_at'>
): Promise<AthleteMedicalAssessment> {
  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO athlete_medical_assessments (
        user_id, injury_id, assessment_date, healthcare_provider_type,
        provider_name, clinical_findings, confirmed_diagnosis,
        imaging_summary, clinician_restrictions, rehabilitation_protocol,
        return_to_sport_criteria, follow_up_date, verification_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        assessment.user_id,
        assessment.injury_id || null,
        assessment.assessment_date,
        assessment.healthcare_provider_type,
        assessment.provider_name || null,
        assessment.clinical_findings,
        assessment.confirmed_diagnosis || null,
        assessment.imaging_summary || null,
        assessment.clinician_restrictions,
        assessment.rehabilitation_protocol || null,
        assessment.return_to_sport_criteria || null,
        assessment.follow_up_date || null,
        assessment.verification_status || 'ATHLETE_ENTERED',
      ]
    );
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const record: AthleteMedicalAssessment = {
    ...assessment,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  store.athlete_medical_assessments.unshift(record);
  saveLocalStore(store);
  return record;
}

export async function getLatestAthleteReadiness(
  userId: string = DEFAULT_USER_ID
): Promise<AthleteTrainingReadiness | null> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_training_readiness WHERE user_id = $1 ORDER BY evaluated_at DESC LIMIT 1',
      [userId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      ...r,
      trigger_symptoms: Array.isArray(r.trigger_symptoms) ? r.trigger_symptoms : [],
      source_telemetry_refs: Array.isArray(r.source_telemetry_refs) ? r.source_telemetry_refs : [],
      medical_clearance: Boolean(r.medical_clearance),
      automatic_progression_allowed: Boolean(r.automatic_progression_allowed),
    };
  }

  const store = ensureLocalStore();
  const list = store.athlete_training_readiness.filter((r) => r.user_id === userId);
  return list.length > 0 ? list[0] : null;
}

export async function saveAthleteReadiness(
  readiness: Omit<AthleteTrainingReadiness, 'id' | 'created_at'>
): Promise<AthleteTrainingReadiness> {
  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO athlete_training_readiness (
        user_id, evaluated_at, athlete_status, running_readiness,
        cycling_readiness, general_readiness, running_restrictions,
        cycling_restrictions, rationale, trigger_symptoms,
        source_telemetry_refs, medical_clearance, automatic_progression_allowed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        readiness.user_id,
        readiness.evaluated_at || new Date().toISOString(),
        readiness.athlete_status,
        readiness.running_readiness,
        readiness.cycling_readiness,
        readiness.general_readiness,
        readiness.running_restrictions || null,
        readiness.cycling_restrictions || null,
        readiness.rationale,
        JSON.stringify(readiness.trigger_symptoms || []),
        JSON.stringify(readiness.source_telemetry_refs || []),
        Boolean(readiness.medical_clearance),
        Boolean(readiness.automatic_progression_allowed),
      ]
    );
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const record: AthleteTrainingReadiness = {
    ...readiness,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  store.athlete_training_readiness.unshift(record);
  saveLocalStore(store);
  return record;
}

