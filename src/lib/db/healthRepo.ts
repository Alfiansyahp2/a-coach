import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID, formatDateOnly } from './client';
import {
  AthleteProfile,
  AthleteInjury,
  AthletePainLog,
  AthleteTrainingResponse,
  AthleteMedicalAssessment,
  AthleteTrainingReadiness,
  HealthAuditTrail,
  AuthoritativeAthleteHealthContext,
  MedicalEvaluationStatus,
} from '@/types';
import { evaluateTrainingReadiness } from '@/lib/readinessEngine';

export async function getAthleteProfile(userId: string = DEFAULT_USER_ID): Promise<AthleteProfile | null> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_profiles WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      ...r,
      age: r.age ? Number(r.age) : null,
      height_cm: r.height_cm ? Number(r.height_cm) : null,
      weight_kg: r.weight_kg ? Number(r.weight_kg) : null,
      bmi: r.bmi ? Number(r.bmi) : null,
      resting_heart_rate: r.resting_heart_rate ? Number(r.resting_heart_rate) : null,
      training_days_per_week: Number(r.training_days_per_week || 3),
      physiological_measurements: r.physiological_measurements || {},
    };
  }

  const store = ensureLocalStore();
  return store.athlete_profiles.find((p) => p.user_id === userId) || null;
}

