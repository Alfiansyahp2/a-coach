// Decoupled Flagship Precision Sport Coach: Archery Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';
import { calculateArcheryVolumeTonnage } from '../kernels/racketAndPrecisionKernel';

export interface ArcherySpecificMetrics {
  arrowCount?: number;
  drawWeightLbs?: number;
  holdDurationSeconds?: number;
  tremorIndexScale10?: number;
  supraspinatusRotatorCuffPainScale10?: number;
  fingerNerveNumbness?: boolean;
}

export class ArcheryCoachAgent implements ISportCoachAgent<ArcherySpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_ARCHERY',
    sportNameId: 'Panahan (Archery)',
    sportNameEn: 'Archery',
    cluster: 'RACQUET_PRECISION',
    primaryEnergySystem: 'PHOSPHAGEN_ATP_PC',
    governingStandard: 'World Archery Federation Medical Committee Guidelines',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_ARCHERY' ||
      code === 'ARCHERY' ||
      code === 'PANAHAN' ||
      code === 'RECURVE' ||
      code === 'COMPOUND_BOW'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<ArcherySpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<ArcherySpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 4)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const tonnage = calculateArcheryVolumeTonnage(
      Number(metrics.arrowCount || 60),
      Number(metrics.drawWeightLbs || 38)
    );

    return {
      externalLoad: tonnage.volumeTonnageKg,
      externalUnit: 'Kilograms Tonnage',
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<ArcherySpecificMetrics>): {
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

    // 1. Supraspinatus Rotator Cuff & Bow Arm Impingement
    const shoulderPain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.supraspinatusRotatorCuffPainScale10 ||
            (symptomsList.some((l) => l.includes('shoulder') || l.includes('bahu') || l.includes('supraspinatus'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );
    if (shoulderPain >= 4) {
      haltDirectives.push(
        `Nyeri manset rotator cuff (m. supraspinatus) sisi lengan busur ${shoulderPain}/10 akibat penahanan beban tarikan (hold time). Kunci penarikan busur poundage berat.`
      );
      contraindicatedMovements.push(
        'Full poundage bow draw and long anchor holds (>8 seconds)',
        'Repetitive end-range release drills without rest'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Latihan retraksi skapula dengan karet elastis beban ringan (Theraband), Face Pulls, dan istirahat 48 jam dari busur kompetisi.',
      };
    }

    // 2. Finger Digital Nerve Compression
    if (metrics.fingerNerveNumbness) {
      haltDirectives.push(
        'Kebas/kesemutan pada saraf digital jari tangan penarik akibat tekanan tali busur (bowstring). Periksa ketebalan finger tab.'
      );
      contraindicatedMovements.push('Shooting without thick finger tab / glove');
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative: 'Gunakan finger tab kulit tebal ganda dan kurangi waktu kait jari.',
      };
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<ArcherySpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const dur = Math.max(1, Number(payload.durationMinutes || 0));

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Archery (Panahan) AI Coach',
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
        target_intensity_zone: safety.isSafe ? `Static Precision Volume (${metrics.arrowCount || 60} anak panah, ${metrics.drawWeightLbs || 38} lbs)` : 'Scapular Active Rest',
        recommended_rest_hours: 24,
        next_session_prescription: safety.isSafe
          ? `Tonase tarikan ${workload.externalLoad} kg akumulatif tuntas. Pertahankan konsistensi anchor point dan stabilitas retraksi skapula.`
          : 'Hentikan penarikan busur penuh. Fokus pada fisioterapi manset bahu dan mobilitas torakal.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 4.0,
        protein_target_g_kg: 1.5,
        hydration_electrolyte_protocol:
          'Pertahankan hidrasi optimal untuk kestabilan motorik halus; batasi kafein berlebih yang dapat meningkatkan tremor tangan.',
        supplementation_evidence_tier_a: [
          'L-Theanine 100-200mg (menurunkan tremor postural & meningkatkan fokus mental)',
          'Magnesium Glycinate 300mg (relaksasi neuromuskular malam hari)',
        ],
      },
    };
  }
}
