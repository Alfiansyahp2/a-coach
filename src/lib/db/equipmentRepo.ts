import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID } from './client';
import { AthleteEquipment } from '@/types';

export async function getAthleteEquipment(
  userId: string = DEFAULT_USER_ID,
  sportType?: string
): Promise<AthleteEquipment[]> {
  if (pgPool) {
    let query = 'SELECT * FROM athlete_equipment WHERE user_id = $1';
    const params: any[] = [userId];
    if (sportType) {
      query += ' AND (sport_type = $2 OR sport_type = \'All\')';
      params.push(sportType);
    }
    query += ' ORDER BY is_active DESC, accumulated_distance_meters DESC';
    const res = await pgPool.query(query, params);
    return res.rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      sport_type: r.sport_type,
      name: r.name,
      brand: r.brand || '',
      model: r.model || '',
      accumulated_distance_meters: Number(r.accumulated_distance_meters || 0),
      max_recommended_distance_meters: Number(r.max_recommended_distance_meters || 800000),
      gear_type: r.gear_type || 'RUNNING_SHOES',
      is_active: Boolean(r.is_active),
      is_retired: Boolean(r.is_retired),
      notes: r.notes || '',
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    }));
  }

  const store = ensureLocalStore();
  const list = ((store as any).athlete_equipment || []) as AthleteEquipment[];
  return list.filter((e) => {
    if (e.user_id !== userId) return false;
    if (sportType && e.sport_type !== sportType && e.sport_type !== 'All') return false;
    return true;
  });
}

export async function upsertEquipment(
  userId: string = DEFAULT_USER_ID,
  data: Partial<AthleteEquipment> & { name: string; sport_type: string; gear_type: string }
): Promise<AthleteEquipment> {
  const distance = data.accumulated_distance_meters ?? 0;
  const maxDistance = data.max_recommended_distance_meters ?? 800000;
  const isActive = data.is_active ?? true;
  const isRetired = data.is_retired ?? false;

  if (pgPool) {
    if (data.id) {
      const res = await pgPool.query(
        `UPDATE athlete_equipment SET
          sport_type = $1,
          name = $2,
          brand = $3,
          model = $4,
          accumulated_distance_meters = $5,
          max_recommended_distance_meters = $6,
          gear_type = $7,
          is_active = $8,
          is_retired = $9,
          notes = $10,
          updated_at = NOW()
        WHERE id = $11 AND user_id = $12
        RETURNING *`,
        [data.sport_type, data.name, data.brand || null, data.model || null, distance, maxDistance, data.gear_type, isActive, isRetired, data.notes || null, data.id, userId]
      );
      const r = res.rows[0];
      return {
        ...r,
        accumulated_distance_meters: Number(r.accumulated_distance_meters),
        max_recommended_distance_meters: Number(r.max_recommended_distance_meters),
        is_active: Boolean(r.is_active),
        is_retired: Boolean(r.is_retired),
      };
    } else {
      const res = await pgPool.query(
        `INSERT INTO athlete_equipment (
          user_id, sport_type, name, brand, model,
          accumulated_distance_meters, max_recommended_distance_meters,
          gear_type, is_active, is_retired, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [userId, data.sport_type, data.name, data.brand || null, data.model || null, distance, maxDistance, data.gear_type, isActive, isRetired, data.notes || null]
      );
      const r = res.rows[0];
      return {
        ...r,
        accumulated_distance_meters: Number(r.accumulated_distance_meters),
        max_recommended_distance_meters: Number(r.max_recommended_distance_meters),
        is_active: Boolean(r.is_active),
        is_retired: Boolean(r.is_retired),
      };
    }
  }

  const store = ensureLocalStore();
  if (!(store as any).athlete_equipment) (store as any).athlete_equipment = [];
  const list = (store as any).athlete_equipment as AthleteEquipment[];
  const now = new Date().toISOString();
  const record: AthleteEquipment = {
    id: data.id || crypto.randomUUID(),
    user_id: userId,
    sport_type: data.sport_type,
    name: data.name,
    brand: data.brand || '',
    model: data.model || '',
    accumulated_distance_meters: distance,
    max_recommended_distance_meters: maxDistance,
    gear_type: data.gear_type,
    is_active: isActive,
    is_retired: isRetired,
    notes: data.notes || '',
    created_at: now,
    updated_at: now,
  };
  const idx = list.findIndex((e) => e.id === record.id);
  if (idx !== -1) list[idx] = record;
  else list.push(record);
  saveLocalStore(store);
  return record;
}

export async function recordEquipmentMileage(
  equipmentId: string,
  additionalMeters: number
): Promise<void> {
  if (pgPool) {
    await pgPool.query(
      'UPDATE athlete_equipment SET accumulated_distance_meters = accumulated_distance_meters + $1, updated_at = NOW() WHERE id = $2',
      [additionalMeters, equipmentId]
    );
    return;
  }
  const store = ensureLocalStore();
  const list = ((store as any).athlete_equipment || []) as AthleteEquipment[];
  const found = list.find((e) => e.id === equipmentId);
  if (found) {
    found.accumulated_distance_meters += additionalMeters;
    saveLocalStore(store);
  }
}
