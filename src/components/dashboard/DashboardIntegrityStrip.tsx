import React from "react";
import { Database, ShieldCheck, Activity as ActivityIcon } from "lucide-react";
import { AddActivityModal } from "@/components/AddActivityModal";
import { EditAthleteProfileModal } from "@/components/health/EditAthleteProfileModal";
import { User } from "@/types";

interface DashboardIntegrityStripProps {
  dbStatus: { type: string; connected: boolean };
  user: User | null;
  healthContext: any;
}

export function DashboardIntegrityStrip({
  dbStatus,
  user,
  healthContext,
}: DashboardIntegrityStripProps) {
  return (
    <div className="p-3 sm:p-3.5 rounded-sm bg-gradient-to-r from-[#12151D] via-[#161B26] to-[#12151D] border border-[#1F2430] flex flex-wrap items-center justify-between gap-3 shadow-sm">
      {/* Left: Telemetry & Security Health HUD */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#090A0F]/80 border border-[#1F2430] text-[#9BA3AF]">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              dbStatus.connected ? "bg-[#10B981] animate-pulse" : "bg-[#FF2A6D]"
            }`}
          />
          <Database className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>DB: <strong className="text-[#F0F2F5]">{dbStatus.type}</strong></span>
          <span
            className={`font-bold text-[10px] uppercase ml-0.5 ${
              dbStatus.connected ? "text-[#10B981]" : "text-[#FF2A6D]"
            }`}
          >
            [{dbStatus.connected ? "ONLINE" : "OFFLINE"}]
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#090A0F]/80 border border-[#1F2430] text-[#9BA3AF]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Storage: <strong className="text-[#F0F2F5]">AES-256-GCM</strong></span>
        </div>
      </div>

      {/* Right: Quick Actions & Athlete Health Profile Badge */}
      <div className="flex items-center gap-3">
        <AddActivityModal variant="button" />

        {user && (
          <div className="flex items-center gap-2.5">
            <EditAthleteProfileModal
              user={user}
              profile={healthContext?.profile}
              healthContext={healthContext}
              variant="badge"
            />

            <div className="hidden sm:flex items-center gap-2 pl-2.5 border-l border-[#1F2430]">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-7 h-7 rounded-sm border border-[#1F2430] object-cover shadow-xs"
                />
              ) : (
                <div className="w-7 h-7 rounded-sm bg-[#161922] border border-[#1F2430] flex items-center justify-center text-xs font-mono font-bold text-[#00F0FF]">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="text-left font-mono">
                <div className="text-xs font-semibold text-[#F0F2F5] leading-none">
                  {user.name}
                </div>
                <div className="text-[9px] text-[#10B981] leading-tight pt-0.5">
                  Calibrated Athlete
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
