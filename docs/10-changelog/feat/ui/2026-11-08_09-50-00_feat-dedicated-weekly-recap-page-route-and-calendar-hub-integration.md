# Changelog: Dedicated Weekly Recap Route & Calendar Hub Integration (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-08 09:50:00 WIB
- **Tipe**: `feat(ui)` / `feat(route)` / `perf(rendering)` / `refactor(clean-architecture)`
- **Commit Message Rujukan**: `feat(ui): implement dedicated weekly recap page route and calendar hub integration`
- **Branch**: `feat/ui`
- **Lokasi**: `docs/10-changelog/feat/ui/2026-11-08_09-50-00_feat-dedicated-weekly-recap-page-route-and-calendar-hub-integration.md`

---

## 1. Latar Belakang & Permintaan Pengguna

Berdasarkan permintaan pengguna:
> *"buatkan route page baru untuk menampung rekap atau buat di kalender jika bisa atau buatkn sendiri saja"*

Platform membutuhkan:
1. **Rute Halaman Mandiri (`/recap`)**: Halaman khusus berlayar penuh (*dedicated full-page hub*) untuk mengeksplorasi seluruh telemetri beban latihan mingguan, breakdown aktivitas harian, telemetri nyeri, dan preskripsi klinis sendi tanpa terbatas oleh ruang sidebar dashboard.
2. **Integrasi Langsung ke Kalender Latihan (`/training`)**: Pintasan cepat (*one-click navigation*) dari kalender periodisasi latihan langsung ke rekapitulasi mingguan agar atlet dapat melihat korelasi antara jadwal terencana dan realisasi beban latihan.
3. **Penyematan Menu Sidebar Global (`AppSidebar.tsx`)**: Akses langsung ke modul `Rekap Mingguan` dengan badge `1M` pada navigasi utama aplikasi.
4. **Kepatuhan Clean Architecture & Batasan Baris**: Seluruh berkas komponen baru dipecah secara modular sehingga tidak ada berkas yang melampaui batas maksimal **300 baris**.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Rute Halaman Server Komponen Mandiri (`src/app/recap/page.tsx`)
- Menggunakan paradigma Next.js 16 Partial Prerendering (PPR) dan `await connection()` dari `next/server` untuk streaming data dinamis yang aman dari *prerendering bailout*.
- Mengambil data atlet, aktivitas (limit 100 sesi), jadwal latihan, dan konteks kesehatan otoritatif secara paralel (`Promise.all`).
- Menghitung rekapitulasi deterministik via [`computeWeeklyActivityAndInjuryRecap`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/weeklyRecapEngine.ts) dan menyajikan fallback skeleton yang halus.

### B. Arsitektur Komponen Hub Rekapitulasi (`src/components/recap/`)
Untuk memastikan seluruh berkas di bawah 300 baris, modul rekapitulasi dibagi menjadi 3 komponen independen dan terfokus:

1. [`WeeklyRecapHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/recap/WeeklyRecapHub.tsx) (~192 baris):
   - Bertindak sebagai pengelola state aktif, kontrol navigasi minggu (`< Minggu Lalu`, `Minggu Ini`, `Minggu Depan >`), dan pemanggilan API asinkron `/api/athlete/weekly-recap?date=YYYY-MM-DD`.
   - Menampilkan 4 Kartu Metrik Utama (*Hero KPIs*): Total Jarak (km), Durasi & Kalori (jam & kcal), Telemetri Nyeri (/10), dan Toleransi Beban (Sesi Bebas Nyeri).
   - Banner status keselamatan sendi (*Joint Safety Gate*) dengan kode status responsif: `CAUTION`, `SUSPENDED`, atau `OPTIMAL`.

2. [`WeeklyRecapTimeline.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/recap/WeeklyRecapTimeline.tsx) (~87 baris):
   - Menampilkan rincian harian 7 hari (Senin sampai Minggu).
   - Memberikan indikator hari aktif vs hari istirahat, akumulasi elevasi total mingguan, serta tautan langsung ke setiap detail sesi (`/activities/[id]`).

3. [`WeeklyRecapPrescription.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/recap/WeeklyRecapPrescription.tsx) (~86 baris):
   - Menampilkan daftar area sendi yang sedang dimonitor tanpa duplikasi label anatomi.
   - Preskripsi spesifik per cabang olahraga: Cabang Lari (*Running On-Hold*) dan Sepeda (*Cycling Zone 2 permitted*).
   - Checklist tindakan konkret rekomendasi pelatih untuk minggu berikutnya.

### C. Integrasi Kalender Latihan (`src/components/training/ScheduleTrainingHub.tsx`)
- Menambahkan tombol pintas navigasi `Rekap Mingguan` bersanding dengan kontrol view toggle dan modal tambah aktivitas:
```tsx
<Link
  href="/recap"
  className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
  title="Buka Rekap Telemetri Mingguan"
>
  <ClipboardCheck className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
  <span className="hidden sm:inline">Rekap Mingguan</span>
</Link>
```

### D. Penambahan Menu Sidebar Global (`src/components/layout/AppSidebar.tsx`)
- Menyisipkan item navigasi baru:
```tsx
{ name: "Rekap Mingguan", href: "/recap", icon: ClipboardCheck, badge: "1M" }
```

---

## 3. Hasil Pengujian & Verifikasi Kualitas

1. **TypeScript Typecheck**:
   - `npx tsc --noEmit` -> **0 errors**.
2. **Next.js Production Build**:
   - `npm run build` -> Berhasil melakukan kompilasi terhadap **32/32 rute** secara utuh, dengan rute baru `/recap` terdaftar sebagai *Partial Prerender* (`◐ /recap`).
3. **Automated Unit & Integration Test**:
   - `npx tsx scripts/tests/test_weekly_recap_engine.js` -> **10/10 PASS (100% lulus)**.
4. **Audit Batasan Baris Berkas**:
   - `WeeklyRecapHub.tsx`: 192 baris.
   - `WeeklyRecapTimeline.tsx`: 87 baris.
   - `WeeklyRecapPrescription.tsx`: 86 baris.
   - `src/app/recap/page.tsx`: 58 baris.
   - *Seluruh berkas berada jauh di bawah ambang batas 300 baris.*

