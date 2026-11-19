# Audit Komprehensif Sistem AI Coaching Eksisting (`a-coach`)

- **Tanggal & Waktu Audit**: 2026-11-17 14:45:00 WIB
- **Auditor**: Lead Sports Science & AI Architecture Auditor
- **Status Sistem Saat Ini**: **Spesifik Terbatas pada Monosiklus Endurance (Cycling & Running Rehab)**
- **Lokasi Dokumen**: `docs/11-ai/01-AUDIT_SISTEM_AI_COACHING_EXISTING.md`

---

## 1. Eksekutif Ringkasan (Executive Summary)

Pertanyaan Inti Pengguna:
> *"Apakah AI Coaching ini sudah terbiasa oleh semua cabor olahraga?"*

**Jawaban Objektif Berdasarkan Hasil Audit Kode Sumber (`src/lib/domain/coach/` & `src/lib/domain/physiology/`):**  
**BELUM.** Sistem AI Coaching pada repositori `a-coach` saat ini dirancang dan dikalibrasi secara eksklusif untuk **2 (dua) disiplin endurance terarah**, yaitu:
1. **Mountain Biking (MTB) / Road Cycling**: Berfokus pada pembangunan basis aerobik Zona 2, efisiensi kadens (>80 RPM), dan pemodelan impuls Banister (CTL, ATL, TSB).
2. **Running (Fase Rehabilitasi Sendi)**: Berfokus pada protokol keselamatan *Return-to-Run (RTR)* dengan pemutus sirkuit biologis (*circuit breaker*) untuk proteksi cedera ligamen pergelangan kaki (*Right Ankle ATFL*) dan sindrom nyeri lutut bilateral anterior.

Sistem **sama sekali belum siap dan belum memiliki model penalaran matematis-fisiologis untuk 30+ cabang olahraga lain di dunia** (seperti bela diri, olahraga tim lapangan, angkat beban daya/kekuatan, olahraga raket, panjat tebing, maupun olahraga air).

---

## 2. Inventarisasi Komponen AI Coaching yang Ada Saat Ini

