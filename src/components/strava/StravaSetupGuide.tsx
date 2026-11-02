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
    <div className="space-y-2.5">
      {!isGuideOpen ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#9BA3AF] py-0.5">
          <div className="flex items-center gap-2 text-[#FF9500]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Kredensial Strava Developer belum terisi di{" "}
              <code className="font-mono text-[#D4FF00] text-[11px]">
                .env.local
              </code>
              .
            </span>
          </div>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-[#FC4C02] hover:text-[#ff6b2b] hover:underline shrink-0"
          >
            <span>Lihat langkah konfigurasi</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-[#FF9500] font-medium pb-1.5 border-b border-[#1F2430]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Langkah Integrasi Strava Developer API</span>
            </div>
            <button
              onClick={() => setIsGuideOpen(false)}
              className="text-[11px] font-mono text-[#9BA3AF] hover:text-white flex items-center gap-0.5"
            >
              <span>Kecilkan</span>
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-[#9BA3AF] leading-relaxed">
            Untuk mengaktifkan sinkronisasi langsung, daftarkan aplikasi di portal pengembang Strava:
          </p>
          <ol className="text-[11px] text-[#F0F2F5] space-y-1.5 pl-4 list-decimal marker:text-[#9BA3AF]">
            <li>
              Buka portal pengembang Strava:{" "}
              <a
                href="https://www.strava.com/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FC4C02] underline hover:text-[#ff6b2b] font-medium"
              >
                strava.com/settings/api{" "}
                <ExternalLink className="inline w-3 h-3 ml-0.5" />
              </a>
            </li>
            <li>
              Atur <strong>Authorization Callback Domain</strong> menjadi:{" "}
              <code className="bg-[#090A0F] px-1.5 py-0.5 rounded text-[#D4FF00] font-mono border border-[#1F2430]">
                localhost:3000
              </code>
            </li>
            <li>
              Salin Client ID &amp; Client Secret ke file{" "}
              <code className="font-mono text-[#00F0FF]">.env.local</code>:
              <div className="mt-1 p-2 rounded bg-[#090A0F] border border-[#1F2430] font-mono text-[10px] text-[#9BA3AF]">
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

