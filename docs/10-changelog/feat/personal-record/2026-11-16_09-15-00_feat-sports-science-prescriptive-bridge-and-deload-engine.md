# Changelog: Sports Science Prescriptive Bridge, Dual-Load Telemetry & Deload Supercompensation Engine (`feat/personal-record`)

- **Tanggal & Waktu**: 2026-11-16 09:15:00 WIB
- **Tipe**: `feat(domain)` / `feat(analytics)` / `feat(sports-science)` / `feat(ui)`
- **Commit Message Rujukan**: `feat(recap): implement sports science prescriptive bridge, dual-load telemetry, and automatic deload supercompensation recognition`
- **Branch**: `feat/personal-record`
- **Lokasi**: `docs/10-changelog/feat/personal-record/2026-11-16_09-15-00_feat-sports-science-prescriptive-bridge-and-deload-engine.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Berdasarkan audit mendalam terhadap cetak biru filosofi sains olahraga di [`docs/05-domain-logic/SPORTS_SCIENCE_RECAP_PHILOSOPHY_AND_APPLICATION_BLUEPRINT.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/05-domain-logic/SPORTS_SCIENCE_RECAP_PHILOSOPHY_AND_APPLICATION_BLUEPRINT.md), modul rekapitulasi sebelumnya mengidentifikasi sejumlah ketidaksesuaian mendasar antara data log aktivitas dan respon biologis atlet:

1. **Ketiadaan Jembatan Preskriptif Taktis (*Prescriptive Void*)**:
   - Rekap yang hebat tidak boleh hanya menoleh ke belakang (retrospektif), melainkan wajib menggunakan data masa lalu untuk merumuskan arahan konkret ke masa depan (preskriptif). Sebelumnya, sistem hanya menghasilkan teks naratif umum tanpa menetapkan batasan angka kuota kilometer aman, hari istirahat wajib, maupun target zona detak jantung bagi minggu depan.
2. **Misinterpretasi Siklus Deload (*Deload Penalty & Psychological Friction*)**:
   - Penurunan volume latihan (20–30%) seringkali disalahartikan sebagai "kemalasan" atau kegagalan program latihan. Padahal dalam fisiologi olahraga, deload adalah fase terencana yang mutlak diperlukan untuk restorasi simpanan glikogen, perbaikan mikrotrauma kolagen tendon/sendi, dan pencapaian superkompensasi mitokondria sebelum blok beban berikutnya.
3. **Disorientasi Psikologis Senin 00:00 (*The Monday Midnight Blank Slate*)**:
   - Secara psikologis atlet mengakhiri siklus latihan di Minggu malam. Pada Senin dini hari, kebutuhan pertama atlet adalah melihat hasil evaluasi utuh dari minggu yang baru tuntas, bukan langsung disambut tampilan kosong 0 km yang menghapus kepuasan mental atas pencapaian blok latihan yang baru saja diselesaikan.
4. **Reduksi Rekap Menjadi Odometer Kendaraan (*Passive Mileage Trap*)**:
   - Kartu metrik utama (*Hero Cards*) sebelumnya berfokus pada volume mentah (Total Jarak, Durasi, Kalori) layaknya odometer GPS kendaraan biasa. Rekapitulasi sejati harus menjawab satu pertanyaan biologis: *"Apakah tubuh atlet berhasil beradaptasi secara positif terhadap beban yang diberikan, atau justru mengalami kerusakan jaringan yang belum pulih?"*
5. **Pelanggaran Hukum Validitas Ganda (*Single-Load Disconnect*)**:
   - Jarak 10 km saat bugar bernilai fisiologis berbeda dengan 10 km saat lelah atau kurang tidur. Rekapitulasi wajib mengawinkan beban eksternal fisik (km & waktu bergerak) secara berdampingan dengan beban stres internal metabolik (*Foster sRPE* & TSS) beserta rasio biaya metabolik per kilometer.
6. **Keterbatasan Akses Integrasi Strava Berbayar (*Standalone Requirement*)**:
   - Pengguna belum dapat mengaktifkan sinkronisasi live berbayar Strava API karena kendala biaya. Oleh karena itu, seluruh logika rekapitulasi, perhitungan fisiologis, dan preskripsi taktis wajib beroperasi 100% mandiri (*standalone*) menggunakan basis data lokal PostgreSQL dan file store, tanpa ketergantungan pada panggilan jaringan eksternal.
7. **Gangguan Visual Bilah Geser (*Native Browser Scrollbar Glitch*)**:
   - Pada peramban desktop berbasis Windows (Chrome dan Edge), wadah selektor siklus horizontal memunculkan bilah geser bawaan berwarna abu-abu/putih tebal yang merusak kerapian antarmuka presisi atletik (*Anti-AI-Slop*).

