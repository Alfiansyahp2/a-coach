import React, { Suspense } from "react";
import { connection } from "next/server";
import {
  getUser,
  getFitnessGoals,
  getActivities,
  getActiveTrainingPlan,
  getAuthoritativeHealthContext,
  getDatabaseStatus,
  DEFAULT_USER_ID,
} from "@/lib/db";
import { GoalsManagementHub } from "@/components/goals/GoalsManagementHub";
import { AppShell } from "@/components/layout/AppShell";
import { RefreshCw } from "lucide-react";

export const metadata = {
  title: "Sasaran & Target Progresif | ENDURANCE PERFORMANCE LAB",
  description:
    "Manajemen target progresif, tonggak 100km Century Ride berjenjang, dan adaptasi volume multi-sport.",
};

async function GoalsContent() {
  await connection();
  const [user, goals, activities, activePlan, healthContext, dbStatus] =
    await Promise.all([
      getUser(DEFAULT_USER_ID),
      getFitnessGoals(DEFAULT_USER_ID),
      getActivities(DEFAULT_USER_ID, { limit: 100 }),
      getActiveTrainingPlan(DEFAULT_USER_ID),
      getAuthoritativeHealthContext(DEFAULT_USER_ID),
      getDatabaseStatus(),
    ]);

  return (
    <AppShell user={user} dbStatus={dbStatus} healthContext={healthContext}>
      <GoalsManagementHub
        initialGoals={goals}
        activities={activities}
        activePlan={activePlan}
        healthContext={healthContext}
      />
    </AppShell>
  );
}

function GoalsSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-muted)] py-24 flex flex-col items-center justify-center gap-3 font-mono">
      <RefreshCw className="w-5 h-5 animate-spin text-[var(--color-cycling)]" />
      <span className="text-xs uppercase tracking-wider">
        Memuat Sasaran &amp; Target Progresif Atlet...
      </span>
    </div>
  );
}

export default function GoalsPage() {
  return (
    <Suspense fallback={<GoalsSkeleton />}>
      <GoalsContent />
    </Suspense>
  );
}

