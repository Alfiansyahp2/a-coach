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
} from "lucide-react";
import { GroupByOption } from "./activityGroupUtils";

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
  counts?: { all: number; ride: number; run: number };
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
  counts = { all: 34, ride: 24, run: 10 },
}: ActivityFilterToolbarProps) {
  return (
    <div className="p-3.5 sm:p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3 font-mono shadow-sm">
      {/* Row 1: Grouping Tabs, Density Toggle & Collapse All */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        {/* Group By Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[#9BA3AF] flex items-center gap-1 font-bold">
            <Layers className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Kelompokkan:</span>
          </span>
          <div className="flex items-center gap-1 p-0.5 rounded-sm bg-[#090A0F] border border-[#1F2430]">
            <button
              type="button"
              onClick={() => setGroupBy("sport")}
              className={`px-2.5 py-1 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                groupBy === "sport"
                  ? "bg-[#1C212E] text-[#00F0FF] border border-[#00F0FF]/30 shadow-xs"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              Cabang Olahraga
            </button>
            <button
              type="button"
              onClick={() => setGroupBy("category")}
              className={`px-2.5 py-1 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                groupBy === "category"
                  ? "bg-[#1C212E] text-[#D4FF00] border border-[#D4FF00]/30 shadow-xs"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              Kategori Latihan
            </button>
            <button
              type="button"
              onClick={() => setGroupBy("month")}
              className={`px-2.5 py-1 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                groupBy === "month"
                  ? "bg-[#1C212E] text-[#00F0FF] border border-[#00F0FF]/30 shadow-xs"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              Siklus Bulan
            </button>
            <button
              type="button"
              onClick={() => setGroupBy("volume")}
              className={`px-2.5 py-1 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                groupBy === "volume"
                  ? "bg-[#1C212E] text-[#FF9500] border border-[#FF9500]/30 shadow-xs"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              Rentang Jarak
            </button>
          </div>
        </div>

        {/* Global Toolbar Utilities: Collapse All & Density */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Collapse/Expand All Toggle */}
          {onToggleAllCollapsed && (
            <button
              type="button"
              onClick={onToggleAllCollapsed}
              className="px-2.5 py-1 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#2D3547] text-[#9BA3AF] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              {isAllCollapsed ? (
                <>
                  <ChevronsDown className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>Buka Semua Grup</span>
                </>
              ) : (
                <>
                  <ChevronsUp className="w-3.5 h-3.5 text-[#9BA3AF]" />
                  <span>Ciutkan Semua Grup</span>
                </>
              )}
            </button>
          )}

          {/* Density Toggle (Detailed vs Compact) */}
          {setDensity && (
            <div className="flex items-center p-0.5 rounded-sm bg-[#090A0F] border border-[#1F2430]">
              <button
                type="button"
                onClick={() => setDensity("detailed")}
                title="Tampilan Rinci (dengan telemetri penuh)"
                className={`px-2 py-1 rounded-sm text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                  density === "detailed"
                    ? "bg-[#1C212E] text-white border border-[#2D3547]"
                    : "text-[#5A6272] hover:text-[#9BA3AF]"
                }`}
              >
                <LayoutList className="w-3 h-3" />
                <span className="hidden sm:inline">Rinci</span>
              </button>
              <button
                type="button"
                onClick={() => setDensity("compact")}
                title="Tampilan Padat (daftar baris ringkas)"
                className={`px-2 py-1 rounded-sm text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                  density === "compact"
                    ? "bg-[#1C212E] text-white border border-[#2D3547]"
                    : "text-[#5A6272] hover:text-[#9BA3AF]"
                }`}
              >
                <AlignJustify className="w-3 h-3" />
                <span className="hidden sm:inline">Padat</span>
              </button>
            </div>
          )}

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 pl-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF9500]" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-2.5 py-1 rounded-sm bg-[#090A0F] border border-[#1F2430] hover:border-[#2D3547] text-xs text-[#F0F2F5] font-mono focus:outline-none focus:border-[#00F0FF] cursor-pointer"
            >
              <option value="date_desc">Tanggal Terbaru (Newest)</option>
              <option value="date_asc">Tanggal Terlama (Oldest)</option>
              <option value="dist_desc">Jarak Terpanjang (Max km)</option>
              <option value="dist_asc">Jarak Terpendek (Min km)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Row 2: Search Input & Sport Filter Pills */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2.5 border-t border-[#1F2430]/60">
        {/* Search Field */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5A6272]" />
          <input
            type="text"
            placeholder="Cari aktivitas berdasarkan judul, catatan, atau rute..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] focus:border-[#00F0FF] focus:outline-none text-xs text-[#F0F2F5] placeholder-[#5A6272] font-mono transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A6272] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Sport Filter Pill Strip */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs shrink-0">
          <button
            type="button"
            onClick={() => setSportFilter("All")}
            className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer font-bold ${
              sportFilter === "All"
                ? "bg-[#1C212E] text-white border border-[#2D3547] shadow-xs"
                : "bg-[#090A0F] border border-[#1F2430] text-[#9BA3AF] hover:text-white hover:border-[#2D3547]"
            }`}
          >
            Semua ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setSportFilter("Ride")}
            className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
              sportFilter.toLowerCase().includes("ride")
                ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-xs"
                : "bg-[#090A0F] border border-[#1F2430] text-[#9BA3AF] hover:text-[#00F0FF] hover:border-[#00F0FF]/30"
            }`}
          >
            <Bike className="w-3 h-3" />
            <span>Sepeda ({counts.ride})</span>
          </button>
          <button
            type="button"
            onClick={() => setSportFilter("Run")}
            className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
              sportFilter.toLowerCase().includes("run")
                ? "bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/40 shadow-xs"
                : "bg-[#090A0F] border border-[#1F2430] text-[#9BA3AF] hover:text-[#D4FF00] hover:border-[#D4FF00]/30"
            }`}
          >
            <Footprints className="w-3 h-3" />
            <span>Lari ({counts.run})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
