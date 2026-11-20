"use client";

import React from "react";
import { SportCoachUiDefinition } from "@/lib/domain/coach/schema/sportCoachUiSchema";
import { ShieldCheck, ShieldAlert, Zap, Clock, BookOpen, HeartPulse } from "lucide-react";

interface DynamicCoachDebriefCardProps {
  definition: SportCoachUiDefinition;
  values: Record<string, any>;
  durationMinutes?: number;
  sessionRpe?: number;
}

export function DynamicCoachDebriefCard({
  definition,
  values,
  durationMinutes = 60,
  sessionRpe = 7,
}: DynamicCoachDebriefCardProps) {
  // Check for any tripped safety alerts in the dynamic values
  const hasSafetyAlert = Boolean(
    values.jointPainReported ||
    values.headImpactObserved ||
    values.extremeFatigueExhaustion ||
    values.upperLimbStrain
  );

  const strainAU = Math.round(durationMinutes * sessionRpe);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 font-mono space-y-3 shadow-xs">
      {/* Header with Coach Identity */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2.5">
        <div>
          <span className="text-[10px] text-[var(--color-cycling)] uppercase font-bold tracking-wider block">
            AI Coach Specialize Intelligence
          </span>
          <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
            {definition.sportName} AI Coach
          </h4>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] font-semibold">
          {definition.cluster}
        </span>
      </div>

      {/* Governing Science Standard */}
      <div className="flex items-start gap-2 text-[11px] text-[var(--color-text-secondary)]">
        <BookOpen className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0 mt-0.5" />
        <span className="line-clamp-2">
          Standar Sains: <strong className="text-[var(--color-text-primary)]">{definition.governingStandard}</strong>
        </span>
      </div>

      {/* Energy System & Simulated Internal Strain */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
        <div className="p-2 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase block flex items-center gap-1">
            <Zap className="w-3 h-3 text-[var(--color-cycling)]" /> Jalur Energi
          </span>
          <span className="font-bold text-[var(--color-text-primary)] truncate block mt-0.5 text-[11px]">
            {definition.primaryEnergySystem}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase block flex items-center gap-1">
            <HeartPulse className="w-3 h-3 text-[var(--color-endurance)]" /> Internal Strain
          </span>
          <span className="font-bold text-[var(--color-text-primary)] font-tabular block mt-0.5 text-[11px]">
            {strainAU} AU (Foster)
          </span>
        </div>
      </div>

      {/* Safety Circuit Breaker Gate */}
      <div
        className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 transition-colors ${
          hasSafetyAlert
            ? "bg-[var(--color-alert-red)]/10 border-[var(--color-alert-red)]/40 text-[var(--color-alert-red)]"
            : "bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-secondary)]"
        }`}
      >
        {hasSafetyAlert ? (
          <>
            <ShieldAlert className="w-4 h-4 shrink-0 text-[var(--color-alert-red)]" />
            <div className="text-[11px]">
              <strong className="block font-bold">Circuit Breaker TRIP (Alarm Keamanan)</strong>
              <span>Gejala klinis dilaporkan. Progresi beban otomatis dikunci demi pencegahan cedera.</span>
            </div>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4 shrink-0 text-[var(--color-cycling)]" />
            <div className="text-[11px]">
              <strong className="block font-bold text-[var(--color-text-primary)]">Circuit Breaker Clear</strong>
              <span>Tidak ada sinyal nyeri sendi atau red-flag akut. Sesi dalam batas adaptasi aman.</span>
            </div>
          </>
        )}
      </div>

      {/* Periodization & Rest Directive */}
      <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] pt-1 border-t border-[var(--color-border)]">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> Rekomendasi Jeda Pemulihan:
        </span>
        <span className="font-bold text-[var(--color-text-primary)] font-tabular">
          {sessionRpe >= 8 || hasSafetyAlert ? "48 - 72 Jam" : "24 - 48 Jam"}
        </span>
      </div>
    </div>
  );
}
