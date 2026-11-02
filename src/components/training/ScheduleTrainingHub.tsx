"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ScheduledWorkout,
  TrainingPlan,
  FitnessGoal,
  WorkoutActivityMatch,
  AuthoritativeAthleteHealthContext,
} from "@/types";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Bike,
  Activity as ActivityIcon,
  Zap,
  Target,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Info,
  Grid,
  List,
  X,
  ChevronLeft,
  Heart,
  Dumbbell,
  Check,
  Footprints,
  Compass,
  Gauge,
  Sliders,
} from "lucide-react";
import { formatDistance, formatDuration, formatDate } from "@/lib/formatters";

interface ScheduleTrainingHubProps {
  initialPlan: TrainingPlan | null;
  initialWorkouts: ScheduledWorkout[];
  initialGoals: FitnessGoal[];
  matches: WorkoutActivityMatch[];
  healthContext: AuthoritativeAthleteHealthContext | null;
}

interface CalendarDay {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  monthName: string;
  dayOfWeek: number; // 0 = Mon, 6 = Sun
  dayName: string;
  isToday: boolean;
  workouts: ScheduledWorkout[];
}

interface CalendarWeek {
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
  cyclingDistanceMeters: number;
  runningDistanceMeters: number;
  totalDurationSeconds: number;
  targetAchievedPct: number;
}