Pembaruan ini mengimplementasikan **Sports Science Prescriptive Bridge & Deload Engine** yang mengubah rekapitulasi dari sekadar log perjalanan pasif menjadi instrumen diagnostik biologis yang preskriptif, apresiatif terhadap siklus pemulihan, dan mandiri secara operasional.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Lapisan Kontrak Data & Tipe Terdistribusi (`src/lib/domain/analytics/weeklyRecapBridgeTypes.ts`)

Berkas baru berukuran 53 baris yang memisahkan definisi kontrak preskriptif dan telemetri beban ganda agar mematuhi batas arsitektural `< 300 baris`:

1. **Interface `TacticalBridgePrescription`**:
   ```typescript
   export interface TacticalBridgePrescription {
     safe_km_quota: {
       total_max_km: number;
       cycling_km_cap: number;
       running_status: 'ALLOWED' | 'RESTRICTED' | 'ON_HOLD';
       running_max_km: number;
       rule_applied: string;
       rationale: string;
     };
     mandatory_rest_days: {
       count: number;
       recommended_days: string[];
       rationale: string;
     };
     target_hr_zones: {
       zone1_2_aerobic_min_pct: number;
       zone4_5_anaerobic_max_minutes: number;
       focus: string;
     };
     clinical_recovery_action: string;
   }
   ```
2. **Interface `DualLoadTelemetry` & `DeloadCelebration`**:
   ```typescript
   export interface DualLoadTelemetry {
     external_distance_km: number;
     external_duration_formatted: string;
     external_moving_time_hours: number;
     internal_srpe_load_au: number;
     internal_tss: number;
     internal_cost_ratio_au_per_km: number;
     internal_cost_ratio_au_per_hour: number;
     efficiency_verdict: string;
   }

   export interface DeloadCelebration {
     is_deload_week: boolean;
     volume_reduction_pct: number;
     title: string;
     appreciation_badge: string;
     scientific_rationale: string;
   }
   ```

---

### B. Mesin Kalkulator Jembatan Preskriptif & Adaptasi Biologis (`src/lib/domain/analytics/weeklyRecapBridgeCalculator.ts`)

Berkas kalkulator murni baru (*247 baris*) yang mengeksekusi perhitungan sains olahraga deterministik:

1. **Kalkulasi Beban Ganda & Biaya Metabolik (`computeDualLoadTelemetry`)**:
   - Mengawinkan jarak fisik dan waktu bergerak dengan *Foster sRPE* (Arbitrary Units / AU) dan TSS.
   - Menghitung rasio biaya metabolik per kilometer:
     $$\text{Internal Cost Ratio} = \frac{\text{Foster sRPE (AU)}}{\max(0.1, \text{Total Jarak (km)})}$$
   - Memberikan vonis efisiensi biologis: jika biaya $\le 5.0\text{ AU/km}$ dan Zona 1–2 $\ge 75\%$, status diklasifikasikan sebagai *Efisiensi Metabolik Tinggi (Hemat glikogen & beban internal terkelola)*.
2. **Pengenalan Deload Otomatis (`computeDeloadCelebration`)**:
   - Jika penurunan volume $\le -15\%$ dan tidak disertai nyeri sendi parah ($<6/10$), sistem menandai `is_deload_week = true`.
   - Mengeluarkan narasi sains edukatif bahwa penurunan volume adalah investasi biologis terencana untuk superkompensasi, bukan kemalasan.
3. **Rapor Adaptasi Biologis (`computeBiologicalAdaptationStatus`)**:
   - Mengevaluasi kemurnian kardiovaskular berdasarkan distribusi polarisasi Stephen Seiler ($\ge 75\%$ Zona 1–2 = *Optimal Aerobic Purity*).
   - Menghitung keseimbangan saraf otonom via rasio *Foster Monotony* ($<1.5$ = Stabil, $1.5\text{--}2.0$ = Stres Akumulatif, $>2.0$ = Risiko Simpatis Overdrive).
   - Menilai status kesiapan jaringan tendon/sendi pasca-latihan.
4. **Formulasi Jembatan Preskriptif (`computeTacticalBridgePrescription`)**:
   - Menetapkan batas kuota kilometer aman menggunakan prinsip batas kenaikan volume $+10\%$ Tim Gabbett (*Progressive Overload*) atau pemulihan terukur pasca-deload ($95\%$ kapasitas sebelum deload).
   - Mengatur alokasi lari secara protektif: ditangguhkan total (`ON_HOLD` 0 km) jika terdapat nyeri sendi aktif $\ge 3/10$ atau pembengkakan, dan mengalihkan $100\%$ volume ke sepeda non-impak.
   - Menetapkan 2–3 hari istirahat wajib berdasarkan skor monotoni dan beban strain.

