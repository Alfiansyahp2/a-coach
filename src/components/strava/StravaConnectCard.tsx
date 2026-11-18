"use client";

import React from "react";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";
import { StravaSetupGuide } from "./StravaSetupGuide";
import { StravaConnectedView } from "./StravaConnectedView";
import { useStravaConnect } from "./useStravaConnect";

export function StravaConnectCard() {
  const {
    status,
    loading,
    disconnecting,
    syncing,
    syncTelemetry,
    banner,
    setBanner,
    isGuideOpen,
    setIsGuideOpen,
    fetchStatus,
    handleSync,
    handleDisconnect,
  } = useStravaConnect();

  return (
    <div className="w-full rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 sm:p-5 transition-all shadow-xs">
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
            className="text-[10px] opacity-70 hover:opacity-100 uppercase tracking-wider font-semibold ml-2 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-strava)]/10 border border-[var(--color-strava)]/30 flex items-center justify-center text-[var(--color-strava)] shrink-0 shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
                Integrasi Strava API v3
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
                      Tersambung
                    </>
                  ) : status?.isConfigured ? (
                    "Terputus"
                  ) : (
                    "Konfigurasi Wajib"
                  )}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] hidden sm:block font-mono">
              OAuth 2.0 PKCE Handshake &amp; Telemetri Sinkron
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {!status?.isConfigured && !loading && (
            <button
              onClick={() => setIsGuideOpen(!isGuideOpen)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{isGuideOpen ? "Tutup Panduan" : "Panduan Setup"}</span>
              {isGuideOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={fetchStatus}
            disabled={loading}
            title="Periksa Ulang Konfigurasi"
            className="p-1.5 rounded-lg text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[var(--color-strava)]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Body States */}
      <div className="pt-3">
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-3 text-xs font-mono text-[var(--color-text-muted)]">
            <RefreshCw className="w-4 h-4 animate-spin text-[var(--color-strava)]" />
            <span>Memeriksa status integrasi Strava OAuth...</span>
          </div>
        ) : !status?.isConfigured ? (
          <StravaSetupGuide isGuideOpen={isGuideOpen} setIsGuideOpen={setIsGuideOpen} />
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
              Otorisasikan koneksi profil Strava Anda untuk menyinkronkan rute GPS, detak jantung, daya watt, dan kadensi ke dalam buku jurnal telemetri latihan.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href="/api/auth/strava/authorize"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-strava)] hover:opacity-90 text-white font-medium text-xs tracking-wide transition-all active:scale-[0.98] font-mono shadow-xs"
              >
                <Activity className="w-4 h-4" />
                <span>Hubungkan dengan Strava</span>
              </a>

              <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
                <span>Enkripsi AES-256-GCM. Izin read-only terverifikasi.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
