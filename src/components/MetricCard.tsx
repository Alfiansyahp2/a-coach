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
}

export function MetricCard({
  label,
  value,
  unit,
  delta,
  accentColor = "default",
  subtext,
}: MetricCardProps) {
  const accentClasses = {
    volt: "text-[#D4FF00] border-l-2 border-l-[#D4FF00]",
    cyan: "text-[#00F0FF] border-l-2 border-l-[#00F0FF]",
    amber: "text-[#FF9500] border-l-2 border-l-[#FF9500]",
    crimson: "text-[#FF2A6D] border-l-2 border-l-[#FF2A6D]",
    default: "text-[#F0F2F5] border-l-2 border-l-transparent",
  };

  const valueColorClasses = {
    volt: "text-[#D4FF00]",
    cyan: "text-[#00F0FF]",
    amber: "text-[#FF9500]",
    crimson: "text-[#FF2A6D]",
    default: "text-[#F0F2F5]",
  };

  return (
    <div
      className={`bg-[#12151D] border border-[#1F2430] hover:border-[#2D3547] rounded-sm p-4 transition-colors duration-150 flex flex-col justify-between ${accentClasses[accentColor]}`}
    >
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] uppercase tracking-wider font-mono text-[#9BA3AF]">
            {label}
          </span>
          {delta && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
                delta.isNeutral
                  ? "bg-[#1C212E] text-[#9BA3AF]"
                  : delta.isPositive
                  ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                  : "bg-[#FF2A6D]/10 text-[#FF2A6D] border border-[#FF2A6D]/20"
              }`}
            >
              {delta.value}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-2xl sm:text-3xl font-bold font-mono font-tabular tracking-tight ${valueColorClasses[accentColor]}`}
          >
            {value}
          </span>
          {unit && (
            <span className="text-xs font-mono text-[#9BA3AF] font-normal">
              {unit}
            </span>
          )}
        </div>
      </div>

      {(subtext || delta?.note) && (
        <div className="mt-2 pt-2 border-t border-[#1F2430]/60 text-[11px] font-mono text-[#5A6272] flex items-center justify-between">
          <span>{subtext || delta?.note}</span>
        </div>
      )}
    </div>
  );
}

