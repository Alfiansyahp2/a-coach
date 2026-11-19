// Decoupled Flagship Precision Sport Coach: Shooting Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';

export interface ShootingSpecificMetrics {
  shotsCount?: number;
  discipline?: 'AIR_RIFLE' | 'AIR_PISTOL' | 'TRAP' | 'RAPID_FIRE';
  posturalTremorScoreScale10?: number;
  heartRateDipAtTriggerBpm?: number;
  neckCervicalStiffnessScale10?: number;
  leadExposureCheckDone?: boolean;
}

export class ShootingCoachAgent implements ISportCoachAgent<ShootingSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_SHOOTING',
    sportNameId: 'Menembak (Sport Shooting)',
    sportNameEn: 'Sport Shooting',
    cluster: 'RACQUET_PRECISION',
    primaryEnergySystem: 'PHOSPHAGEN_ATP_PC',
    governingStandard: 'International Shooting Sport Federation (ISSF) Medical Commission',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_SHOOTING' ||
      code === 'SHOOTING' ||
      code === 'MENEMBAK' ||
      code === 'AIR_RIFLE' ||
      code === 'AIR_PISTOL' ||
      code === 'TRAP_SHOOTING'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<ShootingSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<ShootingSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 3)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const shots = Math.max(0, Number(metrics.shotsCount || 0));

    return {
      externalLoad: shots > 0 ? shots : dur,
      externalUnit: shots > 0 ? 'Shots' : 'Minutes',
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<ShootingSpecificMetrics>): {
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

    // 1. Cervical Spine & Upper Trapezius Spasm (Asymmetric Rifle/Pistol Mount)
    const neckPain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.neckCervicalStiffnessScale10 ||
            (symptomsList.some((l) => l.includes('neck') || l.includes('leher') || l.includes('trapezius'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );
    if (neckPain >= 4) {
      haltDirectives.push(
        `Kekakuan otot leher servikal dan trapezius ${neckPain}/10 akibat postur membidik asimetris statis. Kunci sesi bidik durasi panjang.`
      );
      contraindicatedMovements.push('Prolonged rifle cheek-piece static holding (>15 minutes without break)');
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Peregangan leher servikal lateral, dekompresi bahu, dan latihan kardio aerobik jalan santai.',
      };
    }

    // 2. High Postural Tremor (Autonomic / Sympathetic Over-activation)
    const tremor = Math.max(0, Math.min(10, Number(metrics.posturalTremorScoreScale10 || 0)));
    if (tremor >= 6) {
      haltDirectives.push(
        `Tremor postural tinggi ${tremor}/10 terdeteksi. Sistem saraf otonom mengalami kelelahan simpatis atau defisit tidur.`
      );
      contraindicatedMovements.push('Fine precision competition shooting under time pressure');
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative: 'Latihan pernapasan resonansi diafragma (6 napas per menit) dan istirahat tidur cukup.',
      };
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<ShootingSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const dur = Math.max(1, Number(payload.durationMinutes || 0));

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Sport Shooting (Menembak) AI Coach',
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
        target_intensity_zone: safety.isSafe ? `Parasympathetic Precision (${metrics.shotsCount || 0} tembakan, HR dip: ${metrics.heartRateDipAtTriggerBpm || 62} bpm)` : 'Autonomic Nervous System Recovery',
        recommended_rest_hours: 16,
        next_session_prescription: safety.isSafe
          ? `Sesi ${dur} menit menembak selesai. Latih kontrol ekshalasi perlahan saat menarik picu tembakan (trigger pull).`
          : 'Hentikan membidik statis. Lakukan relaksasi mata dan peregangan leher.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 3.5,
        protein_target_g_kg: 1.4,
        hydration_electrolyte_protocol:
          'Pertahankan hidrasi air mineral stabil; HINDARI suplemen stimulan kafein dosis tinggi sebelum menembak.',
        supplementation_evidence_tier_a: [
          'Omega-3 DHA/EPA 1000mg (kecepatan pemrosesan visual retina & fokus)',
          'Vitamin B Kompleks (kesehatan fungsi konduksi saraf motorik halus)',
        ],
      },
    };
  }
}
