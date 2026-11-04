import React, { Suspense } from "react";
import { connection } from "next/server";
import {
  DEFAULT_USER_ID,
  getUser,
  getActiveTrainingPlan,
  getScheduledWorkouts,
  getFitnessGoals,
  getWorkoutActivityMatches,
  getAuthoritativeHealthContext,
  getDatabaseStatus,
} from "@/lib/db";
import { formatDateOnly } from "@/lib/formatters";
import { ScheduleTrainingHub } from "@/components/training/ScheduleTrainingHub";
import { AppShell } from "@/components/layout/AppShell";
import { RefreshCw } from "lucide-react";

export const metadata = {
  title: "Schedule Training & Periodization | ENDURANCE PERFORMANCE LAB",
  description: "Kalender jadwal latihan terstruktur, tonggak 100km Century Ride, jalur maraton, dan protokol rehabilitasi sendi.",
};

async function TrainingContent() {
  await connection();
  const [user, activePlan, workouts, goals, matches, healthContext, dbStatus] = await Promise.all([
    getUser(DEFAULT_USER_ID),
    getActiveTrainingPlan(DEFAULT_USER_ID),
    getScheduledWorkouts(DEFAULT_USER_ID),
    getFitnessGoals(DEFAULT_USER_ID),
    getWorkoutActivityMatches(DEFAULT_USER_ID),
    getAuthoritativeHealthContext(DEFAULT_USER_ID),
    getDatabaseStatus(),
  ]);

  const serverToday = formatDateOnly(new Date());

  return (
    <AppShell user={user} dbStatus={dbStatus} healthContext={healthContext}>
      <ScheduleTrainingHub
        initialPlan={activePlan}
        initialWorkouts={workouts}
        initialGoals={goals}
        matches={matches}
        healthContext={healthContext}
        initialTodayDate={serverToday}
      />
    </AppShell>
  );
}

function TrainingSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-muted)] py-24 flex flex-col items-center justify-center gap-3 font-mono">
      <RefreshCw className="w-5 h-5 animate-spin text-[var(--color-endurance)]" />
      <span className="text-xs uppercase tracking-wider">
        Memuat Kalender & Jadwal Latihan Terstruktur...
      </span>
    </div>
  );
}

export default function TrainingPage() {
  return (
    <Suspense fallback={<TrainingSkeleton />}>
      <TrainingContent />
    </Suspense>
  );
}
