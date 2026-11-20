// Authoritative Registry of 33 World Sports Configured in the System
import { SportCluster } from "@/types/sportTelemetry";

export interface SystemSportItem {
  code: string;
  name: string;
  shortLabel: string;
  cluster: SportCluster;
  aliases: string[];
}

export interface SportClusterMeta {
  id: SportCluster | "ALL";
  label: string;
  shortLabel: string;
}

export const SYSTEM_SPORT_CLUSTERS: SportClusterMeta[] = [
  { id: "ALL", label: "Semua Cabor Sistem", shortLabel: "Semua (33)" },
  { id: "CYCLIC_ENDURANCE", label: "Daya Tahan Siklik", shortLabel: "Endurance (6)" },
  { id: "STRENGTH_POWER", label: "Kekuatan & Daya", shortLabel: "Strength (5)" },
  { id: "COMBAT_MARTIAL_ARTS", label: "Bela Diri & Kontak", shortLabel: "Combat (6)" },
  { id: "TEAM_FIELD_COURT", label: "Olahraga Beregu", shortLabel: "Team (6)" },
  { id: "RACQUET_PRECISION", label: "Raket & Presisi", shortLabel: "Racquet (5)" },
  { id: "FUNCTIONAL_EXTREME", label: "Fungsional & Ekstrem", shortLabel: "Extreme (5)" },
];

