const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');
const anatomyDir = path.join(rootDir, 'src', 'lib', 'anatomy');
const regionsDir = path.join(anatomyDir, 'regions');

// 1. Update types.ts
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
  primaryMuscles?: string[];
  biomechanicalRole?: string;
  commonPathologies?: string[];
  rehabilitationFocus?: string[];
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

// 2. regions/headNeck.ts
fs.writeFileSync(
  path.join(regionsDir, 'headNeck.ts'),
`import { AnatomicalRegionMeta } from '../types';

export const HEAD_NECK_REGIONS: AnatomicalRegionMeta[] = [
  {
    id: 'head',
    name: 'Kepala (Head & Cranium)',
    clinicalTerm: 'Cranial Vault & Concussion Monitoring',
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
    commonPathologies: ['Post-concussion syndrome', 'Cervicogenic headache'],
  },
  {
    id: 'neck',
    name: 'Leher & Cervical Spine',
    clinicalTerm: 'Cervical Spine (C1-C7) & Trapezius Insertion',
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
    primaryMuscles: ['Upper Trapezius', 'Levator Scapulae', 'Splenius Capitis'],
    commonPathologies: ['Cervical strain', 'Facet joint syndrome', 'Aero neck fatigue'],
  },
  {
    id: 'tmj_jaw',
    name: 'Rahang & TMJ (Temporomandibular)',
    clinicalTerm: 'Temporomandibular Articulation & Masseter Tension',
    zoneKey: 'head_neck',
    zoneLabel: 'Kepala & Leher',
    allowedSides: ['BILATERAL', 'RIGHT', 'LEFT'],
    defaultSide: 'BILATERAL',
    isLowerExtremity: false,
    isAxial: true,
    isUpperExtremity: false,
    runningImpactSeverity: 'LOW',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Mengatupkan gigi terlalu kencang (clenching) saat usaha maksimal mendaki',
    suggestedTimeframe: '1-3 minggu lalu',
    suggestedLimitations: 'Nyeri rahang dan pelipis saat mengunyah pasca latihan berat',
    trainingGuidance: {
      running: 'Fokus pada relaksasi rahang dan bernapas rileks melalui mulut yang terbuka santai.',
      cycling: 'Hindari menggertakkan gigi saat mengayuh tanjakan berat; jaga bahu tetap rileks.',
      crossTraining: 'Pijatan otot masseter dan latihan dekompresi rahang.',
    },
    primaryMuscles: ['Masseter', 'Temporalis'],
  },
];
`,
  'utf8'
);

// 3. regions/upperLimb.ts
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
    primaryMuscles: ['Supraspinatus', 'Infraspinatus', 'Subscapularis', 'Deltoid'],
    commonPathologies: ['Subacromial impingement', 'Rotator cuff tendinopathy'],
  },
  {
    id: 'ac_joint',
    name: 'Sendi Klavikula (AC Joint & Clavicle)',
    clinicalTerm: 'Acromioclavicular Articulation & Clavicular Diaphysis',
    zoneKey: 'upper_limb',
    zoneLabel: 'Bahu & Lengan',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: false,
    isAxial: false,
    isUpperExtremity: true,
    runningImpactSeverity: 'LOW',
    cyclingImpactSeverity: 'MODERATE_TORQUE',
    suggestedMechanism: 'Jatuh langsung mengenai ujung bahu (fall over the bars) saat bersepeda',
    suggestedTimeframe: '1-6 bulan lalu',
    suggestedLimitations: 'Nyeri saat lengan menyilang dada (cross-body adduction) dan bertumpu stang',
    trainingGuidance: {
      running: 'Lari santai diperbolehkan jika guncangan langkah tidak memicu nyeri ujung bahu.',
      cycling: 'Gunakan posisi tegak; hindari rute berbatu terjal dengan guncangan berat.',
      crossTraining: 'Isometrik deltoid dan stabilisasi gelang bahu tanpa beban gantung.',
    },
    commonPathologies: ['AC joint separation (Grade I-II)', 'Clavicle fracture consolidation'],
  },
  {
    id: 'scapula',
    name: 'Belikat & Peri-Scapular',
    clinicalTerm: 'Scapulothoracic Articulation & Rhomboids',
    zoneKey: 'upper_limb',
    zoneLabel: 'Bahu & Lengan',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: false,
    isAxial: false,
    isUpperExtremity: true,
    runningImpactSeverity: 'LOW',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Kelelahan postur menahan stang sepeda pada perjalanan jarak jauh',
    suggestedTimeframe: '2-4 minggu lalu',
    suggestedLimitations: 'Rasa pegal membakar di antara tulang belikat dan tulang belakang',
    trainingGuidance: {
      running: 'Lari santai irama reguler aman; jaga ayunan lengan tetap santai.',
      cycling: 'Ganti posisi grip stang secara berkala dan rilekskan bahu.',
      crossTraining: 'Latihan penguatan serratus anterior dan lower trapezius (Y-T-W raises).',
    },
    primaryMuscles: ['Rhomboid Major/Minor', 'Serratus Anterior', 'Middle Trapezius'],
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
    primaryMuscles: ['Biceps Brachii', 'Triceps Brachii', 'Brachialis'],
  },
  {
    id: 'elbow',
    name: 'Siku Lateral (Tennis Elbow)',
    clinicalTerm: 'Lateral Epicondyle / Extensor Carpi Radialis Brevis',
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
    commonPathologies: ['Lateral epicondylalgia', 'Radial tunnel syndrome'],
  },
  {
    id: 'elbow_medial',
    name: 'Siku Medial (Golfer\\'s Elbow)',
    clinicalTerm: 'Medial Epicondyle & Common Flexor Tendon',
    zoneKey: 'upper_limb',
    zoneLabel: 'Bahu & Lengan',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: false,
    isAxial: false,
    isUpperExtremity: true,
    runningImpactSeverity: 'LOW',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Beban tarikan cengkeraman berulang saat latihan kekuatan',
    suggestedTimeframe: '2-4 minggu lalu',
    suggestedLimitations: 'Nyeri saat menekuk pergelangan tangan melawan tahanan',
    trainingGuidance: {
      running: 'Lari santai dan endurance dasar bebas hambatan.',
      cycling: 'Hindari menarik stang terlalu keras saat gowes berdiri.',
      crossTraining: 'Latihan penguatan eksentrik fleksor pergelangan tangan.',
    },
    commonPathologies: ['Medial epicondylalgia'],
  },
  {
    id: 'forearm',
    name: 'Lengan Bawah (Forearm Compartment)',
    clinicalTerm: 'Antebrachial Musculature (Pronator / Supinator)',
    zoneKey: 'upper_limb',
    zoneLabel: 'Bahu & Lengan',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: false,
    isAxial: false,
    isUpperExtremity: true,
    runningImpactSeverity: 'LOW',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Kelelahan arm pump saat turunan teknis terjal pada sepeda gunung',
    suggestedTimeframe: '1-2 minggu lalu',
    suggestedLimitations: 'Kaku dan pegal menjepit tuas rem sepeda durasi panjang',
    trainingGuidance: {
      running: 'Aman untuk seluruh program lari.',
      cycling: 'Atur tuas rem lebih dekat ke stang (reach adjust) agar jari tidak meregang jauh.',
      crossTraining: 'Pemijatan fasia lengan bawah dan peregangan pronator teres.',
    },
  },
  {
    id: 'wrist_hand',
    name: 'Pergelangan Tangan & TFCC',
    clinicalTerm: 'Carpal Joint Complex, TFCC & Median Nerve Tunnel',
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
    commonPathologies: ['Carpal tunnel syndrome', 'Cyclist palsy (Ulnar neuropathy)', 'TFCC strain'],
  },
  {
    id: 'thumb_dequervain',
    name: 'Pangkal Ibu Jari & De Quervain',
    clinicalTerm: 'De Quervain Tenosynovitis (EPB & APL)',
    zoneKey: 'upper_limb',
    zoneLabel: 'Bahu & Lengan',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: false,
    isAxial: false,
    isUpperExtremity: true,
    runningImpactSeverity: 'LOW',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Menekan tuas shifter gigi sepeda berulang kali dengan posisi tangan miring',
    suggestedTimeframe: '2-3 minggu lalu',
    suggestedLimitations: 'Nyeri menusuk di pangkal ibu jari saat memegang botol minum atau menekan shifter',
    trainingGuidance: {
      running: 'Lari santai bebas hambatan.',
      cycling: 'Sesuaikan sudut shifter sepeda agar ibu jari bergerak dalam garis lurus alami.',
      crossTraining: 'Imobilisasi ibu jari dengan wrist-spica splint ringan saat beristirahat.',
    },
    commonPathologies: ['De Quervain tenosynovitis', 'Thumb CMC osteoarthritis'],
  },
];
`,
  'utf8'
);

// 4. regions/axialSpine.ts
fs.writeFileSync(
  path.join(regionsDir, 'axialSpine.ts'),
`import { AnatomicalRegionMeta } from '../types';

