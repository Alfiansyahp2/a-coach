// Decoupled Flagship Strength Coach: Olympic Weightlifting Agent (Snatch, Clean & Jerk)
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from '../../core/contracts';
import { calculateVolumeLoadTonnage } from '../../kernels/strengthCalculatorsKernel';
import { calculateSessionRpeLoad } from '../../kernels/fosterSessionRpeKernel';

export interface WeightliftingSet {
  weightKg: number;
  reps: number;
  isSuccessful: boolean;
  barVelocityMps?: number;
}

export interface WeightliftingSpecificMetrics {
  primaryDiscipline?: 'SNATCH' | 'CLEAN_AND_JERK' | 'OVERHEAD_SQUAT' | 'PULLS';
  attempts?: WeightliftingSet[];
  bestSnatchKg?: number;
  bestCleanAndJerkKg?: number;
  barVelocityMps?: number;
  catchDepthComfortScore10?: number; // 1-10
}

export class OlympicWeightliftingCoachAgent implements ISportCoachAgent<WeightliftingSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_WEIGHTLIFTING',
    sportNameId: 'Angkat Besi Olimpiade (Snatch, Clean & Jerk)',
    sportNameEn: 'Olympic Weightlifting',
    cluster: 'STRENGTH_POWER',
    primaryEnergySystem: 'PHOSPHAGEN_ATP_PC',
    governingStandard: 'IWF Technical & Competition Rulebook / USA Weightlifting Velocity Standards',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_WEIGHTLIFTING' ||
      code === 'WEIGHTLIFTING' ||
      code === 'OLYMPIC_LIFTING' ||
      code === 'SNATCH' ||
      code === 'CLEAN_AND_JERK'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<WeightliftingSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<WeightliftingSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'NEUROMUSCULAR_TONNAGE';
  } {
    const attempts = payload.sportSpecificMetrics?.attempts || [];
    const successfulSets = attempts.filter((a) => a.isSuccessful);
    const tonnage = calculateVolumeLoadTonnage(successfulSets);
    const duration = payload.durationMinutes;
    const rpe = payload.sessionRpe;
    const internalAU = calculateSessionRpeLoad(duration, rpe);

    return {
      externalLoad: tonnage.totalTonnageKg > 0 ? tonnage.totalTonnageKg : payload.durationMinutes,
      externalUnit: tonnage.totalTonnageKg > 0 ? 'Tonnage (kg)' : 'Minutes',
      internalStrain: internalAU,
      internalMethod: 'NEUROMUSCULAR_TONNAGE',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<WeightliftingSpecificMetrics>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  } {
    const symptoms = payload.subjectiveSymptoms;
    const haltDirectives: string[] = [];
    const contraindicatedMovements: string[] = [];

    const hasWristPain = Boolean(
      symptoms?.painLocations?.some((l) => l.toLowerCase().includes('wrist') || l.toLowerCase().includes('pergelangan')) ||
      (symptoms?.painScoreScale10 || 0) >= 3
    );

    const hasKneeCatchPain = Boolean(
      symptoms?.painLocations?.some((l) => l.toLowerCase().includes('patella') || l.toLowerCase().includes('knee'))
    );

    if (hasWristPain) {
      haltDirectives.push(
        'Nyeri hiperekstensi pergelangan tangan (wrist sprain / TFCC strain) terdeteksi saat catch position. Hentikan penerimaan beban overhead maksimal.'
      );
      contraindicatedMovements.push(
        'Heavy Snatch catch at full depth',
        'Clean front rack with excessive wrist extension',
        'Heavy overhead squats'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Lakukan variasi Clean Pulls, Snatch Pulls, atau Front Squat dengan cross-grip strap tanpa membebani ekstensi pergelangan tangan.',
      };
    }

    if (hasKneeCatchPain) {
      haltDirectives.push('Nyeri patela saat transisi deep catch squat. Batasi kedalaman ke Power Snatch / Power Clean.');
      contraindicatedMovements.push('Full depth bounce squat catch');
    }

    // Technical breakdown & miss rate analysis
    const attempts = payload.sportSpecificMetrics?.attempts || [];
    if (attempts.length >= 4) {
      const misses = attempts.filter((a) => !a.isSuccessful).length;
      const missRate = (misses / attempts.length) * 100;
      if (missRate > 35) {
        haltDirectives.push(
          `Tingkat kegagalan teknik tinggi (${missRate.toFixed(0)}% misses). Kelelahan sistem saraf pusat (CNS) merusak koordinasi motorik sepersekian detik. Turunkan beban ke rentang teknis 70-75%.`
        );
      }
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements,
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<WeightliftingSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const attempts = metrics.attempts || [];
    const successful = attempts.filter((a) => a.isSuccessful);
    const tonnage = calculateVolumeLoadTonnage(successful);

    // Bar velocity note
    const velocity = Number(metrics.barVelocityMps || 0);
    let velocitySummary = 'Fokus pada kecepatan ekstensi triple extension (panggul, lutut, pergelangan kaki).';
    if (velocity > 0) {
      velocitySummary = velocity >= 1.2
        ? `Kecepatan barbel prima (${velocity.toFixed(2)} m/s). Daya ledak alaktat optimal.`
        : `Kecepatan barbel sub-optimal (${velocity.toFixed(2)} m/s). Prioritaskan kecepatan gerak atas berat beban.`;
    }

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Olympic Weightlifting AI Coach',
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
        mesocycle_phase: safety.isSafe ? 'TRANSMUTATION' : 'REHABILITATION_DELOAD',
        target_intensity_zone: safety.isSafe ? 'Speed-Strength & Technical Precision' : 'Technical Deload (<70%)',
        recommended_rest_hours: 48,
        next_session_prescription: safety.isSafe
          ? `Tonase sukses: ${tonnage.totalTonnageKg} kg (${tonnage.completedSets} set berhasil). ${velocitySummary}`
          : 'Hentikan angkatan overhead penuh. Lindungi sendi pergelangan tangan dan pulihkan koordinasi neuromuskular.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 5.0,
        protein_target_g_kg: 1.8,
        hydration_electrolyte_protocol:
          'Jaga hidrasi optimal dengan elektrolit sebelum sesi ledakan neuromuskular tinggi. Dehidrasi 2% mendegradasi koordinasi dan daya ledak hingga 15%.',
        supplementation_evidence_tier_a: [
          'Kreatin Monohidrat (5g/hari untuk resintesis fosfagen cepat)',
          'Kafein Anhidrat (3 mg/kg BB)',
          'Whey Protein',
        ],
      },
    };
  }
}
