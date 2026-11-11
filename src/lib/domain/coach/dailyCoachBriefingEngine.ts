import {
  AuthoritativeAthleteHealthContext,
  DailyCoachBriefing,
  PMCResponse,
  ScheduledWorkout,
} from '@/types';

export function generateDailyCoachBriefing(
  pmc: PMCResponse | null,
  healthContext: AuthoritativeAthleteHealthContext | null,
  todayWorkout?: ScheduledWorkout | null,
  now: Date = new Date()
): DailyCoachBriefing {
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, 4 = Thu
  const isFastingDay = dayOfWeek === 1 || dayOfWeek === 4;

  const tsb = pmc?.current_tsb ?? 0;
  const ctl = pmc?.current_ctl ?? 0;
  const atl = pmc?.current_atl ?? 0;

  const hasActiveInjury = (healthContext?.injuries || []).some(
    (i) => i.current_status === 'ACTIVE_SYMPTOMATIC' || i.current_status === 'RECURRENT'
  );

  const maxRecentPain = Math.max(
    0,
    ...(healthContext?.recentPainLogs || []).map((p) => p.pain_score || 0),
    ...(healthContext?.recentResponses || []).map((r) =>
      Math.max(r.pain_during_activity || 0, r.pain_after_activity || 0)
    )
  );

  const hasSwelling =
    (healthContext?.recentPainLogs || []).some((p) => p.swelling_present) ||
    (healthContext?.recentResponses || []).some((r) => r.swelling_observed);

  // Time-aware greeting
  const hour = now.getHours();
  const timeGreeting =
    hour < 11
      ? 'Selamat Pagi'
      : hour < 15
        ? 'Selamat Siang'
        : hour < 18
          ? 'Selamat Sore'
          : 'Selamat Malam';

  // 1. Clinical Circuit Breaker (Highest Priority)
  if (hasSwelling || maxRecentPain >= 4) {
    return {
      greeting: `${timeGreeting}, Atlet!`,
      todayStatus: '🚨 SAFETY INTERVENTION: PROTOKOL PROTEKSI AKTIF',
      badgeTone: 'critical',
      recommendationHeadline: 'Latihan Intensitas Ditunda Sementara Demi Proteksi Jaringan Sendi',
      recommendedAction: `Terdeteksi ${hasSwelling ? 'pembengkakan sendi' : ''} ${hasSwelling && maxRecentPain >= 4 ? 'dan ' : ''}${maxRecentPain >= 4 ? `nyeri skala ${maxRecentPain}/10` : ''}. Beban mekanis hari ini dinonaktifkan. Fokuskan hari ini pada pemulihan jaringan lunak dan kompres es 15–20 menit.`,
      tacticalInstructions: {
        nutritionalStrategy: 'Prioritaskan hidrasi optimal, asupan protein pemulihan (1.6-2.0g/kgBB), dan makanan anti-inflamasi alami.',
        cadenceBiomechanicalTarget: 'Beban impak nol. Hindari berjalan jauh atau menopang beban berat pada kaki kanan.',
        safetyRedFlags: 'Segera hubungi fisioterapis jika pembengkakan tidak mereda dalam 48 jam.',
      },
      fastingAwareness: isFastingDay
        ? {
            isFastingDay: true,
            guideline: 'Hari puasa terdeteksi: Sangat tepat untuk autofagi seluler dan istirahat metabolik penuh.',
          }
        : undefined,
      pmcSnapshot: { ctl, atl, tsb, zoneName: 'HIGH_RISK_PROTECTION' },
    };
  }

  // 2. High Fatigue / Overreaching (TSB < -25)
  if (tsb < -25) {
    return {
      greeting: `${timeGreeting}, Atlet!`,
      todayStatus: '⚠️ AUTO-REGULASI: DELOAD & ACTIVE RECOVERY',
      badgeTone: 'warning',
      recommendationHeadline: 'Akumulasi Kelelahan Akut Terlalu Tinggi (TSB: ' + tsb + ')',
      recommendedAction: 'Kelelahan jangka pendek (ATL) melampaui fondasi kebugaran Anda. Pelatih merekomendasikan memotong durasi sesi hari ini sebesar 40-50% atau beralih ke putaran pedal sangat ringan (Zone 1 Active Recovery <= 40 menit).',
      tacticalInstructions: {
        nutritionalStrategy: 'Tingkatkan asupan karbohidrat kompleks untuk mengisi ulang glikogen otot yang terkuras.',
        cadenceBiomechanicalTarget: 'Gunakan gigi paling ringan di jalur datar dengan kadens lancar 90+ RPM tanpa beban torsi.',
        safetyRedFlags: 'Hentikan sesi seketika jika detak jantung lambat merespons atau otot terasa kram.',
      },
      fastingAwareness: isFastingDay
        ? {
            isFastingDay: true,
            guideline: 'Hari puasa: Batasi latihan fisik ke mobilitas ringan atau tunda hingga setelah berbuka puasa.',
          }
        : undefined,
      pmcSnapshot: { ctl, atl, tsb, zoneName: 'HIGH_FATIGUE_OVERREACHING' },
    };
  }

  // 3. Fasting Day Protocol (Monday / Thursday with normal TSB)
  if (isFastingDay) {
    return {
      greeting: `${timeGreeting}, Atlet!`,
      todayStatus: '🌙 DISIPLIN HARI PUASA: BEBAN METABOLIK TERKONTROL',
      badgeTone: 'info',
      recommendationHeadline: 'Kalibrasi Sesi Rendah Intensitas (Zone 1–2, <= 45 Menit)',
      recommendedAction: 'Hari puasa adalah waktu emas untuk meningkatkan efisiensi oksidasi lemak (Zone 2), namun cadangan glikogen terbatas. Pelatih membatasi sesi latihan maksimal 45 menit sebelum berbuka atau 1 jam setelah hidrasi cukup pasca-buka.',
      tacticalInstructions: {
        nutritionalStrategy: 'Saat berbuka: utamakan air elektrolit dan 30-50g karbohidrat cepat serap sebelum makan berat.',
        cadenceBiomechanicalTarget: 'Pertahankan kayuhan halus konstan. Hindari lonjakan sprint atau tanjakan curam.',
        safetyRedFlags: 'Waspada pusing/hipoglikemia. Hentikan jika pandangan kabur atau detak jantung melompat tiba-tiba.',
      },
      fastingAwareness: {
        isFastingDay: true,
        guideline: 'Jadwal puasa aktif. Periodisasi otomatis menempatkan sesi volume berat di akhir pekan.',
      },
      pmcSnapshot: { ctl, atl, tsb, zoneName: pmc?.current_zone || 'OPTIMAL_OVERLOAD' },
    };
  }

  // 4. Optimal Training / Prime Day
  const workoutTitle = todayWorkout?.description || todayWorkout?.workout_category || 'Sesi Aerobik Mandiri';
  const isCenturyFocus = workoutTitle.toLowerCase().includes('ride') || workoutTitle.toLowerCase().includes('sepeda');

  return {
    greeting: `${timeGreeting}, Atlet!`,
    todayStatus: '🟢 KONDISI FISIK PRIMA: SIAP EKSEKUSI TERCATAT',
    badgeTone: 'positive',
    recommendationHeadline: `Fokus Hari Ini: ${workoutTitle} (${pmc?.current_zone === 'PEAK_RACE_FORM' ? 'Peak Freshness' : 'Beban Terukur'})`,
    recommendedAction: `Profil kebugaran Anda berada di rentang optimal (TSB: ${tsb}, CTL: ${ctl}). Sendi engkel dan tempurung lutut dalam ambang toleransi aman. Eksekusi sesi dengan disiplin zona kardiovaskular.`,
    tacticalInstructions: {
      nutritionalStrategy: isCenturyFocus
        ? 'Siapkan 40–60g karbohidrat per jam pada sesi > 75 menit. Konsumsi 500ml air berisotonik per jam.'
        : 'Pastikan hidrasi cukup 30 menit sebelum memulai sesi.',
      cadenceBiomechanicalTarget: 'Pertahankan kadens stabil >= 85 RPM pada rute datar untuk menjaga kelancaran sirkulasi.',
      safetyRedFlags: 'Laporkan sensasi tidak biasa pada check-in pasca latihan untuk evaluasi pelatih.',
    },
    pmcSnapshot: { ctl, atl, tsb, zoneName: pmc?.current_zone || 'OPTIMAL_OVERLOAD' },
  };
}
