# Sports Science Recap Philosophy & Application Architecture Blueprint

- **Status**: AUTHORITATIVE DOMAIN SPECIFICATION & BLUEPRINT
- **Domain**: Endurance Sports Science, Workload Monitoring, Periodization & Clinical Safety
- **Tanggal Penyusunan**: 2026-11-16
- **Lokasi**: [`docs/05-domain-logic/SPORTS_SCIENCE_RECAP_PHILOSOPHY_AND_APPLICATION_BLUEPRINT.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/05-domain-logic/SPORTS_SCIENCE_RECAP_PHILOSOPHY_AND_APPLICATION_BLUEPRINT.md)
- **Target Integrasi**: Next.js Domain Layer (`src/lib/domain/analytics/`), Python Sports Science Core (`python_engine/domain/physiology/`), dan UI Deck (`src/components/recap/`, `src/components/analytics/`)

---

## 1. Pendahuluan & Visi Filosofis

Dalam ekosistem aplikasi keolahragaan modern (seperti Strava, Garmin Connect, atau TrainingPeaks), fitur **"Rekap"** sering kali direduksi menjadi sekadar agregator jarak pasif (*passive odometer*): hanya menjumlahkan kilometer, total durasi, kalori terbakar, dan elevasi vertikal. 

Berdasarkan literatur ilmiah kedokteran olahraga (*sports science*), pendekatan konvensional ini mengandung cacat metodologis mendasar (**"The External Distance Fallacy"**):
1. **Jarak Bersifat Menipu**: Bersepeda 50 km santai di Zone 2 datar menuntut adaptasi metabolik, stimulasi glikogen, dan waktu pemulihan yang sangat berbeda dibandingkan bersepeda 50 km tanjakan curam di Zone 4–5.
2. **Ketiadaan Konteks Biologis**: Mengabaikan respon fisiologis internal (*internal strain*) dan toleransi jaringan muskuloskeletal atlet (tendon, ligamen, dan sendi).
3. **Ketiadaan Arah Aksi**: Rekap konvensional hanya melihat ke masa lalu (*retrospektif murni*) tanpa memberikan arahan preskriptif ke masa depan (*what to do next*).

Dokumen ini menyajikan kajian atas **10 riset ilmiah keolahragaan dunia**, evaluasi kritis atas kelebihan dan kekurangannya, merumuskan **12 kesimpulan baru (meta-kesimpulan)**, serta menetapkan cetak biru (*blueprint*) arsitektur implementasi yang terbaik untuk aplikasi kita.

---

## 2. Bedah 10 Riset & Teori Fisiologi Olahraga Terkemuka

### 1. Model Session-RPE, Monotoni, & Strain — Prof. Carl Foster (1998, 2001)
* **Kajian Ilmiah**:
  Foster membuktikan bahwa persepsi kelelahan subjektif atlet (Rating of Perceived Exertion / RPE skala 1–10) dikalikan durasi sesi latihan (menit) menghasilkan estimasi beban stres internal yang sangat akurat:
  $$\text{Foster sRPE Load} = \sum_{i=1}^n (\text{RPE}_i \times \text{Duration}_{i,\text{min}}) \quad [\text{Arbitrary Units / AU}]$$
  Foster juga memperkenalkan metrik **Training Monotony** dan **Training Strain**:
  $$\text{Monotony} = \frac{\text{Mean Daily Load}}{\text{SD Daily Load}}, \quad \text{Strain} = \text{Weekly Load} \times \text{Monotony}$$
* **Kelebihan untuk Rekap**: Sangat sensitif mendeteksi risiko sindrom overtraining dan infeksi pernapasan akut jika variasi latihan harian terlalu datar ($\text{Monotony} > 2.0$).
* **Kelemahan jika Berdiri Sendiri**: Subjektif; nilai RPE dapat terdongkrak oleh stres psikologis non-latihan (beban pekerjaan atau kurang tidur) tanpa adanya kenaikan beban mekanis nyata.

---

### 2. Model Impuls-Respon Fitness-Fatigue — Dr. Eric W. Banister (1975, 1990)
* **Kajian Ilmiah**:
  Setiap dosis latihan menghasilkan dua kurva impuls biologis:
  - **Fitness / CTL (Chronic Training Load)**: Akumulasi kebugaran jangka panjang dengan konstanta peluruhan lambat ($\tau_1 \approx 42\text{ hari}$).
  - **Fatigue / ATL (Acute Training Load)**: Kelelahan jangka pendek dengan peluruhan cepat ($\tau_2 \approx 7\text{ hari}$).
  - **Form / TSB (Training Stress Balance)**: Kesiapan performa aktual:
    $$\text{TSB}(t) = \text{CTL}(t) - \text{ATL}(t)$$
* **Kelebihan untuk Rekap**: Memungkinkan rekap mingguan mendiagnosis apakah atlet berada dalam fase penumpukan kelelahan produktif (*productive overload*) atau kelelahan berbahaya.
* **Kelemahan jika Berdiri Sendiri**: Membutuhkan riwayat data historis yang panjang ($\ge 6\text{--}8\text{ minggu}$) dan tidak mendeteksi peradangan jaringan lokal (tendon/sendi).

---

### 3. Model Polarisasi Intensitas 80/20 — Prof. Stephen Seiler (2006, 2010)
* **Kajian Ilmiah**:
  Studi Seiler terhadap atlet ketahanan elit internasional menunjukkan bahwa performa terbaik dicapai dengan distribusi piramida polarisasi 3-zona:
  - $\ge 75\text{--}80\%$ waktu dialokasikan pada **Zone 1–2** (Aerobik Fondasi di bawah ambang laktat ventilasi pertama / LT1).
  - $< 20\%$ dialokasikan pada **Zone 4–5** (Intensitas Tinggi di atas LT2 / VO2max).
  - Waktu di **Zone 3 (Tempo)** ditekan seminimal mungkin karena merupakan *"The Black Hole of Training"* (menguras sistem saraf simpatik tanpa memberi stimulasi mitokondria murni).
* **Kelebihan untuk Rekap**: Menjadi instrumen audit kualitas beban mingguan yang sangat objektif.
* **Kelemahan jika Berdiri Sendiri**: Memerlukan kalibrasi ambang detak jantung (*HRmax* / *LTHR*) yang akurat; zona yang meleset akan membiaskan klasifikasi polarisasi.

---

### 4. Acute:Chronic Workload Ratio (ACWR) — Dr. Tim Gabbett (2016)
* **Kajian Ilmiah**:
  Gabbett memformulasikan rasio beban akut (beban 7 hari terakhir) terhadap beban kronis (rata-rata 28 hari terakhir):
  $$\text{ACWR} = \frac{\text{Acute Workload (1 Week)}}{\text{Chronic Workload (4 Weeks)}}$$
  - $\text{ACWR } 0.8\text{--}1.3$: *The Sweet Spot* (adaptasi kebugaran optimal, risiko cedera minimal).
  - $\text{ACWR } > 1.5$: *The Danger Zone* (lonjakan beban drastis melipatgandakan risiko cedera muskuloskeletal 2–4 kali lipat).
* **Kelebihan untuk Rekap**: Berfungsi sebagai radar pendeteksi lonjakan volume (*spike warning*) untuk mengamankan aturan kenaikan volume $\le 10\%$ per minggu.
* **Kelemahan jika Berdiri Sendiri**: Model rata-rata bergerak sederhana (*rolling average*) rentan terhadap artefak pergeseran; lebih presisi bila digabungkan dengan pembobotan eksponensial (EWMA).

---

### 5. Arsitektur Periodisasi Mesosiklus 3:1 — Tudor Bompa & Lev Matveyev (1965, 1999)
* **Kajian Ilmiah**:
  Adaptasi manusia terhadap stres fisik berlangsung dalam pola undulasi. Arsitektur blok paling teruji adalah siklus 4-mingguan ($3:1$):
  - Tiga minggu beban progresif (*Step 1: Base Build*, *Step 2: Load Incremental*, *Step 3: Overload Peak*).
  - Satu minggu penurunan beban terencana (*Deload / Unloading Week*, penurunan volume $20\text{--}30\%$) untuk memfasilitasi superkompensasi struktural.
* **Kelebihan untuk Rekap**: Menempatkan rekap mingguan ke dalam konteks makro: atlet mengetahui posisi minggu ini dalam peta besar 12-minggu.
* **Kelemahan jika Berdiri Sendiri**: Desain kaku sering kali tidak mampu mengakomodasi gangguan hidup nyata atlet amatir (sakit mendadak, lembur kerja, atau stres non-olahraga).

---

### 6. Dikotomi Beban Internal vs Eksternal — Franco Impellizzeri et al. (2004, 2019)
* **Kajian Ilmiah**:
  Impellizzeri menegaskan pemisahan tegas antara stimulus fisik luar (**External Workload**: km, watt, elevasi, kecepatan) dan respon fisiologis/psikologis atlet (**Internal Workload**: HR, laktat, RPE). Tubuh tidak beradaptasi terhadap kilometer; tubuh beradaptasi terhadap gangguan homeostasis internal yang ditimbulkan oleh kilometer tersebut.
* **Kelebihan untuk Rekap**: Memutus kesalahpahaman umum bahwa dua sesi dengan jarak tempuh identik selalu memiliki efek biologis yang sama.
* **Kelemahan jika Berdiri Sendiri**: Membutuhkan integrasi multi-aliran data (GPS + monitor detak jantung + check-in mandiri atlet).

---

### 7. Training Stress Score (TSS) & Intensitas Normalisasi — Dr. Andrew Coggan & Hunter Allen (2006)
* **Kajian Ilmiah**:
  TSS mengukur beban latihan berdasarkan intensitas relatif terhadap ambang fungsional (FTP atau FTHR). TSS menggunakan pembobotan kuadrat keempat (*fourth-power weighting*) untuk menghargai stres metabolik non-linier dari lonjakan anaerobik:
  $$\text{TSS} = \frac{t \times \text{NP} \times \text{IF}}{\text{FTP} \times 3600} \times 100$$
* **Kelebihan untuk Rekap**: Menstandarkan sesi sepeda dan lari ke dalam satu mata uang beban fisiologis yang setara.
* **Kelemahan jika Berdiri Sendiri**: Bergantung mutlak pada ketersediaan sensor daya (*power meter*) atau monitor denyut jantung yang bebas dari lonjakan *glitch*.

---

### 8. Skala Keseimbangan Stres-Pemulihan (RESTQ-Sport) — Prof. Michael Kellmann (2002, 2018)
* **Kajian Ilmiah**:
  Peningkatan kapasitas atletik bukan fungsi dari besarnya volume latihan, melainkan fungsi dari **kapasitas pemulihan (*recovery capacity*)**. Gejala *under-recovery* mendahului sindrom *overtraining*.
* **Kelebihan untuk Rekap**: Mewajibkan rekap memuat data regenerasi atlet (kualitas tidur, keluhan nyeri otot, dan ketersediaan energi).
* **Kelemahan jika Berdiri Sendiri**: Menuntut kepatuhan atlet dalam mengisi data check-in harian.

---

### 9. Variabilitas Detak Jantung (HRV) & Respon Saraf Otonom — Dr. Martin Buchheit & Shona Halson (2014)
* **Kajian Ilmiah**:
  Modulasi saraf otonom (simpatik vs parasimpatik) tercermin secara objektif melalui rMSSD (Root Mean Square of Successive Differences) dan Resting Heart Rate (RHR). Penurunan rMSSD di bawah *baseline* normal menandakan kelelahan saraf sistemik.
* **Kelebihan untuk Rekap**: Menyediakan sinyal biomarker independen yang bebas dari bias persepsi atlet.
* **Kelemahan jika Berdiri Sendiri**: Sangat sensitif terhadap faktor lingkungan di luar olahraga (alkohol, kafein malam hari, dehidrasi, atau fluktuasi suhu tidur).

---

### 10. Kontinuum Patologi Tendon & Biomekanika Impak — Prof. Jill Cook & Craig Purdam (2009)
* **Kajian Ilmiah**:
  Tendon memiliki metabolisme lambat dan sifat viskoelastis. Tendon tidak merespons beban kardiovaskular, melainkan bereaksi terhadap **beban mekanis regangan impak (*stretch-shortening cycle*)**. Lari menghasilkan beban impak $2.5\text{--}3\times$ bobot tubuh per langkah, sedangkan sepeda adalah rantai kinetik tertutup non-impak (*closed kinetic chain*).
* **Kelebihan untuk Rekap**: Menjadi dasar ilmiah wajib untuk membedah rekap lari vs sepeda pada atlet dual-disiplin yang memiliki riwayat cedera ligamen atau tendon patella/achilles.
* **Kelemahan jika Berdiri Sendiri**: Hanya mengevaluasi aspek muskuloskeletal tanpa memotret adaptasi kardiometabolik.

---

## 3. Evaluasi Kritis: Sintesis Kekurangan vs Keunggulan untuk Rekap

Berdasarkan telaah 10 riset di atas, berikut adalah perbandingan tajam antara sistem rekap konvensional dengan sistem rekap berbasis *Sports Science*:

| Parameter Evaluasi | Rekap Konvensional (Biasa / Kurang) | Rekap Saintifik Berkinerja Tinggi (Wajib Ada) |
| :--- | :--- | :--- |
| **Fokus Utama** | Menghitung akumulasi kilometer eksternal murni (*Odometer mentality*). | Menyeimbangkan beban kerja fisik eksternal dengan beban stres internal (Foster sRPE & TSS). |
| **Karakter Intensitas** | Menyamaratakan seluruh kilometer tanpa memandang zona detak jantung. | Memetakan distribusi polarisasi 80/20 Seiler dan menyalakan alarm bila terjebak di *Zone 3 Black Hole*. |
| **Sensitivitas Cedera** | Pasif; menunggu atlet berhenti total karena cedera parah. | Proaktif; memantau tren nyeri lokal tendon/sendi pasca latihan (Cook & Purdam). |
| **Cakupan Waktu** | Hanya meninjau 7 hari kalender terisolasi tanpa korelasi masa lalu. | Menganalisis blok 2-minggu (ACWR Gabbett) dan siklus periodisasi 4-minggu (Bompa 3:1). |
| **Arah Fungsi** | Retrospektif pasif (hanya melaporkan apa yang telah terjadi). | Preskriptif aktif (memberikan jembatan saran taktis untuk persiapan minggu depan). |
| **Perlakuan Dual-Disiplin** | Mencampuradukkan jarak lari dan sepeda ke dalam satu angka agregat. | Memisahkan beban impak berat (lari) dari pemulihan aktif non-impak (sepeda). |

---

## 4. 12 Kesimpulan Baru (Meta-Conclusions) untuk Rekap Olahraga Ideal

Dari sintesis 10 riset dan evaluasi kritis di atas, dirumuskan **12 Prinsip Arsitektur Utama** yang mendasari rekap olahraga ideal:

1. **Rekap Adalah Rapor Adaptasi Biologis**: Bukan sekadar pencatat spidometer. Tugas utamanya adalah menjawab: *"Apakah tubuh berhasil beradaptasi atau justru terancam breakdown?"*
2. **Hukum Validitas Ganda (Dual-Load Law)**: Beban eksternal (km, durasi) wajib disandingkan dengan beban internal (Foster sRPE, TSS, HR).
3. **Audit Kualitas Polarisasi 80/20**: Memastikan $\ge 75\text{--}80\%$ waktu dihabiskan di Zone 1–2 aerobik dasar dan memperingatkan atlet dari bahaya *"The Black Hole of Training"* (Zone 3).
4. **Otomatisasi Momen Refleksi Senin 00:00**: Saat jam bergeser ke hari Senin, atlet memerlukan evaluasi tuntas minggu lalu, bukan layar kosong 0 km yang menghapus rasa pencapaian.
5. **Perspektif Mesosiklus Bulanan (4-Minggu)**: Mengamati tren 28 hari untuk memvalidasi apakah atlet sedang dalam fase pembangunan progresif (*Build*) atau waktu pemulihan terencana (*Deload*).
6. **Pemisahan Asimetris Beban Impak Tendon**: Membedakan secara tegas volume lari berimpak tinggi ($3\times$ bobot tubuh) dari volume sepeda rantai tertutup non-impak demi melindungi sendi lutut dan engkel.
7. **Variasi Beban Lebih Menyelamatkan daripada Total Volume Rendah**: Mengukur skor monotoni latihan Foster. Latihan dengan variasi harian yang kaya jauh lebih aman dibanding volume rendah yang monoton.
8. **Detektor Lonjakan Akut (Acute Spike Warning)**: Menyalakan alarm keselamatan jika volume mingguan melonjak $> 10\text{--}15\%$ dibanding minggu sebelumnya (ACWR Gabbett).
9. **Kredibilitas Data Subjektif Atlet**: Data keluhan nyeri dan rasa lelah pasca sesi memiliki bobot diagnosis yang setara dengan data satelit GPS atau denyut nadi.
10. **Apresiasi Positif atas Fase Deload**: Mengenali penurunan volume terencana sebagai bagian vital dari adaptasi superkompensasi, bukan sebagai "penurunan performa" atau kemalasan.
11. **Vonis Keselamatan Tegas (Clinical Circuit Breaker)**: Sistem harus berani menjatuhkan status `SUSPENDED` atau `RESTRICTED` ketika pembengkakan sendi atau nyeri $\ge 6/10$ terdeteksi.
12. **Jembatan Taktis Preskriptif (The Bridge Advice)**: Rekap yang sempurna selalu diakhiri dengan 1–2 arahan konkret untuk minggu berikutnya (target volume aman, alokasi istirahat, dan zona intensitas).

---

## 5. Cetak Biru Rekomendasi Fitur untuk Aplikasi Kita

Berdasarkan 12 prinsip di atas, berikut adalah cetak biru penyempurnaan yang telah dan akan diterapkan pada platform kita:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   ARSITEKTUR REKAP SAINTIFIK TERPADU                     │
├──────────────────────────────────────────────────────────────────────────┤
│ 1. LAYER DOMAIN & KALKULATOR (Next.js + Python Core Engine)             │
│    - multiWeekRecapEngine.ts: Otomatisasi Senin 00:00 & Discovery 12 Mgg│
│    - weeklyRecapProCalculator.ts: Foster sRPE, TSS, Seiler 80/20, WoW % │
│    - weeklyRecapInjury.ts: Evaluasi Nyeri Tendon & Vonis Klinis         │
├──────────────────────────────────────────────────────────────────────────┤
│ 2. LAYER UI DASBOR TAKTIS (MODUL TAKTIS)                                │
│    - WeeklyRecapCard.tsx: Kartu Ringkas, Status Nyeri, Foster Load,     │
│      dan Selektor Siklus No-Scrollbar.                                  │
├──────────────────────────────────────────────────────────────────────────┤
│ 3. LAYER HUB ANALITIK MENDALAM (/recap)                                 │
│    - MultiWeekMesocycleDeck.tsx: Tinjauan Blok 14-Hari & Mesosiklus 1M │
│    - WeeklyRecapProMetricsSection.tsx: Diagram Batang Polarisasi 80/20, │
│      Foster sRPE, Keseimbangan Beban Impak Sendi, & Bridge Advice.      │
│    - WeeklyRecapTimeline.tsx: Rekam Jejak Rinci 7-Hari Sesi & Check-in. │
└──────────────────────────────────────────────────────────────────────────┘
```

### Rincian Rekomendasi Implementasi:

1. **Dashboard Taktis (`src/components/analytics/WeeklyRecapCard.tsx`)**:
   - Berfungsi sebagai **Radar Cepat**: Menampilkan status keselamatan sendi, volume mingguan, skor Foster sRPE, dan banner transisi Senin 00:00 dengan bilah navigasi siklus tanpa scrollbar kaku (`no-scrollbar`).
2. **Hub Rekap Lengkap (`src/components/recap/WeeklyRecapHub.tsx`)**:
   - Berfungsi sebagai **Laboratorium Analisis**: Menyediakan pengalih cakupan (`1 Minggu`, `2 Minggu`, `1 Bulan`), visualisasi mesosiklus bulanan ([`MultiWeekMesocycleDeck.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/recap/MultiWeekMesocycleDeck.tsx)), audit polarisasi Seiler 80/20, serta timeline harian.
3. **Penyelarasan Data Riil Tanpa Data Palsu**:
   - Memastikan seluruh rekor dan perhitungan rekap berakar 100% pada data riil aktivitas atlet di PostgreSQL (telah disinkronkan ke 8 rekor terverifikasi).
4. **Preskripsi Jembatan Pelatih (Coach Bridge)**:
   - Setiap akhir rekap menyajikan arahan adaptif untuk minggu berikutnya berdasarkan korelasi beban dan respon sendi.

---

## 6. Status Kepatuhan & Matriks Verifikasi Dokumen

| Komponen Dokumen | Sumber Rujukan Ilmiah | Status di Kode Aplikasi |
| :--- | :--- | :---: |
| **Foster sRPE & Monotoni** | Foster et al. (1998, 2001) | ✅ `weeklyRecapProCalculator.ts` |
| **Polarisasi Seiler 80/20** | Seiler (2006, 2010) | ✅ `weeklyRecapProCalculator.ts` |
| **ACWR & WoW Volume Delta** | Gabbett (2016) | ✅ `multiWeekRecapEngine.ts` |
| **Mesosiklus Bulanan (3:1)** | Bompa & Matveyev (1999) | ✅ `MultiWeekMesocycleDeck.tsx` |
| **Proteksi Nyeri Sendi** | Cook & Purdam (2009) | ✅ `weeklyRecapInjury.ts` |
| **Otomatisasi Senin 00:00** | Principle #4 (Human-Centered UX) | ✅ `multiWeekRecapEngine.ts` |
| **Eliminasi Desktop Scrollbar** | Anti-AI-Slop Clean UI | ✅ `globals.css` & `WeeklyRecapHub.tsx` |

Dokumen ini menjadi rujukan filosofis dan teknis resmi untuk pengembangan fitur analitik performa atletik pada platform *Endurance Performance Lab*.
