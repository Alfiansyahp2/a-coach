// Decoupled Flagship Endurance Coach: Mountain Bike Cross-Country (MTB XC) Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from '../../core/contracts';
import { calculateSessionRpeLoad } from '../../kernels/fosterSessionRpeKernel';

export interface MtbXcSpecificMetrics {
  distanceMeters?: number;
  elevationGainMeters?: number;
  steepClimbMeters?: number;
  averageCadenceRpm?: number;
  technicalTrailGrade?: 'GREEN_EASY' | 'BLUE_MODERATE' | 'BLACK_TECHNICAL';
  peakTorqueNm?: number;
  ascentTimeMinutes?: number;
  trailVibrationRpe?: number; // 1-10 scale for upper-body / arm pump fatigue
}

export class MtbXcCoachAgent implements ISportCoachAgent<MtbXcSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_MTB_XC',
    sportNameId: 'Sepeda Gunung Cross-Country (MTB XC)',
    sportNameEn: 'Mountain Bike Cross-Country (MTB XC)',
    cluster: 'CYCLIC_ENDURANCE',
    primaryEnergySystem: 'OXIDATIVE',
    governingStandard: 'UCI Mountain Bike / PMBIA Technical Off-Road Guidelines',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_MTB_XC' ||
      code === 'MOUNTAINBIKERIDE' ||
      code === 'MTB' ||
      code === 'GRAVELRIDE' ||
      code === 'OFFROAD'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<MtbXcSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<MtbXcSpecificMetrics>): {
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

  public evaluateSafety(payload: SportTelemetryPayload<MtbXcSpecificMetrics>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  } {
    const symptoms = payload.subjectiveSymptoms;
    const haltDirectives: string[] = [];
    const contraindicatedMovements: string[] = [];

    const hasKneePain = Boolean(
      symptoms?.painLocations?.some((loc) => loc.toLowerCase().includes('knee')) ||
      (symptoms?.painScoreScale10 || 0) >= 4
    );
    const hasFallTrauma = Boolean(
      symptoms?.notes?.toLowerCase().includes('crash') ||
      symptoms?.notes?.toLowerCase().includes('jatuh') ||
      symptoms?.notes?.toLowerCase().includes('collarbone') ||
      symptoms?.notes?.toLowerCase().includes('klavikula')
    );

    if (hasFallTrauma) {
      haltDirectives.push(
        'Trauma benturan jatuh MTB terdeteksi. Kunci seluruh aktivitas bersepeda dan lakukan evaluasi medis darurat (fraktur klavikula/sendi bahu/gegar otak).'
      );
      contraindicatedMovements.push('All off-road cycling', 'Upper-body weight bearing');
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative: 'Konsultasi ortopedi / medis klinis segera.',
      };
    }

    // High torque steep climbing knee check
    const cadence = Number(payload.sportSpecificMetrics?.averageCadenceRpm || 0);
    const elevation = Number(payload.sportSpecificMetrics?.elevationGainMeters || 0);

    if (hasKneePain && (cadence < 70 || elevation > 250)) {
      haltDirectives.push(
        'Gejala nyeri patela lutut aktif terdeteksi saat tanjakan MTB. Tanjakan terjal dengan kadens lambat (<70 RPM) melipatgandakan gaya tekan patelofemoral. Hindari rute tanjakan ekstrem (mashing uphill).'
      );
      contraindicatedMovements.push(
        'Steep gradient technical climbs (>8%)',
        'Out-of-saddle torque mashing',
        'High-impact downhill drop landings'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Alihkan rute ke jalan aspal/gravel datar dengan rasio gear ringan untuk menjaga putaran pedal >80 RPM bebas nyeri.',
      };
    }

    if (cadence > 0 && cadence < 65) {
      haltDirectives.push(
        `Rata-rata kadens tanjakan sangat rendah (${cadence} RPM). Gunakan gear sprocket terbesar di tanjakan untuk melindungi tendon patela.`
      );
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<MtbXcSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const duration = payload.durationMinutes;

    // Calculate Vertical Ascent Rate (VAM - Vertical Ascent in Meters per Hour)
    const elevation = Number(metrics.elevationGainMeters || 0);
    const ascentMins = Number(metrics.ascentTimeMinutes || duration);
    let vamText = '';
    if (elevation > 0 && ascentMins > 0) {
      const vam = Math.round((elevation * 60) / ascentMins);
      vamText = ` Laju elevasi pendakian (VAM): ~${vam} VAM (m/jam).`;
    }

    // Vibration & technical handling fatigue
    const vibrationRpe = Number(metrics.trailVibrationRpe || 0);
    let technicalNote = 'Kontrol sepeda stabil pada medan off-road.';
    if (vibrationRpe >= 7) {
      technicalNote = 'Kelelahan neuromuskular lengan bawah/bahu akibat vibrasi trail tinggi. Lakukan latihan relaksasi genggaman kokpit dan periksa tekanan ban.';
    }

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Mountain Bike XC AI Coach',
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
        target_intensity_zone: 'Zone 2-3 Mixed Surge Aerobic',
        recommended_rest_hours: elevation > 400 || duration > 90 ? 48 : 24,
        next_session_prescription: safety.isSafe
          ? `Pertahankan efisiensi pedal di tanjakan.${vamText} ${technicalNote}`
          : 'Tunda jalur trail berakar/berbatu; pulihkan sendi lutut dan otot stabilitas postural.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: duration > 90 ? 6.5 : 4.5,
        protein_target_g_kg: 1.6,
        hydration_electrolyte_protocol:
          'Kebutuhan hidrasi off-road tinggi: 600-800 ml air elektrolit per jam dengan tablet garam untuk mencegah kram otot adduktor saat tanjakan teknis.',
        supplementation_evidence_tier_a: ['Cairan Isotonik / Gula Kompleks', 'Garam Elektrolit Natrium'],
      },
    };
  }
}
