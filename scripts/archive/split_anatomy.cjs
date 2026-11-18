const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');
const anatomyDir = path.join(rootDir, 'src', 'lib', 'anatomy');
const regionsDir = path.join(anatomyDir, 'regions');

// 1. Create directories
if (!fs.existsSync(anatomyDir)) fs.mkdirSync(anatomyDir, { recursive: true });
if (!fs.existsSync(regionsDir)) fs.mkdirSync(regionsDir, { recursive: true });

// 2. Write src/lib/anatomy/types.ts
fs.writeFileSync(
  path.join(anatomyDir, 'types.ts'),
`// Full-Body Anatomical Taxonomy & Sports Kinematics Matrix Types
// Authoritative definitions for athlete health tracking, injury localization,
// and sport-specific biomechanical impact modeling.

export type AnatomicalZoneKey =
  | 'head_neck'
  | 'upper_limb'
  | 'axial_spine'
  | 'pelvis_hip'
  | 'thigh'
  | 'knee'
  | 'lower_leg'
  | 'ankle_achilles'
  | 'foot_plantar';

export interface AnatomicalRegionMeta {
  id: string;
  name: string;
  clinicalTerm: string;
  zoneKey: AnatomicalZoneKey;
  zoneLabel: string;
  allowedSides: ('RIGHT' | 'LEFT' | 'BILATERAL' | 'AXIAL')[];
  defaultSide: 'RIGHT' | 'LEFT' | 'BILATERAL' | 'AXIAL';
  isLowerExtremity: boolean;
  isAxial: boolean;
  isUpperExtremity: boolean;
  runningImpactSeverity: 'HIGH_RISK' | 'MODERATE' | 'LOW';
  cyclingImpactSeverity: 'SAFE_FLAT' | 'MODERATE_TORQUE' | 'RESTRICTED_AERO';
  suggestedMechanism: string;
  suggestedTimeframe: string;
  suggestedLimitations: string;
  trainingGuidance: {
    running: string;
    cycling: string;
    crossTraining: string;
  };
}

export interface AnatomicalZoneGroup {
  key: AnatomicalZoneKey;
  label: string;
  iconName: string;
  description: string;
  regions: AnatomicalRegionMeta[];
}
`,
  'utf8'
);

// 3. Write src/lib/anatomy/zones.ts
fs.writeFileSync(
  path.join(anatomyDir, 'zones.ts'),
`import { AnatomicalZoneKey } from './types';

export const ANATOMICAL_ZONES: { key: AnatomicalZoneKey; label: string; icon: string }[] = [
  { key: 'head_neck', label: 'Kepala & Leher', icon: 'brain' },
  { key: 'upper_limb', label: 'Bahu & Lengan', icon: 'shield' },
  { key: 'axial_spine', label: 'Punggung & Core', icon: 'layers' },
  { key: 'pelvis_hip', label: 'Panggul & Pinggul', icon: 'target' },
  { key: 'thigh', label: 'Paha', icon: 'activity' },
  { key: 'knee', label: 'Lutut (Knees)', icon: 'zap' },
  { key: 'lower_leg', label: 'Tungkai Bawah & Betis', icon: 'footprints' },
  { key: 'ankle_achilles', label: 'Engkel & Achilles', icon: 'compass' },
  { key: 'foot_plantar', label: 'Telapak Kaki', icon: 'check-circle' },
];
`,
  'utf8'
);

