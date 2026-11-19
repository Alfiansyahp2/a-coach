// Decoupled Flagship Combat Sport Coach: Judo Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';
import {
  evaluateWeightCutSafety,
} from '../kernels/combatSportsKernel';

export interface JudoSpecificMetrics {
  uchikomiCount?: number;
  nageWazaThrowsCount?: number;
  ukemiBreakfallsCount?: number;
  randoriMinutes?: number;
  kumikataFingerStrainScale10?: number;
  shoulderSubluxationPainScale10?: number;
  meniscusTwistPainScale10?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  daysUntilWeighIn?: number;
}

export class JudoCoachAgent implements ISportCoachAgent<JudoSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_JUDO',
    sportNameId: 'Judo & Sambo',
    sportNameEn: 'Judo & Sambo',
    cluster: 'COMBAT_MARTIAL_ARTS',
    primaryEnergySystem: 'ANAEROBIC_GLYCOLYTIC',
    governingStandard: 'International Judo Federation (IJF) Medical Commission & Kodokan Safety Rules',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_JUDO' ||
      code === 'JUDO' ||
      code === 'SAMBO' ||
      code === 'KODOKAN' ||
      code === 'JUDOKA'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<JudoSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<JudoSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const throws = Math.max(0, Number(metrics.nageWazaThrowsCount || 0));
    const uchikomi = Math.max(0, Number(metrics.uchikomiCount || 0));
    const loadCount = throws > 0 ? throws : (uchikomi > 0 ? uchikomi : dur);
    const unit = throws > 0 ? 'Throws' : (uchikomi > 0 ? 'Uchikomi' : 'Minutes');

    return {
      externalLoad: loadCount,
      externalUnit: unit,
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<JudoSpecificMetrics>): {
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

    // 1. Shoulder Acromioclavicular (AC) Joint & Labrum Guard (Seoi-Nage / Tai-Otoshi load)
    const shoulderPain = Math.max(
      0,
      Math.min(10, Number(metrics.shoulderSubluxationPainScale10 || (symptomsList.some((l) => l.includes('shoulder') || l.includes('bahu')) ? symptoms?.painScoreScale10 : 0) || 0))
    );
    if (shoulderPain >= 4) {
      haltDirectives.push(
        `Nyeri sendi bahu/labrum ${shoulderPain}/10 terdeteksi akibat tarikan rotasi lemparan atau bantingan. Kunci latihan bantingan angkat beban pasangan.`
      );
      contraindicatedMovements.push(
        'Ippon Seoi Nage and Morote Seoi Nage (shoulder flexion-rotation load)',
        'Full projection throws with partner weight bearing on shoulder'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Latihan footwork ashi-waza ringan, uchikomi dengan karet elastis, dan rotasi eksternal manset rotator cuff.',
      };
    }

    // 2. Knee Meniscus Rotational Shear Guard (Osoto-Gari / Harai-Goshi pivot)
    const kneePain = Math.max(
      0,
      Math.min(10, Number(metrics.meniscusTwistPainScale10 || (symptomsList.some((l) => l.includes('knee') || l.includes('lutut')) ? symptoms?.painScoreScale10 : 0) || 0))
    );
    if (kneePain >= 4) {
      haltDirectives.push(
        `Nyeri puntiran sendi lutut tumpu ${kneePain}/10 terdeteksi. Kunci bantingan sapuan/kaitan berat.`
      );
      contraindicatedMovements.push(
        'Osoto Gari & Ouchi Gari pivot reaping actions',
        'Standing pivot throws causing tibial rotational torsion'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Fokus pada ne-waza (matwork) posisi bawah tanpa pembebanan sendi lutut berdiri.',
      };
    }

    // 3. Weight-Cut Rapid Dehydration Guard
    if (metrics.currentWeightKg && metrics.targetWeightKg) {
      const weightCut = evaluateWeightCutSafety(
        metrics.currentWeightKg,
        metrics.targetWeightKg,
        metrics.daysUntilWeighIn || 7
      );
      if (weightCut.isEmergencyAlert) {
        haltDirectives.push(weightCut.directive);
        contraindicatedMovements.push('Extreme weight cutting dehydration');
        return {
          isSafe: false,
          haltDirectives,
          contraindicatedMovements,
          rehabilitationAlternative: 'Rehidrasi bertahap dengan pengawasan dokter tim.',
        };
      }
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<JudoSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));

    const weightCut = evaluateWeightCutSafety(
      metrics.currentWeightKg || 80,
      metrics.targetWeightKg || 80,
      metrics.daysUntilWeighIn || 7
    );

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Judo & Sambo AI Coach',
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
        target_intensity_zone: safety.isSafe ? `Judo Workload (Uchikomi: ${metrics.uchikomiCount || 0}, Randori: ${metrics.randoriMinutes || 0} min)` : 'Active Joint Rest & Ukemi Deload',
        recommended_rest_hours: rpe >= 8 ? 48 : 24,
        next_session_prescription: safety.isSafe
          ? `Volume latihan judo ${dur} menit tercapai dengan efisiensi baik. Pertahankan postur shizen-tai dan koordinasi kuzushi sebelum tsukuri.`
          : 'Hentikan sesi randori kompetitif dan bantingan proyeksi penuh. Fokus pada pemulihan sendi bahu dan lutut.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 5.5,
        protein_target_g_kg: weightCut.proteinPrescriptionGKg,
        hydration_electrolyte_protocol:
          'Konsumsi cairan elektrolit seimbang 1.5 - 2.0 L per hari dengan rasio natrium 500 mg/L.',
        supplementation_evidence_tier_a: [
          'Kreatin Monohidrat 5g (ledakan kuzushi & melempar)',
          'Omega-3 EPA/DHA 2000mg (kesehatan kartilago sendi)',
          'Whey Protein Isolate 30g',
        ],
      },
    };
  }
}
