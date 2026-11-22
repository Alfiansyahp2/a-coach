// Decoupled Flagship Strength Coach: Powerlifting (SBD) Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from '../../core/contracts';
import {
  calculateBrzycki1RM,
  calculateVolumeLoadTonnage,
  calculateSessionInol,
} from '../../kernels/strengthCalculatorsKernel';
import { calculateSessionRpeLoad } from '../../kernels/fosterSessionRpeKernel';

export interface PowerliftingWorkingSet {
  weightKg: number;
  reps: number;
  intensityPct1rm?: number;
}

export interface PowerliftingSpecificMetrics {
  primaryLift?: 'SQUAT' | 'BENCH_PRESS' | 'DEADLIFT' | 'ACCESSORY';
  workingSets?: PowerliftingWorkingSet[];
  bestSetWeightKg?: number;
  bestSetReps?: number;
  rir?: number; // Reps in Reserve
  target1rmGoalKg?: number;
  barVelocityMps?: number;
}

export class PowerliftingCoachAgent implements ISportCoachAgent<PowerliftingSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_POWERLIFTING',
    sportNameId: 'Powerlifting (Squat, Bench Press, Deadlift)',
    sportNameEn: 'Powerlifting (SBD)',
    cluster: 'STRENGTH_POWER',
    primaryEnergySystem: 'PHOSPHAGEN_ATP_PC',
    governingStandard: 'IPF Technical Rulebook & Eric Helms/Zourdos RPE-RIR Periodization',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_POWERLIFTING' ||
      code === 'POWERLIFTING' ||
      code === 'SBD' ||
      code === 'WEIGHT_TRAINING' ||
      code === 'GYM_POWER'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<PowerliftingSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<PowerliftingSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'NEUROMUSCULAR_TONNAGE';
  } {
    const sets = payload.sportSpecificMetrics?.workingSets || [];
    const tonnage = calculateVolumeLoadTonnage(sets);
    const duration = payload.durationMinutes;
    const rpe = payload.sessionRpe;
    const rpeStrain = calculateSessionRpeLoad(duration, rpe);

    return {
      externalLoad: tonnage.totalTonnageKg > 0 ? tonnage.totalTonnageKg : payload.durationMinutes,
      externalUnit: tonnage.totalTonnageKg > 0 ? 'Tonnage (kg)' : 'Minutes',
      internalStrain: rpeStrain,
      internalMethod: 'NEUROMUSCULAR_TONNAGE',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<PowerliftingSpecificMetrics>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  } {
    const symptoms = payload.subjectiveSymptoms;
    const haltDirectives: string[] = [];
    const contraindicatedMovements: string[] = [];

    const hasBackPain = Boolean(
      symptoms?.painLocations?.some(
        (l) => l.toLowerCase().includes('lumbar') || l.toLowerCase().includes('back') || l.toLowerCase().includes('spine')
      ) || (symptoms?.painScoreScale10 || 0) >= 3
    );

    const hasPecOrShoulderPain = Boolean(
      symptoms?.painLocations?.some(
        (l) => l.toLowerCase().includes('pectoral') || l.toLowerCase().includes('shoulder')
      )
    );

    if (hasBackPain) {
      haltDirectives.push(
        'Nyeri lumbal tulang belakang atau fleksi spinal terdeteksi. Risiko herniasi diskus intervertebralis pada beban aksial tinggi. Hentikan beban angkatan maksimal (squat & deadlift).'
      );
      contraindicatedMovements.push(
        'Heavy axial spinal loading (>75% 1RM Squat/Deadlift)',
        'Good mornings',
        'Stiff-leg deadlifts near failure'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Lakukan McGill Big 3 (Bird-Dog, Curl-Up, Side Plank) untuk dekompresi tulang belakang dan latihan non-aksial (Leg Press / Belt Squat).',
      };
    }

    if (hasPecOrShoulderPain) {
      haltDirectives.push('Nyeri tajam pada tendon pektoralis mayor atau sendi glenohumeral. Wajib evaluasi arch dan lebar grip bench press.');
      contraindicatedMovements.push('Wide-grip touch-and-go bench press', 'Heavy dumbbell flyes');
    }

    // INOL CNS Fatigue Check
    const setsWithIntensity = (payload.sportSpecificMetrics?.workingSets || []).map((s) => ({
      intensityPct1rm: s.intensityPct1rm || (s.weightKg && payload.sportSpecificMetrics?.bestSetWeightKg ? (s.weightKg / payload.sportSpecificMetrics.bestSetWeightKg) * 100 : 75),
      reps: s.reps,
    }));
    const inol = calculateSessionInol(setsWithIntensity);
    if (inol.fatigueRating === 'EXCESSIVE_CNS_STRAIN') {
      haltDirectives.push(`INOL Sesi (${inol.totalInol}) melampaui batas aman. ${inol.recommendation}`);
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements,
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<PowerliftingSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const sets = metrics.workingSets || [];
    const tonnage = calculateVolumeLoadTonnage(sets);

    // 1RM estimation via Brzycki Formula
    let e1rmSummary = '';
    const bestWeight = metrics.bestSetWeightKg || (sets[0]?.weightKg ?? 0);
    const bestReps = metrics.bestSetReps || (sets[0]?.reps ?? 1);
    if (bestWeight > 0) {
      const e1rm = calculateBrzycki1RM(bestWeight, bestReps);
      e1rmSummary = ` Estimasi 1RM Brzycki: ${e1rm.estimated1rmKg} kg (dari set ${bestWeight}kg x ${bestReps} reps).`;
    }

    // INOL Fatigue summary
    const setsWithIntensity = sets.map((s) => ({
      intensityPct1rm: s.intensityPct1rm || 75,
      reps: s.reps,
    }));
    const inol = calculateSessionInol(setsWithIntensity);

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Powerlifting (SBD) AI Coach',
      governing_standard: this.metadata.governingStandard,
      workload_score: {
        external_load: workload.externalLoad,
        external_unit: workload.externalUnit,
        internal_strain: workload.internalStrain,
        internal_method: workload.internalMethod,
      },
      safety_circuit_breakers: {
        is_progressive_overload_allowed: safety.isSafe && inol.fatigueRating !== 'EXCESSIVE_CNS_STRAIN',
        halt_directives: safety.haltDirectives,
        contraindicated_movements: safety.contraindicatedMovements,
        rehabilitation_alternative: safety.rehabilitationAlternative,
      },
      periodization_directive: {
        mesocycle_phase: safety.isSafe ? 'TRANSMUTATION' : 'REHABILITATION_DELOAD',
        target_intensity_zone: safety.isSafe ? 'Heavy Strength (RPE 7.5 - 9.0)' : 'Deload Recovery (<60% 1RM)',
        recommended_rest_hours: inol.totalInol > 1.2 ? 72 : 48,
        next_session_prescription: safety.isSafe
          ? `Tonase sesi: ${tonnage.totalTonnageKg} kg across ${tonnage.completedSets} sets.${e1rmSummary} INOL Sesi: ${inol.totalInol} (${inol.fatigueRating}). ${inol.recommendation}`
          : 'Hentikan pembebanan aksial. Prioritaskan integritas lumbal dan dekompresi tulang belakang.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 4.5,
        protein_target_g_kg: 2.0, // ISSN Strength Recommendation: 1.8-2.2 g/kg
        hydration_electrolyte_protocol:
          'Konsumsi air minimal 3-4 liter/hari. Pastikan asupan natrium dan magnesium cukup untuk transmisi impuls neuromuskular optimal.',
        supplementation_evidence_tier_a: [
          'Kreatin Monohidrat (5g/hari secara konsisten)',
          'Kafein Anhidrat (3-5 mg/kg BB pre-workout)',
          'Whey Protein Isolate (25-35g pasca latihan)',
        ],
      },
    };
  }
}
