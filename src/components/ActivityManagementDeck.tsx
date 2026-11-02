"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity } from "@/types";
import {
  formatDistance,
  formatDuration,
  formatDate,
  speedMpsToPace,
  speedMpsToKmh,
} from "@/lib/formatters";
import { EditActivityModal } from "@/components/EditActivityModal";
import { AddActivityModal } from "@/components/AddActivityModal";
import {
  Activity as ActivityIcon,
  ChevronRight,
  Compass,
  Clock,
  Heart,
  Mountain,
  Search,
  Filter,
  Layers,
  Calendar,
  CheckSquare,
  Square,
  RefreshCw,
  SlidersHorizontal,
  FolderKanban,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ActivityManagementDeckProps {
  activities: Activity[];
}

type GroupByOption = "sport" | "category" | "month" | "volume";

// Helper to infer workout category from activity name or notes
function inferCategory(name: string, desc?: string | null): string {
  const text = `${name} ${desc || ""}`.toLowerCase();
  if (text.includes("long run") || text.includes("endurance")) return "Long / Endurance";
  if (text.includes("tempo") || text.includes("threshold")) return "Tempo / Threshold";
  if (text.includes("interval") || text.includes("speed") || text.includes("fartlek")) return "Interval / Speed";
  if (text.includes("recovery") || text.includes("spin") || text.includes("easy")) return "Recovery / Easy";
  if (text.includes("base") || text.includes("zone 2") || text.includes("aerobic")) return "Aerobic Base";
  if (text.includes("gran fondo") || text.includes("ride") || text.includes("cycl")) return "Endurance Cycling";
  return "General Workout";
}

// Helper to infer volume bucket
function inferVolumeBucket(distanceMeters: number): string {
  const km = distanceMeters / 1000;
  if (km < 5) return "Short (< 5 km)";
  if (km <= 15) return "Medium (5 – 15 km)";
  if (km <= 30) return "Long (15 – 30 km)";
  return "Ultra (> 30 km)";
}

// Helper to infer month
function inferMonth(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", { month: "long", year: "numeric" });
  } catch {
    return "Periode Lain";
  }
}

