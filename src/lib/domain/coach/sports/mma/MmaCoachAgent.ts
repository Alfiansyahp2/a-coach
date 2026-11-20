// Decoupled Flagship Combat Sport Coach: Mixed Martial Arts (MMA) Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from '../../core/contracts';
import {
  calculateCombatRoundDensity,
  evaluateScat6ConcussionGate,
  evaluateWeightCutSafety,
  evaluateGrapplingJointAndCervicalRisk,
} from '../../kernels/combatSportsKernel';

export interface MmaSpecificMetrics {
  roundsCount?: number;
  roundMinutes?: number;
  restMinutes?: number;
  strikingTimeSeconds?: number;
  grapplingTimeSeconds?: number;
  takedownAttempts?: number;
  submissionEscapesCount?: number;
  sparringRounds?: number;
  hasHeadImpact?: boolean;
  concussionSymptomsCount?: number;
  daysSinceHeadImpact?: number;
  hasAmnesiaOrLoc?: boolean;
  shoulderAcJointPainScoreScale10?: number;
  hyperextendedJoint?: boolean;
  neckPainScoreScale10?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  daysUntilWeighIn?: number;
}

export class MmaCoachAgent implements ISportCoachAgent<MmaSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_MMA',
    sportNameId: 'Seni Bela Diri Campuran (MMA)',
    sportNameEn: 'Mixed Martial Arts (MMA)',
    cluster: 'COMBAT_MARTIAL_ARTS',
    primaryEnergySystem: 'ANAEROBIC_GLYCOLYTIC',
    governingStandard: 'IMMAF Medical Committee & Association of Boxing Commissions (Unified Rules)',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_MMA' ||
      code === 'MMA' ||
      code === 'MIXED_MARTIAL_ARTS' ||
      code === 'UFC' ||
      code === 'CAGE_FIGHTING'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<MmaSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<MmaSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 7)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const rounds = Math.max(1, Number(metrics.roundsCount || Math.round(dur / 6) || 3));

    return {
      externalLoad: rounds,
      externalUnit: 'Rounds',
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<MmaSpecificMetrics>): {
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
    const hasHeadPain = symptomsList.some((l) => l.includes('head') || l.includes('kepala'));
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
        'Full contact MMA sparring with head strikes',
        'High-velocity takedowns with head-to-mat impact',
        'Cage wrestling with concussive head pressure'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative: `${concussion.grtpStageName}. Latihan non-kontak: sepeda statis atau drill footwork mandiri.`,
      };
    }

    // 2. AC Joint Shoulder Impingement & Takedown Impact Guard
    const shoulderPain = Math.max(
      0,
      Math.min(10, Number(metrics.shoulderAcJointPainScoreScale10 || (symptomsList.some((l) => l.includes('shoulder') || l.includes('bahu')) ? symptoms?.painScoreScale10 : 0) || 0))
    );
    if (shoulderPain >= 4) {
      haltDirectives.push(
        `Nyeri sendi bahu/AC-joint ${shoulderPain}/10 akibat bantingan atau overhand. Kunci bantingan gulat keras dan overhand strikes.`
      );
      contraindicatedMovements.push('Double leg takedowns with shoulder drive', 'Heavy overhand rights / looping hooks');
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative: 'Latihan transisi kaki lambat dan mobilitas sendi bahu rotasi eksternal.',
      };
    }

    // 3. Grappling Joint Hyperextension & Cervical Spine Safety
    const neckPain = Math.max(0, Math.min(10, Number(metrics.neckPainScoreScale10 || (symptomsList.some((l) => l.includes('neck') || l.includes('leher')) ? symptoms?.painScoreScale10 : 0) || 0)));
    const grapplingRisk = evaluateGrapplingJointAndCervicalRisk(
      neckPain,
      Boolean(metrics.hyperextendedJoint),
      Number(metrics.submissionEscapesCount || 0)
    );

    if (!grapplingRisk.isSafeForHardSparring) {
      haltDirectives.push(...grapplingRisk.clinicalRecommendations);
      contraindicatedMovements.push('Live submission sparring', 'Guillotine and armbar live escapes');
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative: 'Drill teknik posisi tanpa kuncian sendi ekstrim (flow roll).',
      };
    }

    // 4. Weight-Cut Rapid Dehydration Guard
    if (metrics.currentWeightKg && metrics.targetWeightKg) {
      const weightCut = evaluateWeightCutSafety(
        metrics.currentWeightKg,
        metrics.targetWeightKg,
        metrics.daysUntilWeighIn || 7
      );
      if (weightCut.isEmergencyAlert) {
        haltDirectives.push(weightCut.directive);
        contraindicatedMovements.push('Sauna dehydrating sweat-suit', 'Water cutting starvation');
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
    payload: SportTelemetryPayload<MmaSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 7)));
    const rounds = Math.max(1, Number(metrics.roundsCount || Math.round(dur / 6) || 3));
    const density = calculateCombatRoundDensity(rounds, 300, 60, rpe);

    const weightCut = evaluateWeightCutSafety(
      metrics.currentWeightKg || 70,
      metrics.targetWeightKg || 70,
      metrics.daysUntilWeighIn || 7
    );

    const strikeSec = Math.max(0, Number(metrics.strikingTimeSeconds || 0));
    const grappleSec = Math.max(0, Number(metrics.grapplingTimeSeconds || 0));
    const totalSec = strikeSec + grappleSec;
    const strikingPct = totalSec > 0 ? Number(((strikeSec / totalSec) * 100).toFixed(0)) : 50;
    const grapplingPct = totalSec > 0 ? Number(((grappleSec / totalSec) * 100).toFixed(0)) : 50;

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Mixed Martial Arts (MMA) AI Coach',
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
        target_intensity_zone: safety.isSafe ? `${density.glycolyticLactateTier} (${strikingPct}% Striking / ${grapplingPct}% Grappling)` : 'Active Rest & Neuro-Joint Recovery',
        recommended_rest_hours: density.recommendedRecoveryHours,
        next_session_prescription: safety.isSafe
          ? `Beban ${rounds} ronde MMA (${density.workRestRatio}:1 rasio kerja-istirahat, ${metrics.takedownAttempts || 0} takedown). Teruskan transisi wall-walk dan kontrol napas aktif.`
          : 'Hentikan sesi sparring kontak penuh dan live grappling. Fokus pada pemulihan sendi dan neurologis.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 6.0,
        protein_target_g_kg: weightCut.proteinPrescriptionGKg,
        hydration_electrolyte_protocol:
          'Konsumsi minimal 1.5 L cairan elektrolit seimbang pasca-sesi volume gulat tinggi untuk mengganti kehilangan natrium dan magnesium.',
        supplementation_evidence_tier_a: [
          'Beta-Alanin 4-6g/hari (buffering keasaman laktat intramuskular)',
          'Kreatin Monohidrat 5g (ledakan takedown & neuroproteksi)',
          'Kolagen Hidrolisat 15g + Vitamin C 50mg (pemulihan ligamen & tendon)',
        ],
      },
    };
  }
}
