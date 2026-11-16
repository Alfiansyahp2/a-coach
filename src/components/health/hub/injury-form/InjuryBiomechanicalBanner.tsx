"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { AnatomicalRegionMeta } from "@/lib/anatomyUtils";

interface InjuryBiomechanicalBannerProps {
  activeMeta: AnatomicalRegionMeta;
  handleApplyTemplate: () => void;
}

export function InjuryBiomechanicalBanner({
  activeMeta,
  handleApplyTemplate,
}: InjuryBiomechanicalBannerProps) {
  return (
    <div className="p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[var(--color-cycling)] font-bold uppercase">
            Area Terpilih: {activeMeta.name}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">({activeMeta.clinicalTerm})</span>
        </div>
        <button
          type="button"
          onClick={handleApplyTemplate}
          className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--color-surface-card)] text-[var(--color-cycling)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] transition-colors flex items-center gap-1 font-semibold"
        >
          <Sparkles className="w-3 h-3 text-[var(--color-cycling)]" />
          <span>Isi Ulang Templat Klinis</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[var(--color-border)]">
        <div className="flex items-start gap-1.5 text-[var(--color-text-secondary)]">
          <span className="font-bold text-[var(--color-alert-red)] shrink-0">🏃 Lari:</span>
          <span>{activeMeta.trainingGuidance.running}</span>
        </div>
        <div className="flex items-start gap-1.5 text-[var(--color-text-secondary)]">
          <span className="font-bold text-[var(--color-cycling)] shrink-0">🚲 Sepeda:</span>
          <span>{activeMeta.trainingGuidance.cycling}</span>
        </div>
      </div>
    </div>
  );
}

