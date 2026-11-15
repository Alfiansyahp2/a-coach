import { Activity, ScheduledWorkout } from "@/types";
import { formatDateOnly } from "@/lib/formatters";
import { WEEK_CONFIGS, DaySparkStatus } from "../calendarBuilder";

export interface MonthGridDay {
  dateStr: string;
  dayNumber: number;
  monthIndex: number;
  year: number;
  dayOfWeek: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  workouts: ScheduledWorkout[];
  activities: Activity[];
  status: DaySparkStatus;
}

export interface MonthGridWeek {
  weekNumber: number;
  weekLabel: string;
  focusTitle: string;
  phaseNumber: number;
  isDeload: boolean;
  minTargetKm: number;
  days: MonthGridDay[];
  scheduledDistMeters: number;
  completedDistMeters: number;
  totalDurationSeconds: number;
  targetAchievedPct: number;
  estimatedTss: number;
  completedCount: number;
  plannedCount: number;
  isCurrentWeek: boolean;
}

export const AVAILABLE_MONTHS = [
  { label: "November 2026", year: 2026, month: 10 }, // 0-indexed month
  { label: "Desember 2026", year: 2026, month: 11 },
  { label: "Januari 2027", year: 2027, month: 0 },
];

export function buildMonthGrid(
  year: number,
  month: number,
  initialWorkouts: ScheduledWorkout[],
  activities: Activity[],
  filter: "ALL" | "RUNNING" | "CYCLING" | "REHAB" | "COMPLETED",
  todayStr: string,
  isRunningCategory: (category: string) => boolean
): MonthGridWeek[] {
  // Find weeks from WEEK_CONFIGS that overlap with this month
  const resultWeeks: MonthGridWeek[] = [];

  for (let wIdx = 0; wIdx < WEEK_CONFIGS.length; wIdx++) {
    const conf = WEEK_CONFIGS[wIdx];
    const baseStart = new Date(2026, 10, 2 + wIdx * 7); // Monday Nov 02, 2026
    const baseEnd = new Date(baseStart.getFullYear(), baseStart.getMonth(), baseStart.getDate() + 6); // Sunday

    // Check if this week overlaps with the requested (year, month)
    const weekIntersects =
      (baseStart.getFullYear() === year && baseStart.getMonth() === month) ||
      (baseEnd.getFullYear() === year && baseEnd.getMonth() === month);

    if (!weekIntersects) continue;

    const days: MonthGridDay[] = [];
    let scheduledDist = 0;
    let completedDist = 0;
    let scheduledDur = 0;
    let completedDur = 0;
    let weekTss = 0;
    let completedCount = 0;
    let plannedCount = 0;

    for (let d = 0; d < 7; d++) {
      const curDate = new Date(baseStart.getFullYear(), baseStart.getMonth(), baseStart.getDate() + d);
      const curY = curDate.getFullYear();
      const curM = curDate.getMonth();
      const dayNum = curDate.getDate();
      const dateStr = `${curY}-${String(curM + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const isCurrentMonth = curY === year && curM === month;
      const isToday = dateStr === todayStr;
      const isPastDay = Boolean(todayStr && dateStr < todayStr && !isToday);

      const dayWorkouts = initialWorkouts.filter((wo) => {
        const wDate = formatDateOnly(wo.scheduled_date);
        if (wDate !== dateStr) return false;
        if (filter === "RUNNING") return isRunningCategory(wo.workout_category);
        if (filter === "CYCLING") return wo.workout_category === "Cycling";
        if (filter === "REHAB") return wo.workout_category === "Cross Training" || wo.workout_category === "Strength Training";
        if (filter === "COMPLETED") return wo.status === "COMPLETED";
        return true;
      });

      const dayActivities = activities.filter((act) => {
        const actDate = formatDateOnly(act.start_date);
        if (actDate !== dateStr) return false;
        const sport = (act.sport_type || "").toLowerCase();
        if (filter === "RUNNING") return isRunningCategory(sport);
        if (filter === "CYCLING") return sport.includes("ride") || sport.includes("cycl");
        if (filter === "REHAB") return sport.includes("cross") || sport.includes("strength") || sport.includes("weight") || sport.includes("workout");
        return true;
      });

      plannedCount += dayWorkouts.length;
      for (const wo of dayWorkouts) {
        scheduledDist += Number(wo.target_distance_meters || 0);
        scheduledDur += Number(wo.target_duration_seconds || 0);
      }

      const hasDone = dayActivities.length > 0 || dayWorkouts.some((w) => w.status === "COMPLETED");
      if (hasDone && (dayWorkouts.length > 0 || dayActivities.length > 0)) {
        completedCount++;
      }

      for (const act of dayActivities) {
        const dist = Number(act.distance_meters || 0);
        completedDist += dist;
        const dur = Number(act.moving_time_seconds || 0);
        completedDur += dur;
        weekTss += Math.round((dur / 3600) * 55);
      }

      let status: DaySparkStatus = "REST";
      if (hasDone) status = "COMPLETED";
      else if (isToday) status = "TODAY";
      else if (dayWorkouts.length > 0 && isPastDay) status = "MISSED";
      else if (dayWorkouts.length > 0) status = "PLANNED";
      else if (d === 0 || d === 3) status = "FASTING";
      else if (d === 5) status = "BUFFER";

      days.push({
        dateStr,
        dayNumber: dayNum,
        monthIndex: curM,
        year: curY,
        dayOfWeek: d,
        isCurrentMonth,
        isToday,
        workouts: dayWorkouts,
        activities: dayActivities,
        status,
      });
    }

    const minDistanceMeters = conf.minTargetKm * 1000;
    const effectiveMeters = completedDist > 0 ? completedDist : scheduledDist;
    const targetAchievedPct = Math.round((effectiveMeters / minDistanceMeters) * 100);
    const isCurrentWeek = days.some((d) => d.isToday);

    resultWeeks.push({
      weekNumber: conf.weekNum,
      weekLabel: conf.label,
      focusTitle: conf.focus,
      phaseNumber: conf.phase,
      isDeload: conf.isDeload,
      minTargetKm: conf.minTargetKm,
      days,
      scheduledDistMeters: scheduledDist,
      completedDistMeters: completedDist,
      totalDurationSeconds: Math.max(scheduledDur, completedDur),
      targetAchievedPct,
      estimatedTss: weekTss,
      completedCount,
      plannedCount,
      isCurrentWeek,
    });
  }

  return resultWeeks;
}

