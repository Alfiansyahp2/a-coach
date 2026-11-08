const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'src', 'components', 'goals', 'GoalsManagementHub.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state variables after activatedSuccessId
content = content.replace(
  'const [activatedSuccessId, setActivatedSuccessId] = useState<string | null>(null);',
  `const [activatedSuccessId, setActivatedSuccessId] = useState<string | null>(null);
  const [isActivatingGoalId, setIsActivatingGoalId] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ title: string; desc: string } | null>(null);`
);

// 2. Add handleSetPrimaryGoal and update handleActivateProgression
const newHandlers = `  // Set as Primary Goal and regenerate 12-week training plan
  const handleSetPrimaryGoal = async (goalId: string, title: string) => {
    setIsActivatingGoalId(goalId);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_primary", goal_id: goalId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengalibrasi target utama");
      }

      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, priority: 1 } : { ...g, priority: 2 }))
      );
      setActivatedSuccessId(goalId);
      setBannerMessage({
        title: \`Sasaran Utama Diaktifkan: "\${title}"\`,
        desc: "Rencana latihan 12-minggu dan selang waktu pemulihan telah otomatis disesuaikan khusus untuk mencapai target ini.",
      });
    } catch (err: any) {
      console.error("Error setting primary goal:", err);
      alert(\`Gagal mengaktifkan target: \${err.message}\`);
    } finally {
      setIsActivatingGoalId(null);
    }
  };

  // Activate a progressive template target
  const handleActivateProgression = async (template: ProgressionTemplate) => {
    setIsActivatingGoalId(template.id);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const targetDate = new Date(Date.now() + template.durationWeeks * 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          goal: {
            title: template.title,
            goal_type: "CUSTOM",
            sport_type: template.sport,
            priority: 1,
            target_event_name: template.focusArea,
            target_value: template.targetValue,
            current_value: template.id.includes("next-100") ? 100 : 0,
            start_date: todayStr,
            target_date: targetDate,
            is_achieved: false,
            unit: template.unit,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal membuat target baru");
      }

      const createdGoal: FitnessGoal = data.data;

      // Automatically calibrate 12-week plan for this new goal
      await fetch("/api/training/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal_id: createdGoal.id }),
      });

      setGoals((prev) => [
        createdGoal,
        ...prev.map((g) => ({ ...g, priority: 2 })),
      ]);
      setActivatedSuccessId(createdGoal.id);
      setBannerMessage({
        title: \`Target Baru Terbuka & Aktif: "\${createdGoal.title}"\`,
        desc: "Kalender latihan 12-minggu telah otomatis dikalibrasi ulang khusus untuk target ini.",
      });
    } catch (err: any) {
      console.error("Error activating progression template:", err);
      alert(\`Gagal: \${err.message}\`);
    } finally {
      setIsActivatingGoalId(null);
    }
  };`;

content = content.replace(
  /\/\/ Activate a progressive template target[\s\S]*?setTimeout\(\(\) => setActivatedSuccessId\(null\), 4000\);\s*};/,
  newHandlers
);

// 3. Update Banner to include direct Link to /training
const oldBanner = `{/* Success Notification Banner when Goal is Activated */}
      {activatedSuccessId && (
        <div className="rounded-xl bg-[var(--color-cycling)]/15 border-2 border-[var(--color-cycling)] p-4 flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-cycling)] text-[var(--color-canvas)] flex items-center justify-center font-bold shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wide block">
                Target Progresif Berhasil Diaktifkan!
              </span>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Sasaran baru telah ditambahkan ke dalam telemetri aktif Anda. Sesi latihan berikutnya akan otomatis dikaitkan ke target ini.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivatedSuccessId(null)}
            className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            ✕
          </button>
        </div>
      )}`;

const newBanner = `{/* Success Notification Banner when Goal is Activated */}
      {activatedSuccessId && (
        <div className="rounded-2xl bg-[var(--color-endurance)]/10 border-2 border-[var(--color-endurance)] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200 shadow-lg">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-endurance)] text-[var(--color-canvas)] flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-0.5">
              <span className="font-mono text-xs sm:text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wide block">
                {bannerMessage?.title || "Sasaran Utama Berhasil Diaktifkan!"}
              </span>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
                {bannerMessage?.desc || "Kalender latihan 12-minggu telah otomatis dikalibrasi ulang khusus untuk target ini. Seluruh jadwal dan selang istirahat kini selaras."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <Link
              href="/training"
              className="px-3.5 py-2 rounded-xl bg-[var(--color-endurance)] hover:opacity-90 text-[var(--color-canvas)] text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>Buka Kalender Latihan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                setActivatedSuccessId(null);
                setBannerMessage(null);
              }}
              className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-all"
            >
              ✕
            </button>
          </div>
        </div>
      )}`;

content = content.replace(oldBanner, newBanner);

// 4. Add action button to each card in filteredGoals
const cardActionBlock = `
              {/* Target Controller Action Bar */}
              <div className="pt-3 border-t border-[var(--color-border)]/60 flex items-center justify-between gap-2">
                {g.priority === 1 ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--color-endurance)]/15 border border-[var(--color-endurance)]/30 text-[var(--color-endurance)] font-mono text-[11px] font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>★ SASARAN UTAMA AKTIF</span>
                    </span>
                    <Link
                      href="/training"
                      className="px-3 py-1.5 rounded-lg bg-[var(--color-endurance)] hover:opacity-90 text-[var(--color-canvas)] text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Lihat Kalender</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                      Prioritas Sekunder
                    </span>
                    <button
                      onClick={() => handleSetPrimaryGoal(g.id, g.title)}
                      disabled={isActivatingGoalId === g.id}
                      className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-endurance)] text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-95 disabled:opacity-50"
                    >
                      {isActivatingGoalId === g.id ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 animate-spin text-[var(--color-endurance)]" />
                          <span>Mengalibrasi...</span>
                        </>
                      ) : (
                        <>
                          <Target className="w-3.5 h-3.5 text-[var(--color-endurance)]" />
                          <span>🎯 Jadikan Sasaran Utama</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>`;

content = content.replace(
  '            </div>\r\n          );\r\n        })}',
  cardActionBlock + '\r\n          );\r\n        })}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated GoalsManagementHub.tsx');
