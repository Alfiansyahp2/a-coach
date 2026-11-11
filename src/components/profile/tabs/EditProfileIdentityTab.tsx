"use client";

import React from "react";

interface EditProfileIdentityTabProps {
  name: string;
  setName: (v: string) => void;
  avatarUrl: string;
  setAvatarUrl: (v: string) => void;
  experience: string;
  setExperience: (v: string) => void;
  sports: string[];
  toggleSport: (sport: string) => void;
  objectives: string;
  setObjectives: (v: string) => void;
}

export function EditProfileIdentityTab({
  name,
  setName,
  avatarUrl,
  setAvatarUrl,
  experience,
  setExperience,
  sports,
  toggleSport,
  objectives,
  setObjectives,
}: EditProfileIdentityTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
          Nama Atlet *
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama Lengkap Atlet"
          className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
        />
      </div>

      <div>
        <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
          URL Foto Profil (Avatar)
        </label>
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
            Tingkat Pengalaman Latihan
          </label>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
          >
            <option value="BEGINNER">BEGINNER (0 - 1 Tahun)</option>
            <option value="INTERMEDIATE">INTERMEDIATE (1 - 3 Tahun)</option>
            <option value="ADVANCED">ADVANCED (3 - 5+ Tahun)</option>
            <option value="ELITE">ELITE (Kompetitif / Atlet Nasional)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
            Disiplin Pilihan
          </label>
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {["Running", "Cycling", "Strength", "Swimming"].map((sp) => {
              const selected = sports.includes(sp);
              return (
                <button
                  key={sp}
                  type="button"
                  onClick={() => toggleSport(sp)}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer ${
                    selected
                      ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border-[var(--color-cycling)]/40 font-bold"
                      : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]"
                  }`}
                >
                  {sp}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
          Sasaran / Objektif Musim Latihan
        </label>
        <textarea
          rows={2}
          value={objectives}
          onChange={(e) => setObjectives(e.target.value)}
          placeholder="Contoh: Pemeliharaan endurance aerobik dengan pencegahan cedera lutut..."
          className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
        />
      </div>
    </div>
  );
}

