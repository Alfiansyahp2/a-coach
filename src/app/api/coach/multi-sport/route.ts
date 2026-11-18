import { NextResponse, connection } from 'next/server';
import { verifyUserAuthorization } from '@/lib/auth/authGuard';
import { sportCoordinatorRouter, registerDefaultEnduranceAgents } from '@/lib/domain/coach/agents';
import { saveSportActivityTelemetry, getSportActivityTelemetry } from '@/lib/db';
import { SportTelemetryPayload } from '@/lib/domain/coach/agents/contracts';

// Ensure default flagship agents are registered
registerDefaultEnduranceAgents();

export async function GET(request: Request) {
  await connection();
  try {
    const auth = verifyUserAuthorization(request);
    if (!auth.authorized) return auth.response!;

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    if (mode === 'agents') {
      return NextResponse.json({
        success: true,
        agents: sportCoordinatorRouter.listAgents(),
      });
    }

    const records = await getSportActivityTelemetry(auth.userId);
    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error: any) {
    console.error('[Multi-Sport API GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await connection();
  try {
    const auth = verifyUserAuthorization(request);
    if (!auth.authorized) return auth.response!;

    const body = await request.json();
    const {
      sportCode,
      durationMinutes,
      sessionRpe,
      sportSpecificMetrics = {},
      subjectiveSymptoms,
      activityId,
    } = body;

    if (!sportCode || !durationMinutes || !sessionRpe) {
      return NextResponse.json(
        { success: false, error: 'sportCode, durationMinutes, and sessionRpe are required' },
        { status: 400 }
      );
    }

    const sessionId = activityId || `manual-${Date.now()}`;
    const payload: SportTelemetryPayload = {
      sessionId,
      athleteId: auth.userId,
      sportCode,
      timestamp: new Date().toISOString(),
      durationMinutes: Number(durationMinutes),
      sessionRpe: Number(sessionRpe),
      sportSpecificMetrics,
      subjectiveSymptoms,
    };

    // Dispatch to decoupled sport agent
    const prescription = await sportCoordinatorRouter.dispatchTelemetry(payload);

    // Persist in sport_activity_telemetry table
    const savedRecord = await saveSportActivityTelemetry({
      userId: auth.userId,
      sportCode,
      durationMinutes: Number(durationMinutes),
      sessionRpe: Number(sessionRpe),
      telemetryData: sportSpecificMetrics,
      agentPrescription: prescription,
    });

    return NextResponse.json({
      success: true,
      prescription,
      recordId: savedRecord?.id,
    });
  } catch (error: any) {
    console.error('[Multi-Sport API POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
