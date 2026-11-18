// Decoupled Flagship Team Sport Coach: Basketball Agent
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

export interface BasketballSpecificMetrics {
  jumpsCount?: number;
  averageJumpHeightCm?: number;
  lateralDecelerationsCount?: number;
  courtTimeMinutes?: number;
  quarterCount?: number;
}

export class BasketballCoachAgent implements ISportCoachAgent<BasketballSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_BASKETBALL',
    sportNameId: 'Bola Basket (Basketball)',
    sportNameEn: 'Basketball',
    cluster: 'TEAM_FIELD_COURT',
    primaryEnergySystem: 'MIXED_INTERMITTENT',
    governingStandard: 'FIBA Medical Commission & NBA Applied Sports Science Guidelines',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_BASKETBALL' ||
      code === 'BASKETBALL' ||
      code === 'BOLA_BASKET'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<BasketballSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<BasketballSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'PLAYER_LOAD_AU';
  } {
    const metrics = payload.sportSpecificMetrics || {};
    const jumps = Number(metrics.jumpsCount || 0);
    const lateralDecels = Number(metrics.lateralDecelerationsCount || 0);

    const playerLoad = calculatePlayerLoadAu(
      payload.durationMinutes,
      payload.sessionRpe,
      lateralDecels,
      jumps
    );

    const externalLoad = jumps > 0 ? jumps : payload.durationMinutes;
    const externalUnit = jumps > 0 ? 'Total Jumps' : 'Minutes';

    return {
      externalLoad,
      externalUnit,
      internalStrain: playerLoad.playerLoadAu,
      internalMethod: 'PLAYER_LOAD_AU',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<BasketballSpecificMetrics>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  } {
    const symptoms = payload.subjectiveSymptoms;
    const haltDirectives: string[] = [];
    const contraindicatedMovements: string[] = [];

    const locations = (symptoms?.painLocations || []).map((l) => l.toLowerCase());
    const hasPatellarPain = locations.some((l) => l.includes('patella') || l.includes('knee') || l.includes('lutut'));
    const hasAnkleInstability = locations.some((l) => l.includes('ankle') || l.includes('pergelangan')) || Boolean(symptoms?.jointInstabilityReported);

    if (hasPatellarPain) {
      haltDirectives.push(
        'Gejala tendinopati patela (Jumper\'s Knee) terdeteksi. Pendaratan deselerasi tinggi di lantai keras melipatgandakan gaya tekan tendon patela hingga 6-8x berat badan. Hentikan beban lompatan maksimal.'
      );
      contraindicatedMovements.push(
        'Maximal vertical leap jumps',
        'Abrupt deceleration change-of-direction cuts',
        'Drop jumps from elevated boxes'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Protokol tendon Cook & Purdam: Latihan isometrik Spanish Squats (5 set x 45 detik tahanan) dan latihan rantai tertutup tanpa benturan (sepeda Zone 2).',
      };
    }

    if (hasAnkleInstability) {
      haltDirectives.push('Instabilitas pergelangan kaki atau riwayat sprain inversi lateral (ATFL) terdeteksi. Wajib gunakan ankle brace semi-rigid.');
      contraindicatedMovements.push('Uncontrolled rebound landing in traffic');
    }

    // High jump volume alert (>60 jumps in single session)
    const jumps = Number(payload.sportSpecificMetrics?.jumpsCount || 0);
    if (jumps > 60) {
      haltDirectives.push(`Volume lompatan tinggi (${jumps} jumps tercatat). Lakukan pemantauan kekakuan tendon kuadrisep 24 jam pasca sesi.`);
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements,
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<BasketballSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const jumps = Number(metrics.jumpsCount || 0);
    const avgHeight = Number(metrics.averageJumpHeightCm || 0);

    let jumpSummary = 'Sesi basket berdaya ledak neuromuskular prima.';
    if (jumps > 0 && avgHeight > 0) {
      jumpSummary = `${jumps} lompatan tercatat dengan tinggi rerata ${avgHeight} cm.`;
    }

    const recovery = getTeamSportRecoveryTimeline(payload.durationMinutes, payload.sessionRpe);

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Basketball AI Coach',
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
        target_intensity_zone: safety.isSafe ? 'Alactic Power & Deceleration Control' : 'Tendon Decompression & Isometrics',
        recommended_rest_hours: recovery.recommendedRestHours,
        next_session_prescription: safety.isSafe
          ? `${jumpSummary} Fokus pada teknik pendaratan fleksi lutut >30 derajat untuk mereduksi gaya impak pendaratan pada tibia dan patela.`
          : 'Hentikan sesi kompetitif di lapangan keras. Lindungi tendon patela dan sendi pergelangan kaki.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 5.5,
        protein_target_g_kg: 1.8,
        hydration_electrolyte_protocol:
          'Konsumsi cairan elektrolit 500-800 ml/jam permainan. Keringat lapangan indoor tinggi membutuhkan asupan natrium 600 mg/L.',
        supplementation_evidence_tier_a: [
          'Kreatin Monohidrat (5g/hari)',
          'Kolagen Peptida + Vitamin C 45 menit sebelum latihan pliometrik',
          'Elektrolit Isotonik',
        ],
      },
    };
  }
}
