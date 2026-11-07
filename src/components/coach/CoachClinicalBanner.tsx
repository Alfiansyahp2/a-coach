import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export interface CoachRationaleItem {
  title: string;
  description: React.ReactNode;
}

interface CoachClinicalBannerProps {
  icon: React.ReactNode;
  badgeLabel: string;
  badgeStatus: string;
  badgeTone: "cycling" | "amber" | "rose";
  headline: string;
  linkHref: string;
  linkText: string;
  rationales: CoachRationaleItem[];
}

export function CoachClinicalBanner({
  icon,
  badgeLabel,
  badgeStatus,
  badgeTone,
  headline,
  linkHref,
  linkText,
  rationales,
}: CoachClinicalBannerProps) {
  const toneClasses = {
    cycling: {
      container: "bg-[var(--color-cycling)]/[0.06] border-[var(--color-cycling)]/40",
      iconBox: "bg-[var(--color-cycling)]/20 border-[var(--color-cycling)]/40 text-[var(--color-cycling)]",
      badgeText: "text-[var(--color-cycling)]",
      badgeBg: "bg-[var(--color-cycling)]/20 text-[var(--color-cycling)] border-[var(--color-cycling)]/40",
      buttonBorder: "border-[var(--color-cycling)]/30 hover:border-[var(--color-cycling)] text-[var(--color-cycling)]",
    },
    amber: {
      container: "bg-amber-500/[0.06] border-amber-500/40",
      iconBox: "bg-amber-500/20 border-amber-500/40 text-amber-500",
      badgeText: "text-amber-500 dark:text-amber-400",
      badgeBg: "bg-amber-500/20 text-amber-500 border-amber-500/40",
      buttonBorder: "border-amber-500/30 hover:border-amber-500 text-amber-500 dark:text-amber-400",
    },
    rose: {
      container: "bg-rose-500/[0.06] border-rose-500/40",
      iconBox: "bg-rose-500/20 border-rose-500/40 text-rose-500",
      badgeText: "text-rose-500 dark:text-rose-400",
      badgeBg: "bg-rose-500/20 text-rose-500 border-rose-500/40",
      buttonBorder: "border-rose-500/30 hover:border-rose-500 text-rose-500 dark:text-rose-400",
    },
  }[badgeTone];

  return (
    <div className={`p-5 sm:p-6 rounded-2xl border-2 shadow-sm space-y-4 ${toneClasses.container}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${toneClasses.iconBox}`}>
            {icon}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${toneClasses.badgeText}`}>
                {badgeLabel}
              </span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wider ${toneClasses.badgeBg}`}>
                {badgeStatus}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-[var(--color-text-primary)]">
              {headline}
            </h2>
          </div>
        </div>

        <Link
          href={linkHref}
          className={`px-3.5 py-1.5 rounded-lg bg-[var(--color-surface-card)] border text-xs font-semibold transition-all flex items-center gap-1.5 self-start shrink-0 shadow-xs ${toneClasses.buttonBorder}`}
        >
          <span>{linkText}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Clinical Rationale Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
        {rationales.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-1"
          >
            <span className="text-[9.5px] font-bold text-[var(--color-text-muted)] uppercase block">
              {item.title}
            </span>
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

