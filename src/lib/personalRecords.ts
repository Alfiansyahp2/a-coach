import { Activity, PersonalRecord } from "@/types";
import { formatDuration } from "@/lib/formatters";

export function computePersonalRecords(
  activities: Activity[],
  userId: string = "00000000-0000-0000-0000-000000000001"
): PersonalRecord[] {
  if (!activities || activities.length === 0) return [];

  const prs: PersonalRecord[] = [];
  const runs = activities.filter((a) =>
    (a.sport_type || "").toLowerCase().includes("run")
  );
  const rides = activities.filter(
    (a) =>
      (a.sport_type || "").toLowerCase().includes("ride") ||
      (a.sport_type || "").toLowerCase().includes("cycl")
  );

  // ==========================================
  // 1. RUNNING BENCHMARKS
  // ==========================================
  
  // 1A. Fastest 5K Pace / Run
  const runs5k = runs.filter((r) => Number(r.distance_meters || 0) >= 4900);
  if (runs5k.length > 0) {
    const best5k = runs5k.reduce((best, cur) => {
      const bestPace = Number(best.moving_time_seconds) / (Number(best.distance_meters) / 1000);
      const curPace = Number(cur.moving_time_seconds) / (Number(cur.distance_meters) / 1000);
      return curPace < bestPace ? cur : best;
    });

    const distKm = Number(best5k.distance_meters) / 1000;
    const paceSec = Math.round(Number(best5k.moving_time_seconds) / distKm);
    const est5kSec = Math.round(paceSec * 5);

    prs.push({
      id: `pr-run-5k-${userId}`,
      user_id: userId,
      activity_id: best5k.id,
      sport_type: "Run",
      category: "5K Benchmark",
      record_value: est5kSec,
      record_display: formatDuration(est5kSec),
      achieved_date: best5k.start_date,
      activity_name: best5k.name,
      created_at: best5k.start_date,
    });
  }

  // 1B. 10K Benchmark
  const runs10k = runs.filter((r) => Number(r.distance_meters || 0) >= 9800);
  if (runs10k.length > 0) {
    const best10k = runs10k.reduce((best, cur) => {
      const bestPace = Number(best.moving_time_seconds) / (Number(best.distance_meters) / 1000);
      const curPace = Number(cur.moving_time_seconds) / (Number(cur.distance_meters) / 1000);
      return curPace < bestPace ? cur : best;
    });

    const distKm = Number(best10k.distance_meters) / 1000;
    const paceSec = Math.round(Number(best10k.moving_time_seconds) / distKm);
    const est10kSec = Math.round(paceSec * 10);

    prs.push({
      id: `pr-run-10k-${userId}`,
      user_id: userId,
      activity_id: best10k.id,
      sport_type: "Run",
      category: "10K Benchmark",
      record_value: est10kSec,
      record_display: formatDuration(est10kSec),
      achieved_date: best10k.start_date,
      activity_name: best10k.name,
      created_at: best10k.start_date,
    });
  }

  // 1C. Longest Single Run
  if (runs.length > 0) {
    const longestRun = runs.reduce((best, cur) =>
      Number(cur.distance_meters || 0) > Number(best.distance_meters || 0) ? cur : best
    );
    const km = Number(longestRun.distance_meters || 0) / 1000;
    prs.push({
      id: `pr-run-longest-${userId}`,
      user_id: userId,
      activity_id: longestRun.id,
      sport_type: "Run",
      category: "Longest Run",
      record_value: Number(longestRun.distance_meters),
      record_display: `${km.toFixed(2)} km`,
      achieved_date: longestRun.start_date,
      activity_name: longestRun.name,
      created_at: longestRun.start_date,
    });
  }

  // 1D. Best Aerobic Pace (>= 5km)
  if (runs5k.length > 0) {
    const bestPaceRun = runs5k.reduce((best, cur) => {
      const bestPace = Number(best.moving_time_seconds) / (Number(best.distance_meters) / 1000);
      const curPace = Number(cur.moving_time_seconds) / (Number(cur.distance_meters) / 1000);
      return curPace < bestPace ? cur : best;
    });
    const paceSec = Math.round(
      Number(bestPaceRun.moving_time_seconds) / (Number(bestPaceRun.distance_meters) / 1000)
    );
    const min = Math.floor(paceSec / 60);
    const sec = paceSec % 60;
    prs.push({
      id: `pr-run-pace-${userId}`,
      user_id: userId,
      activity_id: bestPaceRun.id,
      sport_type: "Run",
      category: "Best Aerobic Pace",
      record_value: paceSec,
      record_display: `${min}:${sec < 10 ? "0" : ""}${sec} /km`,
      achieved_date: bestPaceRun.start_date,
      activity_name: bestPaceRun.name,
      created_at: bestPaceRun.start_date,
    });
  }

  // ==========================================
  // 2. CYCLING / RIDE BENCHMARKS
  // ==========================================

  // 2A. Longest Single Ride
  if (rides.length > 0) {
    const longestRide = rides.reduce((best, cur) =>
      Number(cur.distance_meters || 0) > Number(best.distance_meters || 0) ? cur : best
    );
    const km = Number(longestRide.distance_meters || 0) / 1000;
    prs.push({
      id: `pr-ride-longest-${userId}`,
      user_id: userId,
      activity_id: longestRide.id,
      sport_type: "Ride",
      category: "Longest Ride",
      record_value: Number(longestRide.distance_meters),
      record_display: `${km.toFixed(2)} km`,
      achieved_date: longestRide.start_date,
      activity_name: longestRide.name,
      created_at: longestRide.start_date,
    });
  }

  // 2B. Fastest Sustained Speed (Rides >= 20km)
  const rides20k = rides.filter((r) => Number(r.distance_meters || 0) >= 20000);
  if (rides20k.length > 0) {
    const fastestRide = rides20k.reduce((best, cur) => {
      const bestKmh =
        Number(best.distance_meters) / 1000 / (Number(best.moving_time_seconds) / 3600);
      const curKmh =
        Number(cur.distance_meters) / 1000 / (Number(cur.moving_time_seconds) / 3600);
      return curKmh > bestKmh ? cur : best;
    });
    const speedKmh =
      Number(fastestRide.distance_meters) /
      1000 /
      (Number(fastestRide.moving_time_seconds) / 3600);
    prs.push({
      id: `pr-ride-speed-${userId}`,
      user_id: userId,
      activity_id: fastestRide.id,
      sport_type: "Ride",
      category: "Fastest Speed (≥20K)",
      record_value: Math.round(speedKmh * 10) / 10,
      record_display: `${(Math.round(speedKmh * 10) / 10).toFixed(1)} km/h`,
      achieved_date: fastestRide.start_date,
      activity_name: fastestRide.name,
      created_at: fastestRide.start_date,
    });
  }

  // 2C. Max Elevation Climb (Ride)
  if (rides.length > 0) {
    const maxElevRide = rides.reduce((best, cur) =>
      Number(cur.elevation_gain_meters || 0) > Number(best.elevation_gain_meters || 0)
        ? cur
        : best
    );
    const elev = Math.round(Number(maxElevRide.elevation_gain_meters || 0));
    prs.push({
      id: `pr-ride-elev-${userId}`,
      user_id: userId,
      activity_id: maxElevRide.id,
      sport_type: "Ride",
      category: "Max Elevation Climb",
      record_value: elev,
      record_display: `▲ ${elev} m`,
      achieved_date: maxElevRide.start_date,
      activity_name: maxElevRide.name,
      created_at: maxElevRide.start_date,
    });
  }

  // 2D. 40K+ Endurance Metric Century Benchmark
  const rides40k = rides.filter((r) => Number(r.distance_meters || 0) >= 40000);
  if (rides40k.length > 0) {
    const best40k = rides40k.reduce((best, cur) => {
      const bestKmh =
        Number(best.distance_meters) / 1000 / (Number(best.moving_time_seconds) / 3600);
      const curKmh =
        Number(cur.distance_meters) / 1000 / (Number(cur.moving_time_seconds) / 3600);
      return curKmh > bestKmh ? cur : best;
    });
    const distKm = Number(best40k.distance_meters) / 1000;
    const durSec = Number(best40k.moving_time_seconds);
    const kmh = distKm / (durSec / 3600);
    prs.push({
      id: `pr-ride-40k-${userId}`,
      user_id: userId,
      activity_id: best40k.id,
      sport_type: "Ride",
      category: "40K+ Endurance Ride",
      record_value: Math.round(distKm * 10) / 10,
      record_display: `${distKm.toFixed(1)} km @ ${kmh.toFixed(1)} km/h`,
      achieved_date: best40k.start_date,
      activity_name: best40k.name,
      created_at: best40k.start_date,
    });
  }

  return prs;
}

