import React, { Suspense } from "react";
import { connection } from "next/server";
import {
  getUser,
  getAuthoritativeHealthContext,
  getActivities,
  getDatabaseStatus,
  DEFAULT_USER_ID,
} from "@/lib/db";
import { AthleteHealthHub } from "@/components/health/AthleteHealthHub";
import { AppShell } from "@/components/layout/AppShell";
import { RefreshCw } from "lucide-react";

export const metadata = {
  title: "Athlete Health Profile & Clinical Dossier | ENDURANCE PERFORMANCE LAB",
  description: "Dossier rekam jejak cedera, pemantauan gejala longitudinal, dan kalibrasi kesiapan latihan multi-sport.",
};

async function HealthContent() {
  await connection();
  const [user, healthContext, activities, dbStatus] = await Promise.all([
    getUser(DEFAULT_USER_ID),
    getAuthoritativeHealthContext(DEFAULT_USER_ID),
    getActivities(DEFAULT_USER_ID, { limit: 50 }),
    getDatabaseStatus(),
  ]);

  return (
    <AppShell user={user} dbStatus={dbStatus} healthContext={healthContext}>
      {!healthContext || !healthContext.profile ? (
        <div className="py-20 text-center text-xs font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)]">
          Data profil kesehatan belum terinisialisasi.
        </div>
      ) : (
        <AthleteHealthHub
          initialContext={healthContext}
          recentActivities={activities}
        />
      )}
    </AppShell>
  );
}

function HealthSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-muted)] py-24 flex flex-col items-center justify-center gap-3 font-mono">
      <RefreshCw className="w-5 h-5 animate-spin text-[var(--color-alert-red)]" />
      <span className="text-xs uppercase tracking-wider">
        Memuat Profil Kesehatan & Dossier Klinis Atlet...
      </span>
    </div>
  );
}

export default function HealthPage() {
  return (
    <Suspense fallback={<HealthSkeleton />}>
      <HealthContent />
    </Suspense>
  );
}
