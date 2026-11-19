# Taksonomi 33 Cabang Olahraga Dunia: Profil Fisiologis, Sistem Energi & Biomekanika

- **Tanggal Rilis**: 2026-11-17 14:50:00 WIB
- **Klasifikasi**: Sports Science Domain Reference Manual
- **Cakupan**: 33 Cabang Olahraga Lintas 6 Klaster Fisiologis
- **Lokasi Dokumen**: `docs/11-ai/02-TAKSONOMI_33_CABOR_DAN_PROFIL_FISIOLOGIS.md`

---

## 🏛️ Metodologi Taksonomi Olahraga Terpadu

Dalam ilmu fisiologi olahraga terapan (*Exercise Physiology & Sports Biomechanics*), mengelompokkan atlet berdasarkan sekadar "nama cabor" adalah pendekatan yang salah. Setiap cabang olahraga memiliki **spesifikasi bioenergetika, kinetika kontraksi otot, dan patomekanika cedera** yang sangat berbeda.

Dokumen ini menetapkan taksonomi **33 Cabang Olahraga Dunia** yang diklasifikasikan ke dalam **6 Klaster Fisiologis**. Profil ini menjadi fondasi bagi arsitektur agen AI independen untuk masing-masing cabang olahraga.

---

## Klaster 1: Pure Cyclic Endurance (Ketahanan Siklik Murni)

Olahraga dalam klaster ini didominasi oleh pergerakan berulang (*cyclic motion*) dengan durasi panjang, ketergantungan tinggi pada kapasitas mitokondria, dan metabolisme lipid/glikogen oksidatif.

| No | Cabang Olahraga | Kode Domain | Bioenergetika (ATP-PCr / Glik / Oks) | Rasio Kerja:Istirahat (W:R) | Metrik Beban Utama | Risiko Anatomi Cedera Kritis |
| :-: | :--- | :--- | :-: | :-: | :--- | :--- |
| **01** | **Lari Jarak Jauh & Maraton** | `SPORT_DISTANCE_RUNNING` | 2% / 8% / **90%** | Kontinu (1 : 0) | Jarak (km), Elevasi (m), Cadence, Ground Contact Time (GCT), RPE | Tendinopati Achilles, Shin Splints (MTSS), Plantar Fasciitis, ITBS |
| **02** | **Balap Sepeda Jalan Raya** | `SPORT_ROAD_CYCLING` | 5% / 15% / **80%** | Kontinu / Mikro-surge (1 : 0.2) | Normalized Power (NP), Watts/kg, TSS, Work (kJ), Cadence RPM | Nyeri Punggung Bawah (Lumbar), Nyeri Leher Servikal, Kompresi Pudendal |
| **03** | **Sepeda Gunung Cross-Country (MTB XC)** | `SPORT_MTB_XC` | 10% / 25% / **65%** | Fluktuatif Torsi (1 : 0.5) | Peak Torque (Nm), VAM (Ascent Rate), Heart Rate Recovery, Handling Fatigue | Traumatik Jatuh (Klavikula/Akromioklavikular), Nyeri Patela Torsi Tinggi |
| **04** | **Renang Prestasi Jarak Menengah/Jauh** | `SPORT_SWIMMING` | 10% / 30% / **60%** | Kontinu / Interval (1 : 0.5) | SWOLF (Stroke + Time), Stroke Rate, Total Meters, Hydrodynamic Drag | Swimmer's Shoulder (Impingement Subakromial), Nyeri Panggul Gaya Dada |
| **05** | **Dayung (Rowing / Ergometer)** | `SPORT_ROWING` | 10% / 30% / **60%** | Kontinu Berdaya Tinggi (1 : 0) | 500m Split Pace, Stroke Rate (SPM), Watts, Drive/Catch Ratio | Fraktur Stres Tulang Rusuk (Rib Stress), Nyeri Diskus Lumbal L4-S1 |
| **06** | **Triathlon & Multi-Sport** | `SPORT_TRIATHLON` | 2% / 8% / **90%** | Kontinu Multi-Disiplin | Brick Transition Workload, Cumulative Glycogen Depletion, Core Temp | Dehidrasi Berat, Rhabdomyolysis Ringan, Overuse Knee Multi-Plane |

---

## Klaster 2: Maximum Strength, Power & Hypertrophy (Kekuatan Maksimal & Daya)

Olahraga dalam klaster ini menuntut rekrutmen unit motorik ambang tinggi (*High-Threshold Motor Units*), kontraksi eksentrik/konsentrik intensitas maksimal, dan dominasi jalur kreatin fosfat.

