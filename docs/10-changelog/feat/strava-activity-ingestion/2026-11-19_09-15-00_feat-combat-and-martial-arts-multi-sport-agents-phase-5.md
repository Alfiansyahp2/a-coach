# Changelog: Decoupled Combat & Martial Arts Multi-Sport AI Agents (Phase 5)

- **Tanggal & Waktu**: 2026-11-19 09:15:00 WIB
- **Tipe**: `feat(domain)` / `feat(combat-sports)` / `feat(ai-coaching)` / `feat(sports-science)`
- **Commit Message Rujukan**: `feat(combat-sports): implement decoupled combat and martial arts ai agents, SCAT6 concussion lockout, round density, and weight-cut safety (phase 5)`
- **Branch**: `feat/strava-activity-ingestion`
- **Lokasi**: `docs/10-changelog/feat/strava-activity-ingestion/2026-11-19_09-15-00_feat-combat-and-martial-arts-multi-sport-agents-phase-5.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Setelah penyelesaian **Phase 1** (Fondasi & Kernel Bersama), **Phase 2** (Klaster Endurance Flagship), **Phase 3** (Klaster Kekuatan & Daya Maksimal), dan **Phase 4** (Klaster Olahraga Beregu Lapangan & Gelanggang), platform analitik atletik `project_strava` mengarahkan fokus ke cabor dengan intensitas anaerobik tertinggi dan risiko benturan fisik paling kritis: **Klaster Bela Diri & Kontak Fisik (*High-Intensity Combat & Martial Arts*)**.

Olahraga seperti Tinju, MMA, Brazilian Jiu-Jitsu (BJJ), Pencak Silat, Judo, dan Muay Thai memiliki profil bioenergetika glikolitik laktat yang sangat intens ($10 - 20\text{ mmol/L}$ laktat darah) dan bahaya klinis unik yang membutuhkan penanganan deterministik sains kedokteran olahraga:

1. **Bahaya Trauma Kepala & Gegar Otak (*Traumatic Brain Injury / Concussion*)**:
   - Benturan keras ke kepala pada tinju, MMA, dan Muay Thai rentan memicu gegar otak (*mTBI*). Ketiadaan gerbang protokol deterministik **SCAT6 Stand-Down Lockout (larangan kontak fisik minimal 14 hari)** membahayakan nyawa atlet (*Second-Impact Syndrome*).
2. **Bahaya Pemotongan Berat Badan Kilat (*Extreme Rapid Weight Cutting*)**:
   - Atlet bela diri sering melakukan dehidrasi akut ekstrim (sauna berkeringat deras, pantang minum air) demi masuk timbangan kelas tanding. Dehidrasi $>5\%$ berat badan mengeringkan lapisan cairan serebrospinal pelindung otak (meningkatkan risiko *knock-out* fatal secara eksponensial) dan merusak fungsi filtrasi ginjal.
3. **Ketiadaan Komputasi Densitas Ronde (*Combat Round Work Density*)**:
   - Cabor bela diri diatur oleh waktu ronde dan jeda istirahat (misal $3\text{ menit kerja} : 1\text{ menit jeda}$ pada tinju, atau $5 : 1$ pada MMA). Dibutuhkan kalkulasi rasio kerja-istirahat dan densitas kerja untuk mengukur beban glikolitik nyata.
4. **Kekosongan Pengaman Biomekanika Spesifik Tiap Cabor**:
   - **Tinju**: Risiko patah tulang metakarpal kelima (*Boxer's Fracture*) dan keseleo pergelangan tangan akibat pukulan samsak berat atau sudut perkenaan meleset.
   - **MMA**: Risiko dislokasi sendi akromioklavikular (AC Joint) saat bantingan gulat (*takedown slam*) dan hiperekstensi sendi siku/lutut saat upaya lolos kuncian.
   - **BJJ & Grappling**: Kompresi aksial leher dan regangan ligamen servikal (*cervical spine strain*) saat ditekan *stack pass* atau kuncian *guillotine*, serta robekan ligamen rotasional lutut (*MCL/LCL & Meniscus*) akibat *heel hooks* atau *deep de la riva guard*.
   - **Pencak Silat**: Gaya geser rotasional meniskus lutut saat manuver bantingan guntingan atau sapuan rebah, serta memar tulang periosteum (*tibial contusion*) akibat benturan tendangan sabit.
   - **Judo**: Subluksasi sendi bahu saat mengeksekusi lemparan angkat (*Seoi Nage*) dan torsi lutut tumpu saat sapuan bantingan (*Osoto Gari*).
   - **Muay Thai**: Hematoma periosteum tulang kering akibat benturan tulang lawan serta kelelahan tarikan otot leher akibat kuncian *plum clinch*.

Pembaruan **Phase 5** ini menuntaskan sasaran pada [docs/11-ai/07-ROADMAP_IMPLEMENTASI_BERTAHAP.md](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/07-ROADMAP_IMPLEMENTASI_BERTAHAP.md), membangun **Shared Combat Sports Kernel** dan **enam agen cabor bela diri mandiri (*Decoupled Combat Agents*)**.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Shared Combat Sports Kernel (`src/lib/domain/coach/kernels/combatSportsKernel.ts`)

Berkas baru berukuran 235 baris yang mengisolasi model komputasi ronde, evaluasi SCAT6, dan keselamatan gizi bela diri:

1. **Deterministic SCAT6 Concussion Return-to-Play Gate (Patricios et al. 2023, BJSM)**:
   - Jika atlet melaporkan benturan kepala dengan gejala neurologis atau riwayat pingsan/amnesia, sistem **mengunci latihan kontak dan sparring selama minimal 14 hari**.
   - Menghitung sisa hari isolasi dan memetakan atlet ke dalam 6 tahapan pemulihan bertahap (*Graduated Return to Play / GRTP*):
     - Stage 1: Aktivitas Terbatas Gejala (Istirahat Kognitif & Fisik Ringan)
     - Stage 2: Latihan Aerobik Ringan Non-Impak (HR < 70% HRmax)
     - Stage 3: Latihan Spesifik Cabor Non-Kontak (Shadow Boxing, Footwork)
     - Stage 4: Latihan Non-Kontak Kompleks (Pad Work, Latihan Beban)
     - Stage 5: Latihan Kontak Penuh Terkendali (Wajib Surat Izin Dokter Spesialis)
     - Stage 6: Kembali ke Kompetisi Penuh
2. **Kalkulator Densitas Ronde & Asidosis Laktat (*Combat Round Work Density*)**:
   - Menghitung total detik kerja, detik istirahat, rasio kerja-istirahat (*work-to-rest ratio*), dan persentase densitas kerja per sesi:
     $$\text{Work-Rest Ratio} = \frac{\text{Durasi Kerja (dtk)}}{\text{Durasi Istirahat (dtk)}}$$
   - Memetakan ke dalam 4 zona keasaman laktat: `AEROBIC_DRILL`, `MODERATE_GLYCOLYTIC`, `HIGH_LACTATE_ACCUMULATION`, dan `EXTREME_ACIDOSIS` ($>14.0\text{ mmol/L}$).
   - Menetapkan jendela istirahat biologis $24 - 72\text{ jam}$.
3. **Pemantauan Pemotongan Berat Badan Akut (*Weight-Cut Safety Monitor*)**:
   - Berdasarkan konsensus ACSM (Sawka et al. 2007) dan ISSN (Jäger et al. 2017).
   - Menghitung persentase penurunan berat badan akut:
     - $\le 2\%$: `SAFE_GRADUAL`
     - $2.1 - 4.9\%$: `MONITORED_DEFICIT` (Preskripsi protein $2.4\text{ g/kg}$ untuk FFM)
     - $\ge 5\%$: `CRITICAL_HAZARD` (Alarm bahaya kritis, larangan dehidrasi sauna ekstrim)
   - Preskripsi rehidrasi elektrolit: $1500\text{ mL cairan/kg defisit berat badan}$.
4. **Evaluator Keamanan Tulang Servikal & Hiperekstensi Sendi Kuncian**:
   - Mendeteksi kompresi leher $\ge 4/10$ dan hiperekstensi siku/lutut akibat kuncian submission; memicu circuit breaker untuk melarang sparring kuncian keras.

---

### B. Enam Agen Cabor Mandiri Klaster Bela Diri (`src/lib/domain/coach/agents/`)

1. **Boxing Coach Agent (`BoxingCoachAgent.ts`)**:
   - Berkas mandiri berukuran 231 baris untuk Tinju (`SPORT_BOXING`).
   - **Metrik Khusus**: Volume pukulan (*punch count*), ronde (standar 3 menit), ronde sparring, dan pelacakan trauma kepala.
   - **Boxer's Fracture Circuit Breaker**: Mendeteksi nyeri metakarpal kelima $\ge 4/10$; mengunci pukulan samsak berat dan sparring keras, beralih ke *shadow boxing* tanpa benturan dengan handwrap 180 inci.
   - **SCAT6 Concussion Lock**: Memblokir sparring kontak minimal 14 hari jika ada benturan kepala bergejala.

2. **MMA Coach Agent (`MmaCoachAgent.ts`)**:
   - Berkas mandiri berukuran 255 baris untuk Mixed Martial Arts (`SPORT_MMA`).
   - **Metrik Khusus**: Pemisahan waktu striking vs grappling, takedown attempts, submission escapes, dan ronde 5 menit.
   - **AC Joint Shoulder Guard**: Mengunci bantingan gulat dan pukulan overhand jika nyeri sendi akromioklavikular bahu $\ge 4/10$.
   - **Joint Hyperextension Safeguard**: Menahan live rolling submission selama 48 jam jika terjadi hiperekstensi sendi saat lolos armbar/kneebar.

3. **BJJ & Grappling Coach Agent (`BjjCoachAgent.ts`)**:
   - Berkas mandiri berukuran 239 baris untuk Brazilian Jiu-Jitsu (`SPORT_BJJ`).
   - **Metrik Khusus**: Mat time (menit), ronde sparring, drilling, dan regangan cengkeraman (*grip strain*).
   - **Cervical Spine Guard**: Melarang keras teknik *inverted guard* dan *stack pass defense* jika nyeri kompresi leher $\ge 4/10$.
   - **Knee Collateral Ligament Guard**: Mengunci kuncian kaki rotasional (*heel hooks, kneebars*) dan *deep de la riva guard* jika nyeri rotasi lutut $\ge 3/10$.
   - **Finger PIP Taping Protocol**: Meresepkan *buddy-taping (X-tape)* jika skor regangan jari $\ge 5/10$.

4. **Pencak Silat Coach Agent (`PencakSilatCoachAgent.ts`)**:
   - Berkas mandiri berukuran 222 baris untuk Pencak Silat Tanding & Seni (`SPORT_PENCAK_SILAT`).
   - **Metrik Khusus**: Kategori (Tanding vs Seni), babak tanding (2 menit), jumlah sapuan/bantingan, dan tendangan sabit/lurus.
   - **Meniscus Rotational Shear Guard**: Mengunci manuver guntingan dan sapuan rebah jika nyeri rotasi lutut $\ge 4/10$; menginstruksikan latihan kuda-kuda isometrik sudut sedang (>45°).
   - **Tibial Contusion Bone Bruise Guard**: Melarang tendangan sabit tanpa deker pelindung saat nyeri periosteum tulang kering $\ge 5/10$.

5. **Judo & Sambo Coach Agent (`JudoCoachAgent.ts`)**:
   - Berkas mandiri berukuran 219 baris untuk Judo & Sambo (`SPORT_JUDO`).
   - **Metrik Khusus**: Repetisi uchikomi, bantingan proyeksi *nage-waza*, durasi randori, dan serapan jatuh *ukemi*.
   - **Shoulder Subluxation Guard**: Mengunci lemparan angkat rotasional (*Seoi Nage*) jika nyeri bahu $\ge 4/10$.
   - **Meniscus Pivot Shear Guard**: Mengunci sapuan kait (*Osoto Gari, Ouchi Gari*) saat terdeteksi nyeri lutut tumpu $\ge 4/10$.

6. **Muay Thai Coach Agent (`MuayThaiCoachAgent.ts`)**:
   - Berkas mandiri berukuran 249 baris untuk Muay Thai & Kickboxing (`SPORT_MUAY_THAI`).
   - **Metrik Khusus**: Jumlah tendangan *teep* & *roundhouse*, durasi *plum clinch*, dan serangan siku/lutut.
   - **Tibial Hematoma Guard**: Mengunci tendangan samsak padat jika nyeri tulang kering $\ge 5/10$; mengalihkan ke pukulan tangan (*boxing hands*) dan kompres es.
   - **Cervical Clinch Strain Guard**: Menghentikan latihan tahanan *plum clinch* jika nyeri leher $\ge 4/10$.

---

### C. Pendaftaran Otomatis & Penyelarasan Router (`src/lib/domain/coach/agents/index.ts`)

- Seluruh 6 agen cabor bela diri baru didaftarkan secara otomatis melalui fungsi `registerDefaultCombatSportsAgents()` di [`src/lib/domain/coach/agents/index.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/agents/index.ts).
- `SportCoordinatorRouter` kini mengorkestrasi total **20 agen cabor mandiri terkalibrasi**:
  - 3 Agen Klaster Endurance Siklik (Running, Road Cycling, MTB XC)
  - 5 Agen Klaster Kekuatan & Daya Maksimal (Powerlifting, Olympic Weightlifting, Calisthenics, Strongman, Bodybuilding)
  - 6 Agen Klaster Lapangan & Gelanggang (Football, Basketball, Volleyball, Futsal, Rugby, Field Hockey)
  - 6 Agen Klaster Bela Diri & Kontak (Boxing, MMA, BJJ, Pencak Silat, Judo, Muay Thai)
