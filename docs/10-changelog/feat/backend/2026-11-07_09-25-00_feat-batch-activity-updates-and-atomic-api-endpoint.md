# Changelog: Batch Activity Updates & Atomic Multi-Activity Endpoint (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-07 09:25:00 WIB
- **Tipe**: `feat(backend)` / `feat(api)` / `feat(activity)` / `perf(ui)`
- **Commit Message Rujukan**: `feat(backend): implement atomic batch activity update endpoint and optimize client-side bulk operations`
- **Branch**: `feat/backend`
- **Lokasi**: `docs/10-changelog/feat/backend/2026-11-07_09-25-00_feat-batch-activity-updates-and-atomic-api-endpoint.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Berdasarkan audit inventaris endpoint pada [`docs/backend-audit/03-api-inventory-and-contracts.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/backend-audit/03-api-inventory-and-contracts.md) bagian 3:

1. **Ketiadaan Endpoint Batch Mandiri**:
   - Fitur *Batch Activity Updates* yang didokumentasikan pada README dan bilah alat [`ActivityBatchActionBar.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/deck/ActivityBatchActionBar.tsx) belum memiliki rute API backend tersendiri.
2. **Beban Overhead & Risiko Partial Failure**:
   - Komponen antarmuka [`ActivityManagementDeck.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/ActivityManagementDeck.tsx) sebelumnya mengeksekusi pengubahan cabang massal dengan menembakkan $N$ request HTTP `PATCH /api/activities/[id]` individual secara paralel (`Promise.all(...)`).
   - Pendekatan ini tidak efisien secara jaringan, boros *connection pool* PostgreSQL, dan jika salah satu request gagal di tengah jalan, status data menjadi tidak konsisten (*partial update inconsistency*).

Pembaruan ini menghadirkan fungsi repositori atomik dan rute endpoint baru `POST /api/activities/batch`, serta mengintegrasikannya ke UI manajemen aktivitas.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Fungsi Repositori Pembaruan Massal Atomik (`src/lib/db/activityRepo.ts`)

Menambahkan fungsi `batchUpdateActivities`:
```typescript
export async function batchUpdateActivities(
  ids: string[],
  updates: { sport_type?: string },
  userId: string = DEFAULT_USER_ID
): Promise<number> {
  if (ids.length === 0) return 0;
  if (pgPool) {
    const res = await pgPool.query(
      `UPDATE activities SET
        sport_type = COALESCE($1, sport_type),
        updated_at = NOW()
      WHERE id = ANY($2::uuid[]) AND user_id = $3
      RETURNING id`,
      [updates.sport_type || null, ids, userId]
    );
    return res.rowCount || 0;
  }

  const store = ensureLocalStore();
  let count = 0;
  for (const act of store.activities) {
    if (ids.includes(act.id) && act.user_id === userId) {
      if (updates.sport_type) act.sport_type = updates.sport_type as any;
      act.updated_at = new Date().toISOString();
      count++;
    }
  }
  saveLocalStore(store);
  return count;
}
```
- **Karakteristik Query**: Menggunakan operator PostgreSQL `ANY($2::uuid[])` yang memproses seluruh daftar ID dalam 1 siklus transaksi SQL atomik.

---

### B. Endpoint REST API Baru (`src/app/api/activities/batch/route.ts`)

Rute API baru berukuran 43 baris yang menangani payload pembaruan massal:
- **Metode**: `POST /api/activities/batch`
- **Request Body (JSON)**:
  ```json
  {
    "activity_ids": ["uuid-1", "uuid-2", "uuid-3"],
    "updates": {
      "sport_type": "Ride"
    }
  }
  ```
- **Validasi**:
  - Memastikan `activity_ids` berbentuk array dan tidak kosong (HTTP 400 jika tidak valid).
- **Efek Samping**:
  - Memanggil `revalidatePath('/activities')` dan `revalidatePath('/')` sehingga seluruh kartu KPI, pengelompokan cabang, dan kalender langsung tersinkronisasi.
