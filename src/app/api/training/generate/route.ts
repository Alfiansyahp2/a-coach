import { NextResponse } from 'next/server';
import { generateCoachTrainingFromDatabase } from '@/lib/domain/coach/coachTrainingGenerator';
import { verifyUserAuthorization } from '@/lib/auth/authGuard';

export async function POST(request: Request) {
  try {
    let requestedUserId: string | undefined = undefined;
    let goalId: string | undefined = undefined;

    try {
      const body = await request.json();
      if (body?.user_id) requestedUserId = body.user_id;
      if (body?.goal_id) goalId = body.goal_id;
    } catch {
      // Body is optional
    }

    const auth = verifyUserAuthorization(request, requestedUserId);
    if (!auth.authorized) return auth.response!;
    const userId = auth.userId;

    const result = await generateCoachTrainingFromDatabase(userId, goalId);

    return NextResponse.json({
      success: true,
      message: `Rencana latihan terkalibrasi khusus untuk target "${result.summary.primaryGoalTitle}".`,
      data: result,
    });
  } catch (error: any) {
    console.error('Error generating coach training plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate coach training plan' },
      { status: 500 }
    );
  }
}