// 4. Write regions/headNeck.ts
fs.writeFileSync(
  path.join(regionsDir, 'headNeck.ts'),
`import { AnatomicalRegionMeta } from '../types';

export const HEAD_NECK_REGIONS: AnatomicalRegionMeta[] = [
  {
    id: 'head',
    name: 'Kepala (Head)',
    clinicalTerm: 'Cranial / Head Impact & Concussion Monitoring',
    zoneKey: 'head_neck',
    zoneLabel: 'Kepala & Leher',
    allowedSides: ['AXIAL'],
    defaultSide: 'AXIAL',
    isLowerExtremity: false,
    isAxial: true,
    isUpperExtremity: false,
    runningImpactSeverity: 'MODERATE',
    cyclingImpactSeverity: 'MODERATE_TORQUE',
    suggestedMechanism: 'Benturan saat berolahraga / pusing pasca hentakan',
    suggestedTimeframe: '1-2 minggu terakhir',
    suggestedLimitations: 'Pusing saat akselerasi tinggi, hindari getaran jalan bergelombang',
    trainingGuidance: {
      running: 'Hindari lari cepat atau permukaan berbatu yang memicu guncangan kepala.',
      cycling: 'Gunakan indoor stationary bike dengan postur tegak dan hidrasi terkontrol.',
      crossTraining: 'Peregangan leher lembut dan latihan mobilitas tanpa hentakan.',
    },
  },
  {
    id: 'neck',
    name: 'Leher & Cervical Spine',
    clinicalTerm: 'Cervical Spine & Trapezius Insertion',
    zoneKey: 'head_neck',
    zoneLabel: 'Kepala & Leher',
    allowedSides: ['AXIAL', 'RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'AXIAL',
    isLowerExtremity: false,
    isAxial: true,
    isUpperExtremity: false,
    runningImpactSeverity: 'LOW',
    cyclingImpactSeverity: 'RESTRICTED_AERO',
    suggestedMechanism: 'Ketegangan otot leher akibat posisi aero sepeda terlalu lama',
    suggestedTimeframe: '2-4 minggu terakhir',
    suggestedLimitations: 'Kaku menengok ke belakang saat bersepeda di jalan raya',
    trainingGuidance: {
      running: 'Lari santai Zone 2 diperbolehkan jika tidak memicu spasme otot leher.',
      cycling: 'Hindari posisi drop bar agresif; gunakan handlebar lebih tinggi / hood grip.',
      crossTraining: 'Latihan mobilitas skapula dan penguatan upper back.',
    },
  },
];
`,
  'utf8'
);

// 5. Write regions/upperLimb.ts
fs.writeFileSync(
  path.join(regionsDir, 'upperLimb.ts'),
`import { AnatomicalRegionMeta } from '../types';

export const UPPER_LIMB_REGIONS: AnatomicalRegionMeta[] = [
  {
    id: 'shoulder',
    name: 'Bahu (Shoulder / Rotator Cuff)',
    clinicalTerm: 'Glenohumeral Joint & Rotator Cuff Complex',
    zoneKey: 'upper_limb',
    zoneLabel: 'Bahu & Lengan',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: false,
    isAxial: false,
    isUpperExtremity: true,
    runningImpactSeverity: 'LOW',
    cyclingImpactSeverity: 'MODERATE_TORQUE',
    suggestedMechanism: 'Salah tumpuan saat jatuh / tarikan mendadak saat angkat beban',
    suggestedTimeframe: '1-3 bulan lalu',
    suggestedLimitations: 'Nyeri saat mengangkat lengan di atas bahu atau menumpu stang',
    trainingGuidance: {
      running: 'Bebas lari aerobik dengan ayunan lengan rileks tanpa beban berlebih.',
      cycling: 'Sepeda diperbolehkan; hindari out-of-saddle sprint yang menarik stang kuat.',
      crossTraining: 'Hindari latihan dada/bahu berat dan renang gaya bebas agresif.',
    },
  },
  {
    id: 'upper_arm',
    name: 'Lengan Atas (Biceps / Triceps)',
    clinicalTerm: 'Brachial Musculature (Biceps Brachii / Triceps)',
    zoneKey: 'upper_limb',
    zoneLabel: 'Bahu & Lengan',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: false,
    isAxial: false,
    isUpperExtremity: true,
    runningImpactSeverity: 'LOW',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Kelelahan eksentrik saat repetisi angkat beban',
    suggestedTimeframe: '1-2 minggu terakhir',
    suggestedLimitations: 'Kaku saat meluruskan siku penuh',
    trainingGuidance: {
      running: 'Aman untuk seluruh program lari dasar.',
      cycling: 'Sepeda santai aman tanpa kendala beban kaki.',
      crossTraining: 'Pendinginan dan kompres hangat.',
    },
  },
  {
    id: 'elbow',
    name: 'Siku (Elbow - Epicondylitis)',
    clinicalTerm: 'Lateral / Medial Epicondyle Complex',
    zoneKey: 'upper_limb',
    zoneLabel: 'Bahu & Lengan',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: false,
    isAxial: false,
    isUpperExtremity: true,
    runningImpactSeverity: 'LOW',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Getaran berlebih dari stang sepeda pada jalanan rusak',
    suggestedTimeframe: '3 minggu terakhir',
    suggestedLimitations: 'Nyeri cengkeraman kuat saat pengereman sepeda',
    trainingGuidance: {
      running: 'Lari bebas hambatan.',
      cycling: 'Gunakan sarung tangan bergel empuk dan hindari jalanan bergelombang kasar.',
      crossTraining: 'Peregangan ekstensor pergelangan tangan.',
    },
  },
  {
    id: 'wrist_hand',
    name: 'Pergelangan Tangan & Jari (Wrist & Hand)',
    clinicalTerm: 'Carpal Joint Complex & TFCC',
    zoneKey: 'upper_limb',
    zoneLabel: 'Bahu & Lengan',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: false,
    isAxial: false,
    isUpperExtremity: true,
    runningImpactSeverity: 'LOW',
    cyclingImpactSeverity: 'MODERATE_TORQUE',
    suggestedMechanism: 'Tumpuan tangan menahan berat badan saat rem mendadak',
    suggestedTimeframe: '2-4 minggu lalu',
    suggestedLimitations: 'Nyeri saat ekstensi pergelangan tangan menopang stang',
    trainingGuidance: {
      running: 'Lari normal tanpa hambatan fungsional.',
      cycling: 'Gunakan grip ergonomis untuk menjaga netralitas sendi pergelangan.',
      crossTraining: 'Latihan penguatan pergelangan tangan tanpa beban impak.',
    },
  },
];
`,
  'utf8'
);

