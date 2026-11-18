import React from "react";
import { AlertCircle, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface StravaSetupGuideProps {
  isGuideOpen: boolean;
  setIsGuideOpen: (open: boolean) => void;
}

export function StravaSetupGuide({
  isGuideOpen,
  setIsGuideOpen,
}: StravaSetupGuideProps) {
  return (
    <div className="space-y-2.5 font-mono">
      {!isGuideOpen ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--color-text-secondary)] py-0.5">
          <div className="flex items-center gap-2 text-[var(--color-alert-amber)]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Kredensial Strava Developer belum terisi di{" "}
              <code className="font-mono text-[var(--color-cycling)] text-[11px]">
                .env.local
              </code>
              .
            </span>
          </div>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--color-cycling)] hover:underline shrink-0 font-semibold"
          >
            <span>Lihat langkah konfigurasi</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-[var(--color-alert-amber)] font-medium pb-2 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-bold">Langkah Integrasi Strava Developer API</span>
            </div>
            <button
              onClick={() => setIsGuideOpen(false)}
              className="text-[11px] font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center gap-0.5 font-semibold"
            >
              <span>Kecilkan</span>
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            Untuk mengaktifkan sinkronisasi langsung, daftarkan aplikasi di portal pengembang Strava:
          </p>
          <ol className="text-[11px] text-[var(--color-text-primary)] space-y-2 pl-4 list-decimal marker:text-[var(--color-text-muted)]">
            <li>
              Buka portal pengembang Strava:{" "}
              <a
                href="https://www.strava.com/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-cycling)] underline font-medium"
              >
                strava.com/settings/api{" "}
                <ExternalLink className="inline w-3 h-3 ml-0.5" />
              </a>
            </li>
            <li>
              Atur <strong>Authorization Callback Domain</strong> menjadi:{" "}
              <code className="bg-[var(--color-surface-card)] px-1.5 py-0.5 rounded text-[var(--color-cycling)] font-mono border border-[var(--color-border)]">
                localhost:3000
              </code>
            </li>
            <li>
              Salin Client ID &amp; Client Secret ke file{" "}
              <code className="font-mono text-[var(--color-cycling)]">.env.local</code>:
              <div className="mt-1.5 p-2.5 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] font-mono text-[10px] text-[var(--color-text-secondary)]">
                STRAVA_CLIENT_ID=&quot;your_client_id&quot;
                <br />
                STRAVA_CLIENT_SECRET=&quot;your_client_secret&quot;
              </div>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
