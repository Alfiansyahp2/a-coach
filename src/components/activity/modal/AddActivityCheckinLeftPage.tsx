"use client";

import React from "react";
import { Activity as ActivityIcon, ShieldAlert, Calendar, MapPin, Clock, Gauge } from "lucide-react";
import { formatDate } from "@/lib/formatters";

interface AddActivityCheckinLeftPageProps {
  sportType: string;
  name: string;
  startDate: string;
  numericDistanceKm: number;
  totalDurationSeconds: number;
  durationHours: string;
  durationMinutes: string;
  durationSeconds: string;
  calculatedSpeedKmh: string;
  calculatedPaceMinKm: string;
  painDuring: number;
  setPainDuring: (v: number) => void;
  painAfter: number;
  setPainAfter: (v: number) => void;
  painNextDay: number;
  setPainNextDay: (v: number) => void;
  swellingObserved: boolean;
  setSwellingObserved: (v: boolean) => void;
  instabilityObserved: boolean;
  setInstabilityObserved: (v: boolean) => void;
  rpeScore: number;
  setRpeScore: (v: number) => void;
  subjectiveNotes: string;
  setSubjectiveNotes: (v: string) => void;
}

export function AddActivityCheckinLeftPage(props: AddActivityCheckinLeftPageProps) {
  const {
    sportType, name, startDate, numericDistanceKm, durationHours, durationMinutes, durationSeconds,
    calculatedSpeedKmh, calculatedPaceMinKm, painDuring, setPainDuring, painAfter, setPainAfter,
    painNextDay, setPainNextDay, swellingObserved, setSwellingObserved, instabilityObserved,
    setInstabilityObserved, rpeScore, setRpeScore, subjectiveNotes, setSubjectiveNotes,
  } = props;

  const formattedDur = `${parseInt(durationHours || "0", 10)}j ${parseInt(durationMinutes || "0", 10)}m ${parseInt(durationSeconds || "0", 10)}d`;

  const painFields = [
    { label: "Saat Sesi Latihan", value: painDuring, setter: setPainDuring },
    { label: "Sesaat Pasca Sesi", value: painAfter, setter: setPainAfter },
    { label: "Keesokan Harinya", value: painNextDay, setter: setPainNextDay },
  ];

  return (
    <div
      className="flex flex-col relative overflow-y-auto p-5 sm:p-6 transition-colors duration-200 border-r border-[var(--color-border)]"
      style={{
        backgroundColor: "var(--color-book-page-left)",
        backgroundImage: `
          linear-gradient(to right, var(--color-book-grid) 1px, transparent 1px),
          linear-gradient(to bottom, var(--color-book-grid) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b text-xs font-mono text-[var(--color-text-secondary)]" style={{ borderColor: "var(--color-border)" }}>
        <span className="flex items-center gap-1.5 text-[var(--color-cycling)] font-bold">
          <ActivityIcon className="w-3.5 h-3.5" />
          HALAMAN 14 • CHECK-IN PASCA LATIHAN
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
          Audit Respon Sendi
        </span>
      </div>

      <div className="space-y-3.5 font-mono text-xs">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] tracking-tight">
            EVALUASI RESPON SUBJEKTIF &amp; KESIAPAN
          </h3>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
            Laporan gejala pasca latihan untuk penyesuaian beban sesi berikutnya.
          </p>
        </div>

        {/* Clinical Safety Protocol Alert */}
        <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)]/90 border border-[var(--color-alert-amber)]/40 flex items-start gap-2.5 text-[10.5px] leading-relaxed text-[var(--color-text-secondary)]">
          <ShieldAlert className="w-4 h-4 text-[var(--color-alert-amber)] shrink-0 mt-0.5" />
          <p>
            <strong className="text-[var(--color-text-primary)]">Protokol Keselamatan:</strong> Data yang dilaporkan di sini langsung menentukan batas beban latihan sesi berikutnya. Hentikan latihan dan evaluasi bila timbul efusi atau nyeri akut.
          </p>
        </div>

        {/* Sesi Terkait Summary */}
        <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)]/95 border border-[var(--color-border)] space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${sportType === "Ride" ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border-[var(--color-cycling)]/30" : "bg-[var(--color-running)]/15 text-[var(--color-running)] border-[var(--color-running)]/30"}`}>
              {sportType}
            </span>
            <span className="font-bold text-xs text-[var(--color-text-primary)] truncate flex-1">
              {name || "Sesi Latihan"}
            </span>
          </div>
          <div className="text-[10px] text-[var(--color-text-secondary)] flex flex-wrap items-center gap-x-3 gap-y-1 font-tabular">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[var(--color-text-muted)]" />{formatDate(startDate) || "Hari Ini"}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[var(--color-text-muted)]" />{numericDistanceKm.toFixed(2)} km</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[var(--color-text-muted)]" />{formattedDur}</span>
            <span className="text-[var(--color-cycling)] font-semibold">{sportType === "Ride" ? `${calculatedSpeedKmh} km/h` : `${calculatedPaceMinKm} /km`}</span>
          </div>
        </div>

        {/* 1. SKALA NYERI SENDI */}
        <div className="p-3 bg-[var(--color-surface-card)]/95 border border-[var(--color-border)] rounded-lg space-y-2">
          <span className="text-[10px] uppercase font-bold text-[var(--color-text-primary)] tracking-wider block">
            1. Skala Nyeri Sendi (0 = Tidak Ada, 10 = Nyeri Berat)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {painFields.map((field) => (
              <div key={field.label} className="p-2 rounded bg-[var(--color-surface-muted)]/70 border border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9.5px] text-[var(--color-text-secondary)] font-semibold">{field.label}</span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold font-tabular text-[10px] shrink-0 transition-colors duration-200 ${
                      field.value === 0
                        ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/40"
                        : field.value <= 3
                        ? "bg-[var(--color-alert-amber)]/15 text-[var(--color-alert-amber)] border border-[var(--color-alert-amber)]/40"
                        : "bg-[var(--color-alert-red)]/20 text-[var(--color-alert-red)] border border-[var(--color-alert-red)] animate-pulse"
                    }`}
                  >
                    {field.value}
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={field.value}
                  onChange={(e) => field.setter(Number(e.target.value))}
                  className="w-full accent-[var(--color-cycling)] h-1.5 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 2. INDIKATOR BIOLOGIS */}
        <div className="p-3 bg-[var(--color-surface-card)]/95 border border-[var(--color-border)] rounded-lg space-y-2">
          <span className="text-[10px] uppercase font-bold text-[var(--color-text-primary)] tracking-wider block">
            2. Indikator Biologis &amp; Pembatasan Keamanan
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="flex items-center justify-between p-2 rounded-md bg-[var(--color-surface-muted)]/80 border border-[var(--color-border)] cursor-pointer">
              <span className="text-[10.5px] text-[var(--color-text-primary)]">Pembengkakan Sendi Teramati?</span>
              <input type="checkbox" checked={swellingObserved} onChange={(e) => setSwellingObserved(e.target.checked)} className="w-4 h-4 accent-[var(--color-alert-red)] cursor-pointer" />
            </label>
            <label className="flex items-center justify-between p-2 rounded-md bg-[var(--color-surface-muted)]/80 border border-[var(--color-border)] cursor-pointer">
              <span className="text-[10.5px] text-[var(--color-text-primary)]">Ketidakstabilan / Sendi Goyang?</span>
              <input type="checkbox" checked={instabilityObserved} onChange={(e) => setInstabilityObserved(e.target.checked)} className="w-4 h-4 accent-[var(--color-alert-red)] cursor-pointer" />
            </label>
          </div>
        </div>

        {/* RPE & Catatan */}
        <div className="p-3 bg-[var(--color-surface-card)]/95 border border-[var(--color-border)] rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
              <span>Perceived Exertion (RPE Borg CR10: {rpeScore}/10)</span>
            </label>
            <span className="text-[9.5px] font-semibold text-[var(--color-cycling)]">
              {rpeScore <= 2 ? "Recovery" : rpeScore <= 4 ? "Zone 2 Aerobik" : rpeScore <= 6 ? "Moderat" : "Tinggi"}
            </span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 font-tabular">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                type="button"
                key={num}
                onClick={() => setRpeScore(num)}
                className={`py-1 rounded text-[11px] font-bold border cursor-pointer ${
                  rpeScore === num
                    ? "bg-[var(--color-cycling)] text-white border-[var(--color-cycling)]"
                    : num === 3 || num === 4
                    ? "bg-[var(--color-surface-muted)] border-[var(--color-cycling)]/40 text-[var(--color-cycling)]"
                    : "bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-secondary)]"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-semibold">Catatan Subjektif Atlet</label>
            <input
              type="text"
              placeholder="Contoh: Engkel stabil saat putaran flat, sedikit kaku pada tanjakan..."
              value={subjectiveNotes}
              onChange={(e) => setSubjectiveNotes(e.target.value)}
              className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-md px-3 py-1.5 text-[var(--color-text-primary)] text-xs font-mono focus:outline-none focus:border-[var(--color-cycling)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
