# Changelog: Next.js Security Upgrade (16.4.6) & Formatting Normalization (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-17 09:56:00 WIB
- **Tipe**: `chore(security)` / `style(formatting)` / `refactor(ergonomics)`
- **Commit Message Rujukan**: `chore(security): upgrade next to 16.4.6 in-place and normalize editor formatting across feat/ui components` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/ui`
- **Lokasi**: [`docs/10-changelog/feat/ui/2026-11-17_09-56-00_feat-ui-formatting-normalization-and-nextjs-security-upgrade.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-17_09-56-00_feat-ui-formatting-normalization-and-nextjs-security-upgrade.md)

---

## 1. Latar Belakang & Konteks Perubahan

Sesi ini mencakup penanganan dua agenda teknis penting pada branch `feat/ui`:

1. **Remediasi Kerentanan Keamanan Next.js (CVE Security Advisory)**:
   - Next.js mendeteksi kerentanan keamanan pada versi terpasang `16.4.3` dengan peringatan fatal saat build:
     > `⚠ Installed Next.js version 16.4.3 is affected by a known security vulnerability.`
     > `Next.js security version upgrade available: 16.4.3 -> 16.4.6`
   - Berdasarkan instruksi pengguna (*"kenapa membuat worktree? tidak bisa di main saja?"*), pemutakhiran dieksekusi secara **langsung (*in-place*)** pada branch aktif `feat/ui` tanpa membuat cabang/worktree terpisah, kemudian worktree sementara `next-upgrade-worktree` segera dibersihkan secara tuntas.

2. **Resolusi Buffer Simpan Editor & Normalisasi Formatting**:
   - Pengguna menanyakan penyebab sejumlah berkas di editor tidak tersimpan / mengalami desinkronisasi tab (*"ada beberapa file yang belum tersimpan, bisakah kau audit hal tersebut dan lihat apa yang menyebabkan tidak bisa di simpan?"*).
   - Audit mengidentifikasi bahwa modifikasi disk eksternal (akibat instalasi paket/git) bersamaan dengan penguncian sementara oleh sinkronisasi cloud drive (OneDrive) menyebabkan buffer VS Code menahan versi memori.
   - Setelah pengguna menekan simpan pada seluruh tab terbuka, terjadi pembaruan format (*code formatting / Prettier indentation normalization*) pada berkas-berkas tersebut yang kini dicatat secara rapi dalam `git diff`.

---

## 2. Rincian Perubahan Modul & Dependensi

### A. Dependensi Inti & Konfigurasi Build Next.js
1. **[`package.json`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/package.json) & [`package-lock.json`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/package-lock.json)**:
   - `next`: `16.4.3` $\to$ `16.4.6`
   - `eslint-config-next`: `16.4.3` $\to$ `16.4.6`
   - Bebas dari kerentanan keamanan CVE terdeteksi.
2. **[`next.config.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/next.config.ts)**:
   - Menambahkan konfigurasi eksperimental:
     ```typescript
     experimental: {
       agentUpgrade: "security",
     } as any,
     ```
   - Berhasil mengirimkan telemetri status peningkatan resmi Next.js (`success`).

### B. Normalisasi Tata Letak & Formatter Komponen UI
1. **[`AthleteEquipmentCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/profile/AthleteEquipmentCard.tsx) (272 baris)**:
   - Memulihkan dan menata wrapper JSX pada progress bar keausan peralatan (`wearPct >= 85 ? alert-red : alert-amber ...`).
   - Menyederhanakan hierarki penutupan elemen DOM agar tetap rapi, terbaca jelas, dan konsisten di bawah batas 300 baris.
2. **[`DashboardTacticalDeck.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/DashboardTacticalDeck.tsx) (292 baris)**:
   - Merapikan pemformatan kondisi ternary pemilihan tab navigasi (`Kalender Sesi`, `Sasaran Utama`, `Rekor Terverifikasi`, `Audit Mingguan`).
   - Merapikan interpolasi string `className` dinamis pada tombol selector deck.
3. **[`AnatomicalRegionPicker.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/hub/injury-form/AnatomicalRegionPicker.tsx) (162 baris)**:
   - Merapikan indentasi pemilihan sendi/otot (ATFL ankle, lutut, hamstring, dsb.) dan badge lateralitas (Kiri/Kanan/Bilateral).
4. **[`InjuryDossierTab.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/hub/InjuryDossierTab.tsx) (289 baris)** & **[`NewInjuryForm.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/hub/NewInjuryForm.tsx) (199 baris)**:
   - Merapikan indentasi badge keparahan cedera klinis dan deklarasi formulir.
