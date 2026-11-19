// Decoupled Flagship Endurance Coach: Road Cycling Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';
import { calculateSessionRpeLoad } from '../kernels/fosterSessionRpeKernel';

export interface RoadCyclingSpecificMetrics {
  distanceMeters?: number;
  averageSpeedMps?: number;
  averageWatts?: number;
  normalizedPowerWatts?: number;
  ftpWatts?: number;
  athleteWeightKg?: number;
  cadenceRpm?: number;
  elevationGainMeters?: number;
  workKj?: number;
}

export class RoadCyclingCoachAgent implements ISportCoachAgent<RoadCyclingSpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_ROAD_CYCLING',
    sportNameId: 'Balap Sepeda Jalan Raya',
    sportNameEn: 'Road Cycling',
    cluster: 'CYCLIC_ENDURANCE',
    primaryEnergySystem: 'OXIDATIVE',
    governingStandard: 'UCI / Andy Coggan Power-Based Training / ACSM',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_ROAD_CYCLING' ||
      code === 'RIDE' ||
      code === 'CYCLING' ||
      code === 'VIRTUALRIDE'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<RoadCyclingSpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<RoadCyclingSpecificMetrics>): {
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

  public evaluateSafety(payload: SportTelemetryPayload<RoadCyclingSpecificMetrics>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  } {
    const symptoms = payload.subjectiveSymptoms;
    const haltDirectives: string[] = [];
    const contraindicatedMovements: string[] = [];

    const hasSeverePain = Boolean(symptoms && symptoms.painScoreScale10 >= 5);
    const hasNumbness = Boolean(
      symptoms?.notes?.toLowerCase().includes('numb') ||
      symptoms?.notes?.toLowerCase().includes('kebas') ||
      symptoms?.notes?.toLowerCase().includes('kesemutan')
    );

    if (hasSeverePain) {
      haltDirectives.push('Nyeri akut terdeteksi selama atau pasca bersepeda. Hentikan beban progresif.');
      contraindicatedMovements.push('High-torque out-of-saddle sprint climbing', 'Prolonged aerodynamic tuck');
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative: 'Lakukan evaluasi bike-fit (tinggi sadel, jangkauan kokpit) dan mobilitas peregangan fleksor panggul.',
      };
    }

    if (hasNumbness) {
      haltDirectives.push('Gejala kompresi saraf pudendal atau kesemutan tangan terdeteksi. Wajib periksa penyesuaian sadel dan posisi handlebar.');
    }

    // Pedaling cadence efficiency evaluation
    const cadence = Number(payload.sportSpecificMetrics?.cadenceRpm || 0);
    if (cadence > 0 && cadence < 75) {
      haltDirectives.push(
        `Rata-rata kadens rendah (${cadence} RPM) terdeteksi. 'Grinding' pada gigi berat meningkatkan gaya tekan patelofemoral lutut. Gunakan rasio gigi lebih ringan dan targetkan kadens 85-95 RPM.`
      );
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<RoadCyclingSpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const duration = payload.durationMinutes;

    // Coggan Power & W/kg calculation
    const watts = Number(metrics.normalizedPowerWatts || metrics.averageWatts || 0);
    const weight = Number(metrics.athleteWeightKg || 0);
    const ftp = Number(metrics.ftpWatts || 0);

    let powerZoneSummary = 'Preskripsi denyut jantung & RPE Zone 2 Aerobic Base.';
    if (watts > 0 && weight > 0) {
      const wKg = (watts / weight).toFixed(2);
      powerZoneSummary = `Daya rata-rata ${watts}W (${wKg} W/kg).`;
      if (ftp > 0) {
        const pctFtp = Math.round((watts / ftp) * 100);
        powerZoneSummary += ` Intensitas ~${pctFtp}% dari FTP.`;
      }
    }

    // Glycogen Fueling recommendation (Jeukendrup, 2014)
    let carbHourlyGrams = 30;
    if (duration > 150) {
      carbHourlyGrams = 75; // Long endurance (>2.5h)
    } else if (duration > 90) {
      carbHourlyGrams = 60; // Standard aerobic ride (1.5 - 2.5h)
    }

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Road Cycling AI Coach',
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
        target_intensity_zone: 'Zone 2 Endurance (Closed-Chain Non-Impact)',
        recommended_rest_hours: duration > 120 ? 48 : 24,
        next_session_prescription: `${powerZoneSummary} Pertahankan kadens efisien 85-95 RPM. Sangat efektif menjaga kebugaran mitokondria tanpa impak sendi.`,
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: duration > 120 ? 7.0 : 5.0,
        protein_target_g_kg: 1.6,
        hydration_electrolyte_protocol: `Asupan karbohidrat selama sesi: target ~${carbHourlyGrams}g karbohidrat per jam. Hidrasi 500-750 ml cairan elektrolit per 60 menit berkendara.`,
        supplementation_evidence_tier_a: ['Cairan Isotonik / Maltodekstrin', 'Kafein', 'Beta-Alanine'],
      },
    };
  }
}
