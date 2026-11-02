"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "@/types";
import {
  GroupByOption,
  groupActivities,
} from "./activity/deck/activityGroupUtils";
import { ActivityDeckHeader } from "./activity/deck/ActivityDeckHeader";
import { ActivityFilterToolbar } from "./activity/deck/ActivityFilterToolbar";
import { ActivityBatchActionBar } from "./activity/deck/ActivityBatchActionBar";
import { ActivityGroupCard } from "./activity/deck/ActivityGroupCard";

interface ActivityManagementDeckProps {
  activities: Activity[];
}

export function ActivityManagementDeck({
  activities: initialActivities,
}: ActivityManagementDeckProps) {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [groupBy, setGroupBy] = useState<GroupByOption>("sport");
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<
    "date_desc" | "date_asc" | "dist_desc" | "dist_asc"
  >("date_desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchSport, setBatchSport] = useState<string>("Run");
  const [batchLoading, setBatchLoading] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [density, setDensity] = useState<"detailed" | "compact">("detailed");

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
        return (
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
      }
      if (sortBy === "date_asc") {
        return (
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );
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

  // Group activities
  const groupedData = useMemo(() => {
    return groupActivities(processedActivities, groupBy);
  }, [processedActivities, groupBy]);

  // Check if all groups are collapsed
  const groupKeys = Object.keys(groupedData);
  const isAllCollapsed =
    groupKeys.length > 0 && groupKeys.every((key) => !!collapsedGroups[key]);

  const handleToggleAllCollapsed = () => {
    if (isAllCollapsed) {
      setCollapsedGroups({});
    } else {
      const all: Record<string, boolean> = {};
      groupKeys.forEach((k) => {
        all[k] = true;
      });
      setCollapsedGroups(all);
    }
  };

  // Selection handlers
  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectGroup = (groupItems: Activity[]) => {
    const groupIds = groupItems.map((i) => i.id);
    const allSelected = groupIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...groupIds])));
    }
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = processedActivities.map((a) => a.id);
    setSelectedIds(allFilteredIds);
  };

  // Quick counts
  const rideCount = activities.filter(
    (a) =>
      a.sport_type.toLowerCase().includes("ride") ||
      a.sport_type.toLowerCase().includes("cycl")
  ).length;
  const runCount = activities.filter((a) =>
    a.sport_type.toLowerCase().includes("run")
  ).length;

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
    <div className="space-y-5">
      {/* 1. Header Toolbar & Interactive Telemetry KPI Cards */}
      <ActivityDeckHeader
        activities={activities}
        sportFilter={sportFilter}
        setSportFilter={setSportFilter}
      />

      {/* 2. Control Deck: Grouping Tabs, Search, Sort & Density Controls */}
      <ActivityFilterToolbar
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        sortBy={sortBy}
        setSortBy={setSortBy}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sportFilter={sportFilter}
        setSportFilter={setSportFilter}
        density={density}
        setDensity={setDensity}
        isAllCollapsed={isAllCollapsed}
        onToggleAllCollapsed={handleToggleAllCollapsed}
        counts={{ all: activities.length, ride: rideCount, run: runCount }}
      />

      {/* 3. Batch Action Toolbar (When Items are Selected) */}
      <ActivityBatchActionBar
        selectedIds={selectedIds}
        totalFilteredCount={processedActivities.length}
        onSelectAllFiltered={handleSelectAllFiltered}
        batchSport={batchSport}
        setBatchSport={setBatchSport}
        batchLoading={batchLoading}
        onApplyBatch={handleBatchUpdateSport}
        onCancel={() => setSelectedIds([])}
      />

      {/* 4. Grouped Activity Decks */}
      {groupKeys.length === 0 ? (
        <div className="py-16 text-center text-xs text-[#5A6272] font-mono border border-dashed border-[#1F2430] rounded-sm bg-[#12151D]">
          Tidak ada aktivitas yang sesuai dengan filter pencarian atau kategori ini.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedData).map(([groupKey, group]) => (
            <ActivityGroupCard
              key={groupKey}
              groupKey={groupKey}
              group={group}
              isCollapsed={!!collapsedGroups[groupKey]}
              toggleGroup={toggleGroup}
              selectedIds={selectedIds}
              toggleSelectOne={toggleSelectOne}
              onSelectGroup={handleToggleSelectGroup}
              density={density}
            />
          ))}
        </div>
      )}
    </div>
  );
}
