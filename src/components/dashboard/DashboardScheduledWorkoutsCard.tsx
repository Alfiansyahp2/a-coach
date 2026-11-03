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
    <div className="bg-[#12151D] border border-[#1F2430] rounded-sm p-4 space-y-3">
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1F2430]">
        <div>
          <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-[#F0F2F5] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />
            Scheduled Training Calendar
          </h3>
          {activePlan && (
            <span className="text-[10px] font-mono text-[#00F0FF] block mt-0.5 truncate max-w-[270px]">
              Plan: {activePlan.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded-sm bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[9px] font-mono font-bold">
            ACTIVE
          </span>
          <span className="text-[10px] font-mono text-[#5A6272]">
            {workouts.length} Sesi
          </span>
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="py-8 px-4 text-center border border-dashed border-[#1F2430] rounded-sm space-y-2">
          <div className="w-8 h-8 rounded-sm bg-[#161922] border border-[#1F2430] flex items-center justify-center mx-auto text-[#00F0FF]">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs font-semibold text-[#F0F2F5] font-mono">
            Tidak Ada Jadwal Latihan Aktif
          </div>
          <p className="text-[11px] text-[#5A6272] font-mono max-w-xs mx-auto leading-relaxed">
            Data jadwal dummy telah dibersihkan. Kalender siap untuk penjadwalan
            sesi baru atau sinkronisasi rencana latihan.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {workouts.slice(0, 5).map((wo) => {
            const isCycling = wo.workout_category === "Cycling";
            const isCross =
              wo.workout_category === "Cross Training" ||
              wo.workout_category === "Strength Training";
            return (
              <div
                key={wo.id}
                className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-sm border ${
                        isCycling
                          ? "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30 font-semibold"
                          : isCross
                          ? "bg-[#D4FF00]/10 text-[#D4FF00] border-[#D4FF00]/30 font-semibold"
                          : "bg-[#1C212E] text-[#9BA3AF] border-[#2D3547]"
                      }`}
                    >
                      {wo.workout_category}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase font-semibold ${
                        wo.status === "COMPLETED"
                          ? "text-[#10B981]"
                          : "text-[#00F0FF]"
                      }`}
                    >
                      {wo.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A6272] font-mono">
                    {formatDate(wo.scheduled_date)} •{" "}
                    <span className="text-[#9BA3AF]">
                      {wo.target_intensity || "Standard"}
                    </span>
                  </p>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs font-bold font-tabular text-[#F0F2F5]">
                    {wo.target_distance_meters
                      ? formatDistance(wo.target_distance_meters)
                      : wo.target_duration_seconds
                      ? formatDuration(wo.target_duration_seconds)
                      : "--"}
                  </div>
                  <div className="text-[10px] text-[#5A6272] font-tabular">
                    {wo.target_duration_seconds && wo.target_distance_meters
                      ? formatDuration(wo.target_duration_seconds)
                      : wo.status === "COMPLETED"
                      ? "Verified Strava"
                      : "Prescribed"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