export const AXIAL_SPINE_REGIONS: AnatomicalRegionMeta[] = [
  {
    id: 'upper_back',
    name: 'Punggung Atas (Thoracic Spine)',
    clinicalTerm: 'Thoracic Spine (T1-T12) & Interscapular Musculature',
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
    primaryMuscles: ['Erector Spinae Thoracis', 'Rhomboids', 'Mid Trapezius'],
  },
  {
    id: 'lower_back',
    name: 'Punggung Bawah & Lumbar (L1-S1)',
    clinicalTerm: 'Lumbar Spine Complex (L1-S1) & Multifidus',
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
    primaryMuscles: ['Erector Spinae', 'Quadratus Lumborum', 'Multifidus'],
    commonPathologies: ['Lumbar disc herniation (L4-L5/L5-S1)', 'Facet arthropathy', 'Acute lumbar strain'],
  },
  {
    id: 'sacroiliac_joint',
    name: 'Sendi Sakroiliaka (SI Joint)',
    clinicalTerm: 'Sacroiliac Articulation & Sacrotuberous Ligament',
    zoneKey: 'axial_spine',
    zoneLabel: 'Punggung & Core',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: false,
    isAxial: true,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'MODERATE_TORQUE',
    suggestedMechanism: 'Torsi asimetris panggul saat mengayuh tanjakan atau mendarat lari di jalan miring',
    suggestedTimeframe: '1-3 bulan lalu',
    suggestedLimitations: 'Nyeri tajam di bokong atas tepat di sisi tulang ekor saat berdiri pada satu kaki',
    trainingGuidance: {
      running: 'Hindari lari permukaan tidak rata dan lintasan memutar tajam.',
      cycling: 'Gunakan irama kayuhan halus; hindari goyangan panggul ke kiri-kanan di atas sadel.',
      crossTraining: 'Stabilisasi panggul isometrik dan penataan simetri pelvis oleh fisioterapis.',
    },
    commonPathologies: ['Sacroiliac joint dysfunction', 'Sacroiliitis'],
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
    commonPathologies: ['Costochondritis', 'Intercostal muscle strain'],
  },
  {
    id: 'core_abdomen',
    name: 'Perut & Core (Abdominal Complex)',
    clinicalTerm: 'Rectus Abdominis, Obliques & Linea Alba',
    zoneKey: 'axial_spine',
    zoneLabel: 'Punggung & Core',
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
    primaryMuscles: ['Transversus Abdominis', 'Rectus Abdominis', 'Internal/External Obliques'],
  },
  {
    id: 'perineum_pudendal',
    name: 'Perineum & Sadel Sepeda (Saddle Sore)',
    clinicalTerm: 'Perineal Tissue, Ischiocavernosus & Pudendal Nerve',
    zoneKey: 'axial_spine',
    zoneLabel: 'Punggung & Core',
    allowedSides: ['AXIAL', 'RIGHT', 'LEFT'],
    defaultSide: 'AXIAL',
    isLowerExtremity: false,
    isAxial: true,
    isUpperExtremity: false,
    runningImpactSeverity: 'LOW',
    cyclingImpactSeverity: 'RESTRICTED_AERO',
    suggestedMechanism: 'Gesekan sadel sepeda dan kompresi berkepanjangan pada saraf pudendus',
    suggestedTimeframe: '1-2 minggu lalu',
    suggestedLimitations: 'Nyeri tekan hebat dan mati rasa saat duduk di sadel sepeda',
    trainingGuidance: {
      running: 'Lari aman total karena tidak ada kontak tekanan sadel.',
      cycling: 'Gunakan celana bib-shorts berpadding berkualitas, oleskan chamois cream, evaluasi sadel cut-out.',
      crossTraining: 'Latihan berdiri dan istirahat dari duduk sadel keras.',
    },
    commonPathologies: ['Saddle sores (folliculitis)', 'Pudendal nerve entrapment / numbness'],
  },
];
`,
  'utf8'
);

// 5. regions/pelvisHip.ts
fs.writeFileSync(
  path.join(regionsDir, 'pelvisHip.ts'),
`import { AnatomicalRegionMeta } from '../types';

