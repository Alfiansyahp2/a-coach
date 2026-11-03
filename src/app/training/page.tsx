import React, { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  DEFAULT_USER_ID,
  getActiveTrainingPlan,
  getScheduledWorkouts,
  getFitnessGoals,
  getWorkoutActivityMatches,
  getAuthoritativeHealthContext,
} from "@/lib/db";
import { ScheduleTrainingHub } from "@/components/training/ScheduleTrainingHub";
import {
  ArrowLeft,
  Calendar,
  ShieldCheck,
  FolderKanban,
  Activity as ActivityIcon,
  RefreshCw,
} from "lucide-react";

export const metadata = {
  title: "Schedule Training & Microcycle Roadmap | a-coach",
  description: "Kalender jadwal latihan terstruktur, tonggak 100km Century Ride, jalur maraton, dan protokol rehabilitasi sendi.",
};

async function TrainingContent() {
  await connection();
  const [activePlan, workouts, goals, matches, healthContext] = await Promise.all([
    getActiveTrainingPlan(DEFAULT_USER_ID),
    getScheduledWorkouts(DEFAULT_USER_ID),
    getFitnessGoals(DEFAULT_USER_ID),
    getWorkoutActivityMatches(DEFAULT_USER_ID),
    getAuthoritativeHealthContext(DEFAULT_USER_ID),
  ]);

  return (
    <ScheduleTrainingHub
      initialPlan={activePlan}
      initialWorkouts={workouts}
      initialGoals={goals}
      matches={matches}
      healthContext={healthContext}
    />
  );
}

function TrainingLoadingSkeleton() {
  return (
    <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#9BA3AF]">
      <RefreshCw className="w-5 h-5 animate-spin text-[#D4FF00]" />
      <span className="text-xs font-mono uppercase tracking-wider text-[#5A6272]">
        Memuat Kalender & Jadwal Latihan Terstruktur...
      </span>
    </div>
  );
}

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F0F2F5] flex flex-col font-sans selection:bg-[#D4FF00]/30 selection:text-white">
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
              <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-sm bg-[#12151D] text-[#D4FF00] border border-[#D4FF00]/30 font-semibold">
                SCHEDULE TRAINING
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/health"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#12151D] border border-[#1F2430] hover:border-[#FF2A6D] text-[#9BA3AF] hover:text-[#FF2A6D] transition-colors text-xs font-mono font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF2A6D]" />
              <span className="hidden sm:inline">Profil</span> Kesehatan
            </Link>
            <Link
              href="/activities"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#12151D] border border-[#1F2430] hover:border-[#00F0FF] text-[#9BA3AF] hover:text-[#00F0FF] transition-colors text-xs font-mono font-medium"
            >
              <FolderKanban className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="hidden sm:inline">Manajemen</span> Aktivitas
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        <Suspense fallback={<TrainingLoadingSkeleton />}>
          <TrainingContent />
        </Suspense>
      </main>

      {/* Technical Stoic Footer */}
      <footer className="border-t border-[#1F2430] py-4 text-center text-[11px] text-[#5A6272] font-mono">
        a-coach • Injury-Aware Schedule Training & Microcycle Engine • Next.js 16 + PostgreSQL 16
      </footer>
    </div>
  );
}

