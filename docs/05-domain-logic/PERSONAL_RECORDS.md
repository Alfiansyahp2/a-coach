# Personal Records (PR) Benchmark Standards & Multi-Sport Architecture

**Status:** CONFIRMED  
**Version:** 2.0  
**Last Updated:** 2026-11-02  
**Owner:** Senior UI/UX Engineer, Data Analyst & Backend Lead  
**Related Documents:** [METRIC_DEFINITIONS.md](./METRIC_DEFINITIONS.md), [DATA_VISUALIZATION.md](../02-design/DATA_VISUALIZATION.md), [FUNCTIONAL_REQUIREMENTS.md](../01-product/FUNCTIONAL_REQUIREMENTS.md)

---

## 1. Overview & Dual-Discipline Philosophy

Sebagai platform performa atletik presisi tinggi (*Athletic Performance & Telemetry Platform*), sistem tidak memperlakukan seluruh aktivitas secara seragam atau hanya berfokus pada lari semata. Platform membedakan standar tolok ukur performa terbaik (*Personal Records / PR*) secara tegas antara disiplin **Lari (Running)** dan **Sepeda (Cycling / Ride)**:

1. **Running (Volt `#D4FF00`):** Berorientasi pada kecepatan lari teruji (*pace in min/km*), efisiensi kinematis, dan ketahanan jarak standar.
2. **Cycling (Cyan `#00F0FF`):** Berorientasi pada kecepatan rata-rata berkelanjutan (*speed in km/h*), volume ketahanan jarak jauh (*century prep*), dan elevasi tanjakan vertikal (*vertical climb*).

Semua rekor pribadi wajib memiliki **integritas data (*Data Provenance Integrity*)**: setiap rekor wajib tertaut ke entitas aktivitas konkret (`activity_id`) yang tersimpan di basis data dan terverifikasi dari telemetri Strava. Nilai statis (*fake mock numbers*) dilarang keras.

---

## 2. Multi-Sport Benchmark Categories

### A. Running Benchmarks (Disiplin Lari)
| Kategori PR | Kriteria Kelayakan (*Eligibility*) | Satuan Nilai (`record_value`) | Format Tampilan (`record_display`) | Aturan Penentuan Terbaik |
| :--- | :--- | :--- | :--- | :--- |
| **5K Benchmark** | Aktivitas lari dengan jarak $\ge 4,900\text{ m}$ (toleransi $-2\%$) | Waktu estimasi 5K (detik) | `MM:SS` (contoh: `31:55`) | Pace tercepat pada jarak $\ge 5\text{ km}$ dikalikan 5. |
| **10K Benchmark** | Aktivitas lari dengan jarak $\ge 9,800\text{ m}$ (toleransi $-2\%$) | Waktu estimasi 10K (detik) | `HH:MM:SS` atau `MM:SS` (contoh: `1:24:20`) | Pace tercepat pada jarak $\ge 10\text{ km}$ dikalikan 10. |
| **Longest Run** | Semua aktivitas bertipe `Run` | Jarak dalam meter | `XX.XX km` (contoh: `12.33 km`) | Nilai `distance_meters` terbesar dalam satu sesi tunggal. |
| **Best Aerobic Pace** | Aktivitas lari dengan jarak $\ge 5,000\text{ m}$ | Pace dalam detik per kilometer | `M:SS /km` (contoh: `6:23 /km`) | Rasio waktu bergerak per kilometer terendah ($\text{moving\_time} / d_{\text{km}}$). |
| **Max Elevation Gain** | Semua aktivitas bertipe `Run` | Elevasi dalam meter | `▲ XX m` (contoh: `▲ 20 m`) | Akumulasi tanjakan vertikal terbesar dalam satu sesi. |

