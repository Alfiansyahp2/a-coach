// Decoupled Flagship Combat Sport Coach: Muay Thai & Kickboxing Coach Agent
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

export interface MuayThaiSpecificMetrics {
  roundsCount?: number;
  roundMinutes?: number;
  restMinutes?: number;
  teepAndRoundhouseKicksCount?: number;
  clinchDurationMinutes?: number;
  elbowKneeStrikesCount?: number;
  sparringRounds?: number;
  hasHeadImpact?: boolean;
  concussionSymptomsCount?: number;
  daysSinceHeadImpact?: number;
  hasAmnesiaOrLoc?: boolean;
  shinBruisePainScoreScale10?: number;
  neckClinchStrainScale10?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  daysUntilWeighIn?: number;
}

export class MuayThaiCoachAgent implements ISportCoachAgent<MuayThaiSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_MUAY_THAI',
    sportNameId: 'Muay Thai & Kickboxing',
    sportNameEn: 'Muay Thai & Kickboxing',
    cluster: 'COMBAT_MARTIAL_ARTS',
    primaryEnergySystem: 'ANAEROBIC_GLYCOLYTIC',
    governingStandard: 'World Muaythai Council (WMC) & IFMA Medical Commission (Safety Protocol)',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_MUAY_THAI' ||
      code === 'MUAY_THAI' ||
      code === 'THAI_BOXING' ||
      code === 'KICKBOXING' ||
      code === 'K1'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<MuayThaiSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<MuayThaiSpecificMetrics>): {
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

  public evaluateSafety(payload: SportTelemetryPayload<MuayThaiSpecificMetrics>): {
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

    // 1. Mandatory SCAT6 Concussion Evaluation
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
        'Sparring with head kicks, punches or elbows',
        'Head-movement ballistic pad drills with shock impact'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative: `${concussion.grtpStageName}. Prioritaskan jalan santai atau sepeda statis HR <70% HRmax.`,
      };
    }

    // 2. Tibial Bone Contusion & Shin Bruise Guard
    const shinPain = Math.max(
      0,
      Math.min(10, Number(metrics.shinBruisePainScoreScale10 || (symptomsList.some((l) => l.includes('shin') || l.includes('tulang kering')) ? symptoms?.painScoreScale10 : 0) || 0))
    );
    if (shinPain >= 5) {
      haltDirectives.push(
        `Nyeri hematoma/kontusio tulang kering ${shinPain}/10 akibat tendangan benturan keras. DILARANG KERAS menendang samsak padat atau sparring tanpa shin guard tebal.`
      );
      contraindicatedMovements.push(
        'Hard roundhouse kicks on heavy bags',
        'Shin-on-shin blocking without thick protective gear'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Teknik pukulan tangan (boxing hands), latihan footwork tali skipping, dan kompres dingin RICE.',
      };
    }

    // 3. Cervical Strain from Thai Clinch (Plum)
    const neckPain = Math.max(
      0,
      Math.min(10, Number(metrics.neckClinchStrainScale10 || (symptomsList.some((l) => l.includes('neck') || l.includes('leher')) ? symptoms?.painScoreScale10 : 0) || 0))
    );
    if (neckPain >= 4) {
      haltDirectives.push(
        `Nyeri tarikan leher akibat kuncian clinch ${neckPain}/10. Hentikan latihan clinch resistensi penuh selama 48 jam.`
      );
      contraindicatedMovements.push('Full resistance double collar tie (plum clinch) wrestling');
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Traksi leher ringan, peregangan m. sternocleidomastoideus, dan latihan penguatan leher isometrik.',
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
        contraindicatedMovements.push('Extreme sweat-suit dehydration');
        return {
          isSafe: false,
          haltDirectives,
          contraindicatedMovements,
          rehabilitationAlternative: 'Rehidrasi bertahap dan evaluasi gizi klinis.',
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
    payload: SportTelemetryPayload<MuayThaiSpecificMetrics>
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
      coach_identity: 'Decoupled Muay Thai & Kickboxing AI Coach',
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
        target_intensity_zone: safety.isSafe ? `${density.glycolyticLactateTier} (Laktat: ${density.estimatedLactateMmolL} mmol/L)` : 'Active Rest & Tissue Repair',
        recommended_rest_hours: density.recommendedRecoveryHours,
        next_session_prescription: safety.isSafe
          ? `Beban ${rounds} ronde Muay Thai (${metrics.teepAndRoundhouseKicksCount || 0} tendangan, ${metrics.clinchDurationMinutes || 0} menit clinch). Pertahankan guard tinggi saat keluar dari jarak teep.`
          : 'Hentikan sesi sparring kontak penuh dan tendangan impak keras. Fokus pada pemulihan neurologis dan tulang kering.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 5.5,
        protein_target_g_kg: weightCut.proteinPrescriptionGKg,
        hydration_electrolyte_protocol:
          'Konsumsi cairan elektrolit seimbang 1.5 - 2.0 L per hari dengan rasio natrium 600-800 mg/L.',
        supplementation_evidence_tier_a: [
          'Kalsium & Vitamin D3 (kepadatan tulang kering pasca-impak)',
          'Beta-Alanin 4-6g (toleransi asam laktat ronde 4-5)',
          'Whey Protein Isolate 25-30g',
        ],
      },
    };
  }
}
