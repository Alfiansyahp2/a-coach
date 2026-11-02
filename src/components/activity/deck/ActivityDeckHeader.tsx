import React from "react";
import { FolderKanban } from "lucide-react";
import { AddActivityModal } from "@/components/AddActivityModal";
import { Activity } from "@/types";

interface ActivityDeckHeaderProps {
  activities: Activity[];
}

export function ActivityDeckHeader({ activities }: ActivityDeckHeaderProps) {
  const runCount = activities.filter((a) =>
    a.sport_type.toLowerCase().includes("run")
  ).length;
  const cyclingCount = activities.filter(
    (a) =>
      a.sport_type.toLowerCase().includes("ride") ||
      a.sport_type.toLowerCase().includes("cycl")
  ).length;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-sm bg-[#12151D] border border-[#1F2430]">
      <div>
        <div className="flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-[#00F0FF]" />
          <h2 className="text-sm uppercase font-mono tracking-wider font-semibold text-[#F0F2F5]">
            Activity Registry & Grouping Management
          </h2>
        </div>
        <p className="text-[11px] text-[#9BA3AF] font-mono pt-1">
          Manajemen pengelompokan aktivitas, kategorisasi sesi, dan kalibrasi telemetri massal.
        </p>
      </div>

      {/* Quick KPI Strip & Add Activity Action */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
        <AddActivityModal variant="button" />
        <div className="px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-center">
          <span className="text-[10px] text-[#5A6272] block uppercase">Total Sesi</span>
          <span className="font-bold font-tabular text-[#F0F2F5] text-sm">
            {activities.length}
          </span>
        </div>
        <div className="px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-center">
          <span className="text-[10px] text-[#D4FF00] block uppercase">Running</span>
          <span className="font-bold font-tabular text-[#D4FF00] text-sm">
            {runCount}
          </span>
        </div>
        <div className="px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-center">
          <span className="text-[10px] text-[#00F0FF] block uppercase">Cycling</span>
          <span className="font-bold font-tabular text-[#00F0FF] text-sm">
            {cyclingCount}
          </span>
        </div>
      </div>
    </div>
  );
}

