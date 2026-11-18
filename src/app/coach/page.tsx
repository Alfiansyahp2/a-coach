import React, { Suspense } from "react";
import { connection } from "next/server";
import {
  getUser,
  getActivities,
  getActiveTrainingPlan,
  getScheduledWorkouts,
  getFitnessGoals,
  getAuthoritativeHealthContext,
  getPersonalRecords,
  getDatabaseStatus,
  DEFAULT_USER_ID,
} from "@/lib/db";
import { CoachHub } from "@/components/coach/CoachHub";
import { AppShell } from "@/components/layout/AppShell";
import { RefreshCw } from "lucide-react";

export const metadata = {
  title: "AI Coach Intelligence | ENDURANCE PERFORMANCE LAB",
  description:
    "AI Running Coach & Cycling Coach decision-support engine with clinical safety gates and Zone 2 periodization.",
};

interface CoachPageProps {
  searchParams?: Promise<{ mode?: string }>;
}

async function CoachContent({ searchParams }: CoachPageProps) {
  await connection();
  const resolvedParams = searchParams ? await searchParams : {};
  const mode = resolvedParams?.mode === "running" ? "running" : "cycling";

  const [
    user,
    activities,
    activePlan,
    workouts,
    goals,
    healthContext,
    prs,
    dbStatus,
  ] = await Promise.all([
    getUser(DEFAULT_USER_ID),
    getActivities(DEFAULT_USER_ID, { limit: 100 }),
    getActiveTrainingPlan(DEFAULT_USER_ID),
    getScheduledWorkouts(DEFAULT_USER_ID),
    getFitnessGoals(DEFAULT_USER_ID),
    getAuthoritativeHealthContext(DEFAULT_USER_ID),
    getPersonalRecords(DEFAULT_USER_ID),
    getDatabaseStatus(),
  ]);

  return (
    <AppShell user={user} dbStatus={dbStatus} healthContext={healthContext}>
      <CoachHub
        initialMode={mode}
        activities={activities}
        workouts={workouts}
        goals={goals}
        activePlan={activePlan}
        healthContext={healthContext}
        prs={prs}
      />
    </AppShell>
  );
}

function CoachSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-muted)] py-24 flex flex-col items-center justify-center gap-3 font-mono">
      <RefreshCw className="w-5 h-5 animate-spin text-[var(--color-cycling)]" />
      <span className="text-xs uppercase tracking-wider">
        Mengakses Telemetri AI Coach Intelligence...
      </span>
    </div>
  );
}

export default function CoachPage(props: CoachPageProps) {
  return (
    <Suspense fallback={<CoachSkeleton />}>
      <CoachContent {...props} />
    </Suspense>
  );
}

