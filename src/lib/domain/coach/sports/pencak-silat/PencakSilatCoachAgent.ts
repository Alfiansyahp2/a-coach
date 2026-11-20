// Decoupled Flagship Combat Sport Coach: Pencak Silat Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from '../../core/contracts';
import {
  calculateCombatRoundDensity,
  evaluateWeightCutSafety,
} from '../../kernels/combatSportsKernel';

export interface PencakSilatSpecificMetrics {
  kategori?: 'TANDING' | 'SENI' | 'TUNGGAL' | 'GANDA' | 'REGU';
  babakCount?: number;
  babakMinutes?: number;
  jedaMinutes?: number;
  sapuanBantinganCount?: number;
  tendanganLurusSabitCount?: number;
  elakanTangkisanCount?: number;
  kudaKudaHoldSeconds?: number;
  tibialContusionScoreScale10?: number;
  meniscusRotationalStrainScale10?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  daysUntilWeighIn?: number;
}

export class PencakSilatCoachAgent implements ISportCoachAgent<PencakSilatSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_PENCAK_SILAT',
    sportNameId: 'Pencak Silat (Tanding & Seni)',
    sportNameEn: 'Pencak Silat',
    cluster: 'COMBAT_MARTIAL_ARTS',
    primaryEnergySystem: 'ANAEROBIC_GLYCOLYTIC',
    governingStandard: 'PERSILAT & PB IPSI Medical Commission (Standard Pertandingan Internasional)',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_PENCAK_SILAT' ||
      code === 'PENCAK_SILAT' ||
      code === 'SILAT' ||
      code === 'SILAT_TANDING' ||
      code === 'SILAT_SENI'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<PencakSilatSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<PencakSilatSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const babak = Math.max(1, Number(metrics.babakCount || Math.round(dur / 3) || 3));

    return {
      externalLoad: babak,
      externalUnit: 'Babak',
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<PencakSilatSpecificMetrics>): {
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

    // 1. Meniscus Rotational Shear & Knee Collateral Guard (Guntingan / Sapuan)
    const meniscusPain = Math.max(
      0,
      Math.min(10, Number(metrics.meniscusRotationalStrainScale10 || (symptomsList.some((l) => l.includes('knee') || l.includes('lutut') || l.includes('meniscus')) ? symptoms?.painScoreScale10 : 0) || 0))
    );
    if (meniscusPain >= 4) {
      haltDirectives.push(
        `Nyeri rotasi meniskus/lutut ${meniscusPain}/10 akibat manuver sapuan rebah atau guntingan. Kunci teknik bantingan putar dan guntingan.`
      );
      contraindicatedMovements.push(
        'Guntingan (Scissor takedowns) with rotational knee load',
        'Deep sapuan rebah with sudden pivot shear',
        'Extreme low kuda-kuda deep squats'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Kuda-kuda statis isometrik sudut sedang (>45 derajat) dan penguatan m. vastus medialis obliquus (VMO).',
      };
    }

    // 2. Tibial Contusion & Shin Bone Bruise Guard
    const shinPain = Math.max(
      0,
      Math.min(10, Number(metrics.tibialContusionScoreScale10 || (symptomsList.some((l) => l.includes('shin') || l.includes('tulang kering')) ? symptoms?.painScoreScale10 : 0) || 0))
    );
    if (shinPain >= 5) {
      haltDirectives.push(
        `Kontusio periosteum tulang kering ${shinPain}/10 akibat adu tendangan sabit. Hentikan tendangan kontak langsung tanpa deker pelindung.`
      );
      contraindicatedMovements.push(
        'Tendangan sabit (roundhouse kick) direct shin-to-shin impact',
        'Sparring without padded shin guards'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative: 'Teknik pukulan tangan (dada/tusuk), latihan langkah jurus, dan kompres dingin RICE.',
      };
    }

    // 3. Weight-Cut Evaluation
    if (metrics.currentWeightKg && metrics.targetWeightKg) {
      const weightCut = evaluateWeightCutSafety(
        metrics.currentWeightKg,
        metrics.targetWeightKg,
        metrics.daysUntilWeighIn || 3
      );
      if (weightCut.isEmergencyAlert) {
        haltDirectives.push(weightCut.directive);
        contraindicatedMovements.push('Extreme weight cutting dehydration');
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
    payload: SportTelemetryPayload<PencakSilatSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));
    const babak = Math.max(1, Number(metrics.babakCount || Math.round(dur / 3) || 3));
    const density = calculateCombatRoundDensity(babak, 120, 60, rpe);

    const weightCut = evaluateWeightCutSafety(
      metrics.currentWeightKg || 60,
      metrics.targetWeightKg || 60,
      metrics.daysUntilWeighIn || 3
    );

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Pencak Silat AI Coach',
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
        target_intensity_zone: safety.isSafe ? `${density.glycolyticLactateTier} (${metrics.kategori || 'TANDING'})` : 'Active Recovery & Tissue Healing',
        recommended_rest_hours: density.recommendedRecoveryHours,
        next_session_prescription: safety.isSafe
          ? `Beban ${babak} babak silat kategori ${metrics.kategori || 'TANDING'} (${metrics.sapuanBantinganCount || 0} bantingan, ${metrics.tendanganLurusSabitCount || 0} tendangan). Pertahankan kelincahan langkah ladam.`
          : 'Hentikan sesi tanding kontak penuh. Fokus pada pemulihan sendi lutut dan kontusio tulang kering.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 5.0,
        protein_target_g_kg: weightCut.proteinPrescriptionGKg,
        hydration_electrolyte_protocol:
          'Konsumsi air mineral berelektrolit 1.5 L per hari dengan tambahan kalsium dan vitamin D3 untuk regenerasi tulang.',
        supplementation_evidence_tier_a: [
          'Kalsium Sitrat 1000 mg + Vitamin D3 2000 IU (kesehatan densitas tulang periosteum)',
          'Whey Protein Isolate 25g',
          'Kurkuminoid 500mg (anti-inflamasi alami memar & hematoma)',
        ],
      },
    };
  }
}
