// Decoupled Flagship Multi-Sport Coach: Triathlon Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from '../../core/contracts';

export interface TriathlonSpecificMetrics {
  discipline?: 'SWIM_BIKE_RUN' | 'BRICK_BIKE_RUN' | 'SWIM_BIKE';
  totalDistanceKm?: number;
  brickTransitionSeconds?: number;
  giDistressScoreScale10?: number;
  carbsIntakeGramsPerHour?: number;
  plantarFasciitisScoreScale10?: number;
}

export class TriathlonCoachAgent implements ISportCoachAgent<TriathlonSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_TRIATHLON',
    sportNameId: 'Triathlon & Multi-Sport (Brick)',
    sportNameEn: 'Triathlon',
    cluster: 'CYCLIC_ENDURANCE',
    primaryEnergySystem: 'OXIDATIVE',
    governingStandard: 'World Triathlon & IRONMAN Medical Rules',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_TRIATHLON' ||
      code === 'TRIATHLON' ||
      code === 'IRONMAN' ||
      code === 'TRI' ||
      code === 'DUATHLON' ||
      code === 'BRICK_WORKOUT'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<TriathlonSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<TriathlonSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const distKm = Math.max(0, Number(metrics.totalDistanceKm || 0));

    return {
      externalLoad: distKm > 0 ? distKm : dur,
      externalUnit: distKm > 0 ? 'Kilometers' : 'Minutes',
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<TriathlonSpecificMetrics>): {
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

    // 1. Gastrointestinal Distress & Hypovolemia Guard
    const giPain = Math.max(0, Math.min(10, Number(metrics.giDistressScoreScale10 || 0)));
    if (giPain >= 5) {
      haltDirectives.push(
        `Gangguan saluran cerna (GI Distress) ${giPain}/10 terdeteksi saat transisi brick. Kunci sesi lari tempo tinggi pasca-sepeda.`
      );
      contraindicatedMovements.push(
        'High-intensity running off the bike',
        'Concentrated hypertonic carbohydrate gel intake without water'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative: 'Jalan santai pemulihan, hidrasi larutan elektrolit hipotonik 250 mL tiap 20 menit.',
      };
    }

    // 2. Plantar Fascia & Achilles Tendon Guard
    const plantarPain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.plantarFasciitisScoreScale10 ||
            (symptomsList.some((l) => l.includes('foot') || l.includes('plantar') || l.includes('achilles'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );
    if (plantarPain >= 4) {
      haltDirectives.push(
        `Nyeri telapak kaki/plantar fascia ${plantarPain}/10 terdeteksi. Kunci transisi lari mendarat tumit/forefoot keras.`
      );
      contraindicatedMovements.push('Brick run with high ground impact', 'Hill running intervals');
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Alihkan seluruh beban aerobik ke sepeda tertutup (indoor turbo trainer) atau renang pull-buoy tanpa dorongan dinding keras.',
      };
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<TriathlonSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));

    const carbs = metrics.carbsIntakeGramsPerHour || 45;

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Triathlon (Multi-Sport) AI Coach',
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
        target_intensity_zone: safety.isSafe ? `Multi-Discipline Brick (${metrics.discipline || 'BRICK_BIKE_RUN'}, Transisi: ${metrics.brickTransitionSeconds || 60}s)` : 'Metabolic & Tissue Recovery',
        recommended_rest_hours: dur >= 120 ? 48 : 24,
        next_session_prescription: safety.isSafe
          ? `Beban ${workload.externalLoad} km triatlon terlaksana. Pertahankan konsumsi karbohidrat ${carbs}g/jam selama sesi panjang.`
          : 'Hentikan brick workout. Fokus pada pemulihan lambung dan fasia kaki.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 8.0,
        protein_target_g_kg: 1.8,
        hydration_electrolyte_protocol:
          'Protokol Jeukendrup: Rasio 2:1 Glukosa:Fruktosa pada sesi >2.5 jam, minimal 750-1000 mL cairan berelektrolit per jam.',
        supplementation_evidence_tier_a: [
          'Tablet Garam Natrium 500mg/jam',
          'Whey Protein Isolate 30g + 60g Maltodekstrin (pemulihan glikogen 30 menit pasca latihan)',
        ],
      },
    };
  }
}
