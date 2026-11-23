"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Suspense } from "react";
import {
  Home,
  Droplets,
  Sprout,
  HelpCircle,
  UserCheck,
  BrainCircuit,
  Sliders,
  X,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export const primaryNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "My Water", href: "/app/my-water", icon: Droplets, badge: "Dacope" },
  { name: "Crop Planning", href: "/app/crop-planning", icon: Sprout, badge: "Decisions" },
  { name: "Help & Contacts", href: "/app/help", icon: HelpCircle },
];

export const secondaryNavItems = [
  { name: "Facilitator Portal", href: "/app/facilitator", icon: UserCheck, badge: "Field" },
  { name: "Research & Methods", href: "/app/methods", icon: BrainCircuit, badge: "Reviewer" },
];

// Flat export for compatibility
export const navItems = [...primaryNavItems, ...secondaryNavItems];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-[#08131f]/95 backdrop-blur-2xl text-foreground border-r border-white/10 shadow-2xl">
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
            aria-label="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Pilot Scope Chip */}
      <div className="px-3 py-2.5 border-b border-white/5">
        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 text-[11px] shadow-inner">
          <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Dacope Pilot Community
          </span>
          <span className="font-mono text-emerald-400 font-bold">Polders 31-32</span>
        </div>
      </div>

      {/* Primary 4-Item Menu */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5 scrollbar-thin">
        <div className="space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-mono uppercase font-bold tracking-wider text-muted-foreground/70">
            Community Service
          </div>
          <div className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-cyan-400 text-black font-bold shadow-lg shadow-primary/25 border border-primary/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
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

        {/* Roles & Supporting Infrastructure */}
        <div className="space-y-1 pt-2 border-t border-white/5">
          <div className="px-2.5 py-1 text-[10px] font-mono uppercase font-bold tracking-wider text-muted-foreground/70">
            Roles & Review
          </div>
          <div className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white/10 text-white font-bold border border-white/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-white/5 text-muted-foreground border border-white/10">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Support Badge */}
      <div className="p-3 border-t border-white/10 shrink-0 space-y-1 bg-black/20">
        <Link 
          href="/app/help" 
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span>Facilitator Contact</span>
          </span>
          <span className="text-[10px] text-primary font-mono font-semibold">+880 1712</span>
        </Link>
      </div>
    </div>
  );
}

export function SidebarNav() {
  return (
    <aside className="w-64 hidden md:flex flex-col h-full shrink-0 z-30">
      <Suspense fallback={<div className="w-64 bg-[#08131f]/95 h-full" />}>
        <SidebarContent />
      </Suspense>
    </aside>
  );
}

export function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="fixed inset-y-0 left-0 w-72 shadow-2xl animate-in slide-in-from-left duration-200">
        <Suspense fallback={<div className="w-72 bg-[#08131f]/95 h-full" />}>
          <SidebarContent onClose={onClose} />
        </Suspense>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} aria-label="Close" />
    </div>
  );
}

export function MobileNavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <MobileNav isOpen={open} onClose={onClose} />;
}
