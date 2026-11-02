"use client";

import React from "react";
import { AuthoritativeAthleteHealthContext } from "@/types";
import { ShieldCheck, Sparkles } from "lucide-react";

interface ProfileMedicalProceduresTabProps {
  healthContext?: AuthoritativeAthleteHealthContext | null;
  ankleStatus: string;
  setAnkleStatus: (v: string) => void;
  kneeStatus: string;
  setKneeStatus: (v: string) => void;
  hasNewProcedure: boolean;
  setHasNewProcedure: (v: boolean) => void;
  procedureDate: string;
  setProcedureDate: (v: string) => void;
  providerType: string;
  setProviderType: (v: string) => void;
  providerName: string;
  setProviderName: (v: string) => void;
  procedureDetails: string;
  setProcedureDetails: (v: string) => void;
  clinicalFindings: string;
  setClinicalFindings: (v: string) => void;
  clearanceGranted: boolean;
  setClearanceGranted: (v: boolean) => void;
}

export function ProfileMedicalProceduresTab({
  healthContext,
  ankleStatus,
  setAnkleStatus,
  kneeStatus,
  setKneeStatus,
  hasNewProcedure,
  setHasNewProcedure,
  procedureDate,
  setProcedureDate,
  providerType,
  setProviderType,
  providerName,
  setProviderName,
  procedureDetails,
  setProcedureDetails,
  clinicalFindings,
  setClinicalFindings,
  clearanceGranted,
  setClearanceGranted,
}: ProfileMedicalProceduresTabProps) {
  return (
    <div className="space-y-4 font-mono">
      {/* Status Overview of Joint History */}
      <div className="p-3.5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#1F2430]">
          <span className="text-xs font-bold text-[#F0F2F5] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00F0FF]" />
            STATUS PEMERIKSAAN KLINIS SENDI SAAT INI
          </span>
          <span className="text-[10px] text-[#5A6272]">Audit Klinis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Right Ankle Evaluation Status */}
          <div className="p-2.5 rounded-sm bg-[#090A0F] border border-[#1F2430] space-y-1.5">
            <span className="text-[10px] text-[#5A6272] uppercase block">
              Pergelangan Kaki Kanan (Ankle Sprain History)
            </span>
            <select
              value={ankleStatus}
              onChange={(e) => setAnkleStatus(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xs bg-[#12151D] border border-[#1F2430] text-xs text-[#00F0FF] font-semibold focus:outline-none"
            >
              <option value="PENDING_CLINICAL_ASSESSMENT">
                Belum Diperiksa (PENDING)
              </option>
              <option value="CLINICALLY_ASSESSED">
                Telah Diperiksa Fisioterapis
              </option>
              <option value="UNDER_TREATMENT">
                Dalam Program Terapi / Rehab
              </option>
              <option value="DISCHARGED_CLEARED">
                Dinyatakan Bebas Cedera (CLEARED)
              </option>
            </select>
          </div>

          {/* Bilateral Knees Evaluation Status */}
          <div className="p-2.5 rounded-sm bg-[#090A0F] border border-[#1F2430] space-y-1.5">
            <span className="text-[10px] text-[#5A6272] uppercase block">
              Kedua Tempurung Lutut (Bilateral Knees)
            </span>
            <select
              value={kneeStatus}
              onChange={(e) => setKneeStatus(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xs bg-[#12151D] border border-[#1F2430] text-xs text-[#00F0FF] font-semibold focus:outline-none"
            >
              <option value="PENDING_CLINICAL_ASSESSMENT">
                Belum Diperiksa (PENDING)
              </option>
              <option value="CLINICALLY_ASSESSED">
                Telah Diperiksa Fisioterapis
              </option>
              <option value="UNDER_TREATMENT">
                Dalam Program Terapi / Rehab
              </option>
              <option value="DISCHARGED_CLEARED">
                Dinyatakan Bebas Cedera (CLEARED)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Add New Medical Procedure / Assessment Form */}
      <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasNewProcedure}
              onChange={(e) => setHasNewProcedure(e.target.checked)}
              className="accent-[#00F0FF] rounded-none w-4 h-4 cursor-pointer"
            />
            <span className="text-xs font-bold text-[#F0F2F5]">
              + Catat Prosedur / Pemeriksaan Medis Baru
            </span>
          </label>
          <span className="text-[10px] text-[#5A6272]">
            Fisioterapi & Dokter Olahraga
          </span>
        </div>

        {hasNewProcedure && (
          <div className="space-y-3 pt-2 border-t border-[#1F2430] text-xs animate-in fade-in duration-150">
            {/* Date & Provider Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#9BA3AF] uppercase mb-1">
                  Tanggal Prosedur / Pemeriksaan
                </label>
                <input
                  type="date"
                  value={procedureDate}
                  onChange={(e) => setProcedureDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                  required={hasNewProcedure}
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#9BA3AF] uppercase mb-1">
                  Tenaga Medis / Pemeriksa
                </label>
                <select
                  value={providerType}
                  onChange={(e) => setProviderType(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                >
                  <option value="Physiotherapist">Fisioterapis Olahraga</option>
                  <option value="Sports Medicine Physician">Dokter Spesialis Kedokteran Olahraga (Sp.KO)</option>
                  <option value="Orthopedic Surgeon">Dokter Spesialis Ortopedi (Sp.OT)</option>
                  <option value="General Practitioner">Dokter Umum</option>
                </select>
              </div>
            </div>

            {/* Provider Name */}
            <div>
              <label className="block text-[10px] text-[#9BA3AF] uppercase mb-1">
                Nama Dokter / Klinik / Rumah Sakit
              </label>
              <input
                type="text"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="Contoh: Klinik Fisioterapi Olahraga Sehat / dr. Pratama Sp.KO"
                className="w-full px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            {/* Procedure / Treatment Details */}
            <div>
              <label className="block text-[10px] text-[#9BA3AF] uppercase mb-1">
                Tindakan / Prosedur Terapi yang Dijalani
              </label>
              <textarea
                rows={2}
                value={procedureDetails}
                onChange={(e) => setProcedureDetails(e.target.value)}
                placeholder="Contoh: Ultrasound modalitas 3 MHz, TENS pergelangan kaki, manual mobilization, penguatan eksentrik betis dan isometric quad setting."
                className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            {/* Clinical Findings */}
            <div>
              <label className="block text-[10px] text-[#9BA3AF] uppercase mb-1">
                Hasil Temuan Klinis & Rekomendasi
              </label>
              <input
                type="text"
                value={clinicalFindings}
                onChange={(e) => setClinicalFindings(e.target.value)}
                placeholder="Contoh: Stabilitas ligamen ATFL baik, tidak ada efusi lutut. Boleh bersepeda Zone 2."
                className="w-full px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            {/* Return-to-Run Medical Clearance Toggle */}
            <div className="p-3 rounded-sm bg-[#090A0F] border border-[#1F2430] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#F0F2F5] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4FF00]" />
                  Izin Medis Resmi Kembali Berlari (Medical Clearance)
                </span>
                <p className="text-[10px] text-[#9BA3AF] pt-0.5">
                  Aktifkan hanya jika dokter/fisioterapis telah memberikan izin formal untuk memulai lari bertahap.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={clearanceGranted}
                  onChange={(e) => setClearanceGranted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#1F2430] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Historical Medical Assessments */}
      {healthContext && healthContext.medicalAssessments.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] text-[#5A6272] uppercase block">
            Riwayat Prosedur & Asesmen Tercatat ({healthContext.medicalAssessments.length})
          </span>
          <div className="space-y-1.5">
            {healthContext.medicalAssessments.map((m) => (
              <div
                key={m.id}
                className="p-2.5 rounded-sm bg-[#12151D] border border-[#1F2430] text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F0F2F5]">
                    {m.provider_name || m.healthcare_provider_type}
                  </span>
                  <span className="text-[10px] text-[#00F0FF] font-tabular">
                    {m.assessment_date}
                  </span>
                </div>
                {m.rehabilitation_protocol && (
                  <p className="text-[11px] text-[#9BA3AF]">
                    <strong>Tindakan:</strong> {m.rehabilitation_protocol}
                  </p>
                )}
                <p className="text-[10px] text-[#5A6272]">
                  Temuan: {m.clinical_findings}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

