import React, { useState } from "react";
import { Target } from "lucide-react";
import { FitnessGoal } from "@/types";

interface CreateCustomGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGoal: (goal: Omit<FitnessGoal, "id" | "created_at" | "updated_at">) => void;
}

export function CreateCustomGoalModal({
  isOpen,
  onClose,
  onCreateGoal,
}: CreateCustomGoalModalProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newSport, setNewSport] = useState<"Ride" | "Run" | "All">("Ride");
  const [newTarget, setNewTarget] = useState("");
  const [newUnit, setNewUnit] = useState("km");
  const [newTargetDate, setNewTargetDate] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTarget) return;

    const todayStr = new Date().toISOString().split("T")[0];
    onCreateGoal({
      user_id: "00000000-0000-0000-0000-000000000001",
      title: newTitle.trim(),
      goal_type: "CUSTOM",
      sport_type: newSport,
      priority: 2,
      is_primary: false,
      target_value: parseFloat(newTarget),
      current_value: 0,
      start_date: todayStr,
      target_date: newTargetDate,
      is_achieved: false,
      unit: newUnit,
    });

    setNewTitle("");
    setNewTarget("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] w-full max-w-lg p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <h3 className="font-sans font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2">
            <Target className="w-4 h-4 text-[var(--color-cycling)]" />
            <span>Buat Sasaran &amp; Target Baru</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[var(--color-text-secondary)] mb-1 font-semibold">
              Judul Sasaran
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="cth: Gran Fondo 150 km, Sub-4 Jam Ride"
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-hidden focus:border-[var(--color-cycling)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--color-text-secondary)] mb-1 font-semibold">
                Cabang Olahraga
              </label>
              <select
                value={newSport}
                onChange={(e) => setNewSport(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-hidden focus:border-[var(--color-cycling)]"
              >
                <option value="Ride">Sepeda (Ride)</option>
                <option value="Run">Lari (Run)</option>
                <option value="All">Multi-Sport / Konsistensi</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--color-text-secondary)] mb-1 font-semibold">
                Target Nilai &amp; Satuan
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-hidden focus:border-[var(--color-cycling)]"
                />
                <select
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-24 px-2 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-hidden focus:border-[var(--color-cycling)] shrink-0"
                >
                  <option value="km">km</option>
                  <option value="sessions">sesi</option>
                  <option value="m D+">m D+</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[var(--color-text-secondary)] mb-1 font-semibold">
              Target Tanggal Penyelesaian (Deadline)
            </label>
            <input
              type="date"
              value={newTargetDate}
              onChange={(e) => setNewTargetDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-hidden focus:border-[var(--color-cycling)]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[var(--color-cycling)] text-[var(--color-canvas)] font-bold hover:opacity-90 transition-all shadow-xs"
            >
              Simpan Sasaran Baru
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

