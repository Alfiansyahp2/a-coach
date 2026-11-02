import { NextResponse } from 'next/server';
import { generateCoachTrainingFromDatabase } from '@/lib/coachTrainingGenerator';
import { DEFAULT_USER_ID } from '@/lib/db';

export async function POST(request: Request) {
  try {
    let userId = DEFAULT_USER_ID;
    try {
      const body = await request.json();
      if (body?.user_id) userId = body.user_id;
    } catch {
      // Body is optional
    }

    const result = await generateCoachTrainingFromDatabase(userId);

    return NextResponse.json({
      success: true,
      message: 'Coach training plan and workouts regenerated successfully.',
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

