# Changelog: Decoupled Team Field & Court Intermittent Multi-Sport AI Agents (Phase 4)

- **Tanggal & Waktu**: 2026-11-18 16:20:00 WIB
- **Tipe**: `feat(domain)` / `feat(team-sports)` / `feat(ai-coaching)` / `feat(sports-science)`
- **Commit Message Rujukan**: `feat(team-sports): implement decoupled intermittent team field and court sports agents, Catapult PlayerLoad kernel, and FIFA 11+ injury safety gates (phase 4)`
- **Branch**: `feat/strava-activity-ingestion`
- **Lokasi**: `docs/10-changelog/feat/strava-activity-ingestion/2026-11-18_16-20-00_feat-team-field-and-court-intermittent-multi-sport-agents-phase-4.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Setelah penyelesaian **Phase 1** (Infrastruktur Inti & Kernel Sains Bersama), **Phase 2** (Klaster Endurance Flagship), dan **Phase 3** (Klaster Kekuatan & Daya Maksimal), platform analitik atletik `project_strava` menghadapi tantangan besar pada olahraga permainan beregu lapangan dan gelanggang (*intermittent team sports*). 

Olahraga seperti Sepak Bola, Bola Basket, Bola Voli, Futsal, Rugby, dan Hoki Lapangan memiliki profil fisiologis dan biomekanika non-linier yang sama sekali tidak dapat dimodelkan menggunakan kurva endurance siklik maupun tonase beban statis:

1. **Aktivitas Intermiten Stokastik Intensitas Tinggi (*Repeated High-Intensity Bouts*)**:
   - Atlet tidak bergerak dengan kecepatan konstan melainkan melakukan ratusan siklus *sprint-deceleration-cut-jump-rest* acak. Membaca aktivitas tim hanya dari total jarak (km) atau kecepatan rata-rata (*average pace*) menyesatkan interpretasi beban kerja atlet secara fatal.
2. **Ketiadaan Segmentasi Kecepatan Tinggi (*High-Speed Running / HSR*) & Tumbukan Akselerasi**:
   - Belum ada algoritma pemilah kecepatan standar sains sepak bola internasional (Paul Bradley & Martin Buchheit) untuk membedakan antara jalan santai, jogging, *running*, *High-Speed Running* ($19.8 - 25.1\text{ km/jam}$), dan *maximum sprinting* ($>25.2\text{ km/jam}$).
3. **Ketiadaan Komputasi Beban Gerak Triaksial (*PlayerLoad™*)**:
   - Pada olahraga gelanggang dalam ruangan (*indoor court*) seperti basket, voli, dan futsal di mana sinyal satelit GPS tidak tersedia atau terhalang atap, jarak tempuh sering kali rendah ($3 - 7\text{ km}$), namun beban neuromuskular akibat percepatan triaksial ($x, y, z$), loncatan, dan pendaratan sangat ekstrem. Diperlukan formula akumulasi beban triaksial mekanis *PlayerLoad™* (Catapult Sports standard).
4. **Kekosongan Pengaman Klinis Spesifik Cabor Beregu**:
   - **Sepak Bola**: Risiko tinggi regangan hamstring (*eccentric hamstring overload*) dan robekan ligamen lutut ACL saat deselerasi cepat tanpa pemanasan neuromuskular terstruktur (*FIFA 11+*).
   - **Bola Basket**: Risiko *patellar tendinopathy* (*Jumper's Knee*) akibat gaya tumbukan pendaratan lompatan vertikal $\ge 4-6 \times$ bobot tubuh dan cedera inversi pergelangan kaki (*ATFL ankle sprain*).
   - **Bola Voli**: Beban repetisi lompatan blok dan smes (*spike jumps*) yang memicu peradangan tendon patela serta sindrom jepitan manset bahu (*shoulder rotator cuff impingement*).
   - **Futsal**: Traksi lantai keras sintetis/parket yang tinggi menciptakan gaya geser (*shear stress*) masif pada meniskus lutut dan ketegangan otot adduktor selangkangan (*groin strain*) saat manuver potong arah $180^\circ$.
   - **Rugby**: Olahraga kontak fisik penuh dengan akumulasi benturan (*tackles, collisions, scrums*) dan bahaya gegar otak traumatik (*concussion*). Ketiadaan gerbang protokol *SCAT6 Stand-Down Lockout* (larangan kontak fisik minimal 14 hari) mengancam keselamatan atlet.
   - **Hoki Lapangan**: Postur berlari membungkuk (*semi-squat crouched running*) konstan dengan stik hoki memicu spasme dan kelelahan akut otot ekstensor lumbal (*erector spinae*).

Pembaruan **Phase 4** ini menuntaskan sasaran pada [docs/11-ai/07-ROADMAP_IMPLEMENTASI_BERTAHAP.md](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/07-ROADMAP_IMPLEMENTASI_BERTAHAP.md), membangun **Shared Intermittent Sports Kernel** dan **enam agen cabor beregu mandiri (*Decoupled Team Field & Court Agents*)**.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Shared Intermittent Sports Kernel (`src/lib/domain/coach/kernels/intermittentSportsKernel.ts`)

Berkas baru berukuran 162 baris yang mengisolasi model komputasi intermiten dan pencegahan cedera cabor beregu tervalidasi sains olahraga:

1. **Segmentasi Kecepatan Bradley & Buchheit (Bradley et al. 2009, Buchheit et al. 2014)**:
   - Mengklasifikasikan jarak tempuh ke dalam 5 zona kinetik standar sepak bola:
     - **Zone 1 (Walking)**: $< 7.2\text{ km/jam}$
     - **Zone 2 (Jogging)**: $7.2 - 14.3\text{ km/jam}$
     - **Zone 3 (Running)**: $14.4 - 19.7\text{ km/jam}$
     - **Zone 4 (High-Speed Running / HSR)**: $19.8 - 25.1\text{ km/jam}$ (ambang stres hamstring eksentrik)
     - **Zone 5 (Sprinting)**: $\ge 25.2\text{ km/jam}$ (kecepatan maksimal)
   - Menghitung persentase jarak intensitas tinggi ($\text{HSR} + \text{Sprint}$) terhadap total jarak.
2. **Kalkulator Beban Mekanis Triaksial Catapult PlayerLoad™ (AU)**:
   - Mengakumulasi percepatan sesaat pada tiga sumbu akselerometer:
     $$\text{PlayerLoad} = \frac{\sqrt{(a_{y,t}-a_{y,t-1})^2 + (a_{x,t}-a_{x,t-1})^2 + (a_{z,t}-a_{z,t-1})^2}}{100}$$
   - Menyediakan estimasi matematis terkalibrasi berbasis loncatan, akselerasi, deselerasi, dan durasi untuk sesi tanpa sensor GPS/akselerometer mentah.
   - Kategori beban sesi:
     - $< 300\text{ AU}$ (`LOW`)
     - $300 - 650\text{ AU}$ (`MODERATE`)
     - $650 - 900\text{ AU}$ (`HIGH`)
     - $> 900\text{ AU}$ (`EXTREME`)
3. **Evaluator Risiko Cedera FIFA 11+ & Pencegahan ACL (Bizzini & Dvorak, BJSM 2015)**:
   - Memeriksa lonjakan volume sprint dan rasio hamstring-quadriceps.
   - Menerbitkan rekomendasi latihan eksentrik terbukti: *Nordic Hamstring Curls* untuk menurunkan risiko strain biseps femoris hingga $51\%$, *Copenhagen Adduction Exercise* untuk otot selangkangan, dan koreksi biomekanika pendaratan valgus lutut untuk proteksi ligamen ACL.
4. **Jendela Pemulihan Biologis Pasca-Pertandingan (*Biological Recovery Window*)**:
   - Menetapkan jendela istirahat fisiologis $48 - 72\text{ jam}$ pasca-pertandingan kompetitif penuh.
   - Mengakomodasi klirens kreatin kinase (CK), resintesis glikogen otot ($6.0 - 10.0\text{ g/kg}$ karbohidrat), dan rehidrasi elektrolit.

---

### B. Enam Agen Cabor Mandiri Klaster Lapangan & Gelanggang (`src/lib/domain/coach/agents/`)

1. **Football / Soccer Coach Agent (`FootballCoachAgent.ts`)**:
   - Berkas mandiri berukuran 189 baris untuk Sepak Bola (11v11).
   - **Metrik Khusus**: Total jarak tempuh pertandingan/latihan, HSR distance, sprint distance, dan durasi bermain.
   - **Hamstring Strain & ACL Circuit Breaker**: Jika atlet melaporkan nyeri paha belakang skala $\ge 4/10$ atau kekakuan hamstring pasca-sprint, agen memutus izin latihan sprint/akselerasi maksimal untuk mencegah robekan derajat 2.
   - **FIFA 11+ Prescription**: Mengintegrasikan protokol pemanasan neuromuskular 3 bagian sebelum setiap sesi intensitas tinggi.

2. **Basketball Coach Agent (`BasketballCoachAgent.ts`)**:
   - Berkas mandiri berukuran 186 baris untuk Bola Basket (5v5 dan 3x3).
   - **Metrik Khusus**: Jumlah loncatan (*jump count*), deselerasi pendaratan, *court transitions*, dan estimasi PlayerLoad.
   - **Jumper's Knee (Patellar Tendinopathy) Circuit Breaker**: Memutus beban loncatan eksplosif dan lay-up keras jika nyeri tendon infrapatela terdeteksi; merekomendasikan protokol beban isometrik *Spanish Squats* (3–5 set $\times$ 45 detik).
   - **ATFL Lateral Ankle Guard**: Menyarankan *semi-rigid ankle bracing* dan latihan proprioseptif *single-leg balance* jika ada riwayat sprain pergelangan kaki.

3. **Volleyball Coach Agent (`VolleyballCoachAgent.ts`)**:
   - Berkas mandiri berukuran 182 baris untuk Bola Voli Lapangan (*Indoor Hardwood*) dan Voli Pantai (*Beach Sand*).
   - **Metrik Khusus**: Volume loncatan terpilah (*spike jumps* vs *block jumps*), rasio serangan atas net, dan beban kontak.
   - **Rotator Cuff & Impingement Circuit Breaker**: Mendeteksi kelelahan sendi glenohumeral bahu akibat smes berulang. Mengunci sesi spike di atas kepala dan meresepkan rotasi eksternal kabel/pita untuk m. infraspinatus dan m. teres minor.
   - **Surface Biomechanics Adaptation**: Membedakan mekanika pendaratan; lantai keras menyalurkan gaya reaksi tanah (*GRF*) tinggi ke lutut, sedangkan pasir pantai meningkatkan beban metabolisme betis/Achilles.

4. **Futsal Coach Agent (`FutsalCoachAgent.ts`)**:
   - Berkas mandiri berukuran 170 baris untuk Futsal (5v5 gelanggang dalam ruangan).
   - **Metrik Khusus**: Frekuensi manuver belok cepat $180^\circ$ (*direction cuts*), akselerasi ruang sempit, dan indeks traksi lantai.
   - **Meniscus Shear & Groin Circuit Breaker**: Menghentikan sesi manuver potong arah tajam pada lapangan parket/vinyl berkoefisien gesek tinggi saat nyeri selangkangan (*adductor*) atau sendi lutut terasa; mengalihkan ke pemulihan aerobik lurus tanpa geseran lateral.

5. **Rugby Coach Agent (`RugbyCoachAgent.ts`)**:
   - Berkas mandiri berukuran 200 baris untuk Rugby Union, Rugby League, dan Rugby Sevens.
   - **Metrik Khusus**: Jumlah benturan fisik (*physical collisions*), tekel (*tackles*), *scrums/rucks*, dan beban kontak total.
   - **MANDATORY SCAT6 Concussion Safety Breaker (World Rugby Concussion Protocol)**:
     - Jika terdeteksi indikasi gegar otak, pusing, disorientasi, atau riwayat benturan kepala:
       - **Kunci Kontak Fisik Mutlak**: Minimal **14 hari *stand-down*** penuh tanpa kontak.
       - **Graduated Return to Play (GRTP)**: Wajib melewati 6 fase klinis bertahap sebelum diizinkan bertanding kembali.
   - **Cervical Spine Protection**: Memeriksa kesiapan kekuatan otot leher (*isometric neck conditioning*) sebelum atlet diizinkan kembali ke posisi scrum garis depan (*front row*).

6. **Field Hockey Coach Agent (`FieldHockeyCoachAgent.ts`)**:
   - Berkas mandiri berukuran 174 baris untuk Hoki Lapangan (*Field Hockey*).
   - **Metrik Khusus**: Durasi berlari dalam postur membungkuk semi-squat (*crouched running duration*), rotasi asimetris stik hoki, dan sprint intermiten.
   - **Lumbar Spine Spasm Circuit Breaker**: Jika atlet mengalami kaku atau spasme otot erector spinae lumbal, agen membatasi durasi dribble membungkuk; menginstruksikan ekstensi lumbal *McKenzie press-ups* dan latihan stabilitas rotasi inti (*anti-rotational Pallof press*).

---

### C. Pendaftaran Otomatis & Penyelarasan Router (`SportCoordinatorRouter.ts` & `src/lib/domain/coach/agents/index.ts`)

- Seluruh 6 agen cabor beregu baru didaftarkan secara otomatis melalui fungsi `registerDefaultTeamFieldCourtAgents()` di [src/lib/domain/coach/agents/index.ts](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/agents/index.ts).
- `SportCoordinatorRouter` kini mengorkestrasi total **14 agen cabor mandiri terkalibrasi**:
  - 3 Agen Klaster Endurance Siklik (Running, Road Cycling, MTB XC)
  - 5 Agen Klaster Kekuatan & Daya Maksimal (Powerlifting, Olympic Weightlifting, Calisthenics, Strongman, Bodybuilding)
  - 6 Agen Klaster Lapangan & Gelanggang (Football, Basketball, Volleyball, Futsal, Rugby, Field Hockey)
- Endpoint dispatching `/api/coach/multi-sport` kini mengenali kode olahraga maupun alias taktis (*soccer, futsal, basketball, hoops, volleyball, beach volleyball, rugby, scrums, field hockey*).

---

## 3. Matriks Perbandingan Git Diff

| File Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/lib/domain/coach/kernels/intermittentSportsKernel.ts` | Baru | +162 | 0 | Kernel sains bersama: Bradley/Buchheit HSR, PlayerLoad AU, FIFA 11+, & Recovery 48-72h |
| `src/lib/domain/coach/agents/FootballCoachAgent.ts` | Baru | +189 | 0 | Agen Mandiri: Sepak Bola 11v11, HSR/Sprint distance, FIFA 11+ hamstrings/ACL breaker |
| `src/lib/domain/coach/agents/BasketballCoachAgent.ts` | Baru | +186 | 0 | Agen Mandiri: Basket 5v5/3x3, Jump count, Jumper's Knee / Spanish Squats, ATFL ankle |
| `src/lib/domain/coach/agents/VolleyballCoachAgent.ts` | Baru | +182 | 0 | Agen Mandiri: Voli Lapangan/Pantai, Spike/Block jumps, Impingement bahu rotator cuff |
| `src/lib/domain/coach/agents/FutsalCoachAgent.ts` | Baru | +170 | 0 | Agen Mandiri: Futsal 5v5, Rapid cuts 180°, Meniscus shear stress & groin strain breaker |
| `src/lib/domain/coach/agents/RugbyCoachAgent.ts` | Baru | +200 | 0 | Agen Mandiri: Rugby Union/7s, Collisions/Scrums, SCAT6 Concussion mandatory 14-day lock |
| `src/lib/domain/coach/agents/FieldHockeyCoachAgent.ts` | Baru | +174 | 0 | Agen Mandiri: Hoki Lapangan, Crouched semi-squat running time, Lumbar spasm McKenzie |
| `src/lib/domain/coach/agents/index.ts` | Diperbarui | +28 | -2 | Registrasi otomatis 6 agen cabor beregu ke router singleton |
| `scripts/tests/test_team_field_court_agents.js` | Baru | +255 | 0 | Skrip uji otomatis komprehensif 32 skenario Phase 4 |
| `package.json` | Diperbarui | +2 | -1 | Penambahan skrip npm `test:team` dan integrasi ke `test:all` |

