"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Target,
  Bike,
  Footprints,
  Calendar,
  Trophy,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  Check,
  RotateCcw,
} from "lucide-react";
import { FitnessGoal, Activity, TrainingPlan } from "@/types";

interface GoalsManagementHubProps {
  initialGoals: FitnessGoal[];
  activities: Activity[];
  activePlan: TrainingPlan | null;
  healthContext: any;
}

interface ProgressionTemplate {
  id: string;
  title: string;
  sport: "Ride" | "Run" | "All";
  tier: number;
  targetValue: number;
  unit: string;
  durationWeeks: number;
  description: string;
  safetyProtocol: string;
  focusArea: string;
  tag: string;
}

// Sport-science progressive unlocks when primary milestones are reached
const CYCLING_PROGRESSION_TEMPLATES: ProgressionTemplate[] = [
  {
    id: "prog-cycling-next-100",
    title: "Siklus Kedua: Akumulasi Tambahan +100 km (Total 200 km)",
    sport: "Ride",
    tier: 2,
    targetValue: 200,
    unit: "km",
    durationWeeks: 4,
    description: "Mempertebal adaptasi kapiler aerobik dan efisiensi metabolik lipid dengan menambah blok 100 km kedua.",
    safetyProtocol: "Batas sesi ≤ 30-35 km, rute datar, kadens konstan 85-95 RPM.",
    focusArea: "Kapasitas Aerobik Jangka Menengah",
    tag: "VOLUME EXTENSION",
  },
  {
    id: "prog-cycling-gran-fondo",
    title: "Century Ride Lanjutan: Gran Fondo Metric 150 km",
    sport: "Ride",
    tier: 2,
    targetValue: 150,
    unit: "km",
    durationWeeks: 6,
    description: "Tonggak ketahanan jarak menengah terstruktur dengan pacing terkalibrasi di Zona 2 murni.",
    safetyProtocol: "Hidrasi berkala tiap 20 menit, posisi sadel ergonomis untuk lindungi tempurung lutut.",
    focusArea: "Gran Fondo Endurance",
    tag: "INTERMEDIATE MILESTONE",
  },
  {
    id: "prog-cycling-elevation",
    title: "Target Elevasi: Akumulasi Tanjakan 1.000m D+ (Climbing Base)",
    sport: "Ride",
    tier: 2,
    targetValue: 1000,
    unit: "m D+",
    durationWeeks: 6,
    description: "Meningkatkan daya tahan ambang otot tungkai melalui tanjakan landai terkontrol tanpa hentakan.",
    safetyProtocol: "Gunakan rasio gear ringan, kayuhan duduk (seated), dilarang sprint berdiri agresif.",
    focusArea: "Ambang Laktat & Muscular Endurance",
    tag: "CLIMBING MILESTONE",
  },
  {
    id: "prog-cycling-double-century",
    title: "Double Century Brevet: 200 km Endurance Block",
    sport: "Ride",
    tier: 3,
    targetValue: 200,
    unit: "km",
    durationWeeks: 8,
    description: "Tingkat ketahanan ultra-endurance lanjutan setelah fondasi 100 km pertama terbukti kokoh bebas cedera.",
    safetyProtocol: "Protokol pemulihan 48 jam pasca sesi panjang, kompres dingin jika timbul pegal sendi.",
    focusArea: "Ultra-Endurance Transition",
    tag: "ADVANCED BREVET",
  },
];