// 6. Write regions/axialSpine.ts
fs.writeFileSync(
  path.join(regionsDir, 'axialSpine.ts'),
`import { AnatomicalRegionMeta } from '../types';

export const AXIAL_SPINE_REGIONS: AnatomicalRegionMeta[] = [
  {
    id: 'upper_back',
    name: 'Punggung Atas (Thoracic Spine)',
    clinicalTerm: 'Thoracic Spine & Rhomboid Musculature',
    zoneKey: 'axial_spine',
    zoneLabel: 'Punggung & Core',
    allowedSides: ['AXIAL', 'RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'AXIAL',
    isLowerExtremity: false,
    isAxial: true,
    isUpperExtremity: false,
    runningImpactSeverity: 'LOW',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Postur bungkuk berkepanjangan saat bekerja dan bersepeda',
    suggestedTimeframe: '1 bulan terakhir',
    suggestedLimitations: 'Pegang pada punggung atas setelah sesi latihan durasi panjang',
    trainingGuidance: {
      running: 'Lari santai dengan postur tegak dan ekspansi dada terbuka.',
      cycling: 'Ganti posisi genggaman stang secara berkala untuk melepaskan tegangan punggung.',
      crossTraining: 'Latihan foam roller thoraks dan rotasi tulang belakang.',
    },
  },
  {
    id: 'lower_back',
    name: 'Punggung Bawah & Pinggang (Lumbar Spine)',
    clinicalTerm: 'Lumbar Spine (L1-S1) & Sacroiliac Articulation',
    zoneKey: 'axial_spine',
    zoneLabel: 'Punggung & Core',
    allowedSides: ['AXIAL', 'RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'AXIAL',
    isLowerExtremity: false,
    isAxial: true,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'RESTRICTED_AERO',
    suggestedMechanism: 'Ketegangan otot erector spinae saat mengangkat beban atau sprint sepeda',
    suggestedTimeframe: '2-6 minggu lalu',
    suggestedLimitations: 'Kaku saat membungkuk ke depan dan bangun dari kursi',
    trainingGuidance: {
      running: 'Lari dihentikan sementara bila ada sensasi kompresi spinal berdenyut.',
      cycling: 'Hanya sepeda posisi tegak (endurance geometry); hindari time trial aero bar.',
      crossTraining: 'Aktivasi otot transversus abdominis, glute bridge, dan peregangan psoas.',
    },
  },
  {
    id: 'chest_ribs',
    name: 'Dada & Tulang Rusuk (Ribs & Thorax)',
    clinicalTerm: 'Costochondral Junction & Pectoral Complex',
    zoneKey: 'axial_spine',
    zoneLabel: 'Punggung & Core',
    allowedSides: ['AXIAL', 'RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'AXIAL',
    isLowerExtremity: false,
    isAxial: true,
    isUpperExtremity: false,
    runningImpactSeverity: 'MODERATE',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Benturan langsung / tarikan otot interkostal saat napas dalam',
    suggestedTimeframe: '2 minggu terakhir',
    suggestedLimitations: 'Nyeri saat bernapas sangat dalam pada intensitas threshold',
    trainingGuidance: {
      running: 'Latihan dibatasi pada Zone 1-2 agar frekuensi napas tetap santai.',
      cycling: 'Sepeda santai irama stabil tanpa lonjakan denyut jantung mendadak.',
      crossTraining: 'Latihan pernapasan diafragma ringan.',
    },
  },
  {
    id: 'core_abdomen',
    name: 'Perut & Core (Abdominal Complex)',
    clinicalTerm: 'Rectus Abdominis & Oblique Musculature',
    zoneKey: 'pelvis_hip',
    zoneLabel: 'Panggul & Pinggul',
    allowedSides: ['AXIAL', 'RIGHT', 'LEFT'],
    defaultSide: 'AXIAL',
    isLowerExtremity: false,
    isAxial: true,
    isUpperExtremity: false,
    runningImpactSeverity: 'LOW',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Kram otot perut saat hidrasi minim pada cuaca panas',
    suggestedTimeframe: '1 minggu lalu',
    suggestedLimitations: 'Rasa tertarik saat menarik napas dalam dan memanjangkan badan',
    trainingGuidance: {
      running: 'Lari santai irama reguler aman.',
      cycling: 'Sepeda santai aman; hindari lonjakan tenaga eksplosif.',
      crossTraining: 'Peregangan otot perut lembut dan rehidrasi elektrolit.',
    },
  },
];
`,
  'utf8'
);

