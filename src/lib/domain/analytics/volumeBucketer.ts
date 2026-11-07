import { Activity } from "@/types";

export type VolumeTimeframe = "7d" | "14d" | "30d" | "all";

export interface VolumeBucket {
  id: string;
  label: string;
  subLabel: string;
  fullDateStr: string;
  runKm: number;
  rideKm: number;
  totalKm: number;
  elevation: number;
  sessionCount: number;
}

export interface VolumeProgressionMetrics {
  buckets: VolumeBucket[];
  totalPeriodKm: number;
  totalPeriodRunKm: number;
  totalPeriodRideKm: number;
  maxTotal: number;
  barWidth: number;
  gap: number;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Pure domain calculation engine for athletic volume progression & periodization bucketing.
 */
export function computeVolumeProgression(
  activities: Activity[] = [],
  timeframe: VolumeTimeframe = "7d"
): VolumeProgressionMetrics {
  if (!activities || activities.length === 0) {
    return {
      buckets: [],
      totalPeriodKm: 0,
      totalPeriodRunKm: 0,
      totalPeriodRideKm: 0,
      maxTotal: 5,
      barWidth: 9.5,
      gap: 1.0,
    };
  }

  const now = new Date();
  const dates = activities.map((a) => new Date(a.start_date).getTime());
  const minTime = Math.min(...dates);
  const latestActivityTime = Math.max(...dates);

  let buckets: VolumeBucket[] = [];

  // MODE 1: ALL-TIME (Weekly Aggregated Progression across entire dataset)
  if (timeframe === "all") {
    const startD = new Date(minTime);
    const startDay = startD.getUTCDay();
    const startDiff = startD.getUTCDate() - startDay + (startDay === 0 ? -6 : 1);
    const currentMonday = new Date(
      Date.UTC(startD.getUTCFullYear(), startD.getUTCMonth(), startDiff)
    );

    let weekIndex = 1;

    while (currentMonday.getTime() <= latestActivityTime + 86400000) {
      const sunday = new Date(currentMonday.getTime() + 6 * 86400000);
      const startIso = currentMonday.toISOString().split("T")[0];
      const endIso = sunday.toISOString().split("T")[0];

      let runKm = 0;
      let rideKm = 0;
      let elevation = 0;
      let count = 0;

      for (const act of activities) {
        const actDate = act.start_date.split("T")[0];
        if (actDate >= startIso && actDate <= endIso) {
          const distKm = Number(act.distance_meters || 0) / 1000;
          const elev = Number(act.elevation_gain_meters || 0);
          const sport = (act.sport_type || "").toLowerCase();

          if (sport.includes("run")) {
            runKm += distKm;
          } else if (sport.includes("ride") || sport.includes("cycl")) {
            rideKm += distKm;
          } else {
            runKm += distKm;
          }
          elevation += elev;
          count++;
        }
      }

      const monNum = String(currentMonday.getUTCDate()).padStart(2, "0");
      const monMonth = MONTH_NAMES[currentMonday.getUTCMonth()];
      const sunNum = String(sunday.getUTCDate()).padStart(2, "0");
      const sunMonth = MONTH_NAMES[sunday.getUTCMonth()];

      buckets.push({
        id: startIso,
        label: `W${weekIndex}`,
        subLabel: `${monNum} ${monMonth}`,
        fullDateStr: `Week ${weekIndex} (${monNum} ${monMonth} - ${sunNum} ${sunMonth})`,
        runKm: Math.round(runKm * 10) / 10,
        rideKm: Math.round(rideKm * 10) / 10,
        totalKm: Math.round((runKm + rideKm) * 10) / 10,
        elevation: Math.round(elevation),
        sessionCount: count,
      });

      weekIndex++;
      currentMonday.setTime(currentMonday.getTime() + 7 * 86400000);
    }
  } else {
    // MODE 2: DAILY PROGRESSION (7D, 14D, 30D)
    const numDays = timeframe === "14d" ? 14 : timeframe === "30d" ? 30 : 7;

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const iso = d.toISOString().split("T")[0];
      const dayName = DAY_NAMES[d.getUTCDay()];
      const dayNum = String(d.getUTCDate()).padStart(2, "0");
      const monthStr = MONTH_NAMES[d.getUTCMonth()];

      let runKm = 0;
      let rideKm = 0;
      let elevation = 0;
      let count = 0;

      for (const act of activities) {
        if (act.start_date.split("T")[0] === iso) {
          const distKm = Number(act.distance_meters || 0) / 1000;
          const elev = Number(act.elevation_gain_meters || 0);
          const sport = (act.sport_type || "").toLowerCase();

          if (sport.includes("run")) {
            runKm += distKm;
          } else if (sport.includes("ride") || sport.includes("cycl")) {
            rideKm += distKm;
          } else {
            runKm += distKm;
          }
          elevation += elev;
          count++;
        }
      }

      buckets.push({
        id: iso,
        label: dayName,
        subLabel: `${dayNum} ${monthStr}`,
        fullDateStr: `${dayName}, ${dayNum} ${monthStr}`,
        runKm: Math.round(runKm * 10) / 10,
        rideKm: Math.round(rideKm * 10) / 10,
        totalKm: Math.round((runKm + rideKm) * 10) / 10,
        elevation: Math.round(elevation),
        sessionCount: count,
      });
    }
  }

  const totalPeriodKm = buckets.reduce((acc, b) => acc + b.totalKm, 0);
  const totalPeriodRunKm = buckets.reduce((acc, b) => acc + b.runKm, 0);
  const totalPeriodRideKm = buckets.reduce((acc, b) => acc + b.rideKm, 0);

  const rawMax = Math.max(...buckets.map((b) => b.totalKm), 5);
  const maxTotal = Math.ceil(rawMax / 5) * 5;

  const count = buckets.length;
  let barWidth = 9.5;
  if (count <= 7) barWidth = 9.5;
  else if (count <= 14) barWidth = 5.0;
  else if (count <= 30) barWidth = 2.2;
  else barWidth = Math.max(1.5, 80 / count);

  const remaining = 100 - barWidth * count;
  const gap = Math.max(0.8, remaining / (count + 1));

  return {
    buckets,
    totalPeriodKm,
    totalPeriodRunKm,
    totalPeriodRideKm,
    maxTotal,
    barWidth,
    gap,
  };
}