export async function upsertAthleteProfile(
  profile: Partial<AthleteProfile> & { user_id: string }
): Promise<AthleteProfile> {
  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO athlete_profiles (
        user_id, age, height_cm, weight_kg, resting_heart_rate,
        training_days_per_week, preferred_sports, training_experience,
        performance_objectives, physiological_measurements, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        age = COALESCE(EXCLUDED.age, athlete_profiles.age),
        height_cm = COALESCE(EXCLUDED.height_cm, athlete_profiles.height_cm),
        weight_kg = COALESCE(EXCLUDED.weight_kg, athlete_profiles.weight_kg),
        resting_heart_rate = COALESCE(EXCLUDED.resting_heart_rate, athlete_profiles.resting_heart_rate),
        training_days_per_week = COALESCE(EXCLUDED.training_days_per_week, athlete_profiles.training_days_per_week),
        preferred_sports = COALESCE(EXCLUDED.preferred_sports, athlete_profiles.preferred_sports),
        training_experience = COALESCE(EXCLUDED.training_experience, athlete_profiles.training_experience),
        performance_objectives = COALESCE(EXCLUDED.performance_objectives, athlete_profiles.performance_objectives),
        physiological_measurements = COALESCE(EXCLUDED.physiological_measurements, athlete_profiles.physiological_measurements),
        updated_at = NOW()
      RETURNING *`,
      [
        profile.user_id,
        profile.age ?? null,
        profile.height_cm ?? null,
        profile.weight_kg ?? null,
        profile.resting_heart_rate ?? null,
        profile.training_days_per_week ?? 3,
        profile.preferred_sports ?? ['Running', 'Cycling'],
        profile.training_experience ?? 'INTERMEDIATE',
        profile.performance_objectives ?? 'Aerobic endurance with injury prevention',
        JSON.stringify(profile.physiological_measurements ?? {}),
      ]
    );
    const r = res.rows[0];
    return {
      ...r,
      age: r.age ? Number(r.age) : null,
      height_cm: r.height_cm ? Number(r.height_cm) : null,
      weight_kg: r.weight_kg ? Number(r.weight_kg) : null,
      bmi: r.bmi ? Number(r.bmi) : null,
      resting_heart_rate: r.resting_heart_rate ? Number(r.resting_heart_rate) : null,
      training_days_per_week: Number(r.training_days_per_week || 3),
      physiological_measurements: r.physiological_measurements || {},
    };
  }

  const store = ensureLocalStore();
  const idx = store.athlete_profiles.findIndex((p) => p.user_id === profile.user_id);
  const now = new Date().toISOString();
  const weight = profile.weight_kg ?? 65;
  const height = profile.height_cm ?? 170;
  const bmi = Math.round((weight / ((height / 100) * (height / 100))) * 10) / 10;

  const record: AthleteProfile = {
    id: idx !== -1 ? store.athlete_profiles[idx].id : crypto.randomUUID(),
    user_id: profile.user_id,
    age: profile.age ?? 22,
    height_cm: height,
    weight_kg: weight,
    bmi,
    resting_heart_rate: profile.resting_heart_rate ?? 68,
    training_days_per_week: profile.training_days_per_week ?? 3,
    preferred_sports: profile.preferred_sports ?? ['Running', 'Cycling'],
    training_experience: profile.training_experience ?? 'INTERMEDIATE',
    performance_objectives: profile.performance_objectives ?? 'Aerobic endurance with injury prevention',
    physiological_measurements: profile.physiological_measurements ?? {
      hr_max: null,
      lthr: null,
      ftp_watts: null,
      vo2_max: null,
      running_threshold_pace_sec: null,
      cycling_power_zones: null,
      baseline_consistency_weeks: null,
      sleep_recovery_baseline: null,
    },
    created_at: idx !== -1 ? store.athlete_profiles[idx].created_at : now,
    updated_at: now,
  };

  if (idx !== -1) {
    store.athlete_profiles[idx] = record;
  } else {
    store.athlete_profiles.push(record);
  }
  saveLocalStore(store);
  return record;
}

export async function getAthleteInjuries(userId: string = DEFAULT_USER_ID): Promise<AthleteInjury[]> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_injuries WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return res.rows.map((r) => ({
      ...r,
      previous_swelling: Boolean(r.previous_swelling),
      estimated_injury_date: r.estimated_injury_date ? formatDateOnly(r.estimated_injury_date) : null,
    }));
  }

  const store = ensureLocalStore();
  return store.athlete_injuries.filter((i) => i.user_id === userId);
}

export async function createAthleteInjury(
  injury: Omit<AthleteInjury, 'id' | 'created_at' | 'updated_at'>
): Promise<AthleteInjury> {
  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO athlete_injuries (
        user_id, body_region, side, injury_mechanism, timeframe_description,
        estimated_injury_date, previous_symptoms, initial_severity,
        previous_swelling, previous_swelling_duration, medical_evaluation_status,
        current_status, clinician_restrictions, functional_limitations,
        recovery_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        injury.user_id,
        injury.body_region,
        injury.side,
        injury.injury_mechanism,
        injury.timeframe_description,
        injury.estimated_injury_date || null,
        injury.previous_symptoms || null,
        injury.initial_severity || 'MODERATE',
        Boolean(injury.previous_swelling),
        injury.previous_swelling_duration || null,
        injury.medical_evaluation_status || 'PENDING_CLINICAL_ASSESSMENT',
        injury.current_status || 'ACTIVE_SYMPTOMATIC',
        injury.clinician_restrictions || null,
        injury.functional_limitations || null,
        injury.recovery_notes || null,
      ]
    );
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const now = new Date().toISOString();
  const record: AthleteInjury = {
    ...injury,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  store.athlete_injuries.unshift(record);
  saveLocalStore(store);
  return record;
}

export async function getAthletePainLogs(
  userId: string = DEFAULT_USER_ID,
  limit: number = 20
): Promise<AthletePainLog[]> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_pain_logs WHERE user_id = $1 ORDER BY logged_at DESC LIMIT $2',
      [userId, limit]
    );
    return res.rows.map((r) => ({
      ...r,
      pain_score: r.pain_score !== null ? Number(r.pain_score) : null,
      pain_during_activity: r.pain_during_activity !== null ? Number(r.pain_during_activity) : null,
      pain_immediately_after: r.pain_immediately_after !== null ? Number(r.pain_immediately_after) : null,
      pain_24h_after: r.pain_24h_after !== null ? Number(r.pain_24h_after) : null,
      swelling_present: Boolean(r.swelling_present),
      joint_instability: Boolean(r.joint_instability),
    }));
  }

  const store = ensureLocalStore();
  return store.athlete_pain_logs.filter((p) => p.user_id === userId).slice(0, limit);
}

export async function createAthletePainLog(
  log: Omit<AthletePainLog, 'id' | 'created_at'>
): Promise<AthletePainLog> {
  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO athlete_pain_logs (
        user_id, injury_id, body_region, side, pain_score, pain_type,
        associated_activity, pain_during_activity, pain_immediately_after,
        pain_24h_after, swelling_present, joint_instability,
        functional_limitations, logged_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        log.user_id,
        log.injury_id || null,
        log.body_region,
        log.side,
        log.pain_score ?? null,
        log.pain_type || null,
        log.associated_activity || null,
        log.pain_during_activity ?? null,
        log.pain_immediately_after ?? null,
        log.pain_24h_after ?? null,
        Boolean(log.swelling_present),
        Boolean(log.joint_instability),
        log.functional_limitations || null,
        log.logged_at || new Date().toISOString(),
      ]
    );
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const record: AthletePainLog = {
    ...log,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  store.athlete_pain_logs.unshift(record);
  saveLocalStore(store);
  return record;
}

export async function getAthleteTrainingResponses(
  userId: string = DEFAULT_USER_ID,
  limit: number = 20
): Promise<AthleteTrainingResponse[]> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_training_responses WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return res.rows.map((r) => ({
      ...r,
      distance_km: Number(r.distance_km),
      duration_seconds: Number(r.duration_seconds),
      rpe_score: r.rpe_score !== null ? Number(r.rpe_score) : null,
      pain_during_activity: r.pain_during_activity !== null ? Number(r.pain_during_activity) : null,
      pain_after_activity: r.pain_after_activity !== null ? Number(r.pain_after_activity) : null,
      pain_next_day: r.pain_next_day !== null ? Number(r.pain_next_day) : null,
      swelling_observed: Boolean(r.swelling_observed),
      instability_observed: Boolean(r.instability_observed),
    }));
  }

  const store = ensureLocalStore();
  return store.athlete_training_responses.filter((r) => r.user_id === userId).slice(0, limit);
}

export async function upsertAthleteTrainingResponse(
  resp: Omit<AthleteTrainingResponse, 'id' | 'created_at'>
): Promise<AthleteTrainingResponse> {
  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO athlete_training_responses (
        user_id, activity_id, strava_activity_id, sport_type, distance_km,
        duration_seconds, rpe_score, pain_during_activity, pain_after_activity,
        pain_next_day, swelling_observed, instability_observed,
        fatigue_response, athlete_comments, checkin_completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (user_id, activity_id) DO UPDATE SET
        rpe_score = EXCLUDED.rpe_score,
        pain_during_activity = EXCLUDED.pain_during_activity,
        pain_after_activity = EXCLUDED.pain_after_activity,
        pain_next_day = EXCLUDED.pain_next_day,
        swelling_observed = EXCLUDED.swelling_observed,
        instability_observed = EXCLUDED.instability_observed,
        fatigue_response = EXCLUDED.fatigue_response,
        athlete_comments = EXCLUDED.athlete_comments,
        checkin_completed_at = NOW()
      RETURNING *`,
      [
        resp.user_id,
        resp.activity_id || null,
        resp.strava_activity_id || null,
        resp.sport_type,
        resp.distance_km,
        resp.duration_seconds,
        resp.rpe_score ?? null,
        resp.pain_during_activity ?? null,
        resp.pain_after_activity ?? null,
        resp.pain_next_day ?? null,
        Boolean(resp.swelling_observed),
        Boolean(resp.instability_observed),
        resp.fatigue_response || 'NORMAL',
        resp.athlete_comments || null,
        resp.checkin_completed_at || new Date().toISOString(),
      ]
    );
    const r = res.rows[0];
    return {
      ...r,
      distance_km: Number(r.distance_km),
      duration_seconds: Number(r.duration_seconds),
      rpe_score: r.rpe_score !== null ? Number(r.rpe_score) : null,
      pain_during_activity: r.pain_during_activity !== null ? Number(r.pain_during_activity) : null,
      pain_after_activity: r.pain_after_activity !== null ? Number(r.pain_after_activity) : null,
      pain_next_day: r.pain_next_day !== null ? Number(r.pain_next_day) : null,
      swelling_observed: Boolean(r.swelling_observed),
      instability_observed: Boolean(r.instability_observed),
    };
  }

  const store = ensureLocalStore();
  const idx = store.athlete_training_responses.findIndex(
    (r) => r.user_id === resp.user_id && r.activity_id === resp.activity_id
  );
  const record: AthleteTrainingResponse = {
    ...resp,
    id: idx !== -1 ? store.athlete_training_responses[idx].id : crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  if (idx !== -1) {
    store.athlete_training_responses[idx] = record;
  } else {
    store.athlete_training_responses.unshift(record);
  }
  saveLocalStore(store);
  return record;
}

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

