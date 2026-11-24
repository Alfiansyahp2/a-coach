// Decoupled Flagship Extreme Sport AI Coach: Sport Climbing & Bouldering Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from '../../core/contracts';
import { evaluateClimbingFingerPulleyRisk } from '../../kernels/racketAndPrecisionKernel';

export interface SportClimbingSpecificMetrics {
  climbingType?: 'BOULDERING' | 'LEAD' | 'SPEED' | 'HANGBOARD' | 'TRAD';
  attemptsCount?: number;
  highestGradeVScaleOrFont?: string;
  hangboardTutSeconds?: number;
  gripStyle?: 'FULL_CRIMP' | 'HALF_CRIMP' | 'OPEN_HAND' | 'SLOPER' | 'PINCH';
  fingerPainScale10?: number;
  audibleBowstringPopReported?: boolean;
  lumbarBelayStrainScale10?: number;
}

export class SportClimbingCoachAgent implements ISportCoachAgent<SportClimbingSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_CLIMBING',
    sportNameId: 'Panjat Tebing & Bouldering (Sport Climbing)',
    sportNameEn: 'Sport Climbing & Bouldering',
    cluster: 'FUNCTIONAL_EXTREME',
    primaryEnergySystem: 'ANAEROBIC_GLYCOLYTIC',
    governingStandard: 'International Federation of Sport Climbing (IFSC) & UIAA Medical Commission',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_CLIMBING' ||
      code === 'CLIMBING' ||
      code === 'PANJAT_TEBING' ||
      code === 'BOULDERING' ||
      code === 'SPORT_BOULDERING' ||
      code === 'ROCK_CLIMBING' ||
      code === 'LEAD_CLIMBING' ||
      code === 'HANGBOARD'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<SportClimbingSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<SportClimbingSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const attempts = Number(metrics.attemptsCount || 0);
    const tut = Number(metrics.hangboardTutSeconds || 0);

    let load = dur;
    let unit = 'Minutes';
    if (attempts > 0) {
      load = attempts;
      unit = 'Attempts';
    } else if (tut > 0) {
      load = tut;
      unit = 'Seconds TUT';
    }

    return {
      externalLoad: load,
      externalUnit: unit,
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<SportClimbingSpecificMetrics>): {
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

    const fingerPain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.fingerPainScale10 ||
            (symptomsList.some((l) => l.includes('finger') || l.includes('jari') || l.includes('pulley'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );

    const isFullCrimp = metrics.gripStyle === 'FULL_CRIMP';
    const hasPop = Boolean(metrics.audibleBowstringPopReported);

    // 1. Annular Finger Pulley (A2/A4) Rupture / Strain Gate
    const pulleySafety = evaluateClimbingFingerPulleyRisk(fingerPain, hasPop, isFullCrimp);

    if (!pulleySafety.isSafeForHardCrimp) {
      haltDirectives.push(pulleySafety.directive);
      contraindicatedMovements.push(
        'Closed full-crimp grip',
        'Campus board power dynos',
        'Small edge hangboard maximal hangs (<15mm)'
      );

      if (hasPop || fingerPain >= 6) {
        return {
          isSafe: false,
          haltDirectives,
          contraindicatedMovements,
          rehabilitationAlternative:
            'Imobilisasi jari dengan splint/taping protektif, hindari pembebanan tendon fleksor, dan jadwalkan evaluasi radiologi USG muskuloskeletal.',
        };
      }

      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Open-hand drag grip pada sloper/jugs besar, finger extensor resistance band training, dan aplikasi H-taping.',
      };
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<SportClimbingSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));

    const pulleyEval = evaluateClimbingFingerPulleyRisk(
      metrics.fingerPainScale10 || 0,
      metrics.audibleBowstringPopReported || false,
      metrics.gripStyle === 'FULL_CRIMP'
    );

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Sport Climbing & Bouldering AI Coach',
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
          ? `Climbing Volume & Send Project (${metrics.highestGradeVScaleOrFont || 'V4'}, Grip: ${metrics.gripStyle || 'HALF_CRIMP'})`
          : 'Active Extensor Finger Recovery & Core Training',
        recommended_rest_hours: rpe >= 8 || metrics.climbingType === 'BOULDERING' ? 48 : 24,
        next_session_prescription: safety.isSafe
          ? `Total Beban: ${workload.externalLoad} ${workload.externalUnit}. ${pulleyEval.directive}`
          : 'Hentikan pemanjatan sudut tajam. Istirahatkan tendon fleksor jari.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 4.5,
        protein_target_g_kg: 1.8,
        hydration_electrolyte_protocol:
          'Konsumsi 500 mL air per jam pemanjatan. Perhatikan dehidrasi pada gym indoor berdebu chalk/kapur.',
        supplementation_evidence_tier_a: [
          'Kolagen Hidrolisat 15g + Vitamin C 500mg (45-60 menit sebelum sesi untuk sintesis ligamen/pulley)',
          'Kreatin Monohidrat 5g (daya ledak anaerobik dyno)',
          'Whey Protein Isolate 25g',
        ],
      },
    };
  }
}