// 7. Write regions/pelvisHip.ts
fs.writeFileSync(
  path.join(regionsDir, 'pelvisHip.ts'),
`import { AnatomicalRegionMeta } from '../types';

export const PELVIS_HIP_REGIONS: AnatomicalRegionMeta[] = [
  {
    id: 'hip_joint',
    name: 'Sendi Pinggul & Panggul (Hip Joint)',
    clinicalTerm: 'Coxofemoral Articulation & Labrum Acetabulare',
    zoneKey: 'pelvis_hip',
    zoneLabel: 'Panggul & Pinggul',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Gesekan sendi saat rotasi panggul pada sesi endurance',
    suggestedTimeframe: '1-3 bulan lalu',
    suggestedLimitations: 'Klik atau rasa terjepit di pangkal paha saat mengangkat lutut tinggi',
    trainingGuidance: {
      running: 'Lari ditunda jika ada nyeri tusuk saat fase dorongan kaki (push-off).',
      cycling: 'Sepeda flat dengan sadel terkalibrasi tinggi agar fleksi panggul < 90 derajat.',
      crossTraining: 'Penguatan gluteus medius dan mobilitas kapsul panggul.',
    },
  },
  {
    id: 'groin',
    name: 'Selangkangan & Adduktor (Groin)',
    clinicalTerm: 'Adductor Longus / Brevis & Pubic Symphysis',
    zoneKey: 'pelvis_hip',
    zoneLabel: 'Panggul & Pinggul',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Perubahan arah mendadak atau akselerasi sprint eksplosif',
    suggestedTimeframe: '3 minggu lalu',
    suggestedLimitations: 'Nyeri saat merapatkan kedua paha atau melangkah lebar',
    trainingGuidance: {
      running: 'Hindari lari interval dan sprint; langkah pendek diperbolehkan jika bebas nyeri.',
      cycling: 'Sepeda duduk irama mulus tanpa gerakan lateral panggul.',
      crossTraining: 'Isometrik adduktor ringan menggunakan bola lunak di antara lutut.',
    },
  },
];
`,
  'utf8'
);

