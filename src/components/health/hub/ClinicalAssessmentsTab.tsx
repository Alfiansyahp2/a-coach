"use client";

import React from "react";
import { AuthoritativeAthleteHealthContext } from "@/types";
import {
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  FileText,
  UserCheck,
} from "lucide-react";
import { EditAthleteProfileModal } from "../EditAthleteProfileModal";

interface ClinicalAssessmentsTabProps {
  context: AuthoritativeAthleteHealthContext;
}

export function ClinicalAssessmentsTab({ context }: ClinicalAssessmentsTabProps) {
  // Return-to-run criteria evaluation
  const rtrMilestones = [
    {
      id: 1,
      title: "Jalan Kaki Cepat & Tangga Tanpa Kompensasi",
      desc: "Mampu berjalan cepat 45 menit dan menaiki tangga tanpa rasa nyeri atau gaya berjalan asimetris.",
      status: "COMPLETED",
      badge: "Lolos Uji ✅",
      badgeColor: "text-[var(--color-cycling)] bg-[var(--color-cycling)]/10 border-[var(--color-cycling)]/30",
    },
    {
      id: 2,
      title: "Kekuatan Betis Beban Tunggal (25x Single-Leg Calf Raises)",
      desc: "Kekuatan simetris gastrocnemius & soleus tanpa kelemahan atau rasa nyeri pada insersi tendo Achilles.",
      status: "COMPLETED",
      badge: "Lolos Uji ✅",
      badgeColor: "text-[var(--color-cycling)] bg-[var(--color-cycling)]/10 border-[var(--color-cycling)]/30",
    },
    {
      id: 3,
      title: "Keseimbangan Propriosepsi (30s Single-Leg Balance)",
      desc: "Keseimbangan sendi tungkai bawah stabil selama 30 detik pada permukaan datar dengan mata tertutup.",
      status: "MONITORING",
      badge: "Dalam Pemantauan ⚠️",
      badgeColor: "text-[var(--color-alert-amber)] bg-[var(--color-alert-amber)]/10 border-[var(--color-alert-amber)]/30",
    },
    {
      id: 4,
      title: "Izin Tertulis / Formal Dokter / Fisioterapis",
      desc: "Persetujuan formal dari dokter spesialis ortopedi atau fisioterapis olahraga terlisensi sebelum jogging.",
      status: "PENDING",
      badge: "Menunggu Konsultasi ⏳",
      badgeColor: "text-[var(--color-alert-red)] bg-[var(--color-alert-red)]/10 border-[var(--color-alert-red)]/30",
    },
  ];

  const completedCount = rtrMilestones.filter((m) => m.status === "COMPLETED").length;
  const progressPercent = Math.round((completedCount / rtrMilestones.length) * 100);

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-5 font-mono shadow-xs">
      {/* Tab Header & Overall Assessment Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)] text-xs">
        <div>
          <span className="font-bold text-[var(--color-text-primary)] uppercase flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[var(--color-cycling)]" />
            Catatan Penilaian Klinis &amp; Kriteria Return-to-Sport
          </span>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
            Protokol pembatasan benturan sendi dan tolok ukur kesiapan kembali berlari (Return-to-Run).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[var(--color-alert-amber)]/10 text-[var(--color-alert-amber)] border border-[var(--color-alert-amber)]/30 text-[10px] font-bold uppercase">
            STATUS: MENUNGGU JADWAL FISIOTERAPI
          </span>
        </div>
      </div>

      {/* Clinical Assessment Status Banner */}
      <div className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-2 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[var(--color-cycling)]" />
            Status Penilaian Fisioterapi Olahraga Saat Ini:
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-bold text-[10px]">
            PENDING_CLINICAL_ASSESSMENT
          </span>
        </div>

        <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed pt-1">
          Atlet belum menjalani penilaian formal tatap muka oleh fisioterapis olahraga atau dokter spesialis ortopedi untuk mengevaluasi integritas ligamen engkel kanan (<em>anterior talofibular ligament / calcaneofibular ligament</em>) serta melacak etiologi pasti nyeri lutut anterior bilateral.
        </p>

        <div className="p-3 bg-[var(--color-surface-card)] rounded-lg border border-[var(--color-border)] text-[11px] text-[var(--color-text-primary)] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[var(--color-cycling)]" />
          <span>
            <strong>Rekomendasi Aktif:</strong> Latihan dialihkan 100% ke sepeda MTB Zone 2 dengan kayuhan ringan (kadens 85–95 RPM) yang zero-impact pada sendi engkel dan lutut.
          </span>
        </div>
      </div>

      {/* Return-to-Run (RTR) 4-Step Milestone Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--color-text-primary)] uppercase flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--color-endurance)]" />
            Tolok Ukur Kesiapan Kembali Berlari (Return-to-Run Criteria)
          </span>
          <span className="text-[10px] text-[var(--color-endurance)] font-bold">
            {completedCount} dari {rtrMilestones.length} Kriteria Terpenuhi ({progressPercent}%)
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-[var(--color-surface-muted)] overflow-hidden border border-[var(--color-border)]">
          <div
            className="h-full bg-[var(--color-cycling)] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestone Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          {rtrMilestones.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                item.status === "COMPLETED"
                  ? "bg-[var(--color-surface-muted)] border-[var(--color-cycling)]/30"
                  : item.status === "MONITORING"
                  ? "bg-[var(--color-surface-muted)] border-[var(--color-alert-amber)]/30"
                  : "bg-[var(--color-surface-muted)] border-[var(--color-border)] opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                      item.status === "COMPLETED"
                        ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)]"
                        : item.status === "MONITORING"
                        ? "bg-[var(--color-alert-amber)]/15 text-[var(--color-alert-amber)]"
                        : "bg-[var(--color-alert-red)]/15 text-[var(--color-alert-red)]"
                    }`}
                  >
                    {item.id}
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)] text-[11px]">{item.title}</span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
              <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer & Clinical Record Logging */}
      <div className="pt-3 border-t border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
          <ShieldAlert className="w-3.5 h-3.5 text-[var(--color-alert-red)]" />
          <span>
            Batasan klinis dokter bersifat mutlak mengikat di atas seluruh algoritma pelatihan.
          </span>
        </div>

        <EditAthleteProfileModal
          variant="button"
          profile={context.profile}
          healthContext={context}
        />
      </div>
    </div>
  );
}
