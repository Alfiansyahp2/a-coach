# Changelog: Global Visual UI Overhaul to Avionics Telemetry HUD & Total Anti-AI-Slop (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-10 13:15:00 WIB
- **Tipe**: `feat(ui)` / `refactor(design-system)` / `style(anti-ai-slop)` / `perf(clean-architecture)`
- **Commit Message Rujukan**: `feat(ui): complete global visual overhaul across dashboard, telemetry cards, charts, and health gate strictly under 300 lines`
- **Branch**: `feat/ui`
- **Lokasi**: `docs/10-changelog/feat/ui/2026-11-10_13-15-00_feat-global-avionics-hud-ui-overhaul.md`

---

## 1. Latar Belakang & Permintaan Pengguna

Pengguna menyampaikan instruksi tegas setelah evaluasi tampilan aplikasi:
> *"bukan kah saya bilang unutk semua design bukan hnaya di jurnal"*

Pengguna menginginkan agar **seluruh antarmuka aplikasi secara komprehensif**—mulai dari ringkasan telemetri dasbor, kartu metrik KPI, grafik volume mingguan, pintu gerbang biomekanis kesehatan atlet (*Joint Safety Gate*), suapan aktivitas (*Activity Feed*), rekor pribadi (*Personal Records Deck*), sasaran latihan (*Macro Goals*), hingga dossier pelatih—ditransformasikan secara nyata sesuai panduan pada [`docs/02-design`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/02-design) (*Endurance Performance Lab Avionics Telemetry HUD v2.5* & *Anti-AI-Slop*).

---

## 2. Rincian Perubahan Teknis Berdasarkan Berkas

### A. Kartu Metrik Telemetri KPI Presisi (`src/components/ui/MetricCard.tsx`)
- **Avionics Hairline Accent**: Menambahkan garis aksen atas hairline 2px (`border-t-2`) berbasis disiplin olahraga atletik:
  - Sepeda / Cycling: `border-t-[var(--color-cycling)]` (Emerald/Mint).
  - Lari / Running: `border-t-[var(--color-running)]` (Terracotta/Amber).
  - Ketahanan / Endurance: `border-t-[var(--color-endurance)]` (Volt Lime).
  - Peringatan Klinis: `border-t-[var(--color-alert-red)]` (Crimson).
- **Tipografi Tabular Monospace**: Menegakkan kelas `font-mono font-tabular` pada seluruh nilai numerik, persentase delta, dan target progres.
- **Pembersihan Gelembung (*Anti-Bubble*)**: Memastikan sudut kartu `rounded-xl` (12px) dengan batas 1px `var(--color-border)`.
- **Ukuran Berkas**: 144 baris (strictly < 300).

---

### B. Bilah Status Telemetri Taktis Dasbor (`src/components/dashboard/DashboardIntegrityStrip.tsx`)
- **Detak Jantung Sistem (*Heartbeat Telemetry*)**: Menampilkan indikator jembatan Strava online berdenyut (`STRAVA BRIDGE: ONLINE`), koridor latihan aktif (`CORRIDOR: ZONE 2 AEROBIC BASE`), dan sasaran utama atlet lengkap dengan nilai target jarak dalam badge monospace tabular.
- **Navigasi Cepat Taktis**: Tombol pintas navigasi ke Hub Sasaran (`/goals`) dan Kalender Latihan (`/training`) dengan ikon monokromatik presisi.
- **Ukuran Berkas**: 63 baris (strictly < 300).

---

### C. Dek Pintu Gerbang Keselamatan Sendi & Beban Biomekanis (`src/components/health/AthleteHealthDeck.tsx`)
- **Pembersihan Garis Merah Tebal AI-Slop**: Menghilangkan border merah tebal 2px (`border-2 border-red-500`) yang kasar, digantikan dengan hairline 1px `border border-[var(--color-border)]` dan aksen klinis atas `border-t-2 border-t-[var(--color-alert-red)]`.
- **Indikator Klinis Taktis**: Menyematkan badge status `[GATE: ACTIVE]`, serta tag area proteksi sendi mandatoris: `Engkel Kanan (ATFL)` dan `Patella Bilateral`.
- **Dekomposisi Modular Clean Architecture**: Mengekstrak isi konten tab evaluasi (*Overview*, *Directives*, *Risks Matrix*) ke dalam berkas baru [`AthleteHealthDirectives.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/AthleteHealthDirectives.tsx) (182 baris), menyusutkan berkas utama dari **345 baris** menjadi **147 baris**.

---

### D. Grafik Progresi Volume Native SVG (`src/components/charts/VolumeProgressionChart.tsx`)
- **Perbaikan Batas Garis & Typo Label**: Mengurangi ukuran berkas dari **312 baris** menjadi **253 baris**. Memperbaiki typo tombol filter `"ln"` menjadi `"ALL"`.
- **HUD Readout & Precision Grid**: Menata ulang koordinat baseline SVG (tinggi 55px, garis putus-putus 28px) dengan indikator hover tabular untuk pembagian jarak lari, sepeda, dan elevasi.
- **Pembersihan Sudut**: Mengganti `rounded-2xl` menjadi `rounded-xl` (12px).

---

### E. Suapan Aktivitas Terverifikasi (`src/components/activity/ActivityFeed.tsx`)
- **Penegakan Standar Taktis**: Mengubah kontainer pakan dari `rounded-2xl` menjadi `rounded-xl`.
- **Badge Monospace Tabular**: Menampilkan tag disiplin `[RIDE]` / `[RUN]`, waktu tempuh, laju rata-rata kecepatan/pace tabular, dan elevasi gain dalam format yang tajam dan kontras.
- **Ukuran Berkas**: 289 baris (strictly < 300).

---

### F. Rekor Pribadi & Tolok Ukur Atletik (`src/components/records/PersonalRecordsDeck.tsx`)
- **Dekomposisi Masif Berkas Monolitik**: Berkas monolitik awal sebesar **533 baris** dipecah secara modular menjadi:
  1. [`PersonalRecordsDeck.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/records/PersonalRecordsDeck.tsx): **198 baris** (manajemen state tab split/run/ride dan tata letak kontainer).
  2. [`PersonalRecordsHeroCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/records/PersonalRecordsHeroCard.tsx): **54 baris** (kartu sorotan rekor unggulan).
  3. [`PersonalRecordsListItem.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/records/PersonalRecordsListItem.tsx): **58 baris** (baris benchmark sekunder dengan ikon kategori).
