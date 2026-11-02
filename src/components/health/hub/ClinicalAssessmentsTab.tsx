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
      badgeColor: "text-[#10B981] bg-[#10B981]/15 border-[#10B981]/30",
    },
    {
      id: 2,
      title: "Kekuatan Betis Beban Tunggal (25x Single-Leg Calf Raises)",
      desc: "Kekuatan simetris gastrocnemius & soleus tanpa kelemahan atau rasa nyeri pada insersi tendo Achilles.",
      status: "COMPLETED",
      badge: "Lolos Uji ✅",
      badgeColor: "text-[#10B981] bg-[#10B981]/15 border-[#10B981]/30",
    },
    {
      id: 3,
      title: "Keseimbangan Propriosepsi (30s Single-Leg Balance)",
      desc: "Keseimbangan sendi tungkai bawah stabil selama 30 detik pada permukaan datar dengan mata tertutup.",
      status: "MONITORING",
      badge: "Dalam Pemantauan ⚠️",
      badgeColor: "text-[#FF9500] bg-[#FF9500]/15 border-[#FF9500]/30",
    },
    {
      id: 4,
      title: "Izin Tertulis / Formal Dokter / Fisioterapis",
      desc: "Persetujuan formal dari dokter spesialis ortopedi atau fisioterapis olahraga terlisensi sebelum jogging.",
      status: "PENDING",
      badge: "Menunggu Konsultasi ⏳",
      badgeColor: "text-[#FF2A6D] bg-[#FF2A6D]/15 border-[#FF2A6D]/30",
    },
  ];

  const completedCount = rtrMilestones.filter((m) => m.status === "COMPLETED").length;
  const progressPercent = Math.round((completedCount / rtrMilestones.length) * 100);

  return (
    <div className="p-4 sm:p-5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-5 font-mono shadow-sm">
      {/* Tab Header & Overall Assessment Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1F2430] text-xs">
        <div>
          <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[#00F0FF]" />
            Catatan Penilaian Klinis &amp; Kriteria Return-to-Sport
          </span>
          <p className="text-[11px] text-[#9BA3AF] mt-0.5">
            Protokol pembatasan benturan sendi dan tolok ukur kesiapan kembali berlari (Return-to-Run).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xs bg-[#FF9500]/15 text-[#FF9500] border border-[#FF9500]/30 text-[10px] font-bold uppercase">
            STATUS: MENUNGGU JADWAL FISIOTERAPI
          </span>
        </div>
      </div>

      {/* Clinical Assessment Status Banner */}
      <div className="p-4 rounded-sm bg-[#161922] border border-[#1F2430] space-y-2 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-[#F0F2F5] flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#00F0FF]" />
            Status Penilaian Fisioterapi Olahraga Saat Ini:
          </span>
          <span className="px-2 py-0.5 rounded-xs bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold text-[10px]">
            PENDING_CLINICAL_ASSESSMENT
          </span>
        </div>

        <p className="text-[11px] text-[#9BA3AF] leading-relaxed pt-1">
          Atlet belum menjalani penilaian formal tatap muka oleh fisioterapis olahraga atau dokter spesialis ortopedi untuk mengevaluasi integritas ligamen engkel kanan (<em>anterior talofibular ligament / calcaneofibular ligament</em>) serta melacak etiologi pasti nyeri lutut anterior bilateral.
        </p>

        <div className="p-3 bg-[#090A0F] rounded-sm border border-[#1F2430] text-[11px] text-[#00F0FF] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#10B981]" />
          <span>
            <strong>Rekomendasi Aktif:</strong> Latihan dialihkan 100% ke sepeda MTB Zone 2 dengan kayuhan ringan (kadens 85–95 RPM) yang zero-impact pada sendi engkel dan lutut.
          </span>
        </div>
      </div>

      {/* Return-to-Run (RTR) 4-Step Milestone Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D4FF00]" />
            Tolok Ukur Kesiapan Kembali Berlari (Return-to-Run Criteria)
          </span>
          <span className="text-[10px] text-[#D4FF00] font-bold">
            {completedCount} dari {rtrMilestones.length} Kriteria Terpenuhi ({progressPercent}%)
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-[#161922] overflow-hidden border border-[#1F2430]">
          <div
            className="h-full bg-gradient-to-r from-[#10B981] to-[#D4FF00] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestone Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          {rtrMilestones.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-sm border space-y-2 transition-all ${
                item.status === "COMPLETED"
                  ? "bg-[#161922] border-[#10B981]/30 hover:border-[#10B981]/50"
                  : item.status === "MONITORING"
                  ? "bg-[#161922] border-[#FF9500]/30 hover:border-[#FF9500]/50"
                  : "bg-[#161922] border-[#1F2430] opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-xs flex items-center justify-center font-bold text-[10px] ${
                      item.status === "COMPLETED"
                        ? "bg-[#10B981]/20 text-[#10B981]"
                        : item.status === "MONITORING"
                        ? "bg-[#FF9500]/20 text-[#FF9500]"
                        : "bg-[#FF2A6D]/20 text-[#FF2A6D]"
                    }`}
                  >
                    {item.id}
                  </span>
                  <span className="font-bold text-[#F0F2F5] text-[11px]">{item.title}</span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-xs border font-bold shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
              <p className="text-[10px] text-[#9BA3AF] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer & Clinical Record Logging */}
      <div className="pt-3 border-t border-[#1F2430] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] text-[#5A6272]">
          <ShieldAlert className="w-3.5 h-3.5 text-[#FF2A6D]" />
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
