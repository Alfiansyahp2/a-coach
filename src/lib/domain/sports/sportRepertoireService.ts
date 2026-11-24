import { Activity } from "@/types";
import {
  SYSTEM_SPORTS,
  SystemSportItem,
  findSystemSport,
} from "./systemSportsRegistry";
import { SportCluster } from "@/types/sportTelemetry";

export interface ActiveSportSummary {
  code: string;
  name: string;
  shortLabel: string;
  cluster: SportCluster;
  count: number;
  isCustom?: boolean;
}

export interface SportFormulaMetadata {
  code: string;
  keyFormulas: string[];
  metricsSummary: string;
  safetyAlerts?: string[];
}

export const SPORT_FORMULA_REGISTRY: Record<string, SportFormulaMetadata> = {
  SPORT_DISTANCE_RUNNING: {
    code: "SPORT_DISTANCE_RUNNING",
    keyFormulas: ["Graded Adjusted Pace (GAP)", "TRIMP Edwards", "Decoupling Aerobik"],
    metricsSummary: "Pace aktual vs elevasi, denyut jantung, dan ritme pemulihan sendi.",
    safetyAlerts: ["ACWR Spikes", "Overstriding knee impact"],
  },
  SPORT_ROAD_CYCLING: {
    code: "SPORT_ROAD_CYCLING",
    keyFormulas: ["Coggan Normalized Power (NP)", "Intensity Factor (IF)", "TSS"],
    metricsSummary: "Daya mekanis (Watts), efisiensi metabolik, dan kurva daya kritis.",
    safetyAlerts: ["Knee shear strain pada cadence rendah"],
  },
  SPORT_MTB_XC: {
    code: "SPORT_MTB_XC",
    keyFormulas: ["Technical VAM", "Normalized Power", "Terrain Fatigue Load"],
    metricsSummary: "Elevasi medan berbatu, deselerasi tiba-tiba, dan kelelahan lengan.",
  },
  SPORT_SWIMMING: {
    code: "SPORT_SWIMMING",
    keyFormulas: ["Skor SWOLF", "Stroke Rate (SPM)", "Critical Swim Speed (CSS)"],
    metricsSummary: "Efisiensi hidrodinamika kayuhan dan kecepatan ambang laktat.",
  },
  SPORT_ROWING: {
    code: "SPORT_ROWING",
    keyFormulas: ["Split 500m Pace", "Stroke Watts", "Drag Impuls"],
    metricsSummary: "Tenaga dorongan tungkai dan ritme kayuhan per 500 meter.",
  },
  SPORT_TRIATHLON: {
    code: "SPORT_TRIATHLON",
    keyFormulas: ["Multidiscipline Strain", "Brick Run Decoupling", "Energy Partitioning"],
    metricsSummary: "Transisi antar-disiplin dan deplesi glikogen multisport.",
  },
  SPORT_POWERLIFTING: {
    code: "SPORT_POWERLIFTING",
    keyFormulas: ["Total Tonase (kg)", "Prediksi 1RM Brzycki", "Skor Sheiko INOL"],
    metricsSummary: "Beban volume mekanis, estimasi angkatan maksimal, dan kelelahan SSP.",
    safetyAlerts: ["Sheiko INOL > 2.0 (High Danger Zone)"],
  },
  SPORT_WEIGHTLIFTING: {
    code: "SPORT_WEIGHTLIFTING",
    keyFormulas: ["Peak Power Output (Watts)", "Bar Velocity Loss", "Snatch/C&J 1RM"],
    metricsSummary: "Daya ledak akselerasi barbel dan deselerasi tangkapan.",
  },
  SPORT_CALISTHENICS: {
    code: "SPORT_CALISTHENICS",
    keyFormulas: ["Relative Bodyweight Load", "Time Under Tension (TUT)", "Reps Density"],
    metricsSummary: "Beban persentase berat badan dan ketegangan isometrik tendon.",
  },
  SPORT_STRONGMAN: {
    code: "SPORT_STRONGMAN",
    keyFormulas: ["Heavy Carries Work (kJ)", "Grip Strain Index", "Distance Under Load"],
    metricsSummary: "Kerja mekanis angkut beban ekstrem dan kekuatan cengkeraman.",
  },
  SPORT_BODYBUILDING: {
    code: "SPORT_BODYBUILDING",
    keyFormulas: ["Volume Hipertrofi Otot", "TUT per Set", "Effective Reps"],
    metricsSummary: "Kepadatan stimulasi sarkoplasma dan pembagian kelompok otot.",
  },
  SPORT_BOXING: {
    code: "SPORT_BOXING",
    keyFormulas: ["Punch Density (pukulan/menit)", "Decoupling HR Ronde", "SCAT6 Guard"],
    metricsSummary: "Intensitas kardio per ronde dan monitoring keselamatan benturan kepala.",
    safetyAlerts: ["SCAT6 Concussion Alert"],
  },
  SPORT_MMA: {
    code: "SPORT_MMA",
    keyFormulas: ["Striking vs Grappling Decoupling", "Round Work-Rest Ratio", "SCAT6 Guard"],
    metricsSummary: "Kombinasi strain isometrik gulat dan akselerasi pukulan/tendangan.",
    safetyAlerts: ["SCAT6 Concussion Alert"],
  },
  SPORT_BJJ: {
    code: "SPORT_BJJ",
    keyFormulas: ["Grappling Strain", "Faktor Kelelahan Gi/No-Gi (1.25x)", "Isometric Grip"],
    metricsSummary: "Kelelahan neuromuskular kuncian dan cengkeraman pakaian.",
  },
  SPORT_PENCAK_SILAT: {
    code: "SPORT_PENCAK_SILAT",
    keyFormulas: ["Rasio Serang/Bela", "Explosive Kick Factor", "Decoupling Ronde"],
    metricsSummary: "Daya ledak tendangan sabit/depan dan koordinasi bantingan.",
  },
  SPORT_JUDO: {
    code: "SPORT_JUDO",
    keyFormulas: ["Work Bantingan W = m×g×h", "Kuzushi Grip Break", "Decoupling Randori"],
    metricsSummary: "Kerja mekanis bantingan lawan dan beban cengkeraman lengan.",
  },
  SPORT_MUAY_THAI: {
    code: "SPORT_MUAY_THAI",
    keyFormulas: ["Strike Impuls", "Clinch Knee Strain", "HR Decoupling Ronde"],
    metricsSummary: "Beban benturan tulang kering dan ketahanan isometrik leher/clinch.",
  },
  SPORT_FOOTBALL: {
    code: "SPORT_FOOTBALL",
    keyFormulas: ["Catapult PlayerLoad (AU)", "Bradley HSR Meters", "Hamstring Injury Risk"],
    metricsSummary: "Beban tri-aksial akselerasi, deselerasi, dan sprint berkecepatan tinggi.",
    safetyAlerts: ["Hamstring acute workload spike"],
  },
  SPORT_BASKETBALL: {
    code: "SPORT_BASKETBALL",
    keyFormulas: ["Jump Count & Jump Decay", "Accelerometry PlayerLoad", "Paint Agility"],
    metricsSummary: "Frekuensi loncatan, kelelahan mendarat, dan deselerasi lateral.",
    safetyAlerts: ["Patellar tendon jump load overload"],
  },
  SPORT_VOLLEYBALL: {
    code: "SPORT_VOLLEYBALL",
    keyFormulas: ["Jump Height Decay", "Attack Landing Shock", "Session TRIMP"],
    metricsSummary: "Penurunan tinggi loncatan smash dan benturan lutut saat mendarat.",
  },
  SPORT_FUTSAL: {
    code: "SPORT_FUTSAL",
    keyFormulas: ["High-Intensity Decoupling", "Hard Court Impact", "Sprint Frequency"],
    metricsSummary: "Pola lari interval intermiten pada lantai lapangan keras.",
  },
  SPORT_RUGBY: {
    code: "SPORT_RUGBY",
    keyFormulas: ["Collision Impact Load (G-Force)", "Scrum Tonnage", "Ruck Strain"],
    metricsSummary: "Benturan kontak fisik berat dan dorongan daya tahan beregu.",
    safetyAlerts: ["Head Injury Assessment (HIA) Flag"],
  },
  SPORT_FIELD_HOCKEY: {
    code: "SPORT_FIELD_HOCKEY",
    keyFormulas: ["Flexion Posture Strain", "HSR Running Meters", "Stick Accelerometry"],
    metricsSummary: "Beban otot punggung bawah saat membungkuk dan sprint cepat.",
  },
  SPORT_BADMINTON: {
    code: "SPORT_BADMINTON",
    keyFormulas: ["Smash Accelerometry", "Rotator Cuff Load", "Footwork Lunges"],
    metricsSummary: "Akselerasi ayunan raket, beban tendon bahu, dan lunge eksplosif.",
  },
  SPORT_TENNIS: {
    code: "SPORT_TENNIS",
    keyFormulas: ["Rally Length Strain", "Forehand/Backhand Balance", "Shoulder Impuls"],
    metricsSummary: "Beban rotasi tubuh per pukulan dan jarak tempuh baseline.",
  },
  SPORT_TABLE_TENNIS: {
    code: "SPORT_TABLE_TENNIS",
    keyFormulas: ["Reaction Time Index", "Fast Twitch Laktat", "Rally Density"],
    metricsSummary: "Kecepatan reaksi saraf dan pergerakan mikro kaki meja.",
  },
  SPORT_ARCHERY: {
    code: "SPORT_ARCHERY",
    keyFormulas: ["Total Draw Volume (kg)", "Tremor Index", "Heart Rate Nadir"],
    metricsSummary: "Tonase tarikan busur, stabilitas bidikan, dan ketenangan detak jantung.",
  },
  SPORT_SHOOTING: {
    code: "SPORT_SHOOTING",
    keyFormulas: ["Stability Tremor Index", "Breath Hold Cardiac Window", "Trigger Impuls"],
    metricsSummary: "Ketenangan kardiovaskular dan stabilitas postur tembak.",
  },
  SPORT_FUNCTIONAL_FITNESS: {
    code: "SPORT_FUNCTIONAL_FITNESS",
    keyFormulas: ["Metcon Work-Rest Density", "Combined Engine Strain", "Rep Pacing"],
    metricsSummary: "Kepadatan intensitas sirkuit gabungan kardio dan beban.",
  },
  SPORT_CLIMBING: {
    code: "SPORT_CLIMBING",
    keyFormulas: ["Finger Pulley Tension (A2/A4)", "Drop Shock GRF", "Metcon Density"],
    metricsSummary: "Tegangan ligamen katrol jari dan gaya benturan saat jatuh.",
    safetyAlerts: ["A2/A4 finger pulley rupture threshold warning"],
  },
  SPORT_GYMNASTICS: {
    code: "SPORT_GYMNASTICS",
    keyFormulas: ["Landing Shock G-Force", "Apparatus TUT", "Upper Body Joint Strain"],
    metricsSummary: "Gaya benturan pendaratan matras dan ketegangan sendi bahu.",
  },
  SPORT_SURFING: {
    code: "SPORT_SURFING",
    keyFormulas: ["Paddle Work Capacity", "Wave Ride Time", "Marine Thermal Load"],
    metricsSummary: "Kapasitas mendayung gelombang dan stabilitas papan ombak.",
  },
  SPORT_SKATEBOARDING: {
    code: "SPORT_SKATEBOARDING",
    keyFormulas: ["Impact Landing Shock GRF", "Pop Knee Strain", "Session Density"],
    metricsSummary: "Gaya impak pendaratan trik dan beban lutut/pergelangan kaki.",
  },
};

