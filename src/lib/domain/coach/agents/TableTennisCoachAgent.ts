// Decoupled Flagship Racquet Sport Coach: Table Tennis Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';

export interface TableTennisSpecificMetrics {
  reactionTimeMs?: number;
  topspinLoopsCount?: number;
  matchesCount?: number;
  wristTfccStrainScale10?: number;
  kneeMeniscusQuickTwistPainScale10?: number;
}

export class TableTennisCoachAgent implements ISportCoachAgent<TableTennisSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_TABLE_TENNIS',
    sportNameId: 'Tenis Meja (Table Tennis / Ping Pong)',
    sportNameEn: 'Table Tennis',
    cluster: 'RACQUET_PRECISION',
    primaryEnergySystem: 'PHOSPHAGEN_ATP_PC',
    governingStandard: 'International Table Tennis Federation (ITTF) Medical Committee',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_TABLE_TENNIS' ||
      code === 'TABLE_TENNIS' ||
      code === 'TENIS_MEJA' ||
      code === 'PING_PONG' ||
      code === 'PINGPONG'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<TableTennisSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<TableTennisSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 5)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const loops = Math.max(0, Number(metrics.topspinLoopsCount || 0));

    return {
      externalLoad: loops > 0 ? loops : dur,
      externalUnit: loops > 0 ? 'Loops' : 'Minutes',
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<TableTennisSpecificMetrics>): {
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

    // 1. Triangular Fibrocartilage Complex (TFCC) & Wrist Flick Strain
    const wristPain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.wristTfccStrainScale10 ||
            (symptomsList.some((l) => l.includes('wrist') || l.includes('pergelangan'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );
    if (wristPain >= 4) {
      haltDirectives.push(
        `Nyeri sendi pergelangan sisi ulnar (TFCC strain) ${wristPain}/10 akibat sentakan pergelangan tangan (wrist snap) topspin/chiquita berulang.`
      );
      contraindicatedMovements.push(
        'Aggressive backhand banana flick (Chiquita)',
        'Extreme pronation/supination wrist snap topspin loops'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Gunakan wrist support, latihan stabilitas pronasi/supinasi isometrik, dan alihkan ke pukulan dorong flat (pushing).',
      };
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<TableTennisSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 5)));

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Table Tennis (Tenis Meja) AI Coach',
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
        target_intensity_zone: safety.isSafe ? `Fast Reactive Neuro-Drill (Waktu Reaksi: ${metrics.reactionTimeMs || 220} ms)` : 'Active Wrist Deload',
        recommended_rest_hours: rpe >= 8 ? 24 : 16,
        next_session_prescription: safety.isSafe
          ? `Sesi ${dur} menit tenis meja tuntas (${metrics.topspinLoopsCount || 0} loops). Pertahankan kesiapan kuda-kuda rendah dan pusat gravitasi stabil.`
          : 'Hentikan sentakan pergelangan tangan keras. Fokus pada pemulihan ligamen TFCC pergelangan tangan.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 4.5,
        protein_target_g_kg: 1.5,
        hydration_electrolyte_protocol:
          'Konsumsi air mineral 500-750 mL per jam sesi latihan footwork intensif.',
        supplementation_evidence_tier_a: [
          'Kafein 100-150mg (waktu reaksi neurotransmiter & kecepatan visual)',
          'Whey Protein 20g',
        ],
      },
    };
  }
}
