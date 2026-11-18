// Decoupled Flagship Team Sport Coach: Volleyball Agent (Indoor & Beach)
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

export interface VolleyballSpecificMetrics {
  spikeJumpCount?: number;
  blockJumpCount?: number;
  totalJumpsCount?: number;
  spikeVelocityKmh?: number;
  surfaceType?: 'INDOOR_HARDWOOD' | 'BEACH_SAND';
  shoulderFatigueScore10?: number; // 0-10
}

export class VolleyballCoachAgent implements ISportCoachAgent<VolleyballSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_VOLLEYBALL',
    sportNameId: 'Bola Voli (Indoor & Pasir)',
    sportNameEn: 'Volleyball (Indoor & Beach)',
    cluster: 'TEAM_FIELD_COURT',
    primaryEnergySystem: 'PHOSPHAGEN_ATP_PC',
    governingStandard: 'FIVB Medical Commission & Olympic Volleyball Sports Science Guidelines',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_VOLLEYBALL' ||
      code === 'VOLLEYBALL' ||
      code === 'BOLA_VOLI' ||
      code === 'BEACH_VOLLEYBALL'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<VolleyballSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<VolleyballSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'PLAYER_LOAD_AU';
  } {
    const metrics = payload.sportSpecificMetrics || {};
    const spikes = Number(metrics.spikeJumpCount || 0);
    const blocks = Number(metrics.blockJumpCount || 0);
    const totalJumps = metrics.totalJumpsCount ? Number(metrics.totalJumpsCount) : spikes + blocks;

    const playerLoad = calculatePlayerLoadAu(
      payload.durationMinutes,
      payload.sessionRpe,
      0,
      totalJumps
    );

    const externalLoad = totalJumps > 0 ? totalJumps : payload.durationMinutes;
    const externalUnit = totalJumps > 0 ? 'Total Jumps' : 'Minutes';

    return {
      externalLoad,
      externalUnit,
      internalStrain: playerLoad.playerLoadAu,
      internalMethod: 'PLAYER_LOAD_AU',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<VolleyballSpecificMetrics>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  } {
    const symptoms = payload.subjectiveSymptoms;
    const haltDirectives: string[] = [];
    const contraindicatedMovements: string[] = [];

    const locations = (symptoms?.painLocations || []).map((l) => l.toLowerCase());
    const hasShoulderPain = locations.some(
      (l) => l.includes('shoulder') || l.includes('rotator') || l.includes('supraspinatus') || l.includes('bahu')
    ) || (payload.sportSpecificMetrics?.shoulderFatigueScore10 || 0) >= 4;

    const hasKneePain = locations.some((l) => l.includes('patella') || l.includes('knee') || l.includes('lutut'));

    if (hasShoulderPain) {
      haltDirectives.push(
        'Nyeri impingement bahu atau tendinopati rotator cuff terdeteksi. Pukulan smash berulang (spike) dengan kecepatan tinggi meningkatkan friksi subakromial. Hentikan smash overhead.'
      );
      contraindicatedMovements.push(
        'High-velocity overhead spike smash',
        'Jump serve with maximal shoulder extension',
        'Heavy overhead presses'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Penguatan rotator cuff isometrik (internal/external rotation dengan resistance band) dan latihan stabilitas skapula (Y-T-W raises).',
      };
    }

    if (hasKneePain) {
      haltDirectives.push('Nyeri tendinopati patela saat pendaratan lonjakan blok/smash. Lakukan evaluasi kedalaman pendaratan.');
      contraindicatedMovements.push('Repetitive single-leg landing from block');
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements,
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<VolleyballSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const spikes = Number(metrics.spikeJumpCount || 0);
    const blocks = Number(metrics.blockJumpCount || 0);
    const surface = metrics.surfaceType || 'INDOOR_HARDWOOD';

    const recovery = getTeamSportRecoveryTimeline(payload.durationMinutes, payload.sessionRpe);

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Volleyball AI Coach',
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
        target_intensity_zone: safety.isSafe ? `Explosive Power (${surface})` : 'Shoulder & Tendon Restorative',
        recommended_rest_hours: recovery.recommendedRestHours,
        next_session_prescription: safety.isSafe
          ? `${workload.externalLoad} lonjakan tercatat (${spikes} spike, ${blocks} block). Lakukan pemanasan bahu Thrower's Ten sebelum sesi latihan berikutnya.`
          : 'Hentikan spike overhead. Prioritaskan integritas kapsul sendi bahu dan sendi lutut.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 5.0,
        protein_target_g_kg: 1.8,
        hydration_electrolyte_protocol:
          'Hidrasi 500-750 ml cairan elektrolit per jam. Pada voli pasir (outdoor heat stress), tingkatkan asupan cairan ke 800-1000 ml/jam.',
        supplementation_evidence_tier_a: [
          'Kreatin Monohidrat (5g/hari untuk daya lonjak vertikal)',
          'Kolagen Peptida Terhidrolisis (10g) untuk perlindungan tendon patela',
          'Elektrolit',
        ],
      },
    };
  }
}