export function ActivityManagementDeck({ activities: initialActivities }: ActivityManagementDeckProps) {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [groupBy, setGroupBy] = useState<GroupByOption>("sport");
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "dist_desc" | "dist_asc">("date_desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchSport, setBatchSport] = useState<string>("Run");
  const [batchLoading, setBatchLoading] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Toggle group collapse
  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  // Filter & Sort
  const processedActivities = useMemo(() => {
    let result = [...activities];

    // Sport filter
    if (sportFilter !== "All") {
      result = result.filter(
        (a) => a.sport_type.toLowerCase() === sportFilter.toLowerCase()
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          a.sport_type.toLowerCase().includes(q) ||
          String(a.strava_activity_id).includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "date_desc") {
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      }
      if (sortBy === "date_asc") {
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      }
      if (sortBy === "dist_desc") {
        return Number(b.distance_meters || 0) - Number(a.distance_meters || 0);
      }
      if (sortBy === "dist_asc") {
        return Number(a.distance_meters || 0) - Number(b.distance_meters || 0);
      }
      return 0;
    });

    return result;
  }, [activities, sportFilter, searchQuery, sortBy]);

  // Group activities based on groupBy option
  const groupedData = useMemo(() => {
    const groups: Record<
      string,
      {
        title: string;
        badgeColor: "volt" | "cyan" | "amber" | "default";
        items: Activity[];
        totalDistance: number;
        totalDuration: number;
        totalElevation: number;
        avgPaceOrSpeed: string;
      }
    > = {};

    for (const act of processedActivities) {
      let key = "";
      let title = "";
      let badgeColor: "volt" | "cyan" | "amber" | "default" = "default";

      if (groupBy === "sport") {
        key = act.sport_type;
        title = `Cabang Olahraga: ${act.sport_type.toUpperCase()}`;
        badgeColor = act.sport_type.toLowerCase().includes("run") ? "volt" : "cyan";
      } else if (groupBy === "category") {
        const cat = inferCategory(act.name, act.description);
        key = cat;
        title = `Kategori Sesi: ${cat}`;
        badgeColor = cat.includes("Tempo") || cat.includes("Interval") ? "amber" : "volt";
      } else if (groupBy === "month") {
        const m = inferMonth(act.start_date);
        key = m;
        title = `Siklus Latihan: ${m}`;
        badgeColor = "cyan";
      } else if (groupBy === "volume") {
        const vol = inferVolumeBucket(Number(act.distance_meters || 0));
        key = vol;
        title = `Volume Jarak: ${vol}`;
        badgeColor = "amber";
      }

      if (!groups[key]) {
        groups[key] = {
          title,
          badgeColor,
          items: [],
          totalDistance: 0,
          totalDuration: 0,
          totalElevation: 0,
          avgPaceOrSpeed: "",
        };
      }

      groups[key].items.push(act);
      groups[key].totalDistance += Number(act.distance_meters || 0);
      groups[key].totalDuration += Number(act.moving_time_seconds || 0);
      groups[key].totalElevation += Number(act.elevation_gain_meters || 0);
    }

    // Compute averages
    for (const key of Object.keys(groups)) {
      const g = groups[key];
      const speedSum = g.items.reduce(
        (acc, item) => acc + Number(item.average_speed_mps || 0),
        0
      );
      const avgSpeed = g.items.length > 0 ? speedSum / g.items.length : 0;
      const isRun = key.toLowerCase().includes("run");
      g.avgPaceOrSpeed = isRun
        ? speedMpsToPace(avgSpeed)
        : speedMpsToKmh(avgSpeed);
    }

    return groups;
  }, [processedActivities, groupBy]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === processedActivities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(processedActivities.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Batch update sport type
  const handleBatchUpdateSport = async () => {
    if (selectedIds.length === 0) return;
    try {
      setBatchLoading(true);

      const promises = selectedIds.map((id) =>
        fetch(`/api/activities/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sport_type: batchSport }),
        }).then((res) => res.json())
      );

      await Promise.all(promises);

      // Update local state
      setActivities((prev) =>
        prev.map((a) =>
          selectedIds.includes(a.id) ? { ...a, sport_type: batchSport } : a
        )
      );

      setSelectedIds([]);
      router.refresh();
    } catch (err) {
      console.error("Batch update failed:", err);
      alert("Gagal melakukan pembaruan massal.");
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar & Telemetry Summary */}
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
              {activities.filter((a) => a.sport_type.toLowerCase().includes("run")).length}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-center">
            <span className="text-[10px] text-[#00F0FF] block uppercase">Cycling</span>
            <span className="font-bold font-tabular text-[#00F0FF] text-sm">
              {activities.filter((a) => a.sport_type.toLowerCase().includes("ride") || a.sport_type.toLowerCase().includes("cycl")).length}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Control Deck: Grouping Tabs, Search & Sort */}
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

      {/* 3. Batch Action Toolbar (When Items are Selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-sm bg-[#161922] border border-[#00F0FF]/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-[#00F0FF]">
            <CheckSquare className="w-4 h-4" />
            <span>
              <strong>{selectedIds.length}</strong> sesi terpilih untuk aksi massal
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#9BA3AF]">Ubah Cabang:</span>
            <select
              value={batchSport}
              onChange={(e) => setBatchSport(e.target.value)}
              disabled={batchLoading}
              className="px-2 py-1 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-white"
            >
              <option value="Run">Run (Lari)</option>
              <option value="Ride">Ride (Sepeda)</option>
              <option value="Walk">Walk (Jalan)</option>
              <option value="Hike">Hike (Hiking)</option>
              <option value="Workout">Workout (Umum)</option>
            </select>

            <button
              onClick={handleBatchUpdateSport}
              disabled={batchLoading}
              className="px-3 py-1 rounded-sm bg-[#00F0FF] hover:bg-[#00c8d6] text-black font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {batchLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Memperbarui...</span>
                </>
              ) : (
                <span>Terapkan Massal</span>
              )}
            </button>

            <button
              onClick={() => setSelectedIds([])}
              disabled={batchLoading}
              className="px-2.5 py-1 rounded-sm bg-[#090A0F] hover:bg-[#1C212E] text-[#9BA3AF] hover:text-white border border-[#1F2430]"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* 4. Grouped Activity Decks */}
      {Object.keys(groupedData).length === 0 ? (
        <div className="py-12 text-center text-xs text-[#5A6272] font-mono border border-dashed border-[#1F2430] rounded-sm">
          Tidak ada aktivitas yang sesuai dengan filter pencarian.
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedData).map(([groupKey, group]) => {
            const isCollapsed = collapsedGroups[groupKey];
            const isRunGroup = groupKey.toLowerCase().includes("run");

            return (
              <div
                key={groupKey}
                className="bg-[#12151D] border border-[#1F2430] rounded-sm overflow-hidden"
              >
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
                            isSelected
                              ? "bg-[#1C212E]/70"
                              : "hover:bg-[#161922]/50"
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
          })}
        </div>
      )}
    </div>
  );
}