export const PELVIS_HIP_REGIONS: AnatomicalRegionMeta[] = [
  {
    id: 'hip_joint',
    name: 'Sendi Pinggul & Labrum (Hip Joint)',
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
    commonPathologies: ['Femoroacetabular impingement (FAI)', 'Acetabular labral tear'],
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
    primaryMuscles: ['Adductor Longus', 'Gracilis', 'Pectineus'],
    commonPathologies: ['Adductor tendinopathy', 'Athletic pubalgia / sports hernia'],
  },
  {
    id: 'hip_flexor_psoas',
    name: 'Fleksor Panggul (Iliopsoas)',
    clinicalTerm: 'Iliopsoas Tendon & Psoas Major Musculature',
    zoneKey: 'pelvis_hip',
    zoneLabel: 'Panggul & Pinggul',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'MODERATE_TORQUE',
    suggestedMechanism: 'Menarik lutut ke atas berulang pada posisi duduk sepeda yang terlalu membungkuk',
    suggestedTimeframe: '2-4 minggu lalu',
    suggestedLimitations: 'Nyeri di lipatan paha depan saat melangkah panjang atau mengangkat paha',
    trainingGuidance: {
      running: 'Lari diperbolehkan dengan langkah pendek santai; hindari lari tanjakan terjal.',
      cycling: 'Posisikan sadel sedikit lebih ke belakang untuk membuka sudut panggul.',
      crossTraining: 'Peregangan psoas setengah berlutut (half-kneeling hip flexor stretch).',
    },
    primaryMuscles: ['Psoas Major', 'Iliacus'],
    commonPathologies: ['Iliopsoas tendinopathy / bursitis'],
  },
  {
    id: 'trochanteric_bursa',
    name: 'Sisi Luar Pinggul & Trochanter (GTPS)',
    clinicalTerm: 'Greater Trochanteric Pain Syndrome (GTPS) & Gluteal Tendon',
    zoneKey: 'pelvis_hip',
    zoneLabel: 'Panggul & Pinggul',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Gesekan tendon gluteus medius pada tonjolan tulang pinggul lateral',
    suggestedTimeframe: '1-3 bulan lalu',
    suggestedLimitations: 'Nyeri saat tidur miring menindih sisi pinggul atau berdiri satu kaki',
    trainingGuidance: {
      running: 'Hindari lari lintasan miring (cambered road); perbaiki penurunan panggul (Trendelenburg).',
      cycling: 'Gowes duduk irama stabil aman dan minim impak benturan.',
      crossTraining: 'Latihan penguatan abduktor panggul tanpa membiarkan paha menyilang garis tengah.',
    },
    primaryMuscles: ['Gluteus Medius', 'Gluteus Minimus'],
    commonPathologies: ['Greater trochanteric pain syndrome', 'Gluteal tendinopathy'],
  },
  {
    id: 'gluteal_piriformis',
    name: 'Bokong & Piriformis (Deep Gluteal)',
    clinicalTerm: 'Piriformis Complex & Sciatic Nerve Trajectory',
    zoneKey: 'pelvis_hip',
    zoneLabel: 'Panggul & Pinggul',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'MODERATE',
    cyclingImpactSeverity: 'MODERATE_TORQUE',
    suggestedMechanism: 'Spasme otot piriformis yang menjepit saraf skiatika saat duduk lama di sadel keras',
    suggestedTimeframe: '1-2 bulan lalu',
    suggestedLimitations: 'Nyeri tumpul mendalam di tengah bokong yang menjalar ke paha belakang',
    trainingGuidance: {
      running: 'Lari santai irama lambat diperbolehkan jika tidak memicu kebas/kesemutan.',
      cycling: 'Gunakan sadel dengan bantalan gel empuk; sesuaikan tilt sadel agar sejajar netral.',
      crossTraining: 'Pelepasan myofascial bola tenis pada bokong dan peregangan rotasi eksternal pinggul.',
    },
    primaryMuscles: ['Piriformis', 'Gemelli', 'Obturator Internus'],
    commonPathologies: ['Piriformis syndrome', 'Deep gluteal syndrome'],
  },
  {
    id: 'ischial_tuberosity',
    name: 'Tulang Duduk (Ischial Tuberosity / High Hamstring)',
    clinicalTerm: 'Ischial Tuberosity & Proximal Hamstring Origin',
    zoneKey: 'pelvis_hip',
    zoneLabel: 'Panggul & Pinggul',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'MODERATE_TORQUE',
    suggestedMechanism: 'Tekanan langsung sadel sepeda berkombinasi dengan tarikan proksimal hamstring',
    suggestedTimeframe: '2-4 bulan lalu',
    suggestedLimitations: 'Nyeri tajam tepat di tulang duduk saat akselerasi cepat atau duduk di kursi keras',
    trainingGuidance: {
      running: 'Hindari lari langkah panjang dan sprint tanjakan.',
      cycling: 'Atur kemiringan sadel; hindari posisi duduk terlalu ke belakang.',
      crossTraining: 'Isometrik jembatan bokong (glute bridge) bertahap.',
    },
    commonPathologies: ['Proximal hamstring tendinopathy (PHT)', 'Ischial bursitis'],
  },
];
`,
  'utf8'
);

// 6. regions/thigh.ts
fs.writeFileSync(
  path.join(regionsDir, 'thigh.ts'),
`import { AnatomicalRegionMeta } from '../types';

