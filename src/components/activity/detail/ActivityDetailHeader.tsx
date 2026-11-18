import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
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
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface-card)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-3 py-1.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/activities"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-cycling)] px-2.5 py-1.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] transition-colors shadow-xs"
          >
            <FolderKanban className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span className="hidden sm:inline">Registry</span>
          </Link>

          <div className="h-4 w-px bg-[var(--color-border)]" />

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
                isRun
                  ? "bg-[var(--color-running)]/15 text-[var(--color-running)] border border-[var(--color-running)]/30"
                  : "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30"
              }`}
            >
              {activity.sport_type}
            </span>
            <span className="text-xs font-mono text-[var(--color-text-muted)] font-tabular">
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
                title={`Sesi Lebih Baru: ${prev.name}`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50">
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </span>
            )}

            {next ? (
              <Link
                href={`/activities/${next.id}`}
                title={`Sesi Sebelumnya: ${next.name}`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50">
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
