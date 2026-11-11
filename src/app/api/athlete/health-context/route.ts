import { NextRequest, NextResponse } from 'next/server';
import { connection } from 'next/server';
import { DEFAULT_USER_ID, getAuthoritativeHealthContext } from '@/lib/db';

/**
 * GET /api/athlete/health-context
 * Returns the centralized, authoritative athlete health, injury, and readiness context.
 */
export async function GET(req: NextRequest) {
  await connection();
  try {
    const userId = req.nextUrl.searchParams.get('userId') || DEFAULT_USER_ID;

    const healthContext = await getAuthoritativeHealthContext(userId);

    return NextResponse.json({
      success: true,
      context: healthContext,
    });
  } catch (err: any) {
    console.error('Error fetching athlete health context:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve health context', message: err.message },
      { status: 500 }
    );
  }
}
