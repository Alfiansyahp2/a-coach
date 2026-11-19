// Decoupled Flagship Extreme Sport AI Coach: Gymnastics Coach Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';

export interface GymnasticsSpecificMetrics {
  apparatus?:
    | 'FLOOR'
    | 'RINGS'
    | 'VAULT'
    | 'PARALLEL_BARS'
    | 'HORIZONTAL_BAR'
    | 'BALANCE_BEAM'
    | 'UNEVEN_BARS';
  routineOrPassCount?: number;
  landingImpactScoreScale10?: number;
  lumbarHyperextensionPainScale10?: number;
  wristDorsalImpingementPainScale10?: number;
}

export class GymnasticsCoachAgent implements ISportCoachAgent<GymnasticsSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_GYMNASTICS',
    sportNameId: 'Senam Artistik & Akrobatik (Artistic Gymnastics)',
    sportNameEn: 'Artistic Gymnastics',
    cluster: 'FUNCTIONAL_EXTREME',
    primaryEnergySystem: 'PHOSPHAGEN_ATP_PC',
    governingStandard: 'Fédération Internationale de Gymnastique (FIG) Medical Commission',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_GYMNASTICS' ||
      code === 'GYMNASTICS' ||
      code === 'SENAM_ARTISTIK' ||
      code === 'ARTISTIC_GYMNASTICS' ||
      code === 'TRAMPOLINE' ||
      code === 'TUMBLING' ||
      code === 'ACROBATICS'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<GymnasticsSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<GymnasticsSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const dur = Math.max(1, Number(payload.durationMinutes || 0));
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));
    const sessionScoreAu = dur * rpe;

    const metrics = payload.sportSpecificMetrics || {};
    const routines = Number(metrics.routineOrPassCount || 0);

    return {
      externalLoad: routines > 0 ? routines : dur,
      externalUnit: routines > 0 ? 'Routines/Passes' : 'Minutes',
      internalStrain: sessionScoreAu,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<GymnasticsSpecificMetrics>): {
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

    // 1. Spondylolysis / Lumbar Pars Interarticularis Stress Fracture Breaker
    const lumbarPain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.lumbarHyperextensionPainScale10 ||
            (symptomsList.some((l) => l.includes('lumbar') || l.includes('spine') || l.includes('pinggang'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );

    if (lumbarPain >= 4) {
      haltDirectives.push(
        `Nyeri hiperekstensi lumbal ${lumbarPain}/10 terdeteksi. Kunci pendaratan benturan tinggi dan gerakan lengkung tulang belakang (back handsprings/dismounts) untuk mencegah spondylolysis/fraktur pars.`
      );
      contraindicatedMovements.push(
        'Tumbling back handsprings & layouts',
        'Hard surface vault landings',
        'Bridge hyperextensions & ring dismounts'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Hollow body holds tanpa beban, deadbug core stabilization, dekompresi tulang belakang, dan pendaratan di foam pit dengan matras lunak.',
      };
    }

    // 2. Dorsal Wrist Impingement / Distal Radial Physis Breaker (Gymnast's Wrist)
    const wristPain = Math.max(
      0,
      Math.min(
        10,
        Number(
          metrics.wristDorsalImpingementPainScale10 ||
            (symptomsList.some((l) => l.includes('wrist') || l.includes('pergelangan'))
              ? symptoms?.painScoreScale10
              : 0) ||
            0
        )
      )
    );

    if (wristPain >= 4) {
      haltDirectives.push(
        `Nyeri kompresi dorsal pergelangan tangan ${wristPain}/10 terdeteksi. Kunci tumpuan telapak tangan hiperekstensi pada pommel horse/lantai.`
      );
      contraindicatedMovements.push(
        'Pommel horse circle flares',
        'Floor handstands & round-offs',
        'Vault hurdle entry'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Gunakan wrist guards/braces kaku, latihan rotasi gelang tanpa beban tumpu aksial, dan fokus latihan split fleksibilitas tungkai bawah.',
      };
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<GymnasticsSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const rpe = Math.max(1, Math.min(10, Number(payload.sessionRpe || 6)));

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Artistic Gymnastics AI Coach',
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
          ? `Acrobatic Skill Precision (${metrics.apparatus || 'FLOOR'}, Dampak Pendaratan: ${metrics.landingImpactScoreScale10 || 5}/10)`
          : 'Low-Impact Flexibility & Neutral Spine Rehabilitation',
        recommended_rest_hours: rpe >= 8 ? 36 : 24,
        next_session_prescription: safety.isSafe
          ? `Latihan rutin terselesaikan: ${workload.externalLoad} ${workload.externalUnit}. Pertahankan postur netral pelvis saat fase pendaratan.`
          : 'Hentikan pendaratan keras. Lakukan fisioterapi dekompresi tulang belakang dan penguatan otot dasar panggul.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 5.0,
        protein_target_g_kg: 1.8,
        hydration_electrolyte_protocol:
          'Konsumsi 500 mL air dengan magnesium 300 mg untuk membantu relaksasi neuromuskular pasca-pendaratan benturan tinggi.',
        supplementation_evidence_tier_a: [
          'Kalsium Sitrat 1000mg + Vitamin D3 2000 IU (densitas mineral tulang terhadap beban impak benturan)',
          'Whey Protein Isolate 25g',
          'Kreatin Monohidrat 3-5g',
        ],
      },
    };
  }
}
