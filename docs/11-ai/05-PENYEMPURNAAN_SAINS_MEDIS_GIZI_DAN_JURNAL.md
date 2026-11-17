# Penyempurnaan Sistem AI Coaching Berdasarkan Jurnal & Konsensus Sains Olahraga, Kedokteran, dan Gizi

- **Tanggal Rilis**: 2026-11-17 15:05:00 WIB
- **Tingkat Otoritas**: **Peer-Reviewed Scientific Evidence & Clinical Consensus**
- **Klasifikasi**: Sports Medicine, Biomechanics, Exercise Physiology, & Sports Nutrition
- **Lokasi Dokumen**: `docs/11-ai/05-PENYEMPURNAAN_SAINS_MEDIS_GIZI_DAN_JURNAL.md`

---

## 1. Landasan Fisiologi Latihan & Pemodelan Beban (Exercise Physiology)

Setiap agen AI dalam sistem `a-coach` wajib menyelaraskan algoritmanya dengan konsensus fisiologi berikut:

### A. Metrik Beban Universal: Session-RPE (Carl Foster et al., 2001)
- **Sumber Rujukan**: Foster, C., et al. (2001). *"A new approach to monitoring exercise training."* *Journal of Strength and Conditioning Research*, 15(1), 109–115.
- **Implementasi pada AI Agent**:
  $$\text{Training Load (Arbitrary Units / AU)} = \text{Session Duration (Minutes)} \times \text{Session-RPE (Borg CR-10)}$$
- **Aplikasi Lapangan**: Digunakan oleh agen bela diri, olahraga beregu, senam, dan panjat tebing yang tidak memiliki sensor daya (watt meter) kontinu. Validasi korelasi $r = 0.75 - 0.90$ terhadap akumulasi laktat darah dan regangan denyut jantung.

### B. Rasio Beban Akut terhadap Kronis (ACWR - Tim J. Gabbett, 2016)
- **Sumber Rujukan**: Gabbett, T. J. (2016). *"The training—injury prevention paradox: should athletes be training smarter and harder?"* *British Journal of Sports Medicine*, 50(5), 273–280.
- **Implementasi pada AI Agent**:
  $$\text{ACWR} = \frac{\text{Acute Workload (Rolling 7-Day Load)}}{\text{Chronic Workload (Rolling 28-Day Average)}}$$
- **Aturan Pembatasan Preskripsi**:
  - Jika $\text{ACWR} > 1.5$ $\to$ Status **BAHAYA CEDERA JARINGAN LUNAK**. Agen otomatis memangkas intensitas sesi berikutnya sebesar 30–50% dan menonaktifkan sprint maksimal.
  - Jika $0.8 \le \text{ACWR} \le 1.3$ $\to$ Status **ZONA AMAN (Sweet Spot)**. Progresi volume diizinkan bertahap (5–10% per minggu).

### C. Teori Periodisasi Blok (Vladimir B. Issurin, 2008 & Tudor Bompa, 2015)
- **Sumber Rujukan**:
  - Issurin, V. B. (2008). *"Block periodization versus traditional training theory."* *Sports Medicine*, 38(1), 17–31.
  - Bompa, T. O., & Buzzichelli, C. A. (2015). *"Periodization: Theory and Methodology of Training."* Human Kinetics.
- **Implementasi pada AI Agent**:
  - Menggantikan periodisasi linier kuno dengan **3 Fase Blok Bertingkat**:
    1. **Blok Akumulasi (Accumulation)**: Volume tinggi, intensitas sedang, pengembangan kapasitas aerobik dasar dan hipertrofi otot.
    2. **Blok Transmutasi (Transmutation)**: Volume sedang, intensitas spesifik cabor, daya tahan laktat, dan kekuatan kecepatan (*speed-strength*).
    3. **Blok Realisasi & Tapering (Realization)**: Volume dipangkas 40–60%, intensitas dipertahankan singkat, pemulihan glikogen dan kesiapan neuromuskular puncak (*supercompensation*).

---

## 2. Landasan Kedokteran Olahraga & Pencegahan Cedera (Sports Medicine)

AI Coach tidak boleh bertindak sebagai dokter yang mendiagnosis tanpa pemeriksaan fisik, namun **wajib menerapkan batasan keselamatan preventif**:

### A. Protokol Pencegahan Cedera Ligamen Lutut (ACL & Patela)
- **Sumber Rujukan**: Hewett, T. E., et al. (2005). *"Biomechanical measures of neuromuscular control and valgus loading of the knee predict anterior cruciate ligament injury."* *American Journal of Sports Medicine*, 33(4), 492–501.
- **Konsensus FIFA 11+**: Bizzini, M., & Dvorak, J. (2015). *"FIFA 11+: an effective programme to prevent football injuries."* *BJSM*, 49(9), 577–579.
- **Implementasi pada AI Agent (Football, Basketball, Volleyball, Futsal)**:
  - Mewajibkan pemanasan neuromuskular sebelum sesi berkecepatan tinggi: *hamstring eccentric strength (Nordic curls)*, stabilitas valgus panggul (*gluteus medius activation*), dan teknik mendarat fleksi lutut >30°.

