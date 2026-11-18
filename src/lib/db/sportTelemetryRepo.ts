import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID } from './client';
import { SportActivityTelemetry, SportPrescriptionPayload } from '@/types';
import crypto from 'crypto';

export interface SaveSportTelemetryParams<T = Record<string, unknown>> {
  id?: string;
  userId?: string;
  sportCode: string;
  sessionTimestamp?: string;
  durationMinutes: number;
  sessionRpe: number;
  telemetryData: T;
  agentPrescription?: SportPrescriptionPayload;
}

export interface GetSportTelemetryOptions {
  sportCode?: string;
  limit?: number;
}

export async function saveSportActivityTelemetry<T = Record<string, unknown>>(
  params: SaveSportTelemetryParams<T>
): Promise<SportActivityTelemetry<T>> {
  const userId = params.userId || DEFAULT_USER_ID;
  const id = params.id || crypto.randomUUID();
  const sessionTimestamp = params.sessionTimestamp || new Date().toISOString();
  const now = new Date().toISOString();

  if (pgPool) {
    const query = `
      INSERT INTO sport_activity_telemetry (
        id, user_id, sport_code, session_timestamp, duration_minutes, session_rpe,
        telemetry_data, agent_prescription, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        sport_code = EXCLUDED.sport_code,
        session_timestamp = EXCLUDED.session_timestamp,
        duration_minutes = EXCLUDED.duration_minutes,
        session_rpe = EXCLUDED.session_rpe,
        telemetry_data = EXCLUDED.telemetry_data,
        agent_prescription = EXCLUDED.agent_prescription,
        updated_at = NOW()
      RETURNING *;
    `;
    const res = await pgPool.query(query, [
      id,
      userId,
      params.sportCode,
      sessionTimestamp,
      params.durationMinutes,
      params.sessionRpe,
      JSON.stringify(params.telemetryData || {}),
      params.agentPrescription ? JSON.stringify(params.agentPrescription) : null,
      now,
      now,
    ]);

    const row = res.rows[0];
    return {
      id: row.id,
      user_id: row.user_id,
      sport_code: row.sport_code,
      session_timestamp: row.session_timestamp,
      duration_minutes: Number(row.duration_minutes),
      session_rpe: Number(row.session_rpe),
      telemetry_data: typeof row.telemetry_data === 'string' ? JSON.parse(row.telemetry_data) : row.telemetry_data,
      agent_prescription: row.agent_prescription
        ? typeof row.agent_prescription === 'string'
          ? JSON.parse(row.agent_prescription)
          : row.agent_prescription
        : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  // Local File Store Fallback
  const store = ensureLocalStore();
  if (!store.sport_activity_telemetry) {
    store.sport_activity_telemetry = [];
  }

  const record: SportActivityTelemetry<T> = {
    id,
    user_id: userId,
    sport_code: params.sportCode,
    session_timestamp: sessionTimestamp,
    duration_minutes: params.durationMinutes,
    session_rpe: params.sessionRpe,
    telemetry_data: params.telemetryData,
    agent_prescription: params.agentPrescription,
    created_at: now,
    updated_at: now,
  };

  const existingIdx = store.sport_activity_telemetry.findIndex((item) => item.id === id);
  if (existingIdx >= 0) {
    store.sport_activity_telemetry[existingIdx] = record as any;
  } else {
    store.sport_activity_telemetry.unshift(record as any);
  }

  saveLocalStore(store);
  return record;
}

export async function getSportActivityTelemetry(
  userId: string = DEFAULT_USER_ID,
  options: GetSportTelemetryOptions = {}
): Promise<SportActivityTelemetry[]> {
  const limit = options.limit || 50;

  if (pgPool) {
    let query = `
      SELECT * FROM sport_activity_telemetry
      WHERE user_id = $1
    `;
    const values: any[] = [userId];

    if (options.sportCode) {
      values.push(options.sportCode);
      query += ` AND sport_code = $2`;
    }

    query += ` ORDER BY session_timestamp DESC LIMIT $${values.length + 1}`;
    values.push(limit);

    const res = await pgPool.query(query, values);
    return res.rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      sport_code: row.sport_code,
      session_timestamp: row.session_timestamp,
      duration_minutes: Number(row.duration_minutes),
      session_rpe: Number(row.session_rpe),
      telemetry_data: typeof row.telemetry_data === 'string' ? JSON.parse(row.telemetry_data) : row.telemetry_data,
      agent_prescription: row.agent_prescription
        ? typeof row.agent_prescription === 'string'
          ? JSON.parse(row.agent_prescription)
          : row.agent_prescription
        : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  const store = ensureLocalStore();
  let list = (store.sport_activity_telemetry || []).filter((item) => item.user_id === userId);

  if (options.sportCode) {
    list = list.filter((item) => item.sport_code.toUpperCase() === options.sportCode!.toUpperCase());
  }

  list.sort((a, b) => new Date(b.session_timestamp).getTime() - new Date(a.session_timestamp).getTime());
  return list.slice(0, limit);
}
