"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Menu, Bell, Search, Waves } from "lucide-react";

export function TopContextBar({ onToggleMobileNav }: { onToggleMobileNav?: () => void }) {
  const [stats, setStats] = useState<{ status: string; total_monitoring_sites: number; total_hydro_observations: number } | null>(null);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    fetch(`${API_URL}/api/v1/reaches/stats/summary`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, []);

  return (
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

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Waves className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-bold text-xs uppercase tracking-tight text-foreground">HydroShift AI</span>
        </div>
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
        {/* Desktop Search */}
        <div className="relative group hidden lg:block">
          <div className="w-56 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center px-3 transition-colors group-hover:border-primary/50">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground ml-2.5">Search reaches or gauges...</span>
          </div>
        </div>

        {/* Mobile Status Dot Indicator */}
        <div className="flex md:hidden items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live</span>
        </div>

        {/* Bell Notification */}
        <button 
          aria-label="Alerts"
          className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="w-2 h-2 rounded-full bg-destructive absolute top-1.5 right-1.5" />
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
          <span className="text-xs font-bold text-primary">SC</span>
        </div>
      </div>
    </header>
  );
}