### B. Protokol Cedera Pergelangan Kaki (Lateral Ankle Sprain / ATFL)
- **Sumber Rujukan**: Delahunt, E., et al. (2018). *"Clinical guidance for managing lateral ankle sprains: an evidence-based clinical guideline."* *BJSM*, 52(20), 1304–1310.
- **Implementasi pada AI Agent (Running, Badminton, Basketball)**:
  - Mengunci beban impak tinggi jika terdapat riwayat pembengkakan aktif atau defisit *dorsiflexion range of motion* (<10 cm pada *Weight-Bearing Lunge Test*).
  - Mengalihkan beban ke latihan kinetik tertutup non-impak (*seated cycling, pool running*) untuk menjaga kapasitas aerobik tanpa membebani ligamen talofibular anterior (ATFL).

### C. Protokol Benturan Kepala & Gegar Otak (Concussion Protocol - SCAT6)
- **Sumber Rujukan**: Patricios, J. S., et al. (2023). *"Consensus statement on concussion in sport: the 6th International Conference on Concussion in Sport—Amsterdam, October 2022."* *BJSM*, 57(11), 695–711.
- **Implementasi pada AI Agent (Boxing, MMA, Rugby, Football)**:
  - **Sikap Tegas Non-Negosiasi**: Jika atlet memasukkan laporan benturan kepala dengan gejala pusing, pandangan kabur, atau disorientasi, AI secara otomatis memblokir latihan kontak/sparring selama **minimal 14 hari** (*Graduated Return-to-Play Protocol*) dengan pengawasan tenaga medis resmi.

---

## 3. Landasan Gizi Olahraga & Hidrasi Ilmiah (Sports Nutrition & Hydration)

Setiap agen cabor memberikan preskripsi nutrisi yang dipersonalisasi sesuai kebutuhan substrat energi cabor:

### A. Konsensus Asupan Protein Berbasis Bukti (ISSN Position Stand, 2017)
- **Sumber Rujukan**: Jäger, R., Kerksick, C. M., Campbell, B. I., et al. (2017). *"International Society of Sports Nutrition Position Stand: protein and exercise."* *Journal of the International Society of Sports Nutrition*, 14(1), 20.
- **Dosis Preskripsi AI**:
  - **Atlet Endurance (Lari, Sepeda, Renang)**: $1.2 - 1.6 \text{ g/kg berat badan/hari}$ untuk perbaikan mitokondria dan turnover serat otot.
  - **Atlet Kekuatan & Hipertrofi (Powerlifting, Bodybuilding)**: $1.6 - 2.2 \text{ g/kg berat badan/hari}$ terbagi rata dalam 3–5 kali makan (0.3–0.4 g/kg per waktu makan) untuk memaksimalkan sintesis protein otot (*Muscle Protein Synthesis* / MPS) dengan ambang leusin $\approx 2.7 - 3.5 \text{ gram}$.
  - **Atlet Defisit Kalori / Potong Berat Badan (Combat Sports)**: $2.2 - 2.8 \text{ g/kg berat badan/hari}$ guna melindungi massa otot bebas lemak (*Fat-Free Mass* / FFM).

### B. Periodisasi Karbohidrat Selama Latihan (Asker E. Jeukendrup, 2014)
- **Sumber Rujukan**: Jeukendrup, A. E. (2014). *"A step towards personalized sports nutrition: carbohydrate intake during exercise."* *Sports Medicine*, 44(Suppl 1), 25–33.
- **Preskripsi Berdasarkan Durasi & Karakteristik Cabor**:

| Durasi Sesi | Kebutuhan Karbohidrat Saat Sesi | Rasio & Jenis Gula | Rekomendasi Agen Cabor |
| :--- | :--- | :--- | :--- |
| **< 45 Menit** | Tidak diperlukan secara fisiologis | N/A | Cukup hidrasi air mineral |
| **45 – 75 Menit** | Kumur Karbohidrat (*Mouth Rinse*) atau <30 g/jam | Glukosa / Maltodekstrin | Stimulasi reseptor oral untuk penurunan persepsi lelah SSP |
| **1 – 2.5 Jam** | $30 - 60 \text{ gram/jam}$ | Glukosa tunggal atau sukrosa | Menjaga laju oksidasi karbohidrat eksogen |
| **> 2.5 Jam (Endurance Ekstrem)** | Hingga $90 \text{ gram/jam}$ | **Rasio 2 : 1 (Glukosa : Fruktosa)** | Memanfaatkan transporter ganda di usus (SGLT1 + GLUT5) tanpa memicu gangguan gastrointestinal (GI distress) |

### C. Hidrasi & Manajemen Elektrolit (Lawrence E. Armstrong & ACSM, 2007)
- **Sumber Rujukan**: Sawka, M. N., et al. (2007). *"American College of Sports Medicine position stand: Exercise and fluid replacement."* *Medicine & Science in Sports & Exercise*, 39(2), 377–390.
- **Target AI**: Mencegah dehidrasi melebihi 2% penurunan berat badan (karena kehilangan cairan >2% menurunkan daya aerobik hingga 15% dan meningkatkan suhu inti tubuh secara drastis).
- **Protokol Elektrolit**: Penggantian natrium $500 - 1000 \text{ mg per liter cairan}$ jika durasi latihan melebihi 90 menit atau pada lingkungan bersuhu >30°C.