// 8. Write regions/thigh.ts
fs.writeFileSync(
  path.join(regionsDir, 'thigh.ts'),
`import { AnatomicalRegionMeta } from '../types';

export const THIGH_REGIONS: AnatomicalRegionMeta[] = [
  {
    id: 'hamstring',
    name: 'Paha Belakang (Hamstring)',
    clinicalTerm: 'Biceps Femoris & Semitendinosus Musculotendinous Junction',
    zoneKey: 'thigh',
    zoneLabel: 'Paha Depan & Belakang',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Tarikan kencang saat fase lari sprint kecepatan tinggi',
    suggestedTimeframe: '2-6 minggu lalu',
    suggestedLimitations: 'Sensasi tegang saat meluruskan lutut penuh atau lari melangkah panjang',
    trainingGuidance: {
      running: 'Lari sprint dan tanjakan dilarang. Lari datar santai hanya jika evaluasi mandiri 0 nyeri.',
      cycling: 'Sepeda kadens tinggi (85-95 rpm) beban rendah aman karena kontraksi lutut konvergen.',
      crossTraining: 'Latihan eksentrik Nordics ringan bertahap setelah fase nyeri akut terlewati.',
    },
  },
  {
    id: 'quadriceps',
    name: 'Paha Depan (Quadriceps)',
    clinicalTerm: 'Rectus Femoris & Vastus Lateralis/Medialis',
    zoneKey: 'thigh',
    zoneLabel: 'Paha Depan & Belakang',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'MODERATE_TORQUE',
    suggestedMechanism: 'Beban deselerasi turunan curam yang berlebihan',
    suggestedTimeframe: '2-4 minggu lalu',
    suggestedLimitations: 'Nyeri saat menuruni anak tangga atau posisi jongkok (squat)',
    trainingGuidance: {
      running: 'Hindari lari turunan (downhill) yang membebani kontraksi eksentrik kuadrisep.',
      cycling: 'Gunakan gigi ringan; hindari gowes dengan beban berat (grinding kadens rendah).',
      crossTraining: 'Wall-sit isometrik bertahap dan pemijatan rol busa pada paha depan.',
    },
  },
  {
    id: 'itb',
    name: 'Sisi Luar Paha (ITB / Iliotibial Band)',
    clinicalTerm: 'Iliotibial Band Friction Complex',
    zoneKey: 'thigh',
    zoneLabel: 'Paha Depan & Belakang',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'MODERATE_TORQUE',
    suggestedMechanism: 'Gesekan repetitif pada kondilus lateral femur saat jarak tempuh dinaikkan cepat',
    suggestedTimeframe: '1-2 bulan lalu',
    suggestedLimitations: 'Rasa terbakar di sisi luar paha menjalar ke lutut setelah menit ke-20 lari',
    trainingGuidance: {
      running: 'Batasi volume lari di bawah ambang munculnya gejala (misal maksimum 15-20 menit).',
      cycling: 'Periksa posisi cleat sepatu sepeda agar sudut kaki tidak terlalu menghadap ke dalam.',
      crossTraining: 'Penguatan otot abduktor panggul (gluteus medius) dan pelepasan TFL.',
    },
  },
];
`,
  'utf8'
);

// 9. Write regions/knee.ts
fs.writeFileSync(
  path.join(regionsDir, 'knee.ts'),
`import { AnatomicalRegionMeta } from '../types';

export const KNEE_REGIONS: AnatomicalRegionMeta[] = [
  {
    id: 'knee_anterior',
    name: 'Lutut Anterior (Bilateral Knees)',
    clinicalTerm: 'Patellofemoral Articulation & Patellar Tendon Complex',
    zoneKey: 'knee',
    zoneLabel: 'Sendi Lutut',
    allowedSides: ['BILATERAL', 'RIGHT', 'LEFT'],
    defaultSide: 'BILATERAL',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Kelebihan beban impak hentakan berulang pasca lari jarak jauh',
    suggestedTimeframe: '1-3 bulan lalu',
    suggestedLimitations: 'Sensasi nyeri tumpul saat duduk lama ditekuk atau menuruni tangga',
    trainingGuidance: {
      running: 'Lari dihentikan sementara (ON_HOLD) menunggu evaluasi klinis dan toleransi beban.',
      cycling: 'Sepeda jalan datar kadens tinggi (> 80 rpm) aman dan terbukti dapat ditoleransi.',
      crossTraining: 'Latihan penguatan VMO, gluteus medius, dan mobilitas pergelangan kaki.',
    },
  },
  {
    id: 'knee_meniscus',
    name: 'Lutut Medial / Meniskus (Inner Knee)',
    clinicalTerm: 'Medial Meniscus & Medial Collateral Ligament (MCL)',
    zoneKey: 'knee',
    zoneLabel: 'Sendi Lutut',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'MODERATE_TORQUE',
    suggestedMechanism: 'Gerakan memutar lutut dengan telapak kaki tertanam di tanah',
    suggestedTimeframe: '1-2 bulan lalu',
    suggestedLimitations: 'Sensasi terganjal atau bunyi klik saat meluruskan kaki penuh',
    trainingGuidance: {
      running: 'Lari dilarang keras untuk mencegah cedera meniskus bertambah parah.',
      cycling: 'Gowes santai tanpa tahanan beban berat; hindari gerakan memutar lutut.',
      crossTraining: 'Latihan rantai tertutup (closed-chain) ringan dengan sudut terbatas.',
    },
  },
];
`,
  'utf8'
);

