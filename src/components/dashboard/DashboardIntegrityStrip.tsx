"use client";

import React from "react";
import Link from "next/link";
import { Activity as ActivityIcon, Target, Calendar, ArrowRight } from "lucide-react";
import { User, FitnessGoal, TrainingPlan } from "@/types";

interface DashboardIntegrityStripProps {
  dbStatus?: { type: string; connected: boolean };
  user?: User | null;
  healthContext?: any;
  primaryGoal?: FitnessGoal | null;
  activePlan?: TrainingPlan | null;
}

export function DashboardIntegrityStrip({
  primaryGoal,
}: DashboardIntegrityStripProps) {
  return (
    <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3 shadow-xs">
      {/* Left: Telemetry Bridge Indicator */}
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs font-mono shadow-xs">
        <ActivityIcon className="w-3.5 h-3.5 text-[var(--color-strava)]" />
        <span className="font-semibold">Strava Bridge Active</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-endurance)] animate-pulse" />
      </div>

      {/* Right: Target Utama Showcase & Fast Navigation Hub */}
      <div className="flex items-center flex-wrap gap-3">
        {primaryGoal && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--color-endurance)]/10 border border-[var(--color-endurance)]/30 text-xs font-mono">
            <Target className="w-3.5 h-3.5 text-[var(--color-endurance)]" />
            <span className="text-[var(--color-text-primary)] font-bold truncate max-w-[220px] sm:max-w-[280px]">
              {primaryGoal.title}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-[var(--color-endurance)] text-black font-extrabold text-[10px]">
              {Number(primaryGoal.target_value).toFixed(0)} km
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs font-mono">
          <Link
            href="/goals"
            className="px-2.5 py-1 rounded-md bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center gap-1 font-semibold"
          >
            <span>Hub Sasaran</span>
            <ArrowRight className="w-3 h-3 text-[var(--color-endurance)]" />
          </Link>

          <Link
            href="/training"
            className="px-2.5 py-1 rounded-md bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center gap-1 font-semibold"
          >
            <Calendar className="w-3 h-3 text-[var(--color-cycling)]" />
            <span>Kalender Latihan</span>
            <ArrowRight className="w-3 h-3 text-[var(--color-cycling)]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
