"use client";

import React, { useState } from "react";
import { AthleteEquipment } from "@/types";
import { Bike, Footprints, ShieldAlert, Plus, CheckCircle2, AlertTriangle, PenTool } from "lucide-react";

interface AthleteEquipmentCardProps {
  initialEquipment: AthleteEquipment[];
}

export function AthleteEquipmentCard({ initialEquipment }: AthleteEquipmentCardProps) {
  const [equipmentList, setEquipmentList] = useState<AthleteEquipment[]>(initialEquipment);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formSport, setFormSport] = useState("Run");
  const [formGearType, setFormGearType] = useState("RUNNING_SHOES");
  const [formMaxDist, setFormMaxDist] = useState("800");
  const [formNotes, setFormNotes] = useState("");

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/athlete/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          brand: formBrand.trim(),
          model: formModel.trim(),
          sport_type: formSport,
          gear_type: formGearType,
          max_recommended_distance_meters: (Number(formMaxDist) || 800) * 1000,
          notes: formNotes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.equipment) {
        setEquipmentList((prev) => [data.equipment, ...prev]);
        setShowAddForm(false);
        setFormName("");
        setFormBrand("");
        setFormModel("");
        setFormNotes("");
      }
    } catch (err) {
      console.error("Failed to add equipment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <div>
          <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Bike className="w-4 h-4 text-[var(--color-cycling)]" />
            <span>Loker Perlengkapan &amp; Gear Atlet ({equipmentList.length})</span>
          </h3>
          <p className="text-[10.5px] font-mono text-[var(--color-text-muted)] mt-0.5">
            Pelacakan Jarak Akumulasi Sepatu Lari &amp; Sepeda untuk Pencegahan Cedera
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          type="button"
          className="px-2.5 py-1 rounded-lg bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs font-mono font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-cycling)] transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? "Batal" : "Tambah Gear"}</span>
        </button>
      </div>

      {/* Form: Add New Equipment */}
      {showAddForm && (
        <form onSubmit={handleAddEquipment} className="p-4 rounded-xl bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)] space-y-3 font-mono text-xs">
          <div className="font-bold uppercase tracking-wider text-[var(--color-text-primary)] text-[11px]">
            Tambah Sepatu atau Sepeda Baru
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10.5px] text-[var(--color-text-muted)] mb-1">Nama Gear *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: Nike Invincible 3"
                className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
              />
            </div>
            <div>
              <label className="block text-[10.5px] text-[var(--color-text-muted)] mb-1">Cabang Olahraga</label>
              <select
                value={formSport}
                onChange={(e) => {
                  setFormSport(e.target.value);
                  if (e.target.value === "Ride") {
                    setFormGearType("ROAD_BIKE");
                    setFormMaxDist("5000");
                  } else {
                    setFormGearType("RUNNING_SHOES");
                    setFormMaxDist("800");
                  }
                }}
                className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
              >
                <option value="Run">Lari (Run)</option>
                <option value="Ride">Sepeda (Ride)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10.5px] text-[var(--color-text-muted)] mb-1">Batas Maksimum (km)</label>
              <input
                type="number"
                value={formMaxDist}
                onChange={(e) => setFormMaxDist(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10.5px] text-[var(--color-text-muted)] mb-1">Catatan Tambahan</label>
            <input
              type="text"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Contoh: Bantalan tebal untuk perlindungan lutut saat long run"
              className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-[var(--color-cycling)] text-[var(--color-canvas)] font-bold text-xs hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Gear"}
            </button>
          </div>
        </form>
      )}

      {/* Equipment List */}
      {equipmentList.length === 0 ? (
        <div className="py-8 text-center text-xs font-mono text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-xl">
          Belum ada perlengkapan yang didaftarkan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {equipmentList.map((item) => {
            const isRun = item.sport_type?.toLowerCase().includes("run");
            const isRide = item.sport_type?.toLowerCase().includes("ride") || item.sport_type?.toLowerCase().includes("cycl");
            const accumulatedKm = (Number(item.accumulated_distance_meters || 0) / 1000).toFixed(1);
            const maxKm = (Number(item.max_recommended_distance_meters || 800000) / 1000).toFixed(0);
            const wearPct = Math.min(
              100,
              Math.round((Number(item.accumulated_distance_meters || 0) / Number(item.max_recommended_distance_meters || 800000)) * 100)
            );

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[var(--color-surface-muted)]/40 border border-[var(--color-border)] hover:border-[var(--color-border)]/80 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs ${
                        isRun
                          ? "bg-[var(--color-running)]/10 text-[var(--color-running)] border-[var(--color-running)]/30"
                          : "bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                      }`}
                    >
                      {isRun ? <Footprints className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-[var(--color-text-primary)] truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--color-text-muted)] truncate">
                        {item.brand} {item.model ? `• ${item.model}` : ""} ({item.gear_type})
                      </div>
                    </div>
                  </div>

                  <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-semibold shrink-0">
                    AKTIF
                  </span>
                </div>

                {/* Progress Bar & Mileage */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10.5px] font-mono">
                    <span className="text-[var(--color-text-secondary)] font-tabular font-semibold">
                      {accumulatedKm} km <span className="text-[var(--color-text-muted)] font-normal">/ {maxKm} km</span>
                    </span>
                    <span
                      className={`font-bold font-tabular text-[10px] ${
                        wearPct > 80 ? "text-[var(--color-alert-red)]" : "text-[var(--color-cycling)]"
                      }`}
                    >
                      {wearPct}% terpakai
                    </span>
                  </div>

                  <div className="w-full bg-[var(--color-surface-card)] h-2 rounded-full overflow-hidden border border-[var(--color-border)]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        wearPct > 80 ? "bg-[var(--color-alert-red)]" : isRun ? "bg-[var(--color-running)]" : "bg-[var(--color-cycling)]"
                      }`}
                      style={{ width: `${Math.max(2, wearPct)}%` }}
                    />
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[10px] font-mono text-[var(--color-text-muted)] line-clamp-1 italic">
                    "{item.notes}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

