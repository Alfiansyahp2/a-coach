import React from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckSquare,
  Square,
  Heart,
} from "lucide-react";
import {
  formatDistance,
  formatDuration,
  formatDate,
  speedMpsToPace,
  speedMpsToKmh,
} from "@/lib/formatters";
import { EditActivityModal } from "@/components/EditActivityModal";
import { ActivityGroup } from "./activityGroupUtils";

interface ActivityGroupCardProps {
  groupKey: string;
  group: ActivityGroup;
  isCollapsed: boolean;
  toggleGroup: (k: string) => void;
  selectedIds: string[];
  toggleSelectOne: (id: string) => void;
}

export function ActivityGroupCard({
  groupKey,
  group,
  isCollapsed,
  toggleGroup,
  selectedIds,
  toggleSelectOne,
}: ActivityGroupCardProps) {
  const isRunGroup = groupKey.toLowerCase().includes("run");

  return (
    <div className="bg-[#12151D] border border-[#1F2430] rounded-sm overflow-hidden">
      {/* Group Section Header */}
      <div
        onClick={() => toggleGroup(groupKey)}
        className="p-3.5 bg-[#161922] border-b border-[#1F2430] flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-[#1A1E28] transition-colors"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-[#9BA3AF] hover:text-white transition-colors"
            aria-label="Toggle section"
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm font-bold ${
                group.badgeColor === "volt"
                  ? "bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/40"
                  : group.badgeColor === "cyan"
                  ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40"
                  : "bg-[#FF9500]/15 text-[#FF9500] border border-[#FF9500]/40"
              }`}
            >
              {group.items.length} Sesi
            </span>
            <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-[#F0F2F5]">
              {group.title}
            </h3>
          </div>
        </div>

        {/* Group Subtotals Strip */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-[10px] text-[#5A6272] uppercase block">
              Jarak
            </span>
            <span className="font-bold font-tabular text-[#F0F2F5]">
              {formatDistance(group.totalDistance)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#5A6272] uppercase block">
              Durasi
            </span>
            <span className="font-tabular text-[#9BA3AF]">
              {formatDuration(group.totalDuration)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#5A6272] uppercase block">
              Elevasi
            </span>
            <span className="font-tabular text-[#FF9500]">
              ▲ {Math.round(group.totalElevation)}m
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#5A6272] uppercase block">
              Avg Kecepatan
            </span>
            <span
              className={`font-semibold font-tabular ${
                isRunGroup ? "text-[#D4FF00]" : "text-[#00F0FF]"
              }`}
            >
              {group.avgPaceOrSpeed}
            </span>
          </div>
        </div>
      </div>

      {/* Group Items List */}
      {!isCollapsed && (
        <div className="divide-y divide-[#1F2430]">
          {group.items.map((act) => {
            const isRun = act.sport_type.toLowerCase().includes("run");
            const velocity = isRun
              ? speedMpsToPace(act.average_speed_mps)
              : speedMpsToKmh(act.average_speed_mps);
            const isSelected = selectedIds.includes(act.id);

            return (
              <div
                key={act.id}
                className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                  isSelected ? "bg-[#1C212E]/70" : "hover:bg-[#161922]/50"
                }`}
              >
                {/* Left: Checkbox + Thumbnail + Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => toggleSelectOne(act.id)}
                    className="text-[#5A6272] hover:text-[#00F0FF] transition-colors shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#00F0FF]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  {act.raw_summary_polyline && (
                    <div className="w-10 h-10 rounded-sm bg-[#090A0F] border border-[#1F2430] flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                      <img
                        src={act.raw_summary_polyline}
                        alt="GPS Route"
                        className="w-full h-full object-contain filter brightness-110"
                      />
                    </div>
                  )}

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-sm font-semibold tracking-wider ${
                          isRun
                            ? "bg-[#D4FF00]/10 text-[#D4FF00] border border-[#D4FF00]/30"
                            : "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30"
                        }`}
                      >
                        {act.sport_type}
                      </span>
                      <Link
                        href={`/activities/${act.id}`}
                        className="text-xs font-semibold text-[#F0F2F5] hover:text-[#00F0FF] transition-colors truncate"
                      >
                        {act.name}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#9BA3AF] font-mono">
                      <span>{formatDate(act.start_date)}</span>
                      <span className="text-[#3A404D]">•</span>
                      <span>{formatDuration(act.moving_time_seconds)}</span>
                      {act.average_heartrate && (
                        <>
                          <span className="text-[#3A404D]">•</span>
                          <span className="flex items-center gap-1 text-[#FF2A6D]">
                            <Heart className="w-3 h-3 fill-current" />
                            <span className="font-tabular">
                              {Math.round(act.average_heartrate)} bpm
                            </span>
                          </span>
                        </>
                      )}
                      {act.description && (
                        <>
                          <span className="text-[#3A404D]">•</span>
                          <span className="text-[#5A6272] truncate max-w-xs">
                            {act.description}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Metrics + Edit Modal Trigger + Link */}
                <div className="flex items-center gap-4 shrink-0 font-mono">
                  <div className="text-right">
                    <div className="text-xs font-bold font-tabular text-[#F0F2F5]">
                      {formatDistance(act.distance_meters)}
                    </div>
                    <div
                      className={`text-[11px] font-semibold font-tabular ${
                        isRun ? "text-[#D4FF00]" : "text-[#00F0FF]"
                      }`}
                    >
                      {velocity}
                    </div>
                  </div>

                  {/* Direct Edit Modal */}
                  <EditActivityModal activity={act} variant="icon" />

                  {/* Direct Link to Activity Detail */}
                  <Link
                    href={`/activities/${act.id}`}
                    title="Lihat Detail Telemetri Lengkap"
                    className="w-6 h-6 rounded-sm bg-[#090A0F] border border-[#1F2430] hover:border-[#00F0FF] hover:text-[#00F0FF] text-[#5A6272] flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

