import React from "react";
import Link from "next/link";
import { Calendar, FolderKanban, ShieldCheck } from "lucide-react";

export function DashboardTopNavbar() {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface-card)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 group transition-opacity hover:opacity-95"
          title="Kembali ke Dashboard Utama"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] group-hover:border-[var(--color-cycling)] flex items-center justify-center font-mono font-bold text-xs text-[var(--color-cycling)] tracking-tighter shadow-xs transition-all">
            EP
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-[var(--color-text-primary)] font-mono group-hover:text-[var(--color-cycling)] transition-colors">
              ENDURANCE LAB
            </span>
            <span className="text-[9.5px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border border-[var(--color-border)] font-semibold">
              KINETIC TELEMETRY
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/training"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all text-xs font-mono font-semibold shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Jadwal Latihan</span>
          </Link>
          <Link
            href="/health"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-alert-red)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all text-xs font-mono font-semibold shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-alert-red)]" />
            <span className="hidden sm:inline">Profil</span> Kesehatan
          </Link>
          <Link
            href="/activities"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all text-xs font-mono font-semibold shadow-xs"
          >
            <FolderKanban className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span className="hidden sm:inline">Manajemen</span> Aktivitas
          </Link>
        </div>
      </div>
    </header>
  );
}