export const THIGH_REGIONS: AnatomicalRegionMeta[] = [
  {
    id: 'hamstring',
    name: 'Paha Belakang (Hamstring Medial & Lateral)',
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
    primaryMuscles: ['Biceps Femoris', 'Semitendinosus', 'Semimembranosus'],
    commonPathologies: ['Hamstring strain (Grade I-II)', 'Distal hamstring tendinitis'],
  },
  {
    id: 'quadriceps',
    name: 'Paha Depan (Quadriceps Complex)',
    clinicalTerm: 'Rectus Femoris, Vastus Lateralis & Medialis',
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
    primaryMuscles: ['Rectus Femoris', 'Vastus Medialis (VMO)', 'Vastus Lateralis', 'Vastus Intermedius'],
    commonPathologies: ['Quadriceps strain', 'Rectus femoris tendinopathy'],
  },
  {
    id: 'itb',
    name: 'Sisi Luar Paha (ITB & TFL)',
    clinicalTerm: 'Iliotibial Band Friction Complex & Tensor Fasciae Latae',
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
    primaryMuscles: ['Tensor Fasciae Latae (TFL)', 'Gluteus Maximus (aponeurosis)'],
    commonPathologies: ['Iliotibial band syndrome (ITBS)'],
  },
  {
    id: 'femur_bone',
    name: 'Tulang Paha (Femoral Shaft)',
    clinicalTerm: 'Femoral Diaphysis / Bone Stress Injury Monitoring',
    zoneKey: 'thigh',
    zoneLabel: 'Paha Depan & Belakang',
    allowedSides: ['RIGHT', 'LEFT'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Lonjakan beban impak lari tanpa asupan energi dan densitas tulang seimbang',
    suggestedTimeframe: '1-2 bulan lalu',
    suggestedLimitations: 'Nyeri dalam berdenyut di tengah paha yang memberat saat berjalan dan malam hari',
    trainingGuidance: {
      running: 'Dilarang keras berlari (suspensi penuh) sampai ada pencitraan radiologi (MRI) negatif cedera stres tulang.',
      cycling: 'Boleh sepeda statis resistensi rendah hanya jika bebas nyeri total.',
      crossTraining: 'Renang dan kardio bebas tumpuan beban (non-weight bearing).',
    },
    commonPathologies: ['Femoral shaft bone stress injury / stress fracture'],
  },
];
`,
  'utf8'
);

// 7. regions/knee.ts (Knee - comprehensive!)
fs.writeFileSync(
  path.join(regionsDir, 'knee.ts'),
`import { AnatomicalRegionMeta } from '../types';

export const KNEE_REGIONS: AnatomicalRegionMeta[] = [
  {
    id: 'knee_anterior',
    name: 'Lutut Anterior (Patellofemoral)',
    clinicalTerm: 'Patellofemoral Articulation & Retropatellar Cartilage',
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
    primaryMuscles: ['Vastus Medialis Oblique (VMO)', 'Quadriceps Tendon'],
    commonPathologies: ['Patellofemoral pain syndrome (PFPS)', 'Chondromalacia patellae'],
  },
  {
    id: 'patellar_tendon',
    name: 'Tendon Patella (Jumper\\'s Knee)',
    clinicalTerm: 'Patellar Tendon (Inferior Pole of Patella)',
    zoneKey: 'knee',
    zoneLabel: 'Sendi Lutut',
    allowedSides: ['BILATERAL', 'RIGHT', 'LEFT'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'MODERATE_TORQUE',
    suggestedMechanism: 'Beban lompatan atau deselerasi lari turunan berkecepatan tinggi',
    suggestedTimeframe: '1-2 bulan lalu',
    suggestedLimitations: 'Nyeri tekan tepat di bawah tempurung lutut saat awal mulai bergerak',
    trainingGuidance: {
      running: 'Lari turunan dan lompatan dilarang keras.',
      cycling: 'Gowes duduk santai irama ringan aman; hindari out-of-saddle climb bertorsi tinggi.',
      crossTraining: 'Protokol isometrik Spanish squat atau leg extension isometrik 45 detik.',
    },
    commonPathologies: ['Patellar tendinopathy'],
  },
  {
    id: 'knee_meniscus',
    name: 'Lutut Medial & Meniskus (Inner Knee)',
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
    commonPathologies: ['Medial meniscus tear / degenerate tear', 'MCL sprain (Grade I-II)'],
  },
  {
    id: 'knee_meniscus_lateral',
    name: 'Lutut Lateral & LCL (Outer Knee Joint)',
    clinicalTerm: 'Lateral Meniscus & Lateral Collateral Ligament (LCL)',
    zoneKey: 'knee',
    zoneLabel: 'Sendi Lutut',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'MODERATE_TORQUE',
    suggestedMechanism: 'Gaya varus lutut mendadak saat salah pijakan di jalur trail berbatu',
    suggestedTimeframe: '1-2 bulan lalu',
    suggestedLimitations: 'Nyeri di garis sendi luar lutut saat menumpu beban tubuh',
    trainingGuidance: {
      running: 'Lari off-road trail dihentikan total; evaluasi toleransi jalan datar.',
      cycling: 'Sepeda jalan datar mulus diperbolehkan dengan cleat floating memadai.',
      crossTraining: 'Latihan propriosepsi sendi lutut.',
    },
    commonPathologies: ['Lateral meniscus tear', 'LCL sprain'],
  },
  {
    id: 'pes_anserinus',
    name: 'Pes Anserinus (Lutut Bawah Bagian Dalam)',
    clinicalTerm: 'Pes Anserine Tendons (Sartorius, Gracilis, Semitendinosus) & Bursa',
    zoneKey: 'knee',
    zoneLabel: 'Sendi Lutut',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Gesekan berulang tendon medial pada tibia bagian atas akibat rotasi kaki berlebih',
    suggestedTimeframe: '3-6 minggu lalu',
    suggestedLimitations: 'Nyeri tekan 5 cm di bawah garis sendi lutut bagian dalam saat menaiki tangga',
    trainingGuidance: {
      running: 'Lari dihentikan jika timbul nyeri tekan tajam saat langkah kaki mendarat.',
      cycling: 'Sepeda santai jalan datar diizinkan; hindari kayuhan berat.',
      crossTraining: 'Peregangan adduktor dan hamstring medial lembut.',
    },
    commonPathologies: ['Pes anserine bursitis / tendinopathy'],
  },
  {
    id: 'knee_posterior_baker',
    name: 'Belakang Lutut & Baker\\'s Cyst',
    clinicalTerm: 'Popliteal Fossa & Gastrocnemius-Semimembranosus Bursa',
    zoneKey: 'knee',
    zoneLabel: 'Sendi Lutut',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'MODERATE_TORQUE',
    suggestedMechanism: 'Akumulasi cairan sinovial sendi lutut yang tertekan ke belakang lutut',
    suggestedTimeframe: '1-3 bulan lalu',
    suggestedLimitations: 'Rasa mengganjal tegang di lipatan belakang lutut saat ditekuk penuh',
    trainingGuidance: {
      running: 'Hindari lari cepat yang memicu efusi sendi lutut bertambah.',
      cycling: 'Sepeda santai dengan sudut sadel netral agar lutut tidak menekuk terlalu ekstrem.',
      crossTraining: 'Elevasi kaki dan kompres dingin pasca aktivitas.',
    },
    commonPathologies: ['Baker cyst (popliteal cyst)', 'Popliteus tendinopathy'],
  },
  {
    id: 'knee_hoffa',
    name: 'Bantalan Lemak Infrapatella (Hoffa\\'s Fat Pad)',
    clinicalTerm: 'Infrapatellar Fat Pad (Hoffa Disease) Impingement',
    zoneKey: 'knee',
    zoneLabel: 'Sendi Lutut',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Lutut hiperekstensi berulang yang menjepit bantalan lemak di bawah tempurung',
    suggestedTimeframe: '2-4 minggu lalu',
    suggestedLimitations: 'Nyeri tajam tepat di kedua sisi tendon patella saat meluruskan lutut penuh',
    trainingGuidance: {
      running: 'Hindari sepatu hak terlalu rendah (zero-drop) yang memicu hiperekstensi lutut.',
      cycling: 'Tinggikan posisi sadel sedikit agar lutut tidak mengunci lurus di titik bawah pedal.',
      crossTraining: 'Taping patella superior untuk mendekompresi fat pad.',
    },
    commonPathologies: ['Hoffa syndrome (fat pad impingement)'],
  },
];
`,
  'utf8'
);

// 8. regions/lowerLeg.ts
fs.writeFileSync(
  path.join(regionsDir, 'lowerLeg.ts'),
`import { AnatomicalRegionMeta } from '../types';