export const SYSTEM_SPORTS: SystemSportItem[] = [
  // 1. CYCLIC ENDURANCE (6)
  { code: "SPORT_DISTANCE_RUNNING", name: "Lari Jarak Jauh & Maraton", shortLabel: "Lari", cluster: "CYCLIC_ENDURANCE", aliases: ["run", "running", "jogging", "marathon"] },
  { code: "SPORT_ROAD_CYCLING", name: "Balap Sepeda Jalan Raya", shortLabel: "Sepeda", cluster: "CYCLIC_ENDURANCE", aliases: ["ride", "cycling", "road bike"] },
  { code: "SPORT_MTB_XC", name: "Sepeda Gunung Cross-Country", shortLabel: "MTB XC", cluster: "CYCLIC_ENDURANCE", aliases: ["mtb", "mountain bike", "cross country"] },
  { code: "SPORT_SWIMMING", name: "Renang (Aquatics)", shortLabel: "Renang", cluster: "CYCLIC_ENDURANCE", aliases: ["swim", "swimming", "akuatik"] },
  { code: "SPORT_ROWING", name: "Dayung & Ergometer", shortLabel: "Dayung", cluster: "CYCLIC_ENDURANCE", aliases: ["rowing", "ergometer", "kayak"] },
  { code: "SPORT_TRIATHLON", name: "Triathlon & Multi-Sport", shortLabel: "Triathlon", cluster: "CYCLIC_ENDURANCE", aliases: ["triathlon", "brick", "duathlon", "ironman"] },

  // 2. STRENGTH & POWER (5)
  { code: "SPORT_POWERLIFTING", name: "Powerlifting (Squat, Bench, Deadlift)", shortLabel: "Powerlifting", cluster: "STRENGTH_POWER", aliases: ["powerlifting", "sbd", "squat", "deadlift"] },
  { code: "SPORT_WEIGHTLIFTING", name: "Angkat Besi Olimpiade (Snatch, Clean & Jerk)", shortLabel: "Angkat Besi", cluster: "STRENGTH_POWER", aliases: ["weightlifting", "olympic weightlifting", "snatch", "clean and jerk"] },
  { code: "SPORT_CALISTHENICS", name: "Kalistenik & Street Workout", shortLabel: "Kalistenik", cluster: "STRENGTH_POWER", aliases: ["calisthenics", "street workout", "bodyweight"] },
  { code: "SPORT_STRONGMAN", name: "Strongman & Heavy Carries", shortLabel: "Strongman", cluster: "STRENGTH_POWER", aliases: ["strongman", "carries", "yoke", "farmers walk"] },
  { code: "SPORT_BODYBUILDING", name: "Binaraga & Rekayasa Hipertrofi", shortLabel: "Binaraga", cluster: "STRENGTH_POWER", aliases: ["bodybuilding", "hypertrophy", "gym", "weighttraining"] },

  // 3. COMBAT & MARTIAL ARTS (6)
  { code: "SPORT_BOXING", name: "Tinju (Boxing)", shortLabel: "Tinju", cluster: "COMBAT_MARTIAL_ARTS", aliases: ["boxing", "tinju"] },
  { code: "SPORT_MMA", name: "Seni Bela Diri Campuran (MMA)", shortLabel: "MMA", cluster: "COMBAT_MARTIAL_ARTS", aliases: ["mma", "mixed martial arts", "ufc"] },
  { code: "SPORT_BJJ", name: "Brazilian Jiu-Jitsu (BJJ)", shortLabel: "BJJ", cluster: "COMBAT_MARTIAL_ARTS", aliases: ["bjj", "jiu jitsu", "grappling"] },
  { code: "SPORT_PENCAK_SILAT", name: "Pencak Silat (Tanding & Seni)", shortLabel: "Pencak Silat", cluster: "COMBAT_MARTIAL_ARTS", aliases: ["silat", "pencak silat"] },
  { code: "SPORT_JUDO", name: "Judo & Sambo", shortLabel: "Judo", cluster: "COMBAT_MARTIAL_ARTS", aliases: ["judo", "sambo"] },
  { code: "SPORT_MUAY_THAI", name: "Muay Thai & Kickboxing", shortLabel: "Muay Thai", cluster: "COMBAT_MARTIAL_ARTS", aliases: ["muay thai", "kickboxing", "thai boxing"] },

  // 4. TEAM FIELD & COURT (6)
  { code: "SPORT_FOOTBALL", name: "Sepak Bola (Football / Soccer)", shortLabel: "Sepak Bola", cluster: "TEAM_FIELD_COURT", aliases: ["football", "soccer", "sepakbola"] },
  { code: "SPORT_BASKETBALL", name: "Bola Basket (Basketball)", shortLabel: "Bola Basket", cluster: "TEAM_FIELD_COURT", aliases: ["basketball", "basket", "hoops"] },
  { code: "SPORT_VOLLEYBALL", name: "Bola Voli (Indoor & Pasir)", shortLabel: "Bola Voli", cluster: "TEAM_FIELD_COURT", aliases: ["volleyball", "voli"] },
  { code: "SPORT_FUTSAL", name: "Futsal (Lapangan Keras)", shortLabel: "Futsal", cluster: "TEAM_FIELD_COURT", aliases: ["futsal"] },
  { code: "SPORT_RUGBY", name: "Rugbi (Rugby Union / Sevens)", shortLabel: "Rugbi", cluster: "TEAM_FIELD_COURT", aliases: ["rugby", "rugbi"] },
  { code: "SPORT_FIELD_HOCKEY", name: "Hoki Lapangan (Field Hockey)", shortLabel: "Hoki Lapangan", cluster: "TEAM_FIELD_COURT", aliases: ["hockey", "hoki", "field hockey"] },

  // 5. RACQUET & PRECISION (5)
  { code: "SPORT_BADMINTON", name: "Bulu Tangkis (Badminton)", shortLabel: "Bulu Tangkis", cluster: "RACQUET_PRECISION", aliases: ["badminton", "bulutangkis", "bultang"] },
  { code: "SPORT_TENNIS", name: "Tenis Lapangan (Tennis)", shortLabel: "Tenis", cluster: "RACQUET_PRECISION", aliases: ["tennis", "tenis"] },
  { code: "SPORT_TABLE_TENNIS", name: "Tenis Meja (Ping Pong)", shortLabel: "Tenis Meja", cluster: "RACQUET_PRECISION", aliases: ["table tennis", "ping pong", "tenis meja"] },
  { code: "SPORT_ARCHERY", name: "Panahan (Archery)", shortLabel: "Panahan", cluster: "RACQUET_PRECISION", aliases: ["archery", "panahan"] },
  { code: "SPORT_SHOOTING", name: "Menembak Presisi (Sport Shooting)", shortLabel: "Menembak", cluster: "RACQUET_PRECISION", aliases: ["shooting", "menembak"] },

  // 6. FUNCTIONAL & EXTREME (5)
  { code: "SPORT_FUNCTIONAL_FITNESS", name: "Kebugaran Fungsional (CrossFit/Hyrox)", shortLabel: "Fungsional", cluster: "FUNCTIONAL_EXTREME", aliases: ["crossfit", "hyrox", "functional fitness", "metcon"] },
  { code: "SPORT_CLIMBING", name: "Panjat Tebing (Sport Climbing & Bouldering)", shortLabel: "Panjat Tebing", cluster: "FUNCTIONAL_EXTREME", aliases: ["climbing", "rock climbing", "bouldering", "panjat tebing"] },
  { code: "SPORT_GYMNASTICS", name: "Senam Artistik (Gymnastics)", shortLabel: "Senam Artistik", cluster: "FUNCTIONAL_EXTREME", aliases: ["gymnastics", "senam", "artistic gymnastics"] },
  { code: "SPORT_SURFING", name: "Selancar Ombak (Surfing)", shortLabel: "Selancar", cluster: "FUNCTIONAL_EXTREME", aliases: ["surfing", "selancar", "surf"] },
  { code: "SPORT_SKATEBOARDING", name: "Skateboard (Street & Park)", shortLabel: "Skateboard", cluster: "FUNCTIONAL_EXTREME", aliases: ["skateboarding", "skateboard", "skate"] },
];

export function findSystemSport(query: string): SystemSportItem | undefined {
  const norm = (query || "").toLowerCase().trim();
  if (!norm) return undefined;
  return SYSTEM_SPORTS.find(
    (s) =>
      s.code.toLowerCase() === norm ||
      s.name.toLowerCase() === norm ||
      s.shortLabel.toLowerCase() === norm ||
      s.aliases.some((a) => a.toLowerCase() === norm)
  );
}
