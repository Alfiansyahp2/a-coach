import { NextResponse } from 'next/server';
import { getActivities, getScheduledWorkouts, DEFAULT_USER_ID } from '@/lib/db';
import { calculateWeeklyStreak } from '@/lib/domain/streak/streakEngine';

export async function GET() {
  try {
    const [activities, workouts] = await Promise.all([
      getActivities(DEFAULT_USER_ID),
      getScheduledWorkouts(DEFAULT_USER_ID),
    ]);

    const streak = calculateWeeklyStreak(activities, workouts);

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
    console.error('Failed to calculate streak for navbar:', error);
    return NextResponse.json(
      {
        success: false,
        currentStreakWeeks: 0,
        isFlameBurning: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

