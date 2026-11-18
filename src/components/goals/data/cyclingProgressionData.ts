export interface ProgressionTemplate {
  id: string;
  title: string;
  sport: "Ride" | "Run" | "All";
  tier: number;
  targetValue: number;
  unit: string;
  durationWeeks: number;
  description: string;
  safetyProtocol: string;
  focusArea: string;
  tag: string;
}

// Sport-science progressive unlocks when primary milestones are reached
export const CYCLING_PROGRESSION_TEMPLATES: ProgressionTemplate[] = [
  {
    id: "prog-cycling-next-100",
    title: "Siklus Kedua: Akumulasi Tambahan +100 km (Total 200 km)",
    sport: "Ride",
    tier: 2,
    targetValue: 200,
    unit: "km",
    durationWeeks: 4,
    description: "Mempertebal adaptasi kapiler aerobik dan efisiensi metabolik lipid dengan menambah blok 100 km kedua.",
    safetyProtocol: "Batas sesi ≤ 30-35 km, rute datar, kadens konstan 85-95 RPM.",
    focusArea: "Kapasitas Aerobik Jangka Menengah",
    tag: "VOLUME EXTENSION",
  },
  {
    id: "prog-cycling-gran-fondo",
    title: "Century Ride Lanjutan: Gran Fondo Metric 150 km",
    sport: "Ride",
    tier: 2,
    targetValue: 150,
    unit: "km",
    durationWeeks: 6,
    description: "Tonggak ketahanan jarak menengah terstruktur dengan pacing terkalibrasi di Zona 2 murni.",
    safetyProtocol: "Hidrasi berkala tiap 20 menit, posisi sadel ergonomis untuk lindungi tempurung lutut.",
    focusArea: "Gran Fondo Endurance",
    tag: "INTERMEDIATE MILESTONE",
  },
  {
    id: "prog-cycling-elevation",
    title: "Target Elevasi: Akumulasi Tanjakan 1.000m D+ (Climbing Base)",
    sport: "Ride",
    tier: 2,
    targetValue: 1000,
    unit: "m D+",
    durationWeeks: 6,
    description: "Meningkatkan daya tahan ambang otot tungkai melalui tanjakan landai terkontrol tanpa hentakan.",
    safetyProtocol: "Gunakan rasio gear ringan, kayuhan duduk (seated), dilarang sprint berdiri agresif.",
    focusArea: "Ambang Laktat & Muscular Endurance",
    tag: "CLIMBING MILESTONE",
  },
  {
    id: "prog-cycling-double-century",
    title: "Double Century Brevet: 200 km Endurance Block",
    sport: "Ride",
    tier: 3,
    targetValue: 200,
    unit: "km",
    durationWeeks: 8,
    description: "Tingkat ketahanan ultra-endurance lanjutan setelah fondasi 100 km pertama terbukti kokoh bebas cedera.",
    safetyProtocol: "Protokol pemulihan 48 jam pasca sesi panjang, kompres dingin jika timbul pegal sendi.",
    focusArea: "Ultra-Endurance Transition",
    tag: "ADVANCED BREVET",
  },
];

