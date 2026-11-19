// Decoupled Flagship Aquatic Sport Coach: Rowing & Ergometer Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';

export interface RowingSpecificMetrics {
  distanceMeters?: number;
  splitPace500mSeconds?: number;
  strokeRateSpm?: number;
  dragFactor?: number;
  lumbarStrainScoreScale10?: number;
  ribStressPainScoreScale10?: number;
}

export class RowingCoachAgent implements ISportCoachAgent<RowingSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_ROWING',
    sportNameId: 'Dayung (Rowing & Ergometer)',
    sportNameEn: 'Rowing',
    cluster: 'CYCLIC_ENDURANCE',
    primaryEnergySystem: 'OXIDATIVE',
    governingStandard: 'World Rowing (FISA) Sports Medicine Commission Guidelines',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_ROWING' ||
      code === 'ROWING' ||
      code === 'DAYUNG' ||
      code === 'ERGOMETER' ||
      code === 'CREW' ||
      code === 'SCULLING'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<RowingSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<RowingSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const distMeters = Math.max(0, Number(metrics.distanceMeters || 0));
    const distKm = distMeters > 0 ? Number((distMeters / 1000).toFixed(2)) : dur;
    const unit = distMeters > 0 ? 'Kilometers' : 'Minutes';

    return {
      externalLoad: distKm,
      externalUnit: unit,
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<RowingSpecificMetrics>): {
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

    // 1. Rib Stress Fracture Guard (Posterolateral rib pain from serratus anterior pull during drive)
    const ribPain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.ribStressPainScoreScale10 ||
            (symptomsList.some((l) => l.includes('rib') || l.includes('iga') || l.includes('rusuk'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );
    if (ribPain >= 4) {
      haltDirectives.push(
        `Nyeri tulang rusuk/iga (Rib Stress Fracture Warning) ${ribPain}/10 terdeteksi. Kunci tarikan fase drive keras pada ergometer/perahu.`
      );
      contraindicatedMovements.push(
        'Heavy load drive phase on rowing ergometer',
        'High drag-factor intervals (>130 drag factor)'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Istirahat total dari tarikan dayung, ganti ke sepeda statis tegak tanpa kompresi dada, dan evaluasi radiologis tulang rusuk.',
      };
    }

    // 2. Lumbar Spine Flexion Shear Guard
    const lumbarPain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.lumbarStrainScoreScale10 ||
            (symptomsList.some((l) => l.includes('back') || l.includes('lumbar') || l.includes('punggung'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );
    if (lumbarPain >= 4) {
      haltDirectives.push(
        `Nyeri lumbal bawah ${lumbarPain}/10 akibat fleksi berlebih saat fase catch. Batasi jangkauan forward reach saat catch.`
      );
      contraindicatedMovements.push('Full compression forward reach catch with rounded back');
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative: 'Latihan engsel panggul (hip hinge drills), glute bridges, dan dekompresi lumbal.',
      };
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<RowingSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));

    const splitSec = metrics.splitPace500mSeconds || 120;
    const splitMin = Math.floor(splitSec / 60);
    const splitRemSec = Math.round(splitSec % 60);
    const formattedSplit = `${splitMin}:${splitRemSec < 10 ? '0' : ''}${splitRemSec}/500m`;

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Rowing & Ergometer AI Coach',
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
        target_intensity_zone: safety.isSafe ? `Steady State Rowing (${formattedSplit}, ${metrics.strokeRateSpm || 22} SPM)` : 'Active Non-Impact Recovery',
        recommended_rest_hours: rpe >= 8 ? 48 : 24,
        next_session_prescription: safety.isSafe
          ? `Beban ${workload.externalLoad} km dayung selesai. Pertahankan rasio dorongan kaki 60%, ayunan tubuh 20%, dan tarikan lengan 20%.`
          : 'Hentikan tarikan fase drive. Fokus pada pemulihan dinding dada dan tulang belakang.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 6.5,
        protein_target_g_kg: 1.7,
        hydration_electrolyte_protocol:
          'Konsumsi cairan elektrolit 1.0 - 1.5 L per jam sesi ergometer intensif dengan suplementasi kalsium dan vitamin D untuk integritas tulang rusuk.',
        supplementation_evidence_tier_a: [
          'Kalsium 1000 mg + Vitamin D3 (pencegahan fraktur stres tulang rusuk)',
          'Beta-Alanin 4g (kapasitas anaerobik 2000m test)',
          'Whey Protein Isolate 25g',
        ],
      },
    };
  }
}
