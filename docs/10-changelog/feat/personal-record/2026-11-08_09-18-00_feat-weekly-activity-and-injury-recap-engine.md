# Changelog: Weekly Activity & Injury Recapitulation Engine and REST API Endpoint (`feat/personal-record`)

- **Tanggal & Waktu**: 2026-11-08 09:18:00 WIB
- **Tipe**: `feat(analytics)` / `feat(health)` / `feat(api)` / `feat(domain)`
- **Commit Message Rujukan**: `feat(analytics): implement deterministic weekly activity and injury recap engine and rest endpoint`
- **Branch**: `feat/personal-record`
- **Lokasi**: `docs/10-changelog/feat/personal-record/2026-11-08_09-18-00_feat-weekly-activity-and-injury-recap-engine.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Berdasarkan audit arsitektur dan kebutuhan pemantauan performa atletik pada platform *Endurance Performance Lab*:

1. **Fragmentasi Data Beban Latihan vs Keluhan Biomekanis**:
   - Sebelumnya, data volume mingguan dan data kesehatan atlet tersimpan dan diolah secara terpisah. Modul analitik [`volumeBucketer.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/volumeBucketer.ts) hanya menghitung akumulasi jarak kilometer murni tanpa konteks kesehatan, sementara repositori cidera ([`injuryRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/health/injuryRepo.ts)) dan log nyeri ([`painLogRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/health/painLogRepo.ts)) hanya mencatat keluhan statis tanpa korelasi langsung terhadap beban kerja fisik (*workload telemetry*) yang dijalani atlet pada minggu tersebut.
2. **Ketiadaan Pembedaan Cidera Baru vs Cidera yang Sedang Dimonitor**:
   - Sistem belum memiliki mekanisme deterministik untuk mengidentifikasi cidera baru yang diperoleh/dilaporkan pada minggu berjalan (*incident/acquired injuries*) vs cidera aktif kronis yang sedang dalam masa rehabilitasi/pemantauan (*ongoing monitored injuries*). Hal ini penting untuk mengevaluasi apakah program latihan memicu trauma baru atau menjaga stabilitas cedera lama.
3. **Kebutuhan Endpoint Terpadu (*Single Source of Truth*) untuk Konsumsi UI & AI Coach**:
   - Halaman antarmuka atlet dan agen AI Coach membutuhkan satu representasi data atomik mingguan untuk menganalisis adaptasi biologis atlet tanpa harus mengeksekusi 5 query paralel di sisi frontend.