5. **[`CalendarCommandBar.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/navigation/CalendarCommandBar.tsx) (185 baris)** & **[`ScheduleTrainingHeader.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/ScheduleTrainingHeader.tsx) (166 baris)**:
   - Normalisasi formatting tombol filter cabang olahraga dan pill *clinical clearance status*.
6. **[`DashboardMacroGoalsCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/DashboardMacroGoalsCard.tsx) (179 baris)**:
   - Merapikan indentasi evaluasi kondisi capaian Century Ride (100 km).

### C. Normalisasi Mesin Logika Domain (Pure TypeScript)
1. **[`multiWeekRecapEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/multiWeekRecapEngine.ts) (218 baris)**:
   - Merapikan formatting conditional label lingkup mesosiklus (`Mesosiklus 1 Bulan` / `Blok 2-Minggu` / `Siklus Mingguan`).
2. **[`dailyCoachBriefingEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/dailyCoachBriefingEngine.ts) (185 baris)**:
   - Normalisasi formatting properti objek `fastingAwareness` saat hari puasa proteksi terdeteksi.
3. **[`streakEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/streak/streakEngine.ts) (257 baris)**:
   - Merapikan string template deskripsi api rentetan latihan (`flameStatusDescription`).

---

## 3. Matriks Kepatuhan Batas Ukuran Berkas (*Clean Architecture Audit*)

Semua berkas yang terdapat dalam `git diff` diverifikasi berada di bawah batas ketat **< 300 baris**:

| Berkas / Komponen | Jumlah Baris Saat Ini | Batas Maksimum | Status |
| :--- | :---: | :---: | :---: |
| `src/components/dashboard/DashboardMacroGoalsCard.tsx` | **179** | < 300 | ✅ Patuh |
| `src/components/dashboard/DashboardTacticalDeck.tsx` | **292** | < 300 | ✅ Patuh |
| `src/components/health/hub/InjuryDossierTab.tsx` | **289** | < 300 | ✅ Patuh |
| `src/components/health/hub/NewInjuryForm.tsx` | **199** | < 300 | ✅ Patuh |
| `src/components/health/hub/injury-form/AnatomicalRegionPicker.tsx` | **162** | < 300 | ✅ Patuh |
| `src/components/profile/AthleteEquipmentCard.tsx` | **272** | < 300 | ✅ Patuh |
| `src/components/training/ScheduleTrainingHeader.tsx` | **166** | < 300 | ✅ Patuh |
| `src/components/training/navigation/CalendarCommandBar.tsx` | **185** | < 300 | ✅ Patuh |
| `src/lib/domain/analytics/multiWeekRecapEngine.ts` | **218** | < 300 | ✅ Patuh |
| `src/lib/domain/coach/dailyCoachBriefingEngine.ts` | **185** | < 300 | ✅ Patuh |
| `src/lib/domain/streak/streakEngine.ts` | **257** | < 300 | ✅ Patuh |
| `next.config.ts` | **25** | < 300 | ✅ Patuh |

*Audit menyeluruh terhadap seluruh berkas `.ts` dan `.tsx` di direktori `src/` mengonfirmasi: **0 file $\ge$ 300 baris**.*

---

## 4. Hasil Verifikasi Sistem

1. **TypeScript Compilation (`npx tsc --noEmit`)**:
   - Status: **0 Type Errors** (Lolos 100%).
2. **Pengujian Unit & Integrasi Sistem (`npm run test:all`)**:
   - Health Intelligence & Ankle ATFL Protection: **31 / 31 Passed**
   - Coach Training & Mesocycle Prescriptions: **5 / 5 Passed**
   - Streak Thermal Heat Retaining: **21 / 21 Passed**
   - BOLA Defense & Security Constraints: **5 / 5 Passed**
   - Multi-Week Recap & Mesocycle Analytics: **10 / 10 Passed**
   - Python Pytest Domain Verification: **16 / 16 Passed**
   - **Total**: **88 / 88 Test Cases Passed** (100% Hijau).
3. **Turbopack Production Build (`npm run build`)**:
   - Status: **34/34 Routes Compiled Successfully** tanpa peringatan kerentanan keamanan Next.js.
4. **Status Git**:
   - **TIDAK ADA GIT COMMIT** yang dibuat (seluruh perubahan tetap berada dalam *unstaged working tree* pada branch `feat/ui`).
