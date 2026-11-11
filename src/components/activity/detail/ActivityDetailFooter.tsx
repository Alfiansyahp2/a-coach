import React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, formatDistance } from "@/lib/formatters";
import { Activity } from "@/types";

interface ActivityDetailFooterProps {
  activity: Activity;
  prev: Activity | null;
  next: Activity | null;
}

export function ActivityDetailFooter({
  activity,
  prev,
  next,
}: ActivityDetailFooterProps) {
  return (
    <div className="pt-6 border-t border-[var(--color-border)] space-y-4 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-cycling)] hover:underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard Telemetri</span>
        </Link>

        <span className="text-[11px] font-mono text-[var(--color-text-muted)] font-tabular">
          Activity UUID: {activity.id}
        </span>
      </div>

      {(prev || next) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {prev ? (
            <Link
              href={`/activities/${prev.id}`}
              className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] transition-all flex items-center gap-3 group shadow-xs"
            >
              <ChevronLeft className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] group-hover:-translate-x-0.5 transition-all shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-mono text-[var(--color-text-muted)] block">
                  ← Sesi Lebih Baru
                </span>
                <span className="text-xs font-bold text-[var(--color-text-primary)] truncate block group-hover:text-[var(--color-cycling)] transition-colors">
                  {prev.name}
                </span>
                <span className="text-[11px] font-mono text-[var(--color-text-secondary)] font-tabular">
                  {formatDate(prev.start_date)} •{" "}
                  {formatDistance(prev.distance_meters)}
                </span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={`/activities/${next.id}`}
              className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] transition-all flex items-center justify-between gap-3 group text-right shadow-xs"
            >
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-mono text-[var(--color-text-muted)] block">
                  Sesi Sebelumnya →
                </span>
                <span className="text-xs font-bold text-[var(--color-text-primary)] truncate block group-hover:text-[var(--color-cycling)] transition-colors">
                  {next.name}
                </span>
                <span className="text-[11px] font-mono text-[var(--color-text-secondary)] font-tabular">
                  {formatDate(next.start_date)} •{" "}
                  {formatDistance(next.distance_meters)}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  );
}
