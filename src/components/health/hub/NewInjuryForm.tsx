"use client";

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface NewInjuryFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function NewInjuryForm({ onClose, onSuccess }: NewInjuryFormProps) {
  const [newRegion, setNewRegion] = useState("Right Ankle");
  const [newSide, setNewSide] = useState<"LEFT" | "RIGHT" | "BILATERAL" | "AXIAL">("RIGHT");
  const [newMechanism, setNewMechanism] = useState("");
  const [newTimeframe, setNewTimeframe] = useState("");
  const [newSymptoms, setNewSymptoms] = useState("");
  const [newSeverity, setNewSeverity] = useState<"MILD" | "MODERATE" | "SEVERE">("MODERATE");
  const [newSwelling, setNewSwelling] = useState(false);
  const [newLimitations, setNewLimitations] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMsg(null);

    try {
      const res = await fetch("/api/athlete/injuries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body_region: newRegion,
          side: newSide,
          injury_mechanism: newMechanism,
          timeframe_description: newTimeframe,
          previous_symptoms: newSymptoms,
          initial_severity: newSeverity,
          previous_swelling: newSwelling,
          functional_limitations: newLimitations,
          medical_evaluation_status: "PENDING_CLINICAL_ASSESSMENT",
          current_status: "ACTIVE_SYMPTOMATIC",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Gagal mencatat cedera baru");
      }

      setFormMsg("Rekam jejak cedera baru berhasil disimpan! Kesiapan latihan diperbarui.");
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      setFormMsg(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-sm bg-[#161922] border border-[#FF2A6D]/40 space-y-3 font-mono text-xs"
    >
      <div className="flex items-center justify-between pb-2 border-b border-[#1F2430]">
        <span className="text-xs font-bold text-[#F0F2F5] uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-[#FF2A6D]" />
          Form Pendaftaran Gejala / Riwayat Cedera Baru
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-[#9BA3AF] hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] text-[#9BA3AF] mb-1 uppercase">Area Tubuh (Body Region)</label>
          <input
            type="text"
            value={newRegion}
            onChange={(e) => setNewRegion(e.target.value)}
            placeholder="Contoh: Right Ankle, Achilles, Hamstring"
            className="w-full bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1.5 text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] text-[#9BA3AF] mb-1 uppercase">Sisi (Side)</label>
          <select
            value={newSide}
            onChange={(e: any) => setNewSide(e.target.value)}
            className="w-full bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1.5 text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
          >
            <option value="RIGHT">Kanan (RIGHT)</option>
            <option value="LEFT">Kiri (LEFT)</option>
            <option value="BILATERAL">Kedua Sisi (BILATERAL)</option>
            <option value="AXIAL">Punggung/Tengah (AXIAL)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-[#9BA3AF] mb-1 uppercase">Tingkat Keparahan Awal</label>
          <select
            value={newSeverity}
            onChange={(e: any) => setNewSeverity(e.target.value)}
            className="w-full bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1.5 text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
          >
            <option value="MILD">Ringan (MILD)</option>
            <option value="MODERATE">Sedang (MODERATE)</option>
            <option value="SEVERE">Berat (SEVERE)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-[#9BA3AF] mb-1 uppercase">Mekanisme Cedera / Pemicu</label>
          <input
            type="text"
            value={newMechanism}
            onChange={(e) => setNewMechanism(e.target.value)}
            placeholder="Contoh: Salah mendarat saat basket, gesekan benturan aspal"
            className="w-full bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1.5 text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] text-[#9BA3AF] mb-1 uppercase">Rentang Waktu Terjadi</label>
          <input
            type="text"
            value={newTimeframe}
            onChange={(e) => setNewTimeframe(e.target.value)}
            placeholder="Contoh: 3-6 bulan lalu, 2 minggu terakhir"
            className="w-full bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1.5 text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-[#9BA3AF] mb-1 uppercase">Keterbatasan Fungsional Saat Ini</label>
          <input
            type="text"
            value={newLimitations}
            onChange={(e) => setNewLimitations(e.target.value)}
            placeholder="Contoh: Nyeri saat hentakan, jalan normal, sepeda bebas nyeri"
            className="w-full bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1.5 text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
          />
        </div>

        <div className="flex items-center gap-3 pt-5">
          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#F0F2F5]">
            <input
              type="checkbox"
              checked={newSwelling}
              onChange={(e) => setNewSwelling(e.target.checked)}
              className="w-4 h-4 accent-[#FF2A6D]"
            />
            <span>Pernah Mengalami Pembengkakan Sendi?</span>
          </label>
        </div>
      </div>

      {formMsg && (
        <div className="p-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-[11px] text-[#00F0FF]">
          {formMsg}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2430]">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 rounded-sm bg-[#090A0F] text-[#9BA3AF] hover:text-white"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-1 rounded-sm bg-[#FF2A6D]/20 text-[#FF2A6D] border border-[#FF2A6D]/40 font-semibold hover:bg-[#FF2A6D]/30 transition-colors"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Dossier Cedera"}
        </button>
      </div>
    </form>
  );
}