// 10. Write regions/lowerLeg.ts
fs.writeFileSync(
  path.join(regionsDir, 'lowerLeg.ts'),
`import { AnatomicalRegionMeta } from '../types';

export const LOWER_LEG_REGIONS: AnatomicalRegionMeta[] = [
  {
    id: 'shin_splints',
    name: 'Tulang Kering (Shin Splints / Tibia)',
    clinicalTerm: 'Medial Tibial Stress Syndrome (MTSS)',
    zoneKey: 'lower_leg',
    zoneLabel: 'Tungkai Bawah & Betis',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'BILATERAL',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Hentakan permukaan aspal keras dengan sepatu lari yang sudah aus',
    suggestedTimeframe: '2-4 minggu lalu',
    suggestedLimitations: 'Nyeri tekan pada 1/3 bagian dalam tulang kering saat awal mulai lari',
    trainingGuidance: {
      running: 'Hentikan lari di jalan aspal/keras; beralih ke permukaan tanah halus atau lintasan sintetis.',
      cycling: 'Sepeda sangat direkomendasikan sebagai substitusi cardio bebas beban impak tulang kering.',
      crossTraining: 'Penguatan otot tibialis anterior dan posterior, peregangan soleus.',
    },
  },
  {
    id: 'calf',
    name: 'Otot Betis (Calf - Gastrocnemius / Soleus)',
    clinicalTerm: 'Gastrocnemius / Soleus Musculotendinous Complex',
    zoneKey: 'lower_leg',
    zoneLabel: 'Tungkai Bawah & Betis',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Kram hebat atau sensasi seperti tersengat saat sprint mendaki',
    suggestedTimeframe: '2-3 minggu lalu',
    suggestedLimitations: 'Kaku di pagi hari dan nyeri saat berjinjit menopang beban badan',
    trainingGuidance: {
      running: 'Hindari lari bertumpu pada bola kaki (forefoot strike) yang membebani betis.',
      cycling: 'Posisikan pedal di tengah telapak kaki untuk mengurangi tarikan tuas betis.',
      crossTraining: 'Eccentric heel drop pada permukaan datar tanpa beban tambahan.',
    },
  },
];
`,
  'utf8'
);

// 11. Write regions/ankleAchilles.ts
fs.writeFileSync(
  path.join(regionsDir, 'ankleAchilles.ts'),
`import { AnatomicalRegionMeta } from '../types';

export const ANKLE_ACHILLES_REGIONS: AnatomicalRegionMeta[] = [
  {
    id: 'ankle_atfl',
    name: 'Right Ankle (Engkel - ATFL / CFL)',
    clinicalTerm: 'Anterior Talofibular Ligament (ATFL) & Lateral Ankle Complex',
    zoneKey: 'ankle_achilles',
    zoneLabel: 'Pergelangan Kaki & Tumit',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Inversi mendadak saat salah mendarat pada permukaan tidak rata',
    suggestedTimeframe: '3-6 bulan lalu (pernah bengkak 2 bulan)',
    suggestedLimitations: 'Nyeri saat hentakan lari, jalan normal, sepeda flat bebas nyeri',
    trainingGuidance: {
      running: 'Lari ditunda (ON_HOLD) mutlak sampai evaluasi klinis dan tes stabilitas satu kaki lulus.',
      cycling: 'Sepeda jalan datar non-impak terbukti aman dan ditoleransi dengan 0 keluhan nyeri.',
      crossTraining: 'Latihan propriosepsi keseimbangan satu kaki di atas busa balance pad.',
    },
  },
  {
    id: 'achilles',
    name: 'Tendon Achilles (Achilles Tendon)',
    clinicalTerm: 'Achilles Tendinopathy (Mid-portion / Insertional)',
    zoneKey: 'ankle_achilles',
    zoneLabel: 'Pergelangan Kaki & Tumit',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Lonjakan jarak tempuh lari mendadak tanpa adaptasi tendon memadai',
    suggestedTimeframe: '1-3 bulan lalu',
    suggestedLimitations: 'Kaku parah di bagian belakang tumit selama 10 menit pertama bangun pagi',
    trainingGuidance: {
      running: 'Lari dihentikan total pada fase reaktif; hindari peregangan berlebihan yang menekan insersi.',
      cycling: 'Sepeda santai irama sedang dengan sepatu sol kaku (stiff-soled) sangat aman.',
      crossTraining: 'Protokol Alfredson isometrik dan beban eksentrik lambat bertahap.',
    },
  },
];
`,
  'utf8'
);