---

### C. Integrasi Kalkulator Pro & Siklus Fisiologis (`src/lib/domain/analytics/weeklyRecapProCalculator.ts`)

1. **Sinkronisasi Parameter Baru**:
   - Memasukkan telemetri `dual_load`, `biological_adaptation`, `deload_info`, dan `tactical_bridge` ke dalam objek return `WeeklyProMetrics`.
2. **Penyesuaian Fase Periodisasi Otomatis**:
   - Saat deload terdeteksi, fase periodisasi secara otomatis diubah menjadi `DELOAD_RECOVERY` dengan interpretasi saintifik positif.
3. **Kepatuhan Modularitas**:
   - Berkas tetap ringkas di angka **233 baris** (jauh di bawah batas 300 baris).

---

### D. Transformasi Antarmuka Rapor Adaptasi Biologis & Validitas Ganda

1. **`WeeklyRecapHeroCards.tsx` (156 baris)**:
   - Menggantikan kartu odometer biasa dengan 4 Kartu Rapor Adaptasi Biologis:
     * **Kartu 1 (Dual-Load):** Total Jarak (km) disandingkan berdampingan dengan Beban Internal (AU) dan Biaya Metabolik per km.
     * **Kartu 2 (Adaptasi Biologis):** Kemurnian Kardiovaskular (% Z1–2) dan Keseimbangan Saraf Otonom.
     * **Kartu 3 (Integritas Sendi):** Nyeri puncak (/10), status pembengkakan, dan persentase proteksi sepeda non-impak.
     * **Kartu 4 (Fase Siklus & Jaringan):** Lencana status `DELOAD` vs `PROGRESIF`, jumlah sesi bebas nyeri, dan alokasi hari aktif/istirahat.
2. **`WeeklyRecapTacticalBridge.tsx` (167 baris)**:
   - Komponen visual baru yang menampilkan arahan konkret minggu depan: Kuota Kilometer Aman, Hari Istirahat Wajib dengan rekomendasi hari spesifik, Target Zona HR Aerobik vs batas Zona 4–5, serta protokol klinis pemulihan jaringan.
3. **`WeeklyRecapDeloadBanner.tsx` (43 baris)**:
   - Banner apresiasi bertema cyan/emerald yang merayakan deload terencana sebagai fase pemulihan glikogen dan regenerasi kolagen.
4. **`WeeklyRecapHub.tsx` (289 baris) & `WeeklyRecapCard.tsx` (290 baris)**:
   - Menghadirkan spanduk refleksi mendalam Senin 00:00: *"Senin Dini Hari: Waktu Refleksi Biologis, Bukan Kertas Kosong"*.
   - Mengintegrasikan utilitas `[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden` pada wadah selektor siklus horizontal sehingga bebas dari scrollbar desktop peramban Windows.
5. **`WeeklyRecapDetailModal.tsx` (237 baris) & `WeeklyRecapPrescription.tsx` (123 baris)**:
   - Menyajikan ringkasan jembatan preskriptif taktis (batas aman, hari istirahat, target zona) pada dossier rincian mingguan dan kartu resep klinis.

---

### E. Rekayasa Gaya Global Beban Scrollbar (`src/app/globals.css`)

- Menambahkan penguatan aturan universal `.no-scrollbar` dengan `!important` untuk memastikan peramban Chromium/Edge/Firefox di lingkungan Windows tidak menampilkan scrollbar horizontal:
  ```css
  /* Universal No-Scrollbar utility (hides native scrollbars across Chrome, Edge, Safari, Firefox) */
  .no-scrollbar::-webkit-scrollbar {
    display: none !important;
    width: 0px !important;
    height: 0px !important;
  }
  .no-scrollbar {
    -ms-overflow-style: none !important;
    scrollbar-width: none !important;
  }
  ```

---

## 3. Matriks Perbandingan Git Diff