| No | Cabang Olahraga | Kode Domain | Bioenergetika (ATP-PCr / Glik / Oks) | Rasio Kerja:Istirahat (W:R) | Metrik Beban Utama | Risiko Anatomi Cedera Kritis |
| :-: | :--- | :--- | :-: | :-: | :--- | :--- |
| **07** | **Powerlifting (SBD)** | `SPORT_POWERLIFTING` | **95%** / 5% / 0% | 1 : 10 hingga 1 : 20 (Kerja 3-8 dtk, Istirahat 3-5 mnt) | Tonase Beban (kg), RPE / RIR (Reps in Reserve), Bar Velocity (m/s) | Herniasi Diskus Lumbal, Robekan Pektoralis Mayor, Avulsi Biceps |
| **08** | **Angkat Besi Olimpiade** | `SPORT_WEIGHTLIFTING` | **98%** / 2% / 0% | 1 : 15 (Kerja 1-3 dtk ledakan, Istirahat 3-5 mnt) | Peak Power (Watts), Bar Trajectory Displacement, Catch Height Depth | Sprain Ligamen Pergelangan Tangan, Meniskus Lutut, Tendinitis Kuadrisep |
| **09** | **Kalistenik & Street Workout** | `SPORT_CALISTHENICS` | **85%** / 15% / 0% | 1 : 5 hingga 1 : 8 | Time Under Tension (TUT), Tuas Sendi (Lever Arm Length), Repetisi Isometrik | Tendinitis Distal Biseps, Nyeri Siku Medial/Lateral (Golfer/Tennis Elbow) |
| **10** | **Strongman & Heavy Carries** | `SPORT_STRONGMAN` | **80%** / 15% / 5% | 1 : 6 hingga 1 : 10 | Load Carried (kg), Speed under Load (m/s), Grip Duration, Axial Stress | Robekan Tendon Biceps Brachii, Kompresi Tulang Belakang, Sprain SI Joint |
| **11** | **Binaraga & Rekayasa Hipertrofi** | `SPORT_BODYBUILDING` | 30% / **65%** / 5% | 1 : 2 hingga 1 : 4 (Kerja 30-50 dtk, Istirahat 60-90 dtk) | Hard Sets per Muscle Group / Week, Effective Reps, Proximity to Failure | Kerusakan Sendi Kronis (*Wear & Tear*), Strain Bahu Anterior, Tendinopati |

---

## Klaster 3: High-Intensity Combat & Martial Arts (Bela Diri & Kontak Fisik)

Olahraga dalam klaster ini menuntut semburan balistik cepat, ketahanan isometrik saat kuncian (*grappling*), toleransi asam laktat yang luar biasa, serta ketahanan benturan (*impact tolerance*).

| No | Cabang Olahraga | Kode Domain | Bioenergetika (ATP-PCr / Glik / Oks) | Rasio Kerja:Istirahat (W:R) | Metrik Beban Utama | Risiko Anatomi Cedera Kritis |
| :-: | :--- | :--- | :-: | :-: | :--- | :--- |
| **12** | **Tinju (Boxing)** | `SPORT_BOXING` | 40% / **40%** / 20% | 3 : 1 (3 menit ronde, 1 menit istirahat) | Punch Volume, Punch Velocity (g-force), Round RPE, Heart Rate Recovery | Trauma Kepala (mTBI / Concussion), Boxer's Fracture (Metakarpal), Bahu |
| **13** | **Seni Bela Diri Campuran (MMA)** | `SPORT_MMA` | 35% / **45%** / 20% | 5 : 1 (5 menit ronde, 1 menit istirahat) | Striking vs Grappling Time Ratio, Takedown Defense Spurt, Neck Fatigue | Concussion, Dislokasi Akromioklavikular, Hiperekstensi Siku & Lutut |
| **14** | **Brazilian Jiu-Jitsu (BJJ)** | `SPORT_BJJ` | 20% / **50%** / 30% | 1 : 0.5 (Sparring kontinu 6-10 menit) | Isometric Grip Strain, Mat Time, Submission Resistance Load | Cedera Ligamen Lutut (LCL/MCL/ACL), Intervertebral Cervical Strain |
| **15** | **Pencak Silat (Tanding & Seni)** | `SPORT_PENCAK_SILAT` | 35% / **45%** / 20% | 2 : 1 (2 menit babak, 1 menit jeda) | Kecepatan Tendangan Sapuan, Reaktivitas Elakan, Stabilitas Kuda-kuda | Cedera Meniskus Rotasional, Kontusio Tulang Kering, Dislokasi Jari |
| **16** | **Judo & Sambo** | `SPORT_JUDO` | 30% / **50%** / 20% | 1 : 0.3 (Kontinu intens 4-5 menit) | Throwing Frequency, Grip Isometric Force, Breakfall Impact Absorption | Dislokasi Bahu, Robekan Meniskus, Sprain Sendi Jari Tangan (Kumikata) |
| **17** | **Muay Thai & Kickboxing** | `SPORT_MUAY_THAI` | 40% / **45%** / 15% | 3 : 1 atau 2 : 1 | Kicking Density per Round, Clinch Isometric Duration, Leg Impact Load | Hematoma Tulang Kering (Tibial Contusion), Robekan Ligamen Lutut, Concussion |

