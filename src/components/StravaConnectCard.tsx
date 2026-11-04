"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { StravaSetupGuide } from "./strava/StravaSetupGuide";
import { StravaConnectedView } from "./strava/StravaConnectedView";

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
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

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
        const syncRes = await fetch("/api/strava/sync");
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          setSyncTelemetry(syncData);
        }
        router.refresh();
      } else {
        setBanner({
          type: "error",
          message:
            data.message || "Failed to synchronize activities from Strava.",
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
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } else if (params.get("error")) {
        const reason = params.get("reason") || params.get("error");
        setBanner({
          type: "error",
          message: `Strava authentication failed: ${decodeURIComponent(
            reason || ""
          )}`,
        });
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    }
  }, []);

  const handleDisconnect = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect your Strava account? Local tokens will be revoked and cleared."
      )
    ) {
      return;
    }

    try {
      setDisconnecting(true);
      const res = await fetch("/api/auth/strava/disconnect", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setBanner({
          type: "success",
          message: "Strava account disconnected and token revoked.",
        });
        await fetchStatus();
      } else {
        setBanner({
          type: "error",
          message: data.message || "Failed to disconnect account.",
        });
      }
    } catch (err: any) {
      setBanner({
        type: "error",
        message: err.message || "An unexpected error occurred.",
      });
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 sm:p-5 transition-all shadow-xs">
      {/* Notification Banner */}
      {banner && (
        <div
          className={`mb-4 p-3 rounded-lg text-xs font-mono flex items-start gap-3 border ${
            banner.type === "success"
              ? "bg-[var(--color-surface-muted)] border-[var(--color-cycling)]/40 text-[var(--color-cycling)]"
              : "bg-[var(--color-surface-muted)] border-[var(--color-alert-red)]/40 text-[var(--color-alert-red)]"
          }`}
        >
          {banner.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-cycling)]" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-alert-red)]" />
          )}
          <span className="flex-1">{banner.message}</span>
          <button
            onClick={() => setBanner(null)}
            className="text-[10px] opacity-70 hover:opacity-100 uppercase tracking-wider font-semibold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-strava)]/10 border border-[var(--color-strava)]/30 flex items-center justify-center text-[var(--color-strava)] shrink-0 shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
                Strava API v3 Integration
              </h2>
              {!loading && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    status?.isConnected
                      ? "bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30"
                      : status?.isConfigured
                      ? "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                      : "bg-[var(--color-alert-amber)]/10 text-[var(--color-alert-amber)] border border-[var(--color-alert-amber)]/30"
                  }`}
                >
                  {status?.isConnected ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cycling)] animate-pulse" />
                      Active Link
                    </>
                  ) : status?.isConfigured ? (
                    "Disconnected"
                  ) : (
                    "Config Required"
                  )}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] hidden sm:block font-mono">
              OAuth 2.0 PKCE Handshake &amp; Telemetry Bridge
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {!status?.isConfigured && !loading && (
            <button
              onClick={() => setIsGuideOpen(!isGuideOpen)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] transition-colors flex items-center gap-1"
            >
              <span>{isGuideOpen ? "Tutup Panduan" : "Panduan Setup"}</span>
              {isGuideOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          <button
            onClick={fetchStatus}
            disabled={loading}
            title="Re-check configuration"
            className="p-1.5 rounded-lg text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                loading ? "animate-spin text-[var(--color-strava)]" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Body States */}
      <div className="pt-3">
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-3 text-xs font-mono text-[var(--color-text-muted)]">
            <RefreshCw className="w-4 h-4 animate-spin text-[var(--color-strava)]" />
            <span>Checking Strava OAuth connection state...</span>
          </div>
        ) : !status?.isConfigured ? (
          <StravaSetupGuide
            isGuideOpen={isGuideOpen}
            setIsGuideOpen={setIsGuideOpen}
          />
        ) : status?.isConnected && status.athlete ? (
          <StravaConnectedView
            athlete={status.athlete}
            syncTelemetry={syncTelemetry}
            disconnecting={disconnecting}
            syncing={syncing}
            onDisconnect={handleDisconnect}
            onSync={handleSync}
          />
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-mono">
              Authorize connection with your Strava profile to synchronize GPS
              tracks, heart rate streams, power wattages, and cadence for planned
              workout comparisons.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href="/api/auth/strava/authorize"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-strava)] hover:opacity-90 text-white font-medium text-xs tracking-wide transition-all active:scale-[0.98] font-mono shadow-xs"
              >
                <Activity className="w-4 h-4" />
                <span>Connect with Strava</span>
              </a>

              <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
                <span>
                  Encrypted via AES-256-GCM. Read-only permissions requested.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
