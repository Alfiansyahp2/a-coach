import { NextRequest, NextResponse } from 'next/server';
import { connection } from 'next/server';
import { DEFAULT_USER_ID } from '@/lib/db/client';
import { getActivities } from '@/lib/db/activityRepo';
import {
  getAthleteInjuries,
  getAthletePainLogs,
  getAthleteTrainingResponses,
} from '@/lib/db/healthRepo';
import { getScheduledWorkouts } from '@/lib/db/trainingRepo';
import { computeWeeklyActivityAndInjuryRecap } from '@/lib/domain/analytics/weeklyRecapEngine';

export async function GET(req: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date') || undefined;
    const userId = searchParams.get('user_id') || DEFAULT_USER_ID;

    const [activities, injuries, painLogs, trainingResponses, scheduledWorkouts] =
      await Promise.all([
        getActivities(userId),
        getAthleteInjuries(userId),
        getAthletePainLogs(userId, 50),
        getAthleteTrainingResponses(userId, 50),
        getScheduledWorkouts(userId),
      ]);

    const recap = computeWeeklyActivityAndInjuryRecap({
      activities,
      injuries,
      painLogs,
      trainingResponses,
      scheduledWorkouts,
      referenceDate: dateParam,
    });

    return NextResponse.json({
      success: true,
      recap,
    });
  } catch (error: any) {
    console.error('Failed to compute weekly recap:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error computing weekly recap',
      },
      { status: 500 }
    );
  }
}
