import fs from 'fs';
import path from 'path';
import { LocalStoreSchema } from './client';

export function createInitialLocalStore(defaultUserId: string): LocalStoreSchema {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const getRelDate = (offsetDays: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  return {
    users: [
      {
        id: defaultUserId,
        email: 'athlete@protraining.internal',
        name: 'Apex Athlete',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        weight_kg: 65.0,
        height_cm: 170.0,
        resting_heart_rate: 68,
        max_heart_rate: 188,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    strava_connections: [],
    strava_tokens: [],
    activities: (() => {
      try {
        const importedPath = path.join(process.cwd(), 'data', 'imported_activities.json');
        if (fs.existsSync(importedPath)) {
          const raw = JSON.parse(fs.readFileSync(importedPath, 'utf8'));
          return raw.map((a: any, idx: number) => ({
            ...a,
            id: a.id || `act-imported-${idx + 1}`,
            user_id: defaultUserId,
          }));
        }
      } catch {}
      return [];
    })(),
    scheduled_workouts: [],
    workout_activity_matches: [],
    fitness_goals: [
      {
        id: 'goal-001',
        user_id: defaultUserId,
        title: 'First 100 km Century Ride (MTB)',
        goal_type: 'CUSTOM',
        target_value: 100,
        current_value: 62.4,
        start_date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
        target_date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-28`,
        is_achieved: false,
        unit: 'km',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'goal-002',
        user_id: defaultUserId,
        title: 'Consistency: 3 Sessions / Week',
        goal_type: 'FREQUENCY_WEEKLY',
        target_value: 3,
        current_value: 3,
        start_date: todayStr,
        target_date: getRelDate(7),
        is_achieved: false,
        unit: 'sessions',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    personal_records: [
      {
        id: 'pr-001',
        user_id: defaultUserId,
        activity_id: 'act-001',
        category: 'Longest Ride',
        sport_type: 'Ride',
        record_value: 62370,
        record_display: '62.37 km',
        achieved_date: `${getRelDate(-3)}T10:54:00Z`,
        created_at: new Date().toISOString(),
      },
      {
        id: 'pr-002',
        user_id: defaultUserId,
        activity_id: 'act-002',
        category: '40K+ Endurance Ride',
        sport_type: 'Ride',
        record_value: 62.37,
        record_display: '62.37 km',
        achieved_date: `${getRelDate(-3)}T10:54:00Z`,
        created_at: new Date().toISOString(),
      },
      {
        id: 'pr-003',
        user_id: defaultUserId,
        activity_id: 'act-003',
        category: 'Longest Run',
        sport_type: 'Run',
        record_value: 12330,
        record_display: '12.33 km',
        achieved_date: `${getRelDate(-45)}T06:00:00Z`,
        created_at: new Date().toISOString(),
      },
    ],
    sync_logs: [],
    athlete_profiles: [],
    athlete_injuries: [],
    athlete_pain_logs: [],
    athlete_training_responses: [],
    athlete_medical_assessments: [],
    athlete_training_readiness: [],
    health_audit_trail: [],
  };
}
