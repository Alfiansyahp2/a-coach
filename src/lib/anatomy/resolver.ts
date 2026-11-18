import { AnatomicalRegionMeta } from './types';
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
    id: q.replace(/\s+/g, '_'),
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
