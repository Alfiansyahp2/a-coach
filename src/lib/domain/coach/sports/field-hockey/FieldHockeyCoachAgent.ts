// Decoupled Flagship Team Sport Coach: Field Hockey Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from '../../core/contracts';
import {
  calculatePlayerLoadAu,
  getTeamSportRecoveryTimeline,
} from '../../kernels/intermittentSportsKernel';

export interface FieldHockeySpecificMetrics {
  totalDistanceMeters?: number;
  semiSquatStanceMinutes?: number;
  sprintCount?: number;
  stickHandlingDistanceMeters?: number;
  lumbarFatigueScore10?: number; // 0-10
}

export class FieldHockeyCoachAgent implements ISportCoachAgent<FieldHockeySpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_FIELD_HOCKEY',
    sportNameId: 'Hoki Lapangan (Field Hockey)',
    sportNameEn: 'Field Hockey',
    cluster: 'TEAM_FIELD_COURT',
    primaryEnergySystem: 'MIXED_INTERMITTENT',
    governingStandard: 'FIH Medical Guidelines & Postural Biomechanics Standards',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_FIELD_HOCKEY' ||
      code === 'FIELD_HOCKEY' ||
      code === 'HOCKEY' ||
      code === 'HOKI'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<FieldHockeySpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<FieldHockeySpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'PLAYER_LOAD_AU';
  } {
    const metrics = payload.sportSpecificMetrics || {};
    const sprints = Number(metrics.sprintCount || 0);
    const crouchedMins = Number(metrics.semiSquatStanceMinutes || 0);

    const playerLoad = calculatePlayerLoadAu(
      payload.durationMinutes,
      payload.sessionRpe,
      sprints,
      crouchedMins
    );

    const distMeters = Number(metrics.totalDistanceMeters || 0);
    const distKm = distMeters > 0 ? Number((distMeters / 1000).toFixed(2)) : payload.durationMinutes;
    const unit = distMeters > 0 ? 'Kilometers' : 'Minutes';

    return {
      externalLoad: distKm,
      externalUnit: unit,
      internalStrain: playerLoad.playerLoadAu,
      internalMethod: 'PLAYER_LOAD_AU',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<FieldHockeySpecificMetrics>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  } {
    const symptoms = payload.subjectiveSymptoms;
    const haltDirectives: string[] = [];
    const contraindicatedMovements: string[] = [];

    const locations = (symptoms?.painLocations || []).map((l) => l.toLowerCase());
    const hasLumbarPain = locations.some(
      (l) => l.includes('lumbar') || l.includes('back') || l.includes('punggung')
    ) || (payload.sportSpecificMetrics?.lumbarFatigueScore10 || 0) >= 4;

    const hasHipImpingement = locations.some((l) => l.includes('hip') || l.includes('panggul') || l.includes('groin'));

    if (hasLumbarPain || hasHipImpingement) {
      haltDirectives.push(
        'Nyeri spasme punggung bawah (lumbar erector spinae) atau jepitan sendi panggul (hip impingement / FAI) terdeteksi. Postur lari semi-jongkok berkepanjangan melipatgandakan gaya geser diskus lumbal. Hentikan manuver dribel membungkuk.'
      );
      contraindicatedMovements.push(
        'Prolonged semi-squat crouched dribbling',
        'Bent-over maximal velocity sprints',
        'Repetitive reverse-stick drag flicks'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Lakukan ekstensi thoracolumbar (McKenzie press-up), peregangan fleksor panggul (half-kneeling hip flexor stretch), dan dekompresi tulang belakang tegak.',
      };
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<FieldHockeySpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const crouchedMins = Number(metrics.semiSquatStanceMinutes || 0);

    const recovery = getTeamSportRecoveryTimeline(payload.durationMinutes, payload.sessionRpe);

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Field Hockey AI Coach',
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
        target_intensity_zone: safety.isSafe ? 'High-Intensity Repeated Sprint Ability & Postural Endurance' : 'Spinal Decompression & Core Stability',
        recommended_rest_hours: recovery.recommendedRestHours,
        next_session_prescription: safety.isSafe
          ? `${workload.externalLoad} km beban kerja tercatat (${crouchedMins} menit dalam postur semi-squat). Lakukan mobilitas ekstensi tulang belakang pasca sesi.`
          : 'Hentikan sesi hoki membungkuk. Utamakan pemulihan kurva lordotik lumbal dan fleksor panggul.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: recovery.glycogenRestorationGramsPerKg,
        protein_target_g_kg: 1.8,
        hydration_electrolyte_protocol:
          'Konsumsi 500-750 ml cairan elektrolit per jam pertandingan lapangan terbuka.',
        supplementation_evidence_tier_a: [
          'Kreatin Monohidrat (5g/hari)',
          'Elektrolit Natrium',
          'Whey Protein',
        ],
      },
    };
  }
}
