"use client";

import React from "react";
import Link from "next/link";
import { Activity } from "@/types";
import {
  Activity as ActivityIcon,
  ExternalLink,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import { formatDate, formatDuration } from "@/lib/formatters";

interface PostCheckinActivitySelectorProps {
  sortedActivities: Activity[];
  selectedActivityId: string;
  selectedActivity: Activity | undefined;
  handleActivitySelect: (id: string) => void;
}

export function PostCheckinActivitySelector({
  sortedActivities,
  selectedActivityId,
  selectedActivity,
  handleActivitySelect,
}: PostCheckinActivitySelectorProps) {
  if (sortedActivities.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px]">
        <label className="uppercase font-bold text-[var(--color-text-secondary)] flex items-center gap-1.5">
          <ActivityIcon className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          <span>Pilih Aktivitas Terkait</span>
        </label>
        {selectedActivity && (
          <Link
            href={`/activities/${selectedActivity.id}`}
            target="_blank"
            className="text-[var(--color-cycling)] hover:underline font-bold flex items-center gap-1 transition-colors"
          >
            <span>Buka Aktivitas Langsung</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>

      <select
        value={selectedActivityId}
        onChange={(e) => handleActivitySelect(e.target.value)}
        className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)] text-xs font-mono"
      >
        {sortedActivities.map((act, idx) => {
          const dateStr = formatDate(act.start_date);
          const isTop = idx === 0;
          return (
            <option key={act.id} value={act.id}>
              {isTop ? "★ [TERBARU] " : ""}{dateStr ? `[${dateStr}] ` : ""}{act.name} ({act.sport_type} • {(act.distance_meters / 1000).toFixed(1)} km)
            </option>
          );
        })}
      </select>

      {selectedActivity && (
        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                selectedActivity.sport_type === "Ride"
                  ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                  : "bg-[var(--color-running)]/15 text-[var(--color-running)] border-[var(--color-running)]/30"
              }`}>
                {selectedActivity.sport_type}
              </span>
              <span className="font-bold text-xs text-[var(--color-text-primary)] truncate">
                {selectedActivity.name}
              </span>
            </div>
            <div className="text-[10.5px] text-[var(--color-text-secondary)] flex flex-wrap items-center gap-x-3 gap-y-1 font-tabular">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[var(--color-text-muted)]" />
                <span>{formatDate(selectedActivity.start_date)}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[var(--color-text-muted)]" />
                <span>{(selectedActivity.distance_meters / 1000).toFixed(2)} km</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[var(--color-text-muted)]" />
                <span>{formatDuration(selectedActivity.moving_time_seconds)}</span>
              </span>
            </div>
          </div>

          <Link
            href={`/activities/${selectedActivity.id}`}
            target="_blank"
            className="px-3 py-1.5 rounded-md bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-semibold text-[10.5px] flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-xs"
          >
            <span>Detail Aktivitas</span>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          </Link>
        </div>
      )}
    </div>
  );
}