---

## 4. Matriks Kepatuhan Batas Baris Kode (< 300 Baris)

Seluruh berkas produksi `src/` mematuhi aturan ketat arsitektur batas maksimum 300 baris kode:

| Berkas Produksi | Jumlah Baris Aktual | Batas Maksimum | Status Kepatuhan |
| :--- | :---: | :---: | :---: |
| `src/lib/domain/coach/kernels/intermittentSportsKernel.ts` | 162 | 300 | ✅ Patuh (Sangat Ramping) |
| `src/lib/domain/coach/agents/FootballCoachAgent.ts` | 189 | 300 | ✅ Patuh |
| `src/lib/domain/coach/agents/BasketballCoachAgent.ts` | 186 | 300 | ✅ Patuh |
| `src/lib/domain/coach/agents/VolleyballCoachAgent.ts` | 182 | 300 | ✅ Patuh |
| `src/lib/domain/coach/agents/FutsalCoachAgent.ts` | 170 | 300 | ✅ Patuh |
| `src/lib/domain/coach/agents/RugbyCoachAgent.ts` | 200 | 300 | ✅ Patuh |
| `src/lib/domain/coach/agents/FieldHockeyCoachAgent.ts` | 174 | 300 | ✅ Patuh |
| `src/lib/domain/coach/agents/index.ts` | 104 | 300 | ✅ Patuh |
| `src/lib/domain/coach/index.ts` | 11 | 300 | ✅ Patuh |

