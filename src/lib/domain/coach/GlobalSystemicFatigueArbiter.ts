// Global Systemic Fatigue Arbiter & Hybrid Multi-Sport Athlete Integration Engine
// Grounded in Hickson (1980) Concurrent Training Interference, Foster (1998) Session-RPE Normalization,
// and ACSM/ECSS Consensus on Overtraining Syndrome (Meeusen et al., 2013).

import { SportCluster } from '@/types/sportTelemetry';
import {
  calculateSessionRpeLoad,
  computeWeeklyRpeAnalytics,
  DailySessionRpeInput,
} from './kernels/fosterSessionRpeKernel';
import {
  evaluateAmpkMtorInterference,
  evaluateCentralNervousSystemFatigue,
  evaluateAnatomicalOverlapStrain,
  InterferenceDiagnosticResult,
  CnsFatigueResult,
  AnatomicalOverlapResult,
} from './kernels/concurrentTrainingInterferenceKernel';

export interface HybridSessionInput {
  sessionId: string;
  sportCode: string;
  cluster: SportCluster;
  durationMinutes: number;
  sessionRpe: number;
  timestamp: string; // ISO date
}

export interface AthleteHealthContext {
  restingHeartRateBaselineBpm?: number;
  currentRestingHeartRateBpm?: number;
  activeInjuryLocations?: string[];
  isMedicalClearanceGranted?: boolean;
}

export type OvertrainingRiskTier =
  | 'OPTIMAL'
  | 'FUNCTIONAL_OVERREACHING'
  | 'NON_FUNCTIONAL_OVERREACHING'
  | 'MALADAPTIVE_OVERTRAINING_BURNOUT';

export interface ArbitrationResult {
  isApproved: boolean;
  otsRiskTier: OvertrainingRiskTier;
  weeklyAnalytics: {
    totalWeeklyLoadAU: number;
    dailyMeanLoadAU: number;
    monotony: number;
    strain: number;
  };
  rhrElevationBpm?: number;
  interferenceDiagnostics: InterferenceDiagnosticResult;
  cnsFatigueStatus: CnsFatigueResult;
  anatomicalOverlapStatus: AnatomicalOverlapResult;
  scheduleModifications: string[];
  crossSportDirectives: string[];
  nutritionalPrescription: {
    proteinTargetGKg: number;
    carbohydrateTargetGKg: number;
    hydrationGuideline: string;
    recoverySupplementsTierA: string[];
  };
}

export class GlobalSystemicFatigueArbiter {
  private static instance: GlobalSystemicFatigueArbiter;

  private constructor() {}

  public static getInstance(): GlobalSystemicFatigueArbiter {
    if (!GlobalSystemicFatigueArbiter.instance) {
      GlobalSystemicFatigueArbiter.instance = new GlobalSystemicFatigueArbiter();
    }
    return GlobalSystemicFatigueArbiter.instance;
  }

