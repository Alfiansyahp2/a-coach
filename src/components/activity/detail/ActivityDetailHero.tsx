import React from "react";
import { EditActivityModal } from "@/components/EditActivityModal";
import { formatDistance, formatDate } from "@/lib/formatters";
import { Calendar, Clock } from "lucide-react";
import { Activity } from "@/types";

interface ActivityDetailHeroProps {
  activity: Activity;
  isRun: boolean;
  paceStr: string;
  speedKmhStr: string;
}

export function ActivityDetailHero({
  activity,
  isRun,
  paceStr,
  speedKmhStr,
}: ActivityDetailHeroProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
              {activity.name}
            </h1>
            <EditActivityModal activity={activity} variant="button" />
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[var(--color-text-secondary)] font-mono">
            <span className="flex items-center gap-1.5 text-[var(--color-text-primary)]">
              <Calendar className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
              {formatDate(activity.start_date)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              {new Date(activity.start_date).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-[var(--color-border)]">|</span>
            <EditActivityModal activity={activity} variant="inline" />
            {activity.description && (
              <>
                <span>•</span>
                <span className="text-[var(--color-text-secondary)] italic">
                  {activity.description}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick KPI Pill Group */}
        <div className="flex items-center gap-3 bg-[var(--color-surface-card)] border border-[var(--color-border)] px-4 py-2.5 rounded-xl shadow-xs">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono text-[var(--color-text-muted)]">
              Jarak Tempuh
            </div>
            <div className="text-lg font-bold font-mono font-tabular text-[var(--color-text-primary)]">
              {formatDistance(activity.distance_meters)}
            </div>
          </div>
          <div className="h-8 w-px bg-[var(--color-border)]" />
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono text-[var(--color-text-muted)]">
              {isRun ? "Avg Pace" : "Avg Speed"}
            </div>
            <div
              className={`text-lg font-bold font-mono font-tabular ${
                isRun ? "text-[var(--color-running)]" : "text-[var(--color-cycling)]"
              }`}
            >
              {isRun ? paceStr : speedKmhStr}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