---

## 5. Hasil Verifikasi Sistem & Pengujian Otomatis

Verifikasi sistem komprehensif dijalankan menggunakan seluruh suite pengujian otomatis platform:

### A. Uji Cabor Lapangan & Gelanggang Mandiri (`npm run test:team`)
- **Total Uji**: 32 uji verifikasi
- **Hasil**: **32 PASSED, 0 FAILED (100% Lulus)**
  - Segmentasi kinetik Bradley/Buchheit HSR ($1,500\text{ m}$ pada intensitas tinggi): Lulus.
  - Komputasi Catapult PlayerLoad™ AU ($564\text{ AU}$, kategori moderat): Lulus.
  - Evaluator risiko hamstring & pendaratan valgus lutut FIFA 11+: Lulus.
  - Alokasi jendela pemulihan $48\text{ jam}$ dan $7.0\text{ g/kg}$ karbohidrat: Lulus.
  - Preskripsi pencegahan strain hamstring derajat 2 pada Football: Lulus.
  - Sirkuit pemutus beban loncatan eksplosif Jumper's Knee pada Basketball: Lulus.
  - Pengaman bahu manset rotator cuff pada Volleyball: Lulus.
  - Pengaman gesekan lantai keras dan sendi meniskus pada Futsal: Lulus.
  - **MANDATORY**: Kunci isolasi gegar otak SCAT6 14 hari tanpa kontak pada Rugby: Lulus.
  - Pengaman ekstensi lumbal McKenzie pada postur bungkuk Hoki Lapangan: Lulus.
  - *Dynamic dispatching* multi-cabor SportCoordinatorRouter (6 agen tim): Lulus.

