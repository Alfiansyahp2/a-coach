// Decoupled Flagship Aquatic Sport Coach: Swimming Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from '../../core/contracts';
import { calculateSwolfScore } from '../../kernels/racketAndPrecisionKernel';

export interface SwimmingSpecificMetrics {
  distanceMeters?: number;
  lapCount?: number;
  strokeType?: 'FREESTYLE' | 'BREASTSTROKE' | 'BACKSTROKE' | 'BUTTERFLY' | 'MEDLEY';
  swolfScore?: number;
  averageLapTimeSeconds?: number;
  strokeRateSpm?: number;
  shoulderImpingementScoreScale10?: number;
}

export class SwimmingCoachAgent implements ISportCoachAgent<SwimmingSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_SWIMMING',
    sportNameId: 'Renang (Swimming)',
    sportNameEn: 'Swimming',
    cluster: 'CYCLIC_ENDURANCE',
    primaryEnergySystem: 'OXIDATIVE',
    governingStandard: 'World Aquatics (FINA) & American Swimming Coaches Association (ASCA)',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_SWIMMING' ||
      code === 'SWIMMING' ||
      code === 'RENANG' ||
      code === 'SWIM' ||
      code === 'POOL_SWIMMING' ||
      code === 'OPEN_WATER_SWIMMING'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<SwimmingSpecificMetrics>): {
    isValid: boolean;
    error?: string;
  } {
    if (!payload.durationMinutes || payload.durationMinutes <= 0) {
      return { isValid: false, error: 'Duration minutes must be greater than 0' };
    }
    if (payload.sessionRpe < 1 || payload.sessionRpe > 10) {
      return { isValid: false, error: 'Session RPE must be between 1 and 10' };
    }
    return { isValid: true };
  }

  public computeWorkload(payload: SportTelemetryPayload<SwimmingSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const distMeters = Math.max(0, Number(metrics.distanceMeters || 0));
    const distKm = distMeters > 0 ? Number((distMeters / 1000).toFixed(2)) : dur;
    const unit = distMeters > 0 ? 'Kilometers' : 'Minutes';

    return {
      externalLoad: distKm,
      externalUnit: unit,
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<SwimmingSpecificMetrics>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  } {
    const haltDirectives: string[] = [];
    const contraindicatedMovements: string[] = [];
    const metrics = payload.sportSpecificMetrics || {};
    const symptoms = payload.subjectiveSymptoms;
    const symptomsList = (symptoms?.painLocations || []).map((l) => l.toLowerCase());

    const shoulderPain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.shoulderImpingementScoreScale10 ||
            (symptomsList.some((l) => l.includes('shoulder') || l.includes('bahu') || l.includes('subacromial'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );

    if (shoulderPain >= 4) {
      haltDirectives.push(
        `Nyeri kompresi sendi subakromial/bahu perenang (Swimmer's Shoulder) ${shoulderPain}/10 terdeteksi. Kunci kayuhan gaya bebas sprint dan gaya kupu-kupu overhead.`
      );
      contraindicatedMovements.push(
        'Maximal sprint freestyle pull phase',
        'Butterfly stroke overhead recovery',
        'Large hand paddle resistance training'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Latihan tendangan tungkai dengan papan pelampung (kickboard drills), rotasi eksternal karet, dan peregangan kapsul posterior bahu.',
      };
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<SwimmingSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));

    const swolf = calculateSwolfScore(metrics.averageLapTimeSeconds || 32, 16, 25);

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Swimming (Renang) AI Coach',
      governing_standard: this.metadata.governingStandard,
      workload_score: {
        external_load: workload.externalLoad,
        external_unit: workload.externalUnit,
        internal_strain: workload.internalStrain,
        internal_method: workload.internalMethod,
      },
      safety_circuit_breakers: {
        is_progressive_overload_allowed: safety.isSafe,
        halt_directives: safety.haltDirectives,
        contraindicated_movements: safety.contraindicatedMovements,
        rehabilitation_alternative: safety.rehabilitationAlternative,
      },
      periodization_directive: {
        mesocycle_phase: safety.isSafe ? 'ACCUMULATION' : 'REHABILITATION_DELOAD',
        target_intensity_zone: safety.isSafe ? `Aerobic Base Swim (${metrics.strokeType || 'FREESTYLE'}, SWOLF: ${swolf.swolfScore})` : 'Active Recovery Kickboard Drill',
        recommended_rest_hours: rpe >= 8 ? 36 : 24,
        next_session_prescription: safety.isSafe
          ? `Total Jarak: ${workload.externalLoad} km (Laju Kayuhan: ${metrics.strokeRateSpm || 30} SPM). ${swolf.directive}`
          : 'Hentikan tarikan lengan penuh. Fokus pada teknik tendangan kaki dan mobilitas skapula.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 6.0,
        protein_target_g_kg: 1.6,
        hydration_electrolyte_protocol:
          'Meskipun di dalam air dingin, kehilangan cairan tetap terjadi. Konsumsi 500-750 mL air per 60 menit sesi berenang.',
        supplementation_evidence_tier_a: [
          'Beta-Alanin 3.2-4.0g (kapasitas anaerobik laktat set interval)',
          'Whey Protein Isolate 25g',
          'Elektrolit Hipotonik (mencegah kram betis perenang)',
        ],
      },
    };
  }
}
