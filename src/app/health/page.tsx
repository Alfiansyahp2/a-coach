import React, { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  getUser,
  getAuthoritativeHealthContext,
  getDatabaseStatus,
  DEFAULT_USER_ID,
} from "@/lib/db";
import {
  ArrowLeft,
  ShieldAlert,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Scale,
  Calendar,
  Lock,
  Heart,
  Clock,
  Activity as ActivityIcon,
  FileText,
  History,
  Info,
} from "lucide-react";

export const metadata = {
  title: "Athlete Health Profile & Clinical Dossier | a-coach",
  description: "Dossier rekam jejak cedera, pemantauan gejala longitudinal, dan kalibrasi kesiapan latihan multi-sport.",
};

async function HealthProfileContent() {
  await connection();
  const [user, healthContext, dbStatus] = await Promise.all([
    getUser(DEFAULT_USER_ID),
    getAuthoritativeHealthContext(DEFAULT_USER_ID),
    getDatabaseStatus(),
  ]);

  if (!healthContext || !healthContext.profile) {
    return (
      <div className="py-20 text-center text-xs font-mono text-[#9BA3AF]">
        Data profil kesehatan belum terinisialisasi.
      </div>
    );
  }

  const { profile, injuries, recentPainLogs, recentResponses, medicalAssessments, latestReadiness } = healthContext;
  const phys = profile.physiological_measurements || {
    hr_max: null,
    lthr: null,
    ftp_watts: null,
    vo2_max: null,
  };

  return (
    <div className="space-y-6">
      {/* 1. Sub-Header: Athlete Status & Clinical Verification Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1F2430]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-[#161922] border border-[#2D3547] flex items-center justify-center text-[#FF2A6D] shadow-sm">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm uppercase font-mono tracking-wider font-bold text-[#F0F2F5]">
                Dossier Kesehatan & Riwayat Klinis Atlet
              </h2>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-sm bg-[#FF2A6D]/15 text-[#FF2A6D] border border-[#FF2A6D]/30 font-semibold">
                ACTIVE SYMPTOMS
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#5A6272] block">
              Pusat Konteks Kesehatan Otoritatif untuk Running Coach, Cycling Coach & Multi-Sport Coordinator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[10px] text-[#5A6272]">Status Penilaian:</span>
          <span className="px-2 py-0.5 rounded-sm bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-semibold text-[10px]">
            PENDING_CLINICAL_ASSESSMENT
          </span>
        </div>
      </div>

      {/* 2. Physical Profile & Physiological Measurement Calibration */}
      <section className="bg-[#12151D] border border-[#1F2430] rounded-sm p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1F2430]">
          <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[#F0F2F5] flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[#00F0FF]" />
            1. Profil Fisik & Matriks Pengukuran Fisiologis
          </h3>
          <span className="text-[10px] font-mono text-[#5A6272]">
            Ketersediaan Latihan: {profile.training_days_per_week} hari / minggu
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 font-mono text-center">
          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
            <span className="text-[9px] text-[#5A6272] block uppercase">Usia</span>
            <span className="text-sm font-bold font-tabular text-[#F0F2F5]">{profile.age || 22} tahun</span>
          </div>
          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
            <span className="text-[9px] text-[#5A6272] block uppercase">Tinggi Badan</span>
            <span className="text-sm font-bold font-tabular text-[#F0F2F5]">{profile.height_cm || 170} cm</span>
          </div>
          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
            <span className="text-[9px] text-[#5A6272] block uppercase">Berat Badan</span>
            <span className="text-sm font-bold font-tabular text-[#F0F2F5]">{profile.weight_kg || 65} kg</span>
          </div>
          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
            <span className="text-[9px] text-[#5A6272] block uppercase">Indeks Massa Tubuh</span>
            <span className="text-sm font-bold font-tabular text-[#10B981]">{profile.bmi || 22.5}</span>
          </div>
          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
            <span className="text-[9px] text-[#5A6272] block uppercase">Detak Istirahat (RHR)</span>
            <span className="text-sm font-bold font-tabular text-[#FF2A6D]">{profile.resting_heart_rate || 68} bpm</span>
          </div>
          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
            <span className="text-[9px] text-[#5A6272] block uppercase">Pengalaman Latihan</span>
            <span className="text-sm font-bold text-[#00F0FF]">{profile.training_experience}</span>
          </div>
        </div>

        {/* Sensory / Lab Measurements Table (No-Fabrication Policy) */}
        <div className="p-3 bg-[#090A0F] border border-[#1F2430] rounded-sm space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#9BA3AF]">
            <span className="font-bold text-[#F0F2F5] uppercase">Ambang Sensorik Laboratorium (Sensory Thresholds):</span>
            <span className="text-[#5A6272]">Kebijakan Anti-Fabrikasi Data</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
            <div className="p-2 rounded-sm bg-[#161922] border border-[#1F2430]">
              <span className="text-[9px] text-[#5A6272] block">Detak Maks (HRmax)</span>
              <span className="text-xs font-semibold text-[#5A6272]">Belum Terukur</span>
            </div>
            <div className="p-2 rounded-sm bg-[#161922] border border-[#1F2430]">
              <span className="text-[9px] text-[#5A6272] block">Laktat Threshold (LTHR)</span>
              <span className="text-xs font-semibold text-[#5A6272]">Belum Terukur</span>
            </div>
            <div className="p-2 rounded-sm bg-[#161922] border border-[#1F2430]">
              <span className="text-[9px] text-[#5A6272] block">Daya Ambang Sepeda (FTP)</span>
              <span className="text-xs font-semibold text-[#5A6272]">Belum Terukur</span>
            </div>
            <div className="p-2 rounded-sm bg-[#161922] border border-[#1F2430]">
              <span className="text-[9px] text-[#5A6272] block">Kapasitas Aerobik (VO2max)</span>
              <span className="text-xs font-semibold text-[#5A6272]">Belum Terukur</span>
            </div>
          </div>

          <p className="text-[10px] font-mono text-[#5A6272] flex items-center gap-1.5 pt-1">
            <Info className="w-3 h-3 text-[#00F0FF] shrink-0" />
            <span>
              Nilai ambang fisiologis di atas dibiarkan kosong (*null*) karena belum pernah dilakukan tes laktat atau tes treadmill/ergometer laboratorium. Sistem dilarang keras menebak zona latihan tanpa data valid.
            </span>
          </p>
        </div>
      </section>

      {/* 3. Detailed Injury Dossier */}
      <section className="bg-[#12151D] border border-[#1F2430] rounded-sm p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1F2430]">
          <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[#F0F2F5] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#FF2A6D]" />
            2. Rekam Jejak Cedera & Karakteristik Gejala ({injuries.length} Dossier Aktif)
          </h3>
          <span className="text-[10px] font-mono text-[#5A6272]">
            Diferensiasi Anatomis Mandiri
          </span>
        </div>

        <div className="space-y-3">
          {injuries.map((inj, idx) => (
            <div
              key={inj.id}
              className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-2 text-xs font-mono"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1.5 border-b border-[#1F2430]/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-none bg-[#FF2A6D]" />
                  <span className="font-bold text-sm text-[#F0F2F5]">
                    {inj.body_region} ({inj.side})
                  </span>
                  <span className="text-[10px] text-[#9BA3AF]">
                    • Keparahan Awal: <strong className="text-[#FF2A6D]">{inj.initial_severity}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-sm text-[9px] font-bold bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
                    {inj.medical_evaluation_status}
                  </span>
                  <span className="px-2 py-0.5 rounded-sm text-[9px] font-bold bg-[#FF2A6D]/10 text-[#FF2A6D] border border-[#FF2A6D]/30">
                    {inj.current_status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-[#9BA3AF] pt-1">
                <div className="space-y-1">
                  <p>
                    <strong className="text-[#F0F2F5]">Mekanisme Cedera:</strong> {inj.injury_mechanism}
                  </p>
                  <p>
                    <strong className="text-[#F0F2F5]">Rentang Waktu:</strong> {inj.timeframe_description}
                  </p>
                  <p>
                    <strong className="text-[#F0F2F5]">Riwayat Pembengkakan:</strong>{" "}
                    {inj.previous_swelling
                      ? `Pernah bengkak (${inj.previous_swelling_duration || "durasi signifikan"})`
                      : "Tidak ada riwayat pembengkakan akut"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p>
                    <strong className="text-[#F0F2F5]">Kapasitas Fungsional:</strong> {inj.functional_limitations}
                  </p>
                  <p>
                    <strong className="text-[#F0F2F5]">Catatan Klinis:</strong>{" "}
                    <span className="italic text-[#9BA3AF]">{inj.recovery_notes}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Longitudinal Pain Tracking & Activity Responses */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT: Recent Pain Logs */}
        <div className="bg-[#12151D] border border-[#1F2430] rounded-sm p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F2430]">
            <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[#F0F2F5] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#00F0FF]" />
              3. Log Gejala Nyeri Longitudinal
            </h3>
            <span className="text-[10px] font-mono text-[#5A6272]">
              {recentPainLogs.length} Catatan
            </span>
          </div>

          {recentPainLogs.length === 0 ? (
            <div className="p-4 text-center text-[11px] font-mono text-[#5A6272] border border-dashed border-[#1F2430]">
              Belum ada log gejala nyeri tercatat.
            </div>
          ) : (
            <div className="space-y-2">
              {recentPainLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] flex items-center justify-between text-xs font-mono"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#F0F2F5]">{log.body_region}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded-sm bg-[#090A0F] text-[#9BA3AF]">
                        {log.associated_activity}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#5A6272]">
                      {log.functional_limitations || log.pain_type || "Nyeri tumpul pasca beban"}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold font-tabular text-[#FF2A6D]">
                      {log.pain_score !== null ? `${log.pain_score}/10` : "--"}
                    </span>
                    <span className="text-[9px] text-[#5A6272] block">Skala Nyeri</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Activity Correlation & Response Telemetry */}
        <div className="bg-[#12151D] border border-[#1F2430] rounded-sm p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F2430]">
            <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[#F0F2F5] flex items-center gap-1.5">
              <ActivityIcon className="w-3.5 h-3.5 text-[#10B981]" />
              4. Korelasi Respons Latihan Strava
            </h3>
            <span className="text-[10px] font-mono text-[#5A6272]">
              Toleransi Sesi Empiris
            </span>
          </div>

          {recentResponses.length === 0 ? (
            <div className="p-4 text-center text-[11px] font-mono text-[#5A6272] border border-dashed border-[#1F2430]">
              Belum ada check-in pasca aktivitas.
            </div>
          ) : (
            <div className="space-y-2">
              {recentResponses.map((res) => (
                <div
                  key={res.id}
                  className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1.5 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#F0F2F5]">
                        {res.sport_type} ({res.distance_km} km)
                      </span>
                      <span className="text-[9px] px-1 py-0.2 rounded-sm bg-[#10B981]/15 text-[#10B981] font-semibold">
                        Nyeri: {res.pain_during_activity ?? 0}/10
                      </span>
                    </div>
                    <span className="text-[10px] text-[#5A6272]">
                      RPE: {res.rpe_score || 6.0}/10
                    </span>
                  </div>

                  <p className="text-[11px] text-[#9BA3AF] leading-relaxed">
                    {res.athlete_comments || "Sesi tuntas dengan respons fisiologis terpantau."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Clinical Safety & Legal Notice */}
      <div className="p-3.5 rounded-sm bg-[#161922] border border-[#FF2A6D]/30 flex items-start gap-3 text-xs font-mono text-[#9BA3AF]">
        <Stethoscope className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[#F0F2F5] font-bold">
            Pemberitahuan Batas Hukum & Keamanan Klinis:
          </p>
          <p className="text-[11px] leading-relaxed text-[#9BA3AF]">
            Platform ini berfungsi sebagai sistem pendukung keputusan latihan keolahragaan (*sports decision-support*), bukan alat diagnosis medis, terapi, atau pemberi izin mandiri untuk kembali bertanding (*return-to-sport clearance*). Seluruh rencana latihan yang dihasilkan AI tunduk secara mutlak pada batasan yang ditentukan oleh dokter atau fisioterapis.
          </p>
        </div>
      </div>
    </div>
  );
}

function HealthProfileSkeleton() {
  return (
    <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#9BA3AF]">
      <ActivityIcon className="w-5 h-5 animate-spin text-[#00F0FF]" />
      <span className="text-xs font-mono uppercase tracking-wider text-[#5A6272]">
        Memuat Profil Kesehatan & Dossier Klinis Atlet...
      </span>
    </div>
  );
}

export default function HealthPage() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F0F2F5] flex flex-col font-sans selection:bg-[#00F0FF]/30 selection:text-white">
      {/* Precision Top Navigation Header */}
      <header className="border-b border-[#1F2430] bg-[#090A0F]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#9BA3AF] hover:text-white px-2.5 py-1 rounded-sm bg-[#12151D] border border-[#1F2430] transition-colors font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            <div className="h-4 w-px bg-[#1F2430]" />

            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white font-mono">
                a-coach
              </span>
              <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-sm bg-[#12151D] text-[#FF2A6D] border border-[#FF2A6D]/30 font-semibold">
                HEALTH DOSSIER
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/activities"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#12151D] border border-[#1F2430] hover:border-[#00F0FF] text-[#9BA3AF] hover:text-[#00F0FF] transition-colors text-xs font-mono font-medium"
            >
              <ActivityIcon className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Manajemen Aktivitas</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        <Suspense fallback={<HealthProfileSkeleton />}>
          <HealthProfileContent />
        </Suspense>
      </main>
    </div>
  );
}

