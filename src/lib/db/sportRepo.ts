import { pgPool } from './client';
import { SportMeta, PRESET_SPORTS } from '../domain/sports/sportUtils';

/**
 * Repository layer for persisted sport types (F-P3-02)
 */
export async function getPersistedSportTypes(): Promise<SportMeta[]> {
  if (!pgPool) return PRESET_SPORTS;
  try {
    const res = await pgPool.query('SELECT * FROM sport_types ORDER BY created_at ASC');
    if (!res.rows || res.rows.length === 0) return PRESET_SPORTS;

    return res.rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      label: r.label,
      iconName: r.icon_name,
      colorKey: r.color_key,
      accentHex: r.accent_hex,
      badgeClass: r.badge_class,
      isPaceFormat: Boolean(r.is_pace_format),
    }));
  } catch (err) {
    console.warn('Failed to fetch persisted sport types from database:', err);
    return PRESET_SPORTS;
  }
}

export async function upsertSportType(sport: SportMeta): Promise<SportMeta> {
  if (!pgPool) return sport;
  const query = `
    INSERT INTO sport_types (id, name, label, icon_name, color_key, accent_hex, badge_class, is_pace_format)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      label = EXCLUDED.label,
      icon_name = EXCLUDED.icon_name,
      color_key = EXCLUDED.color_key,
      accent_hex = EXCLUDED.accent_hex,
      badge_class = EXCLUDED.badge_class,
      is_pace_format = EXCLUDED.is_pace_format
    RETURNING *;
  `;
  const res = await pgPool.query(query, [
    sport.id,
    sport.name,
    sport.label,
    sport.iconName,
    sport.colorKey,
    sport.accentHex,
    sport.badgeClass,
    sport.isPaceFormat,
  ]);
  const row = res.rows[0];
  return {
    id: row.id,
    name: row.name,
    label: row.label,
    iconName: row.icon_name,
    colorKey: row.color_key,
    accentHex: row.accent_hex,
    badgeClass: row.badge_class,
    isPaceFormat: Boolean(row.is_pace_format),
  };
}

