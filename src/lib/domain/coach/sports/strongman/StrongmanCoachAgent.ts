// Decoupled Flagship Strength Coach: Strongman & Heavy Carries Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from '../../core/contracts';
import { calculateSessionRpeLoad } from '../../kernels/fosterSessionRpeKernel';

export interface StrongmanSpecificMetrics {
  primaryEvent?: 'FARMERS_WALK' | 'YOKE_WALK' | 'LOG_PRESS' | 'ATLAS_STONE' | 'AXLE_DEADLIFT' | 'TIRE_FLIP';
  carriedLoadKg?: number;
  carryDistanceMeters?: number;
  timeUnderLoadSeconds?: number;
  axialCompressionLoadKg?: number;
  gripExhaustionScore10?: number; // 1-10
}

export class StrongmanCoachAgent implements ISportCoachAgent<StrongmanSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_STRONGMAN',
    sportNameId: 'Strongman & Beban Aksial Berat (Heavy Carries)',
    sportNameEn: 'Strongman & Heavy Carries',
    cluster: 'STRENGTH_POWER',
    primaryEnergySystem: 'PHOSPHAGEN_ATP_PC',
    governingStandard: 'Official Strongman / Arnold Strongman Classic Event Safety Protocols',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_STRONGMAN' ||
      code === 'STRONGMAN' ||
      code === 'FARMERS_WALK' ||
      code === 'LOG_PRESS' ||
      code === 'YOKE'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<StrongmanSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<StrongmanSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'NEUROMUSCULAR_TONNAGE';
  } {
    const metrics = payload.sportSpecificMetrics || {};
    const loadKg = Number(metrics.carriedLoadKg || metrics.axialCompressionLoadKg || 0);
    const distMeters = Number(metrics.carryDistanceMeters || 0);

    let externalLoad = payload.durationMinutes;
    let externalUnit = 'Minutes';

    if (loadKg > 0 && distMeters > 0) {
      externalLoad = Number(((loadKg * distMeters) / 100).toFixed(1)); // Deca-Tonnage-Meter
      externalUnit = 'Work Units (Load x Meters / 100)';
    } else if (loadKg > 0) {
      externalLoad = loadKg;
      externalUnit = 'Event Load (kg)';
    }

    const duration = payload.durationMinutes;
    const rpe = payload.sessionRpe;
    const internalAU = calculateSessionRpeLoad(duration, rpe);

    return {
      externalLoad,
      externalUnit,
      internalStrain: internalAU,
      internalMethod: 'NEUROMUSCULAR_TONNAGE',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<StrongmanSpecificMetrics>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  } {
    const symptoms = payload.subjectiveSymptoms;
    const haltDirectives: string[] = [];
    const contraindicatedMovements: string[] = [];

    const hasSpinePain = Boolean(
      symptoms?.painLocations?.some(
        (l) => l.toLowerCase().includes('spine') || l.toLowerCase().includes('lumbar') || l.toLowerCase().includes('back')
      )
    );

    const hasBicepsTearRisk = Boolean(
      symptoms?.painLocations?.some((l) => l.toLowerCase().includes('biceps') || l.toLowerCase().includes('bisep'))
    );

    let isSafe = true;
    let rehabilitationAlternative: string | undefined;

    if (hasSpinePain) {
      isSafe = false;
      haltDirectives.push(
        'Kompresi aksial berat pada kolumna vertebra (L4-S1) terdeteksi. Beban Yoke/Log berat berisiko fatal pada diskus intervertebralis. Hentikan seluruh pembebanan aksial vertikal.'
      );
      contraindicatedMovements.push(
        'Heavy Yoke walks (>1.5x bodyweight)',
        'Max Log clean and press',
        'Heavy Atlas stone lifting'
      );
      rehabilitationAlternative =
        'Lakukan dekompresi tulang belakang (dead hangs pada bar horizontal, reverse hyper) dan penguatan stabilisator core tanpa beban aksial.';
    }

    if (hasBicepsTearRisk) {
      isSafe = false;
      haltDirectives.push(
        'Ketegangan tendon biseps distal akut terdeteksi. Larang keras teknik tekuk lengan saat lifting batu atlas atau deadlift mixed-grip guna mencegah ruptur tendon biseps.'
      );
      contraindicatedMovements.push('Atlas stone lifting with bent arms', 'Mixed grip deadlift without straps');
      if (!rehabilitationAlternative) {
        rehabilitationAlternative = 'Istirahatkan lengan penarik dan gunakan lifting straps pada variasi tarikan ringan.';
      }
    }

    return {
      isSafe,
      haltDirectives,
      contraindicatedMovements,
      rehabilitationAlternative,
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<StrongmanSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const event = metrics.primaryEvent || 'HEAVY_CARRIES';

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Strongman & Heavy Carries AI Coach',
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
        target_intensity_zone: safety.isSafe ? `Maximal Event Power: ${event}` : 'Spinal Decompression & Recovery',
        recommended_rest_hours: 72, // Heavy carries induce massive CNS and skeletal fatigue
        next_session_prescription: safety.isSafe
          ? `Beban event kuat dan stabil. Berikan jeda pemulihan 72 jam penuh sebelum sesi aksial berikutnya. Gunakan sabuk beban dan pertahankan intra-abdominal pressure (bracing).`
          : 'Hentikan beban berat aksial. Utamakan pemulihan tulang belakang dan hindari kompresi leher/pinggang.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: 5.5,
        protein_target_g_kg: 2.2, // High tissue repair demand
        hydration_electrolyte_protocol:
          'Kebutuhan hidrasi tinggi: 3.5 - 4.5 liter air per hari. Tambahkan natrium dosis tinggi (800 mg/L) untuk stabilitas tekanan darah saat manuver Valsalva.',
        supplementation_evidence_tier_a: [
          'Kreatin Monohidrat (5g/hari)',
          'Elektrolit Natrium Dosis Tinggi',
          'Whey Protein Isolate (35-40g pasca sesi)',
        ],
      },
    };
  }
}
