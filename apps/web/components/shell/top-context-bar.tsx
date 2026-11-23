"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Menu, Search, Droplets, Command, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { GlobalSearchDialog } from "@/components/ui/GlobalSearchDialog";

export function TopContextBar({ onToggleMobileNav }: { onToggleMobileNav?: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);

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

          <Link href="/app/my-water" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Droplets className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-bold text-xs uppercase tracking-tight text-foreground">HydroShift</span>
          </Link>
        </div>

        {/* Desktop Context Info: Dacope Pilot Community Focus */}
        <div className="hidden md:flex items-center gap-5">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Pilot Community</span>
            <span className="text-xs font-semibold text-foreground">Dacope, Khulna (Polders 31 & 32)</span>
          </div>
          
          <div className="h-6 w-px bg-white/10" />
          
          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Field Readings Verified
            </Badge>
            <span className="text-[11px] text-muted-foreground font-mono">
              Shared EC Meter Service Active
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Facilitator Quick Call */}
          <Link
            href="/app/help"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-muted-foreground hover:text-white border border-white/10 transition-colors"
            title="Dacope Community Water Facilitator Contact"
          >
            <Phone className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">Facilitator Hotline</span>
          </Link>

          {/* Interactive Fast Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-40 sm:w-52 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 flex items-center justify-between px-3 text-muted-foreground hover:text-white transition-all text-left"
            title="Search water sources, crops, and tools (Ctrl+K)"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] truncate">Search sources, crops...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-muted-foreground">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>

          {/* Pilot Badge */}
          <Link
            href="/app/my-water"
            className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 text-xs font-bold text-primary hover:scale-105 transition-transform"
            title="Go to My Water"
          >
            DC
          </Link>
        </div>
      </header>

      {/* Global Search Dialog */}
      <GlobalSearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