// 12. Write regions/footPlantar.ts
fs.writeFileSync(
  path.join(regionsDir, 'footPlantar.ts'),
`import { AnatomicalRegionMeta } from '../types';

export const FOOT_PLANTAR_REGIONS: AnatomicalRegionMeta[] = [
  {
    id: 'plantar_fascia',
    name: 'Telapak Kaki (Plantar Fascia)',
    clinicalTerm: 'Plantar Fasciitis & Medial Calcaneal Tubercle',
    zoneKey: 'foot_plantar',
    zoneLabel: 'Telapak Kaki & Jari',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Berdiri atau berlari lama menggunakan alas kaki tanpa bantalan lengkung yang cukup',
    suggestedTimeframe: '1-4 bulan lalu',
    suggestedLimitations: 'Nyeri menusuk di tumit saat langkah pertama turun dari tempat tidur',
    trainingGuidance: {
      running: 'Lari ditunda jika rasa menusuk di tumit dirasakan pada 5 menit pertama melangkah.',
      cycling: 'Sepeda menggunakan sepatu sepeda kaku aman karena telapak kaki tidak menekuk.',
      crossTraining: 'Menggulung bola golf / botol air dingin di bawah telapak kaki.',
    },
  },
  {
    id: 'metatarsal',
    name: 'Jari Kaki & Metatarsal (Forefoot)',
    clinicalTerm: 'Metatarsalgia / Sesamoiditis & Phalanges',
    zoneKey: 'foot_plantar',
    zoneLabel: 'Telapak Kaki & Jari',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Tekanan berlebih pada bantalan depan kaki saat lari di atas jalan keras',
    suggestedTimeframe: '2-3 minggu lalu',
    suggestedLimitations: 'Nyeri rasa panas seperti menginjak kerikil pada telapak kaki depan',
    trainingGuidance: {
      running: 'Gunakan sepatu lari dengan toe-box lebar dan bantalan depan tebal.',
      cycling: 'Sepeda aman jika cleat tidak menekan langsung tepat di titik sensitif.',
      crossTraining: 'Latihan kekuatan jari kaki (towel scrunch) dan mobilitas pergelangan kaki.',
    },
  },
];
`,
  'utf8'
);

// 13. Write regions/index.ts (combines all)
fs.writeFileSync(
  path.join(regionsDir, 'index.ts'),
`import { AnatomicalRegionMeta } from '../types';
import { HEAD_NECK_REGIONS } from './headNeck';
import { UPPER_LIMB_REGIONS } from './upperLimb';
import { AXIAL_SPINE_REGIONS } from './axialSpine';
import { PELVIS_HIP_REGIONS } from './pelvisHip';
import { THIGH_REGIONS } from './thigh';
import { KNEE_REGIONS } from './knee';
import { LOWER_LEG_REGIONS } from './lowerLeg';
import { ANKLE_ACHILLES_REGIONS } from './ankleAchilles';
import { FOOT_PLANTAR_REGIONS } from './footPlantar';

export const ANATOMICAL_REGIONS: AnatomicalRegionMeta[] = [
  ...HEAD_NECK_REGIONS,
  ...UPPER_LIMB_REGIONS,
  ...AXIAL_SPINE_REGIONS,
  ...PELVIS_HIP_REGIONS,
  ...THIGH_REGIONS,
  ...KNEE_REGIONS,
  ...LOWER_LEG_REGIONS,
  ...ANKLE_ACHILLES_REGIONS,
  ...FOOT_PLANTAR_REGIONS,
];

export * from './headNeck';
export * from './upperLimb';
export * from './axialSpine';
export * from './pelvisHip';
export * from './thigh';
export * from './knee';
export * from './lowerLeg';
export * from './ankleAchilles';
export * from './footPlantar';
`,
  'utf8'
);

