import { NextRequest, NextResponse } from 'next/server';
import { connection } from 'next/server';
import { getActivities } from '@/lib/db/activity';
import {
  getAthleteInjuries,
  getAthletePainLogs,
  getAthleteTrainingResponses,
} from '@/lib/db/health';
import { getScheduledWorkouts } from '@/lib/db/trainingRepo';
import { computeWeeklyActivityAndInjuryRecap } from '@/lib/domain/analytics/weeklyRecapEngine';
import { computeWeeklyRecapViaPython } from '@/lib/api/coachPythonClient';
import { verifyUserAuthorization } from '@/lib/auth/authGuard';

export async function GET(req: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date') || undefined;
    const scopeParam = (searchParams.get('scope') as '1_WEEK' | '2_WEEKS' | '4_WEEKS') || '1_WEEK';
    const autoMondayParam = searchParams.get('autoMonday') !== 'false';
    const auth = verifyUserAuthorization(req, searchParams.get('user_id') || searchParams.get('userId'));
    if (!auth.authorized) return auth.response!;
    const userId = auth.userId;

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
      scope: scopeParam,
      autoMonday: autoMondayParam,
    });

    try {
      const pythonPro = await computeWeeklyRecapViaPython(
        activities,
        new Date(recap.timeframe.startDate),
        new Date(recap.timeframe.endDate),
        painLogs,
        trainingResponses
      );
      if (pythonPro) {
        recap.pro_metrics = pythonPro;
      }
    } catch {}

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