| File Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/lib/domain/analytics/weeklyRecapBridgeTypes.ts` | Baru | +53 | 0 | Definisi kontrak tipe preskriptif, adaptasi biologis, deload, & dual-load |
| `src/lib/domain/analytics/weeklyRecapBridgeCalculator.ts` | Baru | +247 | 0 | Mesin kalkulasi rasio biaya metabolik, jembatan preskriptif taktis, & deload |
| `src/components/recap/WeeklyRecapTacticalBridge.tsx` | Baru | +167 | 0 | Kartu visual arahan preskriptif konkret minggu depan (kuota km, rest days, zona) |
| `src/components/recap/WeeklyRecapDeloadBanner.tsx` | Baru | +43 | 0 | Banner apresiasi & edukasi superkompensasi saat fase deload terdeteksi |
| `src/lib/domain/analytics/weeklyRecapTypes.ts` | Modifikasi | +12 | 0 | Ekspor kontrak jembatan preskriptif & perluasan interface `WeeklyProMetrics` |
| `src/lib/domain/analytics/weeklyRecapProCalculator.ts` | Modifikasi | +58 | -4 | Integrasi kalkulator bridge, status pembengkakan, & orkesrasi telemetri |
| `src/components/recap/WeeklyRecapHeroCards.tsx` | Modifikasi | +114 | -25 | Redesain 4 kartu pahlawan menjadi Rapor Adaptasi Biologis & Validitas Ganda |
| `src/components/recap/WeeklyRecapPrescription.tsx` | Modifikasi | +30 | -2 | Penambahan ringkasan target batas aman & hari istirahat pada kartu preskripsi |
| `src/components/recap/WeeklyRecapHub.tsx` | Modifikasi | +58 | -59 | Spanduk refleksi Senin 00:00, integrasi bridge card, & selektor zero-scrollbar |
| `src/components/analytics/WeeklyRecapCard.tsx` | Modifikasi | +6 | -5 | Penyelarasan banner refleksi siklus tuntas & selektor siklus bebas scrollbar |
| `src/components/analytics/WeeklyRecapDetailModal.tsx` | Modifikasi | +27 | -2 | Penyajian metrik jembatan preskriptif pada modal dossier telemetri mingguan |
| `src/app/globals.css` | Modifikasi | +5 | -3 | Penguatan class `.no-scrollbar` cross-browser dengan `!important` |
| `scripts/tests/test_multi_week_recap_system.js` | Modifikasi | +69 | 0 | Penambahan pengujian preskripsi taktis, dual-load, & deteksi deload positif |
| `docs/10-changelog/README.md` | Modifikasi | +3 | -2 | Sinkronisasi indeks katalog master dan penambahan rujukan berkas |

**Total Perubahan**: 14 file termodifikasi/dibuat, **+892 baris ditambahkan**, **-102 baris dihapus**.

---

## 4. Hasil Pengujian & Jaminan Mutu

1. **Suite Pengujian Mesin Rekapitulasi Multi-Minggu & Preskripsi Sains Olahraga**:
   - `npx tsx scripts/tests/test_multi_week_recap_system.js` $\to$ **10 PASSED, 0 FAILED (100%)**.
     * `✅ PASS: Monday at 00:00 automatically defaults to completed week`
     * `✅ PASS: Mid-week with 0 sessions defaults to completed week`
     * `✅ PASS: Mid-week with recorded sessions stays on current week`
     * `✅ PASS: discoverAvailableRecapWeeks buckets activities across historical weeks`
     * `✅ PASS: computeMultiWeekRollup calculates 2-week block aggregation and trend`
     * `✅ PASS: computeMultiWeekRollup calculates 4-week monthly mesocycle rollup`
     * `✅ PASS: Recap orchestrator returns available historical weeks and rollup`
     * `✅ PASS: Computes Tactical Bridge Prescription with Safe KM Quota and Mandatory Rest Days`
     * `✅ PASS: Computes Dual-Load Telemetry coupling External Load with Internal Metabolic Strain`
     * `✅ PASS: Recognizes Deload Week as Planned Supercompensation (Not Laziness or Failure)`
2. **Suite Regresi Menyeluruh Platform (`test:all`)**:
   - `npm run test:all` $\to$ **83 PASSED, 0 FAILED (100% Green)** di seluruh 6 rangkaian pengujian:
     * `test:health`: 31 passed, 0 failed
     * `test:coach`: 5 passed, 0 failed
     * `test:streak`: 21 passed, 0 failed
     * `test:bola`: Seluruh tes lolos (BOLA defense & session cryptography)
     * `test:multi-week-recap`: 10 passed, 0 failed
     * `test:python`: 16 passed, 0 failed (FastAPI & Banister impulse response)
3. **Pemeriksaan Kompilasi TypeScript**:
   - `npx tsc --noEmit` $\to$ **Exit code 0 (0 Error, 100% Type-Safe)**.
4. **Verifikasi Produksi Next.js Build**:
   - `npm run build` $\to$ **34/34 rute terkompilasi dan digenerasi secara sempurna** tanpa peringatan rute.
5. **Verifikasi Batas Baris Kode (< 300 Baris)**:
   - Seluruh 12 berkas produksi yang disentuh diverifikasi berada di bawah batas ketat 300 baris (berkisar antara 43 hingga 290 baris).
6. **Verifikasi Operasional Standalone**:
   - Sistem terverifikasi berjalan mandiri tanpa memanggil endpoint jaringan Strava eksternal, mengeksekusi komputasi fisiologis secara aman dari PostgreSQL 16 dan cadangan `.data/store.json`.
