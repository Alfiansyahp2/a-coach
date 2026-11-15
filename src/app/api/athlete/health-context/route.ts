import { NextRequest, NextResponse } from 'next/server';
import { connection } from 'next/server';
import { getAuthoritativeHealthContext } from '@/lib/db';
import { verifyUserAuthorization } from '@/lib/auth/authGuard';

/**
 * GET /api/athlete/health-context
 * Returns the centralized, authoritative athlete health, injury, and readiness context.
 */
export async function GET(req: NextRequest) {
  await connection();
  try {
    const auth = verifyUserAuthorization(req, req.nextUrl.searchParams.get('userId'));
    if (!auth.authorized) return auth.response!;
    const userId = auth.userId;

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
