import React, { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  getUser,
  getAuthoritativeHealthContext,
  getActivities,
  getDatabaseStatus,
  DEFAULT_USER_ID,
} from "@/lib/db";
import { AthleteHealthHub } from "@/components/health/AthleteHealthHub";
import {
  ArrowLeft,
  Calendar,
  Activity as ActivityIcon,
} from "lucide-react";

export const metadata = {
  title: "Athlete Health Profile & Clinical Dossier | a-coach",
  description: "Dossier rekam jejak cedera, pemantauan gejala longitudinal, dan kalibrasi kesiapan latihan multi-sport.",
};

async function HealthProfileContent() {
  await connection();
  const [user, healthContext, activities, dbStatus] = await Promise.all([
    getUser(DEFAULT_USER_ID),
    getAuthoritativeHealthContext(DEFAULT_USER_ID),
    getActivities(DEFAULT_USER_ID, { limit: 50 }),
    getDatabaseStatus(),
  ]);

  if (!healthContext || !healthContext.profile) {
    return (
      <div className="py-20 text-center text-xs font-mono text-[#9BA3AF]">
        Data profil kesehatan belum terinisialisasi.
      </div>
    );
  }

  return (
    <AthleteHealthHub
      initialContext={healthContext}
      recentActivities={activities}
    />
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

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/training"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#12151D] border border-[#1F2430] hover:border-[#D4FF00] text-[#9BA3AF] hover:text-[#D4FF00] transition-colors text-xs font-mono font-medium"
            >
              <Calendar className="w-3.5 h-3.5 text-[#D4FF00]" />
              <span className="hidden sm:inline">Jadwal</span> Latihan
            </Link>
            <Link
              href="/activities"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#12151D] border border-[#1F2430] hover:border-[#00F0FF] text-[#9BA3AF] hover:text-[#00F0FF] transition-colors text-xs font-mono font-medium"
            >
              <ActivityIcon className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="hidden sm:inline">Manajemen</span> Aktivitas
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
