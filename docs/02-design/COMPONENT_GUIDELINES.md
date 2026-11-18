# Component Guidelines & Architectural Anatomy

**Status:** CONFIRMED & EXPANDED  
**Version:** 2.5  
**Last Updated:** 2026-11-10  
**Owner:** Design Systems Architect & Lead Frontend Engineer  
**Related Documents:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), [ANTI_AI_SLOP.md](./ANTI_AI_SLOP.md), [DESIGN_PHILOSOPHY.md](./DESIGN_PHILOSOPHY.md)

---

## 1. OpenBookModal (Tactile Field Journal Component)

Used for manual activity logging (`AddActivityModal.tsx`), photo OCR scanning, and post-session clinical audits.

```
┌────────────────────────────────────────────────────────┐
│ [Ribbon Bookmark]                                      │
│ ┌──────────────────────────┬─────────────────────────┐ │
│ │ HALAMAN 12 / 14          │ HALAMAN 13 / 15         │ │
│ │ (Technical Grid Paper)   │ (Ruled Margin Paper)    │ │
│ │                          │                         │ │
│ │ • OCR Telemetry Scanner  │ • Parameter Sesi Input  │ │
│ │ • Metric Speed/Pace Read │ • Joint Checkin / Slop  │ │
│ │ • 3-Point Pain Sliders   │ • New Injury Assessment │ │
│ │                          │                         │ │
│ └──────────────────────────┴─────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

* **Anatomy & Tokens:**
  1. **Outer Cover (`--color-book-cover`):** Leather finish with 16px radius (`rounded-2xl`) and 1px border.
  2. **Ribbon Bookmark:** Centered crimson drop bookmark (`w-7 h-8 bg-gradient-to-b from-rose-600 to-rose-800`).
  3. **Left Page (`--color-book-page-left`):** 20px technical graph grid (`--color-book-grid`) for raw telemetry and clinical sensor sliders.
  4. **Right Page (`--color-book-page-right`):** 28px ruled lines (`--color-book-line`) with vertical margin line (`--color-book-margin`) for manual writing and clinical evaluation.
  5. **Center Crease:** Shaded spine gradient providing depth between facing pages.
  6. **Step Wizard Navigation:**
     - *Lembar 1 (Hal 12–13):* Telemetri OCR -> Form Input Parameter -> Tombol `LANJUT KE CHECK-IN & EVALUASI →`.
     - *Lembar 2 (Hal 14–15):* Check-in Pasca Latihan (3 slider nyeri, efusi, RPE) -> Skrining Cedera Baru -> Tombol `✓ TULIS LENGKAP KE JURNAL`.

---

## 2. AppSidebar (Adaptive Tactical Navigation Shell)

Used for global application navigation with data-driven dynamic badges and ergonomic floating toggle controls.

* **Anatomy:**
  1. **Brand Terminal:** Monospace logo (`ENDURANCE LAB`) with subtext version (`TELEMETRY v2.0`).
  2. **Semantic 3-Tier Navigation:**
     - *Telemetri & Analitik:* `Overview` (LIVE), `Rekap Mingguan` (1M), `Riwayat Aktivitas` (Dinamis: e.g. `37`).
     - *Pelatihan & Coach:* `Kalender Latihan` (12W), `Running Coach` (Dinamis: `HOLD` vs `READY`), `Cycling Coach` (ACTIVE), `Sasaran & Target` (Target).
     - *Profil & Medis:* `Profil Atlet` (PRO), `Profil Kesehatan` (GATE/SAFE), `Integrasi Strava` (SYNC).
  3. **Floating Edge Toggle Button (`top-1/2 -translate-y-1/2`):**
     - Positioned on the right border at vertical eye-level.
     - 28px circular button with `ChevronLeft` / `ChevronRight` icon.
     - Smooth hover scale (`hover:scale-110`).
  4. **State Persistence:** Preserves collapsed/expanded preference in `localStorage`.

---

## 3. PostActivityCheckinModal (Clinical Joint Safety Component)

Used for stand-alone or integrated evaluations of athlete training responses.

* **Anatomy:**
  1. **Protokol Keselamatan Sendi:** Alert box with `ShieldAlert` icon stating clinical load limits.
  2. **Sesi Terkait Header:** Badge jenis olahraga, nama sesi, tanggal kalender lokal, jarak tempuh, durasi total.
  3. **1. Skala Nyeri Sendi (0–10):**
     - *Saat Sesi Latihan* (0–10 slider)
     - *Sesaat Pasca Sesi* (0–10 slider)
     - *Keesokan Harinya* (0–10 slider)
  4. **2. Indikator Biologis & Pembatasan Keamanan:**
     - *Pembengkakan Sendi Teramati?* (Checkbox penanda efusi)
     - *Ketidakstabilan / Sendi Goyang?* (Checkbox penanda laxity ligamen)
  5. **Borg CR10 Perceived Exertion:** RPE 1–10 selector highlighting the Zone 2 aerobic target (RPE 3–4).
  6. **Catatan Subjektif:** Textarea untuk mendokumentasikan respon tendon dan sensasi otot.

---

## 4. WeeklyStreakCard (Thermodynamic Flame Retention)

Displays the athlete's cumulative active training weeks using physical combustion physics.

* **Anatomy:**
  1. **Header:** Streak duration (e.g. `10 Minggu Konsisten`).
  2. **Combustion Flame Engine:** Dynamic SVG rendering flame colors corresponding to combustion temperatures:
     - Tier 1 (1–3 mgg): $800^\circ\text{C}$ (Crimson `#D65F58`)
     - Tier 2 (4–7 mgg): $1,100^\circ\text{C}$ (Terracotta `#D98757`)
     - Tier 3 (8–11 mgg): $1,400^\circ\text{C}$ (Golden Amber `#E5A442`)
     - Tier 4 (12–19 mgg): $1,700^\circ\text{C}$ (Volt Emerald `#4D947B`)
     - Tier 5 (20–35 mgg): $2,000^\circ\text{C}$ (Electric Cyan `#00F0FF`)
     - Tier 6 (36+ mgg): $> 2,200^\circ\text{C}$ (Plasma Violet `#A855F7`)
  3. **Milestone Track:** Rolling visual bar towards next combustion tier.

---

## 5. ComparisonCard (Prescribed Plan vs Executed Actual)

Used on workout detail screens to contrast coach prescribed targets against Strava execution.

* **Anatomy:**
  1. **Dual Column Split:** Left column (Target Direncanakan) vs Right column (Realisasi Aktual).
  2. **Delta Indicators:**
     - Distance delta: $+0.42\text{ km}$ (Volt green if within 5%, amber if over/under).
     - Pace delta: $-5\text{s /km}$ (Volt green if matching target, amber if outside zone).
  3. **Completion Percentage:** Tabular percentage pill (e.g. `100%`).
