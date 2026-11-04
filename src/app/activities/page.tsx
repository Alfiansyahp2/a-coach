import React, { Suspense } from "react";
import { connection } from "next/server";
import { getActivities, getUser, getDatabaseStatus, DEFAULT_USER_ID } from "@/lib/db";
import { ActivityManagementDeck } from "@/components/ActivityManagementDeck";
import { AppShell } from "@/components/layout/AppShell";
import { RefreshCw } from "lucide-react";

export const metadata = {
  title: "Activity Management & Registry | ENDURANCE PERFORMANCE LAB",
  description: "Manajemen pengelompokan aktivitas, kategorisasi sesi, dan kalibrasi telemetri atletik.",
};

async function ActivitiesContent() {
  await connection();
  const [activities, user, dbStatus] = await Promise.all([
    getActivities(DEFAULT_USER_ID, { limit: 200 }),
    getUser(DEFAULT_USER_ID),
    getDatabaseStatus(),
  ]);

  return (
    <AppShell user={user} dbStatus={dbStatus}>
      <ActivityManagementDeck activities={activities} />
    </AppShell>
  );
}

function ActivitiesSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-muted)] py-24 flex flex-col items-center justify-center gap-3 font-mono">
      <RefreshCw className="w-5 h-5 animate-spin text-[var(--color-cycling)]" />
      <span className="text-xs uppercase tracking-wider">
        Memuat Registry Aktivitas & Data Pengelompokan...
      </span>
    </div>
  );
}

export default function ActivitiesPage() {
  return (
    <Suspense fallback={<ActivitiesSkeleton />}>
      <ActivitiesContent />
    </Suspense>
  );
}
