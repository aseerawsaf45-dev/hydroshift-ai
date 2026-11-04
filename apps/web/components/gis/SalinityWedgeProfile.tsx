"use client";

import React, { useState } from "react";
import { Droplets, ShieldCheck, ShieldAlert, Waves, Compass, MapPin } from "lucide-react";

interface ReachResult {
  reach_id: string;
  name: string;
  distance_km: number;
  baseline_ec: number;
  simulated_ec: number;
  delta_ec: number;
  hazard_level: string;
  crop_advisory: string;
  intake_safe: boolean;
}

interface SalinityWedgeProps {
  intrusionKm: number;
  baselineIntrusionKm: number;
  reaches: ReachResult[];
  sluiceClosed: boolean;
  dischargeChange: number;
  tidalSurge: number;
}

export function SalinityWedgeProfile({
  intrusionKm,
  baselineIntrusionKm,
  reaches,
  sluiceClosed,
  dischargeChange,
  tidalSurge,
}: SalinityWedgeProps) {
  const [hoveredStation, setHoveredStation] = useState<ReachResult | null>(null);

  // Mapping domain: 0km to 90km
  const maxKm = 90;
  const getXPercent = (km: number) => Math.min(98, Math.max(2, (km / maxKm) * 100));

  const intrusionPercent = getXPercent(intrusionKm);
  const baselinePercent = getXPercent(baselineIntrusionKm);

  return (
    <div className="w-full rounded-2xl glass-panel p-4 sm:p-5 flex flex-col space-y-4 relative overflow-hidden border border-white/10">
      {/* 1. Header with Live Dynamic Indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Waves className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Estuarine Salinity Wedge & Bathymetric Cross-Section
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-rose-300">Front: {intrusionKm.toFixed(1)} km</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
            <span className={`w-2 h-2 rounded-full ${sluiceClosed ? "bg-emerald-400" : "bg-slate-400"}`} />
            <span className={sluiceClosed ? "text-emerald-300" : "text-muted-foreground"}>
              Sluice Defense: {sluiceClosed ? "LOCKED" : "OPEN"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive SVG Dynamic Cross-Section */}
      <div className="relative w-full h-48 sm:h-56 bg-[#040811] rounded-xl border border-white/5 overflow-hidden flex flex-col justify-end p-2 select-none">
        {/* Subtle Water Column Ambient Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/20 via-[#071526]/50 to-[#040a14]" />

        {/* Dynamic SVG Drawing */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
          <defs>
            {/* Saline Wedge Gradient (dense bottom layer) */}
            <linearGradient id="salinityWedgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e11d48" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.75" />
              <stop offset="85%" stopColor="#57D6D0" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
            </linearGradient>

            {/* Freshwater Top Layer */}
            <linearGradient id="freshwaterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6" />
            </linearGradient>

            {/* River Bed Pattern */}
            <pattern id="bedPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 0 20 L 20 0 M 0 0 L 20 20" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Riverbed Silhouette (Sloping upward inland from Bay depth ~20m to Khulna ~6m) */}
          <path
            d="M 0 300 L 0 230 Q 300 240 600 255 T 1000 270 L 1000 300 Z"
            fill="#09121c"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1.5"
          />
          <path
            d="M 0 300 L 0 230 Q 300 240 600 255 T 1000 270 L 1000 300 Z"
            fill="url(#bedPattern)"
          />

          {/* Freshwater River Body */}
          <path
            d="M 0 70 Q 350 75 700 80 T 1000 85 L 1000 270 Q 600 255 300 240 L 0 230 Z"
            fill="url(#freshwaterGrad)"
          />

          {/* Active Saltwater Intrusion Wedge (Advancing inland as a bottom gravity current) */}
          <path
            d={`M 0 100 Q ${intrusionPercent * 5} 120 ${intrusionPercent * 10} 255 L 0 230 Z`}
            fill="url(#salinityWedgeGrad)"
            className="transition-all duration-500 ease-out"
          />

          {/* Water Surface Line with subtle animated tidal swell */}
          <path
            d={`M 0 ${70 - tidalSurge * 10} Q 250 ${72 - tidalSurge * 10} 500 ${75 - tidalSurge * 8} T 1000 ${80 - tidalSurge * 5}`}
            fill="none"
            stroke="#57D6D0"
            strokeWidth="2.5"
            strokeDasharray="8 4"
            className="transition-all duration-300"
          />

          {/* Baseline 4.0 dS/m Front Marker */}
          <line
            x1={baselinePercent * 10}
            y1={40}
            x2={baselinePercent * 10}
            y2={260}
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Active Simulated 4.0 dS/m Hazard Front Marker */}
          <line
            x1={intrusionPercent * 10}
            y1={25}
            x2={intrusionPercent * 10}
            y2={265}
            stroke="#f43f5e"
            strokeWidth="2"
          />
        </svg>

        {/* 3. Floating Overlay Markers for Landmarks */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Bay of Bengal Mouth */}
          <div className="absolute left-2 top-2 text-[10px] font-mono text-muted-foreground flex flex-col">
            <span className="font-bold text-sky-400">Bay of Bengal</span>
            <span>km 0 &bull; 22.0 dS/m</span>
          </div>

          {/* Baseline Label */}
          <div
            className="absolute top-2 -translate-x-1/2 text-[9px] font-mono text-slate-400 bg-black/60 px-1.5 py-0.5 rounded border border-white/10 hidden sm:block"
            style={{ left: `${baselinePercent}%` }}
          >
            Baseline Front ({baselineIntrusionKm}km)
          </div>

          {/* Active Hazard Front Badge */}
          <div
            className="absolute top-8 -translate-x-1/2 text-[10px] font-mono font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/40 shadow-lg shadow-rose-950/50 flex items-center gap-1 transition-all duration-500"
            style={{ left: `${intrusionPercent}%` }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            <span>4.0 dS/m ({intrusionKm.toFixed(1)} km)</span>
          </div>

          {/* Khulna WASA Raw Intake (Bhairab-Rupsha Confluence) */}
          <div className="absolute right-2 top-2 text-[10px] font-mono text-right flex flex-col">
            <span className="font-bold text-emerald-400 flex items-center justify-end gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              Khulna WASA / Bhairab (km 82)
            </span>
            <span className="text-muted-foreground">Standard &lt;1.0 dS/m</span>
          </div>
        </div>

        {/* 4. Interactive Station Nodes along Corridor */}
        <div className="relative z-10 w-full flex justify-between px-2 pb-1 pointer-events-auto">
          {reaches.map((r) => {
            const isCrit = r.hazard_level === "CRITICAL";
            const isWarn = r.hazard_level === "WARNING";
            const isSelected = hoveredStation?.reach_id === r.reach_id;

            return (
              <div
                key={r.reach_id}
                onMouseEnter={() => setHoveredStation(r)}
                onMouseLeave={() => setHoveredStation(null)}
                className="group relative flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1"
                style={{ position: "absolute", left: `${getXPercent(r.distance_km)}%`, bottom: "16px" }}
              >
                {/* Node Pill */}
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center ${
                    isSelected
                      ? "scale-150 ring-4 ring-primary/40"
                      : "group-hover:scale-125"
                  } ${
                    isCrit
                      ? "bg-rose-500 border-white shadow-lg shadow-rose-500/50"
                      : isWarn
                      ? "bg-amber-400 border-white shadow-lg shadow-amber-400/50"
                      : "bg-emerald-400 border-white shadow-lg shadow-emerald-400/50"
                  }`}
                />

                {/* Station Tag */}
                <span className="text-[9px] font-mono text-white/70 mt-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-1 rounded border border-white/10">
                  {r.name.split(" ")[0]} ({r.simulated_ec.toFixed(1)})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Tooltip / Hover Inspector Bar */}
      {hoveredStation ? (
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{hoveredStation.name}</span>
            <span className="text-muted-foreground font-mono">({hoveredStation.distance_km.toFixed(1)} km from Bay)</span>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span>
              Baseline: <strong className="text-slate-300">{hoveredStation.baseline_ec.toFixed(1)} dS/m</strong>
            </span>
            <span className="text-white">&rarr;</span>
            <span>
              Simulated:{" "}
              <strong
                className={
                  hoveredStation.hazard_level === "CRITICAL"
                    ? "text-rose-400"
                    : hoveredStation.hazard_level === "WARNING"
                    ? "text-amber-400"
                    : "text-emerald-400"
                }
              >
                {hoveredStation.simulated_ec.toFixed(1)} dS/m
              </strong>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                hoveredStation.delta_ec > 0 ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
              }`}
            >
              {hoveredStation.delta_ec > 0 ? `+${hoveredStation.delta_ec.toFixed(1)}` : `${hoveredStation.delta_ec.toFixed(1)}`}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono px-1">
          <span>Hover over river monitoring nodes to inspect local advective salinity displacement.</span>
          <span className="text-primary flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            1D Advection-Dispersion Solved
          </span>
        </div>
      )}
    </div>
  );
}

