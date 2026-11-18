import React, { Suspense } from "react";
import { connection } from "next/server";
import {
  getUser,
  getAthleteProfile,
  getAuthoritativeHealthContext,
  getAthleteEquipment,
  getActivities,
  getScheduledWorkouts,
  getDatabaseStatus,
  DEFAULT_USER_ID,
} from "@/lib/db";
import { calculateWeeklyStreak } from "@/lib/domain/streak/streakEngine";
import { AthleteProfileHub } from "@/components/profile/AthleteProfileHub";
import { AppShell } from "@/components/layout/AppShell";
import { RefreshCw } from "lucide-react";

export const metadata = {
  title: "Profil Atlet & Kalibrasi Biometrik | ENDURANCE PERFORMANCE LAB",
  description: "Dossier biometrik, zona denyut jantung Karvonen, kapasitas fisiologis, dan manajemen gear atlet.",
};

async function ProfileContent() {
  await connection();
  const [user, profile, healthContext, equipment, activities, workouts, dbStatus] = await Promise.all([
    getUser(DEFAULT_USER_ID),
    getAthleteProfile(DEFAULT_USER_ID),
    getAuthoritativeHealthContext(DEFAULT_USER_ID),
    getAthleteEquipment(DEFAULT_USER_ID),
    getActivities(DEFAULT_USER_ID, { limit: 100 }),
    getScheduledWorkouts(DEFAULT_USER_ID),
    getDatabaseStatus(),
  ]);

  const streak = calculateWeeklyStreak(activities, workouts);

  if (!user) {
    return (
      <div className="py-20 text-center text-xs font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)]">
        Data profil atlet belum ditemukan.
      </div>
    );
  }

  return (
    <AppShell
      user={user}
      dbStatus={dbStatus}
      healthContext={healthContext}
      streakWeeks={streak.currentStreakWeeks}
    >
      <AthleteProfileHub
        initialUser={user}
        initialProfile={profile}
        healthContext={healthContext}
        initialEquipment={equipment}
        activities={activities}
        workouts={workouts}
        streakWeeks={streak.currentStreakWeeks}
      />
    </AppShell>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-muted)] py-24 flex flex-col items-center justify-center gap-3 font-mono">
      <RefreshCw className="w-5 h-5 animate-spin text-[var(--color-cycling)]" />
      <span className="text-xs uppercase tracking-wider">
        Memuat Profil Atlet &amp; Kalibrasi Biometrik...
      </span>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}

