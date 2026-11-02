import React, { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getActivities, getUser, DEFAULT_USER_ID } from "@/lib/db";
import { ActivityManagementDeck } from "@/components/ActivityManagementDeck";
import {
  ArrowLeft,
  FolderKanban,
  ShieldCheck,
  RefreshCw,
  Heart,
} from "lucide-react";

export const metadata = {
  title: "Activity Management & Grouping Hub | a-coach",
  description: "Manajemen pengelompokan aktivitas, kategorisasi sesi, dan kalibrasi telemetri atletik.",
};

async function ActivityManagementContent() {
  await connection();
  const [activities, user] = await Promise.all([
    getActivities(DEFAULT_USER_ID, { limit: 200 }),
    getUser(DEFAULT_USER_ID),
  ]);

  return (
    <div className="space-y-6">
      <ActivityManagementDeck activities={activities} />
    </div>
  );
}

function ActivityManagementSkeleton() {
  return (
    <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#9BA3AF]">
      <RefreshCw className="w-5 h-5 animate-spin text-[#00F0FF]" />
      <span className="text-xs font-mono uppercase tracking-wider text-[#5A6272]">
        Memuat Registry Aktivitas & Data Pengelompokan...
      </span>
    </div>
  );
}

export default function ActivitiesPage() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F0F2F5] flex flex-col font-sans selection:bg-[#00F0FF]/30 selection:text-white">
      {/* Precision Top Navigation Header */}
      <header className="border-b border-[#1F2430] bg-[#090A0F]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#9BA3AF] hover:text-white px-2.5 py-1 rounded-sm bg-[#12151D] border border-[#1F2430] transition-colors font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            <div className="h-4 w-px bg-[#1F2430]" />

            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white font-mono">
                a-coach
              </span>
              <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-sm bg-[#12151D] text-[#00F0FF] border border-[#1F2430]">
                REGISTRY & GROUPING
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#5A6272]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>PostgreSQL Synchronized</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        <Suspense fallback={<ActivityManagementSkeleton />}>
          <ActivityManagementContent />
        </Suspense>
      </main>

      {/* Technical Stoic Footer */}
      <footer className="border-t border-[#1F2430] py-4 text-center text-[11px] text-[#5A6272] font-mono">
        a-coach • Activity Categorization & Telemetry Management Hub • Next.js 16 + PostgreSQL 16
      </footer>
    </div>
  );
}

