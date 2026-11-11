"use client";

import React from "react";
import { SessionDebriefResult } from "@/types";
import { ShieldCheck, HeartPulse, Sparkles, AlertTriangle } from "lucide-react";

interface CoachSessionDebriefCardProps {
  debrief: SessionDebriefResult;
}

export function CoachSessionDebriefCard({ debrief }: CoachSessionDebriefCardProps) {
  const isOptimal = debrief.zone_compliance_rating === "PATUH_OPTIMAL";
  const hasDrift = debrief.has_cardiac_drift;

  return (
    <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs font-mono space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-cycling)]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            Audit Fisiologi Pasca Latihan
          </h4>
        </div>
        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded-md border font-tabular uppercase ${
            isOptimal
              ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
              : "bg-[var(--color-alert-amber)]/15 text-[var(--color-alert-amber)] border-[var(--color-alert-amber)]/30"
          }`}
        >
          {debrief.zone_compliance_rating.replace(/_/g, " ")}
        </span>
      </div>

      {/* 2 Telemetry Mini-Cards: Zone Compliance & Cardiac Drift */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-2.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Kepatuhan Zona</span>
          </div>
          <span className="text-base font-bold font-tabular text-[var(--color-text-primary)] mt-1 block">
            {debrief.zone_compliance_pct}%
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
            <HeartPulse
              className={`w-3.5 h-3.5 ${
                hasDrift ? "text-[var(--color-alert-amber)]" : "text-[var(--color-cycling)]"
              }`}
            />
            <span>Cardiac Drift</span>
          </div>
          <span className="text-base font-bold font-tabular text-[var(--color-text-primary)] mt-1 block">
            {debrief.aerobic_decoupling_pct
              ? `${debrief.aerobic_decoupling_pct}% (${debrief.drift_severity})`
              : "Stabil (<3%)"}
          </span>
        </div>
      </div>

      {/* Commentary & Advice */}
      <div className="p-3 rounded-lg bg-[var(--color-surface-muted)]/70 border border-[var(--color-border)] space-y-1.5 text-xs">
        <p className="text-[11px] text-[var(--color-text-primary)] leading-relaxed">
          {debrief.coach_debrief_feedback}
        </p>
        <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed pt-1 border-t border-[var(--color-border)]/50">
          <strong>Rekomendasi Pelatih:</strong> {debrief.corrective_tactical_advice}
        </p>
      </div>
    </div>
  );
}