// 14. Write src/lib/anatomy/resolver.ts
fs.writeFileSync(
  path.join(anatomyDir, 'resolver.ts'),
`import { AnatomicalRegionMeta } from './types';
import { ANATOMICAL_REGIONS } from './regions';

/**
 * Resolve any body region string to an authoritative AnatomicalRegionMeta object.
 */
export function getAnatomicalRegion(query: string): AnatomicalRegionMeta {
  const q = (query || '').toLowerCase().trim();

  // Direct ID, name, or clinicalTerm match
  const directMatch = ANATOMICAL_REGIONS.find(
    (r) =>
      r.id.toLowerCase() === q ||
      r.name.toLowerCase() === q ||
      r.clinicalTerm.toLowerCase() === q
  );
  if (directMatch) return directMatch;

  // Substring semantic matching across anatomical landmarks
  if (q.includes('ankle') || q.includes('engkel') || q.includes('pergelangan kaki') || q.includes('atfl')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'ankle_atfl')!;
  }
  if (q.includes('knee') || q.includes('lutut') || q.includes('patell')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'knee_anterior')!;
  }
  if (q.includes('meniskus') || q.includes('meniscus') || q.includes('mcl')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'knee_meniscus')!;
  }
  if (q.includes('hamstring') || q.includes('paha belakang')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'hamstring')!;
  }
  if (q.includes('quad') || q.includes('paha depan')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'quadriceps')!;
  }
  if (q.includes('itb') || q.includes('iliotibial')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'itb')!;
  }
  if (q.includes('achilles') || q.includes('tumit belakang')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'achilles')!;
  }
  if (q.includes('plantar') || q.includes('telapak kaki') || q.includes('fascia')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'plantar_fascia')!;
  }
  if (q.includes('shin') || q.includes('tulang kering') || q.includes('mtss')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'shin_splints')!;
  }
  if (q.includes('calf') || q.includes('betis') || q.includes('gastrocnemius')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'calf')!;
  }
  if (q.includes('hip') || q.includes('pinggul') || q.includes('panggul')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'hip_joint')!;
  }
  if (q.includes('groin') || q.includes('selangkangan') || q.includes('adductor')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'groin')!;
  }
  if (q.includes('lower back') || q.includes('pinggang') || q.includes('lumbar') || q.includes('punggung bawah')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'lower_back')!;
  }
  if (q.includes('upper back') || q.includes('punggung atas') || q.includes('thoracic')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'upper_back')!;
  }
  if (q.includes('shoulder') || q.includes('bahu') || q.includes('rotator')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'shoulder')!;
  }
  if (q.includes('elbow') || q.includes('siku')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'elbow')!;
  }
  if (q.includes('wrist') || q.includes('pergelangan tangan') || q.includes('hand') || q.includes('tangan')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'wrist_hand')!;
  }
  if (q.includes('neck') || q.includes('leher') || q.includes('cervical')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'neck')!;
  }
  if (q.includes('head') || q.includes('kepala') || q.includes('concussion')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'head')!;
  }
  if (q.includes('core') || q.includes('abdomen') || q.includes('perut')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'core_abdomen')!;
  }

  // Fallback dynamic region for custom input
  const isLower =
    q.includes('leg') ||
    q.includes('foot') ||
    q.includes('kaki') ||
    q.includes('paha') ||
    q.includes('lutut') ||
    q.includes('sendi');

  return {
    id: q.replace(/\\s+/g, '_'),
    name: query.trim() || 'Area Anatomi Kustom',
    clinicalTerm: query.trim() || 'Custom Anatomical Structure',
    zoneKey: isLower ? 'lower_leg' : 'upper_limb',
    zoneLabel: isLower ? 'Tungkai Bawah (Kustom)' : 'Tubuh Atas (Kustom)',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL', 'AXIAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: isLower,
    isAxial: false,
    isUpperExtremity: !isLower,
    runningImpactSeverity: isLower ? 'HIGH_RISK' : 'LOW',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Keluhan ketegangan atau benturan saat berolahraga',
    suggestedTimeframe: '2-4 minggu terakhir',
    suggestedLimitations: 'Sensasi ketidaknyamanan saat melakukan beban fungsional',
    trainingGuidance: {
      running: isLower
        ? 'Lari harus dimonitor ketat dan ditunda bila timbul nyeri berdenyut.'
        : 'Lari normal dengan pemantauan toleransi umum.',
      cycling: 'Sepeda santai jalan datar diizinkan dengan pemantauan respon pasca sesi.',
      crossTraining: 'Latihan penguatan mobilitas bertahap tanpa beban impak berat.',
    },
  };
}
`,
  'utf8'
);

// 15. Write src/lib/anatomy/index.ts (barrel export)
fs.writeFileSync(
  path.join(anatomyDir, 'index.ts'),
`export * from './types';
export * from './zones';
export * from './regions';
export * from './resolver';
`,
  'utf8'
);

// 16. Rewrite src/lib/anatomyUtils.ts as a backward-compatible forwarder
fs.writeFileSync(
  path.join(rootDir, 'src', 'lib', 'anatomyUtils.ts'),
`// Backward compatibility layer
// Re-exports all domain types, macro zones, region models, and resolver functions from the modular anatomy package.
export * from './anatomy';
`,
  'utf8'
);

console.log('Anatomy successfully decomposed into modular domain folders!');
