"use client";

import React from "react";
import { ShieldAlert, AlertTriangle, CheckCircle2, ShieldCheck, ChevronLeft, Check, RefreshCw } from "lucide-react";

interface AddActivityInjuryRightPageProps {
  hasNewInjury: boolean;
  setHasNewInjury: (v: boolean) => void;
  injuryRegion: string;
  setInjuryRegion: (v: string) => void;
  injurySide: "RIGHT" | "LEFT" | "BILATERAL" | "AXIAL";
  setInjurySide: (v: "RIGHT" | "LEFT" | "BILATERAL" | "AXIAL") => void;
  injurySeverity: "MILD" | "MODERATE" | "SEVERE";
  setInjurySeverity: (v: "MILD" | "MODERATE" | "SEVERE") => void;
  injuryMechanism: string;
  setInjuryMechanism: (v: string) => void;
  injuryNotes: string;
  setInjuryNotes: (v: string) => void;
  isSubmitting: boolean;
  onPrevStep: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const COMMON_REGIONS = [
  "Engkel Kanan (ATFL)", "Engkel Kiri", "Lutut Kanan", "Lutut Kiri",
  "Tendon Achilles", "Hamstring", "Betis (Calf)", "Paha Depan", "Punggung Bawah", "Bahu",
];

const MECHANISMS = [
  "Terkilir / Twisting", "Benturan / Impact Langsung", "Nyeri Akut Mendadak",
  "Beban Berlebih / Overuse", "Tarikan Otot / Sprain",
];

export function AddActivityInjuryRightPage(props: AddActivityInjuryRightPageProps) {
  const {
    hasNewInjury, setHasNewInjury, injuryRegion, setInjuryRegion,
    injurySide, setInjurySide, injurySeverity, setInjurySeverity,
    injuryMechanism, setInjuryMechanism, injuryNotes, setInjuryNotes,
    isSubmitting, onPrevStep, onSubmit,
  } = props;

  return (
    <div
      className="flex flex-col relative overflow-y-auto p-5 sm:p-6 transition-colors duration-200"
      style={{
        backgroundColor: "var(--color-book-page-right)",
        backgroundImage: `
          linear-gradient(to right, var(--color-book-margin) 1px, transparent 1px),
          linear-gradient(to bottom, var(--color-book-line) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 100% 28px",
        backgroundPosition: "38px 0, 0 8px",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b text-xs font-mono text-[var(--color-text-secondary)]" style={{ borderColor: "var(--color-border)" }}>
        <span className="flex items-center gap-1.5 text-[var(--color-alert-red)] font-bold">
          <ShieldAlert className="w-3.5 h-3.5" />
          HALAMAN 15 • EVALUASI INSIDEN &amp; CEDERA BARU
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)] font-mono">Screening Insiden Akut</span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] tracking-tight">
            DETEKSI INSIDEN &amp; STATUS CEDERA BARU
          </h3>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
            Laporkan jika terjadi cedera baru atau trauma akut saat sesi latihan.
          </p>
        </div>

        {/* Primary Toggle */}
        <div className="space-y-1.5">
          <label className="text-[10.5px] uppercase font-bold text-[var(--color-text-primary)]">
            Apakah timbul insiden atau cedera baru pada sesi ini?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setHasNewInjury(false)}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                !hasNewInjury
                  ? "bg-[var(--color-cycling)]/15 border-[var(--color-cycling)] text-[var(--color-text-primary)] shadow-xs"
                  : "bg-[var(--color-surface-muted)]/70 border-[var(--color-border)] text-[var(--color-text-secondary)]"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                <CheckCircle2 className={`w-4 h-4 ${!hasNewInjury ? "text-[var(--color-cycling)]" : "text-[var(--color-text-muted)]"}`} />
                <span>Tidak Ada Cedera Baru (Aman)</span>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1 pl-6 leading-tight">
                Sesi aman &amp; terkendali tanpa trauma fisik baru.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setHasNewInjury(true)}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                hasNewInjury
                  ? "bg-[var(--color-alert-red)]/15 border-[var(--color-alert-red)] text-[var(--color-text-primary)] shadow-xs"
                  : "bg-[var(--color-surface-muted)]/70 border-[var(--color-border)] text-[var(--color-text-secondary)]"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertTriangle className={`w-4 h-4 ${hasNewInjury ? "text-[var(--color-alert-red)]" : "text-[var(--color-text-muted)]"}`} />
                <span>Ya, Terjadi Cedera Baru ⚠️</span>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1 pl-6 leading-tight">
                Nyeri mendadak, terkilir, benturan, atau cedera akut.
              </p>
            </button>
          </div>
        </div>

        {/* Clearance Card when NO injury */}
        {!hasNewInjury ? (
          <div className="p-3 rounded-lg bg-[var(--color-surface-card)]/90 border border-[var(--color-cycling)]/30 flex items-start gap-2.5 text-[11px] text-[var(--color-text-secondary)] shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[var(--color-cycling)] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--color-text-primary)] block font-bold mb-0.5">Status Sendi Terkendali &amp; Aman</strong>
              <span>Tidak ada insiden baru yang dilaporkan. Sesi ini dicatat sebagai beban latihan adaptif normal.</span>
            </div>
          </div>
        ) : (
          /* Form when NEW INJURY reported */
          <div className="p-3 bg-[var(--color-surface-card)]/95 border border-[var(--color-alert-red)]/40 rounded-lg space-y-2.5 shadow-xs">
            <div>
              <label className="block text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1">
                Lokasi Sendi / Anatomi yang Terkena
              </label>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {COMMON_REGIONS.map((reg) => (
                  <button
                    type="button"
                    key={reg}
                    onClick={() => setInjuryRegion(reg)}
                    className={`px-2 py-0.5 rounded text-[9.5px] font-semibold border transition-all cursor-pointer ${
                      injuryRegion === reg
                        ? "bg-[var(--color-alert-red)] text-white border-[var(--color-alert-red)]"
                        : "bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Atau ketik nama sendi/area lain..."
                value={injuryRegion}
                onChange={(e) => setInjuryRegion(e.target.value)}
                className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded px-2.5 py-1 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-alert-red)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1">Sisi Tubuh</label>
                <div className="grid grid-cols-3 gap-1">
                  {(["RIGHT", "LEFT", "BILATERAL"] as const).map((side) => (
                    <button
                      type="button"
                      key={side}
                      onClick={() => setInjurySide(side)}
                      className={`py-1 text-[10px] font-bold rounded border cursor-pointer ${injurySide === side ? "bg-[var(--color-surface-muted)] border-[var(--color-alert-red)] text-[var(--color-alert-red)]" : "bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-muted)]"}`}
                    >
                      {side === "RIGHT" ? "Kanan" : side === "LEFT" ? "Kiri" : "Kedua Sisi"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1">Derajat Keparahan</label>
                <div className="grid grid-cols-3 gap-1">
                  {(["MILD", "MODERATE", "SEVERE"] as const).map((sev) => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setInjurySeverity(sev)}
                      className={`py-1 text-[10px] font-bold rounded border cursor-pointer ${injurySeverity === sev ? (sev === "SEVERE" ? "bg-[var(--color-alert-red)] text-white border-[var(--color-alert-red)]" : "bg-[var(--color-alert-amber)] text-black border-[var(--color-alert-amber)]") : "bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-muted)]"}`}
                    >
                      {sev === "MILD" ? "Ringan" : sev === "MODERATE" ? "Sedang" : "Berat"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1">Mekanisme Insiden</label>
              <select
                value={injuryMechanism}
                onChange={(e) => setInjuryMechanism(e.target.value)}
                className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded px-2.5 py-1 text-xs text-[var(--color-text-primary)] font-mono"
              >
                {MECHANISMS.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1">Catatan Gejala Lapangan</label>
              <textarea
                rows={2}
                placeholder="Contoh: Kaki tergelincir di jalan berbatu km 18, timbul bunyi klik dan rasa hangat..."
                value={injuryNotes}
                onChange={(e) => setInjuryNotes(e.target.value)}
                className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded px-2.5 py-1 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-alert-red)] resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-auto pt-4 border-t-2 flex items-center justify-between font-mono" style={{ borderColor: "var(--color-border)" }}>
        <button
          type="button"
          onClick={onPrevStep}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Hal. 12-13</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg bg-[var(--color-cycling)] hover:opacity-90 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>MENYIMPAN...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>TULIS LENGKAP KE JURNAL</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
