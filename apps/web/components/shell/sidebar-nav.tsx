"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Suspense, useState } from "react";
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
import { BrandLogo } from "@/components/ui/BrandLogo";

export const navSections = [
  {
    title: "Monitoring & Maps",
    items: [
      { name: "Overview", href: "/app/overview", icon: LayoutDashboard },
      { name: "Map Explorer", href: "/app/map", icon: Map, badge: "GIS" },
      { name: "Data Hub", href: "/app/data", icon: Database },
    ],
  },
  {
    title: "Decision Tools",
    items: [
      { name: "Crop Rotation DSS", href: "/app/crop-rotation", icon: Sprout, badge: "DSS" },
      { name: "Scenarios Studio", href: "/app/scenarios", icon: GitCompare, badge: "Sim" },
      { name: "14D Forecasts", href: "/app/forecasts", icon: LineChart },
    ],
  },
  {
    title: "Science & AI Models",
    items: [
      { name: "Models & Benchmark", href: "/app/models", icon: BrainCircuit, badge: "NASA" },
      { name: "Experiments", href: "/app/experiments/new", icon: FlaskConical },
      { name: "Hazard Alerts", href: "/app/alerts", icon: Bell },
      { name: "Reports", href: "/app/reports", icon: FileText },
    ],
  },
];

// Flat export for backwards compatibility
export const navItems = navSections.flatMap((s) => s.items);

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex flex-col h-full bg-[#08131f]/90 backdrop-blur-2xl text-foreground border-r border-white/10 shadow-2xl">
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
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors btn-tactile"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Real-time Status Badge */}
        <div className="px-3 py-2.5 border-b border-white/5">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] shadow-inner">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live SWOT Pass
            </span>
            <span className="font-mono text-emerald-400 font-semibold">SW241-244</span>
          </div>
        </div>

        {/* Nav Sections */}
        <nav className="flex-1 overflow-y-auto py-2.5 px-3 space-y-4 scrollbar-thin">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase font-bold tracking-wider text-muted-foreground/70">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/app/overview" && pathname.startsWith(item.href + "/"));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all btn-tactile ${
                        isActive 
                          ? "bg-gradient-to-r from-primary to-cyan-400 text-black font-bold shadow-lg shadow-primary/25 border border-primary/50" 
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5 hover:border-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "text-black scale-105" : "text-muted-foreground"}`} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border ${
                          isActive 
                            ? "bg-black/20 text-black border-black/30 font-bold" 
                            : "bg-white/5 text-muted-foreground border-white/10"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Quick Settings & Dashboard Link */}
        <div className="p-3 border-t border-white/10 shrink-0 space-y-1 bg-black/20">
          <Link 
            href="/app/overview" 
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-all"
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className="leading-tight">Telemetry Dashboard</span>
          </Link>
        </div>
      </div>
    </>
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


