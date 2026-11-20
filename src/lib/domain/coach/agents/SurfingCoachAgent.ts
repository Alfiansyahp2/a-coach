// Decoupled Flagship Extreme Sport AI Coach: Surfing Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';

export interface SurfingSpecificMetrics {
  waveCount?: number;
  paddleDistanceMeters?: number;
  waterConditions?: 'CHOPPY' | 'CLEAN' | 'OVERHEAD' | 'BARREL';
  rotatorCuffStrainScale10?: number;
  cervicalHyperextensionPainScale10?: number;
  earCanalExostosisSymptom?: boolean;
}

export class SurfingCoachAgent implements ISportCoachAgent<SurfingSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_SURFING',
    sportNameId: 'Selancar Ombak (Surfing)',
    sportNameEn: 'Surfing',
    cluster: 'FUNCTIONAL_EXTREME',
    primaryEnergySystem: 'MIXED_INTERMITTENT',
    governingStandard: 'International Surfing Association (ISA) & Surfing Medicine International',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_SURFING' ||
      code === 'SURFING' ||
      code === 'SELANCAR' ||
      code === 'WAVE_SURFING' ||
      code === 'LONGBOARD' ||
      code === 'SHORTBOARD'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<SurfingSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<SurfingSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const paddleMeters = Number(metrics.paddleDistanceMeters || 0);
    const waves = Number(metrics.waveCount || 0);

    if (paddleMeters > 0) {
      return {
        externalLoad: Number((paddleMeters / 1000).toFixed(2)),
        externalUnit: 'Kilometers Paddled',
        internalStrain: sessionScoreAu,
        internalMethod: 'SESSION_RPE_FOSTER',
      };
    }

    if (waves > 0) {
      return {
        externalLoad: waves,
        externalUnit: 'Waves Caught',
        internalStrain: sessionScoreAu,
        internalMethod: 'SESSION_RPE_FOSTER',
      };
    }

    return {
      externalLoad: dur,
      externalUnit: 'Minutes',
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<SurfingSpecificMetrics>): {
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

    // 1. Rotator Cuff Paddle Impingement Breaker (Surfer's Shoulder)
    const shoulderPain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.rotatorCuffStrainScale10 ||
            (symptomsList.some((l) => l.includes('shoulder') || l.includes('bahu') || l.includes('rotator'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );

    if (shoulderPain >= 4) {
      haltDirectives.push(
        `Nyeri kompresi sendi bahu perenang/peselancar ${shoulderPain}/10 terdeteksi. Kunci mendayung volume tinggi menembus ombak pecah (duck dive & paddle out) untuk mencegah robekan manset rotator.`
      );
      contraindicatedMovements.push(
        'Sprint paddling against heavy sets',
        'Aggressive duck diving under overhead waves',
        'Late take-off drop ins'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Latihan rotasi eksternal manset rotator dengan tali elastis, peregangan otot pektoralis minor, dan foam rolling toraks.',
      };
    }

    // 2. Cervical Hyperextension Strain Breaker ("Surfer's Neck")
    const neckPain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.cervicalHyperextensionPainScale10 ||
            (symptomsList.some((l) => l.includes('neck') || l.includes('leher') || l.includes('cervical'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );

    if (neckPain >= 4) {
      haltDirectives.push(
        `Nyeri hiperekstensi leher servikal ${neckPain}/10 terdeteksi. Batasi durasi telungkup di atas papan selancar.`
      );
      contraindicatedMovements.push(
        'Continuous prone paddling with exaggerated head elevation',
        'Heavy whiplash wipeouts'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Chin tucks berbaring telentang, penguatan fleksor leher dalam, dan peregangan upper trapezius.',
      };
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<SurfingSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Surfing AI Coach',
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
          ? `Surf Lineup Session (Kondisi: ${metrics.waterConditions || 'CLEAN'}, Gelombang: ${metrics.waveCount || 8} waves)`
          : 'Dryland Rotator Cuff & Cervical Mobility Recovery',
        recommended_rest_hours: rpe >= 8 ? 36 : 24,
        next_session_prescription: safety.isSafe
          ? `Beban sesi selancar: ${workload.externalLoad} ${workload.externalUnit}. Pertahankan kelancaran pop-up dan rotasi pinggul saat bottom turn.`
          : 'Hentikan mendayung di laut. Fokus pada rehabilitasi manset rotator dan penguatan otot punggung atas di darat.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 5.0,
        protein_target_g_kg: 1.6,
        hydration_electrolyte_protocol:
          'Terik matahari dan air asin memicu dehidrasi terselubung. Konsumsi minimal 750 mL air dengan elektrolit tinggi per 60 menit sesi selancar.',
        supplementation_evidence_tier_a: [
          'Omega-3 EPA/DHA 2000mg (anti-inflamasi sendi bahu dan tulang rawan)',
          'Seng & Vitamin C (pemulihan kulit terpapar radiasi UV dan air laut)',
          'Whey Protein Isolate 25g',
        ],
      },
    };
  }
}
