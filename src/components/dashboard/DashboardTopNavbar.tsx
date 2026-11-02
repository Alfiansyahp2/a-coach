import React from "react";
import Link from "next/link";
import { Calendar, FolderKanban, ShieldCheck } from "lucide-react";

export function DashboardTopNavbar() {
  return (
    <header className="border-b border-[#1F2430] bg-[#090A0F]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-sm bg-[#12151D] border border-[#1F2430] flex items-center justify-center font-mono font-black text-xs text-[#D4FF00] tracking-tighter">
            AC
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white font-mono">
              a-coach
            </span>
            <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-sm bg-[#12151D] text-[#9BA3AF] border border-[#1F2430]">
              OBSIDIAN TELEMETRY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/training"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#12151D] border border-[#1F2430] hover:border-[#D4FF00] text-[#9BA3AF] hover:text-[#D4FF00] transition-colors text-xs font-mono font-medium"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span>Jadwal Latihan</span>
          </Link>
          <Link
            href="/health"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#12151D] border border-[#1F2430] hover:border-[#FF2A6D] text-[#9BA3AF] hover:text-[#FF2A6D] transition-colors text-xs font-mono font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF2A6D]" />
            <span className="hidden sm:inline">Profil</span> Kesehatan
          </Link>
          <Link
            href="/activities"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#12151D] border border-[#1F2430] hover:border-[#00F0FF] text-[#9BA3AF] hover:text-[#00F0FF] transition-colors text-xs font-mono font-medium"
          >
            <FolderKanban className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span className="hidden sm:inline">Manajemen</span> Aktivitas
          </Link>
        </div>
      </div>
    </header>
  );
}

