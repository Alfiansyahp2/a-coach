"use client";

import React from "react";
import { Activity } from "@/types";
import { CheckCircle2, Bike, Footprints, Activity as ActivityIcon } from "lucide-react";
import { formatDistance, formatDuration } from "@/lib/formatters";

interface CalendarActivityItemProps {
  activity: Activity;
  onSelect?: (activity: Activity) => void;
}

export function CalendarActivityItem({
  activity: act,
  onSelect,
}: CalendarActivityItemProps) {
  const sport = (act.sport_type || "").toLowerCase();
  const isRun = sport.includes("run");
  const isCycling = sport.includes("ride") || sport.includes("cycl");

  return (
    <button
      key={act.id}
      type="button"
      onClick={() => onSelect?.(act)}
      className="w-full text-left p-2 rounded-lg border bg-[var(--color-surface-card)] border-[var(--color-cycling)]/40 hover:border-[var(--color-cycling)] hover:-translate-y-0.5 transition-all space-y-1 block shadow-xs group cursor-pointer font-mono"
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
            isRun
              ? "bg-[var(--color-running)]/20 text-[var(--color-running)]"
              : isCycling
              ? "bg-[var(--color-cycling)]/20 text-[var(--color-cycling)]"
              : "bg-[var(--color-alert-amber)]/20 text-[var(--color-alert-amber)]"
          }`}
        >
          {isCycling ? <Bike className="w-2.5 h-2.5 shrink-0" /> : isRun ? <Footprints className="w-2.5 h-2.5 shrink-0" /> : <ActivityIcon className="w-2.5 h-2.5 shrink-0" />}
          <span>{isRun ? "LARI" : isCycling ? "RIDE" : act.sport_type}</span>
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[7.5px] font-bold text-[var(--color-cycling)] bg-[var(--color-cycling)]/15 px-1 py-0.2 rounded border border-[var(--color-cycling)]/30">
            TERCATAT
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-cycling)] shrink-0" />
        </div>
      </div>

      <div className="font-bold text-[10.5px] text-[var(--color-text-primary)] leading-tight font-tabular">
        {formatDistance(act.distance_meters)} • {formatDuration(act.moving_time_seconds)}
      </div>

      <div
        className="text-[8px] text-[var(--color-text-secondary)] truncate group-hover:text-[var(--color-text-primary)]"
        title={act.name}
      >
        {act.name}
      </div>

      {act.average_heartrate ? (
        <div className="text-[7.5px] text-[var(--color-text-muted)] font-tabular flex items-center gap-1">
          <span>Avg HR:</span>
          <strong className="text-[var(--color-text-primary)] font-semibold">{Math.round(act.average_heartrate)} bpm</strong>
        </div>
      ) : null}
    </button>
  );
}