### B. Cycling / Ride Benchmarks (Disiplin Sepeda)
| Kategori PR | Kriteria Kelayakan (*Eligibility*) | Satuan Nilai (`record_value`) | Format Tampilan (`record_display`) | Aturan Penentuan Terbaik |
| :--- | :--- | :--- | :--- | :--- |
| **Longest Ride** | Semua aktivitas bertipe `Ride` | Jarak dalam meter | `XX.XX km` (contoh: `56.10 km`) | Nilai `distance_meters` terbesar dalam satu sesi tunggal. |
| **Fastest Speed (≥20K)** | Aktivitas bersepeda dengan jarak $\ge 20,000\text{ m}$ | Kecepatan dalam km/h ($0.1$ presisi) | `XX.X km/h` (contoh: `23.8 km/h`) | Kecepatan rata-rata tertinggi pada rute jarak sedang/jauh ($\ge 20\text{ km}$). |
| **Max Elevation Climb** | Semua aktivitas bertipe `Ride` | Elevasi dalam meter | `▲ XXX m` (contoh: `▲ 125 m`) | Akumulasi tanjakan vertikal tertinggi dalam satu sesi bersepeda. |
| **40K+ Endurance Ride** | Aktivitas bersepeda dengan jarak $\ge 40,000\text{ m}$ | Jarak dalam kilometer ($0.01$ presisi) | `XX.XX km` (contoh: `56.10 km`) | Sesi ketahanan terpanjang ($\ge 40\text{ km}$) dengan kecepatan rata-rata tercepat. Kecepatan rata-rata ditampilkan di subteks pendukung (`Avg 21.4 km/h • century pace`). |

---

## 3. Mathematical & Detection Logic

Modul `src/lib/personalRecords.ts` bertindak sebagai mesin kalkulasi deterministik yang mengevaluasi himpunan aktivitas pengguna:

$$\text{Pace}_{\text{sec/km}} = \frac{\text{moving\_time\_seconds}}{\text{distance\_meters} / 1000}$$

$$\text{Speed}_{\text{km/h}} = \frac{\text{distance\_meters} / 1000}{\text{moving\_time\_seconds} / 3600}$$

```typescript
// Contoh evaluasi Best 5K:
const runs5k = runs.filter(r => r.distance_meters >= 4900);
const best5k = runs5k.reduce((best, cur) => {
  const bestPace = best.moving_time_seconds / (best.distance_meters / 1000);
  const curPace = cur.moving_time_seconds / (cur.distance_meters / 1000);
  return curPace < bestPace ? cur : best;
});
```

---

## 4. Database Schema & Data Integrity

Tabel `personal_records` di PostgreSQL menerapkan skema terkelola dengan constraint unik multi-kolom `(user_id, category)`:

```sql
CREATE TABLE IF NOT EXISTS personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
    sport_type VARCHAR(20) DEFAULT 'Run',
    category VARCHAR(50) NOT NULL,
    record_value NUMERIC(12, 2) NOT NULL,
    record_display VARCHAR(50) NOT NULL,
    achieved_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_user_pr_category UNIQUE (user_id, category)
);
```

### Relasi Aktivitas & Provenance:
- Setiap record menautkan `activity_id` ke tabel `activities`.
- Jika aktivitas sumber dihapus, constraint `ON DELETE SET NULL` memastikan rekor historis tetap tercatat dengan fallback tanpa merusak integritas database.

---

## 5. UI/UX & Design System Standards

Kartu rekor pribadi diimplementasikan pada komponen `PersonalRecordsDeck.tsx` dengan kaidah **Anti-AI-Slop Obsidian Telemetry**:
1. **Segmented Sport Controls:** Tombol filter cepat di kanan atas: `ALL` (semua), `RUN` (lari saja), dan `RIDE` (sepeda saja).
2. **Kromatik Semantik Berbeda:**
   - Rekor Lari: badge `RUN` dengan aksen Volt `#D4FF00`.
   - Rekor Sepeda: badge `RIDE` dengan aksen Cyan `#00F0FF`.
3. **Navigasi Klik Langsung:** Setiap kartu dapat diklik (`cursor-pointer`) untuk langsung membuka halaman detail telemetri aktivitas bersangkutan (`/activities/[id]`).
4. **Tipografi Tabular Monospace:** Angka rekor menggunakan font mono tabular berukuran besar (`text-lg font-bold font-mono font-tabular`) dengan tracking ketat.
