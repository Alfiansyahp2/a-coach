import { Activity, ScheduledWorkout } from "@/types";
import { formatDateOnly } from "@/lib/formatters";

export type DaySparkStatus = "COMPLETED" | "MISSED" | "TODAY" | "PLANNED" | "FASTING" | "BUFFER" | "REST";

export interface CalendarDay {
  dateStr: string;
  dayNumber: number;
  monthName: string;
  dayOfWeek: number;
  dayName: string;
  isToday: boolean;
  workouts: ScheduledWorkout[];
  activities: Activity[];
  status: DaySparkStatus;
}

export interface CalendarWeek {
  weekNumber: number;
  weekLabel: string;
  startDateStr: string;
  endDateStr: string;
  focusTitle: string;
  phaseNumber: number;
  isDeload: boolean;
  minTargetKm: number;
  minDistanceMeters: number;
  days: CalendarDay[];
  totalDistanceMeters: number;
  scheduledDistanceMeters: number;
  completedDistanceMeters: number;
  cyclingDistanceMeters: number;
  runningDistanceMeters: number;
  totalDurationSeconds: number;
  completedDurationSeconds: number;
  targetAchievedPct: number;
  isCurrentWeek: boolean;
  completedWorkoutsCount: number;
  totalWorkoutsCount: number;
  completionRatePct: number;
  estimatedWeeklyTss: number;
  sparklineDays: Array<{ dateStr: string; label: string; status: DaySparkStatus }>;
}

export const FULL_DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
export const SHORT_DAY_INITIALS = ["S", "S", "R", "K", "J", "S", "M"];
export const SHORT_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

export const WEEK_CONFIGS = [
  { weekNum: 1, phase: 1, label: "Minggu 1 (2 – 8 Nov 2026)", focus: "Fase 1: Adaptasi Fondasi Awal (MTB 20–25m & Upper Body)", isDeload: false, minTargetKm: 18 },
  { weekNum: 2, phase: 1, label: "Minggu 2 (9 – 15 Nov 2026)", focus: "Fase 1: Konsistensi Kayuhan 85 RPM (MTB 25–30m)", isDeload: false, minTargetKm: 22 },
  { weekNum: 3, phase: 1, label: "Minggu 3 (16 – 22 Nov 2026)", focus: "Fase 1: Pacing Zone 2 Terkontrol (MTB 25–30m)", isDeload: false, minTargetKm: 22 },
  { weekNum: 4, phase: 1, label: "Minggu 4 (23 – 29 Nov 2026)", focus: "Fase 1: Evaluasi Sendi & Uji Toleransi (MTB 30–35m)", isDeload: false, minTargetKm: 26 },
  { weekNum: 5, phase: 2, label: "Minggu 5 (30 Nov – 6 Des 2026)", focus: "Fase 2: Pembukaan Endurance 40m & Gated Walk-Jog", isDeload: false, minTargetKm: 30 },
  { weekNum: 6, phase: 2, label: "Minggu 6 (7 – 13 Des 2026)", focus: "Fase 2: Stabilitas Kardiovaskular (MTB 35–40m)", isDeload: false, minTargetKm: 33 },
  { weekNum: 7, phase: 2, label: "Minggu 7 (14 – 20 Des 2026)", focus: "Fase 2: Puncak Durasi Fase 2 (MTB 45m Endurance)", isDeload: false, minTargetKm: 36 },
  { weekNum: 8, phase: 2, label: "Minggu 8 (21 – 27 Des 2026)", focus: "Fase 2: Deload Week 1 (Superkompensasi & Regenerasi)", isDeload: true, minTargetKm: 25 },
  { weekNum: 9, phase: 3, label: "Minggu 9 (28 Des 2026 – 3 Jan 2027)", focus: "Fase 3: Spesifisitas Zone 2 (MTB 40–50m & 4.5K Run)", isDeload: false, minTargetKm: 40 },
  { weekNum: 10, phase: 3, label: "Minggu 10 (4 – 10 Jan 2027)", focus: "Fase 3: Endurance 55m & Uji Coba 5K Lari", isDeload: false, minTargetKm: 44 },
  { weekNum: 11, phase: 3, label: "Minggu 11 (11 – 17 Jan 2027)", focus: "Fase 3: Puncak Fondasi 1 Jam Penuh MTB Zone 2 (60m)", isDeload: false, minTargetKm: 48 },
  { weekNum: 12, phase: 3, label: "Minggu 12 (18 – 24 Jan 2027)", focus: "Fase 3: Deload Week 2 & Konsolidasi Akhir 12 Minggu", isDeload: true, minTargetKm: 32 },
];

