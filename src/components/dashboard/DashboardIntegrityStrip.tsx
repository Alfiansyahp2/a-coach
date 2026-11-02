import React from "react";
import { Database, ShieldCheck } from "lucide-react";
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
    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1F2430]">
      <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#12151D] border border-[#1F2430] text-[#9BA3AF]">
          <Database className="w-3 h-3 text-[#00F0FF]" />
          <span>Store: {dbStatus.type}</span>
          <span
            className={`font-semibold ${
              dbStatus.connected ? "text-[#10B981]" : "text-[#FF2A6D]"
            }`}
          >
            ({dbStatus.connected ? "Online" : "Offline"})
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#12151D] border border-[#1F2430] text-[#9BA3AF]">
          <ShieldCheck className="w-3 h-3 text-[#10B981]" />
          <span className="hidden sm:inline">Encrypted at Rest:</span>
          <span>AES-256-GCM</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <AddActivityModal variant="button" />

        {user && (
          <EditAthleteProfileModal
            user={user}
            profile={healthContext?.profile}
            healthContext={healthContext}
            variant="badge"
          />
        )}
      </div>
    </div>
  );
}

