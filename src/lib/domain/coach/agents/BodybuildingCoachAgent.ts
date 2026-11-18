// Decoupled Flagship Strength Coach: Bodybuilding & Hypertrophy Engineering Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';
import { calculateSessionRpeLoad } from '../kernels/fosterSessionRpeKernel';

export interface BodybuildingSpecificMetrics {
  targetMuscleGroup?: 'CHEST' | 'BACK' | 'QUADS' | 'HAMSTRINGS' | 'SHOULDERS' | 'ARMS' | 'FULL_BODY';
  hardSetsCount?: number; // Sets taken to RIR 0-3
  averageReps?: number;
  averageRir?: number; // Reps in Reserve (0 - 4)
  weeklySetsAccumulated?: number;
  pumpScore10?: number; // 1-10 subjective metabolic stress
}

export class BodybuildingCoachAgent implements ISportCoachAgent<BodybuildingSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_BODYBUILDING',
    sportNameId: 'Binaraga & Rekayasa Hipertrofi Otot',
    sportNameEn: 'Bodybuilding & Hypertrophy Engineering',
    cluster: 'STRENGTH_POWER',
    primaryEnergySystem: 'ANAEROBIC_GLYCOLYTIC',
    governingStandard: 'Brad Schoenfeld Hypertrophy Science & ISSN Resistance Training Position Stand',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_BODYBUILDING' ||
      code === 'BODYBUILDING' ||
      code === 'HYPERTROPHY' ||
      code === 'MUSCLE_BUILDING' ||
      code === 'BODY_BUILDING'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<BodybuildingSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<BodybuildingSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'NEUROMUSCULAR_TONNAGE';
  } {
    const metrics = payload.sportSpecificMetrics || {};
    const hardSets = Number(metrics.hardSetsCount || 0);

    const externalLoad = hardSets > 0 ? hardSets : payload.durationMinutes;
    const externalUnit = hardSets > 0 ? 'Hard Sets' : 'Minutes';

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

  public evaluateSafety(payload: SportTelemetryPayload<BodybuildingSpecificMetrics>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  } {
    const symptoms = payload.subjectiveSymptoms;
    const haltDirectives: string[] = [];
    const contraindicatedMovements: string[] = [];

    const hasShoulderImpingement = Boolean(
      symptoms?.painLocations?.some((l) => l.toLowerCase().includes('shoulder') || l.toLowerCase().includes('bahu'))
    );

    const hasKneeTendinopathy = Boolean(
      symptoms?.painLocations?.some((l) => l.toLowerCase().includes('knee') || l.toLowerCase().includes('lutut'))
    );

    if (hasShoulderImpingement) {
      haltDirectives.push(
        'Nyeri impingement sendi bahu anterior terdeteksi. Batasi rentang gerak ekstensi berlebih pada dumbbell flyes dan deep chest dips.'
      );
      contraindicatedMovements.push('Deep dumbbell chest flyes', 'Weighted chest dips near failure', 'Behind-the-neck presses');
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Gunakan kabel silang (cable cross-over) dengan lintasan bebas nyeri dan latihan penguatan rotator cuff (external rotation).',
      };
    }

    if (hasKneeTendinopathy) {
      haltDirectives.push('Nyeri tendon patela lutut terdeteksi saat ekstensi kuadrisep. Hindari leg extension berat ke titik kegagalan (RIR 0).');
      contraindicatedMovements.push('Heavy leg extensions with ballistic lockout');
    }

    // Junk Volume check (Schoenfeld et al., 2016/2021)
    const hardSets = Number(payload.sportSpecificMetrics?.hardSetsCount || 0);
    if (hardSets > 10) {
      haltDirectives.push(
        `Volume sesi tinggi (${hardSets} set keras untuk 1 kelompok otot). Melebihi 8-10 set dalam 1 sesi memicu 'junk volume' (titik jenuh sintesis protein dan kerusakan serat otot berlebih). Sebar volume ke 2 sesi per minggu.`
      );
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements,
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<BodybuildingSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};

    const muscle = metrics.targetMuscleGroup || 'TARGET_MUSCLE';
    const hardSets = Number(metrics.hardSetsCount || 0);
    const rir = Number(metrics.averageRir ?? 2);

    let rirQualityText = `Kedekatan ke titik failure (RIR ${rir}) optimal untuk rekrutmen motor unit ambang tinggi.`;
    if (rir > 4) {
      rirQualityText = `RIR rerata (${rir}) terlalu jauh dari failure. Dekatkan ke 1-3 RIR untuk memicu stimulus tegangan mekanik maksimal.`;
    } else if (rir === 0) {
      rirQualityText = `RIR 0 (kegagalan total di setiap set). Batasi failure total hanya pada set terakhir untuk menjaga kapasitas neuromuskular set berikutnya.`;
    }

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Bodybuilding & Hypertrophy AI Coach',
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
        target_intensity_zone: safety.isSafe ? `Hypertrophy Target: ${muscle} (10-20 weekly sets)` : 'Joint Recovery & Deload',
        recommended_rest_hours: hardSets >= 8 ? 48 : 24,
        next_session_prescription: safety.isSafe
          ? `${hardSets} hard sets tercatat. ${rirQualityText} Targetkan akumulasi 10-20 set mingguan per kelompok otot.`
          : 'Hentikan pembebanan sendi yang terinflamasi. Utamakan perbaikan jaringan ikat.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 4.5,
        protein_target_g_kg: 2.0, // ISSN Standard: 1.6-2.2 g/kg
        hydration_electrolyte_protocol:
          'Minum 3 liter air per hari. Konsumsi protein terbagi rata 4-5 kali sehari (0.4 g/kg per waktu makan) untuk memicu aktivasi sintesis protein otot (MPS) berkala.',
        supplementation_evidence_tier_a: [
          'Kreatin Monohidrat (5g/hari secara konsisten)',
          'Whey Protein Isolate (25-30g pasca latihan)',
          'Kafein (3-4 mg/kg BB)',
        ],
      },
    };
  }
}
