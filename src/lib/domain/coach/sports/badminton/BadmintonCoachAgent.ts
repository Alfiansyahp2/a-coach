// Decoupled Flagship Racquet Sport Coach: Badminton Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from '../../core/contracts';

export interface BadmintonSpecificMetrics {
  jumpSmashCount?: number;
  lungeCount?: number;
  rallyCount?: number;
  achillesTendonPainScale10?: number;
  atflAnklePainScale10?: number;
  wristSnapPainScale10?: number;
}

export class BadmintonCoachAgent implements ISportCoachAgent<BadmintonSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_BADMINTON',
    sportNameId: 'Bulu Tangkis (Badminton)',
    sportNameEn: 'Badminton',
    cluster: 'RACQUET_PRECISION',
    primaryEnergySystem: 'PHOSPHAGEN_ATP_PC',
    governingStandard: 'Badminton World Federation (BWF) Medical Commission Guidelines',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_BADMINTON' ||
      code === 'BADMINTON' ||
      code === 'BULU_TANGKIS' ||
      code === 'SHUTTLECOCK'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<BadmintonSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<BadmintonSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const actions = Math.max(0, Number(metrics.jumpSmashCount || 0)) + Math.max(0, Number(metrics.lungeCount || 0));

    return {
      externalLoad: actions > 0 ? actions : dur,
      externalUnit: actions > 0 ? 'Actions' : 'Minutes',
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<BadmintonSpecificMetrics>): {
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

    // 1. Achilles Tendon Strain Circuit Breaker (Explosive jump smash landing / backward scissor kick)
    const achillesPain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.achillesTendonPainScale10 ||
            (symptomsList.some((l) => l.includes('achilles') || l.includes('tumit'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );
    if (achillesPain >= 4) {
      haltDirectives.push(
        `Nyeri tendon Achilles ${achillesPain}/10 akibat hentakan jump smash atau langkah mundur cepat (China step). Kunci lompatan smes eksplosif.`
      );
      contraindicatedMovements.push(
        'Explosive jump smashes with single-leg deceleration',
        'Rapid backward scissor kick landings'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Protokol Alfredson: latihan penurunan tumit eksentrik (eccentric heel drops) 3x15 repetisi, kompres es, dan hindari berjalan jinjit.',
      };
    }

    // 2. Lateral Ankle Sprain (ATFL) Guard
    const anklePain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.atflAnklePainScale10 ||
            (symptomsList.some((l) => l.includes('ankle') || l.includes('pergelangan kaki'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );
    if (anklePain >= 4) {
      haltDirectives.push(
        `Nyeri ligamen pergelangan kaki lateral (ATFL) ${anklePain}/10 terdeteksi saat lunge sudut depan.`
      );
      contraindicatedMovements.push('Deep forward lunges with sharp lateral recovery step');
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative: 'Gunakan ankle brace semi-rigid, latihan keseimbangan satu kaki (wobble board).',
      };
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<BadmintonSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Badminton (Bulu Tangkis) AI Coach',
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
        target_intensity_zone: safety.isSafe ? `High Phosphagen Rebound (${metrics.jumpSmashCount || 0} smashes, ${metrics.lungeCount || 0} lunges)` : 'Active Ankle & Achilles Rest',
        recommended_rest_hours: rpe >= 8 ? 36 : 24,
        next_session_prescription: safety.isSafe
          ? `Beban ${dur} menit bulu tangkis selesai. Pertahankan sudut mendarat lutut fleksi >30 derajat saat jump smash untuk meredam gaya reaksi lantai.`
          : 'Hentikan jump smash dan lunge tajam. Fokus pada penguatan eksentrik betis dan propriosepsi engkel.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 5.5,
        protein_target_g_kg: 1.7,
        hydration_electrolyte_protocol:
          'Konsumsi cairan berelektrolit 750 mL per jam sesi permainan dalam ruangan bertemperatur hangat.',
        supplementation_evidence_tier_a: [
          'Kreatin Monohidrat 5g (resintesis ATP-PCr antar-reli)',
          'Whey Protein Isolate 25g',
          'Kolagen Hidrolisat 10g + Vitamin C 50mg (kesehatan tendon Achilles)',
        ],
      },
    };
  }
}
