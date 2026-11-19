// Decoupled Flagship Functional Fitness AI Coach: Functional Fitness Coach Agent (CrossFit / Hyrox / Metcon)
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';
import { evaluateRhabdomyolysisRisk } from '../kernels/racketAndPrecisionKernel';

export interface FunctionalFitnessSpecificMetrics {
  workoutFormat?: 'AMRAP' | 'FOR_TIME' | 'EMOM' | 'CHIPPER' | 'INTERVAL';
  roundsCompleted?: number;
  repsCompleted?: number;
  isHighVolumeEccentric?: boolean;
  hasDarkUrineOrExtremeSwelling?: boolean;
  creatineKinaseLevelU_L?: number;
  lumbarShearStrainScale10?: number;
}

export class FunctionalFitnessCoachAgent implements ISportCoachAgent<FunctionalFitnessSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_FUNCTIONAL_FITNESS',
    sportNameId: 'Kebugaran Fungsional & Metcon (CrossFit / Hyrox)',
    sportNameEn: 'Functional Fitness & Metcon',
    cluster: 'FUNCTIONAL_EXTREME',
    primaryEnergySystem: 'MIXED_INTERMITTENT',
    governingStandard: 'CrossFit Games Medical Board & ACSM Functional Fitness Safety Consensus',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_FUNCTIONAL_FITNESS' ||
      code === 'FUNCTIONAL_FITNESS' ||
      code === 'CROSSFIT' ||
      code === 'HYROX' ||
      code === 'METCON' ||
      code === 'HIIT' ||
      code === 'FUNCTIONAL_TRAINING' ||
      code === 'WORKOUT'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<FunctionalFitnessSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<FunctionalFitnessSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const reps = Number(metrics.repsCompleted || 0);
    const rounds = Number(metrics.roundsCompleted || 0);

    let load = dur;
    let unit = 'Minutes';
    if (reps > 0) {
      load = reps;
      unit = 'Reps';
    } else if (rounds > 0) {
      load = rounds;
      unit = 'Rounds';
    }

    return {
      externalLoad: load,
      externalUnit: unit,
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<FunctionalFitnessSpecificMetrics>): {
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

    // 1. Rhabdomyolysis Risk Evaluation
    const rhabdo = evaluateRhabdomyolysisRisk(
      payload.durationMinutes,
      payload.sessionRpe,
      metrics.isHighVolumeEccentric ?? false,
      metrics.hasDarkUrineOrExtremeSwelling ?? false
    );

    if (rhabdo.isEmergencyAlert) {
      haltDirectives.push(rhabdo.directive);
      contraindicatedMovements.push(
        'All physical training',
        'High-volume eccentric pull-ups / GHD sit-ups',
        'Maximal Olympic lifts under fatigue'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'SEGERA ke IGD Medis Rumah Sakit untuk hidrasi IV saline. Tidak boleh berolahraga sampai clearance nefrologi/medis!',
      };
    }

    // 2. Lumbar Spine Shear Strain Breaker (High-rep Olympic lifts / Deadlifts under metabolic fatigue)
    const lumbarPain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.lumbarShearStrainScale10 ||
            (symptomsList.some((l) => l.includes('lumbar') || l.includes('pinggang') || l.includes('lower back'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );

    if (lumbarPain >= 5) {
      haltDirectives.push(
        `Nyeri kompresi/geser lumbal bawah ${lumbarPain}/10 terdeteksi. Kunci angkatan beban bebas berulang cepat (high-rep deadlifts/snatches).`
      );
      contraindicatedMovements.push(
        'High-rep barbell deadlifts for time',
        'GHD sit-ups and back extensions',
        'Barbell snatches and clean & jerks under fatigue'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Sled pushes/drags, active zone 2 stationary bike, dan dekompresi spinal hanging dengan bird-dog core stabilization.',
      };
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<FunctionalFitnessSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));

    const rhabdo = evaluateRhabdomyolysisRisk(
      payload.durationMinutes,
      payload.sessionRpe,
      metrics.isHighVolumeEccentric ?? false,
      metrics.hasDarkUrineOrExtremeSwelling ?? false
    );

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Functional Fitness & Metcon AI Coach',
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
          ? `Metabolic Conditioning (${metrics.workoutFormat || 'AMRAP'}: RPE ${rpe})`
          : 'Complete Medical Rest / Active Low-Impact Recovery',
        recommended_rest_hours: rpe >= 9 || metrics.isHighVolumeEccentric ? 48 : 24,
        next_session_prescription: safety.isSafe
          ? `Sesi fungsional terselesaikan: ${workload.externalLoad} ${workload.externalUnit}. ${rhabdo.directive}`
          : 'Hentikan seluruh sirkuit metcon intensitas tinggi. Ikuti protokol pemulihan medis.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 5.5,
        protein_target_g_kg: 2.0,
        hydration_electrolyte_protocol:
          'Konsumsi 750-1000 mL air dengan natrium 500-700 mg pasca-metcon untuk rehidrasi seluler cepat dan pencegahan kram otot.',
        supplementation_evidence_tier_a: [
          'Kreatin Monohidrat 5g (resintesis ATP fosfagen)',
          'Beta-Alanin 3.2-4.0g (buffering ion H+ intramuskular)',
          'Whey Protein 30g + Karbohidrat Cepat Cerna (pemulihan glikogen)',
        ],
      },
    };
  }
}
