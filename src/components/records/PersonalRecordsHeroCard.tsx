"use client";

import React from "react";
import Link from "next/link";
import { PersonalRecord } from "@/types";
import { formatDate } from "@/lib/formatters";
import { Calendar, ArrowUpRight } from "lucide-react";

interface PersonalRecordsHeroCardProps {
  pr: PersonalRecord;
  isRun: boolean;
}

export function PersonalRecordsHeroCard({ pr, isRun }: PersonalRecordsHeroCardProps) {
  const accentColorClass = isRun ? "text-[var(--color-running)]" : "text-[var(--color-cycling)]";
  const hoverBorderClass = isRun ? "hover:border-[var(--color-running)]/60" : "hover:border-[var(--color-cycling)]/60";

  return (
    <Link
      href={pr.activity_id ? `/activities/${pr.activity_id}` : "#"}
      className={`block p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] ${hoverBorderClass} transition-all group relative shadow-xs font-mono`}
    >
      <div className="flex items-center justify-between gap-2 text-xs text-[var(--color-text-secondary)] mb-1.5">
        <span className={`uppercase font-bold tracking-wider ${accentColorClass} flex items-center gap-1.5 text-[11px] truncate`}>
          ★ Featured • {pr.category}
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1 shrink-0 whitespace-nowrap">
          <Calendar className="w-3 h-3" />
          {formatDate(pr.achieved_date)}
        </span>
      </div>

      <div className="my-2 flex items-baseline justify-between gap-3">
        <div>
          <span className={`text-2xl sm:text-3xl font-black font-tabular ${accentColorClass} tracking-tight`}>
            {pr.record_display}
          </span>
          {pr.subtext && (
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-1 font-medium line-clamp-1">
              {pr.subtext}
            </p>
          )}
        </div>
        <div className={`w-7 h-7 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:${accentColorClass} transition-colors shrink-0 shadow-xs`}>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between gap-2 text-[10.5px]">
        <span className="text-[var(--color-text-primary)] font-semibold truncate group-hover:underline">
          {pr.activity_name || "Sesi Rekor Terverifikasi"}
        </span>
        <span className={`text-[var(--color-text-muted)] group-hover:${accentColorClass} transition-colors shrink-0 whitespace-nowrap flex items-center gap-0.5`}>
          <span>Inspect Track</span>
          <span>→</span>
        </span>
      </div>
    </Link>
  );
}
