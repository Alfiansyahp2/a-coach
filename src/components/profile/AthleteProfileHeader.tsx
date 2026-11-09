"use client";

import React from "react";
import Link from "next/link";
import { User, AthleteProfile, AuthoritativeAthleteHealthContext } from "@/types";
import {
  ShieldCheck,
  Flame,
  Calendar,
  Pencil,
  Activity,
  HeartPulse,
  Target,
  Sparkles,
} from "lucide-react";

interface AthleteProfileHeaderProps {
  user: User;
  profile: AthleteProfile | null;
  healthContext: AuthoritativeAthleteHealthContext | null;
  streakWeeks?: number;
  onOpenEdit: () => void;
}

export function AthleteProfileHeader({
  user,
  profile,
  healthContext,
  streakWeeks = 10,
  onOpenEdit,
}: AthleteProfileHeaderProps) {
  const readiness = healthContext?.latestReadiness;
  const isReadinessConditional = readiness?.athlete_status === "ACTIVE_WITH_UNRESOLVED_SYMPTOMS";

  return (
    <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 sm:p-6 shadow-xs relative overflow-hidden">
      {/* Subtle athletic background glow */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-[var(--color-cycling)]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Avatar & Identity Block */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 min-w-0">
          {/* Avatar with Status Ring */}
          <div className="relative shrink-0">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-[var(--color-border)] object-cover shadow-sm ring-2 ring-[var(--color-cycling)]/40"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[var(--color-surface-muted)] border-2 border-[var(--color-border)] ring-2 ring-[var(--color-cycling)]/40 flex items-center justify-center font-mono font-black text-2xl text-[var(--color-cycling)] shadow-sm">
                {user.name.charAt(0)}
              </div>
            )}
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-cycling)] border-2 border-[var(--color-surface-card)] flex items-center justify-center shadow-xs"
              title="Atlet Terkalibrasi"
            >
              <Sparkles className="w-2.5 h-2.5 text-[var(--color-canvas)]" />
            </span>
          </div>

          {/* Text Identity */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-[var(--color-text-primary)]">
                {user.name}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-bold tracking-wider uppercase">
                Calibrated Athlete
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[var(--color-cycling)]" />
                <span>{profile?.training_experience || "INTERMEDIATE"}</span>
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-[var(--color-text-muted)] flex-wrap">
              <span>{user.email}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Bergabung Sejak Nov 2026</span>
              </span>
            </div>

            {/* Season Objective Chip */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text-secondary)] max-w-full">
                <Target className="w-3.5 h-3.5 text-[var(--color-endurance)] shrink-0" />
                <span className="truncate font-medium">
                  {profile?.performance_objectives || "Aerobic endurance maintenance with safe multi-sport progression"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Highlights & Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--color-border)]">
          {/* Status Badges Row */}
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            {/* Streak Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--color-running)]/10 text-[var(--color-running)] border border-[var(--color-running)]/30 font-bold shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-[var(--color-running)]" />
              <span>{streakWeeks} MINGGU STREAK</span>
            </div>

            {/* Health Readiness Gate */}
            <Link
              href="/health"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold border transition-colors shadow-xs ${
                isReadinessConditional
                  ? "bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border-[var(--color-alert-red)]/30 hover:bg-[var(--color-alert-red)]/20"
                  : "bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border-[var(--color-cycling)]/30 hover:bg-[var(--color-cycling)]/20"
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>{isReadinessConditional ? "GATE: PEMANTAUAN SENDI" : "STATUS: OPTIMAL"}</span>
            </Link>
          </div>

          {/* Edit Profile Action Button */}
          <button
            onClick={onOpenEdit}
            type="button"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] text-[var(--color-text-primary)] hover:text-[var(--color-cycling)] transition-all font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>EDIT PROFIL &amp; BIOMETRIK</span>
          </button>
        </div>
      </div>
    </div>
  );
}
