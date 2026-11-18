// Decoupled Multi-Sport Coordinator Router & Agent Registry
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';
import { calculateSessionRpeLoad } from '../kernels/fosterSessionRpeKernel';

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
   * Retrieves a registered agent by sport code.
   */
  public getAgent(sportCode: string): ISportCoachAgent | undefined {
    return this.agents.get(sportCode.toUpperCase());
  }

  /**
   * Checks whether an agent is registered for a given sport code.
   */
  public hasAgent(sportCode: string): boolean {
    return this.agents.has(sportCode.toUpperCase());
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
