// Decoupled Flagship Team Sport Coach: Rugby Union / Sevens Agent
import {
  ISportCoachAgent,
  SportCoachMetadata,
  SportTelemetryPayload,
  SportPrescriptionOutput,
} from './contracts';
import {
  calculatePlayerLoadAu,
  getTeamSportRecoveryTimeline,
} from '../kernels/intermittentSportsKernel';

export interface RugbySpecificMetrics {
  collisionCount?: number;
  tackleCount?: number;
  scrumCount?: number;
  highSpeedRunningMeters?: number;
  neckFatigueScore10?: number; // 0-10
  headImpactReported?: boolean;
}

export class RugbyCoachAgent implements ISportCoachAgent<RugbySpecificMetrics> {
  public readonly metadata: SportCoachMetadata = {
    sportCode: 'SPORT_RUGBY',
    sportNameId: 'Rugbi (Rugby Union / Sevens)',
    sportNameEn: 'Rugby Union / Sevens',
    cluster: 'TEAM_FIELD_COURT',
    primaryEnergySystem: 'MIXED_INTERMITTENT',
    governingStandard: 'World Rugby Player Welfare & Head Injury Assessment (HIA / SCAT6) Guidelines',
    version: '1.0.0',
  };

  public canHandle(sportCode: string): boolean {
    const code = (sportCode || '').toUpperCase();
    return (
      code === 'SPORT_RUGBY' ||
      code === 'RUGBY' ||
      code === 'RUGBY_UNION' ||
      code === 'RUGBY_SEVENS'
    );
  }

  public validateTelemetry(payload: SportTelemetryPayload<RugbySpecificMetrics>): {
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

  public computeWorkload(payload: SportTelemetryPayload<RugbySpecificMetrics>): {
    externalLoad: number;
    externalUnit: string;
    internalStrain: number;
    internalMethod: 'PLAYER_LOAD_AU';
  } {
    const metrics = payload.sportSpecificMetrics || {};
    const collisions = Number(metrics.collisionCount || 0);
    const tackles = Number(metrics.tackleCount || 0);
    const scrums = Number(metrics.scrumCount || 0);

    const playerLoad = calculatePlayerLoadAu(
      payload.durationMinutes,
      payload.sessionRpe,
      collisions + tackles,
      scrums
    );

    const totalContacts = collisions + tackles + scrums;
    const externalLoad = totalContacts > 0 ? totalContacts : payload.durationMinutes;
    const externalUnit = totalContacts > 0 ? 'Total Collisions/Contacts' : 'Minutes';

    return {
      externalLoad,
      externalUnit,
      internalStrain: playerLoad.playerLoadAu,
      internalMethod: 'PLAYER_LOAD_AU',
    };
  }

  public evaluateSafety(payload: SportTelemetryPayload<RugbySpecificMetrics>): {
    isSafe: boolean;
    haltDirectives: string[];
    contraindicatedMovements: string[];
    rehabilitationAlternative?: string;
  } {
    const symptoms = payload.subjectiveSymptoms;
    const haltDirectives: string[] = [];
    const contraindicatedMovements: string[] = [];

    const notes = (symptoms?.notes || '').toLowerCase();
    const locations = (symptoms?.painLocations || []).map((l) => l.toLowerCase());

    const hasHeadImpact = Boolean(
      payload.sportSpecificMetrics?.headImpactReported ||
      locations.some((l) => l.includes('head') || l.includes('kepala') || l.includes('concussion') || l.includes('brain')) ||
      notes.includes('pusing') ||
      notes.includes('concussion') ||
      notes.includes('benturan kepala')
    );

    const hasNeckOrShoulderPain = Boolean(
      locations.some((l) => l.includes('neck') || l.includes('leher') || l.includes('cervical') || l.includes('clavicle') || l.includes('bahu')) ||
      (payload.sportSpecificMetrics?.neckFatigueScore10 || 0) >= 5
    );

    // NON-NEGOTIABLE HEAD INJURY CONCUSSION GATE (SCAT6 Protocol)
    if (hasHeadImpact) {
      haltDirectives.push(
        'Benturan kepala / indikasi gegar otak (Concussion / SCAT6) terdeteksi. Kunci seluruh aktivitas kontak dan latihan fisik intensitas tinggi selama minimal 14 hari melalui protokol Graduated Return-to-Play.'
      );
      contraindicatedMovements.push(
        'All physical contact / tackling',
        'Scrum engagement',
        'High-velocity running with abrupt head motion',
        'Heavy resistance training'
      );
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative:
          'Evaluasi medis dokter spesialis saraf/kedokteran olahraga segera. Istirahat fisik dan kognitif total 48 jam pertama.',
      };
    }

    if (hasNeckOrShoulderPain) {
      haltDirectives.push(
        'Nyeri servikal leher atau sendi akromioklavikular bahu (stinger / burner) terdeteksi. Risiko kompresi pleksus brakialis. Hentikan kontak scrum dan tackle.'
      );
      contraindicatedMovements.push('Live scrummaging', 'Tackle drills', 'Overhead pressing');
      return {
        isSafe: false,
        haltDirectives,
        contraindicatedMovements,
        rehabilitationAlternative: 'Latihan penguatan isometrik leher (isometric neck flexion/extension) dan dekompresi bahu.',
      };
    }

    return {
      isSafe: true,
      haltDirectives,
      contraindicatedMovements: [],
    };
  }

  public async generatePrescription(
    payload: SportTelemetryPayload<RugbySpecificMetrics>
  ): Promise<SportPrescriptionOutput> {
    const workload = this.computeWorkload(payload);
    const safety = this.evaluateSafety(payload);
    const metrics = payload.sportSpecificMetrics || {};
    const collisions = Number(metrics.collisionCount || 0);

    const recovery = getTeamSportRecoveryTimeline(payload.durationMinutes, payload.sessionRpe, collisions);

    return {
      sessionId: payload.sessionId,
      generatedAt: new Date().toISOString(),
      coach_identity: 'Decoupled Rugby Union / Sevens AI Coach',
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
        target_intensity_zone: safety.isSafe ? 'High-Impact Collision & Repeated Sprint Ability' : 'Tissue Flush & Concussion Rest',
        recommended_rest_hours: recovery.recommendedRestHours,
        next_session_prescription: safety.isSafe
          ? `${workload.externalLoad} total benturan/kontak tercatat. Berikan waktu istirahat minimal ${recovery.recommendedRestHours} jam untuk perbaikan serat otot dan pemulihan hematoma mikroskopis.`
          : 'Hentikan seluruh sesi kontak. Utamakan evaluasi medis dan pemulihan sistem saraf/tulang leher.',
      },
      nutritional_prescription: {
        carbohydrate_target_g_kg: recovery.glycogenRestorationGramsPerKg,
        protein_target_g_kg: 2.0, // High collision damage requires elevated protein for myofibrillar repair
        hydration_electrolyte_protocol:
          'Minum 3.5 - 4 liter air dengan larutan elektrolit hipertonik/isotonik pasca laga untuk mengatasi degradasi jaringan lunak.',
        supplementation_evidence_tier_a: [
          'Kreatin Monohidrat (5g/hari - neuroproteksi pasca benturan)',
          'Asam Lemak Omega-3 (EPA/DHA 2-3g/hari untuk modulasi inflamasi jaringan saraf)',
          'Whey Protein Isolate (35-40g)',
        ],
      },
    };
  }
}
