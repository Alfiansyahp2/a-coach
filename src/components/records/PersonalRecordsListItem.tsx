"use client";

import React from "react";
import Link from "next/link";
import { PersonalRecord } from "@/types";
import { formatDate } from "@/lib/formatters";
import {
  Flame,
  Gauge,
  TrendingUp,
  Mountain,
  Compass,
} from "lucide-react";

interface PersonalRecordsListItemProps {
  pr: PersonalRecord;
  isRun: boolean;
}

export function PersonalRecordsListItem({ pr, isRun }: PersonalRecordsListItemProps) {
  const getMetricIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("pace")) return <Gauge className="w-3.5 h-3.5" />;
    if (c.includes("speed")) return <TrendingUp className="w-3.5 h-3.5" />;
    if (c.includes("elev") || c.includes("climb")) return <Mountain className="w-3.5 h-3.5" />;
    if (c.includes("longest") || c.includes("endurance")) return <Compass className="w-3.5 h-3.5" />;
    return <Flame className="w-3.5 h-3.5" />;
  };

  const accentColorClass = isRun ? "text-[var(--color-running)]" : "text-[var(--color-cycling)]";
  const hoverBorderClass = isRun ? "hover:border-[var(--color-running)]/40" : "hover:border-[var(--color-cycling)]/40";

  return (
    <Link
      href={pr.activity_id ? `/activities/${pr.activity_id}` : "#"}
      className={`p-2.5 sm:p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/70 ${hoverBorderClass} hover:bg-[var(--color-surface-muted)] transition-all flex items-center justify-between group shadow-2xs font-mono`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div className={`w-7 h-7 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center shrink-0 ${accentColorClass} shadow-2xs`}>
          {getMetricIcon(pr.category)}
        </div>
        <div className="min-w-0">
          <div className={`text-xs font-bold text-[var(--color-text-primary)] group-hover:${accentColorClass} transition-colors truncate`}>
            {pr.category}
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)] truncate mt-0.5">
            {pr.activity_name ? `${pr.activity_name} • ` : ""}{formatDate(pr.achieved_date)}
          </div>
        </div>
      </div>

      <div className="text-right shrink-0 pl-2">
        <div className={`text-sm font-bold font-tabular ${accentColorClass}`}>
          {pr.record_display}
        </div>
        {pr.subtext && (
          <div className="text-[9.5px] text-[var(--color-text-secondary)] font-tabular">
            {pr.subtext.split("•")[0].trim()}
          </div>
        )}
      </div>
    </Link>
  );
}

