"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckSquare,
  Square,
  Heart,
  Bike,
  Footprints,
  Waves,
  Dumbbell,
  Compass,
  Activity as ActivityIcon,
  TrendingUp,
  Clock,
  Sparkles,
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
import { Activity } from "@/types";
import { getSportMeta } from "@/lib/sportUtils";

interface ActivityGroupCardProps {
  groupKey: string;
  group: ActivityGroup;
  isCollapsed: boolean;
  toggleGroup: (k: string) => void;
  selectedIds: string[];
  toggleSelectOne: (id: string) => void;
  onSelectGroup?: (items: Activity[]) => void;
  density?: "detailed" | "compact";
}

export function ActivityGroupCard({
  groupKey,
  group,
  isCollapsed,
  toggleGroup,
  selectedIds,
  toggleSelectOne,
  onSelectGroup,
  density = "detailed",
}: ActivityGroupCardProps) {
  const isRunGroup = groupKey.toLowerCase().includes("run");
  const groupItemIds = group.items.map((i) => i.id);
  const allGroupSelected =
    groupItemIds.length > 0 &&
    groupItemIds.every((id) => selectedIds.includes(id));
  const someGroupSelected =
    !allGroupSelected && groupItemIds.some((id) => selectedIds.includes(id));

  const handleToggleGroupSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectGroup) {
      onSelectGroup(group.items);
    }
  };

  const renderSportIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case "bike":
        return <Bike className={className} />;
      case "footprints":
        return <Footprints className={className} />;
      case "waves":
        return <Waves className={className} />;
      case "dumbbell":
        return <Dumbbell className={className} />;
      case "compass":
        return <Compass className={className} />;
      default:
        return <ActivityIcon className={className} />;
    }
  };

  return (
    <div className="bg-[#12151D] border border-[#1F2430] rounded-sm overflow-hidden font-mono shadow-sm transition-all">
      {/* 1. Group Section Header */}
      <div
        onClick={() => toggleGroup(groupKey)}
        className="p-3 sm:p-3.5 bg-gradient-to-r from-[#161922] via-[#1A1F2C] to-[#161922] border-b border-[#1F2430] flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-[#1C212E] transition-colors select-none"
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            className="text-[#9BA3AF] hover:text-white transition-colors p-0.5"
            aria-label="Toggle section"
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4 text-[#00F0FF]" />
            ) : (
              <ChevronUp className="w-4 h-4 text-[#9BA3AF]" />
            )}
          </button>

          {/* Group Select All Checkbox */}
          {onSelectGroup && (
            <button
              type="button"
              onClick={handleToggleGroupSelection}
              title={allGroupSelected ? "Batalkan pilihan semua" : "Pilih semua dalam grup ini"}
              className="text-[#5A6272] hover:text-[#00F0FF] transition-colors p-0.5 cursor-pointer"
            >
              {allGroupSelected ? (
                <CheckSquare className="w-4 h-4 text-[#00F0FF]" />
              ) : someGroupSelected ? (
                <CheckSquare className="w-4 h-4 text-[#00F0FF]/60" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
          )}

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] uppercase px-2 py-0.5 rounded-xs font-bold ${
                group.badgeColor === "volt"
                  ? "bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/40"
                  : group.badgeColor === "cyan"
                  ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40"
                  : "bg-[#FF9500]/15 text-[#FF9500] border border-[#FF9500]/40"
              }`}
            >
              {group.items.length} Sesi
            </span>
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#F0F2F5]">
              {group.title}
            </h3>
          </div>
        </div>

        {/* Group Subtotals Strip */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs">
          <div>
            <span className="text-[9.5px] text-[#5A6272] uppercase block">
              Total Jarak
            </span>
            <span className="font-bold font-tabular text-[#F0F2F5]">
              {formatDistance(group.totalDistance)}
            </span>
          </div>

          <div>
            <span className="text-[9.5px] text-[#5A6272] uppercase block">
              Total Durasi
            </span>
            <span className="font-tabular text-[#9BA3AF]">
              {formatDuration(group.totalDuration)}
            </span>
          </div>

          <div>
            <span className="text-[9.5px] text-[#5A6272] uppercase block">
              Elevasi
            </span>
            <span className="font-tabular text-[#FF9500] font-semibold">
              ▲ {Math.round(group.totalElevation)}m
            </span>
          </div>

          <div>
            <span className="text-[9.5px] text-[#5A6272] uppercase block">
              Avg Kecepatan
            </span>
            <span
              className={`font-bold font-tabular ${
                isRunGroup ? "text-[#D4FF00]" : "text-[#00F0FF]"
              }`}
            >
              {group.avgPaceOrSpeed}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Group Items List */}
      {!isCollapsed && (
        <div className="divide-y divide-[#1F2430]">
          {group.items.map((act) => {
            const meta = getSportMeta(act.sport_type);
            const velocity = meta.isPaceFormat
              ? speedMpsToPace(act.average_speed_mps)
              : speedMpsToKmh(act.average_speed_mps);
            const isSelected = selectedIds.includes(act.id);
            const isOcr =
              act.description &&
              (act.description.includes("OCR") ||
                act.description.includes("IMG_") ||
                act.description.includes("Ground-truth"));

            const hasValidImage =
              act.raw_summary_polyline &&
              (act.raw_summary_polyline.startsWith("http") ||
                act.raw_summary_polyline.startsWith("data:image"));

            // COMPACT ROW DENSITY MODE
            if (density === "compact") {
              return (
                <div
                  key={act.id}
                  className={`px-3 py-2 flex items-center justify-between gap-3 transition-colors ${
                    isSelected ? "bg-[#1C212E]/70" : "hover:bg-[#161922]/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSelectOne(act.id)}
                      className="text-[#5A6272] hover:text-[#00F0FF] transition-colors shrink-0 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#00F0FF]" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="shrink-0" style={{ color: meta.accentHex }}>
                      {renderSportIcon(meta.iconName, "w-3.5 h-3.5")}
                    </div>

                    <Link
                      href={`/activities/${act.id}`}
                      className="text-xs font-semibold text-[#F0F2F5] hover:text-[#00F0FF] transition-colors truncate max-w-sm sm:max-w-md"
                    >
                      {act.name}
                    </Link>

                    <span className="text-[10px] text-[#5A6272] shrink-0">
                      {formatDate(act.start_date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    <span className="text-[#9BA3AF] font-tabular">
                      {formatDuration(act.moving_time_seconds)}
                    </span>
                    <span className="font-bold font-tabular text-[#F0F2F5]">
                      {formatDistance(act.distance_meters)}
                    </span>
                    <span
                      className="font-semibold font-tabular text-[11px] w-16 text-right"
                      style={{ color: meta.accentHex }}
                    >
                      {velocity}
                    </span>
                    <EditActivityModal activity={act} variant="icon" />
                    <Link
                      href={`/activities/${act.id}`}
                      className="w-5 h-5 rounded-xs bg-[#090A0F] border border-[#1F2430] hover:border-[#00F0FF] text-[#5A6272] hover:text-[#00F0FF] flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            }

            // DETAILED ROW DENSITY MODE (DEFAULT)
            return (
              <div
                key={act.id}
                className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-colors ${
                  isSelected ? "bg-[#1C212E]/70" : "hover:bg-[#161922]/60"
                }`}
              >
                {/* Left: Checkbox + Sport Icon Badge + Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleSelectOne(act.id)}
                    className="text-[#5A6272] hover:text-[#00F0FF] transition-colors shrink-0 cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#00F0FF]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  {/* Sport Visual Telemetry Badge (Dynamic & themed) */}
                  {hasValidImage ? (
                    <div className="w-10 h-10 rounded-sm bg-[#090A0F] border border-[#1F2430] flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                      <img
                        src={act.raw_summary_polyline!}
                        alt="GPS Route"
                        className="w-full h-full object-contain filter brightness-110"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-10 h-10 rounded-sm border flex items-center justify-center shrink-0 shadow-xs"
                      style={{
                        backgroundColor: `${meta.accentHex}12`,
                        borderColor: `${meta.accentHex}40`,
                        color: meta.accentHex,
                      }}
                    >
                      {renderSportIcon(meta.iconName, "w-5 h-5")}
                    </div>
                  )}

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-[9px] uppercase px-1.5 py-0.2 rounded-xs font-bold tracking-wider border"
                        style={{
                          backgroundColor: `${meta.accentHex}15`,
                          color: meta.accentHex,
                          borderColor: `${meta.accentHex}30`,
                        }}
                      >
                        {act.sport_type}
                      </span>
                      <Link
                        href={`/activities/${act.id}`}
                        className="text-xs font-bold text-[#F0F2F5] hover:text-[#00F0FF] transition-colors truncate"
                      >
                        {act.name}
                      </Link>

                      {isOcr && (
                        <span className="text-[8.5px] px-1.5 py-0.2 rounded-xs bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-semibold flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Strava OCR Terverifikasi</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#9BA3AF]">
                      <span>{formatDate(act.start_date)}</span>
                      <span className="text-[#3A404D]">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#5A6272]" />
                        <span>{formatDuration(act.moving_time_seconds)}</span>
                      </span>

                      {act.elevation_gain_meters && Number(act.elevation_gain_meters) > 0 ? (
                        <>
                          <span className="text-[#3A404D]">•</span>
                          <span className="text-[#FF9500] font-tabular flex items-center gap-0.5">
                            ▲ {Math.round(act.elevation_gain_meters)}m
                          </span>
                        </>
                      ) : null}

                      {act.average_heartrate ? (
                        <>
                          <span className="text-[#3A404D]">•</span>
                          <span className="flex items-center gap-1 text-[#FF2A6D]">
                            <Heart className="w-3 h-3 fill-current animate-pulse" />
                            <span className="font-tabular font-semibold">
                              {Math.round(act.average_heartrate)} bpm
                            </span>
                          </span>
                        </>
                      ) : null}

                      {act.description && !isOcr ? (
                        <>
                          <span className="text-[#3A404D]">•</span>
                          <span className="text-[#5A6272] truncate max-w-xs italic">
                            "{act.description}"
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Right: Metrics + Edit Modal Trigger + Link */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-bold font-tabular text-[#F0F2F5]">
                      {formatDistance(act.distance_meters)}
                    </div>
                    <div
                      className="text-[11px] font-semibold font-tabular"
                      style={{ color: meta.accentHex }}
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
