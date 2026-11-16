"use client";

import React from "react";
import { AuthoritativeAthleteHealthContext } from "@/types";
import { ShieldCheck, ShieldAlert, Bike, Footprints, Activity } from "lucide-react";

interface CalendarClinicalReadinessStripProps {
  healthContext: AuthoritativeAthleteHealthContext | null;
}

export function CalendarClinicalReadinessStrip({
  healthContext,
}: CalendarClinicalReadinessStripProps) {
  if (!healthContext?.latestReadiness) return null;

  const r = healthContext.latestReadiness;
  const isRunningOnHold = r.running_readiness === "ON_HOLD" || r.running_readiness === "REQUIRES_CLINICAL_REVIEW";
  const isCyclingReady = r.cycling_readiness === "READY" || r.cycling_readiness === "CONDITIONAL";

  return (
    <div className="p-3.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] font-mono text-xs shadow-xs space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2">
        <div className="flex items-center gap-2">
          {isRunningOnHold ? (
            <div className="w-6 h-6 rounded-md bg-[var(--color-alert-amber)]/15 text-[var(--color-alert-amber)] border border-[var(--color-alert-amber)]/30 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-md bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="font-bold text-[11px] text-[var(--color-text-primary)] uppercase tracking-wider">
            Clinical Joint Clearance &amp; Readiness Kalender
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[var(--color-text-muted)]">Status Atlet:</span>
          <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
            r.athlete_status === "OPTIMAL_CLEAR"
              ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30"
              : "bg-[var(--color-alert-amber)]/15 text-[var(--color-alert-amber)] border border-[var(--color-alert-amber)]/30"
          }`}>
            {r.athlete_status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[10.5px]">
        {/* Sport 1: Cycling Readiness */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)]">
          <Bike className="w-4 h-4 text-[var(--color-cycling)] shrink-0" />
          <div className="truncate">
            <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Sepeda MTB:</div>
            <div className="font-bold text-[var(--color-cycling)] truncate">
              {isCyclingReady ? "CLEAR • Zone 2 Cadence 85 RPM" : r.cycling_readiness}
            </div>
          </div>
        </div>

        {/* Sport 2: Running Readiness */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)]">
          <Footprints className={`w-4 h-4 shrink-0 ${isRunningOnHold ? "text-[var(--color-alert-amber)]" : "text-[var(--color-running)]"}`} />
          <div className="truncate">
            <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Lari Eksternal:</div>
            <div className={`font-bold truncate ${isRunningOnHold ? "text-[var(--color-alert-amber)]" : "text-[var(--color-running)]"}`}>
              {isRunningOnHold ? "HOLD • Proteksi ATFL Ankle" : "READY • Bebas Beban"}
            </div>
          </div>
        </div>

        {/* Sport 3: Daily Wellness / Fatigue */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)] sm:col-span-2 md:col-span-1">
          <Activity className="w-4 h-4 text-[var(--color-endurance)] shrink-0" />
          <div className="truncate">
            <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Wellness Harian:</div>
            <div className="font-bold text-[var(--color-text-primary)] truncate font-tabular">
              {healthContext.todayWellness
                ? `Kelelahan ${healthContext.todayWellness.fatigue_score ?? 1}/5 • Tidur ${healthContext.todayWellness.sleep_duration_hours ?? 7}h`
                : "Optimal • Tidak Ada Nyeri Akut"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

