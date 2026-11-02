"use client";

import React from "react";
import { Bike, Footprints, Clock, MapPin, Mountain } from "lucide-react";

interface ActivityManualFormFieldsProps {
  sportType: string;
  setSportType: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  distanceKm: string;
  setDistanceKm: (v: string) => void;
  durationHours: string;
  setDurationHours: (v: string) => void;
  durationMinutes: string;
  setDurationMinutes: (v: string) => void;
  durationSeconds: string;
  setDurationSeconds: (v: string) => void;
  elevationMeters: string;
  setElevationMeters: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  calculatedSpeedKmh: string;
  calculatedPaceMinKm: string;
}

export function ActivityManualFormFields({
  sportType,
  setSportType,
  name,
  setName,
  startDate,
  setStartDate,
  distanceKm,
  setDistanceKm,
  durationHours,
  setDurationHours,
  durationMinutes,
  setDurationMinutes,
  durationSeconds,
  setDurationSeconds,
  elevationMeters,
  setElevationMeters,
  description,
  setDescription,
  calculatedSpeedKmh,
  calculatedPaceMinKm,
}: ActivityManualFormFieldsProps) {
  const isRun = sportType.toLowerCase().includes("run") || sportType.toLowerCase().includes("walk");

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Sport Type Selector */}
      <div className="space-y-1.5">
        <label className="block text-[10px] text-[#9BA3AF] uppercase">
          Kategori Olahraga
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { id: "Ride", label: "Sepeda (Ride)", icon: Bike },
            { id: "Run", label: "Lari (Run)", icon: Footprints },
            { id: "Walk", label: "Jalan (Walk)", icon: Footprints },
            { id: "CrossTraining", label: "Cross Training", icon: null },
            { id: "WeightTraining", label: "Gym / Beban", icon: null },
            { id: "Workout", label: "Lainnya", icon: null },
          ].map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setSportType(item.id)}
              className={`py-2 px-1.5 rounded-sm text-center transition-all border flex flex-col items-center justify-center gap-1 ${
                sportType === item.id
                  ? "bg-[#1C212E] border-[#00F0FF] text-[#00F0FF] font-bold shadow-sm"
                  : "bg-[#12151D] border-[#1F2430] text-[#9BA3AF] hover:text-white"
              }`}
            >
              {item.icon && <item.icon className="w-3.5 h-3.5" />}
              <span className="text-[10px] truncate w-full">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Name and Date */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[10px] text-[#9BA3AF] uppercase mb-1">
            Judul / Nama Aktivitas
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: MTB Zone 2 Endurance Pagi / Walk-Jog Recovery"
            className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] text-[#9BA3AF] uppercase mb-1">
            Waktu Mulai
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
            required
          />
        </div>
      </div>

      {/* Distance, Duration, Elevation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Distance */}
        <div>
          <label className="block text-[10px] text-[#9BA3AF] uppercase mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[#00F0FF]">
              <MapPin className="w-3 h-3" />
              <span>Jarak Tempuh</span>
            </span>
            <span className="text-[9px] text-[#5A6272]">km</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            placeholder="0.0"
            className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-tabular text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
            required
          />
        </div>

        {/* Duration (Hours, Minutes, Seconds) */}
        <div>
          <label className="block text-[10px] text-[#9BA3AF] uppercase mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[#D4FF00]">
              <Clock className="w-3 h-3" />
              <span>Durasi Bergerak</span>
            </span>
            <span className="text-[9px] text-[#5A6272]">j : m : d</span>
          </label>
          <div className="grid grid-cols-3 gap-1">
            <input
              type="number"
              min="0"
              max="24"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              placeholder="0h"
              className="px-2 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-tabular text-[#F0F2F5] text-center focus:outline-none focus:border-[#D4FF00]"
            />
            <input
              type="number"
              min="0"
              max="59"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="45m"
              className="px-2 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-tabular text-[#F0F2F5] text-center focus:outline-none focus:border-[#D4FF00]"
            />
            <input
              type="number"
              min="0"
              max="59"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              placeholder="0s"
              className="px-2 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-tabular text-[#F0F2F5] text-center focus:outline-none focus:border-[#D4FF00]"
            />
          </div>
        </div>

        {/* Elevation Gain */}
        <div>
          <label className="block text-[10px] text-[#9BA3AF] uppercase mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[#FF9500]">
              <Mountain className="w-3 h-3" />
              <span>Elevasi Naik</span>
            </span>
            <span className="text-[9px] text-[#5A6272]">meter</span>
          </label>
          <input
            type="number"
            min="0"
            value={elevationMeters}
            onChange={(e) => setElevationMeters(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-tabular text-[#F0F2F5] focus:outline-none focus:border-[#FF9500]"
          />
        </div>
      </div>

      {/* Realtime Live Kinematics Strip */}
      <div className="p-2.5 rounded-sm bg-[#12151D] border border-[#1F2430] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[9px] text-[#5A6272] block">Kecepatan Rata-rata</span>
            <span className="font-bold text-[#F0F2F5] font-tabular">{calculatedSpeedKmh} km/jam</span>
          </div>
          <div>
            <span className="text-[9px] text-[#5A6272] block">Pace Rata-rata</span>
            <span className="font-bold text-[#D4FF00] font-tabular">{calculatedPaceMinKm} /km</span>
          </div>
        </div>
        <div className="text-[10px] text-[#5A6272]">
          Kinematika Terkalkulasi Realtime
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-[10px] text-[#9BA3AF] uppercase mb-1">
          Catatan / Deskripsi Sesi
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Rute jalan datar aspal, rasio gear ringan, hidrasi 500ml, cuaca teduh pagi hari..."
          className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
        />
      </div>
    </div>
  );
}

