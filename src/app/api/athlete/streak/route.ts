import { NextRequest, NextResponse, connection } from 'next/server';
import { getActivities, getScheduledWorkouts } from '@/lib/db';
import { computeStreakViaPython } from '@/lib/api/pythonClient';
import { verifyUserAuthorization } from '@/lib/auth/authGuard';

export async function GET(req: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(req.url);
    const auth = verifyUserAuthorization(req, searchParams.get('userId'));
    if (!auth.authorized) return auth.response!;
    const userId = auth.userId;

    const [activities, workouts] = await Promise.all([
      getActivities(userId),
      getScheduledWorkouts(userId),
    ]);

    const streak = await computeStreakViaPython(activities, workouts);

    return NextResponse.json({
      success: true,
      currentStreakWeeks: streak.currentStreakWeeks,
      longestStreakWeeks: streak.longestStreakWeeks,
      isFlameBurning: streak.isFlameBurning,
      isFlameAtRisk: streak.isFlameAtRisk,
      totalContributions: streak.totalContributions,
      heatTier: streak.heatTier,
      flameStatusTitle: streak.flameStatusTitle,
      flameStatusDescription: streak.flameStatusDescription,
    });
  } catch (error: any) {
    console.error('[Streak API Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate weekly streak',
        message: error.message || 'Internal database or calculation error',
      },
      { status: 500 }
    );
  }
}