export const LOWER_LEG_REGIONS: AnatomicalRegionMeta[] = [
  {
    id: 'shin_splints',
    name: 'Tulang Kering (Shin Splints / MTSS)',
    clinicalTerm: 'Medial Tibial Stress Syndrome (MTSS - Posteromedial Border)',
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
    primaryMuscles: ['Tibialis Posterior', 'Soleus (fascial insertion)', 'Flexor Digitorum Longus'],
    commonPathologies: ['Medial tibial stress syndrome', 'Periostitis'],
  },
  {
    id: 'tibia_stress_fracture',
    name: 'Tulang Kering Anterior (Stress Fracture Risk)',
    clinicalTerm: 'Anterior Tibial Cortex Stress Fracture (High-Risk)',
    zoneKey: 'lower_leg',
    zoneLabel: 'Tungkai Bawah & Betis',
    allowedSides: ['RIGHT', 'LEFT'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Beban benturan lari kronis tanpa waktu jeda remodeling tulang cukup',
    suggestedTimeframe: '1-3 bulan lalu',
    suggestedLimitations: 'Nyeri fokal tajam pada satu titik spesifik di punggung depan tulang kering',
    trainingGuidance: {
      running: 'Dilarang total berlari (risiko fraktur komplit tinggi); wajib konsultasi ortopedi segera.',
      cycling: 'Hanya sepeda statis sangat ringan jika disetujui dokter penanggung jawab.',
      crossTraining: 'Latihan di kolam renang (deep-water running) bebas impak.',
    },
    commonPathologies: ['Anterior tibial cortex stress fracture (dreaded black line)'],
  },
  {
    id: 'calf',
    name: 'Otot Betis (Gastrocnemius)',
    clinicalTerm: 'Gastrocnemius Muscle (Medial / Lateral Belly)',
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
    primaryMuscles: ['Gastrocnemius Medial Head', 'Gastrocnemius Lateral Head'],
    commonPathologies: ['Tennis leg (medial gastrocnemius tear)', 'Calf strain'],
  },
  {
    id: 'calf_soleus',
    name: 'Otot Betis Dalam (Soleus)',
    clinicalTerm: 'Soleus Musculotendinous Complex (Deep Plantarflexor)',
    zoneKey: 'lower_leg',
    zoneLabel: 'Tungkai Bawah & Betis',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Kelelahan postur lari jarak jauh berkelanjutan (slow-twitch overload)',
    suggestedTimeframe: '3-6 minggu lalu',
    suggestedLimitations: 'Rasa pegal kencang mendalam di betis bawah yang memburuk setelah menit ke-30 lari',
    trainingGuidance: {
      running: 'Batasi durasi lari di bawah 30 menit; tingkatkan irama kadens langkah (175-180 spm).',
      cycling: 'Sepeda santai jalan datar sangat aman karena lutut dalam posisi tertekuk parsial.',
      crossTraining: 'Bent-knee calf raise (jinjit dengan lutut ditekuk) untuk mengisolasi kekuatan soleus.',
    },
    primaryMuscles: ['Soleus'],
    commonPathologies: ['Soleus strain', 'Deep calf compartment overload'],
  },
  {
    id: 'peroneal_muscles',
    name: 'Otot Peroneal / Sisi Luar Betis',
    clinicalTerm: 'Peroneus (Fibularis) Longus & Brevis Muscle Bellies',
    zoneKey: 'lower_leg',
    zoneLabel: 'Tungkai Bawah & Betis',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Kompensasi stabilitas pergelangan kaki lateral pasca cedera engkel',
    suggestedTimeframe: '1-3 bulan lalu',
    suggestedLimitations: 'Nyeri kencang di sepanjang sisi luar tulang betis bawah saat kaki berputar ke luar',
    trainingGuidance: {
      running: 'Hindari rute berbatu yang menuntut stabilisasi eversi berlebih.',
      cycling: 'Sepeda stabil aman dengan posisi cleat netral.',
      crossTraining: 'Latihan eversi kaki melawan tahanan resistance band karet.',
    },
    primaryMuscles: ['Fibularis Longus', 'Fibularis Brevis'],
    commonPathologies: ['Peroneal muscle strain / tendinopathy'],
  },
];
`,
  'utf8'
);

// 9. regions/ankleAchilles.ts (Comprehensive Ankle & Achilles!)
fs.writeFileSync(
  path.join(regionsDir, 'ankleAchilles.ts'),
`import { AnatomicalRegionMeta } from '../types';

export const ANKLE_ACHILLES_REGIONS: AnatomicalRegionMeta[] = [
  {
    id: 'ankle_atfl',
    name: 'Right Ankle Lateral (ATFL / CFL)',
    clinicalTerm: 'Anterior Talofibular Ligament (ATFL) & Calcaneofibular Ligament (CFL)',
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
    primaryMuscles: ['Fibularis Brevis/Longus', 'Extensor Digitorum Brevis'],
    commonPathologies: ['Lateral ankle sprain (Grade II-III)', 'Chronic ankle instability (CAI)'],
  },
  {
    id: 'ankle_syndesmosis',
    name: 'Engkel Atas (High Ankle / Syndesmosis)',
    clinicalTerm: 'Distal Tibiofibular Syndesmosis (AITFL & PITFL)',
    zoneKey: 'ankle_achilles',
    zoneLabel: 'Pergelangan Kaki & Tumit',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'MODERATE_TORQUE',
    suggestedMechanism: 'Rotasi eksternal kaki paksa dengan dorsofleksi saat tersandung akar/batu',
    suggestedTimeframe: '1-3 bulan lalu',
    suggestedLimitations: 'Nyeri saat pergelangan kaki ditekuk ke atas maksimal atau saat memutar badan',
    trainingGuidance: {
      running: 'Lari dilarang keras sampai tes squeeze test dan dorsiflexion lunge bebas nyeri.',
      cycling: 'Sepeda jalan datar diperbolehkan jika tidak ada torsi rotasi pada mata kaki.',
      crossTraining: 'Latihan penguatan pergelangan kaki dalam garis lurus tanpa gerakan memutar.',
    },
    commonPathologies: ['Syndesmotic sprain (High ankle sprain)'],
  },
  {
    id: 'ankle_deltoid',
    name: 'Engkel Bagian Dalam (Deltoid Ligament)',
    clinicalTerm: 'Deltoid Ligament Complex (Medial Malleolar Collateral)',
    zoneKey: 'ankle_achilles',
    zoneLabel: 'Pergelangan Kaki & Tumit',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Eversi pergelangan kaki berlebih saat terpeleset ke arah luar',
    suggestedTimeframe: '1-3 bulan lalu',
    suggestedLimitations: 'Nyeri tekan tepat di bawah mata kaki bagian dalam saat menumpu berat tubuh',
    trainingGuidance: {
      running: 'Hindari lari lintasan miring dan permukaan licin.',
      cycling: 'Sepeda santai irama stabil aman.',
      crossTraining: 'Penguatan tibialis posterior dan latihan lengkungan kaki.',
    },
    commonPathologies: ['Medial ankle sprain', 'Deltoid ligament tear'],
  },
  {
    id: 'achilles',
    name: 'Tendon Achilles Mid-Portion',
    clinicalTerm: 'Mid-portion Achilles Tendinopathy (2-6 cm above calcaneus)',
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
    primaryMuscles: ['Gastrocnemius', 'Soleus'],
    commonPathologies: ['Mid-portion Achilles tendinopathy', 'Achilles paratenonitis'],
  },
  {
    id: 'achilles_insertional',
    name: 'Insersi Achilles & Haglund',
    clinicalTerm: 'Insertional Achilles Tendinopathy & Retrocalcaneal Bursitis',
    zoneKey: 'ankle_achilles',
    zoneLabel: 'Pergelangan Kaki & Tumit',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Tekanan keras dari heel counter sepatu lari pada tonjolan tulang tumit (Haglund)',
    suggestedTimeframe: '2-4 bulan lalu',
    suggestedLimitations: 'Nyeri tajam saat tumit tertekan bagian belakang sepatu atau saat dorsifleksi penuh',
    trainingGuidance: {
      running: 'Gunakan sepatu dengan heel counter lunak atau open-back; hindari lari tanjakan curam.',
      cycling: 'Sepeda menggunakan sepatu sepeda yang tidak menekan tonjolan tumit belakang.',
      crossTraining: 'Latihan isometrik calf raise pada permukaan datar (jangan di ujung anak tangga).',
    },
    commonPathologies: ['Insertional Achilles tendinopathy', 'Retrocalcaneal bursitis', 'Haglund deformity'],
  },
  {
    id: 'posterior_tibial_tendon',
    name: 'Tendon Tibialis Posterior (PTTD)',
    clinicalTerm: 'Posterior Tibial Tendon Dysfunction (PTTD & Medial Arch)',
    zoneKey: 'ankle_achilles',
    zoneLabel: 'Pergelangan Kaki & Tumit',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Kelelahan tendon penopang lengkungan kaki saat lari dengan overpronasi berat',
    suggestedTimeframe: '1-3 bulan lalu',
    suggestedLimitations: 'Nyeri di belakang mata kaki dalam menjalar ke telapak kaki dan lengkung kaki rata',
    trainingGuidance: {
      running: 'Gunakan insole penyangga lengkung (arch support) atau sepatu stabilitas; hindari lari jarak jauh.',
      cycling: 'Sepeda aman jika insole sepeda menopang lengkungan medial kaki dengan pas.',
      crossTraining: 'Latihan penguatan tibialis posterior (inversi kaki dengan beban perban resistensi).',
    },
    commonPathologies: ['Posterior tibial tendon dysfunction (PTTD Stage I-II)'],
  },
];
`,
  'utf8'
);

// 10. regions/footPlantar.ts (Comprehensive Foot & Plantar!)
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
    commonPathologies: ['Plantar fasciitis', 'Calcaneal spur syndrome'],
  },
  {
    id: 'heel_fat_pad',
    name: 'Bantalan Tumit (Heel Fat Pad)',
    clinicalTerm: 'Calcaneal Fat Pad Atrophy / Contusion',
    zoneKey: 'foot_plantar',
    zoneLabel: 'Telapak Kaki & Jari',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Hentakan mendarat tumit (hard heel strike) pada permukaan batu atau aspal tanpa bantalan',
    suggestedTimeframe: '2-4 minggu lalu',
    suggestedLimitations: 'Nyeri tumpul tepat di tengah bantalan tumit saat berjalan tanpa alas kaki di lantai keras',
    trainingGuidance: {
      running: 'Hentikan lari barefoot / sepatu tipis; gunakan sepatu dengan heel cup gel tebal.',
      cycling: 'Sepeda aman total karena tumpuan pedal berada di bola kaki depan.',
      crossTraining: 'Taping tumit metode basket-weave untuk merapatkan jaringan lemak bantalan.',
    },
    commonPathologies: ['Heel fat pad syndrome / contusion'],
  },
  {
    id: 'metatarsal',
    name: 'Telapak Kaki Depan (Metatarsal)',
    clinicalTerm: 'Metatarsalgia / Metatarsal Shafts (2nd-3rd)',
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
    commonPathologies: ['Metatarsalgia', 'Metatarsal stress fracture (March fracture)'],
  },
  {
    id: 'morton_neuroma',
    name: 'Morton\\'s Neuroma (Saraf Antar Jari)',
    clinicalTerm: 'Intermetatarsal Neuroma (3rd-4th Web Space)',
    zoneKey: 'foot_plantar',
    zoneLabel: 'Telapak Kaki & Jari',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'MODERATE_TORQUE',
    suggestedMechanism: 'Sepatu sepeda atau sepatu lari yang terlalu sempit menjepit saraf digital intermetatarsal',
    suggestedTimeframe: '1-3 bulan lalu',
    suggestedLimitations: 'Sensasi rasa terbakar, kesemutan, atau rasa seperti kaus kaki terlipat di bawah jari',
    trainingGuidance: {
      running: 'Ganti sepatu dengan model wide-fit; gunakan metatarsal pad untuk melebarkan celah tulang.',
      cycling: 'Kendurkan strap depan sepatu sepeda atau gunakan sepatu sepeda berukuran lebar (HV/Wide).',
      crossTraining: 'Pelepasan kompresi saraf dan mobilisasi metatarsal.',
    },
    commonPathologies: ['Morton neuroma'],
  },
  {
    id: 'first_mtp_hallux',
    name: 'Pangkal Jempol Kaki (1st MTP & Bunion)',
    clinicalTerm: '1st Metatarsophalangeal Joint, Hallux Valgus & Sesamoids',
    zoneKey: 'foot_plantar',
    zoneLabel: 'Telapak Kaki & Jari',
    allowedSides: ['RIGHT', 'LEFT', 'BILATERAL'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Beban dorongan tolakan jari (push-off) berulang pada sendi jempol yang bengkok',
    suggestedTimeframe: '2-6 bulan lalu',
    suggestedLimitations: 'Kaku dan nyeri saat jempol ditekuk ke atas maksimal saat melangkah',
    trainingGuidance: {
      running: 'Gunakan sepatu lari sol kaku tipe rocker-bottom untuk mengurangi tuntutan fleksi jempol.',
      cycling: 'Sepeda menggunakan sepatu sol karbon kaku sangat nyaman dan membebaskan jempol dari tekukan.',
      crossTraining: 'Latihan penguatan abductor hallucis dan pemisahan jari kaki.',
    },
    commonPathologies: ['Hallux rigidus / limitus', 'Sesamoiditis', 'Bunion / Hallux valgus irritation'],
  },
  {
    id: 'navicular_midfoot',
    name: 'Tulang Punggung Kaki (Navicular & Lisfranc)',
    clinicalTerm: 'Tarsal Navicular & Lisfranc Tarsometatarsal Joint',
    zoneKey: 'foot_plantar',
    zoneLabel: 'Telapak Kaki & Jari',
    allowedSides: ['RIGHT', 'LEFT'],
    defaultSide: 'RIGHT',
    isLowerExtremity: true,
    isAxial: false,
    isUpperExtremity: false,
    runningImpactSeverity: 'HIGH_RISK',
    cyclingImpactSeverity: 'SAFE_FLAT',
    suggestedMechanism: 'Beban impak lari intensitas tinggi pada titik puncak lengkungan kaki (high-risk bone zone)',
    suggestedTimeframe: '1-3 bulan lalu',
    suggestedLimitations: 'Nyeri fokal pada puncak punggung kaki bagian dalam saat melangkah',
    trainingGuidance: {
      running: 'Dilarang keras berlari (wajib pemeriksaan MRI ortopedi untuk mengecualikan fraktur stres navikular).',
      cycling: 'Boleh sepeda statis ringan dengan sol kaku hanya jika tidak ada sensasi nyeri berdenyut.',
      crossTraining: 'Latihan di dalam kolam air (aqua jogging) tanpa sentuhan lantai dasar.',
    },
    commonPathologies: ['Tarsal navicular stress fracture (high-risk)', 'Lisfranc joint sprain'],
  },
];
`,
  'utf8'
);

