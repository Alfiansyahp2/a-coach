// Decoupled Flagship Extreme Sport AI Coach: Skateboarding Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from '../../core/contracts';

export interface SkateboardingSpecificMetrics {
  discipline?: 'STREET' | 'PARK' | 'VERT' | 'BOWL' | 'FLATGROUND';
  trickAttemptsCount?: number;
  bailOrFallCount?: number;
  impactLandingForceScale10?: number;
  distalRadiusWristPainScale10?: number;
  ankleInversionPainScale10?: number;
  headImpactReported?: boolean;
}

export class SkateboardingCoachAgent implements ISportCoachAgent<SkateboardingSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_SKATEBOARDING',
    sportNameId: 'Skateboard (Skateboarding)',
    sportNameEn: 'Skateboarding',
    cluster: 'FUNCTIONAL_EXTREME',
    primaryEnergySystem: 'PHOSPHAGEN_ATP_PC',
    governingStandard: 'World Skate & Skateboard Injury Prevention Protocol',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_SKATEBOARDING' ||
      code === 'SKATEBOARDING' ||
      code === 'SKATE' ||
      code === 'SKATEBOARD' ||
      code === 'STREET_SKATE' ||
      code === 'PARK_SKATE' ||
      code === 'VERT_SKATE'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<SkateboardingSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<SkateboardingSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const attempts = Number(metrics.trickAttemptsCount || 0);

    return {
      externalLoad: attempts > 0 ? attempts : dur,
      externalUnit: attempts > 0 ? 'Trick Attempts' : 'Minutes',
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<SkateboardingSpecificMetrics>): {
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

    // 1. Head Impact / Concussion Emergency Protocol
    if (metrics.headImpactReported) {
      haltDirectives.push(
        '[PROTOKOL DARURAT KONKUSI SKATEBOARD] Terdeteksi benturan kepala / jatuh keras. Sesi skateboard DIKUNCI TOTAL. Wajib evaluasi medis dan pemantauan gejala gegar otak (pusing, mual, fotofobia) selama 48 jam sesuai panduan SCAT6.'
      );
      contraindicatedMovements.push(
        'All skateboarding and balance training',
        'Stair sets and handrail grinds',
        'Bowl and vert ramp riding'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Istirahat kognitif dan fisik total di ruang tenang. Wajib evaluasi dokter spesialis saraf atau IGD jika pusing memburuk.',
      };
    }

    // 2. Distal Radius / Scaphoid Wrist Fracture Breaker (FOOSH - Fall Onto Outstretched Hand)
    const wristPain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.distalRadiusWristPainScale10 ||
            (symptomsList.some((l) => l.includes('wrist') || l.includes('tangan') || l.includes('scaphoid'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );

    if (wristPain >= 4 || symptoms?.swellingObserved) {
      haltDirectives.push(
        `Nyeri/bengkak pergelangan tangan akibat jatuh (FOOSH) ${wristPain}/10 terdeteksi. Kunci trik lompatan untuk mencegah fraktur skafoid / radius distal.`
      );
      contraindicatedMovements.push(
        'Ollie down stair sets and drops',
        'Board slide and lip tricks',
        'High-speed transitions'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Imobilisasi pergelangan tangan dengan wrist guard kaku, kompres dingin es 15 menit, dan periksakan foto Rontgen X-ray.',
      };
    }

    // 3. Ankle Inversion (ATFL) Sprain Breaker
    const anklePain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.ankleInversionPainScale10 ||
            (symptomsList.some((l) => l.includes('ankle') || l.includes('engkel'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );

    if (anklePain >= 4) {
      haltDirectives.push(
        `Nyeri terkilir ligamen pergelangan kaki ${anklePain}/10 terdeteksi. Kunci trik flip dan pendaratan benturan.`
      );
      contraindicatedMovements.push(
        'Kickflips and heelflips',
        'Ledge pop-outs and gap landings'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Protokol POLICE (Protection, Optimal Loading, Ice, Compression, Elevation) dan latihan proprioseptif wobble board fase pemulihan.',
      };
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<SkateboardingSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Skateboarding AI Coach',
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
        mesocycle_phase: safety.isSafe ? 'ACCUMULATION' : 'REHABILITATION_DELOAD',
        target_intensity_zone: safety.isSafe
          ? `Skate Session (${metrics.discipline || 'STREET'}, Upaya Trik: ${metrics.trickAttemptsCount || 25})`
          : 'Low-Impact Rest & Joint Protection',
        recommended_rest_hours: rpe >= 8 || (metrics.bailOrFallCount && metrics.bailOrFallCount >= 5) ? 36 : 24,
        next_session_prescription: safety.isSafe
          ? `Total Upaya Trik: ${workload.externalLoad} ${workload.externalUnit}. Pertahankan tekukan lutut peredam saat mendarat di atas baut board.`
          : 'Hentikan sesi skateboard. Berikan perlindungan dan kompresi pada sendi yang cedera.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 5.0,
        protein_target_g_kg: 1.6,
        hydration_electrolyte_protocol:
          'Sesi skate di skatepark beton menyerap panas tinggi. Konsumsi 500-750 mL air berelektrolit per jam.',
        supplementation_evidence_tier_a: [
          'Kalsium & Vitamin D3 (perlindungan struktur tulang terhadap impak pendaratan keras)',
          'Whey Protein 25g (pemulihan serat otot mikro-trauma)',
          'Elektrolit Hipotonik',
        ],
      },
    };
  }
}