export async function logHealthAuditTrail(
  trail: Omit<HealthAuditTrail, 'id' | 'created_at'>
): Promise<HealthAuditTrail> {
  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO health_audit_trail (
        user_id, entity_type, entity_id, action, state_before, state_after, modified_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        trail.user_id,
        trail.entity_type,
        trail.entity_id,
        trail.action,
        trail.state_before ? JSON.stringify(trail.state_before) : null,
        trail.state_after ? JSON.stringify(trail.state_after) : null,
        trail.modified_by || 'ATHLETE',
      ]
    );
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const record: HealthAuditTrail = {
    ...trail,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  store.health_audit_trail.unshift(record);
  saveLocalStore(store);
  return record;
}

export async function getAuthoritativeHealthContext(
  userId: string = DEFAULT_USER_ID
): Promise<AuthoritativeAthleteHealthContext> {
  const [profile, injuries, painLogs, responses, assessments, readiness] = await Promise.all([
    getAthleteProfile(userId),
    getAthleteInjuries(userId),
    getAthletePainLogs(userId, 15),
    getAthleteTrainingResponses(userId, 15),
    getAthleteMedicalAssessments(userId),
    getLatestAthleteReadiness(userId),
  ]);

  const clinicianRestrictions: string[] = [];
  for (const m of assessments) {
    if (m.verification_status === 'CLINICIAN_VERIFIED' && m.clinician_restrictions && m.clinician_restrictions.trim().length > 0) {
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
