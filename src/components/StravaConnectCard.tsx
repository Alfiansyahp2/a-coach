"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Zap,
  ArrowDownToLine,
  Clock,
  CheckCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface StravaAthlete {
  id: number;
  name: string;
  username: string | null;
  avatar: string | null;
  scopes: string[];
  connectedAt: string;
}

interface StravaStatusResponse {
  isConfigured: boolean;
  isConnected: boolean;
  athlete: StravaAthlete | null;
  message?: string;
}

export function StravaConnectCard() {
  const router = useRouter();
  const [status, setStatus] = useState<StravaStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncTelemetry, setSyncTelemetry] = useState<{
    lastSync: any;
    latestActivityDate: string | null;
  } | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch current status and sync telemetry
  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/strava/status");
      const data = await res.json();
      setStatus(data);

      if (data.isConnected) {
        try {
          const syncRes = await fetch("/api/strava/sync");
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            setSyncTelemetry(syncData);
          }
        } catch (syncErr) {
          console.error("Failed to load sync telemetry:", syncErr);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch Strava status:", err);
      setStatus({
        isConfigured: false,
        isConnected: false,
        athlete: null,
        message: "Failed to communicate with server",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/strava/sync", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.success) {
        setBanner({
          type: "success",
          message: `Synced ${data.fetched} activities (${data.created} new, ${data.updated} updated, ${data.matched} matched with planned workouts).`,
        });
        // Refresh telemetry & server components
        const syncRes = await fetch("/api/strava/sync");
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          setSyncTelemetry(syncData);
        }
        router.refresh();
      } else {
        setBanner({
          type: "error",
          message: data.message || "Failed to synchronize activities from Strava.",
        });
      }
    } catch (err: any) {
      setBanner({
        type: "error",
        message: err.message || "An error occurred while syncing with Strava.",
      });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Parse query params for redirect feedback
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("connected") === "true") {
        const athleteName = params.get("athlete") || "Athlete";
        setBanner({
          type: "success",
          message: `Successfully connected to Strava as ${athleteName}!`,
        });
        // Clean URL without reload
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (params.get("error")) {
        const reason = params.get("reason") || params.get("error");
        setBanner({
          type: "error",
          message: `Strava authentication failed: ${decodeURIComponent(reason || "")}`,
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your Strava account? Local tokens will be revoked and cleared.")) {
      return;
    }

    try {
      setDisconnecting(true);
      const res = await fetch("/api/auth/strava/disconnect", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setBanner({ type: "success", message: "Strava account disconnected and token revoked." });
        await fetchStatus();
      } else {
        setBanner({ type: "error", message: data.message || "Failed to disconnect account." });
      }
    } catch (err: any) {
      setBanner({ type: "error", message: err.message || "An unexpected error occurred." });
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="w-full bg-[#12151D] border border-[#232838] rounded-xl p-6 shadow-2xl transition-all">
      {/* Notification Banner */}
      {banner && (
        <div
          className={`mb-5 p-3.5 rounded-lg text-sm flex items-start gap-3 border ${
            banner.type === "success"
              ? "bg-[#052e16] border-[#10b981]/40 text-[#4ade80]"
              : "bg-[#3f0713] border-[#f43f5e]/40 text-[#fda4af]"
          }`}
        >
          {banner.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[#10b981]" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#f43f5e]" />
          )}
          <span className="flex-1">{banner.message}</span>
          <button
            onClick={() => setBanner(null)}
            className="text-xs opacity-70 hover:opacity-100 uppercase tracking-wider font-semibold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-[#232838]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FC4C02]/10 border border-[#FC4C02]/30 flex items-center justify-center text-[#FC4C02]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F0F2F5] tracking-tight">
              Strava API v3 Integration
            </h2>
            <p className="text-xs text-[#9BA3AF]">
              OAuth 2.0 PKCE Handshake & Telemetry Bridge
            </p>
          </div>
        </div>

        {/* State Badge */}
        {!loading && (
          <div className="flex items-center gap-2">
            {status?.isConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                Active Link
              </span>
            ) : status?.isConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#9BA3AF]/10 text-[#9BA3AF] border border-[#9BA3AF]/30">
                Disconnected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/30">
                Config Required
              </span>
            )}
          </div>
        )}
      </div>

      {/* Body States */}
      <div className="pt-5">
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-3 text-sm text-[#9BA3AF]">
            <RefreshCw className="w-4 h-4 animate-spin text-[#FC4C02]" />
            <span>Checking Strava OAuth connection state...</span>
          </div>
        ) : !status?.isConfigured ? (
          // State: Missing Credentials
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#1A1E28] border border-[#2B3245] space-y-2">
              <div className="flex items-center gap-2 text-[#FF9500] text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>API Credentials Missing in .env.local</span>
              </div>
              <p className="text-xs text-[#9BA3AF] leading-relaxed">
                To connect with Strava, register a developer application on the official Strava portal and populate your credentials:
              </p>
              <ol className="text-xs text-[#F0F2F5] space-y-1 pl-4 list-decimal marker:text-[#9BA3AF]">
                <li>Visit <a href="https://www.strava.com/settings/api" target="_blank" rel="noopener noreferrer" className="text-[#FC4C02] underline hover:text-[#ff6b2b]">strava.com/settings/api <ExternalLink className="inline w-3 h-3 ml-0.5" /></a></li>
                <li>Set <strong>Authorization Callback Domain</strong> to: <code className="bg-[#12151D] px-1.5 py-0.5 rounded text-[#D4FF00] font-mono">localhost:3000</code></li>
                <li>Add <code className="text-[#00F0FF] font-mono">STRAVA_CLIENT_ID</code> and <code className="text-[#00F0FF] font-mono">STRAVA_CLIENT_SECRET</code> to your <code className="font-mono">.env.local</code></li>
              </ol>
            </div>
            <button
              onClick={fetchStatus}
              className="text-xs text-[#9BA3AF] hover:text-[#F0F2F5] flex items-center gap-1.5 transition-colors font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-check Configuration
            </button>
          </div>
        ) : status?.isConnected && status.athlete ? (
          // State: Connected
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#161922] border border-[#232838]">
              <div className="flex items-center gap-3.5">
                {status.athlete.avatar ? (
                  <img
                    src={status.athlete.avatar}
                    alt={status.athlete.name}
                    className="w-12 h-12 rounded-full border border-[#232838] object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#1A1E28] border border-[#2B3245] flex items-center justify-center font-bold text-base text-[#F0F2F5]">
                    {status.athlete.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-[#F0F2F5]">
                    {status.athlete.name}
                  </h3>
                  <p className="text-xs text-[#9BA3AF] font-mono">
                    Athlete ID: <span className="text-[#F0F2F5] font-tabular">{status.athlete.id}</span>
                    {status.athlete.username && ` • @${status.athlete.username}`}
                  </p>
                </div>
              </div>

              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#f43f5e] bg-[#f43f5e]/10 hover:bg-[#f43f5e]/20 border border-[#f43f5e]/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
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
              <div className="p-3 rounded-lg bg-[#161922] border border-[#232838]">
                <div className="flex items-center gap-1.5 text-[#9BA3AF] mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>Encryption at Rest</span>
                </div>
                <p className="text-[#F0F2F5] font-mono font-medium">AES-256-GCM (Authenticated)</p>
              </div>

              <div className="p-3 rounded-lg bg-[#161922] border border-[#232838]">
                <div className="flex items-center gap-1.5 text-[#9BA3AF] mb-1">
                  <Zap className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>Authorized Scopes</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {status.athlete.scopes.map((scope) => (
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
            <div className="p-4 rounded-lg bg-[#161922] border border-[#232838] space-y-3">
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
                  onClick={handleSync}
                  disabled={syncing || disconnecting}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#FC4C02] hover:bg-[#e04300] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-[#FC4C02]/20 disabled:opacity-50"
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
                <div className="pt-2 border-t border-[#232838]/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#9BA3AF]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#5A6272]" />
                    <span>
                      Last Synced:{" "}
                      <span className="text-[#F0F2F5] font-mono font-medium">
                        {new Date(syncTelemetry.lastSync.completed_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
        ) : (
          // State: Disconnected & Ready to Link
          <div className="space-y-4">
            <p className="text-xs text-[#9BA3AF] leading-relaxed">
              Authorize connection with your Strava profile to synchronize GPS tracks, heart rate streams, power wattages, and cadence for planned workout comparisons.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href="/api/auth/strava/authorize"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#FC4C02] hover:bg-[#e04300] text-white font-medium text-xs tracking-wide shadow-lg shadow-[#FC4C02]/20 transition-all active:scale-[0.98]"
              >
                <Activity className="w-4 h-4" />
                <span>Connect with Strava</span>
              </a>

              <div className="flex items-center gap-1.5 text-[11px] text-[#5A6272]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Encrypted via AES-256-GCM. Read-only permissions requested.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