export function GoalsManagementHub({
  initialGoals,
  activities,
  activePlan,
  healthContext,
}: GoalsManagementHubProps) {
  // Goal state
  const [goals, setGoals] = useState<FitnessGoal[]>(initialGoals);
  const [filterSport, setFilterSport] = useState<"ALL" | "RIDE" | "RUN" | "FREQUENCY" | "ACHIEVED">("ALL");
  const [simulationMode100k, setSimulationMode100k] = useState(false);
  const [activatedSuccessId, setActivatedSuccessId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Custom Goal Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSport, setNewSport] = useState<"Ride" | "Run" | "All">("Ride");
  const [newTarget, setNewTarget] = useState("");
  const [newUnit, setNewUnit] = useState("km");
  const [newTargetDate, setNewTargetDate] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // Cycling total distance from authentic activities
  const authenticCyclingDistanceKm = useMemo(() => {
    return activities
      .filter((a) => a.sport_type === "Ride")
      .reduce((acc, a) => acc + Number(a.distance_meters || 0) / 1000, 0);
  }, [activities]);

  // Check if 100km Century Ride goal exists and whether it is completed
  const century100kGoal = useMemo(() => {
    return goals.find(
      (g) =>
        g.title.toLowerCase().includes("100") ||
        (Number(g.target_value) === 100 && g.unit === "km")
    );
  }, [goals]);

  const is100kAchieved = useMemo(() => {
    if (simulationMode100k) return true;
    if (!century100kGoal) return false;
    return (
      century100kGoal.is_achieved ||
      Number(century100kGoal.current_value) >= Number(century100kGoal.target_value)
    );
  }, [century100kGoal, simulationMode100k]);

  // Filtered goals
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      const isRide =
        g.title.toLowerCase().includes("ride") ||
        g.title.toLowerCase().includes("sepeda") ||
        g.title.toLowerCase().includes("century");
      const isRun =
        g.title.toLowerCase().includes("run") ||
        g.title.toLowerCase().includes("lari") ||
        g.title.toLowerCase().includes("marathon");
      const isFreq =
        g.goal_type === "FREQUENCY_WEEKLY" ||
        g.unit === "sessions" ||
        g.title.toLowerCase().includes("sesi");

      const isAchieved =
        g.is_achieved ||
        (g.id === century100kGoal?.id && simulationMode100k) ||
        Number(g.current_value) >= Number(g.target_value);

      if (filterSport === "RIDE") return isRide;
      if (filterSport === "RUN") return isRun;
      if (filterSport === "FREQUENCY") return isFreq;
      if (filterSport === "ACHIEVED") return isAchieved;
      return true;
    });
  }, [goals, filterSport, simulationMode100k, century100kGoal]);

  // Activate a progressive template target
  const handleActivateProgression = (template: ProgressionTemplate) => {
    const existing = goals.find((g) => g.title === template.title);
    if (existing) {
      setActivatedSuccessId(existing.id);
      setTimeout(() => setActivatedSuccessId(null), 3500);
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const targetDate = new Date(Date.now() + template.durationWeeks * 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const newGoal: FitnessGoal = {
      id: `prog-${Date.now()}`,
      user_id: "00000000-0000-0000-0000-000000000001",
      title: template.title,
      goal_type: "CUSTOM",
      target_value: template.targetValue,
      current_value: template.id.includes("next-100") ? 100 : 0,
      start_date: todayStr,
      target_date: targetDate,
      is_achieved: false,
      unit: template.unit,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setGoals((prev) => [newGoal, ...prev]);
    setActivatedSuccessId(newGoal.id);
    setTimeout(() => setActivatedSuccessId(null), 4000);
  };

  // Add custom goal
  const handleCreateCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTarget) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const created: FitnessGoal = {
      id: `custom-${Date.now()}`,
      user_id: "00000000-0000-0000-0000-000000000001",
      title: newTitle.trim(),
      goal_type: "CUSTOM",
      target_value: parseFloat(newTarget),
      current_value: 0,
      start_date: todayStr,
      target_date: newTargetDate,
      is_achieved: false,
      unit: newUnit,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setGoals((prev) => [created, ...prev]);
    setNewTitle("");
    setNewTarget("");
    setShowAddModal(false);
    setActivatedSuccessId(created.id);
    setTimeout(() => setActivatedSuccessId(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header & Navigation Telemetry Bar */}
      <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 uppercase tracking-wider">
                Progressive Milestone Engine
              </span>
              <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                Modul Sasaran Jangka Panjang & Adaptasi
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-sans tracking-tight text-[var(--color-text-primary)] flex items-center gap-2.5">
              <Target className="w-6 h-6 text-[var(--color-cycling)]" />
              <span>Sasaran &amp; Target Progresif Atlet</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 max-w-2xl">
              Sistem manajemen target berjenjang: saat tonggak utama tercapai, tingkat progesi berikutnya otomatis terbuka sesuai kapasitas kardiovaskular dan protokol sendi atlet.
            </p>
          </div>

          {/* Action buttons & Simulation Tester */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Interactive Simulation Switch for 100 km milestone testing */}
            <button
              onClick={() => setSimulationMode100k(!simulationMode100k)}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold transition-all border flex items-center gap-2 ${
                simulationMode100k
                  ? "bg-[var(--color-cycling)] text-[var(--color-canvas)] border-[var(--color-cycling)] shadow-xs"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]/80"
              }`}
              title="Aktifkan simulasi target 100 km terpenuhi untuk melihat aktivasi target lanjutan"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {simulationMode100k
                  ? "Simulasi 100 km: AKTIF (Tercapai)"
                  : "Uji Simulasi 100 km Tercapai"}
              </span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[var(--color-text-primary)] text-[var(--color-canvas)] text-xs font-mono font-bold hover:opacity-90 transition-all shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Sasaran Baru</span>
            </button>
          </div>
        </div>

        {/* Telemetry Numbers Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5">
          <div className="p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/70">
            <span className="text-[10px] font-mono uppercase text-[var(--color-text-muted)] block">
              Total Sasaran Aktif
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-mono font-black tabular-nums text-[var(--color-text-primary)]">
                {goals.length}
              </span>
              <span className="text-xs font-mono text-[var(--color-text-secondary)]">target</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/70">
            <span className="text-[10px] font-mono uppercase text-[var(--color-text-muted)] block">
              Tonggak Tercapai (Completed)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-mono font-black tabular-nums text-[var(--color-cycling)]">
                {goals.filter((g) => g.is_achieved || (g.id === century100kGoal?.id && simulationMode100k)).length}
              </span>
              <span className="text-xs font-mono text-[var(--color-text-secondary)]">selesai</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/70">
            <span className="text-[10px] font-mono uppercase text-[var(--color-text-muted)] block">
              Jarak Sepeda Terverifikasi
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-mono font-black tabular-nums text-[var(--color-text-primary)]">
                {simulationMode100k ? "100.0" : authenticCyclingDistanceKm.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-[var(--color-text-secondary)]">km</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/70">
            <span className="text-[10px] font-mono uppercase text-[var(--color-text-muted)] block">
              Status Sendi &amp; Keselamatan
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--color-cycling)]" />
              <span className="text-xs font-mono font-bold text-[var(--color-cycling)]">
                Beban Terkendali
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Banner when Goal is Activated */}
      {activatedSuccessId && (
        <div className="rounded-xl bg-[var(--color-cycling)]/15 border-2 border-[var(--color-cycling)] p-4 flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-cycling)] text-[var(--color-canvas)] flex items-center justify-center font-bold shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wide block">
                Target Progresif Berhasil Diaktifkan!
              </span>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Sasaran baru telah ditambahkan ke dalam telemetri aktif Anda. Sesi latihan berikutnya akan otomatis dikaitkan ke target ini.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivatedSuccessId(null)}
            className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. PROGRESSION ENGINE: Target Lanjutan Terbuka saat 100km Tercapai */}
      <section className="rounded-2xl bg-[var(--color-surface-card)] border-2 border-[var(--color-cycling)]/40 p-5 sm:p-6 space-y-5 shadow-xs relative overflow-hidden">
        {/* Subtle accent corner badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                  is100kAchieved
                    ? "bg-[var(--color-cycling)] text-[var(--color-canvas)]"
                    : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                }`}
              >
                {is100kAchieved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>TONGGAK 100 KM TERCAPAI • TINGKAT LANJUTAN TERBUKA</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
                    <span>PROGRESI BERIKUTNYA SIAP DIAKTIFKAN</span>
                  </>
                )}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold font-sans text-[var(--color-text-primary)] flex items-center gap-2">
              <Bike className="w-5 h-5 text-[var(--color-cycling)]" />
              <span>Target Lanjutan Sepeda (Cycling Progression Engine)</span>
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {is100kAchieved
                ? "Selamat! Target 100 km Century Ride pertama Anda telah terpenuhi. Pilih target sepeda lanjutan di bawah untuk melanjutkan progres tanpa risiko overtraining."
                : "Saat Anda menuntaskan target 100 km sepeda, sistem menyediakan pilihan target berjenjang berikut (dapat juga diaktifkan sekarang sebagai target jangka panjang):"}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[11px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] px-3 py-1.5 rounded-lg border border-[var(--color-border)] font-semibold">
              {CYCLING_PROGRESSION_TEMPLATES.length} Target Tersedia
            </span>
          </div>
        </div>

        {/* Progression Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CYCLING_PROGRESSION_TEMPLATES.map((tmpl) => {
            const isAlreadyActive = goals.some((g) => g.title === tmpl.title);

            return (
              <div
                key={tmpl.id}
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                  isAlreadyActive
                    ? "bg-[var(--color-surface-muted)]/40 border-[var(--color-cycling)]/60 shadow-xs"
                    : "bg-[var(--color-surface-muted)]/20 border-[var(--color-border)] hover:border-[var(--color-cycling)]/80 hover:bg-[var(--color-surface-muted)]/50"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-cycling)] border border-[var(--color-border)]">
                      {tmpl.tag} • TIER {tmpl.tier}
                    </span>
                    <span className="font-mono text-[11px] font-black text-[var(--color-text-primary)]">
                      {tmpl.targetValue} {tmpl.unit}
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-sm text-[var(--color-text-primary)] leading-snug">
                    {tmpl.title}
                  </h3>

                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {tmpl.description}
                  </p>

                  <div className="pt-1 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--color-text-muted)]">
                      <span className="font-semibold text-[var(--color-text-secondary)]">Fokus Latihan:</span>
                      <span>{tmpl.focusArea}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--color-cycling)]">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{tmpl.safetyProtocol}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                    Estimasi Siklus: {tmpl.durationWeeks} Minggu
                  </span>

                  {isAlreadyActive ? (
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--color-cycling)]/20 text-[var(--color-cycling)] border border-[var(--color-cycling)]/40 text-xs font-mono font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Sedang Aktif</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleActivateProgression(tmpl)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--color-cycling)] hover:opacity-90 text-[var(--color-canvas)] text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-95"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Aktifkan Target Ini</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Filter Navigation Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <button
            onClick={() => setFilterSport("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterSport === "ALL"
                ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Semua ({goals.length})
          </button>
          <button
            onClick={() => setFilterSport("RIDE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterSport === "RIDE"
                ? "bg-[var(--color-surface-card)] text-[var(--color-cycling)] border border-[var(--color-border)] shadow-xs font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Sepeda</span>
          </button>
          <button
            onClick={() => setFilterSport("RUN")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterSport === "RUN"
                ? "bg-[var(--color-surface-card)] text-[var(--color-running)] border border-[var(--color-border)] shadow-xs font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Lari</span>
          </button>
          <button
            onClick={() => setFilterSport("FREQUENCY")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterSport === "FREQUENCY"
                ? "bg-[var(--color-surface-card)] text-[var(--color-endurance)] border border-[var(--color-border)] shadow-xs font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Konsistensi</span>
          </button>
          <button
            onClick={() => setFilterSport("ACHIEVED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterSport === "ACHIEVED"
                ? "bg-[var(--color-surface-card)] text-[var(--color-cycling)] border border-[var(--color-border)] shadow-xs font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Tercapai</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
          Menampilkan {filteredGoals.length} dari {goals.length} sasaran
        </span>
      </div>

      {/* 4. Active Target Objectives Registry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredGoals.map((g) => {
          const is100k =
            g.title.toLowerCase().includes("100") ||
            (Number(g.target_value) === 100 && g.unit === "km");
          const isRide =
            g.title.toLowerCase().includes("ride") ||
            g.title.toLowerCase().includes("sepeda") ||
            is100k;
          const isRun =
            g.title.toLowerCase().includes("run") ||
            g.title.toLowerCase().includes("marathon") ||
            g.title.toLowerCase().includes("lari");

          const effectiveCurrent =
            is100k && simulationMode100k
              ? Number(g.target_value)
              : Number(g.current_value);
          const targetNum = Number(g.target_value);
          const pct = Math.min(100, Math.round((effectiveCurrent / targetNum) * 100));
          const isAchieved = g.is_achieved || pct >= 100;
          const deficit = Math.max(0, targetNum - effectiveCurrent);

          const colorToken = isRide
            ? "var(--color-cycling)"
            : isRun
            ? "var(--color-running)"
            : "var(--color-endurance)";

          return (
            <div
              key={g.id}
              className={`rounded-2xl bg-[var(--color-surface-card)] border p-5 space-y-4 shadow-xs transition-all duration-200 ${
                isAchieved
                  ? "border-[var(--color-cycling)]/60 bg-[var(--color-surface-card)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-border)]/90"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: colorToken }}
                    />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                      {isRide ? "SEPEDA (CYCLING)" : isRun ? "LARI (RUNNING)" : "KONSISTENSI MINGGUAN"}
                    </span>
                    {isAchieved && (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/40 text-[var(--color-cycling)] font-mono text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>TERCAPAI</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-sans font-bold text-base text-[var(--color-text-primary)]">
                    {g.title}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className="font-mono text-2xl font-black tabular-nums block leading-none"
                    style={{ color: isAchieved ? "var(--color-cycling)" : colorToken }}
                  >
                    {pct}%
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                    progres
                  </span>
                </div>
              </div>

              {/* Progress Bar with markers */}
              <div className="space-y-1.5">
                <div className="w-full h-2.5 bg-[var(--color-surface-muted)] rounded-full overflow-hidden border border-[var(--color-border)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: isAchieved ? "var(--color-cycling)" : colorToken,
                      width: `${pct}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-text-secondary)]">
                  <span>
                    Tercapai:{" "}
                    <strong className="text-[var(--color-text-primary)] tabular-nums font-bold">
                      {effectiveCurrent.toFixed(1)} {g.unit}
                    </strong>
                  </span>
                  <span>
                    Target:{" "}
                    <strong className="text-[var(--color-text-primary)] tabular-nums font-bold">
                      {targetNum.toFixed(1)} {g.unit}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Telemetry Breakdown Details */}
              <div className="p-3 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]/60 grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase block">
                    Defisit Jarak / Sisa
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)] tabular-nums">
                    {deficit === 0 ? "0.0 (Tuntas)" : `${deficit.toFixed(1)} ${g.unit}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase block">
                    Batas Waktu (Deadline)
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)]">
                    {g.target_date || "Fleksibel"}
                  </span>
                </div>
              </div>

              {/* Contextual Link to next tier if achieved */}
              {isAchieved && isRide && (
                <div className="p-2.5 rounded-lg bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/30 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-[var(--color-cycling)] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Target Lanjutan Siap Diaktifkan di Bagian Atas</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[var(--color-cycling)] underline">
                    Lihat Pilihan ↑
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. Modal Tambah Sasaran Kustom */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-sans font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2">
                <Target className="w-4 h-4 text-[var(--color-cycling)]" />
                <span>Buat Sasaran &amp; Target Baru</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                ✕ TUTUP
              </button>
            </div>

            <form onSubmit={handleCreateCustomGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[var(--color-text-secondary)] mb-1">
                  Nama Sasaran / Target
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Misal: Gran Fondo 150 km, Target 500 km Bulanan"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[var(--color-text-secondary)] mb-1">
                    Kategori Olahraga
                  </label>
                  <select
                    value={newSport}
                    onChange={(e: any) => setNewSport(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
                  >
                    <option value="Ride">Sepeda (Cycling)</option>
                    <option value="Run">Lari (Running)</option>
                    <option value="All">Multi-Sport / Gabungan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[var(--color-text-secondary)] mb-1">
                    Satuan Nilai
                  </label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
                  >
                    <option value="km">Kilometer (km)</option>
                    <option value="m D+">Elevasi (meter D+)</option>
                    <option value="sessions">Sesi Latihan (sessions)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[var(--color-text-secondary)] mb-1">
                    Target Nilai Angka
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="100"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[var(--color-text-secondary)] mb-1">
                    Target Batas Waktu
                  </label>
                  <input
                    type="date"
                    required
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-mono text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--color-cycling)] text-[var(--color-canvas)] text-xs font-mono font-bold hover:opacity-90 shadow-xs"
                >
                  Simpan Sasaran Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