  /**
   * Harmonizes multi-sport schedules, audits molecular interference, and prevents cross-sport overtraining.
   */
  public arbitrateHybridSchedule(
    recentSessions: HybridSessionInput[],
    proposedSession?: HybridSessionInput,
    healthContext?: AthleteHealthContext
  ): ArbitrationResult {
    // 1. Normalized Foster Session-RPE Global Load & Strain
    const dailyInputs: DailySessionRpeInput[] = recentSessions.map((s) => ({
      date: s.timestamp ? s.timestamp.substring(0, 10) : new Date().toISOString().substring(0, 10),
      durationMinutes: s.durationMinutes,
      rpeScale10: s.sessionRpe,
    }));

    if (proposedSession) {
      dailyInputs.push({
        date: proposedSession.timestamp ? proposedSession.timestamp.substring(0, 10) : new Date().toISOString().substring(0, 10),
        durationMinutes: proposedSession.durationMinutes,
        rpeScale10: proposedSession.sessionRpe,
      });
    }

    const weekly = computeWeeklyRpeAnalytics(dailyInputs);

    // 2. Resting Heart Rate Autonomic Deviation
    let rhrElevation = 0;
    if (healthContext?.restingHeartRateBaselineBpm && healthContext?.currentRestingHeartRateBpm) {
      rhrElevation = healthContext.currentRestingHeartRateBpm - healthContext.restingHeartRateBaselineBpm;
    }

    // 3. Overtraining Syndrome (OTS) Risk Tiering (Meeusen et al., 2013)
    let otsRiskTier: OvertrainingRiskTier = 'OPTIMAL';
    if (weekly.strain >= 5000 || rhrElevation >= 8) {
      otsRiskTier = 'MALADAPTIVE_OVERTRAINING_BURNOUT';
    } else if (weekly.strain >= 3800 || weekly.monotony >= 2.0 || rhrElevation >= 5) {
      otsRiskTier = 'NON_FUNCTIONAL_OVERREACHING';
    } else if (weekly.strain >= 2500 || weekly.monotony >= 1.5) {
      otsRiskTier = 'FUNCTIONAL_OVERREACHING';
    }

    // 4. Molecular Interference Evaluation (Hickson 1980 / Baar 2014)
    const priorSession = recentSessions.length > 0 ? recentSessions[recentSessions.length - 1] : undefined;
    let hoursApart = 12;
    if (priorSession?.timestamp && proposedSession?.timestamp) {
      const t1 = new Date(priorSession.timestamp).getTime();
      const t2 = new Date(proposedSession.timestamp).getTime();
      if (!isNaN(t1) && !isNaN(t2)) {
        hoursApart = Math.max(0, Math.round(Math.abs(t2 - t1) / (1000 * 60 * 60)));
      }
    }

    const interferenceDiagnostics = (priorSession && proposedSession)
      ? evaluateAmpkMtorInterference(priorSession.cluster, priorSession.sessionRpe, proposedSession.cluster, hoursApart)
      : {
          hasMolecularInterference: false,
          severity: 'NONE' as const,
          pathwayConflict: 'NONE',
          recommendedSpacingHours: 0,
          directive: 'Tidak ada konflik molekuler.',
        };

    // 5. Central Nervous System (CNS) Neuromuscular Depletion
    const recentCodes = recentSessions.map((s) => s.sportCode);
    const recentRpes = recentSessions.map((s) => s.sessionRpe);
    if (proposedSession) {
      recentCodes.push(proposedSession.sportCode);
      recentRpes.push(proposedSession.sessionRpe);
    }
    const cnsFatigueStatus = evaluateCentralNervousSystemFatigue(recentCodes, recentRpes);

    // 6. Anatomical Overlap Joint Collisions
    const activeInjuries = healthContext?.activeInjuryLocations || [];
    const anatomicalOverlapStatus = evaluateAnatomicalOverlapStrain(recentCodes, activeInjuries);

    // 7. Schedule Harmonization & Modification Directives
    const scheduleModifications: string[] = [];
    const crossSportDirectives: string[] = [];

    let isApproved = true;

    if (otsRiskTier === 'MALADAPTIVE_OVERTRAINING_BURNOUT') {
      isApproved = false;
      scheduleModifications.push(
        'KUNCI TOTAL JADWAL: Terdeteksi ancaman Over-Training Syndrome (OTS). Mandatori istirahat total 48-72 jam.'
      );
    } else if (otsRiskTier === 'NON_FUNCTIONAL_OVERREACHING') {
      isApproved = false;
      scheduleModifications.push(
        'DELOAD SISTEMIK: Kurangi volume sesi usulan sebesar 50% dan batasi RPE maksimal di angka 5 (Zone 2 aktif).'
      );
    }

    if (interferenceDiagnostics.severity === 'CRITICAL') {
      isApproved = false;
      scheduleModifications.push(
        `RESOLUSI INTERFERENSI: Pisahkan sesi ${proposedSession?.sportCode} minimal ${interferenceDiagnostics.recommendedSpacingHours} jam dari sesi beban sebelumnya agar adaptasi hipertrofi/mTOR tidak teredam AMPK.`
      );
      crossSportDirectives.push(interferenceDiagnostics.directive);
    }

    if (cnsFatigueStatus.isCnsDepleted && proposedSession && cnsFatigueStatus.severity === 'CRITICAL_EXHAUSTION') {
      isApproved = false;
      scheduleModifications.push(
        'BATASI ANGKATAN AKSIS / BENTURAN: Sistem saraf pusat mengalami deplesi motorik. Ganti sesi eksplosif dengan mobilitas sendi.'
      );
      crossSportDirectives.push(cnsFatigueStatus.directive);
    }

    if (anatomicalOverlapStatus.hasHighOverlapRisk) {
      isApproved = false;
      scheduleModifications.push(
        `OFFLOADING ANATOMIS: Bebaskan stres berlebih pada regio sendi [${anatomicalOverlapStatus.criticalRegions.join(
          ', '
        )}].`
      );
      crossSportDirectives.push(anatomicalOverlapStatus.directive);
    }

    // 8. Nutritional Prescription for Hybrid Athletes (ISSN Guidelines)
    const isHighStrain = otsRiskTier !== 'OPTIMAL' || weekly.totalWeeklyLoadAU > 2500;
    const proteinTarget = isHighStrain ? 2.2 : 1.8;
    const carbTarget = isHighStrain ? 7.0 : 5.0;

    return {
      isApproved,
      otsRiskTier,
      weeklyAnalytics: {
        totalWeeklyLoadAU: weekly.totalWeeklyLoadAU,
        dailyMeanLoadAU: weekly.dailyMeanLoadAU,
        monotony: weekly.monotony,
        strain: weekly.strain,
      },
      rhrElevationBpm: rhrElevation > 0 ? rhrElevation : undefined,
      interferenceDiagnostics,
      cnsFatigueStatus,
      anatomicalOverlapStatus,
      scheduleModifications,
      crossSportDirectives,
      nutritionalPrescription: {
        proteinTargetGKg: proteinTarget,
        carbohydrateTargetGKg: carbTarget,
        hydrationGuideline:
          'Konsumsi 500-750 mL air per 60 menit sesi multi-sport dengan 500 mg natrium untuk mencegah deplesi plasma darah.',
        recoverySupplementsTierA: [
          'Whey Protein Isolate + Leusin 3g (pemulihan jalur mTORC1 pasca-interferensi)',
          'Kreatin Monohidrat 5g (resintesis ATP neuromuskular)',
          'Tart Cherry Juice konsentrat (meredakan inflamasi sistemik & nyeri otot DOMS)',
          'Magnesium Bisglisinat 400mg (pemulihan parasimpatis & kualitas tidur)',
        ],
      },
    };
  }
}

export const globalSystemicFatigueArbiter = GlobalSystemicFatigueArbiter.getInstance();
