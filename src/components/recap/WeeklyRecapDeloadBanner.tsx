"use client";

import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { DeloadCelebration } from "@/lib/domain/analytics/weeklyRecapTypes";

interface WeeklyRecapDeloadBannerProps {
  deload?: DeloadCelebration;
}

export function WeeklyRecapDeloadBanner({ deload }: WeeklyRecapDeloadBannerProps) {
  if (!deload || !deload.is_deload_week) return null;

  return (
    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 font-mono shadow-xs space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              {deload.title}
            </h4>
            <span className="text-[10px] text-[var(--color-text-secondary)]">
              Pengenalan Siklus Pemulihan Fisiologis
            </span>
          </div>
        </div>

        <span className="text-[9.5px] font-bold px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-tabular uppercase self-start sm:self-auto flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{deload.appreciation_badge}</span>
        </span>
      </div>

      <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed pt-1 border-t border-cyan-500/20">
        {deload.scientific_rationale}
      </p>
    </div>
  );
}