export function ScheduleTrainingHub({
  initialPlan,
  initialWorkouts,
  initialGoals,
  matches,
  healthContext,
}: ScheduleTrainingHubProps) {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedPhase, setSelectedPhase] = useState<"ALL" | "PHASE_1" | "PHASE_2" | "PHASE_3">("ALL");
  const [filter, setFilter] = useState<"ALL" | "RUNNING" | "CYCLING" | "REHAB" | "COMPLETED">("ALL");
  const [selectedWorkout, setSelectedWorkout] = useState<ScheduledWorkout | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const todayStr = "2026-11-02"; // Reference current date

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/training/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal sinkronisasi rencana latihan");
      }
      setMessage("Program 12-Minggu Zone 2 berhasil dikalibrasi ulang dari database!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const isRunningCategory = (cat: string) =>
    cat.toLowerCase().includes("run") || cat.toLowerCase().includes("lari");

  const filteredWorkouts = initialWorkouts.filter((w) => {
    if (filter === "RUNNING") return isRunningCategory(w.workout_category);
    if (filter === "CYCLING") return w.workout_category === "Cycling";
    if (filter === "REHAB")
      return w.workout_category === "Cross Training" || w.workout_category === "Strength Training";
    if (filter === "COMPLETED") return w.status === "COMPLETED";
    return true;
  });

  const completedCount = initialWorkouts.filter((w) => w.status === "COMPLETED").length;
  const runningCount = initialWorkouts.filter((w) => isRunningCategory(w.workout_category)).length;
  const cyclingCount = initialWorkouts.filter((w) => w.workout_category === "Cycling").length;
  const rehabCount = initialWorkouts.filter(
    (w) => w.workout_category === "Cross Training" || w.workout_category === "Strength Training"
  ).length;

  const FULL_DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  const SHORT_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

  // Build 12 Structured Calendar Weeks (Nov 02, 2026 to Jan 24, 2027)
  const buildCalendarWeeks = (): CalendarWeek[] => {
    const weekConfigs = [
      // FASE 1: Adaptasi Fondasi (Minggu 1 - 4)
      {
        weekNum: 1,
        phase: 1,
        label: "Minggu 1 (2 – 8 Nov 2026)",
        focus: "Fase 1: Adaptasi Fondasi Awal (MTB 20–25m & Upper Body)",
        isDeload: false,
        minTargetKm: 18,
      },
      {
        weekNum: 2,
        phase: 1,
        label: "Minggu 2 (9 – 15 Nov 2026)",
        focus: "Fase 1: Konsistensi Kayuhan 85 RPM (MTB 25–30m)",
        isDeload: false,
        minTargetKm: 22,
      },
      {
        weekNum: 3,
        phase: 1,
        label: "Minggu 3 (16 – 22 Nov 2026)",
        focus: "Fase 1: Pacing Zone 2 Terkontrol (MTB 25–30m)",
        isDeload: false,
        minTargetKm: 22,
      },
      {
        weekNum: 4,
        phase: 1,
        label: "Minggu 4 (23 – 29 Nov 2026)",
        focus: "Fase 1: Evaluasi Sendi & Uji Toleransi (MTB 30–35m)",
        isDeload: false,
        minTargetKm: 26,
      },

      // FASE 2: Pembangunan Endurance (Minggu 5 - 8)
      {
        weekNum: 5,
        phase: 2,
        label: "Minggu 5 (30 Nov – 6 Des 2026)",
        focus: "Fase 2: Pembukaan Endurance 40m & Gated Walk-Jog",
        isDeload: false,
        minTargetKm: 30,
      },
      {
        weekNum: 6,
        phase: 2,
        label: "Minggu 6 (7 – 13 Des 2026)",
        focus: "Fase 2: Stabilitas Kardiovaskular (MTB 35–40m)",
        isDeload: false,
        minTargetKm: 33,
      },
      {
        weekNum: 7,
        phase: 2,
        label: "Minggu 7 (14 – 20 Des 2026)",
        focus: "Fase 2: Puncak Durasi Fase 2 (MTB 45m Endurance)",
        isDeload: false,
        minTargetKm: 36,
      },
      {
        weekNum: 8,
        phase: 2,
        label: "Minggu 8 (21 – 27 Des 2026)",
        focus: "Fase 2: Deload Week 1 (Superkompensasi & Regenerasi)",
        isDeload: true,
        minTargetKm: 25,
      },

      // FASE 3: Spesifisitas & Konsolidasi (Minggu 9 - 12)
      {
        weekNum: 9,
        phase: 3,
        label: "Minggu 9 (28 Des 2026 – 3 Jan 2027)",
        focus: "Fase 3: Spesifisitas Zone 2 (MTB 40–50m & 4.5K Run)",
        isDeload: false,
        minTargetKm: 40,
      },
      {
        weekNum: 10,
        phase: 3,
        label: "Minggu 10 (4 – 10 Jan 2027)",
        focus: "Fase 3: Endurance 55m & Uji Coba 5K Lari",
        isDeload: false,
        minTargetKm: 44,
      },
      {
        weekNum: 11,
        phase: 3,
        label: "Minggu 11 (11 – 17 Jan 2027)",
        focus: "Fase 3: Puncak Fondasi 1 Jam Penuh MTB Zone 2 (60m)",
        isDeload: false,
        minTargetKm: 48,
      },
      {
        weekNum: 12,
        phase: 3,
        label: "Minggu 12 (18 – 24 Jan 2027)",
        focus: "Fase 3: Deload Week 2 & Konsolidasi Akhir 12 Minggu",
        isDeload: true,
        minTargetKm: 32,
      },
    ];

    const weeks: CalendarWeek[] = [];

    for (let wIdx = 0; wIdx < weekConfigs.length; wIdx++) {
      const conf = weekConfigs[wIdx];
      const days: CalendarDay[] = [];
      let totalDist = 0;
      let cyclingDist = 0;
      let runningDist = 0;
      let totalDur = 0;

      // Base date: Monday, Nov 02, 2026
      const baseStart = new Date(2026, 10, 2 + wIdx * 7);

      for (let d = 0; d < 7; d++) {
        const curDate = new Date(baseStart.getFullYear(), baseStart.getMonth(), baseStart.getDate() + d);
        const y = curDate.getFullYear();
        const m = String(curDate.getMonth() + 1).padStart(2, "0");
        const dayNumber = curDate.getDate();
        const dateStr = `${y}-${m}-${String(dayNumber).padStart(2, "0")}`;
        const monthName = SHORT_MONTH_NAMES[curDate.getMonth()];

        const dayWorkouts = initialWorkouts.filter((wo) => {
          const wDate = (wo.scheduled_date || "").slice(0, 10);
          const matchDate = wDate === dateStr;
          if (!matchDate) return false;
          if (filter === "RUNNING") return isRunningCategory(wo.workout_category);
          if (filter === "CYCLING") return wo.workout_category === "Cycling";
          if (filter === "REHAB")
            return wo.workout_category === "Cross Training" || wo.workout_category === "Strength Training";
          if (filter === "COMPLETED") return wo.status === "COMPLETED";
          return true;
        });

        for (const wo of dayWorkouts) {
          const dist = Number(wo.target_distance_meters || 0);
          totalDist += dist;
          if (isRunningCategory(wo.workout_category)) {
            runningDist += dist;
          } else if (wo.workout_category === "Cycling") {
            cyclingDist += dist;
          }
          totalDur += Number(wo.target_duration_seconds || 0);
        }

        days.push({
          dateStr,
          dayNumber,
          monthName,
          dayOfWeek: d,
          dayName: FULL_DAY_NAMES[d],
          isToday: dateStr === todayStr,
          workouts: dayWorkouts,
        });
      }

      const minDistanceMeters = conf.minTargetKm * 1000;
      const targetAchievedPct = Math.round((totalDist / minDistanceMeters) * 100);

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
        totalDistanceMeters: totalDist,
        cyclingDistanceMeters: cyclingDist,
        runningDistanceMeters: runningDist,
        totalDurationSeconds: totalDur,
        targetAchievedPct,
      });
    }

    return weeks;
  };

  const allWeeks = buildCalendarWeeks();

  // Filter weeks by phase
  const displayedWeeks = allWeeks.filter((w) => {
    if (selectedPhase === "PHASE_1") return w.phaseNumber === 1;
    if (selectedPhase === "PHASE_2") return w.phaseNumber === 2;
    if (selectedPhase === "PHASE_3") return w.phaseNumber === 3;
    return true;
  });

  const selectedMatch = selectedWorkout
    ? matches.find((m) => m.workout_id === selectedWorkout.id)
    : null;

  return (
    <div className="space-y-6">
      {/* 1. Header Strip: Active 12-Week Plan & Macro Calibration */}
      <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#161922] border border-[#2D3547] flex items-center justify-center text-[#D4FF00]">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm uppercase tracking-wider font-bold text-[#F0F2F5]">
                  {initialPlan?.title || "Program Periodisasi 12-Minggu Zone 2 Endurance"}
                </h1>
                <span className="text-[9px] px-2 py-0.5 rounded-sm bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold">
                  ACTIVE 12-WEEK MACROCYCLE
                </span>
              </div>
              <span className="text-[11px] text-[#5A6272] block">
                Roadmap 3 Bulan • MTB Zone 2 (RPE 3–4) • 3 Sesi/Minggu • Puasa Senin & Kamis Terproteksi
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Calendar Grid vs List */}
          <div className="flex items-center p-0.5 rounded-sm bg-[#161922] border border-[#1F2430] text-xs">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-2.5 py-1 rounded-sm flex items-center gap-1.5 transition-all ${
                viewMode === "calendar"
                  ? "bg-[#1C212E] text-[#D4FF00] font-bold shadow-sm"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Kalender Grid</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1 rounded-sm flex items-center gap-1.5 transition-all ${
                viewMode === "list"
                  ? "bg-[#1C212E] text-[#00F0FF] font-bold shadow-sm"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daftar Sesi</span>
            </button>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="px-3 py-1.5 rounded-sm bg-[#D4FF00]/15 border border-[#D4FF00]/40 text-[#D4FF00] hover:bg-[#D4FF00]/25 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>{isRegenerating ? "MENGALIBRASI..." : "SINKRONISASI ULANG"}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-sm bg-[#161922] border border-[#D4FF00]/40 text-xs font-mono text-[#D4FF00]">
          {message}
        </div>
      )}

      {/* 2. Macro Objectives Progress Bar Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {/* Road to 100km Century Ride */}
        <div className="p-3 rounded-sm bg-[#12151D] border border-[#1F2430] border-l-2 border-l-[#00F0FF] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#F0F2F5] flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-[#00F0FF]" />
              Road to 100 km Century
            </span>
            <span className="text-[#00F0FF] font-bold">56.1%</span>
          </div>
          <div className="w-full h-1.5 bg-[#090A0F] rounded-none overflow-hidden border border-[#1F2430]">
            <div className="h-full bg-[#00F0FF]" style={{ width: "56.1%" }} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#5A6272]">
            <span>Rekor Bebas Nyeri: <strong className="text-[#9BA3AF]">56.10 km</strong></span>
            <span>Target: <strong className="text-[#F0F2F5]">100 km MTB</strong></span>
          </div>
        </div>

        {/* Marathon Pathway */}
        <div className="p-3 rounded-sm bg-[#12151D] border border-[#1F2430] border-l-2 border-l-[#D4FF00] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#F0F2F5] flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-[#D4FF00]" />
              Jalur Maraton 10–20K
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30 font-bold">
              29.2%
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#090A0F] rounded-none overflow-hidden border border-[#1F2430]">
            <div className="h-full bg-[#D4FF00]" style={{ width: "29.2%" }} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#5A6272]">
            <span>Lari Dasar: <strong className="text-[#9BA3AF]">12.33 km</strong></span>
            <span>Tahap: <strong className="text-white">Return-to-Run</strong></span>
          </div>
        </div>

        {/* Weekly Minimum Mileage Target Progress */}
        <div className="p-3 rounded-sm bg-[#12151D] border border-[#1F2430] border-l-2 border-l-[#10B981] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#F0F2F5] flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#10B981]" />
              Intensitas Zone 2 (RPE 3–4)
            </span>
            <span className="text-[#10B981] font-bold">Talk Test</span>
          </div>
          <div className="w-full h-1.5 bg-[#090A0F] rounded-none overflow-hidden border border-[#1F2430]">
            <div className="h-full bg-[#10B981]" style={{ width: "100%" }} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#5A6272]">
            <span>Kayuhan: <strong className="text-white">Ringan & Stabil</strong></span>
            <span>Sensor: <strong className="text-[#9BA3AF]">Tanpa HRM</strong></span>
          </div>
        </div>

        {/* Fasting Routine Compliance */}
        <div className="p-3 rounded-sm bg-[#12151D] border border-[#1F2430] border-l-2 border-l-[#A855F7] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#F0F2F5] flex items-center gap-1.5">
              <span className="text-xs">🌙</span>
              Jadwal Puasa Sunnah
            </span>
            <span className="text-[#D8B4FE] font-bold">100% Selaras</span>
          </div>
          <div className="w-full h-1.5 bg-[#090A0F] rounded-none overflow-hidden border border-[#1F2430]">
            <div className="h-full bg-[#A855F7]" style={{ width: "100%" }} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#5A6272]">
            <span>Puasa: <strong className="text-[#D8B4FE]">Senin & Kamis</strong></span>
            <span>Latihan: <strong className="text-[#00F0FF]">Sel, Rab, Jum, Min</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Zone 2 Endurance Pacing & Parameter Guide Banner */}
      <div className="p-4 rounded-sm bg-[#12151D] border border-[#2D3547] font-mono space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2.5 border-b border-[#1F2430]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#D4FF00]" />
            <h2 className="text-xs uppercase font-bold text-[#F0F2F5]">
              Pedoman Pelatih: Parameter Latihan Zone 2 Tanpa Heart-Rate Monitor (MTB)
            </h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
            SOP LATIHAN RESMI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1">
            <span className="text-[9px] uppercase font-bold text-[#D4FF00] block">Patokan Intensitas (RPE)</span>
            <p className="text-[#F0F2F5] font-bold text-xs">RPE 3–4 dari 10 (Easy/Zone 2)</p>
            <p className="text-[10px] text-[#9BA3AF] leading-tight">
              Beban relatif ringan. Pernapasan stabil terkendali. Jangan mengejar kecepatan di speedometer.
            </p>
          </div>

          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1">
            <span className="text-[9px] uppercase font-bold text-[#00F0FF] block">Talk Test Kunci</span>
            <p className="text-[#F0F2F5] font-bold text-xs">Bisa Bicara Kalimat Lengkap</p>
            <p className="text-[10px] text-[#9BA3AF] leading-tight">
              Dapat mengobrol tanpa terputus-putus. Jika mulai terengah-engah, segera turunkan gigi dan kayuhan.
            </p>
          </div>

          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1">
            <span className="text-[9px] uppercase font-bold text-[#FF9500] block">Teknis Sepeda MTB</span>
            <p className="text-[#F0F2F5] font-bold text-xs">Jalur Datar & Kayuhan Ringan</p>
            <p className="text-[10px] text-[#9BA3AF] leading-tight">
              Pilih gigi ringan dengan kadens stabil (85+ RPM). Hindari tanjakan bertorsi tinggi untuk melindungi sendi.
            </p>
          </div>

          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1">
            <span className="text-[9px] uppercase font-bold text-[#A855F7] block">Proteksi Cedera & Puasa</span>
            <p className="text-[#F0F2F5] font-bold text-xs">Senin & Kamis Istirahat Penuh</p>
            <p className="text-[10px] text-[#9BA3AF] leading-tight">
              Ankle kanan & kedua lutut berstatus conditional. Hentikan latihan jika muncul rasa nyeri tajam atau bengkak.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Phase Switcher (12-Week Periodization Tabs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-sm bg-[#12151D] border border-[#1F2430] font-mono text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-[#5A6272] px-2 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-[#5A6272]" />
            FASE:
          </span>
          <button
            onClick={() => setSelectedPhase("ALL")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold ${
              selectedPhase === "ALL"
                ? "bg-[#1C212E] text-white border border-[#2D3547]"
                : "text-[#9BA3AF] hover:text-white"
            }`}
          >
            Semua (12 Minggu)
          </button>
          <button
            onClick={() => setSelectedPhase("PHASE_1")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold ${
              selectedPhase === "PHASE_1"
                ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30"
                : "text-[#9BA3AF] hover:text-[#00F0FF]"
            }`}
          >
            Fase 1: Fondasi Awal (M1–4)
          </button>
          <button
            onClick={() => setSelectedPhase("PHASE_2")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold ${
              selectedPhase === "PHASE_2"
                ? "bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30"
                : "text-[#9BA3AF] hover:text-[#D4FF00]"
            }`}
          >
            Fase 2: Endurance Base (M5–8)
          </button>
          <button
            onClick={() => setSelectedPhase("PHASE_3")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold ${
              selectedPhase === "PHASE_3"
                ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                : "text-[#9BA3AF] hover:text-[#10B981]"
            }`}
          >
            Fase 3: Spesifisitas Zone 2 (M9–12)
          </button>
        </div>

        <div className="text-[10px] text-[#5A6272] pr-2">
          <span>Menampilkan: <strong>{displayedWeeks.length} Minggu Siklus</strong></span>
        </div>
      </div>

      {/* 5. Sport Type Filter Segment Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-sm bg-[#12151D] border border-[#1F2430] font-mono text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold ${
              filter === "ALL"
                ? "bg-[#1C212E] text-white border border-[#2D3547]"
                : "text-[#9BA3AF] hover:text-white"
            }`}
          >
            Semua Sesi ({initialWorkouts.length})
          </button>
          <button
            onClick={() => setFilter("CYCLING")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold flex items-center gap-1.5 ${
              filter === "CYCLING"
                ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30"
                : "text-[#9BA3AF] hover:text-[#00F0FF]"
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Sepeda MTB ({cyclingCount})</span>
          </button>
          <button
            onClick={() => setFilter("RUNNING")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold flex items-center gap-1.5 ${
              filter === "RUNNING"
                ? "bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30"
                : "text-[#9BA3AF] hover:text-[#D4FF00]"
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Lari Bertahap ({runningCount})</span>
          </button>
          <button
            onClick={() => setFilter("REHAB")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold flex items-center gap-1.5 ${
              filter === "REHAB"
                ? "bg-[#FF9500]/15 text-[#FF9500] border border-[#FF9500]/30"
                : "text-[#9BA3AF] hover:text-[#FF9500]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Rehab & Tubuh Atas ({rehabCount})</span>
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold flex items-center gap-1.5 ${
              filter === "COMPLETED"
                ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                : "text-[#9BA3AF] hover:text-[#10B981]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terverifikasi Strava ({completedCount})</span>
          </button>
        </div>

        <div className="text-[10px] text-[#5A6272] pr-2">
          <span>Menampilkan: <strong>{filteredWorkouts.length} Sesi Terdaftar</strong></span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 6. CALENDAR MATRIX VIEW (PREMIUM ATHLETIC PERIODIZATION GRID)        */}
      {/* ===================================================================== */}
      {viewMode === "calendar" ? (
        <div className="space-y-6 font-mono">
          {/* Day Names Header Row (Mon - Sun) */}
          <div className="hidden md:grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#9BA3AF] pb-1 border-b border-[#1F2430]">
            <div className="text-[#C084FC] flex items-center justify-center gap-1">
              <span>🌙 SENIN</span>
              <span className="text-[8.5px] font-normal text-[#A855F7]">(PUASA)</span>
            </div>
            <div className="text-[#00F0FF] flex items-center justify-center gap-1">
              <span>SELASA</span>
              <span className="text-[8.5px] font-normal text-[#00F0FF]/80">(EASY MTB)</span>
            </div>
            <div className="text-[#FF9500] flex items-center justify-center gap-1">
              <span>RABU</span>
              <span className="text-[8.5px] font-normal text-[#FF9500]/80">(OPSI/REHAB)</span>
            </div>
            <div className="text-[#C084FC] flex items-center justify-center gap-1">
              <span>🌙 KAMIS</span>
              <span className="text-[8.5px] font-normal text-[#A855F7]">(PUASA)</span>
            </div>
            <div className="text-[#D4FF00] flex items-center justify-center gap-1">
              <span>JUMAT</span>
              <span className="text-[8.5px] font-normal text-[#D4FF00]/80">(RECOVERY)</span>
            </div>
            <div className="text-[#9BA3AF] flex items-center justify-center gap-1">
              <span>SABTU</span>
              <span className="text-[8.5px] font-normal text-[#D4FF00]/70">(BUFFER)</span>
            </div>
            <div className="text-[#00F0FF] flex items-center justify-center gap-1">
              <span>MINGGU</span>
              <span className="text-[8.5px] font-normal text-[#00F0FF]/80">(LONG MTB)</span>
            </div>
          </div>

          {/* Weeks Loop */}
          {displayedWeeks.map((week) => (
            <div
              key={week.weekNumber}
              className={`p-3.5 rounded-sm bg-[#12151D] border space-y-3 shadow-sm transition-all ${
                week.isDeload
                  ? "border-[#A855F7]/40 bg-[#141221]"
                  : "border-[#1F2430]"
              }`}
            >
              {/* Week Row Header: Number, Date Range, Minimum Target Mileage, Volume Breakdown */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#1F2430]/70">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-none ${
                        week.isDeload ? "bg-[#A855F7]" : "bg-[#D4FF00]"
                      }`}
                    />
                    <span className="text-xs font-bold uppercase text-[#F0F2F5]">
                      {week.weekLabel}
                    </span>
                    <span className="text-[10px] text-[#00F0FF] px-1.5 py-0.2 rounded-sm bg-[#00F0FF]/10 border border-[#00F0FF]/30">
                      {week.focusTitle}
                    </span>
                    {week.isDeload && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-[#A855F7]/20 text-[#D8B4FE] border border-[#A855F7]/40">
                        DELOAD WEEK (SUPERKOMPENSASI)
                      </span>
                    )}
                    {week.totalDistanceMeters >= week.minDistanceMeters ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                        ✓ TARGET TERCAPAI ({week.targetAchievedPct}%)
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-[#FF9500]/15 text-[#FF9500] border border-[#FF9500]/30">
                        TARGET PROGRES ({week.targetAchievedPct}%)
                      </span>
                    )}
                  </div>

                  {/* Weekly Mileage Target vs Scheduled Breakdown */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-[#9BA3AF]">
                    <span>
                      Target Minimal: <strong className="text-white font-bold">{week.minTargetKm} km</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Total Terjadwal: <strong className="text-[#D4FF00] font-bold">{(week.totalDistanceMeters / 1000).toFixed(1)} km</strong>
                    </span>
                    <span>•</span>
                    <span className="text-[#5A6272]">
                      (Sepeda MTB: <strong className="text-[#00F0FF]">{(week.cyclingDistanceMeters / 1000).toFixed(1)} km</strong>
                      {week.runningDistanceMeters > 0 && (
                        <> • Lari: <strong className="text-[#D4FF00]">{(week.runningDistanceMeters / 1000).toFixed(1)} km</strong></>
                      )})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  {/* Mini Progress Bar for Weekly Target Mileage */}
                  <div className="space-y-1 text-right">
                    <div className="flex items-center justify-between gap-3 text-[9.5px] text-[#5A6272]">
                      <span>Progres Jarak:</span>
                      <span className="font-bold text-white">{(week.totalDistanceMeters / 1000).toFixed(1)} / {week.minTargetKm} km</span>
                    </div>
                    <div className="w-32 h-1.5 bg-[#090A0F] border border-[#1F2430] overflow-hidden">
                      <div
                        className={`h-full ${
                          week.isDeload
                            ? "bg-[#A855F7]"
                            : week.targetAchievedPct >= 100
                            ? "bg-[#D4FF00]"
                            : "bg-[#00F0FF]"
                        }`}
                        style={{ width: `${Math.min(100, week.targetAchievedPct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-[#5A6272] pl-2 border-l border-[#1F2430]">
                    <span>Durasi: <strong className="text-[#F0F2F5]">{formatDuration(week.totalDurationSeconds)}</strong></span>
                  </div>
                </div>
              </div>

              {/* 7 Days Grid for this week */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2">
                {week.days.map((day) => {
                  const hasWorkouts = day.workouts.length > 0;
                  const isFastingDay = day.dayOfWeek === 0 || day.dayOfWeek === 3; // Senin or Kamis
                  const isSaturday = day.dayOfWeek === 5; // Sabtu

                  return (
                    <div
                      key={day.dateStr}
                      className={`min-h-[155px] p-2 rounded-sm flex flex-col justify-between transition-all ${
                        day.isToday
                          ? "bg-[#161922] border-2 border-[#D4FF00] shadow-md shadow-[#D4FF00]/5"
                          : isFastingDay
                          ? "bg-[#151221]/70 border border-[#A855F7]/25"
                          : isSaturday
                          ? "bg-[#12151D] border border-[#2D3547]/50"
                          : hasWorkouts
                          ? "bg-[#161922] border border-[#1F2430] hover:border-[#2D3547]"
                          : "bg-[#0E1017] border border-[#1F2430]/40 opacity-75"
                      }`}
                    >
                      {/* Day Header (Date & Today Badge) */}
                      <div className="flex items-center justify-between pb-1 border-b border-[#1F2430]/40 text-[10px]">
                        <span className={`md:hidden font-bold ${isFastingDay ? "text-[#D8B4FE]" : "text-[#9BA3AF]"}`}>
                          {day.dayName}
                        </span>
                        <div className="flex items-center gap-1">
                          {day.isToday && (
                            <span className="px-1 py-0.1 rounded-sm bg-[#D4FF00] text-[#090A0F] font-black text-[8px]">
                              TODAY
                            </span>
                          )}
                          <span className={`font-bold ${day.isToday ? "text-[#D4FF00]" : isFastingDay ? "text-[#D8B4FE]" : "text-[#F0F2F5]"}`}>
                            {day.dayNumber} {day.monthName}
                          </span>
                        </div>
                      </div>

                      {/* Day Content: Workouts / Fasting / Saturday Buffer / Rest */}
                      <div className="py-1.5 flex-1 space-y-1.5">
                        {hasWorkouts ? (
                          day.workouts.map((w) => {
                            const isRun = isRunningCategory(w.workout_category);
                            const isCycling = w.workout_category === "Cycling";
                            const isCompleted = w.status === "COMPLETED";

                            return (
                              <button
                                key={w.id}
                                onClick={() => setSelectedWorkout(w)}
                                className={`w-full text-left p-2 rounded-sm border transition-all space-y-1 block ${
                                  isCompleted
                                    ? "bg-[#10B981]/10 border-[#10B981]/40 hover:border-[#10B981]"
                                    : isRun
                                    ? "bg-[#D4FF00]/10 border-[#D4FF00]/40 hover:border-[#D4FF00]"
                                    : isCycling
                                    ? "bg-[#00F0FF]/10 border-[#00F0FF]/30 hover:border-[#00F0FF]"
                                    : "bg-[#FF9500]/10 border-[#FF9500]/30 hover:border-[#FF9500]"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-[8px] font-black uppercase px-1 py-0.2 rounded-sm ${
                                      isRun
                                        ? "bg-[#D4FF00]/25 text-[#D4FF00]"
                                        : isCycling
                                        ? "bg-[#00F0FF]/20 text-[#00F0FF]"
                                        : "bg-[#FF9500]/20 text-[#FF9500]"
                                    }`}
                                  >
                                    {isRun ? "LARI BERTAHAP" : isCycling ? "EASY MTB" : "UPPER/REHAB"}
                                  </span>

                                  {isCompleted && (
                                    <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                                  )}
                                </div>

                                <div className="font-bold text-[11px] text-[#F0F2F5] leading-tight">
                                  {w.target_duration_seconds
                                    ? formatDuration(w.target_duration_seconds)
                                    : w.target_distance_meters
                                    ? formatDistance(w.target_distance_meters)
                                    : "--"}
                                </div>

                                <div className="text-[8px] text-[#9BA3AF] truncate">
                                  {w.target_intensity || "Zone 2 • RPE 3–4"}
                                </div>
                              </button>
                            );
                          })
                        ) : isFastingDay ? (
                          /* Dedicated Fasting Card (Senin & Kamis) */
                          <div className="h-full flex flex-col items-center justify-center py-2.5 text-center px-1 rounded-sm bg-[#A855F7]/10 border border-[#A855F7]/25 space-y-0.5">
                            <span className="text-sm leading-none">🌙</span>
                            <span className="text-[10px] font-bold text-[#D8B4FE] tracking-wide">Puasa Sunnah</span>
                            <span className="text-[8px] text-[#C084FC]/90">Istirahat Penuh</span>
                            <span className="text-[7.5px] text-[#9BA3AF]">
                              {day.dayOfWeek === 0 ? "Regenerasi Glikogen" : "Pemulihan Tubuh"}
                            </span>
                          </div>
                        ) : isSaturday ? (
                          /* Dedicated Saturday Buffer Card */
                          <div className="h-full flex flex-col justify-between p-1.5 rounded-sm bg-[#161922]/70 border border-[#2D3547]/60 hover:border-[#D4FF00]/40 transition-all text-left">
                            <div>
                              <div className="flex items-center justify-between text-[8px] pb-0.5 border-b border-[#1F2430]/60">
                                <span className="font-bold text-[#9BA3AF]">SABTU BUFFER</span>
                                <span className="px-1 py-0.2 rounded-sm bg-[#D4FF00]/10 text-[#D4FF00] font-black text-[7px]">
                                  OPSIONAL
                                </span>
                              </div>
                              <div className="my-1 space-y-0.5">
                                <div className="text-[9.5px] font-bold text-[#F0F2F5] leading-tight flex items-center gap-1">
                                  <Zap className="w-2.5 h-2.5 text-[#D4FF00]" />
                                  Buffer Mingguan
                                </div>
                                <p className="text-[7.5px] text-[#9BA3AF] leading-tight">
                                  Slot cadangan: Recovery spin ringan jika target ({week.minTargetKm} km) belum tercapai.
                                </p>
                              </div>
                            </div>
                            <div className="pt-0.5 border-t border-[#1F2430]/40 flex items-center justify-between text-[7px] text-[#5A6272]">
                              <span>RPE 1–2</span>
                              <span className="text-[#D4FF00]">Persiapan Minggu</span>
                            </div>
                          </div>
                        ) : (
                          /* Other Rest Days */
                          <div className="h-full flex flex-col items-center justify-center py-3 text-center text-[10px] text-[#5A6272]">
                            <Heart className="w-3.5 h-3.5 text-[#3A404D] mb-1" />
                            <span>Jeda Pemulihan</span>
                            <span className="text-[8px] text-[#3A404D]">Proteksi Sendi</span>
                          </div>
                        )}
                      </div>

                      {/* Day Footer Subtext */}
                      <div className="pt-1 border-t border-[#1F2430]/30 text-[8.5px] text-[#5A6272] text-right">
                        {hasWorkouts ? (
                          <span
                            className="text-[#00F0FF] hover:underline cursor-pointer font-semibold"
                            onClick={() => setSelectedWorkout(day.workouts[0])}
                          >
                            Detail Sesi ↗
                          </span>
                        ) : isFastingDay ? (
                          <span className="text-[#A855F7] font-semibold flex items-center justify-end gap-1">
                            <span>🌙</span> Puasa Sunnah
                          </span>
                        ) : isSaturday ? (
                          <span className="text-[#D4FF00]/80 font-semibold">Slot Buffer</span>
                        ) : (
                          <span>Istirahat</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ===================================================================== */
        /* 7. LINEAR LIST VIEW (FOR DETAILED PRESCRIPTION INSPECTION)            */
        /* ===================================================================== */
        <div className="space-y-3 font-mono">
          {filteredWorkouts.map((wo) => {
            const isRun = isRunningCategory(wo.workout_category);
            const isCycling = wo.workout_category === "Cycling";
            const isCross = wo.workout_category === "Cross Training" || wo.workout_category === "Strength Training";
            const isCompleted = wo.status === "COMPLETED";

            return (
              <div
                key={wo.id}
                onClick={() => setSelectedWorkout(wo)}
                className={`p-4 rounded-sm bg-[#12151D] border cursor-pointer transition-all ${
                  isCompleted
                    ? "border-[#10B981]/40 hover:border-[#10B981]"
                    : isRun
                    ? "border-[#D4FF00]/40 hover:border-[#D4FF00]"
                    : isCycling
                    ? "border-[#00F0FF]/30 hover:border-[#00F0FF]"
                    : "border-[#1F2430] hover:border-[#2D3547]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1F2430]/60">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border ${
                        isRun
                          ? "bg-[#D4FF00]/10 text-[#D4FF00] border-[#D4FF00]/30"
                          : isCycling
                          ? "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30"
                          : isCross
                          ? "bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/30"
                          : "bg-[#161922] text-[#9BA3AF] border-[#1F2430]"
                      }`}
                    >
                      {wo.workout_category}
                    </span>

                    <span className="text-xs font-bold text-[#F0F2F5]">
                      {formatDate(wo.scheduled_date)}
                    </span>

                    <span className="text-[10px] text-[#5A6272]">
                      • {wo.target_intensity || "Zone 2 • RPE 3–4"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${
                        isCompleted
                          ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
                          : "bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/30"
                      }`}
                    >
                      {isCompleted ? "VERIFIED COMPLETED" : "PLANNED"}
                    </span>

                    <div className="text-right">
                      <span className="text-sm font-bold font-tabular text-[#F0F2F5]">
                        {wo.target_duration_seconds
                          ? formatDuration(wo.target_duration_seconds)
                          : wo.target_distance_meters
                          ? formatDistance(wo.target_distance_meters)
                          : "--"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 text-xs text-[#9BA3AF] space-y-1">
                  <p className="leading-relaxed">{wo.description}</p>
                  {wo.target_duration_seconds && wo.target_distance_meters && (
                    <div className="flex items-center gap-4 text-[10px] text-[#5A6272] pt-1">
                      <span>Target Durasi: <strong>{formatDuration(wo.target_duration_seconds)}</strong></span>
                      <span>Target Jarak Estimasi: <strong>{formatDistance(wo.target_distance_meters)}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 8. WORKOUT DETAIL MODAL (PRECISION PRESCRIPTION DOSSIER)               */}
      {/* ===================================================================== */}
      {selectedWorkout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#12151D] border border-[#2D3547] rounded-sm p-5 space-y-4 font-mono shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2430]">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-none ${
                    isRunningCategory(selectedWorkout.workout_category)
                      ? "bg-[#D4FF00]"
                      : selectedWorkout.workout_category === "Cycling"
                      ? "bg-[#00F0FF]"
                      : "bg-[#FF9500]"
                  }`}
                />
                <h3 className="text-sm font-bold text-[#F0F2F5] uppercase">
                  Dossier Sesi: {selectedWorkout.workout_category}
                </h3>
              </div>
              <button
                onClick={() => setSelectedWorkout(null)}
                className="w-6 h-6 rounded-sm bg-[#161922] border border-[#1F2430] flex items-center justify-center text-[#9BA3AF] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Prescribed Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
                <span className="text-[9px] text-[#5A6272] block uppercase">Tanggal Jadwal</span>
                <span className="text-xs font-bold text-[#F0F2F5]">{formatDate(selectedWorkout.scheduled_date)}</span>
              </div>
              <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
                <span className="text-[9px] text-[#5A6272] block uppercase">Target Durasi</span>
                <span className="text-xs font-bold text-[#D4FF00]">
                  {selectedWorkout.target_duration_seconds
                    ? formatDuration(selectedWorkout.target_duration_seconds)
                    : "--"}
                </span>
              </div>
              <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
                <span className="text-[9px] text-[#5A6272] block uppercase">Estimasi Jarak</span>
                <span className="text-xs font-bold text-[#00F0FF]">
                  {selectedWorkout.target_distance_meters
                    ? formatDistance(selectedWorkout.target_distance_meters)
                    : "--"}
                </span>
              </div>
            </div>

            {/* Intensity & Directives */}
            <div className="p-3 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1.5 text-xs">
              <span className="text-[10px] text-[#5A6272] uppercase block">Target Intensitas & Talk Test</span>
              <p className="text-[#00F0FF] font-semibold">{selectedWorkout.target_intensity || "Zone 2 • RPE 3–4/10"}</p>
              <p className="text-[11px] text-[#9BA3AF] leading-relaxed pt-1">
                {selectedWorkout.description}
              </p>
            </div>

            {/* Talk Test & Pacing Instructions */}
            <div className="p-2.5 rounded-sm bg-[#090A0F] border border-[#00F0FF]/30 space-y-1 text-[10px] text-[#9BA3AF]">
              <span className="font-bold text-[#00F0FF] flex items-center gap-1.5">
                <Gauge className="w-3 h-3 text-[#00F0FF]" />
                Pedoman Pacing Zone 2 (Tanpa Heart-Rate Monitor)
              </span>
              <p className="leading-snug">
                Pertahankan ritme di mana Anda masih bisa berbicara dalam kalimat lengkap tanpa terputus. Jika napas mulai berat, segera pindahkan gigi ke rasio yang lebih ringan.
              </p>
            </div>

            {/* Safety & Joint Alignment Notice */}
            <div className="p-2.5 rounded-sm bg-[#090A0F] border border-[#FF2A6D]/30 flex items-start gap-2 text-[10px] text-[#9BA3AF]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FF2A6D] shrink-0 mt-0.5" />
              <span>
                <strong>Instruksi Keamanan Sendi:</strong>{" "}
                {isRunningCategory(selectedWorkout.workout_category)
                  ? "Sesi lari bertahap (Walk/Jog). Gunakan permukaan datar halus atau treadmill. Hentikan seketika jika timbul nyeri tajam pada pergelangan kaki kanan atau tempurung lutut bilateral."
                  : "Beban putaran tertutup tanpa hentakan. Gunakan gigi ringan pada jalur datar. Hindari tanjakan bertorsi tinggi untuk mencegah kompresi berlebih pada lutut."}
              </span>
            </div>

            {/* If matched with real Strava session */}
            {selectedMatch && (
              <div className="p-2.5 rounded-sm bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#10B981] space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Terverifikasi Sesi Strava Nyata:</span>
                  <span>{selectedMatch.completion_percentage}% Selesai</span>
                </div>
                <p className="text-[10px] text-[#9BA3AF]">
                  Sesi tuntas tercatat di database dengan kepatuhan penuh terhadap target.
                </p>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-2 border-t border-[#1F2430]">
              <button
                onClick={() => setSelectedWorkout(null)}
                className="px-4 py-1.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#D4FF00] text-xs font-semibold text-[#F0F2F5] transition-colors"
              >
                Tutup Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