Berdasarkan penelusuran arsitektur pada berkas:
- [`src/lib/domain/coach/aiCoachEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/aiCoachEngine.ts)
- [`src/lib/domain/coach/coachTrainingGenerator.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/coachTrainingGenerator.ts)
- [`src/lib/domain/coach/dailyCoachBriefingEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/dailyCoachBriefingEngine.ts)
- [`src/lib/domain/coach/coachGoalInsights.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/coachGoalInsights.ts)
- [`src/lib/domain/physiology/heartRateZones.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/physiology/heartRateZones.ts)

Sistem saat ini mengimplementasikan aturan logika berikut:

| Komponen Eksisting | Ranah Disiplin | Algoritma / Formula yang Digunakan | Batasan Operasional |
| :--- | :--- | :--- | :--- |
| **Circuit Breaker Cedera Sendi** | Running & Cycling | Status kesiapan klinis (`running_readiness == 'ON_HOLD'`) | Hanya mendeteksi Ankle ATFL & Nyeri Lutut; tidak mengenal *concussion*, *rotator cuff*, atau hernia diskus. |
| **Zona Karvonen HRR** | Kardiorespirasi Siklik | $\text{Target HR} = \text{RHR} + \%(\text{HRmax} - \text{RHR})$ | Hanya relevan untuk olahraga aerobik kontinu; tidak valid untuk *intermittent high-intensity* atau olahraga kekuatan maksimal. |
| **Model Impuls-Respons Banister** | Endurance PMC | $w(t) = \text{Duration} \times \Delta\text{HR} \times 0.64 e^{1.92 \Delta\text{HR}}$ | Menghitung TRIMP semata-mata dari denyut jantung; buta terhadap beban mekanis eksternal (tonase beban, benturan, sprint pendek). |
| **Preskripsi MTB Zone 2** | Bersepeda | Kadens >80 RPM, HR 140–152 bpm, gear datar | Tidak mengukur daya ledak anaerobik, efisiensi pedal stroke 360°, atau *handling* teknis jalur. |
| **Deteksi Deload & Puasa** | Pemulihan Mingguan | Penurunan volume 40-50% & kesadaran puasa Senin-Kamis | Dirancang untuk pelari/pesepeda santai; belum disesuaikan untuk jadwal kompetisi gulat (pemotongan berat badan) atau turnamen sepak bola beruntun. |

---

## 3. Kesenjangan Fisiologis & Kegagalan Model Monolitik Generic

Mengapa sistem AI Coaching **TIDAK BISA DIGABUNG** menjadi satu AI monolitik generik?  
Menggabungkan semua olahraga ke dalam satu *generic prompt* atau satu model komputasi akan menghasilkan apa yang disebut **"AI Slop" / Halusinasi Ilmiah Fatal**. Setiap cabang olahraga memiliki profil bioenergetika, kinetika, dan patologi cedera yang bertolak belakang:

### A. Kesenjangan Sistem Energi Primer (Bioenergetics Gap)
- **Endurance Siklik (Lari/Sepeda)**: 90–95% sistem Oksidatif (mitokondria, pembakaran asam lemak bebas & glikogen lambat).
- **Olahraga Kekuatan (Powerlifting/Weightlifting)**: 95–100% sistem Fosfagen (ATP-PCr / Creatine Phosphate) dengan durasi kerja <5-10 detik. Menggunakan TRIMP denyut jantung pada angkat beban adalah **kesalahan saintifik fatal** karena denyut jantung tinggi saat angkat beban dipicu oleh *Valsalva maneuver* (tekanan intratoraks), bukan regangan konsumsi oksigen aerobik!
- **Olahraga Tarung (Tinju/MMA/Silat)**: Sistem glikolitik anaerobik laktat tinggi bercampur dengan semburan ATP-PCr dan pemulihan aerobik antar-ronde.
- **Olahraga Beregu (Sepak Bola/Basket)**: Aktivitas intermiten acak (*repeated sprint ability* / RSA) dengan deselerasi eksentrik ekstrem.

### B. Kesenjangan Beban Mekanis vs Beban Internal
- Dalam sepak bola atau bulu tangkis, atlet mungkin menempuh jarak hanya 6 km (tampak kecil jika dibandingkan pesepeda 60 km), namun akumulasi **akselerasi (>3 m/s²), deselerasi (<-3 m/s²), dan perubahan arah 180°** menimbulkan kerusakan serat otot mikro (*micro-trauma*) dan stres tendon patela yang 5 kali lipat lebih tinggi daripada bersepeda 60 km.
- AI monolitik yang hanya membaca "Jarak 6 km" akan salah mengira bahwa sesi tersebut adalah "latihan ringan", padahal otot hamstring dan tendon ligamen atlet berada pada ambang cedera kritis.

### C. Kesenjangan Manajemen Cedera & Parameter Klinis
- Sepeda/Lari: Risiko utama adalah *overuse tendonitis* (Achilles, ITBS, Patellar).
- Bela Diri: Risiko utama adalah trauma kepala (*mild Traumatic Brain Injury* / mTBI), dislokasi acromioclavicular, dan hiperekstensi siku/lutut.
- Angkat Beban: Kompresi aksial tulang belakang (*lumbar shear strain*) dan robekan labrum bahu.

---

## 4. Kesimpulan Hasil Audit

1. **Status Kesiapan**: Sistem `a-coach` saat ini **HANYA SIAP** untuk *Endurance Cycling & Running Joint Protection*.
2. **Kebutuhan Mendesak**:
   - Mendesain taksonomi komprehensif **minimal 30 cabang olahraga** yang terbagi dalam klaster sistem energi dan biomekanika resmi.
   - Membangun **arsitektur Decoupled Multi-Agent AI Coach**, di mana setiap cabang olahraga memiliki model penalaran, formula metrik, dan parameter keselamatan independen tanpa dicampuradukkan.
   - Menyelaraskan setiap agen dengan literatur ilmiah terindeks (ACSM, NSCA, BJSM, ISSN, FIFA 11+, Bompa, Gabbett).
   - Membangun filter audit mandiri untuk memastikan rekomendasi bukan rekaan halusinasi AI, melainkan berpedoman pada ilmu kedokteran olahraga dan fisiologi murni.
