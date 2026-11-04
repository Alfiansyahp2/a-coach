import React from "react";
import { formatDistance, formatDuration, formatDate } from "@/lib/formatters";
import { ScheduledWorkout } from "@/types";

interface TrainingWorkoutListViewProps {
  filteredWorkouts: ScheduledWorkout[];
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  isRunningCategory: (category: string) => boolean;
}

export function TrainingWorkoutListView({
  filteredWorkouts,
  onSelectWorkout,
  isRunningCategory,
}: TrainingWorkoutListViewProps) {
  return (
    <div className="space-y-3 font-mono">
      {filteredWorkouts.map((wo) => {
        const isRun = isRunningCategory(wo.workout_category);
        const isCycling = wo.workout_category === "Cycling";
        const isCross =
          wo.workout_category === "Cross Training" || wo.workout_category === "Strength Training";
        const isCompleted = wo.status === "COMPLETED";

        return (
          <div
            key={wo.id}
            onClick={() => onSelectWorkout(wo)}
            className={`p-4 rounded-xl bg-[var(--color-surface-card)] border cursor-pointer transition-all ${
              isCompleted
                ? "border-[var(--color-cycling)]/40 hover:border-[var(--color-cycling)]"
                : isRun
                ? "border-[var(--color-running)]/40 hover:border-[var(--color-running)]"
                : isCycling
                ? "border-[var(--color-cycling)]/30 hover:border-[var(--color-cycling)]"
                : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isRun
                      ? "bg-[var(--color-running)]/10 text-[var(--color-running)] border-[var(--color-running)]/30"
                      : isCycling
                      ? "bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                      : isCross
                      ? "bg-[var(--color-alert-amber)]/10 text-[var(--color-alert-amber)] border-[var(--color-alert-amber)]/30"
                      : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                  }`}
                >
                  {wo.workout_category}
                </span>

                <span className="text-xs font-bold text-[var(--color-text-primary)]">
                  {formatDate(wo.scheduled_date)}
                </span>

                <span className="text-[10px] text-[var(--color-text-muted)]">
                  • {wo.target_intensity || "Zone 2 • RPE 3–4"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isCompleted
                      ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                      : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                  }`}
                >
                  {isCompleted ? "VERIFIED COMPLETED" : "PLANNED"}
                </span>

                <div className="text-right">
                  <span className="text-sm font-bold font-tabular text-[var(--color-text-primary)]">
                    {wo.target_duration_seconds
                      ? formatDuration(wo.target_duration_seconds)
                      : wo.target_distance_meters
                      ? formatDistance(wo.target_distance_meters)
                      : "--"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2.5 text-xs text-[var(--color-text-secondary)] space-y-1">
              <p className="leading-relaxed">{wo.description}</p>
              {wo.target_duration_seconds && wo.target_distance_meters && (
                <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-muted)] pt-1 font-tabular">
                  <span>
                    Target Durasi:{" "}
                    <strong className="text-[var(--color-text-primary)]">
                      {formatDuration(wo.target_duration_seconds)}
                    </strong>
                  </span>
                  <span>
                    Target Jarak Estimasi:{" "}
                    <strong className="text-[var(--color-text-primary)]">
                      {formatDistance(wo.target_distance_meters)}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

