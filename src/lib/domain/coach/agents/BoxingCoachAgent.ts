// Decoupled Flagship Combat Sport Coach: Boxing Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';
import {
  calculateCombatRoundDensity,
  evaluateScat6ConcussionGate,
  evaluateWeightCutSafety,
} from '../kernels/combatSportsKernel';

export interface BoxingSpecificMetrics {
  punchCount?: number;
  punchVelocityGForce?: number;
  roundsCount?: number;
  roundMinutes?: number;
  restMinutes?: number;
  sparringRounds?: number;
  hasHeadImpact?: boolean;
  concussionSymptomsCount?: number;
  daysSinceHeadImpact?: number;
  hasAmnesiaOrLoc?: boolean;
  handWristPainScoreScale10?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  daysUntilWeighIn?: number;
}

export class BoxingCoachAgent implements ISportCoachAgent<BoxingSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_BOXING',
    sportNameId: 'Tinju (Boxing)',
    sportNameEn: 'Boxing',
    cluster: 'COMBAT_MARTIAL_ARTS',
    primaryEnergySystem: 'ANAEROBIC_GLYCOLYTIC',
    governingStandard: 'IBA Medical Commission & Concussion in Sport Group (SCAT6 Consensus)',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_BOXING' ||
      code === 'BOXING' ||
      code === 'TINJU' ||
      code === 'PUGILISM' ||
      code === 'BOXER'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<BoxingSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<BoxingSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const rounds = Math.max(1, Number(metrics.roundsCount || Math.round(dur / 4) || 3));

    return {
      externalLoad: rounds,
      externalUnit: 'Rounds',
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<BoxingSpecificMetrics>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  } {
    const haltDirectives: string[] = [];
    const contraindicatedMovements: string[] = [];
    const metrics = payload.sportSpecificMetrics || {};
    const symptoms = payload.subjectiveSymptoms;

    // 1. Mandatory SCAT6 Concussion Evaluation
    const symptomsList = (symptoms?.painLocations || []).map((l) => l.toLowerCase());
    const hasHeadPain = symptomsList.some((l) => l.includes('head') || l.includes('kepala') || l.includes('brain'));
    const symptomsCount = Number(metrics.concussionSymptomsCount || (hasHeadPain ? 2 : 0));
    const hasImpact = Boolean(metrics.hasHeadImpact || hasHeadPain);

    const concussion = evaluateScat6ConcussionGate(
      hasImpact,
      symptomsCount,
      Number(metrics.daysSinceHeadImpact || 0),
      Boolean(metrics.hasAmnesiaOrLoc)
    );

    if (concussion.isLocked) {
      haltDirectives.push(concussion.clinicalDirective);
      contraindicatedMovements.push(
        'Live sparring with head contact',
        'Heavy bag ballistic combinations with head recoil',
        'Plyometric jump drills causing rotational cervical acceleration'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative: `${concussion.grtpStageName}. Prioritaskan jalan santai atau sepeda statis HR <70% HRmax.`,
      };
    }

    // 2. Boxer's Fracture & 5th Metacarpal Joint Guard
    const handWristPain = Math.max(
      0,
      Math.min(10, Number(metrics.handWristPainScoreScale10 || (symptomsList.some((l) => l.includes('wrist') || l.includes('tangan')) ? symptoms?.painScoreScale10 : 0) || 0))
    );
    if (handWristPain >= 4) {
      haltDirectives.push(
        `Nyeri sendi metakarpal/pergelangan tangan ${handWristPain}/10 terdeteksi. Kunci pukulan samsak berat dan sparring keras untuk mencegah Boxer's Fracture.`
      );
      contraindicatedMovements.push(
        'Heavy bag power punches (left/right hooks, overhands)',
        'Live glove-to-glove blocking and hard sparring'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Shadow boxing di udara dengan handwrap 180 inci, footwork drills, dan kompres dingin RICE.',
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
        contraindicatedMovements.push('Extreme sweat-suit sauna sessions', 'Deliberate fluid restriction');
        return {
          isSafe: false,
          haltDirectives,
          contraindicatedMovements,
          rehabilitationAlternative: 'Rehidrasi elektrolit bertahap dan evaluasi nutrisi klinis.',
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
    payload: SportTelemetryPayload<BoxingSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));
    const rounds = Math.max(1, Number(metrics.roundsCount || Math.round(dur / 4) || 3));
    const density = calculateCombatRoundDensity(rounds, 180, 60, rpe);

    const weightCut = evaluateWeightCutSafety(
      metrics.currentWeightKg || 65,
      metrics.targetWeightKg || 65,
      metrics.daysUntilWeighIn || 7
    );

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Boxing (Tinju) AI Coach',
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
        target_intensity_zone: safety.isSafe ? `${density.glycolyticLactateTier} (Laktat: ${density.estimatedLactateMmolL} mmol/L)` : 'Active Recovery & Concussion Stand-Down',
        recommended_rest_hours: density.recommendedRecoveryHours,
        next_session_prescription: safety.isSafe
          ? `Beban ${rounds} ronde tinju (densitas kerja ${density.workDensityPct}%, pukulan: ${metrics.punchCount || 0}). Pertahankan volume pukulan dengan fokus efisiensi rotasi pinggul.`
          : 'Hentikan sparring kontak fisik. Fokus pada pemulihan neurologis dan regenerasi sendi tangan.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 5.0,
        protein_target_g_kg: weightCut.proteinPrescriptionGKg,
        hydration_electrolyte_protocol:
          weightCut.acuteLossPct > 2
            ? `Wajib rehidrasi ${weightCut.rehydrationFluidMlPerKgLost} mL cairan berelektrolit per kg defisit berat badan.`
            : 'Pertahankan hidrasi optimal 2.5 - 3.0 liter air per hari.',
        supplementation_evidence_tier_a: [
          'Kreatin Monohidrat 5g (neuroproteksi & kapasitas anaerobik)',
          'Elektrolit Natrium 600-800 mg/L',
          'Whey Protein Isolate 25-30g',
        ],
      },
    };
  }
}