- **Penghapusan Pola Slop**: Mengganti `rounded-2xl` menjadi `rounded-xl`, menegakkan hairline border 1px dan tipografi monospace tabular.

---

### G. Sasaran Makro & Jadwal Latihan Dasbor (`DashboardMacroGoalsCard.tsx` & `DashboardScheduledWorkoutsCard.tsx`)
- **Penghapusan Gradien & Ikon Sihir (*Anti-AI-Slop*)**:
  - Menghapus gradien tebal `bg-gradient-to-br from-cycling/10 ...` dan border tebal 2px pada kartu sasaran utama di [`DashboardMacroGoalsCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/DashboardMacroGoalsCard.tsx).
  - Mengganti ikon generik `Sparkles` dengan ikon fungsional `Target`.
  - Mengganti seluruh `rounded-2xl` menjadi `rounded-xl`.
  - Mengubah [`DashboardScheduledWorkoutsCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/DashboardScheduledWorkoutsCard.tsx) menjadi `rounded-xl` bergaris 1px presisi (119 baris).

---

### H. Dossier Rekomendasi Pelatih (`src/components/dashboard/DashboardAiInsightsDeck.tsx`)
- **Penggantian Ikon & Radius**:
  - Mengganti ikon sihir `Sparkles` menjadi instrumen telemetri `Activity`.
  - Mengganti `rounded-2xl` menjadi `rounded-xl` dengan aksen hairline `border-t-2 border-t-[var(--color-cycling)]`.
  - Ukuran berkas: 250 baris (strictly < 300).

---

### I. Modul Hub Sasaran & Peta Anatomi Kesehatan (`src/components/goals/` & `src/components/health/`)
- Mengeliminasi seluruh sisa penggunaan `rounded-2xl` pada:
  - [`PrimaryGoalHeroSection.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/goals/hero/PrimaryGoalHeroSection.tsx)
  - [`GoalsProgressionDeck.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/goals/progression/GoalsProgressionDeck.tsx)
  - [`GoalRegistryCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/goals/registry/GoalRegistryCard.tsx)
  - [`CreateCustomGoalModal.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/goals/modal/CreateCustomGoalModal.tsx)
  - [`GoalsTelemetrySummary.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/goals/telemetry/GoalsTelemetrySummary.tsx)
  - [`InjuryDossierTab.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/hub/InjuryDossierTab.tsx) (dipecah dengan [`InjuryDossierDetailPane.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/hub/InjuryDossierDetailPane.tsx), masing-masing 132 dan 197 baris).
  - [`RunningCoachView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/RunningCoachView.tsx) dirampingkan ke 264 baris.

---

## 3. Hasil Pengujian & Verifikasi Kualitas

| Komponen / Pipeline | Target Standar | Status Hasil |
| :--- | :--- | :--- |
| **Pemeriksaan Tipe TypeScript** | `npx tsc --noEmit` | **0 Error (Exit Code: 0)** |
| **Suite Pengujian Mesin Rekap** | `scripts/tests/test_weekly_recap_engine.js` | **11/11 Passed (100%)** |
| **Build Produksi Next.js** | `npm run build` | **Exit Code: 0 (32/32 Rute Berhasil)** |
| **Batas Garis Arsitektur Bersih** | Semua berkas $\le 300$ baris | **100% Terpenuhi** |
| **Harmonisasi Dual-Theme** | Dark (Graphite) & Light (Chalk Lab) | **100% Bebas Hardcoded Hex** |
| **Pembersihan AI-Slop** | Nol `rounded-2xl` pada data cards, nol `Sparkles` | **100% Standar Avionics HUD v2.5** |
