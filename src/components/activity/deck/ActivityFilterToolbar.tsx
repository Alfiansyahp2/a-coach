import React from "react";
import { Layers, SlidersHorizontal, Search } from "lucide-react";
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
}: ActivityFilterToolbarProps) {
  return (
    <div className="p-3.5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Group By Selector */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-[#9BA3AF] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Kelompokkan:</span>
          </span>
          <div className="flex items-center gap-1 p-0.5 rounded-sm bg-[#090A0F] border border-[#1F2430]">
            <button
              onClick={() => setGroupBy("sport")}
              className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ${
                groupBy === "sport"
                  ? "bg-[#1C212E] text-white border border-[#2D3547]"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              Cabang Olahraga
            </button>
            <button
              onClick={() => setGroupBy("category")}
              className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ${
                groupBy === "category"
                  ? "bg-[#1C212E] text-white border border-[#2D3547]"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              Kategori Latihan
            </button>
            <button
              onClick={() => setGroupBy("month")}
              className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ${
                groupBy === "month"
                  ? "bg-[#1C212E] text-white border border-[#2D3547]"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              Siklus Bulan
            </button>
            <button
              onClick={() => setGroupBy("volume")}
              className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ${
                groupBy === "volume"
                  ? "bg-[#1C212E] text-white border border-[#2D3547]"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              Rentang Jarak
            </button>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#9BA3AF] flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF9500]" />
            <span>Urutan:</span>
          </span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-2 py-1 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] font-mono focus:outline-none focus:border-[#00F0FF]"
          >
            <option value="date_desc">Tanggal Terbaru (Newest)</option>
            <option value="date_asc">Tanggal Terlama (Oldest)</option>
            <option value="dist_desc">Jarak Terpanjang (Max km)</option>
            <option value="dist_asc">Jarak Terpendek (Min km)</option>
          </select>
        </div>
      </div>

      {/* Search Bar & Sport Filter Strip */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-[#1F2430]/60">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6272]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aktivitas berdasarkan judul, catatan, atau ID..."
            className="w-full pl-8 pr-12 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] placeholder-[#5A6272] focus:outline-none focus:border-[#00F0FF] font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#9BA3AF] hover:text-white uppercase font-mono"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs font-mono self-start sm:self-auto">
          {["All", "Run", "Ride"].map((sp) => (
            <button
              key={sp}
              onClick={() => setSportFilter(sp)}
              className={`px-2.5 py-1 rounded-sm transition-colors ${
                sportFilter === sp
                  ? "bg-[#1C212E] text-white border border-[#2D3547]"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              {sp}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