### B. Uji Regresi Menyeluruh (`npm run test:all`)
- **Total Pengujian Seluruh Sistem**: **184 PASSED, 0 FAILED**
  - Athlete Health & Readiness: 31 passed
  - Coach Training & Grounded Indicators: 5 passed
  - Weekly Streak Thermodynamics: 21 passed
  - BOLA Authorization & Security: 5 passed
  - Multi-Week & Mesocycle Recap: 10 passed
  - Sport Coordinator Router & Phase 1 Kernels: 13 passed
  - Decoupled Endurance Flagship Agents (Phase 2): 21 passed
  - Strength, Power & Hypertrophy Agents (Phase 3): 30 passed
  - Team Field & Court Sports Agents (Phase 4): 32 passed
  - Python Sports Science Fast Engine: 16 passed

### C. Kompilasi Next.js Turbopack (`npm run build`)
- Seluruh 35 rute server/client berhasil dikompilasi secara bersih tanpa galat TypeScript maupun webpack bundling error.

---

## 6. Dampak Terhadap Roadmap & Rencana Fase Selanjutnya

Dengan selesainya **Phase 4**, platform kini telah memiliki fondasi teruji untuk **14 cabor olahraga dunia**. Rencana fase lanjutan mengacu pada roadmap:

- **Phase 5: Klaster Bela Diri & Olahraga Kontak (*Combat Sports & Martial Arts*)**:
  - Boxing, MMA, Brazilian Jiu-Jitsu (BJJ), Pencak Silat, Judo, Muay Thai.
  - Kernel *Round Density*, rasio kerja-istirahat interval anaerobik laktat, dan gerbang keamanan trauma kepala SCAT6.
- **Phase 6: Klaster Raket & Presisi (*Racket & Precision Sports*)**:
  - Badminton, Tennis, Table Tennis, Squash, Archery, Shooting.
- **Phase 7: Klaster Kebugaran Fungsional & Ekstrem (*Functional Fitness & Extreme Sports*)**:
  - CrossFit/Hyrox, Rock Climbing/Bouldering, Gymnastics, Surfing, Skateboarding.
- **Phase 8: Global Multi-Agent Fatigue Arbiter & Production Hardening**:
  - Arbitrase kelelahan lintas cabor untuk atlet multi-disiplin (*hybrid athletes*).
