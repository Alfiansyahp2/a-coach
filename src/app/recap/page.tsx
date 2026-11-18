import React, { Suspense } from "react";
import { connection } from "next/server";
import {
  DEFAULT_USER_ID,
  getUser,
  getActivities,
  getScheduledWorkouts,
  getDatabaseStatus,
  getAuthoritativeHealthContext,
} from "@/lib/db";
import { computeWeeklyActivityAndInjuryRecap } from "@/lib/domain/analytics/weeklyRecapEngine";
import { AppShell } from "@/components/layout/AppShell";
import { WeeklyRecapHub } from "@/components/recap/WeeklyRecapHub";
import { RefreshCw } from "lucide-react";

export const metadata = {
  title: "Rekap Mingguan Telemetri & Analisis Klinis | ENDURANCE PERFORMANCE LAB",
  description:
    "Rekapitulasi beban kerja fisik 7 hari, analisis insiden cidera, telemetri nyeri, dan preskripsi pelatih.",
};

async function WeeklyRecapContent() {
  await connection();
  const [user, activities, workouts, dbStatus, healthContext] = await Promise.all([
    getUser(DEFAULT_USER_ID),
    getActivities(DEFAULT_USER_ID, { limit: 100 }),
    getScheduledWorkouts(DEFAULT_USER_ID),
    getDatabaseStatus(),
    getAuthoritativeHealthContext(DEFAULT_USER_ID),
  ]);

  const recap = computeWeeklyActivityAndInjuryRecap({
    activities,
    injuries: healthContext?.injuries || [],
    painLogs: healthContext?.recentPainLogs || [],
    trainingResponses: healthContext?.recentResponses || [],
    scheduledWorkouts: workouts,
  });

  return (
    <AppShell user={user} dbStatus={dbStatus} healthContext={healthContext}>
      <WeeklyRecapHub initialRecap={recap} />
    </AppShell>
  );
}

function WeeklyRecapSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-muted)] py-24 flex flex-col items-center justify-center gap-3 font-mono">
      <RefreshCw className="w-5 h-5 animate-spin text-[var(--color-cycling)]" />
      <span className="text-xs uppercase tracking-wider">
        Memuat Rekap Telemetri Mingguan &amp; Status Klinis...
      </span>
    </div>
  );
}

export default function WeeklyRecapPage() {
  return (
    <Suspense fallback={<WeeklyRecapSkeleton />}>
      <WeeklyRecapContent />
    </Suspense>
  );
}