- Endpoint dispatching `/api/coach/multi-sport` kini mengenali kode olahraga maupun alias taktis (*tinju, ufc, bjj, no_gi, silat, sambo, kickboxing, muay thai*).

---

## 3. Matriks Perbandingan Git Diff

| File Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/lib/domain/coach/kernels/combatSportsKernel.ts` | Baru | +235 | 0 | Kernel sains bersama: SCAT6 Concussion Gate, Round Density, & Weight Cut Safety |
| `src/lib/domain/coach/agents/BoxingCoachAgent.ts` | Baru | +231 | 0 | Agen Mandiri: Tinju, Punch volume, Boxer's fracture metacarpal breaker, SCAT6 lock |
| `src/lib/domain/coach/agents/MmaCoachAgent.ts` | Baru | +255 | 0 | Agen Mandiri: MMA, Striking vs Grappling ratio, AC joint breaker, Submissions guard |
| `src/lib/domain/coach/agents/BjjCoachAgent.ts` | Baru | +239 | 0 | Agen Mandiri: BJJ, Mat time, Cervical spine stack breaker, Knee collateral heel hook lock |
| `src/lib/domain/coach/agents/PencakSilatCoachAgent.ts` | Baru | +222 | 0 | Agen Mandiri: Silat Tanding/Seni, Meniscus guntingan breaker, Tibial contusion bruise |
| `src/lib/domain/coach/agents/JudoCoachAgent.ts` | Baru | +219 | 0 | Agen Mandiri: Judo/Sambo, Uchikomi, Seoi Nage shoulder breaker, Osoto Gari pivot knee |
| `src/lib/domain/coach/agents/MuayThaiCoachAgent.ts` | Baru | +249 | 0 | Agen Mandiri: Muay Thai, Clinch minutes, Tibial hematoma breaker, Plum clinch neck lock |
| `src/lib/domain/coach/agents/index.ts` | Diperbarui | +40 | -1 | Registrasi otomatis 6 agen cabor bela diri ke router singleton |
| `scripts/tests/test_combat_sports_agents.js` | Baru | +330 | 0 | Skrip uji otomatis komprehensif 60 skenario Phase 5 |
| `package.json` | Diperbarui | +2 | -1 | Penambahan skrip npm `test:combat` dan integrasi ke `test:all` |

---

## 4. Matriks Kepatuhan Batas Baris Kode (< 300 Baris)

Seluruh berkas produksi `src/` mematuhi aturan arsitektur batas maksimum 300 baris kode:

| Berkas Produksi | Baris Aktual | Batas Maksimum | Status Kepatuhan |
| :--- | :---: | :---: | :---: |
| `src/lib/domain/coach/kernels/combatSportsKernel.ts` | 235 | 300 | ✅ Patuh |
| `src/lib/domain/coach/agents/BoxingCoachAgent.ts` | 231 | 300 | ✅ Patuh |
| `src/lib/domain/coach/agents/MmaCoachAgent.ts` | 255 | 300 | ✅ Patuh |
| `src/lib/domain/coach/agents/BjjCoachAgent.ts` | 239 | 300 | ✅ Patuh |
| `src/lib/domain/coach/agents/PencakSilatCoachAgent.ts` | 222 | 300 | ✅ Patuh |
| `src/lib/domain/coach/agents/JudoCoachAgent.ts` | 219 | 300 | ✅ Patuh |
| `src/lib/domain/coach/agents/MuayThaiCoachAgent.ts` | 249 | 300 | ✅ Patuh |
| `src/lib/domain/coach/agents/index.ts` | 143 | 300 | ✅ Patuh |

---

## 5. Hasil Verifikasi Sistem & Pengujian Otomatis

### A. Uji Cabor Bela Diri Mandiri (`npm run test:combat`)
- **Total Uji**: 60 uji verifikasi
- **Hasil**: **60 PASSED, 0 FAILED (100% Lulus)**
  - Evaluasi SCAT6 Concussion: Deteksi benturan kepala bergejala memicu kunci stand-down 14 hari dan kewajiban surat izin dokter.
  - Alokasi tahap GRTP bertahap (Stage 1 hingga Stage 6).
  - Penghitungan densitas ronde tinju (540s kerja, 3.0 W:R ratio, akumulasi asam laktat tinggi).
  - Deteksi bahaya pemotongan berat badan kilat (>7% defisit memicu alarm darurat hidrasi).
  - Pengecekan sirkuit pemutus fraktur metakarpal Boxer's Fracture: Lulus.
  - Pengecekan pemisahan striking vs grappling pada MMA: Lulus.
  - Pengecekan sirkuit pemutus leher servikal dan ligamen kolateral pada BJJ: Lulus.
  - Pengecekan geseran meniskus guntingan dan kontusio tulang kering pada Pencak Silat: Lulus.
  - Pengecekan subluksasi bahu lemparan Seoi Nage pada Judo: Lulus.
  - Pengecekan hematoma tulang kering dan tarikan leher clinch pada Muay Thai: Lulus.
  - *Dynamic dispatching* multi-cabor SportCoordinatorRouter (6 agen bela diri): Lulus.

### B. Uji Regresi Menyeluruh Seluruh Repositori (`npm run test:all`)
- **Total Pengujian**: **244 PASSED, 0 FAILED**
  - Athlete Health & Readiness: 31 passed
  - Coach Training & Grounded Indicators: 5 passed
  - Weekly Streak Thermodynamics: 21 passed
  - BOLA Authorization Defense: 5 passed
  - Multi-Week & Mesocycle Recap: 10 passed
  - Sport Coordinator Router & Kernels (Phase 1): 13 passed
  - Decoupled Endurance Flagships (Phase 2): 21 passed
  - Strength, Power & Hypertrophy (Phase 3): 30 passed
  - Team Field & Court Sports (Phase 4): 32 passed
  - Combat & Martial Arts (Phase 5): 60 passed
  - Python Fast Engine: 16 passed

### C. Kompilasi Next.js Turbopack (`npm run build`)
- Seluruh 35 rute server/client berhasil dikompilasi secara bersih dalam 3.4 detik tanpa galat TypeScript maupun webpack bundling error.

---

## 6. Dampak Terhadap Roadmap & Rencana Fase Selanjutnya

Dengan selesainya **Phase 5**, platform kini telah memiliki fondasi teruji untuk **20 cabor olahraga dunia**. Rencana fase lanjutan mengacu pada roadmap:

- **Phase 6: Klaster Raket, Presisi, Akuatik & Kebugaran Fungsional (13 Cabor)**:
  - *Akuatik & Multi-Sport*: Swimming, Rowing, Triathlon.
  - *Raket & Presisi*: Badminton, Tennis, Table Tennis, Archery, Shooting.
  - *Kebugaran Fungsional & Ekstrem*: CrossFit/Hyrox, Sport Climbing, Gymnastics, Surfing, Skateboarding.
- **Phase 7: Global Multi-Agent Fatigue Arbiter & Hybrid Multi-Sport Athletes**:
  - Arbitrase kelelahan lintas cabor untuk atlet multi-disiplin (*cross-training / hybrid athletes*).
- **Phase 8: UI Ingress, Telemetry Widgets & Final Production Hardening**.
