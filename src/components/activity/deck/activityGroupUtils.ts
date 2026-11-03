import { Activity } from "@/types";
import { speedMpsToPace, speedMpsToKmh } from "@/lib/formatters";
import { getSportMeta } from "@/lib/sportUtils";

export type GroupByOption = "sport" | "category" | "month" | "volume";

export interface ActivityGroup {
  title: string;
  badgeColor: "volt" | "cyan" | "amber" | "default";
  items: Activity[];
  totalDistance: number;
  totalDuration: number;
  totalElevation: number;
  avgPaceOrSpeed: string;
}

// Helper to infer workout category from activity name or notes
export function inferCategory(name: string, desc?: string | null): string {
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
export function inferVolumeBucket(distanceMeters: number): string {
  const km = distanceMeters / 1000;
  if (km < 5) return "Short (< 5 km)";
  if (km <= 15) return "Medium (5 – 15 km)";
  if (km <= 30) return "Long (15 – 30 km)";
  return "Ultra (> 30 km)";
}

// Helper to infer month
export function inferMonth(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", { month: "long", year: "numeric" });
  } catch {
    return "Periode Lain";
  }
}

export function groupActivities(
  activities: Activity[],
  groupBy: GroupByOption
): Record<string, ActivityGroup> {
  const groups: Record<string, ActivityGroup> = {};

  for (const act of activities) {
    let key = "";
    let title = "";
    let badgeColor: "volt" | "cyan" | "amber" | "default" = "default";

    if (groupBy === "sport") {
      key = act.sport_type;
      const meta = getSportMeta(act.sport_type);
      title = `Cabang Olahraga: ${meta.label.toUpperCase()}`;
      badgeColor =
        meta.colorKey === "volt"
          ? "volt"
          : meta.colorKey === "cyan"
          ? "cyan"
          : meta.colorKey === "amber"
          ? "amber"
          : "default";
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
    const meta = getSportMeta(key);
    g.avgPaceOrSpeed = meta.isPaceFormat
      ? speedMpsToPace(avgSpeed)
      : speedMpsToKmh(avgSpeed);
  }

  return groups;
}

