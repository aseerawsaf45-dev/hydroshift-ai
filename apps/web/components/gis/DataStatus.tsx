"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";

interface DataStatusProps {
  isAcademic?: boolean;
}

export function DataStatus({ isAcademic = true }: DataStatusProps) {
  return (
    <div className="absolute top-1 left-16 sm:left-24 z-[495] pointer-events-none hidden lg:flex items-center gap-2 text-[10px] font-mono">
      <div
        className={`px-2.5 py-0.5 rounded-full border shadow-sm flex items-center gap-1.5 ${
          isAcademic
            ? "bg-white/90 border-emerald-300 text-emerald-800"
            : "bg-[#08131f]/90 border-emerald-500/30 text-emerald-300"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="font-bold">100% Offline GIS</span>
        <span className="text-muted-foreground">&bull;</span>
        <span>WGS 84 (EPSG:4326)</span>
        <span className="text-muted-foreground">&bull;</span>
        <span>Zero Remote APIs</span>
      </div>
    </div>
  );
}
