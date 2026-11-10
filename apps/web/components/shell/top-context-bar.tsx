"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Menu, Bell, Search, Waves, Command } from "lucide-react";
import Link from "next/link";
import { GlobalSearchDialog } from "@/components/ui/GlobalSearchDialog";

export function TopContextBar({ onToggleMobileNav }: { onToggleMobileNav?: () => void }) {
  const [stats, setStats] = useState<{ status: string; total_monitoring_sites: number; total_hydro_observations: number } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    fetch(`${API_URL}/api/v1/reaches/stats/summary`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, []);

  return (
    <>
      <header className="h-14 md:h-16 flex items-center justify-between px-3 sm:px-6 bg-[#08131f]/90 backdrop-blur-md border-b border-white/10 z-20 shrink-0">
        {/* Mobile Hamburger + Title */}
        <div className="flex md:hidden items-center gap-2.5">
          <button
            onClick={onToggleMobileNav}
            aria-label="Open Navigation"
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-foreground hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          <Link href="/app/overview" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Waves className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-bold text-xs uppercase tracking-tight text-foreground">HydroShift AI</span>
          </Link>
        </div>

        {/* Desktop Context Info */}
        <div className="hidden md:flex items-center gap-5">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Active Region</span>
            <span className="text-xs font-semibold text-foreground">Southwest Bangladesh (Khulna Delta)</span>
          </div>
          
          <div className="h-6 w-px bg-white/10" />
          
          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {stats ? "Harmonized Data" : "Live Stream"}
            </Badge>
            <span className="text-[11px] text-muted-foreground font-mono">
              {stats ? `${stats.total_monitoring_sites} Sites • ${stats.total_hydro_observations} Passes` : "SWOT & BWDB Network"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Interactive Fast Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-48 sm:w-56 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 flex items-center justify-between px-3 text-muted-foreground hover:text-white transition-all text-left"
            title="Search upazilas, rivers, and tools (Ctrl+K)"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] truncate">Search reaches, tools...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-muted-foreground">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>

          {/* Bell Notification */}
          <Link
            href="/app/alerts" 
            aria-label="Alerts"
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative"
            title="View Real-Time Salinity & Flap-Gate Alerts"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 animate-pulse" />
          </Link>

          {/* User Badge */}
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30" title="Space Apps / Khulna Project Pilot">
            <span className="text-xs font-bold text-primary">KH</span>
          </div>
        </div>
      </header>

      {/* Global Modals */}
      <GlobalSearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

