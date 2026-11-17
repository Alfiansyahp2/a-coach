import { NextResponse, connection } from 'next/server';
import { getActivities } from '@/lib/db';
import { computePMCViaPython } from '@/lib/api/coachPythonClient';
import { verifyUserAuthorization } from '@/lib/auth/authGuard';

export async function GET(request: Request) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const auth = verifyUserAuthorization(request, searchParams.get('userId'));
    if (!auth.authorized) return auth.response!;

    const days = parseInt(searchParams.get('days') || '42', 10);
    const activities = await getActivities(auth.userId);
    const pmc = await computePMCViaPython(activities, days);

    return NextResponse.json({
      success: true,
      pmc,
    });
  } catch (error: any) {
    console.error('[Coach PMC API Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to compute PMC metrics',
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
