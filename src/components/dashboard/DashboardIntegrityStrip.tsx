"use client";

import React from "react";
import Link from "next/link";
import { Activity as ActivityIcon, Target, Calendar, ArrowRight, ShieldCheck, Terminal } from "lucide-react";
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
    <div className="p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3 shadow-xs font-mono">
      {/* Left: Telemetry Bridge Indicator & Operational Corridor */}
      <div className="flex items-center flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-secondary)] shadow-xs">
          <ActivityIcon className="w-3.5 h-3.5 text-[var(--color-strava)]" />
          <span className="font-bold tracking-tight text-[11px]">STRAVA BRIDGE</span>
          <div className="relative flex items-center justify-center w-2 h-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-endurance)] animate-ping opacity-60 absolute" />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-endurance)] relative" />
          </div>
          <span className="text-[10px] text-[var(--color-endurance)] font-bold">ONLINE</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-surface-muted)]/70 border border-[var(--color-border)] text-[10.5px] text-[var(--color-text-muted)]">
          <Terminal className="w-3 h-3 text-[var(--color-cycling)]" />
          <span>CORRIDOR:</span>
          <span className="text-[var(--color-cycling)] font-semibold">ZONE 2 AEROBIC BASE</span>
        </div>
      </div>

      {/* Right: Target Utama Showcase & Tactical Hub Navigation */}
      <div className="flex items-center flex-wrap gap-2.5">
        {primaryGoal && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs">
            <Target className="w-3.5 h-3.5 text-[var(--color-endurance)]" />
            <span className="text-[var(--color-text-primary)] font-bold truncate max-w-[200px] sm:max-w-[260px] text-[11px]">
              {primaryGoal.title}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[var(--color-endurance)]/15 border border-[var(--color-endurance)]/40 text-[var(--color-endurance)] font-bold text-[10px] font-tabular">
              {Number(primaryGoal.target_value).toFixed(0)} km
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs">
          <Link
            href="/goals"
            className="px-2.5 py-1 rounded-md bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-endurance)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center gap-1 font-semibold text-[11px]"
          >
            <span>Sasaran</span>
            <ArrowRight className="w-3 h-3 text-[var(--color-endurance)]" />
          </Link>

          <Link
            href="/training"
            className="px-2.5 py-1 rounded-md bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center gap-1 font-semibold text-[11px]"
          >
            <Calendar className="w-3 h-3 text-[var(--color-cycling)]" />
            <span>Kalender</span>
            <ArrowRight className="w-3 h-3 text-[var(--color-cycling)]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
