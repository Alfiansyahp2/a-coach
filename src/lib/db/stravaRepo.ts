import crypto from 'crypto';
import { StravaConnection, StravaToken, SyncLog } from '@/types';
import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID } from './client';

export async function getStravaConnection(userId: string = DEFAULT_USER_ID): Promise<StravaConnection | null> {
  if (pgPool) {
    const res = await pgPool.query('SELECT * FROM strava_connections WHERE user_id = $1 AND is_active = true', [userId]);
    return res.rows[0] || null;
  }
  const store = ensureLocalStore();
  return store.strava_connections.find((c) => c.user_id === userId && c.is_active) || null;
}

export async function saveStravaConnection(
  userId: string,
  athlete: { id: number; firstname?: string; lastname?: string; username?: string; profile?: string },
  scopes: string[]
): Promise<StravaConnection> {
  const athleteName = [athlete.firstname, athlete.lastname].filter(Boolean).join(' ') || athlete.username || 'Strava Athlete';
  const now = new Date().toISOString();

  if (pgPool) {
    const query = `
      INSERT INTO strava_connections (user_id, strava_athlete_id, athlete_name, athlete_username, avatar_url, scopes, is_active, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        strava_athlete_id = EXCLUDED.strava_athlete_id,
        athlete_name = EXCLUDED.athlete_name,
        athlete_username = EXCLUDED.athlete_username,
        avatar_url = EXCLUDED.avatar_url,
        scopes = EXCLUDED.scopes,
        is_active = true,
        updated_at = NOW()
      RETURNING *;
    `;
    const res = await pgPool.query(query, [userId, athlete.id, athleteName, athlete.username || null, athlete.profile || null, scopes]);
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const existingIdx = store.strava_connections.findIndex((c) => c.user_id === userId);
  const conn: StravaConnection = {
    id: existingIdx >= 0 ? store.strava_connections[existingIdx].id : crypto.randomUUID(),
    user_id: userId,
    strava_athlete_id: athlete.id,
    athlete_name: athleteName,
    athlete_username: athlete.username,
    avatar_url: athlete.profile,
    scopes,
    is_active: true,
    created_at: existingIdx >= 0 ? store.strava_connections[existingIdx].created_at : now,
    updated_at: now,
  };

  if (existingIdx >= 0) {
    store.strava_connections[existingIdx] = conn;
  } else {
    store.strava_connections.push(conn);
  }
  saveLocalStore(store);
  return conn;
}

export async function disconnectStrava(userId: string = DEFAULT_USER_ID): Promise<void> {
  if (pgPool) {
    await pgPool.query('UPDATE strava_connections SET is_active = false WHERE user_id = $1', [userId]);
    return;
  }
  const store = ensureLocalStore();
  const conn = store.strava_connections.find((c) => c.user_id === userId);
  if (conn) {
    conn.is_active = false;
    conn.updated_at = new Date().toISOString();
    saveLocalStore(store);
  }
}

export async function saveStravaTokens(
  connectionId: string,
  accessTokenEncrypted: string,
  refreshTokenEncrypted: string,
  expiresAt: string
): Promise<StravaToken> {
  const now = new Date().toISOString();
  if (pgPool) {
    const query = `
      INSERT INTO strava_tokens (connection_id, access_token_encrypted, refresh_token_encrypted, expires_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (connection_id) DO UPDATE SET
        access_token_encrypted = EXCLUDED.access_token_encrypted,
        refresh_token_encrypted = EXCLUDED.refresh_token_encrypted,
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW()
      RETURNING *;
    `;
    const res = await pgPool.query(query, [connectionId, accessTokenEncrypted, refreshTokenEncrypted, expiresAt]);
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const existingIdx = store.strava_tokens.findIndex((t) => t.connection_id === connectionId);
  const token: StravaToken = {
    id: existingIdx >= 0 ? store.strava_tokens[existingIdx].id : crypto.randomUUID(),
    connection_id: connectionId,
    access_token_encrypted: accessTokenEncrypted,
    refresh_token_encrypted: refreshTokenEncrypted,
    expires_at: expiresAt,
    created_at: existingIdx >= 0 ? store.strava_tokens[existingIdx].created_at : now,
    updated_at: now,
  };

  if (existingIdx >= 0) {
    store.strava_tokens[existingIdx] = token;
  } else {
    store.strava_tokens.push(token);
  }
  saveLocalStore(store);
  return token;
}

export async function getStravaToken(connectionId: string): Promise<StravaToken | null> {
  if (pgPool) {
    const res = await pgPool.query('SELECT * FROM strava_tokens WHERE connection_id = $1', [connectionId]);
    return res.rows[0] || null;
  }
  const store = ensureLocalStore();
  return store.strava_tokens.find((t) => t.connection_id === connectionId) || null;
}

export async function getLastSyncLog(userId: string = DEFAULT_USER_ID): Promise<SyncLog | null> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM sync_logs WHERE user_id = $1 ORDER BY started_at DESC LIMIT 1',
      [userId]
    );
    if (!res.rows[0]) return null;
    const row = res.rows[0];
    return {
      ...row,
      activities_fetched: Number(row.activities_fetched || 0),
      activities_created: Number(row.activities_created || 0),
      activities_updated: Number(row.activities_updated || 0),
      started_at: row.started_at instanceof Date ? row.started_at.toISOString() : String(row.started_at),
      completed_at: row.completed_at instanceof Date ? row.completed_at.toISOString() : String(row.completed_at),
    };
  }

  const store = ensureLocalStore();
  const logs = store.sync_logs.filter((l) => l.user_id === userId);
  return logs[0] || null;
}

export async function createSyncLog(log: Omit<SyncLog, 'id'>): Promise<SyncLog> {
  if (pgPool) {
    const query = `
      INSERT INTO sync_logs (user_id, status, error_message, activities_fetched, activities_created, activities_updated, started_at, completed_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const res = await pgPool.query(query, [
      log.user_id,
      log.status,
      log.error_message || null,
      log.activities_fetched,
      log.activities_created,
      log.activities_updated,
      log.started_at,
      log.completed_at || null,
    ]);
    const row = res.rows[0];
    return {
      ...row,
      activities_fetched: Number(row.activities_fetched || 0),
      activities_created: Number(row.activities_created || 0),
      activities_updated: Number(row.activities_updated || 0),
      started_at: row.started_at instanceof Date ? row.started_at.toISOString() : String(row.started_at),
      completed_at: row.completed_at instanceof Date ? row.completed_at.toISOString() : String(row.completed_at),
    };
  }

  const store = ensureLocalStore();
  const record: SyncLog = {
    ...log,
    id: crypto.randomUUID(),
  };
  store.sync_logs.unshift(record);
  saveLocalStore(store);
  return record;
}

