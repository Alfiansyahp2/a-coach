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
  Clock,
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
    <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] overflow-hidden font-mono shadow-xs transition-all">
      {/* 1. Group Section Header */}
      <div
        onClick={() => toggleGroup(groupKey)}
        className="p-3 sm:p-3.5 bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-[var(--color-surface-muted)]/80 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-0.5"
            aria-label="Toggle section"
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4 text-[var(--color-cycling)]" />
            ) : (
              <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
            )}
          </button>

          {/* Group Select All Checkbox */}
          {onSelectGroup && (
            <button
              type="button"
              onClick={handleToggleGroupSelection}
              title={allGroupSelected ? "Batalkan pilihan semua" : "Pilih semua dalam grup ini"}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-cycling)] transition-colors p-0.5 cursor-pointer"
            >
              {allGroupSelected ? (
                <CheckSquare className="w-4 h-4 text-[var(--color-cycling)]" />
              ) : someGroupSelected ? (
                <CheckSquare className="w-4 h-4 text-[var(--color-cycling)]/60" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
          )}

          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase text-[var(--color-text-primary)]">
              {group.title}
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-tabular">
              {group.items.length} Sesi
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-tabular">
          <span className="text-[var(--color-text-primary)] font-bold">
            {formatDistance(group.totalDistance)}
          </span>
          <span className="text-[var(--color-text-muted)]">•</span>
          <span className="text-[var(--color-text-secondary)]">
            {formatDuration(group.totalDuration)}
          </span>
        </div>
      </div>

      {/* 2. Group Activities List */}
      {!isCollapsed && (
        <div className="divide-y divide-[var(--color-border)]">
          {group.items.map((act) => {
            const isSelected = selectedIds.includes(act.id);
            const meta = getSportMeta(act.sport_type);
            const isRun = act.sport_type.toLowerCase().includes("run");

            return (
              <div
                key={act.id}
                className={`p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isSelected
                    ? "bg-[var(--color-cycling)]/10"
                    : "hover:bg-[var(--color-surface-muted)]/50"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  {/* Select Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectOne(act.id);
                    }}
                    className="mt-0.5 sm:mt-0 text-[var(--color-text-muted)] hover:text-[var(--color-cycling)] transition-colors p-0.5"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[var(--color-cycling)]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                    {renderSportIcon(meta.iconName, "w-4 h-4 text-[var(--color-text-primary)]")}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/activities/${act.id}`}
                        className="font-bold text-xs text-[var(--color-text-primary)] hover:text-[var(--color-cycling)] transition-colors truncate"
                      >
                        {act.name}
                      </Link>
                      <span
                        className="text-[9px] px-1.5 py-0.2 rounded-full border font-semibold shrink-0"
                        style={{
                          backgroundColor: `${meta.accentHex}15`,
                          color: meta.accentHex,
                          borderColor: `${meta.accentHex}40`,
                        }}
                      >
                        {act.sport_type}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 text-[10.5px] text-[var(--color-text-muted)] font-tabular">
                      <span>{formatDate(act.start_date)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(act.moving_time_seconds)}</span>
                      </span>
                      {act.elevation_gain_meters > 0 && (
                        <>
                          <span>•</span>
                          <span>▲ {Math.round(act.elevation_gain_meters)}m</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 font-tabular">
                  <div className="text-left sm:text-right">
                    <div className="text-xs font-bold text-[var(--color-text-primary)]">
                      {formatDistance(act.distance_meters)}
                    </div>
                    <div className="text-[10.5px] text-[var(--color-text-secondary)]">
                      {isRun
                        ? speedMpsToPace(act.average_speed_mps)
                        : speedMpsToKmh(act.average_speed_mps)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <EditActivityModal activity={act} variant="icon" />
                    <Link
                      href={`/activities/${act.id}`}
                      className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors"
                      title="Lihat Detail Aktivitas"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
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
