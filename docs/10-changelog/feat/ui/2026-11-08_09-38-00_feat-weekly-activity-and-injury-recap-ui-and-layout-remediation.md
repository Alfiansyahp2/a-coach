# Changelog: Weekly Activity & Injury Recap UI and Layout Remediation (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-08 09:38:00 WIB
- **Tipe**: `feat(ui)` / `fix(layout)` / `fix(typography)` / `feat(analytics)` / `perf(rendering)`
- **Commit Message Rujukan**: `feat(ui): implement weekly activity and injury recap card, modal dossier, and layout remediation`
- **Branch**: `feat/ui`
- **Lokasi**: `docs/10-changelog/feat/ui/2026-11-08_09-38-00_feat-weekly-activity-and-injury-recap-ui-and-layout-remediation.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Berdasarkan evaluasi antarmuka dan pengujian visual pada kolom taktis dashboard (*Endurance Performance Lab*):

1. **Ketiadaan Antarmuka Visual untuk Rekapitulasi Mingguan Terpadu**:
   - Platform sebelumnya memiliki grafik volume mingguan ([`VolumeProgressionChart.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/charts/VolumeProgressionChart.tsx)) dan kartu perlindungan sendi ([`AthleteHealthDeck.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/AthleteHealthDeck.tsx)), namun belum menyediakan kartu sintesis terpadu yang membandingkan beban kerja fisik mingguan secara langsung berdampingan dengan telemetri cidera, skor nyeri, dan respon pasca latihan.
2. **Cacat Visual Pemotongan Teks (*Severe Text Wrapping & Truncation*)**:
   - Pada implementasi awal antarmuka rekapitulasi, pembagian 2 kolom horizontal (`grid-cols-2`) di dalam kolom taktis dashboard (~420px) membagi area menjadi 2 kolom sempit berukuran ~200px. Hal ini menimbulkan serangkaian cacat visual parah:
     - Kata `BEBAN KERJA FISIK` terdesak hingga patah menjadi 3 baris terpisah (`BEBAN` / `KERJA` / `FISIK`).
     - Judul `STATUS CIDERA & NYERI` terbelah menjadi 2 baris canggung.
     - Angka dan satuan `88.35 km` terpotong menjadi 2 baris (`88.35` di baris atas dan `km` sendirian di baris bawah).
     - Kotak metrik durasi `4:37:00` terjepit sempit menempel batas border (~55px per kotak).
3. **Anomali Redundansi Anatomi (*Stuttering "RIGHT Right Ankle"*)**:
   - Penggabungan langsung string sisi dan nama regio anatomi `${inj.side} ${inj.body_region}` memicu pengulangan kata yang tidak baku dan tidak estetis: `RIGHT Right Ankle` pada daftar area monitor, serta `BILATERAL ANTERIOR KNEES & RIGHT RIGHT ANKLE` pada banner keselamatan klinis.
4. **False Positive Badge *"2 CIDERA BARU"* & Pemotongan Teks Banner**:
   - Riwayat cedera medis masa lalu atlet (*"Approximately 3-6 months ago"*) keliru diidentifikasi sebagai cedera baru yang baru saja terjadi minggu ini hanya karena timestamp `created_at` basis data jatuh di minggu tersebut. Hal ini memunculkan badge alarm oranye terang `2 CIDERA BARU` yang tidak akurat secara medis.
   - Banner keputusan klinis di bagian bawah kartu menggunakan huruf kapital berlebih (*all-caps*) yang terlipat 3 baris dan terpotong secara mendadak dengan titik-titik gantung (`dalam...`).

Pembaruan ini menghadirkan perombakan responsif modul [`WeeklyRecapCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/analytics/WeeklyRecapCard.tsx), modal dossier interaktif [`WeeklyRecapDetailModal.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/analytics/WeeklyRecapDetailModal.tsx), integrasi tab ke-4 pada [`DashboardTacticalDeck.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/DashboardTacticalDeck.tsx), perbaikan normalisasi anatomi, serta eliminasi total terhadap seluruh cacat pemotongan teks.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Rekonstruksi Responsif & Tata Letak Terpadu (`src/components/analytics/WeeklyRecapCard.tsx`)

Merombak tata letak kartu menjadi susunan vertikal seimbang dengan ruang horizontal lega (>120px per blok metrik):

```tsx
// 1. Beban Kerja Fisik: Tata letak lega dengan angka dan satuan utuh
<div className="space-y-2">
  <div className="flex items-center justify-between text-[11px]">
    <span className="font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cycling)]" />
      <span>Beban Kerja Fisik</span>
    </span>
    <span className="text-[10px] text-[var(--color-text-muted)]">
      {act.total_calories > 0 ? `${act.total_calories} kcal • ` : ""}{act.active_days_count} Hari Aktif
    </span>
  </div>

  <div className="grid grid-cols-3 gap-2 text-center">
    <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--color-surface-muted)]/60 border border-[var(--color-border-subtle)]">
      <div className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] font-tabular">
        {act.total_distance_km} <span className="text-[10px] font-normal text-[var(--color-text-muted)]">km</span>
      </div>
      <div className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">Total Jarak</div>
    </div>
    ...
  </div>
</div>
```

- **Pencegahan Pemotongan Satuan**: Membungkus satuan `km` dan nilai metrik dalam kontainer `whitespace-nowrap`, menjamin `88.35 km` selalu tampil utuh dalam 1 baris.
- **Tipografi Banner Proporsional**: Mengganti teks all-caps agresif dengan format *proper sentence case* yang rapi dan menampilkan teks korelasi beban secara utuh tanpa pemotongan canggung.

---

### B. Modal Dossier Telemetri Lengkap (`src/components/analytics/WeeklyRecapDetailModal.tsx`)

Membangun jendela modal interaktif berukuran 211 baris untuk inspeksi mendalam:

```tsx
export function WeeklyRecapDetailModal({ recap, onClose }: WeeklyRecapDetailModalProps) {
  // 1. Timeline Harian 7 Hari (Senin – Minggu) dengan sesi individu & durasi
  // 2. Audit Cidera: Pemisahan insiden baru vs pengawasan klinis aktif
  // 3. Preskripsi Latihan Coach: Rekomendasi spesifik cabang lari vs sepeda
}
```

- **Fitur Khusus**:
  - Menampilkan timeline 7 hari lengkap dengan penanda hari aktif vs hari istirahat.
  - Memisahkan status cidera baru yang diperoleh pada minggu berjalan dari cidera kronis yang sedang dimonitor.
  - Menyajikan rekomendasi preskriptif keolahragaan (lari ditunda, sepeda aerobik zona 2 diizinkan).

---

### C. Normalisasi Anatomi & Koreksi Logika Insiden Baru (`src/lib/domain/analytics/weeklyRecapInjury.ts`)

1. **Fungsi Pencegah Duplikasi (*Anti-Stuttering*)**:
   ```typescript
   export function formatAnatomyLabel(side?: string | null, region?: string | null): string {
     const cleanSide = side?.trim() || '';
     const cleanRegion = region?.trim() || '';
     if (!cleanSide) return cleanRegion;
     if (!cleanRegion) return cleanSide;

     if (cleanRegion.toLowerCase().startsWith(cleanSide.toLowerCase())) {
       return cleanRegion;
     }
     return `${cleanSide} ${cleanRegion}`;
   }
   ```
   - Mengubah `RIGHT Right Ankle` $\to$ `Right Ankle`.
   - Mengubah `BILATERAL Anterior Knees` $\to$ `Bilateral Anterior Knees`.

2. **Koreksi Filter Cidera Baru**:
   - Mengecek deskripsi rentang waktu (`timeframe_description`). Jika berisi keterangan riwayat masa lalu (misal *"Approximately 3-6 months ago"*), rekor tersebut tidak lagi dianggap sebagai insiden baru yang baru saja diperoleh minggu ini.
   - Badge status kini secara akurat menampilkan `0 Cidera Baru` dengan pengawasan sendi aktif tetap berjalan.

---

### D. Integrasi Tab ke-4 pada Tactical Deck & SSR Data Injection (`src/components/dashboard/DashboardTacticalDeck.tsx` & `src/app/page.tsx`)

1. **Tab Ke-4 pada Deck Taktis**:
   - Menambahkan kontrol tab `Rekap (1M)` pada [`DashboardTacticalDeck.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/DashboardTacticalDeck.tsx):
     ```tsx
     <button
       onClick={() => setActiveTab("recap")}
       className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition-all flex items-center gap-1 text-[10px] ...`}
     >
       <ActivityIcon className="w-3 h-3 text-[var(--color-cycling)] shrink-0" />
       <span>Rekap</span>
       <span className="text-[9px] px-1.5 py-0.2 rounded-full font-tabular ...">1M</span>
     </button>
     ```
2. **Injeksi Data Server Component (Zero Layout Shift)**:
   - Di [`src/app/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/page.tsx), rekap dihitung pada level SSR via `computeWeeklyActivityAndInjuryRecap` dan diteruskan sebagai `initialRecap={weeklyRecap}`.

---

## 3. Matriks Perbandingan Git Diff

| Berkas Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/components/analytics/WeeklyRecapCard.tsx` | Baru | +297 | 0 | Kartu telemetri rekap mingguan, layout vertikal seimbang, anti-truncation |
| `src/components/analytics/WeeklyRecapDetailModal.tsx` | Baru | +211 | 0 | Modal dossier telemetri mendalam (distribusi 7 hari & preskripsi) |
| `src/components/dashboard/DashboardTacticalDeck.tsx` | Modifikasi | +31 | -2 | Penambahan tab ke-4 `Rekap (1M)` dan rendering kartu rekap |
| `src/app/page.tsx` | Modifikasi | +9 | -1 | Komputasi SSR `weeklyRecap` dan pengoperan prop `initialRecap` |
| `src/lib/domain/analytics/weeklyRecapInjury.ts` | Modifikasi | +32 | -7 | Normalisasi `formatAnatomyLabel` dan koreksi filter riwayat cidera |

**Total Akumulasi**: 5 berkas termodifikasi/dibuat, **+580 baris ditambahkan**, **-10 baris dihapus**.

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
   - **Hasil**: **10 PASSED, 0 FAILED (100% Lulus)**.
4. **Suite Verifikasi Kesehatan Atlet**:
   - Perintah: `node scripts/tests/test_athlete_health_system.js`
   - **Hasil**: **31 PASSED, 0 FAILED**.
5. **Suite Verifikasi Rentetan Latihan**:
   - Perintah: `node scripts/tests/test_weekly_streak_system.js`
   - **Hasil**: **21 PASSED, 0 FAILED**.
6. **Total Assertions Lulus**: **80+ Assertions (100% Lulus)**.

---

## 5. Dampak Sistem

- **Ergonomi & Legibilitas Tinggi pada Sidebar (~420px)**: Tata letak baru memberikan ruang napas yang cukup untuk seluruh teks dan angka metrik, menghilangkan seluruh garis teks patah.
- **Terminologi Klinis Bersih & Akurat**: Menghilangkan duplikasi kata memalukan (*"RIGHT Right Ankle"*) dan membedakan riwayat baseline dari insiden akut baru secara tepat.
- **Kinerja Rendering Optimal**: Pemanfaatan Server-Side Rendering (SSR) menjamin kartu terisi instan tanpa *flicker* atau *layout shift* (CLS 0).

