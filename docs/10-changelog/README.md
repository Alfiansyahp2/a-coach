# Master Engineering Changelog Index & Ecosystem Catalog

**Status:** CONFIRMED & AUDITED  
**Repository:** `project_strava` (Personal Sports Training & Performance Platform)  
**Total Changelog Records:** 75 Berkas Dokumentasi Aktif  
**Owner:** Principal UI/UX Architect & Lead Telemetry Engineer  

---

## 1. Ikhtisar Direktori Changelog (*Executive Directory Map*)

Dokumen ini berfungsi sebagai **katalog navigasi resmi dan pengindeks kronologis** untuk seluruh berkas changelog yang mencatat setiap iterasi rekayasa perangkat lunak pada repositori `project_strava`.

Setiap perubahan kode dicatat secara granular sesuai domain fitur dan cabang pengembangan (*feature branches*), mematuhi prinsip *Clean Architecture* dan kebijakan visual *Anti-AI-Slop*.

```
docs/10-changelog/
├── CHANGELOG.md                 # 🏛️ Master Foundation v1.0.0 (01 Nov 2026)
├── README.md                    # 📑 Katalog & Indeks Utama (Dokumen ini)
├── main/                        # 🚀 Rilis Master & Integrasi Makro (3 berkas)
├── refactor/                    # 🛡️ Dekomposisi Berkas & Clean Architecture (9 berkas)
└── feat/                        # ⚡ Modul Fitur Berdasarkan Domain:
    ├── ui/                      # 🎨 Antarmuka, Obsidian Telemetry, & Kalender (32 berkas)
    ├── backend/                 # ⚙️ Python Sports Science Engine, DB, & API (16 berkas)
    ├── personal-record/         # 🏆 Personal Records & Analisis Rekap Pro (5 berkas)
    ├── training/                # 🚴 Kalender Latihan & AI Coach Engine (3 berkas)
    ├── health/                  # 🩺 Profil Kesehatan & Kesiapan Klinis (2 berkas)
    ├── profile/                 # 👤 Biometrik Atlet & Riwayat Prosedur Medis (2 berkas)
    └── strava/                  # 🔗 Integrasi Strava API v3
        ├── oauth-handshake/     # 🔐 OAuth 2.0 & Enkripsi Token AES-256 (1 berkas)
        └── activity-ingestion/  # 📥 Webhook & Pipeline Ingesti Sesi (1 berkas)
```

---

## 2. Katalog Domain & Riwayat Iterasi

