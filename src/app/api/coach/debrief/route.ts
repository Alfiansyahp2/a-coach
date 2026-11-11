import { NextResponse } from 'next/server';
import { getActivityById } from '@/lib/db';
import { computeDebriefViaPython } from '@/lib/api/coachPythonClient';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { activity_id, pain_during = 0, pain_after = 0, swelling = false } = body;

    if (!activity_id) {
      return NextResponse.json(
        { success: false, error: 'activity_id is required' },
        { status: 400 }
      );
    }

    const activity = await getActivityById(activity_id);
    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    const debrief = await computeDebriefViaPython(
      activity,
      pain_during,
      pain_after,
      swelling
    );

    return NextResponse.json({
      success: true,
      debrief,
    });
  } catch (error: any) {
    console.error('[Coach Debrief API Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to compute session debrief',
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
