import React from "react";
import { Target } from "lucide-react";
import { FitnessGoal } from "@/types";

interface DashboardMacroGoalsCardProps {
  goals: FitnessGoal[];
}

export function DashboardMacroGoalsCard({
  goals,
}: DashboardMacroGoalsCardProps) {
  if (goals.length === 0) return null;

  return (
    <div className="bg-[#12151D] border border-[#1F2430] rounded-sm p-4 space-y-3">
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1F2430]">
        <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-[#F0F2F5] flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-[#00F0FF]" />
          Active Target Objectives (Macro Milestones)
        </h3>
        <span className="text-[10px] font-mono text-[#5A6272]">
          {goals.length} Sasaran Terkalibrasi
        </span>
      </div>

      <div className="space-y-2.5">
        {goals.map((g) => {
          const currentNum = Number(g.current_value);
          const targetNum = Number(g.target_value);
          const pct = Math.min(100, Math.round((currentNum / targetNum) * 100));
          const isMeters = g.goal_type === "DISTANCE_MONTHLY";
          const isKm = g.unit === "km" || isMeters;

          const currentDisplay = isMeters
            ? `${(currentNum / 1000).toFixed(1)} km`
            : isKm
            ? `${currentNum.toFixed(1)} km`
            : `${currentNum} ${g.unit || "sessions"}`;

          const targetDisplay = isMeters
            ? `${(targetNum / 1000).toFixed(0)} km`
            : isKm
            ? `${targetNum.toFixed(1)} km`
            : `${targetNum} ${g.unit || "sessions"}`;

          const is100k = g.title.toLowerCase().includes("100");
          const isMarathon = g.title.toLowerCase().includes("marathon");

          return (
            <div
              key={g.id}
              className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#F0F2F5] font-medium flex items-center gap-1.5">
                  {is100k && (
                    <span className="w-2 h-2 rounded-none bg-[#00F0FF]" />
                  )}
                  {isMarathon && (
                    <span className="w-2 h-2 rounded-none bg-[#FF2A6D]" />
                  )}
                  {!is100k && !isMarathon && (
                    <span className="w-2 h-2 rounded-none bg-[#10B981]" />
                  )}
                  <span>{g.title}</span>
                </span>
                <span
                  className={`font-tabular font-bold ${
                    is100k
                      ? "text-[#00F0FF]"
                      : isMarathon
                      ? "text-[#FF9500]"
                      : "text-[#10B981]"
                  }`}
                >
                  {pct}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-[#090A0F] rounded-none overflow-hidden border border-[#1F2430]">
                <div
                  className={`h-full transition-all duration-300 ${
                    is100k
                      ? "bg-[#00F0FF]"
                      : isMarathon
                      ? "bg-[#FF9500]"
                      : "bg-[#10B981]"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#5A6272]">
                <span>
                  Tercapai:{" "}
                  <strong className="text-[#9BA3AF]">{currentDisplay}</strong>
                </span>
                <span>
                  Target:{" "}
                  <strong className="text-[#F0F2F5]">{targetDisplay}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

