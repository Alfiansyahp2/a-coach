import React from "react";
import Link from "next/link";
import { Target, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Flame } from "lucide-react";
import { FitnessGoal } from "@/types";

interface DashboardMacroGoalsCardProps {
  goals: FitnessGoal[];
}

export function DashboardMacroGoalsCard({
  goals,
}: DashboardMacroGoalsCardProps) {
  if (goals.length === 0) return null;

  const primaryGoal =
    goals.find((g) => g.is_primary) ||
    goals.find((g) => g.priority === 1) ||
    goals[0];

  const secondaryGoals = goals.filter((g) => g.id !== primaryGoal?.id);

  const hasAchievedMilestone = goals.some(
    (g) => g.is_achieved || Number(g.current_value) >= Number(g.target_value)
  );

  return (
    <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 sm:p-5 space-y-4 shadow-xs font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <div>
          <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Target className="w-4 h-4 text-[var(--color-cycling)]" />
            <span>Sasaran &amp; Target Utama Atlet</span>
          </h3>
          <p className="text-[10px] font-mono text-[var(--color-text-muted)] mt-0.5">
            Satu sasaran utama memimpin seluruh preskripsi beban 12-minggu
          </p>
        </div>
        <Link
          href="/goals"
          className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-semibold hover:text-[var(--color-text-primary)] hover:border-[var(--color-cycling)]/60 transition-colors flex items-center gap-1 shrink-0"
        >
          <span>{goals.length} Sasaran</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </Link>
      </div>

      {/* 1. HERO SHOWCASE: TARGET UTAMA (AUTHORITATIVE PRIMARY GOAL) */}
      {primaryGoal && (() => {
        const currentNum = Number(primaryGoal.current_value);
        const targetNum = Number(primaryGoal.target_value);
        const pct = Math.min(100, Math.round((currentNum / targetNum) * 100));
        const isAchieved = primaryGoal.is_achieved || pct >= 100;
        const isKm = primaryGoal.unit === "km" || primaryGoal.goal_type === "DISTANCE_MONTHLY";

        const currentDisplay = isKm ? `${currentNum.toFixed(1)} km` : `${currentNum} ${primaryGoal.unit || "sesi"}`;
        const targetDisplay = isKm ? `${targetNum.toFixed(0)} km` : `${targetNum} ${primaryGoal.unit || "sesi"}`;

        const is100k = primaryGoal.title.toLowerCase().includes("100");
        const isMarathon = primaryGoal.title.toLowerCase().includes("marathon");
        const colorToken = is100k
          ? "var(--color-cycling)"
          : isMarathon
          ? "var(--color-running)"
          : "var(--color-endurance)";

        return (
          <div className="rounded-xl border border-[var(--color-border)] border-t-2 border-t-[var(--color-cycling)] bg-[var(--color-surface-muted)]/60 p-4 space-y-3 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/40 text-[var(--color-cycling)] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Target className="w-3 h-3" />
                <span>TARGET UTAMA (SASARAN INTI)</span>
              </span>

              {isAchieved ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/20 text-[var(--color-cycling)] border border-[var(--color-cycling)]/40 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>TERCAPAI</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                  Jatuh Tempo: {primaryGoal.target_date || "12 Minggu"}
                </span>
              )}
            </div>

            <div>
              <h4 className="font-sans font-black text-sm sm:text-base text-[var(--color-text-primary)] leading-tight">
                {primaryGoal.title}
              </h4>
              <p className="text-[11px] font-mono text-[var(--color-text-secondary)] mt-0.5 flex items-center gap-1">
                <span>Target Sekali Aktivitas:</span>
                <strong className="text-[var(--color-text-primary)]">{targetDisplay}</strong>
                <span className="text-[var(--color-text-muted)]">• Peak Single Effort</span>
              </p>
            </div>

            {/* Glowing Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-[var(--color-surface-card)] rounded-full overflow-hidden border border-[var(--color-border)] shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{
                    backgroundColor: isAchieved ? "var(--color-cycling)" : colorToken,
                    width: `${pct}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[var(--color-text-secondary)]">
                  Rekor Terbaik: <strong className="text-[var(--color-text-primary)] font-tabular font-bold">{currentDisplay}</strong>
                </span>
                <span className="font-tabular font-black text-xs" style={{ color: colorToken }}>
                  {pct}%
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--color-text-muted)] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[var(--color-cycling)]" />
                <span>Memimpin Kalender 12-Minggu</span>
              </span>
              <Link
                href="/training"
                className="px-2.5 py-1 rounded-lg bg-[var(--color-surface-muted)] hover:bg-[var(--color-cycling)] hover:text-[var(--color-canvas)] text-[var(--color-text-primary)] border border-[var(--color-border)] text-[10px] font-mono font-bold transition-all flex items-center gap-1"
              >
                <span>Lihat Kalender</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        );
      })()}

      {/* Progressive Unlock Gateway Banner when milestone meets criteria */}
      {hasAchievedMilestone && (
        <Link
          href="/goals"
          className="p-3 rounded-xl bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/40 hover:border-[var(--color-cycling)] transition-all flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[var(--color-cycling)] shrink-0" />
            <div className="min-w-0">
              <span className="font-mono text-xs font-bold text-[var(--color-cycling)] block truncate">
                🎯 Tonggak Sasaran Memenuhi Target!
              </span>
              <span className="text-[10px] text-[var(--color-text-secondary)] block truncate">
                Target lanjutan sepeda (Gran Fondo / 200 km) telah terbuka di halaman /goals
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-[var(--color-cycling)] text-[var(--color-canvas)] text-[10px] font-mono font-bold shrink-0 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Buka &amp; Klaim</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      )}

      {/* 2. SECONDARY GOALS REGISTRY */}
      {secondaryGoals.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">
            <span>Sasaran Pendukung / Sekunder</span>
            <span>{secondaryGoals.length} Target</span>
          </div>

          <div className="space-y-2.5">
            {secondaryGoals.map((g) => {
              const currentNum = Number(g.current_value);
              const targetNum = Number(g.target_value);
              const pct = Math.min(100, Math.round((currentNum / targetNum) * 100));
              const isAchieved = g.is_achieved || pct >= 100;
              const isMeters = g.goal_type === "DISTANCE_MONTHLY";
              const isKm = g.unit === "km" || isMeters;

              const currentDisplay = isMeters
                ? `${(currentNum / 1000).toFixed(1)} km`
                : isKm
                ? `${currentNum.toFixed(1)} km`
                : `${currentNum} ${g.unit || "sesi"}`;

              const targetDisplay = isMeters
                ? `${(targetNum / 1000).toFixed(0)} km`
                : isKm
                ? `${targetNum.toFixed(1)} km`
                : `${targetNum} ${g.unit || "sesi"}`;

              const is100k = g.title.toLowerCase().includes("100");
              const isMarathon = g.title.toLowerCase().includes("marathon");

              const colorToken = is100k
                ? "var(--color-cycling)"
                : isMarathon
                ? "var(--color-running)"
                : "var(--color-endurance)";

              return (
                <Link
                  key={g.id}
                  href="/goals"
                  className="block p-3 rounded-xl bg-[var(--color-surface-muted)]/40 border border-[var(--color-border)]/60 hover:border-[var(--color-cycling)]/60 transition-all duration-200 space-y-1.5 hover:bg-[var(--color-surface-muted)] group"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--color-text-primary)] font-semibold flex items-center gap-2 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: colorToken }}
                      />
                      <span className="group-hover:text-[var(--color-cycling)] transition-colors truncate">
                        {g.title}
                      </span>
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isAchieved && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--color-cycling)]/20 text-[var(--color-cycling)] font-bold">
                          TERCAPAI
                        </span>
                      )}
                      <span
                        className="font-tabular font-extrabold text-[11px]"
                        style={{ color: isAchieved ? "var(--color-cycling)" : colorToken }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-[var(--color-surface-card)] rounded-full overflow-hidden border border-[var(--color-border)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: isAchieved ? "var(--color-cycling)" : colorToken,
                        width: `${pct}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-text-muted)]">
                    <span>
                      Tercapai: <strong className="text-[var(--color-text-secondary)] font-tabular">{currentDisplay}</strong>
                    </span>
                    <span>
                      Target: <strong className="text-[var(--color-text-primary)] font-tabular">{targetDisplay}</strong>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Link to /goals */}
      <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
        <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
          Pilih &amp; Alihkan Target Utama di Hub Sasaran
        </span>
        <Link
          href="/goals"
          className="text-[10px] font-mono text-[var(--color-cycling)] hover:underline flex items-center gap-1 font-semibold"
        >
          <span>Kelola Semua Sasaran</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