// 11. Write regions/index.ts (combine all 9 regions)
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

// 12. Write resolver.ts with extensive semantic keyword matching
fs.writeFileSync(
  path.join(anatomyDir, 'resolver.ts'),
`import { AnatomicalRegionMeta } from './types';
import { ANATOMICAL_REGIONS } from './regions';

/**
 * Resolve any body region string to an authoritative AnatomicalRegionMeta object.
 * Maps medical terms, everyday slang, Indonesian & English terms, and sports idioms.
 */
export function getAnatomicalRegion(query: string): AnatomicalRegionMeta {
  const q = (query || '').toLowerCase().trim();

  // 1. Direct ID, name, or clinicalTerm match
  const directMatch = ANATOMICAL_REGIONS.find(
    (r) =>
      r.id.toLowerCase() === q ||
      r.name.toLowerCase() === q ||
      r.clinicalTerm.toLowerCase() === q
  );
  if (directMatch) return directMatch;

  // 2. Ankle & Achilles
  if (q.includes('syndesmosis') || q.includes('high ankle')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'ankle_syndesmosis')!;
  }
  if (q.includes('deltoid') || (q.includes('mata kaki') && q.includes('dalam'))) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'ankle_deltoid')!;
  }
  if (q.includes('pttd') || q.includes('tibialis posterior')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'posterior_tibial_tendon')!;
  }
  if (q.includes('haglund') || (q.includes('achilles') && (q.includes('insersi') || q.includes('tumit')))) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'achilles_insertional') || ANATOMICAL_REGIONS.find((r) => r.id === 'achilles')!;
  }
  if (q.includes('achilles') || q.includes('tumit belakang')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'achilles')!;
  }
  if (q.includes('ankle') || q.includes('engkel') || q.includes('pergelangan kaki') || q.includes('atfl') || q.includes('cfl')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'ankle_atfl')!;
  }

  // 3. Knee
  if (q.includes('patellar') || q.includes('jumper') || q.includes('tendon patella')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'patellar_tendon')!;
  }
  if (q.includes('pes anserin') || q.includes('anserinus') || (q.includes('lutut') && q.includes('bawah') && q.includes('dalam'))) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'pes_anserinus')!;
  }
  if (q.includes('baker') || q.includes('popliteal') || (q.includes('belakang') && q.includes('lutut'))) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'knee_posterior_baker')!;
  }
  if (q.includes('hoffa') || q.includes('fat pad') || q.includes('bantalan lemak')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'knee_hoffa')!;
  }
  if (q.includes('lcl') || (q.includes('lutut') && q.includes('luar') && !q.includes('itb'))) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'knee_meniscus_lateral')!;
  }
  if (q.includes('meniskus') || q.includes('meniscus') || q.includes('mcl') || (q.includes('lutut') && q.includes('dalam'))) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'knee_meniscus')!;
  }
  if (q.includes('knee') || q.includes('lutut') || q.includes('patell') || q.includes('tempurung')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'knee_anterior')!;
  }

  // 4. Lower Leg & Calf
  if (q.includes('tibia stress') || (q.includes('tulang kering') && q.includes('fraktur'))) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'tibia_stress_fracture')!;
  }
  if (q.includes('shin') || q.includes('tulang kering') || q.includes('mtss')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'shin_splints')!;
  }
  if (q.includes('soleus') || (q.includes('betis') && q.includes('dalam'))) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'calf_soleus')!;
  }
  if (q.includes('peroneal') || q.includes('fibularis')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'peroneal_muscles')!;
  }
  if (q.includes('calf') || q.includes('betis') || q.includes('gastrocnemius')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'calf')!;
  }

  // 5. Thigh
  if (q.includes('itb') || q.includes('iliotibial') || q.includes('tfl')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'itb')!;
  }
  if (q.includes('hamstring') || q.includes('paha belakang')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'hamstring')!;
  }
  if (q.includes('quad') || q.includes('paha depan') || q.includes('vmo')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'quadriceps')!;
  }
  if (q.includes('femur') || q.includes('tulang paha')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'femur_bone')!;
  }

  // 6. Pelvis & Hip
  if (q.includes('gtps') || q.includes('trochanter') || (q.includes('pinggul') && q.includes('luar'))) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'trochanteric_bursa')!;
  }
  if (q.includes('piriformis') || (q.includes('bokong') && q.includes('skiatika'))) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'gluteal_piriformis')!;
  }
  if (q.includes('sit bone') || q.includes('tulang duduk') || q.includes('ischial')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'ischial_tuberosity')!;
  }
  if (q.includes('psoas') || q.includes('iliopsoas') || q.includes('hip flexor')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'hip_flexor_psoas')!;
  }
  if (q.includes('groin') || q.includes('selangkangan') || q.includes('adductor')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'groin')!;
  }
  if (q.includes('hip') || q.includes('pinggul') || q.includes('panggul') || q.includes('labrum')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'hip_joint')!;
  }

  // 7. Spine & Axial
  if (q.includes('si joint') || q.includes('sakroiliaka') || q.includes('sacroiliac')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'sacroiliac_joint')!;
  }
  if (q.includes('saddle sore') || q.includes('perineal') || q.includes('perineum') || q.includes('pudendal')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'perineum_pudendal')!;
  }
  if (q.includes('lower back') || q.includes('pinggang') || q.includes('lumbar') || q.includes('punggung bawah') || q.includes('l4') || q.includes('l5')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'lower_back')!;
  }
  if (q.includes('upper back') || q.includes('punggung atas') || q.includes('thoracic')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'upper_back')!;
  }
  if (q.includes('rib') || q.includes('rusuk') || q.includes('costochondritis') || q.includes('dada')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'chest_ribs')!;
  }
  if (q.includes('core') || q.includes('abdomen') || q.includes('perut')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'core_abdomen')!;
  }

  // 8. Foot & Plantar
  if (q.includes('heel fat pad') || (q.includes('bantalan') && q.includes('tumit'))) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'heel_fat_pad')!;
  }
  if (q.includes('morton') || q.includes('neuroma')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'morton_neuroma')!;
  }
  if (q.includes('bunion') || q.includes('hallux') || q.includes('jempol kaki') || q.includes('sesamoid')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'first_mtp_hallux')!;
  }
  if (q.includes('navicular') || q.includes('lisfranc') || q.includes('punggung kaki')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'navicular_midfoot')!;
  }
  if (q.includes('plantar') || q.includes('telapak kaki') || q.includes('fascia')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'plantar_fascia')!;
  }
  if (q.includes('metatarsal') || q.includes('jari kaki') || q.includes('forefoot')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'metatarsal')!;
  }

  // 9. Upper Limb & Head
  if (q.includes('ac joint') || q.includes('klavikula') || q.includes('clavicle')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'ac_joint')!;
  }
  if (q.includes('scapula') || q.includes('belikat') || q.includes('rhomboid')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'scapula')!;
  }
  if (q.includes('shoulder') || q.includes('bahu') || q.includes('rotator')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'shoulder')!;
  }
  if (q.includes('de quervain') || q.includes('ibu jari') || q.includes('thumb')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'thumb_dequervain')!;
  }
  if (q.includes('wrist') || q.includes('pergelangan tangan') || q.includes('carpal') || q.includes('tfcc')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'wrist_hand')!;
  }
  if (q.includes('elbow') || q.includes('siku')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'elbow')!;
  }
  if (q.includes('forearm') || q.includes('lengan bawah') || q.includes('arm pump')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'forearm')!;
  }
  if (q.includes('tmj') || q.includes('rahang') || q.includes('masseter')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'tmj_jaw')!;
  }
  if (q.includes('neck') || q.includes('leher') || q.includes('cervical')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'neck')!;
  }
  if (q.includes('head') || q.includes('kepala') || q.includes('concussion')) {
    return ANATOMICAL_REGIONS.find((r) => r.id === 'head')!;
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

console.log('Anatomy expanded to 45+ comprehensive sports medicine regions successfully!');