- **Respons Contract (HTTP 200)**:
  ```json
  {
    "success": true,
    "message": "Successfully updated 3 activities",
    "updatedCount": 3
  }
  ```

---

### C. Refaktorisasi UI Manajemen Aktivitas (`src/components/activity/ActivityManagementDeck.tsx`)

Menghubungkan tombol "Terapkan Massal" langsung ke endpoint batch baru:
```typescript
  // Batch update sport type
  const handleBatchUpdateSport = async () => {
    if (selectedIds.length === 0) return;
    try {
      setBatchLoading(true);

      const res = await fetch("/api/activities/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_ids: selectedIds,
          updates: { sport_type: batchSport },
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Batch update failed");
      }

      // Update local state
      setActivities((prev) =>
        prev.map((a) =>
          selectedIds.includes(a.id) ? { ...a, sport_type: batchSport } : a
        )
      );

      setSelectedIds([]);
      router.refresh();
    } catch (err) {
      console.error("Batch update failed:", err);
      alert("Gagal melakukan pembaruan massal.");
    } finally {
      setBatchLoading(false);
    }
  };
```

---

## 3. Matriks Perbandingan Git Diff

| Berkas Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/lib/db/activityRepo.ts` | Modifikasi | +31 | 0 | Implementasi query atomik `batchUpdateActivities` (PostgreSQL `ANY` + mirror JSON) |
| `src/app/api/activities/batch/route.ts` | Baru | +43 | 0 | Route handler `POST /api/activities/batch` dengan validasi array ID dan revalidasi cache |
| `src/components/activity/ActivityManagementDeck.tsx` | Modifikasi | +13 | -9 | Refaktor `handleBatchUpdateSport` dari $N$ paralel request menjadi 1 request atomik |

**Total Akumulasi**: 3 berkas termodifikasi/dibuat, **+87 baris ditambahkan**, **-9 baris dihapus**.

---

## 4. Hasil Pengujian & Jaminan Mutu

1. **Pemeriksaan Kompilasi TypeScript**:
   - Perintah: `npx tsc --noEmit`
   - **Hasil**: **0 Errors, Exit Code 0 (100% Type-Safe)**.
2. **Suite Verifikasi Kesehatan & Kesiapan Cedera Atlet**:
   - Perintah: `node scripts/tests/test_athlete_health_system.js`
   - **Hasil**: **31 PASSED, 0 FAILED**.
3. **Suite Verifikasi Rentetan Latihan & Spektrum Api**:
   - Perintah: `node scripts/tests/test_weekly_streak_system.js`
   - **Hasil**: **21 PASSED, 0 FAILED**.
4. **Suite Verifikasi Sistem Rekomendasi Pelatihan Coach**:
   - Perintah: `node scripts/tests/test_coach_training_system.js`
   - **Hasil**: **5 PASSED, 0 FAILED**.
5. **Suite Integrasi Sasaran Pelatihan & Periodisasi**:
   - Perintah: `node scripts/tests/test_goal_driven_training_engine.js`
   - **Hasil**: **13 PASSED, 0 FAILED**.
6. **Suite Verifikasi Parser Gambar OCR & Input Manual**:
   - Perintah: `node scripts/tests/test_add_activity_flow.js`
   - **Hasil**: **PASSED (Detected 10.14 km, 41m 6s, 14.8 km/h)**.
7. **Total Assertions Lulus**: **70 / 70 Assertions (100% Lulus)**.

---

## 5. Dampak Sistem

- **Penyelarasan Sempurna Spesifikasi vs Realitas**: Celah terakhir katalog API yang dicatat pada audit Dokumen 03 kini telah terimplementasi penuh.
- **Efisiensi Jaringan Tinggi**: Operasi pemilihan multi-aktivitas di UI `/activities` kini dieksekusi secara instan dalam 1 kali round-trip HTTP terlepas dari berapa banyak sesi yang dipilih.
- **Konsistensi Data Terjamin**: Pembaruan bersifat atomik sehingga mencegah kemungkinan ketidaksesuaian data parsial jika koneksi jaringan terputus.

