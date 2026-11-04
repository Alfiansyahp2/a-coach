import React from "react";
import { Activity as ActivityIcon } from "lucide-react";
import { AddActivityModal } from "@/components/AddActivityModal";
import { EditAthleteProfileModal } from "@/components/health/EditAthleteProfileModal";
import { User } from "@/types";

interface DashboardIntegrityStripProps {
  dbStatus?: { type: string; connected: boolean };
  user: User | null;
  healthContext: any;
}

export function DashboardIntegrityStrip({
  user,
  healthContext,
}: DashboardIntegrityStripProps) {
  return (
    <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3 shadow-xs">
      {/* Left: Telemetry Bridge Indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs font-mono shadow-xs">
        <ActivityIcon className="w-3.5 h-3.5 text-[var(--color-strava)]" />
        <span className="font-semibold">Strava Telemetry Bridge Active</span>
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

            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-[var(--color-border)]">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-[var(--color-border)] object-cover shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-xs font-mono font-bold text-[var(--color-cycling)]">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="text-left font-mono">
                <div className="text-xs font-bold text-[var(--color-text-primary)] leading-none">
                  {user.name}
                </div>
                <div className="text-[9.5px] text-[var(--color-cycling)] font-semibold leading-tight pt-1">
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