---

## Klaster 4: Intermittent Multi-Directional Team Field & Court (Beregu Lapangan & Lapangan Keras)

Olahraga dalam klaster ini melibatkan pola lari akselerasi-deselerasi berulang (*Repeated Sprint Ability*), perubahan arah tajam (*Change of Direction* / COD), dan koordinasi spasial tim.

| No | Cabang Olahraga | Kode Domain | Bioenergetika (ATP-PCr / Glik / Oks) | Rasio Kerja:Istirahat (W:R) | Metrik Beban Utama | Risiko Anatomi Cedera Kritis |
| :-: | :--- | :--- | :-: | :-: | :--- | :--- |
| **18** | **Sepak Bola (Soccer)** | `SPORT_FOOTBALL` | 30% / 20% / **50%** | Intermiten Acak (Semburan 2-4 dtk tiap 60-90 dtk) | Total Distance, High-Speed Running (>19.8 km/h), Sprint (>25.2 km/h), Accel/Decel | Robekan Otot Hamstring (Biceps Femoris), Ruptur ACL, Adductor Strain (Groin) |
| **19** | **Bola Basket (Basketball)** | `SPORT_BASKETBALL` | **60%** / 25% / 15% | 1 : 1 hingga 1 : 3 (Semburan cepat di lapangan 28m) | Jump Count & Jump Height, Lateral Deceleration Force, Player Load (AU) | Sprain Ankle Lateral (ATFL), Patellar Tendinopathy (Jumper's Knee), ACL |
| **20** | **Bola Voli (Indoor & Pasir)** | `SPORT_VOLLEYBALL` | **70%** / 20% / 10% | 1 : 3 hingga 1 : 5 (Rally 5-10 dtk, Jeda 15-25 dtk) | Total Jumps, Landing Ground Reaction Force, Shoulder Spike Velocity | Tendinopati Patela Akut, Rotator Cuff Impingement, Sprain Jari Tangan |
| **21** | **Futsal** | `SPORT_FUTSAL` | 40% / **40%** / 20% | Rotasi Cepat (Bermain 3-5 menit intensitas puncak) | High-Speed Distance per Minute, Rapid Direction Cuts, High RPE Density | Robekan Meniskus, Groin Pain Syndrome, Sprain Ankle |
| **22** | **Rugbi (Rugby Union/7s)** | `SPORT_RUGBY` | 40% / 30% / **30%** | Fluktuatif Benturan Tinggi | Collision Count (G-force tackle), Sprint Distance, Scrum Neck Force | Concussion Berat, Dislokasi Sendi Acromioclavicular (Bahu), Hamstring |
| **23** | **Hoki Lapangan (Field Hockey)** | `SPORT_FIELD_HOCKEY` | 35% / 25% / **40%** | Intermiten Lari Postur Rendah | Semi-Squat Stance Running Time, Sprint Count, Stick Maneuvering Speed | Nyeri Punggung Bawah Kronis, Nyeri Sendi Panggul (FAI), Cedera Hamstring |

---

## Klaster 5: Racquet, High-Velocity Reaction & Precision Sports (Raket & Presisi)

Olahraga dalam klaster ini menuntut ketajaman proprioseptif, kecepatan transfer kinetik dari kaki ke tangan, deselerasi lateral ekstrem, dan stabilitas vestibular/neuromuskular.

| No | Cabang Olahraga | Kode Domain | Bioenergetika (ATP-PCr / Glik / Oks) | Rasio Kerja:Istirahat (W:R) | Metrik Beban Utama | Risiko Anatomi Cedera Kritis |
| :-: | :--- | :--- | :-: | :-: | :--- | :--- |
| **24** | **Bulu Tangkis (Badminton)** | `SPORT_BADMINTON` | **65%** / 25% / 10% | 1 : 2 (Rally 6-10 dtk, Jeda 12-20 dtk) | Jump Smash Count, Lunge Landing Impact, Rally Duration, Heart Rate Spurt | Ruptur Tendon Achilles, Tendinopati Patela Lutut Tumpuan Depan, Bahu |
| **25** | **Tenis Lapangan** | `SPORT_TENNIS` | **60%** / 25% / 15% | 1 : 3 hingga 1 : 5 (Poin 4-8 dtk, Jeda 20 dtk) | Total Shots, Forehand/Backhand Velocity, Lateral Distance, Match Time | Tennis Elbow (Lateral Epicondylitis), Rotator Cuff Tendinopathy, Ankle Sprain |
| **26** | **Tenis Meja** | `SPORT_TABLE_TENNIS` | **75%** / 15% / 10% | 1 : 3 hingga 1 : 5 (Rally 3-5 dtk) | Reaction Time (ms), Torso Rotational Velocity, Stroke Frequency | Sprain Pergelangan Tangan, Strain Lumbal Rotasional, Nyeri Lutut Meniskus |
| **27** | **Panahan Olahraga (Archery)** | `SPORT_ARCHERY` | 10% / 10% / **80%** | Kontraksi Isometrik Presisi Tinggi | Draw Weight (lbs) x Arrows Shot, Hold Time (dtk), Tremor Micro-stability | Impingement Bahu Penarik, Tendinitis Ekstensor Jari, Postural Asymmetry |
| **28** | **Menembak Target (Shooting)** | `SPORT_SHOOTING` | 0% / 0% / **100%** | Stabilitas Isometrik Statis & Kontrol Otonom | Resting Tremor (mm), Heart Rate Suppression at Trigger Squeeze | Spasme Servikal & Bahu Statis, Ketegangan Otot Mata, Kelelahan Mental |

---

## Klaster 6: Functional Fitness, Anaerobic Capacity & Extreme Sports (Kebugaran Fungsional & Ekstrem)

Olahraga dalam klaster ini menuntut adaptasi serbaguna (*mixed-modal*), toleransi glikolitik ekstrem, efisiensi transisi pola gerak majemuk, serta kontrol kinetik gravitasi.

| No | Cabang Olahraga | Kode Domain | Bioenergetika (ATP-PCr / Glik / Oks) | Rasio Kerja:Istirahat (W:R) | Metrik Beban Utama | Risiko Anatomi Cedera Kritis |
| :-: | :--- | :--- | :-: | :-: | :--- | :--- |
| **29** | **Functional Fitness (CrossFit/Hyrox)** | `SPORT_FUNCTIONAL_FITNESS` | 25% / **50%** / 25% | Rasio Kerja Tinggi (AMRAP/For Time) | Work Density (Reps/Min), Transition Split Time, Blood Lactate Tolerance | Rhabdomyolysis, Impingement Bahu Beban Majemuk, Lumbar Disc Strain |
| **30** | **Panjat Tebing (Climbing / Bouldering)** | `SPORT_CLIMBING` | **50%** / 35% / 15% | Intermiten Isometrik Ekstrem | Fingerboard TUT (dtk), Route Grade Complexity, Fall Count, Grip Endurance | Ruptur Katrol Jari (A2/A4 Pulley Rupture), Nyeri Siku Brachialis, Bahu Labrum |
| **31** | **Senam Artistik (Gymnastics)** | `SPORT_GYMNASTICS` | **85%** / 10% / 5% | 1 : 10 (Rutin 30-90 dtk intensitas maksimal) | Peak Impact Landing Force, Flight Rotation Kinematics, Flexibility Range | Spondilolisis (Fraktur Stres Tulang Punggung), Ruptur Achilles, Dislokasi Siku |
| **32** | **Selancar Ombak (Surfing)** | `SPORT_SURFING` | 20% / 30% / **50%** | Paddle Kontinu vs Wave Ride Eksplosif | Paddle Distance (km), Wave Count, Pop-Up Reaction Speed, Core Rotational G | Cedera Telinga (Surfer's Ear), Impingement Bahu Dayung, Laserasi Terumbu |
| **33** | **Skateboarding (Street & Park)** | `SPORT_SKATEBOARDING` | **80%** / 15% / 5% | Semburan Trik Singkat (3-10 dtk) | Pop Height (cm), Trick Attempt Density, Impact Landing Force | Fraktur Radius Distal (Pergelangan Tangan), Concussion, Sprain Ankle Parah |

---

## 📌 Ringkasan Distribusi Sistem Energi Lintas 33 Cabor

```
[Klaster 1: Pure Endurance]        ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ (80 - 95% Oksidatif)
[Klaster 2: Maximum Strength]      ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■    (80 - 98% ATP-PCr)
[Klaster 3: Combat / Martial Arts] ■■■■■■■■■■■■■■■■                  (40 - 55% Glikolitik Laktat)
[Klaster 4: Team Field & Court]    ■■■■■■■■■■■■                      (Intermittent Multi-System)
[Klaster 5: Racquet & Precision]   ■■■■■■■■■■■■■■■■                  (60 - 75% ATP-PCr + Reaktivitas)
[Klaster 6: Functional & Extreme]  ■■■■■■■■■■■■■■■■■■■■              (Mixed-Modal Anaerobik-Aerobik)
```

Kesimpulan: **Setiap klaster dan cabor membutuhkan arsitektur AI yang terisolasi secara ketat** agar formula kalkulasi beban, preskripsi nutrisi, dan pembatasan cedera tidak saling merusak (*cross-contamination*).