Pembaruan ini menghadirkan modul domain murni [`weeklyRecapEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/weeklyRecapEngine.ts), dekomposisi sub-modul terstruktur (<300 baris), korelasi klinis beban vs respon sendi, rute REST API baru [`GET /api/athlete/weekly-recap`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/weekly-recap/route.ts), serta suite pengujian otomatis 10/10 test terverifikasi.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Kontrak Antarmuka & Tipe Data Domain (`src/lib/domain/analytics/weeklyRecapTypes.ts`)

Mendefinisikan tipe data canonical TypeScript untuk rekapitulasi mingguan:
```typescript
export interface WeeklyActivityAndInjuryRecap {
  timeframe: WeeklyRecapTimeframe;
  activity_summary: WeeklyActivityRecap;
  injury_summary: WeeklyInjuryRecap;
  clinical_verdict: WeeklyClinicalVerdict;
}
```
- **`WeeklyActivityRecap`**: Menyajikan `total_sessions`, `total_distance_km`, `total_duration_seconds`, `formatted_duration`, `total_elevation_gain_meters`, `total_calories`, `sport_breakdown` (Lari vs Sepeda dengan pace atau km/h), `daily_breakdown` 7 hari, dan persentase kepatuhan jadwal (*compliance rate*).
- **`WeeklyInjuryRecap`**: Memisahkan `new_injuries` (cidera diperoleh minggu ini) dari `active_monitored_injuries`, dilengkapi `pain_telemetry` (skor rata-rata, puncak nyeri, pembengkakan, instabilitas) dan `training_responses_summary` (RPE rata-rata, sesi bebas nyeri, tingkat kelelahan).
- **`WeeklyClinicalVerdict`**: Memberikan status keselamatan (`OPTIMAL`, `CAUTION`, `RESTRICTED`, `SUSPENDED`), narasi korelasi beban vs sendi, serta panduan spesifik cabang lari dan sepeda.

---

### B. Modul Agregasi Telemetri Aktivitas Mingguan (`src/lib/domain/analytics/weeklyRecapActivity.ts`)

Mengagregasi sesi latihan yang berlangsung dalam batas minggu kalender ISO (Senin 00:00:00 hingga Minggu 23:59:59):
```typescript
export function aggregateWeeklyActivities(
  activities: Activity[],
  start: Date,
  end: Date,
  scheduledWorkouts: ScheduledWorkout[] = []
): WeeklyActivityRecap {
  // 1. Filter sesi yang jatuh pada jendela waktu start - end
  // 2. Petakan ke dalam array 7 hari (Senin s/d Minggu)
  // 3. Hitung metrik per cabang olahraga (Run, Ride, dll.)
  // 4. Hitung kepatuhan jadwal latihan (scheduled vs completed)
}
```
- **Fitur Khusus**:
  - Mendukung input tanggal fleksibel (objek `Date` maupun string ISO).
  - Mengonversi kecepatan lari rata-rata menjadi format pace standar keolahragaan (`speedMpsToPace` $\to$ `05:30 /km`).
  - Menghitung persentase kontribusi volume per cabang terhadap total beban minggu berjalan.

---

### C. Modul Rekapitulasi Cidera & Korelasi Klinis (`src/lib/domain/analytics/weeklyRecapInjury.ts`)

Menjalankan pemrosesan klinis terhadap data kesehatan dan respon tubuh atlet:
```typescript
export function aggregateWeeklyInjuries(
  injuries: AthleteInjury[],
  painLogs: AthletePainLog[],
  trainingResponses: AthleteTrainingResponse[],
  start: Date,
  end: Date
): WeeklyInjuryRecap {
  // 1. Identifikasi cidera baru berdasarkan created_at atau estimated_injury_date
  // 2. Filter cidera aktif yang belum sembuh (current_status !== 'RESOLVED')
  // 3. Agregasi telemetri nyeri mingguan (rata-rata, puncak, pembengkakan)
  // 4. Agregasi respon check-in pasca latihan (RPE, sesi bebas nyeri, fatigue)
}
```
- **Logika Keputusan Klinis (`evaluateWeeklyClinicalCorrelation`)**:
  - **`SUSPENDED` (Circuit Breaker)**: Terpicu jika terdeteksi pembengkakan akut (*swelling*), instabilitas sendi (*joint instability*), atau nyeri puncak $\ge 6/10$. Memberikan rekomendasi protokol RICE dan penghentian pembebanan impak.
  - **`CAUTION` (Protokol Perlindungan Sendi)**: Terpicu jika terdapat riwayat cidera aktif ekstremitas bawah (misal engkel/lutut) tanpa tanda bahaya akut. Menetapkan status lari **Ditunda (*On Hold*)** untuk mencegah mikrotrauma impak, namun mengizinkan **Bersepeda Zona 2** (tertutup dan berbeban rendah).
  - **`OPTIMAL`**: Diberikan jika seluruh aktivitas ditoleransi dengan sempurna tanpa keluhan nyeri dan tanpa riwayat cidera aktif.

---

### D. Orkestrator Domain & Perhitungan Batas Minggu (`src/lib/domain/analytics/weeklyRecapEngine.ts`)

Mengorkestrasi seluruh komponen analitik dalam satu fungsi domain murni yang ringkas:
```typescript
export function getWeekBounds(referenceDate?: Date | string): { start: Date; end: Date } {
  // Mengonversi input ke siang hari lokal untuk mencegah pergeseran zona waktu UTC
  // Menghitung hari Senin 00:00:00 s/d Minggu 23:59:59 secara deterministik
}

export function computeWeeklyActivityAndInjuryRecap(
  params: ComputeWeeklyRecapParams
): WeeklyActivityAndInjuryRecap {
  // 1. Tentukan batas minggu
  // 2. Agregasi aktivitas (aggregateWeeklyActivities)
  // 3. Agregasi cidera & nyeri (aggregateWeeklyInjuries)
  // 4. Evaluasi korelasi klinis (evaluateWeeklyClinicalCorrelation)
}
```

---

### E. Rute REST API Terpadu (`src/app/api/athlete/weekly-recap/route.ts`)

Membuka endpoint HTTP yang mendukung rendering dinamis di Next.js 16 (Turbopack + Partial Prerendering):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connection } from 'next/server';
import { DEFAULT_USER_ID } from '@/lib/db/client';
import { getActivities } from '@/lib/db/activityRepo';
import { getAthleteInjuries, getAthletePainLogs, getAthleteTrainingResponses } from '@/lib/db/healthRepo';
import { getScheduledWorkouts } from '@/lib/db/trainingRepo';
import { computeWeeklyActivityAndInjuryRecap } from '@/lib/domain/analytics/weeklyRecapEngine';

export async function GET(req: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date') || undefined;
    const userId = searchParams.get('user_id') || DEFAULT_USER_ID;

    const [activities, injuries, painLogs, trainingResponses, scheduledWorkouts] =
      await Promise.all([
        getActivities(userId),
        getAthleteInjuries(userId),
        getAthletePainLogs(userId, 50),
        getAthleteTrainingResponses(userId, 50),
        getScheduledWorkouts(userId),
      ]);

    const recap = computeWeeklyActivityAndInjuryRecap({
      activities,
      injuries,
      painLogs,
      trainingResponses,
      scheduledWorkouts,
      referenceDate: dateParam,
    });

    return NextResponse.json({ success: true, recap });
  } catch (error: any) {
    ...
  }
}
```

---

## 3. Matriks Perbandingan Git Diff

| Berkas Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/lib/domain/analytics/weeklyRecapTypes.ts` | Baru | +141 | 0 | Kontrak antarmuka TypeScript untuk rekap aktivitas, cidera, dan korelasi klinis |
| `src/lib/domain/analytics/weeklyRecapActivity.ts` | Baru | +159 | 0 | Agregasi volume mingguan, pace lari, speed sepeda, breakdown harian 7 hari |
| `src/lib/domain/analytics/weeklyRecapInjury.ts` | Baru | +241 | 0 | Filter cidera baru vs aktif, telemetri nyeri, check-in RPE, dan evaluasi klinis |
| `src/lib/domain/analytics/weeklyRecapEngine.ts` | Baru | +124 | 0 | Orkestrator domain dan fungsi deterministik batas minggu ISO Senin–Minggu |
| `src/lib/domain/analytics/index.ts` | Baru | +2 | 0 | Barrel export untuk sub-paket domain analitik |
| `src/lib/shared/analytics.ts` | Modifikasi | +3 | 0 | Re-export facade untuk kompatibilitas lintas komponen lama |
| `src/app/api/athlete/weekly-recap/route.ts` | Baru | +48 | 0 | Endpoint API `GET /api/athlete/weekly-recap` terintegrasi PostgreSQL |
| `scripts/tests/test_weekly_recap_engine.js` | Baru | +260 | 0 | Suite pengujian otomatis mencakup 10 skenario perhitungan dan integrasi DB riil |

**Total Akumulasi**: 8 berkas dibuat/dimodifikasi, **+978 baris ditambahkan**, **0 baris dihapus**.

---

## 4. Hasil Pengujian & Jaminan Mutu

1. **Pemeriksaan Kompilasi TypeScript**:
   - Perintah: `npx tsc --noEmit`
   - **Hasil**: **0 Errors, Exit Code 0 (100% Type-Safe)**.
2. **Kompilasi Produksi Next.js**:
   - Perintah: `npm run build`
   - **Hasil**: **Compiled successfully, 31 routes generated without error (Exit Code 0)**.
3. **Suite Pengujian Mesin Rekap Mingguan (`scripts/tests/test_weekly_recap_engine.js`)**:
   - Perintah: `npx tsx scripts/tests/test_weekly_recap_engine.js`
   - **Hasil**:
     - ✅ PASS: *Calculates Monday-to-Sunday window correctly for a mid-week date*
     - ✅ PASS: *Calculates Monday-to-Sunday window correctly when reference date is Sunday*
     - ✅ PASS: *Calculates Monday-to-Sunday window correctly when reference date is Monday*
     - ✅ PASS: *Handles empty activities gracefully*
     - ✅ PASS: *Aggregates multi-sport sessions, paces, and daily breakdowns accurately*
     - ✅ PASS: *Identifies newly acquired/reported injuries in the weekly window*
     - ✅ PASS: *Aggregates weekly pain logs and post-activity checkin responses*
     - ✅ PASS: *Triggers SUSPENDED circuit breaker when acute swelling or peak pain >= 6 occurs*
     - ✅ PASS: *Triggers CAUTION with running ON-HOLD and cycling permitted when active injuries exist without acute red flags*
     - ✅ PASS: *Computes grounded weekly recap from real PostgreSQL athlete dataset*
   - **Status**: **10 PASSED, 0 FAILED (100% Lulus)**.
4. **Suite Verifikasi Kesehatan Atlet**:
   - Perintah: `node scripts/tests/test_athlete_health_system.js`
   - **Hasil**: **31 PASSED, 0 FAILED**.
5. **Suite Verifikasi Rentetan Latihan**:
   - Perintah: `node scripts/tests/test_weekly_streak_system.js`
   - **Hasil**: **21 PASSED, 0 FAILED**.
6. **Total Assertions Lulus**: **80+ Assertions (100% Lulus)**.

---

## 5. Dampak Sistem

- **Sintesis Medis & Atletik yang Komprehensif**: Memberikan gambaran holistik kepada pelatih dan atlet mengenai dampak volume latihan terhadap jaringan sendi yang sedang dalam pemulihan dalam satu siklus mingguan utuh.
- **Pencegahan Cedera Berulang (*Overuse Injury Prevention*)**: Sistem secara deterministik membunyikan peringatan (*circuit breaker*) bila volume mingguan memicu pembengkakan atau instabilitas, melindungi atlet dari pemaksaan pembebanan dini.
- **Kepatuhan Terhadap Batas Ukuran Berkas (<300 baris)**: Seluruh modul dipecah secara rapi ke dalam berkas-berkas berukuran 120–240 baris sesuai aturan arsitektur proyek, menjamin kemudahan audit dan *maintainability* jangka panjang.

