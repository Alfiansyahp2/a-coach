"use client";

import React from "react";
import {
  Layers,
  SlidersHorizontal,
  Search,
  X,
  ChevronsDown,
  ChevronsUp,
  LayoutList,
  AlignJustify,
  Bike,
  Footprints,
  Waves,
  Dumbbell,
  Compass,
  Activity as ActivityIcon,
} from "lucide-react";
import { GroupByOption } from "./activityGroupUtils";
import { getSportMeta } from "@/lib/sportUtils";

interface ActivityFilterToolbarProps {
  groupBy: GroupByOption;
  setGroupBy: (v: GroupByOption) => void;
  sortBy: "date_desc" | "date_asc" | "dist_desc" | "dist_asc";
  setSortBy: (v: "date_desc" | "date_asc" | "dist_desc" | "dist_asc") => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  sportFilter: string;
  setSportFilter: (v: string) => void;
  density?: "detailed" | "compact";
  setDensity?: (v: "detailed" | "compact") => void;
  isAllCollapsed?: boolean;
  onToggleAllCollapsed?: () => void;
  availableSports?: { id: string; name: string; count: number }[];
  totalCount?: number;
}

export function ActivityFilterToolbar({
  groupBy,
  setGroupBy,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  sportFilter,
  setSportFilter,
  density = "detailed",
  setDensity,
  isAllCollapsed = false,
  onToggleAllCollapsed,
  availableSports = [],
  totalCount = 34,
}: ActivityFilterToolbarProps) {
  const renderSportIcon = (iconName: string, className = "w-3 h-3") => {
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
    <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-3.5 font-mono shadow-xs">
      {/* Row 1: Grouping Tabs, Density Toggle & Collapse All */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        {/* Group By Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[var(--color-text-secondary)] flex items-center gap-1 font-bold">
            <Layers className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Kelompokkan:</span>
          </span>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setGroupBy("sport")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                groupBy === "sport"
                  ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Cabang Olahraga
            </button>
            <button
              type="button"
              onClick={() => setGroupBy("category")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                groupBy === "category"
                  ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Kategori Jarak
            </button>
            <button
              type="button"
              onClick={() => setGroupBy("month")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                groupBy === "month"
                  ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Bulan
            </button>
            <button
              type="button"
              onClick={() => setGroupBy("volume")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                groupBy === "volume"
                  ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Volume Jarak
            </button>
          </div>
        </div>

        {/* Controls: Density & Collapse All */}
        <div className="flex items-center gap-2">
          {setDensity && (
            <div className="flex items-center p-0.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setDensity("detailed")}
                title="Tampilan Detail"
                className={`p-1.5 rounded-md transition-colors ${
                  density === "detailed"
                    ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] shadow-xs border border-[var(--color-border)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDensity("compact")}
                title="Tampilan Rapat (Compact)"
                className={`p-1.5 rounded-md transition-colors ${
                  density === "compact"
                    ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] shadow-xs border border-[var(--color-border)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {onToggleAllCollapsed && (
            <button
              type="button"
              onClick={onToggleAllCollapsed}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-semibold transition-colors shadow-xs"
            >
              {isAllCollapsed ? (
                <>
                  <ChevronsDown className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
                  <span>Buka Semua</span>
                </>
              ) : (
                <>
                  <ChevronsUp className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span>Tutup Semua</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Search Input & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[var(--color-border)]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari sesi berdasarkan nama, deskripsi, Strava ID..."
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-cycling)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[var(--color-text-muted)] flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <span>Urutkan:</span>
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-[var(--color-cycling)]"
          >
            <option value="date_desc">Tanggal Terbaru</option>
            <option value="date_asc">Tanggal Terlama</option>
            <option value="dist_desc">Jarak Terjauh</option>
            <option value="dist_asc">Jarak Terpendek</option>
          </select>
        </div>
      </div>

      {/* Row 3: Sport Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => setSportFilter("All")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            sportFilter === "All"
              ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          Semua ({totalCount})
        </button>

        {availableSports.map((sp) => {
          const meta = getSportMeta(sp.id);
          const isSelected = sportFilter.toLowerCase() === sp.id.toLowerCase();
          return (
            <button
              type="button"
              key={sp.id}
              onClick={() => setSportFilter(sp.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isSelected
                  ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs font-bold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
              style={{
                color: isSelected ? meta.accentHex : undefined,
              }}
            >
              {renderSportIcon(meta.iconName, "w-3 h-3")}
              <span>{sp.name}</span>
              <span className="text-[10px] opacity-75 font-tabular font-normal">({sp.count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