### A. Antarmuka Atletik & Desain Sistem ([`feat/ui/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/)) — 32 Berkas
Mencatat evolusi visual antarmuka dari fase awal hingga kalender multi-model:
- **Kalender Multi-Model & Command Deck**:
  - [`2026-11-14_07-26-00_feat-minimalist-view-selector-labels-and-number-cleanup.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-14_07-26-00_feat-minimalist-view-selector-labels-and-number-cleanup.md) — Perampingan selektor model kalender & eliminasi badge berlebih.
  - [`2026-11-14_07-22-00_feat-training-calendar-ui-audit-and-quick-wins-refinements.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-14_07-22-00_feat-training-calendar-ui-audit-and-quick-wins-refinements.md) — Audit holistik 4 tindakan penyempurnaan cepat.
  - [`2026-11-13_18-25-00_feat-multi-model-calendar-suite-kinetic-journal-gantt-and-micro-hud.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-13_18-25-00_feat-multi-model-calendar-suite-kinetic-journal-gantt-and-micro-hud.md) — Implementasi 7 model kalender atletik terpadu.
  - [`2026-11-12_08-20-00_docs-calendar-ui-design-variants-specification-and-multi-model-catalog.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-12_08-20-00_docs-calendar-ui-design-variants-specification-and-multi-model-catalog.md) — Master spesifikasi 5+ varian antarmuka kalender.
  - [`2026-11-12_07-45-00_feat-training-calendar-pro-redesign-month-grid-and-sleek-command-bar.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-12_07-45-00_feat-training-calendar-pro-redesign-month-grid-and-sleek-command-bar.md) — Redesain grid bulan 8-kolom & bilah kendali ramping.
- **Desain Sistem & Avionics HUD**:
  - [`2026-11-10_13-15-00_feat-global-avionics-hud-ui-overhaul.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-10_13-15-00_feat-global-avionics-hud-ui-overhaul.md) — Overhaul antarmuka avionics telemetry global.
  - [`2026-11-10_12-38-00_feat-codebase-alignment-with-design-system-and-anti-ai-slop.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-10_12-38-00_feat-codebase-alignment-with-design-system-and-anti-ai-slop.md) — Penyelarasan prinsip anti-AI-slop.
- **Modul Taktil & Interaksi**:
  - [`2026-11-10_11-55-00_feat-open-book-multi-step-checkin-and-injury-assessment.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-10_11-55-00_feat-open-book-multi-step-checkin-and-injury-assessment.md) — Lembar check-in buku taktil & skrining cedera.
  - [`2026-11-05_19-10-00_feat-open-book-activity-telemetry-notebook-modal.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-05_19-10-00_feat-open-book-activity-telemetry-notebook-modal.md) — Modal buku catatan fisik dua halaman.

---

### B. Backend & Mesin Komputasi Sains Olahraga ([`feat/backend/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/)) — 16 Berkas
- [`2026-11-14_07-55-00_feat-backend-full-stack-audit-remediation-and-p0-p1-validation.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/2026-11-14_07-55-00_feat-backend-full-stack-audit-remediation-and-p0-p1-validation.md) — Remediasi temuan audit P0/P1, integrasi basis data riil, & validasi 97 tes lulus.
- [`2026-11-11_05-35-00_feat-python-sports-science-engine-and-streak-thermodynamics-decoupling.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/2026-11-11_05-35-00_feat-python-sports-science-engine-and-streak-thermodynamics-decoupling.md) — FastAPI micro-engine mandiri port 8000 & termodinamika streak.
- [`2026-11-09_20-45-00_feat-weekly-recap-engine-audit-and-timezone-remediation.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/2026-11-09_20-45-00_feat-weekly-recap-engine-audit-and-timezone-remediation.md) — Audit timezone UTC+7 & batas minggu retrospektif.
- [`2026-11-07_08-30-00_feat-backend-hardening-phase-1-and-phase-2-remediation.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/2026-11-07_08-30-00_feat-backend-hardening-phase-1-and-phase-2-remediation.md) — Hardening API endpoint & integritas repositori.
- [`2026-11-04_08-55-00_feat-authoritative-primary-goal-engine-and-single-effort-architecture.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/2026-11-04_08-55-00_feat-authoritative-primary-goal-engine-and-single-effort-architecture.md) — Engine target utama Century Ride 100km.
- [`2026-11-02_20-45-00_feat-full-body-anatomical-taxonomy-and-kinematic-injury-engine.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/2026-11-02_20-45-00_feat-full-body-anatomical-taxonomy-and-kinematic-injury-engine.md) — Taksonomi anatomi & proteksi ligamen ATFL.

---

