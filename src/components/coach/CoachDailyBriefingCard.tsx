"use client";

import React from "react";
import { DailyCoachBriefing } from "@/types";
import {
  Compass,
  Utensils,
  Gauge,
  AlertTriangle,
  Moon,
  CheckCircle2,
} from "lucide-react";

interface CoachDailyBriefingCardProps {
  briefing: DailyCoachBriefing;
}

export function CoachDailyBriefingCard({ briefing }: CoachDailyBriefingCardProps) {
  const isCritical = briefing.badgeTone === "critical";
  const isWarning = briefing.badgeTone === "warning";
  const isInfo = briefing.badgeTone === "info";

  const badgeBg = isCritical
    ? "bg-[var(--color-alert-red)]/15 text-[var(--color-alert-red)] border-[var(--color-alert-red)]/30"
    : isWarning
    ? "bg-[var(--color-alert-amber)]/15 text-[var(--color-alert-amber)] border-[var(--color-alert-amber)]/30"
    : isInfo
    ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
    : "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border-[var(--color-cycling)]/30";

  return (
    <div className="p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs font-mono space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/30 flex items-center justify-center text-[var(--color-cycling)] shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              {briefing.greeting}
            </h3>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Daily Coach Tactical Briefing &amp; Auto-Regulation
            </span>
          </div>
        </div>

        <span
          className={`text-[9px] font-bold px-2.5 py-1 rounded-md border font-tabular uppercase self-start sm:self-auto ${badgeBg}`}
        >
          {briefing.todayStatus}
        </span>
      </div>

      {/* Main Recommendation Callout */}
      <div className="p-4 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)]">
          <CheckCircle2 className="w-4 h-4 text-[var(--color-cycling)] shrink-0" />
          <h4>{briefing.recommendationHeadline}</h4>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          {briefing.recommendedAction}
        </p>
      </div>

      {/* Fasting Awareness Banner if Present */}
      {briefing.fastingAwareness && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/20 text-xs">
          <Moon className="w-4 h-4 text-[var(--color-cycling)] shrink-0" />
          <span className="text-[11px] text-[var(--color-text-primary)]">
            <strong>Kalibrasi Puasa:</strong> {briefing.fastingAwareness.guideline}
          </span>
        </div>
      )}

      {/* 3 Pillar Tactical Instructions (Nutrisi, Kadens/Biomekanika, Red Flags) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)] space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-text-primary)]">
            <Utensils className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Strategi Nutrisi</span>
          </div>
          <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">
            {briefing.tacticalInstructions.nutritionalStrategy}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)] space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-text-primary)]">
            <Gauge className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Target Kadens / Sendi</span>
          </div>
          <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">
            {briefing.tacticalInstructions.cadenceBiomechanicalTarget}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)] space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-alert-amber)]">
            <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-alert-amber)]" />
            <span>Kriteria Berhenti</span>
          </div>
          <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">
            {briefing.tacticalInstructions.safetyRedFlags}
          </p>
        </div>
      </div>
    </div>
  );
}

