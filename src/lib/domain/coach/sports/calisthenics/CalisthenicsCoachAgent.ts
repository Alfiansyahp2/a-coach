// Decoupled Flagship Strength Coach: Calisthenics & Street Workout Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from '../../core/contracts';
import { calculateSessionRpeLoad } from '../../kernels/fosterSessionRpeKernel';

export interface CalisthenicsSpecificMetrics {
  primarySkill?: 'PLANCHE' | 'FRONT_LEVER' | 'MUSCLE_UP' | 'HANDSTAND_PUSHUP' | 'WEIGHTED_PULL_DIP';
  progressionLevel?: 'TUCK' | 'ADVANCED_TUCK' | 'STRADDLE' | 'FULL_LEVER';
  totalTimeUnderTensionSec?: number;
  addedWeightKg?: number;
  completedSets?: number;
  completedReps?: number;
  elbowTendonStrain10?: number; // 0-10
}

export class CalisthenicsCoachAgent implements ISportCoachAgent<CalisthenicsSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_CALISTHENICS',
    sportNameId: 'Kalistenik & Street Workout (Skill Levers & Bodyweight)',
    sportNameEn: 'Calisthenics & Street Workout',
    cluster: 'STRENGTH_POWER',
    primaryEnergySystem: 'PHOSPHAGEN_ATP_PC',
    governingStandard: 'WSWCF / Overcoming Gravity (Steven Low Biomechanical Lever Standards)',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_CALISTHENICS' ||
      code === 'CALISTHENICS' ||
      code === 'STREET_WORKOUT' ||
      code === 'BODYWEIGHT'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<CalisthenicsSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<CalisthenicsSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'NEUROMUSCULAR_TONNAGE';
  } {
    const metrics = payload.sportSpecificMetrics || {};
    const tutSec = Number(metrics.totalTimeUnderTensionSec || 0);
    const addedKg = Number(metrics.addedWeightKg || 0);
    const reps = Number(metrics.completedReps || 0);

    // Mechanical external load calculation (weighted work or isometric tension)
    let externalLoad = tutSec > 0 ? tutSec : payload.durationMinutes;
    let externalUnit = tutSec > 0 ? 'Seconds TUT' : 'Minutes';

    if (addedKg > 0 && reps > 0) {
      externalLoad = addedKg * reps;
      externalUnit = 'Added Tonnage (kg)';
    }

    const duration = payload.durationMinutes;
    const rpe = payload.sessionRpe;
    const internalAU = calculateSessionRpeLoad(duration, rpe);

    return {
      externalLoad,
      externalUnit,
      internalStrain: internalAU,
      internalMethod: 'NEUROMUSCULAR_TONNAGE',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<CalisthenicsSpecificMetrics>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  } {
    const symptoms = payload.subjectiveSymptoms;
    const haltDirectives: string[] = [];
    const contraindicatedMovements: string[] = [];

    const hasElbowPain = Boolean(
      symptoms?.painLocations?.some(
        (l) => l.toLowerCase().includes('elbow') || l.toLowerCase().includes('siku') || l.toLowerCase().includes('biceps')
      ) || (payload.sportSpecificMetrics?.elbowTendonStrain10 || 0) >= 4
    );

    const hasWristPain = Boolean(
      symptoms?.painLocations?.some((l) => l.toLowerCase().includes('wrist') || l.toLowerCase().includes('pergelangan'))
    );

    if (hasElbowPain) {
      haltDirectives.push(
        'Nyeri tendon distal biseps atau epikondilitis siku terdeteksi. Tuas isometrik lurus (straight-arm levers) melipatgandakan beban geser pada ligamen siku. Hentikan variasi Planche / Front Lever lurus.'
      );
      contraindicatedMovements.push(
        'Full Planche holds',
        'Straight-arm Front Lever pulls',
        'Pelican curls',
        'Iron Cross progressions'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Alihkan ke bent-arm pulling/pushing ringan bebas nyeri (pull-up reguler, ring rows, push-up) dan penguatan eksentrik pergelangan tangan (wrist curls).',
      };
    }

    if (hasWristPain) {
      haltDirectives.push('Nyeri pergelangan tangan terdeteksi. Gunakan parallettes netral untuk menghindari kompresi ekstensi lantai 90 derajat.');
      contraindicatedMovements.push('Floor flat-palm planche');
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements,
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<CalisthenicsSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};

    const skill = metrics.primarySkill || 'BODYWEIGHT_STRENGTH';
    const level = metrics.progressionLevel || 'STANDARD';

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Calisthenics & Street Workout AI Coach',
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
        target_intensity_zone: safety.isSafe ? `Skill Progression: ${skill} (${level})` : 'Tendon Healing & Bent-Arm Deload',
        recommended_rest_hours: 48,
        next_session_prescription: safety.isSafe
          ? `Pertahankan bentuk tubuh lurus (hollow body & protraksi skapula). Adaptasi tendon memerlukan waktu 4-6x lebih lambat dibanding otot rangka; hindari melompati fase tuas.`
          : 'Hentikan beban isometrik lengan lurus. Lindungi tendon siku dan pergelangan tangan.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 4.0,
        protein_target_g_kg: 1.8,
        hydration_electrolyte_protocol:
          'Konsumsi air 2.5 - 3 liter per hari. Pastikan hidrasi optimal untuk menjaga viskoelastisitas jaringan ikat kolagen dan tendon.',
        supplementation_evidence_tier_a: [
          'Kreatin Monohidrat (5g/hari)',
          'Kolagen Peptida Terhidrolisis (10-15g) + Vitamin C (50mg) 30-60 menit sebelum latihan penguatan tendon',
        ],
      },
    };
  }
}