### C. Dekomposisi Kode & Clean Architecture ([`refactor/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/refactor/)) — 9 Berkas
- [`2026-11-11_06-15-00_refactor-bulk-line-remediation-and-clean-architecture-decomposition.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/refactor/2026-11-11_06-15-00_refactor-bulk-line-remediation-and-clean-architecture-decomposition.md) — Penegakan ketat batas < 300 baris kode per berkas.
- [`2026-11-07_09-55-00_feat-clean-architecture-decomposition-and-bulk-line-remediation.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/refactor/2026-11-07_09-55-00_feat-clean-architecture-decomposition-and-bulk-line-remediation.md) — Pemecahan god-components menjadi atomik sub-komponen.
- [`2026-11-04_09-30-00_refactor-authoritative-clean-architecture-folder-structure-and-modularization.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/refactor/2026-11-04_09-30-00_refactor-authoritative-clean-architecture-folder-structure-and-modularization.md) — Restrukturisasi arsitektur direktori domain v3.0.

---

### D. Rekap Analitik & Rekor Personal ([`feat/personal-record/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/personal-record/)) — 5 Berkas
- [`2026-11-11_10-45-00_feat-weekly-recap-pro-physiological-analytics-and-seiler-polarization.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/personal-record/2026-11-11_10-45-00_feat-weekly-recap-pro-physiological-analytics-and-seiler-polarization.md) — Model polarisasi Stephen Seiler 80/20 & Foster sRPE.
- [`2026-11-08_09-18-00_feat-weekly-activity-and-injury-recap-engine.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/personal-record/2026-11-08_09-18-00_feat-weekly-activity-and-injury-recap-engine.md) — Engine rekap mingguan retrospektif.
- [`2026-11-02_09-45-00_feat-multi-sport-personal-records.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/personal-record/2026-11-02_09-45-00_feat-multi-sport-personal-records.md) — Pelacakan rekor personal multi-olahraga (Lari & Sepeda).

---

### E. Pelatih Atletik AI & Program Latihan ([`feat/training/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/training/)) — 3 Berkas
- [`2026-11-11_10-25-00_feat-real-world-coach-intelligence-and-banister-pmc-engine.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/training/2026-11-11_10-25-00_feat-real-world-coach-intelligence-and-banister-pmc-engine.md) — Banister Impulse Response PMC Engine (CTL, ATL, TSB).
- [`2026-11-02_11-50-00_feat-coach-training-calendar-and-12-week-zone2-plan.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/training/2026-11-02_11-50-00_feat-coach-training-calendar-and-12-week-zone2-plan.md) — Rencana periodisasi 12-minggu Zone 2 & proteksi puasa.

---

### F. Rilis Master & Integrasi Utama ([`main/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/main/)) — 3 Berkas
- [`2026-11-13_18-55-00_feat-calendar-command-deck-popover-selector-and-ui-modernization.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/main/2026-11-13_18-55-00_feat-calendar-command-deck-popover-selector-and-ui-modernization.md) — Desain ulang command deck & popover selector.
- [`2026-11-01_19-46-00_feat-core-foundation-schema-strava-oauth-and-domain-logic.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/main/2026-11-01_19-46-00_feat-core-foundation-schema-strava-oauth-and-domain-logic.md) — Skema database PostgreSQL, AES-256 token crypto, dan Strava client.

---

### G. Kesehatan, Profil Atlet, & Integrasi Strava
- **Kesehatan ([`feat/health/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/health/))**: Kesiapan klinis, safety gate, dan indikator beban.
- **Profil ([`feat/profile/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/profile/))**: Biometrik atlet, zona detak jantung Karvonen, dan data riwayat medis.
- **Integrasi Strava ([`feat/strava/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/strava/))**: Handshake autentikasi OAuth 2.0 dan pipeline ingesti aktivitas otomatis.

---

## 3. Konvensi Penamaan & Standar Berkas Changelog

Setiap berkas changelog wajib mematuhi konvensi nama terstandarisasi:
```
YYYY-MM-DD_HH-mm-ss_<type>-<slug-deskripsi>.md
```
- **`YYYY-MM-DD`**: Tanggal pembuatan (Waktu Indonesia Barat / UTC+7).
- **`HH-mm-ss`**: Waktu pembuatan presisi.
- **`<type>`**: Kategori konvensional (`feat`, `refactor`, `fix`, `docs`).
- **`<slug>`**: Rangkuman singkat perubahan teknis dalam format kebab-case.

### Persyaratan Isi Wajib Berkas:
1. **Metadata Header**: Tanggal, Tipe, Commit Message Rujukan, Branch, dan Lokasi Berkas.
2. **Ringkasan Eksekutif & Latar Belakang Masalah**.
3. **Rincian Perubahan Teknis / Git Diff**: Menyertakan modul yang diubah dan potongan kode penting.
4. **Matriks Kepatuhan Batas Baris Kode**: Verifikasi ketat seluruh berkas produksi `< 300 baris`.
5. **Hasil Verifikasi Sistem**: Bukti kompilasi TypeScript (`0 error`), pengujian unit, dan status pohon git.

