// Decoupled Multi-Sport Coordinator Router & Agent Registry
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';
import { calculateSessionRpeLoad } from '../kernels/fosterSessionRpeKernel';
import {
  globalSystemicFatigueArbiter,
  HybridSessionInput,
  ArbitrationResult,
  AthleteHealthContext,
} from '../GlobalSystemicFatigueArbiter';

export class SportCoordinatorRouter {
  private static instance: SportCoordinatorRouter;
  private agents: Map<string, ISportCoachAgent> = new Map();

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): SportCoordinatorRouter {
    if (!SportCoordinatorRouter.instance) {
      SportCoordinatorRouter.instance = new SportCoordinatorRouter();
    }
    return SportCoordinatorRouter.instance;
  }

  /**
   * Registers a specialized decoupled sport coach agent.
   */
  public registerAgent(agent: ISportCoachAgent): void {
    const code = agent.metadata.sportCode.toUpperCase();
    this.agents.set(code, agent);
  }

  /**
   * Retrieves a registered agent by sport code or supported alias.
   */
  public getAgent(sportCode: string): ISportCoachAgent | undefined {
    const upper = (sportCode || '').toUpperCase();
    if (this.agents.has(upper)) {
      return this.agents.get(upper);
    }
    for (const agent of this.agents.values()) {
      if (agent.canHandle(sportCode)) {
        return agent;
      }
    }
    return undefined;
  }

  /**
   * Checks whether an agent is registered for a given sport code or alias.
   */
  public hasAgent(sportCode: string): boolean {
    return this.getAgent(sportCode) !== undefined;
  }

  /**
   * Lists metadata for all registered sport coach agents.
   */
  public listAgents(): SportCoachMetadata[] {
    return Array.from(this.agents.values()).map((a) => a.metadata);
  }

  /**
   * Clears all registered agents (useful for test isolation).
   */
  public clearRegistry(): void {
    this.agents.clear();
  }

  /**
   * Dispatches incoming telemetry to the corresponding isolated agent.
   * If the sport code has no registered agent, defaults to Grounded Universal Safe Ingress.
   */
  public async dispatchTelemetry(payload: SportTelemetryPayload): Promise<SportPrescriptionOutput> {
    const agent = this.getAgent(payload.sportCode);

    if (agent) {
      // 1. Validate
      const validation = agent.validateTelemetry(payload);
      if (!validation.isValid) {
        throw new Error(`Telemetry validation failed for ${payload.sportCode}: ${validation.error}`);
      }
      // 2. Delegate execution to isolated sport agent
      return agent.generatePrescription(payload);
    }

    // Fallback: Grounded Indicator Protocol Safe Universal Handler
    return this.generateFallbackSafePrescription(payload);
  }

  /**
   * Harmonizes multi-sport hybrid athlete telemetry via GlobalSystemicFatigueArbiter before/after dispatch.
   */
  public async arbitrateAndDispatch(
    payload: SportTelemetryPayload,
    recentHistory: HybridSessionInput[] = [],
    healthContext?: AthleteHealthContext
  ): Promise<{ localPrescription: SportPrescriptionOutput; arbitration: ArbitrationResult }> {
    const localPrescription = await this.dispatchTelemetry(payload);
    const agent = this.getAgent(payload.sportCode);
    const cluster = agent?.metadata.cluster || 'CYCLIC_ENDURANCE';

    const proposedSession: HybridSessionInput = {
      sessionId: payload.sessionId,
      sportCode: payload.sportCode,
      cluster,
      durationMinutes: payload.durationMinutes,
      sessionRpe: payload.sessionRpe,
      timestamp: payload.timestamp || new Date().toISOString(),
    };

    const arbitration = globalSystemicFatigueArbiter.arbitrateHybridSchedule(
      recentHistory,
      proposedSession,
      healthContext
    );

    // If systemic arbitration flags unapproved overload or OTS, interlock local prescription
    if (!arbitration.isApproved) {
      localPrescription.safety_circuit_breakers.is_progressive_overload_allowed = false;
      localPrescription.safety_circuit_breakers.halt_directives.push(...arbitration.scheduleModifications);
      localPrescription.safety_circuit_breakers.contraindicated_movements.push(
        ...arbitration.cnsFatigueStatus.contraindicatedModalities
      );
    }

    return { localPrescription, arbitration };
  }

  /**
   * Grounded fallback handler for sports without an active specialized engine yet.
   */
  private generateFallbackSafePrescription(payload: SportTelemetryPayload): SportPrescriptionOutput {
    const duration = payload.durationMinutes || 30;
    const rpe = payload.sessionRpe || 5;
    const internalAU = calculateSessionRpeLoad(duration, rpe);

    const hasPainOrSwelling = Boolean(
      payload.subjectiveSymptoms &&
      (payload.subjectiveSymptoms.painScoreScale10 >= 4 ||
        payload.subjectiveSymptoms.swellingObserved ||
        payload.subjectiveSymptoms.jointInstabilityReported)
    );

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: `Universal Grounded Safe Ingress (${payload.sportCode})`,
      governing_standard: 'Carl Foster Session-RPE (2001) Universal Standard',
      workload_score: {
        external_load: duration,
        external_unit: 'Minutes',
        internal_strain: internalAU,
        internal_method: 'SESSION_RPE_FOSTER',
      },
      safety_circuit_breakers: {
        is_progressive_overload_allowed: !hasPainOrSwelling,
        halt_directives: hasPainOrSwelling
          ? ['Gejala nyeri atau pembengkakan dilaporkan. Progresi beban otomatis dikunci.']
          : [],
        contraindicated_movements: hasPainOrSwelling
          ? (payload.subjectiveSymptoms?.painLocations || []).map((loc) => `Gerakan membebani sendi ${loc}`)
          : [],
        rehabilitation_alternative: hasPainOrSwelling
          ? 'Istirahat aktif atau mobilitas ringan bebas nyeri.'
          : undefined,
      },
      periodization_directive: {
        mesocycle_phase: 'ACCUMULATION',
        target_intensity_zone: rpe <= 4 ? 'Low Intensity' : rpe <= 7 ? 'Moderate Intensity' : 'High Intensity',
        recommended_rest_hours: rpe >= 8 ? 48 : 24,
        next_session_prescription: 'Jaga beban sesi berikutnya stabil tanpa lonjakan mendadak (>10%).',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: duration > 60 ? 5.0 : 3.5,
        protein_target_g_kg: 1.6,
        hydration_electrolyte_protocol: 'Hidrasi minimal 500 ml air per 60 menit aktivitas.',
        supplementation_evidence_tier_a: ['Cairan Elektrolit'],
      },
    };
  }
}

export const sportCoordinatorRouter = SportCoordinatorRouter.getInstance();
