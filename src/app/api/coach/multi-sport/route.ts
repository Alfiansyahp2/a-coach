import { NextResponse, connection } from 'next/server';
import { verifyUserAuthorization } from '@/lib/auth/authGuard';
import {
  sportCoordinatorRouter,
  globalSystemicFatigueArbiter,
  HybridSessionInput,
} from '@/lib/domain/coach';
import { saveSportActivityTelemetry, getSportActivityTelemetry } from '@/lib/db';
import { SportTelemetryPayload } from '@/lib/domain/coach/agents/contracts';

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

    if (mode === 'hybrid-arbitration') {
      const records = await getSportActivityTelemetry(auth.userId);
      const recentSessions: HybridSessionInput[] = records.map((r: any) => {
        const agent = sportCoordinatorRouter.getAgent(r.sport_code);
        return {
          sessionId: r.id,
          sportCode: r.sport_code,
          cluster: agent?.metadata.cluster || 'CYCLIC_ENDURANCE',
          durationMinutes: r.duration_minutes,
          sessionRpe: r.session_rpe,
          timestamp: r.session_timestamp || r.created_at,
        };
      });
      const arbitration = globalSystemicFatigueArbiter.arbitrateHybridSchedule(recentSessions);
      return NextResponse.json({
        success: true,
        arbitration,
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

    let prescription;
    let arbitration;

    if (body.arbitrateHybrid) {
      const result = await sportCoordinatorRouter.arbitrateAndDispatch(
        payload,
        body.recentSessions || [],
        body.healthContext
      );
      prescription = result.localPrescription;
      arbitration = result.arbitration;
    } else {
      // Dispatch to decoupled sport agent directly
      prescription = await sportCoordinatorRouter.dispatchTelemetry(payload);
    }

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
      arbitration,
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
