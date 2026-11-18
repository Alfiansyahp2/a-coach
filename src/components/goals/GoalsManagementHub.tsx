"use client";

import React, { useState, useMemo } from "react";
import { Check } from "lucide-react";
import { FitnessGoal, Activity, TrainingPlan } from "@/types";
import { CYCLING_PROGRESSION_TEMPLATES, ProgressionTemplate } from "./data/cyclingProgressionData";
import { GoalsTelemetrySummary } from "./telemetry/GoalsTelemetrySummary";
import { PrimaryGoalHeroSection } from "./hero/PrimaryGoalHeroSection";
import { GoalsProgressionDeck } from "./progression/GoalsProgressionDeck";
import { GoalsFilterTabs, GoalSportFilter } from "./registry/GoalsFilterTabs";
import { GoalRegistryCard } from "./registry/GoalRegistryCard";
import { CreateCustomGoalModal } from "./modal/CreateCustomGoalModal";

interface GoalsManagementHubProps {
  initialGoals: FitnessGoal[];
  activities: Activity[];
  activePlan: TrainingPlan | null;
  healthContext: any;
}

export function GoalsManagementHub({
  initialGoals,
  activities,
}: GoalsManagementHubProps) {
  // Goal state
  const [goals, setGoals] = useState<FitnessGoal[]>(initialGoals);
  const [filterSport, setFilterSport] = useState<GoalSportFilter>("ALL");
  const [simulationMode100k, setSimulationMode100k] = useState(false);
  const [activatedSuccessId, setActivatedSuccessId] = useState<string | null>(null);
  const [isActivatingGoalId, setIsActivatingGoalId] = useState<string | null>(null);
  const [, setBannerMessage] = useState<{ title: string; desc: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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

  // Authoritative Primary Goal
  const primaryGoal = useMemo(() => {
    return (
      goals.find((g) => g.is_primary) ||
      goals.find((g) => g.priority === 1) ||
      goals[0]
    );
  }, [goals]);

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

  // Set as Primary Goal and recalibrate 12-week training plan
  const handleSetPrimaryGoal = async (goalId: string, title: string) => {
    setIsActivatingGoalId(goalId);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_primary", goal_id: goalId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengalibrasi target utama");
      }

      // Automatically recalibrate 12-week training plan specifically for this primary goal
      await fetch("/api/training/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal_id: goalId }),
      });

      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? { ...g, priority: 1, is_primary: true }
            : { ...g, priority: 2, is_primary: false }
        )
      );
      setActivatedSuccessId(goalId);
      setBannerMessage({
        title: `Target Utama Diaktifkan: "${title}"`,
        desc: "Rencana latihan 12-minggu dan selang waktu pemulihan telah otomatis disesuaikan khusus untuk mencapai target ini.",
      });
    } catch (err: any) {
      console.error("Error setting primary goal:", err);
      alert(`Gagal mengaktifkan target: ${err.message}`);
    } finally {
      setIsActivatingGoalId(null);
    }
  };

  // Activate a progressive template target
  const handleActivateProgression = async (template: ProgressionTemplate) => {
    setIsActivatingGoalId(template.id);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const targetDate = new Date(Date.now() + template.durationWeeks * 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          goal: {
            title: template.title,
            goal_type: "CUSTOM",
            sport_type: template.sport,
            priority: 1,
            is_primary: true,
            target_event_name: template.focusArea,
            target_value: template.targetValue,
            current_value: template.id.includes("next-100") ? 100 : 0,
            start_date: todayStr,
            target_date: targetDate,
            is_achieved: false,
            unit: template.unit,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal membuat target baru");
      }

      const createdGoal: FitnessGoal = data.data;

      // Automatically calibrate 12-week plan for this new goal
      await fetch("/api/training/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal_id: createdGoal.id }),
      });

      setGoals((prev) => [
        createdGoal,
        ...prev.map((g) => ({ ...g, priority: 2, is_primary: false })),
      ]);
      setActivatedSuccessId(createdGoal.id);
      setBannerMessage({
        title: `Target Baru Terbuka & Aktif: "${createdGoal.title}"`,
        desc: "Kalender latihan 12-minggu telah otomatis dikalibrasi ulang khusus untuk target ini.",
      });
    } catch (err: any) {
      console.error("Error activating progression template:", err);
      alert(`Gagal: ${err.message}`);
    } finally {
      setIsActivatingGoalId(null);
    }
  };

  // Add custom goal
    const handleCreateCustomGoal = (goalData: Omit<FitnessGoal, "id" | "created_at" | "updated_at">) => {
      const created: FitnessGoal = {
        ...goalData,
        id: `custom-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setGoals((prev) => [created, ...prev]);
      setActivatedSuccessId(created.id);
      setTimeout(() => setActivatedSuccessId(null), 4000);
    };

    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">
        {/* 1. Header & Navigation Telemetry Bar */}
            <GoalsTelemetrySummary
              totalGoalsCount={goals.length}
              completedCount={goals.filter((g) => g.is_achieved || (g.id === century100kGoal?.id && simulationMode100k)).length}
              verifiedDistanceKm={simulationMode100k ? 100.0 : authenticCyclingDistanceKm}
              simulationMode100k={simulationMode100k}
              onToggleSimulation={() => setSimulationMode100k(!simulationMode100k)}
              onOpenCreateModal={() => setShowAddModal(true)}
            />

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

        {/* 2. HERO SHOWCASE: TARGET UTAMA (AUTHORITATIVE PRIMARY GOAL) */}
              {primaryGoal && <PrimaryGoalHeroSection primaryGoal={primaryGoal} />}

        {/* 3. PROGRESSION ENGINE: Target Lanjutan Terbuka saat 100km Tercapai */}
            <GoalsProgressionDeck
              templates={CYCLING_PROGRESSION_TEMPLATES}
              goals={goals}
              is100kAchieved={is100kAchieved}
              onActivateProgression={handleActivateProgression}
            />

          {/* 4. Filter Navigation Tabs */}
          <GoalsFilterTabs
            filterSport={filterSport}
            onSelectFilter={setFilterSport}
            totalGoalsCount={goals.length}
            filteredCount={filteredGoals.length}
          />

        {/* 5. Active Target Objectives Registry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredGoals.map((g) => {
            const isPrimaryGoal = g.is_primary || g.priority === 1 || g.id === primaryGoal?.id;
            return (
                <GoalRegistryCard
              key={g.id}
              goal = { g }
            isPrimaryGoal = { isPrimaryGoal }
            is100kAchieved = { is100kAchieved }
            simulationMode100k = { simulationMode100k }
            isActivating = { isActivatingGoalId === g.id
          }
              onSetPrimary = { handleSetPrimaryGoal }
            />
          );
        })}
        </div>

        {/* 6. Modal Tambah Sasaran Kustom */}
        <CreateCustomGoalModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onCreateGoal={handleCreateCustomGoal}
        />
      </div>
    );
  }
