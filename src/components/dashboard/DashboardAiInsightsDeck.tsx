import React from "react";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { TrainingInsight } from "@/types";

interface DashboardAiInsightsDeckProps {
  insights: TrainingInsight[];
}

export function DashboardAiInsightsDeck({
  insights,
}: DashboardAiInsightsDeckProps) {
  if (insights.length === 0) return null;

  return (
    <section className="bg-[#12151D] border border-[#1F2430] rounded-sm p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#1F2430]">
        <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-wider font-semibold text-[#F0F2F5]">
          <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
          Grounded AI Coach Analytical Dossier
        </div>
        <span className="text-[10px] font-mono text-[#5A6272]">
          Scientific Overload & Variance Engine
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className={`p-3 rounded-sm bg-[#161922] border flex flex-col justify-between ${
              ins.severity === "warning"
                ? "border-[#FF2A6D]/40"
                : ins.severity === "positive"
                ? "border-[#10B981]/40"
                : "border-[#1F2430]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-xs font-semibold text-[#F0F2F5] font-mono flex items-center gap-1.5">
                  {ins.severity === "warning" ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-[#FF2A6D]" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                  )}
                  <span>{ins.title}</span>
                </h4>
                <span
                  className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-sm ${
                    ins.severity === "warning"
                      ? "bg-[#FF2A6D]/10 text-[#FF2A6D] border border-[#FF2A6D]/30"
                      : "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30"
                  }`}
                >
                  {ins.severity}
                </span>
              </div>

              <p className="text-xs text-[#9BA3AF] leading-relaxed pt-1">
                {ins.description}
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#1F2430]/60 text-[10px] font-mono text-[#5A6272] flex items-center justify-between">
              <span>Grounded Telemetry Analysis</span>
              <span>Evaluated at {formatDate(ins.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

