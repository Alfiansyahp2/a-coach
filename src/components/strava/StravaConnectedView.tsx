import React from "react";
import {
  ShieldCheck,
  Zap,
  ArrowDownToLine,
  RefreshCw,
  Clock,
  LogOut,
} from "lucide-react";

interface StravaAthlete {
  id: number;
  name: string;
  username: string | null;
  avatar: string | null;
  scopes: string[];
  connectedAt: string;
}

interface StravaConnectedViewProps {
  athlete: StravaAthlete;
  syncTelemetry: {
    lastSync: any;
    latestActivityDate: string | null;
  } | null;
  disconnecting: boolean;
  syncing: boolean;
  onDisconnect: () => void;
  onSync: () => void;
}

export function StravaConnectedView({
  athlete,
  syncTelemetry,
  disconnecting,
  syncing,
  onDisconnect,
  onSync,
}: StravaConnectedViewProps) {
  return (
    <div className="space-y-4 font-mono">
      {/* Athlete Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
        <div className="flex items-center gap-3.5">
          {athlete.avatar ? (
            <img
              src={athlete.avatar}
              alt={athlete.name}
              className="w-12 h-12 rounded-lg border border-[var(--color-border)] object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center font-bold text-base text-[var(--color-text-primary)]">
              {athlete.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              {athlete.name}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] font-mono">
              Athlete ID:{" "}
              <span className="text-[var(--color-text-primary)] font-tabular">{athlete.id}</span>
              {athlete.username && ` • @${athlete.username}`}
            </p>
          </div>
        </div>

        <button
          onClick={onDisconnect}
          disabled={disconnecting}
          className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--color-alert-red)] bg-[var(--color-alert-red)]/10 hover:bg-[var(--color-alert-red)]/20 border border-[var(--color-alert-red)]/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {disconnecting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span>Disconnect</span>
        </button>
      </div>

      {/* Scope & Security Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)] mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span className="font-semibold">Encryption at Rest</span>
          </div>
          <p className="text-[var(--color-text-primary)] font-mono font-bold">
            AES-256-GCM (Authenticated)
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)] mb-1">
            <Zap className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span className="font-semibold">Authorized Scopes</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {athlete.scopes.map((scope) => (
              <span
                key={scope}
                className="px-2 py-0.5 rounded-md bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-mono text-[10px]"
              >
                {scope}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Synchronization Panel */}
      <div className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-[var(--color-cycling)]" />
              <h4 className="text-xs font-bold text-[var(--color-text-primary)] tracking-wide uppercase">
                Incremental Activity Sync
              </h4>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Sinkronisasi aktivitas endurance terkini ke basis data lokal dan pemadanan otomatis jadwal latihan.
            </p>
          </div>

          <button
            onClick={onSync}
            disabled={syncing || disconnecting}
            className="px-4 py-2 rounded-md text-xs font-semibold text-white bg-[var(--color-cycling)] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 shadow-xs"
          >
            {syncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses Data...</span>
              </>
            ) : (
              <>
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>Sync Activities Now</span>
              </>
            )}
          </button>
        </div>

        {/* Sync Telemetry Status Strip */}
        {syncTelemetry?.lastSync && (
          <div className="pt-2 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--color-text-secondary)] font-tabular">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              <span>
                Last Synced:{" "}
                <span className="text-[var(--color-text-primary)] font-mono font-medium">
                  {new Date(syncTelemetry.lastSync.completed_at).toLocaleString("id-ID", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                  syncTelemetry.lastSync.status === "SUCCESS"
                    ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30"
                    : "bg-[var(--color-alert-red)]/15 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/30"
                }`}
              >
                {syncTelemetry.lastSync.status}
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span>
                Fetched:{" "}
                <span className="text-[var(--color-text-primary)] font-tabular">
                  {syncTelemetry.lastSync.activities_fetched}
                </span>
              </span>
              <span>•</span>
              <span>
                Created:{" "}
                <span className="text-[var(--color-cycling)] font-tabular">
                  +{syncTelemetry.lastSync.activities_created}
                </span>
              </span>
              <span>•</span>
              <span>
                Updated:{" "}
                <span className="text-[var(--color-text-secondary)] font-tabular">
                  {syncTelemetry.lastSync.activities_updated}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
