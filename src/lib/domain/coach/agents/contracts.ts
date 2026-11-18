// Pure Clean Architecture Contracts for Decoupled Multi-Sport AI Coach Engines
import {
  SportCluster,
  PrimaryEnergySystem,
  SubjectiveSymptomsReport,
  SportPrescriptionPayload,
} from '@/types/sportTelemetry';

export interface SportCoachMetadata {
  sportCode: string; // e.g. 'SPORT_DISTANCE_RUNNING', 'SPORT_POWERLIFTING'
  sportNameId: string; // e.g. 'Lari Jarak Jauh & Maraton'
  sportNameEn: string; // e.g. 'Distance Running & Marathon'
  cluster: SportCluster;
  primaryEnergySystem: PrimaryEnergySystem;
  governingStandard: string; // e.g. 'World Athletics / ACSM Guidelines'
  version: string;
}

export interface SportTelemetryPayload<TData = Record<string, unknown>> {
  sessionId: string;
  athleteId: string;
  sportCode: string;
  timestamp: string;
  durationMinutes: number;
  sessionRpe: number; // 1 - 10 Foster Scale
  sportSpecificMetrics: TData;
  subjectiveSymptoms?: SubjectiveSymptomsReport;
}

export interface SportPrescriptionOutput extends SportPrescriptionPayload {
  sessionId: string;
  generatedAt: string;
}

export interface ISportCoachAgent<TData = Record<string, unknown>> {
  readonly metadata: SportCoachMetadata;

  /**
   * 0. Determines whether this agent can handle a specific sport code or alias.
   */
  canHandle(sportCode: string): boolean;

  /**
   * 1. Validates and parses incoming raw sensor or manual telemetry.
   */
  validateTelemetry(payload: SportTelemetryPayload<TData>): { isValid: boolean; error?: string };

  /**
   * 2. Computes sport-specific physiological and mechanical training load.
   */
  computeWorkload(payload: SportTelemetryPayload<TData>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'TRIMP_BANISTER' | 'SESSION_RPE_FOSTER' | 'NEUROMUSCULAR_TONNAGE' | 'PLAYER_LOAD_AU';
  };

  /**
   * 3. Evaluates biomechanical safety, joint stress, and clinical circuit breakers.
   */
  evaluateSafety(payload: SportTelemetryPayload<TData>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  };

  /**
   * 4. Synthesizes evidence-based prescription, recovery timeline, and nutrition advice.
   */
  generatePrescription(payload: SportTelemetryPayload<TData>): Promise<SportPrescriptionOutput>;
}
