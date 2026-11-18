// Decoupled Flagship Team Sport Coach: Futsal Agent (Hard Court Intermittent)
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';
import {
  calculatePlayerLoadAu,
  getTeamSportRecoveryTimeline,
} from '../kernels/intermittentSportsKernel';

export interface FutsalSpecificMetrics {
  totalDistanceMeters?: number;
  shiftDurationMins?: number;
  rapidDirectionCutsCount?: number;
  highIntensityIntervalCount?: number;
  courtTractionRpe?: number; // 1-10
}

export class FutsalCoachAgent implements ISportCoachAgent<FutsalSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_FUTSAL',
    sportNameId: 'Futsal (Lapangan Keras)',
    sportNameEn: 'Futsal (Hard Court)',
    cluster: 'TEAM_FIELD_COURT',
    primaryEnergySystem: 'MIXED_INTERMITTENT',
    governingStandard: 'FIFA Futsal Technical Guidelines & Hard-Court Biomechanical Safety Protocols',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_FUTSAL' ||
      code === 'FUTSAL' ||
      code === 'INDOOR_SOCCER'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<FutsalSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<FutsalSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'PLAYER_LOAD_AU';
  } {
    const metrics = payload.sportSpecificMetrics || {};
    const cuts = Number(metrics.rapidDirectionCutsCount || 0);
    const intervals = Number(metrics.highIntensityIntervalCount || 0);

    const playerLoad = calculatePlayerLoadAu(
      payload.durationMinutes,
      payload.sessionRpe,
      cuts,
      intervals
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

  public evaluateSafety(payload: SportTelemetryPayload<FutsalSpecificMetrics>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  } {
    const symptoms = payload.subjectiveSymptoms;
    const haltDirectives: string[] = [];
    const contraindicatedMovements: string[] = [];

    const locations = (symptoms?.painLocations || []).map((l) => l.toLowerCase());
    const hasMeniscusPain = locations.some((l) => l.includes('meniscus') || l.includes('knee') || l.includes('lutut'));
    const hasGroinPain = locations.some((l) => l.includes('groin') || l.includes('adductor') || l.includes('selangkangan'));

    if (hasMeniscusPain || hasGroinPain) {
      haltDirectives.push(
        'Nyeri geser rotasional meniskus lutut atau sindrom nyeri selangkangan (adductor groin strain) terdeteksi. Friksi lantai keras futsal menghasilkan torsi tinggi pada sendi lutut. Hentikan manuver potong arah tajam.'
      );
      contraindicatedMovements.push(
        'Rapid 180-degree change of direction cuts',
        'Toe-poke maximal power strikes',
        'High-intensity hard court shifts'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Alihkan latihan ke rumput alami atau cross-training sepeda untuk mereduksi beban friksi permukaan lantai keras dan lakukan penguatan adduktor isometrik.',
      };
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<FutsalSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const cuts = Number(metrics.rapidDirectionCutsCount || 0);

    const recovery = getTeamSportRecoveryTimeline(payload.durationMinutes, payload.sessionRpe);

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Futsal AI Coach',
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
        target_intensity_zone: safety.isSafe ? 'Anaerobic Lactic Tolerance & Agility' : 'Joint Flush & Soft Surface Deload',
        recommended_rest_hours: recovery.recommendedRestHours,
        next_session_prescription: safety.isSafe
          ? `Beban kerja futsal tercatat (${cuts} manuver potong arah tajam). Densitas laktat tinggi membutuhkan hidrasi elektrolit dan peregangan fleksor panggul.`
          : 'Hentikan sesi kompetitif di lapangan keras. Lindungi meniskus lutut dan otot adduktor.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 5.5,
        protein_target_g_kg: 1.8,
        hydration_electrolyte_protocol:
          'Konsumsi cairan elektrolit isotonik 500-750 ml per jam. Futsal indoor dengan ventilasi tertutup memicu dehidrasi cepat dan kram betis.',
        supplementation_evidence_tier_a: [
          'Beta-Alanine (3.2-6.4g/hari untuk buffering asam laktat darah)',
          'Kreatin Monohidrat (5g/hari)',
          'Cairan Elektrolit Isotonik',
        ],
      },
    };
  }
}
