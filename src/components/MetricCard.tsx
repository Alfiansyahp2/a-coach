import React from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
    note?: string;
  };
  accentColor?: "volt" | "cyan" | "amber" | "crimson" | "default";
  subtext?: string;
  targetProgress?: {
    current: number;
    target: number;
    label?: string;
  };
}

export function MetricCard({
  label,
  value,
  unit,
  delta,
  accentColor = "default",
  subtext,
  targetProgress,
}: MetricCardProps) {
  const accentBorderClasses = {
    volt: "border-l-2 border-l-[#D4FF00] hover:border-[#D4FF00]/40",
    cyan: "border-l-2 border-l-[#00F0FF] hover:border-[#00F0FF]/40",
    amber: "border-l-2 border-l-[#FF9500] hover:border-[#FF9500]/40",
    crimson: "border-l-2 border-l-[#FF2A6D] hover:border-[#FF2A6D]/40",
    default: "border-l-2 border-l-transparent hover:border-[#2D3547]",
  };

  const valueColorClasses = {
    volt: "text-[#D4FF00]",
    cyan: "text-[#00F0FF]",
    amber: "text-[#FF9500]",
    crimson: "text-[#FF2A6D]",
    default: "text-[#F0F2F5]",
  };

  const progressPct = targetProgress
    ? Math.min(100, Math.round((targetProgress.current / Math.max(1, targetProgress.target)) * 100))
    : null;

  return (
    <div
      className={`bg-[#12151D] border border-[#1F2430] rounded-sm p-4 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md ${accentBorderClasses[accentColor]}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10.5px] uppercase tracking-wider font-mono text-[#9BA3AF] truncate">
            {label}
          </span>
          {delta && (
            <span
              className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded-xs shrink-0 font-bold ${
                delta.isNeutral
                  ? "bg-[#1C212E] text-[#9BA3AF]"
                  : delta.isPositive
                  ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                  : "bg-[#FF2A6D]/15 text-[#FF2A6D] border border-[#FF2A6D]/30"
              }`}
            >
              {delta.value}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-2xl sm:text-3xl font-black font-mono font-tabular tracking-tight ${valueColorClasses[accentColor]}`}
          >
            {value}
          </span>
          {unit && (
            <span className="text-xs font-mono text-[#9BA3AF] font-medium">
              {unit}
            </span>
          )}
        </div>

        {/* Optional Target Progress Bar */}
        {targetProgress && progressPct !== null && (
          <div className="mt-2 space-y-1">
            <div className="w-full h-1 bg-[#090A0F] rounded-none overflow-hidden border border-[#1F2430]">
              <div
                className={`h-full transition-all duration-300 ${
                  accentColor === "volt"
                    ? "bg-[#D4FF00]"
                    : accentColor === "cyan"
                    ? "bg-[#00F0FF]"
                    : "bg-[#10B981]"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[9.5px] font-mono text-[#5A6272]">
              <span>Progres Target</span>
              <span className="font-tabular font-bold text-[#9BA3AF]">{progressPct}%</span>
            </div>
          </div>
        )}
      </div>

      {(subtext || delta?.note) && (
        <div className="mt-2 pt-2 border-t border-[#1F2430]/70 text-[10.5px] font-mono text-[#5A6272] flex items-center justify-between">
          <span className="truncate">{subtext || delta?.note}</span>
        </div>
      )}
    </div>
  );
}
