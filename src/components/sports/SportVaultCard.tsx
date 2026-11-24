"use client";

import React from "react";
import { SystemSportItem } from "@/lib/domain/sports/systemSportsRegistry";
import { SportIcon } from "@/components/sports/SportIcon";
import { getSportFormulaMetadata } from "@/lib/domain/sports/sportRepertoireService";
import { Calculator, CheckCircle2, ChevronRight, Plus } from "lucide-react";

interface SportVaultCardProps {
  sport: SystemSportItem;
  isActiveInRepertoire?: boolean;
  onSelectSport: (sport: SystemSportItem) => void;
}

export function SportVaultCard({
  sport,
  isActiveInRepertoire = false,
  onSelectSport,
}: SportVaultCardProps) {
  const metadata = getSportFormulaMetadata(sport.code);

  return (
    <div className="flex flex-col justify-between p-3.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)]/60 transition-all group font-mono shadow-xs">
      {/* Top Header: Icon, Name & Formula Ready Badge */}
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <SportIcon sportCode={sport.code} cluster={sport.cluster} className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-cycling)] transition-colors">
                {sport.name}
              </h4>
              <span className="text-[10px] text-[var(--color-text-secondary)] block truncate">
                {sport.shortLabel} • {sport.cluster}
              </span>
            </div>
          </div>

          {/* Formula Status Indicator */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Formula Siap</span>
          </span>
        </div>

        {/* Middle: Key Formula Preview */}
        {metadata && (
          <div className="p-2 rounded-lg bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/60 text-[10px] space-y-1">
            <div className="flex items-center gap-1 text-[var(--color-text-secondary)] font-semibold">
              <Calculator className="w-3 h-3 text-[var(--color-cycling)]" />
              <span>Kalkulasi Otomatis:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {metadata.keyFormulas.map((formula, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[9px] text-[var(--color-text-primary)] font-medium"
                >
                  {formula}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer: Select / Action Button */}
      <div className="mt-3 pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
        {isActiveInRepertoire ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-cycling)] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Aktif di Feed</span>
          </span>
        ) : (
          <span className="text-[10px] text-[var(--color-text-muted)]">
            Siap diaktifkan
          </span>
        )}

        <button
          type="button"
          onClick={() => onSelectSport(sport)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[var(--color-surface-muted)] hover:bg-[var(--color-cycling)] text-[var(--color-text-primary)] hover:text-black border border-[var(--color-border)] hover:border-[var(--color-cycling)] transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-3 h-3" />
          <span>Pilih & Catat</span>
          <ChevronRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}
