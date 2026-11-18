// Decoupled Flagship Endurance Coach: Distance Running & Marathon Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';
import { calculateSessionRpeLoad } from '../kernels/fosterSessionRpeKernel';

export interface RunningSpecificMetrics {
  distanceMeters?: number;
  averageSpeedMps?: number;
  cadenceSpm?: number;
  elevationGainMeters?: number;
  groundContactTimeMs?: number;
  weeklyMileageKm?: number;
  prevWeeklyMileageKm?: number;
  rtrPhase?: 1 | 2 | 3 | 4; // Return-to-Run Phase
}

export class DistanceRunningCoachAgent implements ISportCoachAgent<RunningSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_DISTANCE_RUNNING',
    sportNameId: 'Lari Jarak Jauh & Maraton',
    sportNameEn: 'Distance Running & Marathon',
    cluster: 'CYCLIC_ENDURANCE',
    primaryEnergySystem: 'OXIDATIVE',
    governingStandard: 'World Athletics / ACSM Guidelines & Jack Daniels Running Formula',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_DISTANCE_RUNNING' ||
      code === 'RUN' ||
      code === 'RUNNING' ||
      code === 'TRAIL_RUN'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<RunningSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<RunningSpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'SESSION_RPE_FOSTER';
  } {
    const distMeters = Number(payload.sportSpecificMetrics?.distanceMeters || 0);
    const distKm = distMeters > 0 ? Number((distMeters / 1000).toFixed(2)) : 0;
    const duration = payload.durationMinutes;
    const rpe = payload.sessionRpe;
    const internalAU = calculateSessionRpeLoad(duration, rpe);

    return {
      externalLoad: distKm > 0 ? distKm : duration,
      externalUnit: distKm > 0 ? 'Kilometers' : 'Minutes',
      internalStrain: internalAU,
      internalMethod: 'SESSION_RPE_FOSTER',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<RunningSpecificMetrics>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  } {
    const symptoms = payload.subjectiveSymptoms;
    const haltDirectives: string[] = [];
    const contraindicatedMovements: string[] = [];

    const hasJointPain = Boolean(symptoms && symptoms.painScoreScale10 >= 1);
    const hasSwelling = Boolean(symptoms && symptoms.swellingObserved);
    const hasInstability = Boolean(symptoms && symptoms.jointInstabilityReported);

    const locations = (symptoms?.painLocations || []).map((l) => l.toLowerCase());
    const hasLowerLimbSymptom = locations.some(
      (l) => l.includes('ankle') || l.includes('knee') || l.includes('achilles') || l.includes('shin')
    );

    if (hasJointPain || hasSwelling || hasInstability || hasLowerLimbSymptom) {
      haltDirectives.push(
        'Benturan berulang lari (2.5-3.0x berat badan per langkah) dikontraindikasikan selama gejala sendi aktif terdeteksi.'
      );
      contraindicatedMovements.push(
        'Downhill running impact',
        'Repetitive high-impact plyometrics',
        'High-velocity sprint strides',
        'Unstable technical trail running'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Alihkan ke cross-training low-impact: Sepeda Zone 2 flat (cadence >85 RPM) atau renang gaya bebas untuk menjaga kapasitas aerobik tanpa membebani ligamen.',
      };
    }

    // Biomechanical ground reaction force & cadence check
    const cadence = Number(payload.sportSpecificMetrics?.cadenceSpm || 0);
    if (cadence > 0 && cadence < 160) {
      haltDirectives.push(
        `Kadens langkah rendah (${cadence} SPM) terdeteksi. Overstriding meningkatkan gaya reaksi tanah (GRF) dan stres kompresi lutut. Latih kadens bertahap menuju 170-180 SPM.`
      );
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<RunningSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const duration = payload.durationMinutes;

    // Return to Run (RTR) 4-Phase Evaluation
    let rtrDirective = 'Fase 4: Beban lari penuh tanpa restriksi klinis.';
    if (!safety.isSafe) {
      rtrDirective =
        'Fase 1/2 (Protokol Proteksi): Tunda lari kontinu. Prioritaskan toleransi jalan cepat 30 menit tanpa nyeri dan penguatan isometrik tungkai bawah.';
    } else if (metrics.rtrPhase === 2) {
      rtrDirective =
        'Fase 2 (Interval Jalan-Joging): Batasi sesi pada rasio 1 menit joging ringan : 2 menit jalan santai, akumulasi maksimal 20 menit.';
    } else if (metrics.rtrPhase === 3) {
      rtrDirective =
        'Fase 3 (Lari Kontinu Aerobik Dasar): Lari santai Zone 2 kontur datar maksimal 25-30 menit, monitor sensasi sendi pasca 24 jam.';
    }

    // Volume Spike Check (10% Rule)
    const currentWeekKm = Number(metrics.weeklyMileageKm || 0);
    const prevWeekKm = Number(metrics.prevWeeklyMileageKm || 0);
    let volumeNote = 'Progresi volume mingguan stabil.';
    if (prevWeekKm > 0 && currentWeekKm > 0) {
      const growthPct = Math.round(((currentWeekKm - prevWeekKm) / prevWeekKm) * 100);
      if (growthPct > 15) {
        volumeNote = `Peringatan: Kenaikan jarak mingguan mencapai +${growthPct}%. Standar pencegahan cedera merekomendasikan kenaikan maksimal 10% per minggu. Stabilkan jarak minggu depan.`;
      }
    }

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Distance Running & Marathon AI Coach',
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
        target_intensity_zone: safety.isSafe ? 'Zone 2 Easy Aerobic' : 'Low-Impact Restoratif',
        recommended_rest_hours: safety.isSafe ? (duration > 60 ? 48 : 24) : 48,
        next_session_prescription: safety.isSafe
          ? `${rtrDirective} ${volumeNote}`
          : 'Fokus pada pemulihan sendi, kompresi es/elevasi bila perlu, dan cross-training sepeda non-benturan.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: duration > 60 ? 6.0 : 4.0,
        protein_target_g_kg: 1.6,
        hydration_electrolyte_protocol:
          'Konsumsi 400-800 ml air/jam dengan tambahan elektrolit natrium (500 mg/L) untuk mencegah hiponatremia saat lari jarak jauh.',
        supplementation_evidence_tier_a: ['Cairan Elektrolit / Isotonik', 'Kafein (3 mg/kg BB pre-run bila sesuai)'],
      },
    };
  }
}
