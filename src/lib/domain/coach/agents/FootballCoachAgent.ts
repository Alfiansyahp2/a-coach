// Decoupled Flagship Team Sport Coach: Football / Soccer Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';
import {
  calculateHsrSegmentation,
  calculatePlayerLoadAu,
  evaluateHamstringAndKneeRisk,
  getTeamSportRecoveryTimeline,
} from '../kernels/intermittentSportsKernel';

export interface FootballSpecificMetrics {
  totalDistanceMeters?: number;
  hsrDistanceMeters?: number; // >19.8 km/h
  sprintDistanceMeters?: number; // >25.2 km/h
  accelerationsCount?: number;
  decelerationsCount?: number;
  matchMinutes?: number;
  acuteChronicRatio?: number;
  fifa11WarmupDone?: boolean;
}

export class FootballCoachAgent implements ISportCoachAgent<FootballSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_FOOTBALL',
    sportNameId: 'Sepak Bola (Football / Soccer)',
    sportNameEn: 'Football (Soccer)',
    cluster: 'TEAM_FIELD_COURT',
    primaryEnergySystem: 'MIXED_INTERMITTENT',
    governingStandard: 'FIFA Medical Network & F-MARC Injury Prevention Consensus (FIFA 11+)',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_FOOTBALL' ||
      code === 'FOOTBALL' ||
      code === 'SOCCER' ||
      code === 'SEPAK_BOLA'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<FootballSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<FootballSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'PLAYER_LOAD_AU';
  } {
    const metrics = payload.sportSpecificMetrics || {};
    const totalDist = Number(metrics.totalDistanceMeters || 0);
    const accels = Number(metrics.accelerationsCount || 0);
    const decels = Number(metrics.decelerationsCount || 0);

    const playerLoad = calculatePlayerLoadAu(
      payload.durationMinutes,
      payload.sessionRpe,
      accels + decels
    );

    const distKm = totalDist > 0 ? Number((totalDist / 1000).toFixed(2)) : payload.durationMinutes;
    const unit = totalDist > 0 ? 'Kilometers' : 'Minutes';

    return {
      externalLoad: distKm,
      externalUnit: unit,
      internalStrain: playerLoad.playerLoadAu,
      internalMethod: 'PLAYER_LOAD_AU',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<FootballSpecificMetrics>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  } {
    const symptoms = payload.subjectiveSymptoms;
    const haltDirectives: string[] = [];
    const contraindicatedMovements: string[] = [];

    const locations = (symptoms?.painLocations || []).map((l) => l.toLowerCase());
    const hasHamstringTightness = locations.some((l) => l.includes('hamstring') || l.includes('biceps femoris'));
    const hasGroinPain = locations.some((l) => l.includes('groin') || l.includes('adductor') || l.includes('selangkangan'));
    const hasKneePain = locations.some((l) => l.includes('knee') || l.includes('acl') || l.includes('meniscus'));

    const metrics = payload.sportSpecificMetrics || {};
    const sprintMeters = Number(metrics.sprintDistanceMeters || 0);
    const acwr = Number(metrics.acuteChronicRatio || 1.0);

    const riskEval = evaluateHamstringAndKneeRisk(sprintMeters, acwr, hasHamstringTightness);

    if (hasHamstringTightness || hasGroinPain || hasKneePain) {
      haltDirectives.push(
        'Gejala regangan otot hamstring, adduktor panggul, atau ligamen lutut terdeteksi. Risiko robekan akut (strain grade 2) saat akselerasi maksimal. Kunci beban sprint.'
      );
      contraindicatedMovements.push(
        'Maximal velocity sprinting (>25.2 km/h)',
        'Ballistic long-distance shooting',
        'Sharp 90-180 degree cutting without deceleration prep'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Protokol FIFA 11+: Nordic hamstring curls bertahap, Copenhagen adductor isometrics, dan pemulihan aerobik lari lurus tanpa kontak.',
      };
    }

    if (riskEval.isSpikeDetected) {
      haltDirectives.push(...riskEval.preventativeDirectives);
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<FootballSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const totalDist = Number(metrics.totalDistanceMeters || 0);
    const hsr = Number(metrics.hsrDistanceMeters || 0);
    const sprint = Number(metrics.sprintDistanceMeters || 0);

    const hsrResult = calculateHsrSegmentation(totalDist, hsr, sprint);
    const recovery = getTeamSportRecoveryTimeline(payload.durationMinutes, payload.sessionRpe);

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Football / Soccer AI Coach',
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
        target_intensity_zone: safety.isSafe ? 'Intermittent Repeated Sprint Ability' : 'Active Recovery & Tissue Flush',
        recommended_rest_hours: recovery.recommendedRestHours,
        next_session_prescription: safety.isSafe
          ? `Total Jarak: ${workload.externalLoad} km (HSR: ${hsrResult.hsrDistanceMeters}m, Sprint: ${hsrResult.sprintDistanceMeters}m). Wajib terapkan pemanasan FIFA 11+ sebelum sesi berikutnya.`
          : 'Hentikan sesi kompetitif. Fokus pada pemulihan mikrotrauma otot hamstring/adduktor.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: recovery.glycogenRestorationGramsPerKg,
        protein_target_g_kg: 1.8,
        hydration_electrolyte_protocol:
          'Konsumsi cairan elektrolit sebanding 150% dari berat badan yang hilang selama pertandingan. Tambahkan 500-700 mg natrium per liter.',
        supplementation_evidence_tier_a: [
          'Kreatin Monohidrat (5g/hari untuk resintesis fosfagen semburan sprint)',
          'Jus Ceri Asam (Tart Cherry Juice - mengurangi delayed onset muscle soreness pasca laga)',
          'Whey Protein Isolate (25-30g)',
        ],
      },
    };
  }
}