/**
 * Extracts distinct active sports from user activities, keeping track of counts.
 * Ensures the athlete's primary sports (Run & Ride) are cleanly identified.
 */
export function extractActiveSports(activities: Activity[] = []): ActiveSportSummary[] {
  const sportCounts: Record<string, number> = {};

  activities.forEach((act) => {
    const rawType = act.sport_type || "Unknown";
    const matched = findSystemSport(rawType);
    const key = matched ? matched.code : rawType.toUpperCase();
    sportCounts[key] = (sportCounts[key] || 0) + 1;
  });

  const result: ActiveSportSummary[] = [];

  // Check matched system sports
  Object.entries(sportCounts).forEach(([code, count]) => {
    const sys = SYSTEM_SPORTS.find((s) => s.code === code);
    if (sys) {
      result.push({
        code: sys.code,
        name: sys.name,
        shortLabel: sys.shortLabel,
        cluster: sys.cluster,
        count,
      });
    } else {
      // Custom sport outside system
      result.push({
        code,
        name: code,
        shortLabel: code,
        cluster: "CYCLIC_ENDURANCE",
        count,
        isCustom: true,
      });
    }
  });

  // Sort by activity count descending
  return result.sort((a, b) => b.count - a.count);
}

/**
 * Retrieves formula calculation metadata for a sport code.
 */
export function getSportFormulaMetadata(code: string): SportFormulaMetadata | undefined {
  return SPORT_FORMULA_REGISTRY[code];
}
