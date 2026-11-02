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
    <div className="space-y-5">
      {/* Athlete Header */}
      <div className="flex items-center justify-between p-4 rounded-sm bg-[#161922] border border-[#1F2430]">
        <div className="flex items-center gap-3.5">
          {athlete.avatar ? (
            <img
              src={athlete.avatar}
              alt={athlete.name}
              className="w-12 h-12 rounded-sm border border-[#1F2430] object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-sm bg-[#1A1E28] border border-[#2B3245] flex items-center justify-center font-bold text-base text-[#F0F2F5]">
              {athlete.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-[#F0F2F5]">
              {athlete.name}
            </h3>
            <p className="text-xs text-[#9BA3AF] font-mono">
              Athlete ID:{" "}
              <span className="text-[#F0F2F5] font-tabular">{athlete.id}</span>
              {athlete.username && ` • @${athlete.username}`}
            </p>
          </div>
        </div>

        <button
          onClick={onDisconnect}
          disabled={disconnecting}
          className="px-3 py-1.5 rounded-sm text-xs font-medium text-[#f43f5e] bg-[#f43f5e]/10 hover:bg-[#f43f5e]/20 border border-[#f43f5e]/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
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
        <div className="p-3 rounded-sm bg-[#161922] border border-[#1F2430]">
          <div className="flex items-center gap-1.5 text-[#9BA3AF] mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Encryption at Rest</span>
          </div>
          <p className="text-[#F0F2F5] font-mono font-medium">
            AES-256-GCM (Authenticated)
          </p>
        </div>

        <div className="p-3 rounded-sm bg-[#161922] border border-[#1F2430]">
          <div className="flex items-center gap-1.5 text-[#9BA3AF] mb-1">
            <Zap className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Authorized Scopes</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {athlete.scopes.map((scope) => (
              <span
                key={scope}
                className="px-1.5 py-0.5 rounded bg-[#1A1E28] text-[#9BA3AF] font-mono text-[10px]"
              >
                {scope}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Synchronization Panel */}
      <div className="p-4 rounded-sm bg-[#161922] border border-[#1F2430] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-[#FC4C02]" />
              <h4 className="text-xs font-semibold text-[#F0F2F5] tracking-wide uppercase">
                Incremental Activity Sync
              </h4>
            </div>
            <p className="text-[11px] text-[#9BA3AF]">
              Ingest recent endurance workouts into PostgreSQL and run auto-matching with planned training.
            </p>
          </div>

          <button
            onClick={onSync}
            disabled={syncing || disconnecting}
            className="px-4 py-2 rounded-sm text-xs font-semibold text-white bg-[#FC4C02] hover:bg-[#e04300] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {syncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Ingesting Activities...</span>
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
          <div className="pt-2 border-t border-[#1F2430]/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#9BA3AF]">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#5A6272]" />
              <span>
                Last Synced:{" "}
                <span className="text-[#F0F2F5] font-mono font-medium">
                  {new Date(syncTelemetry.lastSync.completed_at).toLocaleString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                  syncTelemetry.lastSync.status === "SUCCESS"
                    ? "bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30"
                    : "bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/30"
                }`}
              >
                {syncTelemetry.lastSync.status}
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span>
                Fetched:{" "}
                <span className="text-[#F0F2F5] font-tabular">
                  {syncTelemetry.lastSync.activities_fetched}
                </span>
              </span>
              <span>•</span>
              <span>
                Created:{" "}
                <span className="text-[#10b981] font-tabular">
                  +{syncTelemetry.lastSync.activities_created}
                </span>
              </span>
              <span>•</span>
              <span>
                Updated:{" "}
                <span className="text-[#00F0FF] font-tabular">
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

