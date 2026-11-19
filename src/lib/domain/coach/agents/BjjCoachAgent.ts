// Decoupled Flagship Combat Sport Coach: Brazilian Jiu-Jitsu & Grappling (BJJ) Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';
import {
  evaluateWeightCutSafety,
  evaluateGrapplingJointAndCervicalRisk,
} from '../kernels/combatSportsKernel';

export interface BjjSpecificMetrics {
  matTimeMinutes?: number;
  sparringRounds?: number;
  drillingMinutes?: number;
  submissionsAttempted?: number;
  submissionEscapesCount?: number;
  neckPainScoreScale10?: number;
  kneeCollateralPainScale10?: number;
  gripStrainScoreScale10?: number;
  hyperextendedJoint?: boolean;
  currentWeightKg?: number;
  targetWeightKg?: number;
  daysUntilWeighIn?: number;
}

export class BjjCoachAgent implements ISportCoachAgent<BjjSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_BJJ',
    sportNameId: 'Brazilian Jiu-Jitsu (BJJ & Grappling)',
    sportNameEn: 'Brazilian Jiu-Jitsu & Grappling',
    cluster: 'COMBAT_MARTIAL_ARTS',
    primaryEnergySystem: 'ANAEROBIC_GLYCOLYTIC',
    governingStandard: 'IBJJF Medical Regulations & ADCC World Grappling Safety Protocol',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_BJJ' ||
      code === 'BJJ' ||
      code === 'BRAZILIAN_JIU_JITSU' ||
      code === 'GRAPPLING' ||
      code === 'SUBMISSION_GRAPPLING' ||
      code === 'NO_GI' ||
      code === 'GI_JIU_JITSU'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<BjjSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<BjjSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const matTime = Math.max(dur, Number(metrics.matTimeMinutes || dur));

    return {
      externalLoad: matTime,
      externalUnit: 'Minutes',
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<BjjSpecificMetrics>): {
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

    // 1. Cervical Spine & Neck Strain Circuit Breaker
    const neckPain = Math.max(
      0,
      Math.min(10, Number(metrics.neckPainScoreScale10 || (symptomsList.some((l) => l.includes('neck') || l.includes('leher')) ? symptoms?.painScoreScale10 : 0) || 0))
    );
    if (neckPain >= 4) {
      haltDirectives.push(
        `Nyeri kompresi leher/tulang servikal ${neckPain}/10 akibat tekanan stack pass atau kuncian guillotine/crank. DILARANG KERAS bermain inverted guard atau menerima stack pass langsung.`
      );
      contraindicatedMovements.push(
        'Inverted guard rolls (Granby roll)',
        'Stack pass defense under heavy pressure',
        'Head-first bridging escapes'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Latihan dekompresi leher, traksi servikal ringan, dan kompresi isometrik leher 4 arah.',
      };
    }

    // 2. Knee Collateral Ligament Guard (MCL/LCL from Heel Hooks / De La Riva)
    const kneePain = Math.max(
      0,
      Math.min(10, Number(metrics.kneeCollateralPainScale10 || (symptomsList.some((l) => l.includes('knee') || l.includes('lutut')) ? symptoms?.painScoreScale10 : 0) || 0))
    );
    if (kneePain >= 3) {
      haltDirectives.push(
        `Nyeri rotasi ligamen kolateral lutut ${kneePain}/10 terdeteksi. Kunci kuncian kaki rotasional (heel hooks, kneebars) dan deep de la riva guard.`
      );
      contraindicatedMovements.push(
        'Rotational heel hooks & knee bars',
        'Deep De La Riva & K-guard torque on collateral ligaments'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Bermain closed guard atau half guard netral tanpa memuntir sendi lutut.',
      };
    }

    // 3. Joint Hyperextension Guard
    const jointSafety = evaluateGrapplingJointAndCervicalRisk(
      neckPain,
      Boolean(metrics.hyperextendedJoint),
      Number(metrics.submissionEscapesCount || 0)
    );
    if (jointSafety.hasJointLockAlert) {
      haltDirectives.push('Terdeteksi upaya lepas kuncian ekstrim (armbar/leglock). Kunci submission live roll selama 48 jam.');
      contraindicatedMovements.push('Live submission sparring to full extension');
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative: 'Drilling posisi kontrol dan transisi tanpa kuncian sendi.',
      };
    }

    // 4. Weight-Cut Evaluation
    if (metrics.currentWeightKg && metrics.targetWeightKg) {
      const weightCut = evaluateWeightCutSafety(
        metrics.currentWeightKg,
        metrics.targetWeightKg,
        metrics.daysUntilWeighIn || 7
      );
      if (weightCut.isEmergencyAlert) {
        haltDirectives.push(weightCut.directive);
        contraindicatedMovements.push('Extreme weight cut dehydration');
        return {
          isSafe: false,
          haltDirectives,
          contraindicatedMovements,
          rehabilitationAlternative: 'Rehidrasi elektrolit bertahap dan evaluasi gizi klinis.',
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
    payload: SportTelemetryPayload<BjjSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));

    const weightCut = evaluateWeightCutSafety(
      metrics.currentWeightKg || 75,
      metrics.targetWeightKg || 75,
      metrics.daysUntilWeighIn || 7
    );

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Brazilian Jiu-Jitsu (BJJ) AI Coach',
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
        target_intensity_zone: safety.isSafe ? `Mat Workload (Sparring: ${metrics.sparringRounds || 0} rounds, Drilling: ${metrics.drillingMinutes || 0} min)` : 'Active Joint & Spine Recovery',
        recommended_rest_hours: rpe >= 8 ? 48 : 24,
        next_session_prescription: safety.isSafe
          ? `Volume mat time ${dur} menit dengan RPE ${rpe}/10 terlaksana baik. Terapkan taping silang pada jari dan pertahankan postur punggung tegak saat passing.`
          : 'Hentikan live rolling submission. Fokus pada pemulihan sendi servikal dan ligamen lutut.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 5.5,
        protein_target_g_kg: weightCut.proteinPrescriptionGKg,
        hydration_electrolyte_protocol:
          'Konsumsi cairan sodium 600-800 mg/L pasca-sesi gi tebal untuk mengganti dehidrasi berkeringat deras.',
        supplementation_evidence_tier_a: [
          'Kolagen Peptida 15g + Vitamin C 50mg (proteksi tendon & ligamen)',
          'Omega-3 EPA/DHA 2000mg (anti-inflamasi sendi jari & lutut)',
          'Whey Protein Isolate 25-30g',
        ],
      },
    };
  }
}
