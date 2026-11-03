import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  ShieldCheck,
} from "lucide-react";
import { Activity } from "@/types";

interface ActivityDetailHeaderProps {
  activity: Activity;
  prev: Activity | null;
  next: Activity | null;
  isRun: boolean;
}

export function ActivityDetailHeader({
  activity,
  prev,
  next,
  isRun,
}: ActivityDetailHeaderProps) {
  return (
    <header className="border-b border-[#1F2430] bg-[#0E1118]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#9BA3AF] hover:text-white px-3 py-1.5 rounded-sm bg-[#161922] border border-[#1F2430] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/activities"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#9BA3AF] hover:text-[#00F0FF] px-2.5 py-1.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#00F0FF] transition-colors"
          >
            <FolderKanban className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span className="hidden sm:inline">Registry</span>
          </Link>

          <div className="h-4 w-px bg-[#232838]" />

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                isRun
                  ? "bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30"
                  : "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30"
              }`}
            >
              {activity.sport_type}
            </span>
            <span className="text-xs font-mono text-[#9BA3AF]">
              #{activity.strava_activity_id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Session Switcher Controls */}
          <div className="flex items-center gap-1 font-mono text-xs">
            {prev ? (
              <Link
                href={`/activities/${prev.id}`}
                title={`Newer Session: ${prev.name}`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#161922] border border-[#1F2430] text-[#9BA3AF] hover:text-white hover:border-[#FC4C02] transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#12151D] border border-[#1F2430] text-[#3A404D] cursor-not-allowed">
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </span>
            )}

            {next ? (
              <Link
                href={`/activities/${next.id}`}
                title={`Older Session: ${next.name}`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#161922] border border-[#1F2430] text-[#9BA3AF] hover:text-white hover:border-[#FC4C02] transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#12151D] border border-[#1F2430] text-[#3A404D] cursor-not-allowed">
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-[#232838] hidden sm:block" />

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#5A6272]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Telemetry Validated</span>
          </div>
        </div>
      </div>
    </header>
  );
}

