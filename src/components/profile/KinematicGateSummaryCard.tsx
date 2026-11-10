"use client";

import React from "react";
import Link from "next/link";
import { AuthoritativeAthleteHealthContext } from "@/types";
import { HeartPulse, ShieldAlert, ArrowRight, Activity, Stethoscope } from "lucide-react";

interface KinematicGateSummaryCardProps {
  healthContext: AuthoritativeAthleteHealthContext | null;
}

export function KinematicGateSummaryCard({ healthContext }: KinematicGateSummaryCardProps) {
  const readiness = healthContext?.latestReadiness;
  const injuries = healthContext?.injuries || [];
  const isConditional = readiness?.athlete_status === "ACTIVE_WITH_UNRESOLVED_SYMPTOMS";

  return (
    <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
        <div>
          <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-[var(--color-alert-red)]" />
            <span>Gerbang Keselamatan Kinematik &amp; Integritas Sendi</span>
          </h3>
          <p className="text-[10.5px] font-mono text-[var(--color-text-muted)] mt-0.5">
            Sistem Perlindungan Otomatis Lintas Disiplin (Lari &amp; Sepeda)
          </p>
        </div>

        <Link
          href="/health"
          className="text-xs font-mono font-bold text-[var(--color-alert-red)] hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0"
        >
          <span>Dossier Klinis Lengkap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Status Box */}
        <div className="p-3.5 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold text-[var(--color-text-muted)] block">
            Status Kesiapan Atlet
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConditional ? "bg-[var(--color-alert-red)] animate-pulse" : "bg-[var(--color-cycling)]"
              }`}
            />
            <span
              className={`text-xs font-mono font-bold ${
                isConditional ? "text-[var(--color-alert-red)]" : "text-[var(--color-cycling)]"
              }`}
            >
              {isConditional ? "PEMULIHAN TERPANTAU" : "SIAP BERLATIH"}
            </span>
          </div>
          <p className="text-[10px] font-mono text-[var(--color-text-muted)] leading-relaxed">
            {isConditional
              ? "Gejala sendi belum tuntas. Beban impak tinggi dibatasi otomatis oleh sistem."
              : "Semua sendi dalam kondisi prima dan diizinkan untuk overload terukur."}
          </p>
        </div>

        {/* Running Guardrail */}
        <div className="p-3.5 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold text-[var(--color-text-muted)] block">
            Protokol Lari (Running)
          </span>
          <span className="text-xs font-mono font-bold text-[var(--color-running)] flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>KONDISIONAL / DITUNDA</span>
          </span>
          <p className="text-[10px] font-mono text-[var(--color-text-muted)] leading-relaxed">
            Menunggu evaluasi klinis berkala &amp; bebas nyeri 48 jam sebelum transisi full interval.
          </p>
        </div>

        {/* Cycling Guardrail */}
        <div className="p-3.5 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold text-[var(--color-text-muted)] block">
            Protokol Sepeda (Cycling)
          </span>
          <span className="text-xs font-mono font-bold text-[var(--color-cycling)] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>AKTIF: LOW IMPACT ZONE 2</span>
          </span>
          <p className="text-[10px] font-mono text-[var(--color-text-muted)] leading-relaxed">
            Diizinkan penuh dengan cadence tinggi &gt;80 RPM pada gear datar untuk pemulihan aerobik.
          </p>
        </div>
      </div>

      {/* Monitored Joints Strip */}
      {injuries.length > 0 && (
        <div className="p-3 rounded-xl bg-[var(--color-surface-muted)]/30 border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-3.5 h-3.5 text-[var(--color-alert-red)]" />
            <span className="text-[10.5px] text-[var(--color-text-muted)]">
              Titik Anatomi Terpantau:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {injuries.map((inj) => (
                <span
                  key={inj.id}
                  className="px-2 py-0.5 rounded bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[10px] font-bold text-[var(--color-text-primary)]"
                >
                  {inj.body_region} ({inj.side})
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/health"
            className="text-[10.5px] text-[var(--color-cycling)] hover:underline font-semibold"
          >
            Log Nyeri &amp; Check-In Pasca Sesi →
          </Link>
        </div>
      )}
    </div>
  );
}