export function buildCalendarWeeks(
  initialWorkouts: ScheduledWorkout[],
  activities: Activity[] = [],
  filter: "ALL" | "RUNNING" | "CYCLING" | "REHAB" | "COMPLETED",
  todayStr: string,
  isRunningCategory: (category: string) => boolean
): CalendarWeek[] {
  const weeks: CalendarWeek[] = [];

  for (let wIdx = 0; wIdx < WEEK_CONFIGS.length; wIdx++) {
    const conf = WEEK_CONFIGS[wIdx];
    const days: CalendarDay[] = [];
    let scheduledDist = 0;
    let completedDist = 0;
    let cyclingDist = 0;
    let runningDist = 0;
    let scheduledDur = 0;
    let completedDur = 0;
    let weekTss = 0;
    let completedCount = 0;
    let plannedCount = 0;

    const baseStart = new Date(2026, 10, 2 + wIdx * 7);

    for (let d = 0; d < 7; d++) {
      const curDate = new Date(baseStart.getFullYear(), baseStart.getMonth(), baseStart.getDate() + d);
      const y = curDate.getFullYear();
      const m = String(curDate.getMonth() + 1).padStart(2, "0");
      const dayNumber = curDate.getDate();
      const dateStr = `${y}-${m}-${String(dayNumber).padStart(2, "0")}`;
      const monthName = SHORT_MONTH_NAMES[curDate.getMonth()];
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
        const dist = Number(wo.target_distance_meters || 0);
        scheduledDist += dist;
        if (isRunningCategory(wo.workout_category)) runningDist += dist;
        else if (wo.workout_category === "Cycling") cyclingDist += dist;
        scheduledDur += Number(wo.target_duration_seconds || 0);
      }

      const hasDoneSession = dayActivities.length > 0 || dayWorkouts.some((w) => w.status === "COMPLETED");
      if (hasDoneSession && (dayWorkouts.length > 0 || dayActivities.length > 0)) {
        completedCount++;
      }

      for (const act of dayActivities) {
        const dist = Number(act.distance_meters || 0);
        completedDist += dist;
        const sport = (act.sport_type || "").toLowerCase();
        if (isRunningCategory(sport)) runningDist += dist;
        else if (sport.includes("ride") || sport.includes("cycl")) cyclingDist += dist;
        const dur = Number(act.moving_time_seconds || 0);
        completedDur += dur;
        // Estimate TSS: ~55 TSS per hour for Zone 2
        weekTss += Math.round((dur / 3600) * 55);
      }

      // Determine day spark status
      let dayStatus: DaySparkStatus = "REST";
      if (hasDoneSession) {
        dayStatus = "COMPLETED";
      } else if (isToday) {
        dayStatus = "TODAY";
      } else if (dayWorkouts.length > 0 && isPastDay) {
        dayStatus = "MISSED";
      } else if (dayWorkouts.length > 0) {
        dayStatus = "PLANNED";
      } else if (d === 0 || d === 3) {
        dayStatus = "FASTING";
      } else if (d === 5) {
        dayStatus = "BUFFER";
      }

      days.push({
        dateStr,
        dayNumber,
        monthName,
        dayOfWeek: d,
        dayName: FULL_DAY_NAMES[d],
        isToday,
        workouts: dayWorkouts,
        activities: dayActivities,
        status: dayStatus,
      });
    }

    const minDistanceMeters = conf.minTargetKm * 1000;
    const effectiveProgressMeters = completedDist > 0 ? completedDist : scheduledDist;
    const targetAchievedPct = Math.round((effectiveProgressMeters / minDistanceMeters) * 100);
    const isCurrentWeek = days.some((d) => d.isToday);
    const completionRatePct = plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : 0;

    const sparklineDays = days.map((d, i) => ({
      dateStr: d.dateStr,
      label: SHORT_DAY_INITIALS[i],
      status: d.status,
    }));

    weeks.push({
      weekNumber: conf.weekNum,
      weekLabel: conf.label,
      startDateStr: days[0].dateStr,
      endDateStr: days[6].dateStr,
      focusTitle: conf.focus,
      phaseNumber: conf.phase,
      isDeload: conf.isDeload,
      minTargetKm: conf.minTargetKm,
      minDistanceMeters,
      days,
      totalDistanceMeters: Math.max(scheduledDist, completedDist),
      scheduledDistanceMeters: scheduledDist,
      completedDistanceMeters: completedDist,
      cyclingDistanceMeters: cyclingDist,
      runningDistanceMeters: runningDist,
      totalDurationSeconds: Math.max(scheduledDur, completedDur),
      completedDurationSeconds: completedDur,
      targetAchievedPct,
      isCurrentWeek,
      completedWorkoutsCount: completedCount,
      totalWorkoutsCount: plannedCount,
      completionRatePct,
      estimatedWeeklyTss: weekTss,
      sparklineDays,
    });
  }

  return weeks;
}
