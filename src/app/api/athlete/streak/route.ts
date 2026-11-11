import { NextResponse } from 'next/server';
import { getActivities, getScheduledWorkouts, DEFAULT_USER_ID } from '@/lib/db';
import { computeStreakViaPython } from '@/lib/api/pythonClient';

export async function GET() {
  try {
    const [activities, workouts] = await Promise.all([
      getActivities(DEFAULT_USER_ID),
      getScheduledWorkouts(DEFAULT_USER_ID),
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
