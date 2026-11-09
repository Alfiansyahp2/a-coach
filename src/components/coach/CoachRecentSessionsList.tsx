import React from "react";
import Link from "next/link";
import { Activity } from "@/types";
import { Activity as ActivityIcon } from "lucide-react";
import { formatDistance, formatDuration, formatDate } from "@/lib/formatters";

interface CoachRecentSessionsListProps {
  activities: Activity[];
  sportTone: "running" | "cycling";
  title: string;
  subtitle: string;
  speedMetricLabel: string;
  renderSpeedValue: (act: Activity) => string;
  headerSummaryNodes: React.ReactNode;
  emptyText: string;
  maxSessions?: number;
}

export function CoachRecentSessionsList({
  activities,
  sportTone,
  title,
  subtitle,
  speedMetricLabel,
  renderSpeedValue,
  headerSummaryNodes,
  emptyText,
  maxSessions = 10,
}: CoachRecentSessionsListProps) {
  const hoverBorderClass =
    sportTone === "running"
      ? "hover:border-[var(--color-running)] group-hover:text-[var(--color-running)] text-[var(--color-running)]"
      : "hover:border-[var(--color-cycling)] group-hover:text-[var(--color-cycling)] text-[var(--color-cycling)]";

  const iconTextClass =
    sportTone === "running" ? "text-[var(--color-running)]" : "text-[var(--color-cycling)]";

  const displayList = activities.slice(0, maxSessions);

  return (
    <div className="p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center ${iconTextClass}`}>
            <ActivityIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              {title}
            </h3>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              {subtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-tabular">
          {headerSummaryNodes}
        </div>
      </div>

      {/* Sessions Grid */}
      {activities.length === 0 ? (
        <div className="py-12 text-center text-xs text-[var(--color-text-muted)]">
          {emptyText}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayList.map((act) => (
            <Link
              key={act.id}
              href={`/activities/${act.id}`}
              className="p-3.5 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all space-y-2 block group shadow-xs"
            >
              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold text-[var(--color-text-primary)] transition-colors truncate ${sportTone === "running" ? "group-hover:text-[var(--color-running)]" : "group-hover:text-[var(--color-cycling)]"}`}>
                  {act.name}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-tabular shrink-0">
                  {formatDate(act.start_date)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-tabular pt-1">
                <div className="p-1.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)]">
                  <span className="text-[8.5px] text-[var(--color-text-muted)] block">Jarak</span>
                  <span className="font-bold text-[var(--color-text-primary)]">
                    {formatDistance(act.distance_meters)}
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)]">
                  <span className="text-[8.5px] text-[var(--color-text-muted)] block">{speedMetricLabel}</span>
                  <span className={`font-bold ${sportTone === "running" ? "text-[var(--color-running)]" : "text-[var(--color-cycling)]"}`}>
                    {renderSpeedValue(act)}
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)]">
                  <span className="text-[8.5px] text-[var(--color-text-muted)] block">Durasi</span>
                  <span className="font-bold text-[var(--color-text-primary)]">
                    {formatDuration(act.moving_time_seconds)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

