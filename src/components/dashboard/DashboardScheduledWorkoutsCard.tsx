import React from "react";
import { Calendar } from "lucide-react";
import { formatDistance, formatDuration, formatDate } from "@/lib/formatters";
import { ScheduledWorkout, TrainingPlan } from "@/types";

interface DashboardScheduledWorkoutsCardProps {
  workouts: ScheduledWorkout[];
  activePlan: TrainingPlan | null;
}

export function DashboardScheduledWorkoutsCard({
  workouts,
  activePlan,
}: DashboardScheduledWorkoutsCardProps) {
  return (
    <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 sm:p-5 space-y-3.5 shadow-xs font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <div>
          <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--color-cycling)]" />
            <span>Scheduled Training Calendar</span>
          </h3>
          {activePlan && (
            <span className="text-[10.5px] font-mono text-[var(--color-cycling)] block mt-0.5 truncate max-w-[270px] font-medium">
              Plan: {activePlan.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 text-[9.5px] font-mono font-bold tracking-wider">
            AKTIF
          </span>
          <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
            {workouts.length} Sesi
          </span>
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="py-8 px-4 text-center border border-dashed border-[var(--color-border)] rounded-xl space-y-2.5 bg-[var(--color-surface-muted)]/30">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center mx-auto text-[var(--color-text-muted)]">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-[var(--color-text-primary)] font-mono">
            Tidak Ada Jadwal Latihan Aktif
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] font-mono max-w-xs mx-auto leading-relaxed">
            Data jadwal siap untuk penjadwalan sesi baru atau sinkronisasi rencana latihan.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {workouts.slice(0, 5).map((wo) => {
            const isCycling = wo.workout_category === "Cycling";
            const isCross =
              wo.workout_category === "Cross Training" ||
              wo.workout_category === "Strength Training";
            return (
              <div
                key={wo.id}
                className="p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/60 hover:border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-all duration-200 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9.5px] uppercase font-mono px-2 py-0.5 rounded-md border font-bold ${
                        isCycling
                          ? "bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                          : isCross
                          ? "bg-[var(--color-endurance)]/10 text-[var(--color-endurance)] border-[var(--color-endurance)]/30"
                          : "bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                      }`}
                    >
                      {wo.workout_category}
                    </span>
                    <span
                      className={`text-[9.5px] font-mono uppercase font-bold ${
                        wo.status === "COMPLETED"
                          ? "text-[var(--color-cycling)]"
                          : "text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {wo.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[var(--color-text-primary)]">
                    {wo.description || `${wo.workout_category} Session`}
                  </h4>
                  <div className="text-[10px] font-mono text-[var(--color-text-muted)] flex items-center gap-2">
                    <span>{formatDate(wo.scheduled_date)}</span>
                    {wo.target_intensity && (
                      <>
                        <span>•</span>
                        <span className="text-[var(--color-cycling)]">{wo.target_intensity}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  {wo.target_distance_meters && (
                    <div className="font-bold font-tabular text-[var(--color-text-primary)]">
                      {formatDistance(wo.target_distance_meters)}
                    </div>
                  )}
                  {wo.target_duration_seconds && (
                    <div className="text-[10px] font-tabular text-[var(--color-text-muted)]">
                      {formatDuration(wo.target_duration_seconds)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
