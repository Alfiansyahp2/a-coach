import { NextResponse } from 'next/server';
import { getFitnessGoals, createFitnessGoal, setPrimaryFitnessGoal } from '@/lib/db';
import { generateCoachTrainingFromDatabase } from '@/lib/domain/coach/coachTrainingGenerator';
import { verifyUserAuthorization } from '@/lib/auth/authGuard';

export async function GET(request: Request) {
  try {
    const auth = verifyUserAuthorization(request);
    if (!auth.authorized) return auth.response!;
    const goals = await getFitnessGoals(auth.userId);
    return NextResponse.json({ success: true, data: goals });
  } catch (error: any) {
    console.error('Error fetching fitness goals:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch fitness goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const auth = verifyUserAuthorization(request, body?.user_id);
    if (!auth.authorized) return auth.response!;
    const userId = auth.userId;
    const action = body?.action || (body?.goal_id ? 'set_primary' : 'create');

    if (action === 'set_primary') {
      const goalId = body.goal_id;
      if (!goalId) {
        return NextResponse.json(
          { success: false, error: 'goal_id is required to set as primary' },
          { status: 400 }
        );
      }

      // Promote to primary and demote others
      const updatedGoal = await setPrimaryFitnessGoal(userId, goalId);
      if (!updatedGoal) {
        return NextResponse.json(
          { success: false, error: 'Target sasaran tidak ditemukan' },
          { status: 404 }
        );
      }

      // Automatically regenerate 12-week training plan for this goal
      const generatedPlan = await generateCoachTrainingFromDatabase(userId, goalId);

      return NextResponse.json({
        success: true,
        message: `Target "${updatedGoal.title}" berhasil diaktifkan sebagai Sasaran Utama! Kalender latihan telah disesuaikan.`,
        data: {
          goal: updatedGoal,
          trainingResult: generatedPlan,
        },
      });
    }

    // Default: create new goal
    const newGoalData = body?.goal || body;
    if (!newGoalData.title || newGoalData.target_value === undefined) {
      return NextResponse.json(
        { success: false, error: 'title and target_value are required' },
        { status: 400 }
      );
    }

    const created = await createFitnessGoal({
      user_id: userId,
      title: newGoalData.title,
      goal_type: newGoalData.goal_type || 'CUSTOM',
      sport_type: newGoalData.sport_type || 'Ride',
      priority: newGoalData.priority || 2,
      target_event_name: newGoalData.target_event_name || newGoalData.title,
      target_value: Number(newGoalData.target_value),
      current_value: Number(newGoalData.current_value || 0),
      start_date: newGoalData.start_date || new Date().toISOString().split('T')[0],
      target_date: newGoalData.target_date || new Date(Date.now() + 84 * 86400000).toISOString().split('T')[0],
      is_achieved: Boolean(newGoalData.is_achieved),
      unit: newGoalData.unit || 'km',
    });

    return NextResponse.json({
      success: true,
      message: `Sasaran "${created.title}" berhasil dibuat.`,
      data: created,
    });
  } catch (error: any) {
    console.error('Error handling fitness goal action:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process fitness goal request' },
      { status: 500 }
    );
  }
}

