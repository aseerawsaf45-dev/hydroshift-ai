"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Suspense } from "react";
import {
  LayoutDashboard,
  Map,
  LineChart,
  FlaskConical,
  GitCompare,
  Database,
  BrainCircuit,
  Bell,
  FileText,
  Settings,
  X,
  Radio,
  Waves,
  Sprout,
} from "lucide-react";

export const navItems = [
  { name: "Overview", href: "/app/overview", icon: LayoutDashboard },
  { name: "Map Explorer", href: "/app/map", icon: Map },
  { name: "Crop Rotation DSS", href: "/app/crop-rotation", icon: Sprout },
  { name: "Forecasts", href: "/app/forecasts", icon: LineChart },
  { name: "Experiments", href: "/app/experiments/new", icon: FlaskConical },
  { name: "Scenarios", href: "/app/scenarios", icon: GitCompare },
  { name: "Data Hub", href: "/app/data", icon: Database },
  { name: "Models & Validation", href: "/app/models", icon: BrainCircuit },
  { name: "Alerts", href: "/app/alerts", icon: Bell },
  { name: "Reports", href: "/app/reports", icon: FileText },
];

import { BrandLogo } from "@/components/ui/BrandLogo";

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-[#08131f] text-foreground border-r border-white/10">
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        <Link 
          href="/" 
          onClick={onClose}
          className="flex items-center transition-opacity hover:opacity-95"
        >
          <BrandLogo size="sm" variant="lockup" />
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Real-time Status Badge */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-[11px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live SWOT Pass
          </span>
          <span className="font-mono text-emerald-400 font-semibold">SW241-244</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/app/overview" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive 
                  ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings / Footer */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <Link 
          href="/app/settings" 
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>System Settings</span>
        </Link>
      </div>
    </div>
  );
}

export function SidebarNav() {
  return (
    <aside className="w-[240px] hidden md:flex flex-col h-full shrink-0 z-10">
      <Suspense fallback={<div className="w-[240px] hidden md:flex h-full bg-[#08131f] border-r border-white/10" />}>
        <SidebarContent />
      </Suspense>
    </aside>
  );
}

export function MobileNavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div className="relative w-72 max-w-[85vw] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        <Suspense fallback={<div className="w-full h-full bg-[#08131f]" />}>
          <SidebarContent onClose={onClose} />
        </Suspense>
      </div>
    </div>
  );
}


