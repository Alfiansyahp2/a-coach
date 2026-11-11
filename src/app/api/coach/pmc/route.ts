import { NextResponse } from 'next/server';
import { getActivities, DEFAULT_USER_ID } from '@/lib/db';
import { computePMCViaPython } from '@/lib/api/coachPythonClient';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '42', 10);

    const activities = await getActivities(DEFAULT_USER_ID);
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
