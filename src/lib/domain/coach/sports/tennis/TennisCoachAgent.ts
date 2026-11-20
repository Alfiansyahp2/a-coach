// Decoupled Flagship Racquet Sport Coach: Tennis Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from '../../core/contracts';

export interface TennisSpecificMetrics {
  serveCount?: number;
  acesCount?: number;
  forehandBackhandCount?: number;
  serveVelocityKmh?: number;
  lateralEpicondylitisPainScale10?: number;
  rotationalTorqueLoadScale10?: number;
}

export class TennisCoachAgent implements ISportCoachAgent<TennisSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_TENNIS',
    sportNameId: 'Tenis Lapangan (Tennis)',
    sportNameEn: 'Tennis',
    cluster: 'RACQUET_PRECISION',
    primaryEnergySystem: 'MIXED_INTERMITTENT',
    governingStandard: 'International Tennis Federation (ITF) Medical Commission Guidelines',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_TENNIS' ||
      code === 'TENNIS' ||
      code === 'TENIS' ||
      code === 'LAWN_TENNIS'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<TennisSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<TennisSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const strokes = Math.max(0, Number(metrics.serveCount || 0)) + Math.max(0, Number(metrics.forehandBackhandCount || 0));

    return {
      externalLoad: strokes > 0 ? strokes : dur,
      externalUnit: strokes > 0 ? 'Strokes' : 'Minutes',
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<TennisSpecificMetrics>): {
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

    // 1. Lateral Epicondylitis (Tennis Elbow) Guard - Extensor carpi radialis brevis overload
    const elbowPain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.lateralEpicondylitisPainScale10 ||
            (symptomsList.some((l) => l.includes('elbow') || l.includes('siku') || l.includes('epicondyle'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );
    if (elbowPain >= 4) {
      haltDirectives.push(
        `Nyeri epikondilitis lateral siku (Tennis Elbow) ${elbowPain}/10 terdeteksi. Kunci pukulan servis keras dan pukulan backhand satu tangan.`
      );
      contraindicatedMovements.push(
        'Flat and kick serves with wrist pronation snap',
        'One-handed top-spin backhands with off-center impact'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Protokol Tyler Twist (latihan eksentrik pergelangan tangan dengan FlexBar), kompres es, dan turunkan tensi senar raket 2–3 lbs.',
      };
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<TennisSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Tennis (Tenis Lapangan) AI Coach',
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
        target_intensity_zone: safety.isSafe ? `Intermittent Stroke Volume (${metrics.serveCount || 0} serves, ${metrics.forehandBackhandCount || 0} groundstrokes)` : 'Active Forearm & Tendon Rest',
        recommended_rest_hours: rpe >= 8 ? 36 : 24,
        next_session_prescription: safety.isSafe
          ? `Beban ${dur} menit tenis selesai. Jaga transfer kinetik rantai terbuka dari tungkai bawah menuju torso sebelum pukulan bola.`
          : 'Hentikan servis dan pukulan keras. Fokus pada pemulihan tendon ekstensor lengan bawah.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 5.5,
        protein_target_g_kg: 1.6,
        hydration_electrolyte_protocol:
          'Konsumsi cairan elektrolit seimbang dengan 600-800 mg natrium per jam pada sesi lapangan keras (hard court) bersuhu tinggi.',
        supplementation_evidence_tier_a: [
          'Elektrolit Kalium & Magnesium (mencegah kram otot lengan & kaki)',
          'Whey Protein Isolate 25g',
        ],
      },
    };
  }
}
