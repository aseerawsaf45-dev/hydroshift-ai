"use client";

import React, { useState } from "react";
import { Droplets, ShieldCheck, ShieldAlert, Waves, Compass, MapPin, Info, ArrowUpRight } from "lucide-react";

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
  selectedStationId?: string | null;
  onSelectStation?: (reach: ReachResult) => void;
}

export function SalinityWedgeProfile({
  intrusionKm,
  baselineIntrusionKm,
  reaches,
  sluiceClosed,
  dischargeChange,
  tidalSurge,
  selectedStationId,
  onSelectStation,
}: SalinityWedgeProps) {
  const [hoveredStation, setHoveredStation] = useState<ReachResult | null>(null);

  // Mapping domain: 0km to 90km
  const maxKm = 90;
  const getXPercent = (km: number) => Math.min(97, Math.max(3, (km / maxKm) * 100));

  const intrusionPercent = getXPercent(intrusionKm);
  const baselinePercent = getXPercent(baselineIntrusionKm);

  const activeStation = hoveredStation || (selectedStationId ? reaches.find(r => r.reach_id === selectedStationId) : null);

  return (
    <div className="w-full rounded-3xl glass-panel p-5 sm:p-6 flex flex-col space-y-4 relative overflow-hidden border border-white/10 shadow-2xl">
      {/* 1. Header with Live Dynamic Indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
            <Waves className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold uppercase tracking-wider text-white">
              Estuarine Cross-Section & Salt Wedge Dynamics
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              Bay of Bengal (0 km) &rarr; Khulna City / Bhairab Confluence (88 km)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping inline-block" />
            <span>Hazard Front: <strong>{intrusionKm.toFixed(1)} km</strong></span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
            sluiceClosed
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : "bg-white/5 border-white/10 text-muted-foreground"
          }`}>
            <span className={`w-2 h-2 rounded-full ${sluiceClosed ? "bg-emerald-400" : "bg-slate-400"}`} />
            <span>Sluices: <strong>{sluiceClosed ? "SHIELD ACTIVE" : "OPEN"}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Interactive SVG Dynamic Cross-Section */}
      <div className="relative w-full h-56 sm:h-64 bg-[#040811] rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-end p-2 select-none">
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
            stroke="rgba(255,255,255,0.12)"
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
            stroke="#94a3b8"
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
            strokeWidth="2.5"
          />
        </svg>

        {/* 3. Floating Overlay Markers for Landmarks */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Bay of Bengal Mouth */}
          <div className="absolute left-3 top-3 text-[11px] font-mono text-muted-foreground flex flex-col bg-black/50 px-2 py-1 rounded-lg border border-white/5 backdrop-blur-sm">
            <span className="font-bold text-sky-400">Bay of Bengal</span>
            <span>km 0 &bull; 20-22 dS/m</span>
          </div>

          {/* Baseline Label */}
          <div
            className="absolute top-3 -translate-x-1/2 text-[10px] font-mono text-slate-300 bg-black/70 px-2 py-0.5 rounded-full border border-white/10 hidden sm:block shadow-sm"
            style={{ left: `${baselinePercent}%` }}
          >
            Baseline Limit ({baselineIntrusionKm}km)
          </div>

          {/* Active Hazard Front Badge */}
          <div
            className="absolute top-9 -translate-x-1/2 text-[11px] font-mono font-bold text-rose-200 bg-rose-950/90 px-2.5 py-1 rounded-full border border-rose-500/50 shadow-xl shadow-rose-950/60 flex items-center gap-1.5 transition-all duration-500 z-10"
            style={{ left: `${intrusionPercent}%` }}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>4.0 dS/m Front: {intrusionKm.toFixed(1)} km</span>
          </div>

          {/* Khulna WASA Raw Intake (Bhairab-Rupsha Confluence) */}
          <div className="absolute right-3 top-3 text-[11px] font-mono text-right flex flex-col bg-black/50 px-2 py-1 rounded-lg border border-white/5 backdrop-blur-sm">
            <span className="font-bold text-emerald-400 flex items-center justify-end gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Khulna City / WASA (km 82)
            </span>
            <span className="text-muted-foreground">Standard &lt;1.0 dS/m</span>
          </div>
        </div>

        {/* 4. Interactive Station Nodes along Corridor */}
        <div className="relative z-20 w-full flex justify-between px-2 pb-2 pointer-events-auto">
          {reaches.map((r) => {
            const isCrit = r.hazard_level === "CRITICAL";
            const isWarn = r.hazard_level === "WARNING";
            const isSelected = selectedStationId === r.reach_id || hoveredStation?.reach_id === r.reach_id;

            return (
              <div
                key={r.reach_id}
                onClick={() => onSelectStation?.(r)}
                onMouseEnter={() => setHoveredStation(r)}
                onMouseLeave={() => setHoveredStation(null)}
                className="group relative flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1.5"
                style={{ position: "absolute", left: `${getXPercent(r.distance_km)}%`, bottom: "20px" }}
              >
                {/* Node Marker Pill */}
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                    isSelected
                      ? "scale-150 ring-4 ring-primary/50 shadow-xl"
                      : "group-hover:scale-125"
                  } ${
                    isCrit
                      ? "bg-rose-500 border-white shadow-lg shadow-rose-500/50"
                      : isWarn
                      ? "bg-amber-400 border-white shadow-lg shadow-amber-400/50"
                      : "bg-emerald-400 border-white shadow-lg shadow-emerald-400/50"
                  }`}
                />

                {/* Station Tag Tooltip */}
                <span className="text-[10px] font-mono font-medium text-white/90 mt-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-2 py-0.5 rounded-md border border-white/15 shadow-xl pointer-events-none">
                  {r.name.replace(" (Passur River)", "").replace(" (Khulna Core)", "")} ({r.simulated_ec.toFixed(1)} dS/m)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Tooltip / Selected Station Inspector Bar */}
      {activeStation ? (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full shrink-0 ${
              activeStation.hazard_level === "CRITICAL"
                ? "bg-rose-500 shadow-sm shadow-rose-500"
                : activeStation.hazard_level === "WARNING"
                ? "bg-amber-400 shadow-sm shadow-amber-400"
                : "bg-emerald-400 shadow-sm shadow-emerald-400"
            }`} />
            <div>
              <span className="font-bold text-white text-sm">{activeStation.name}</span>
              <span className="text-muted-foreground font-mono ml-2">
                ({activeStation.distance_km.toFixed(1)} km from Bay mouth)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono">
            <span className="text-slate-300">
              Baseline: <strong className="text-white">{activeStation.baseline_ec.toFixed(1)} dS/m</strong>
            </span>
            <span className="text-muted-foreground">&rarr;</span>
            <span>
              Simulated:{" "}
              <strong
                className={
                  activeStation.hazard_level === "CRITICAL"
                    ? "text-rose-400 font-bold"
                    : activeStation.hazard_level === "WARNING"
                    ? "text-amber-400 font-bold"
                    : "text-emerald-400 font-bold"
                }
              >
                {activeStation.simulated_ec.toFixed(1)} dS/m
              </strong>
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                activeStation.delta_ec > 0
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              {activeStation.delta_ec > 0 ? `+${activeStation.delta_ec.toFixed(1)} dS/m` : `${activeStation.delta_ec.toFixed(1)} dS/m`}
            </span>
            <span className="text-[11px] font-sans text-muted-foreground border-l border-white/10 pl-2 hidden md:inline">
              {activeStation.crop_advisory}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground font-mono px-1 gap-2">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-primary shrink-0" />
            Click or hover any monitoring node to view its simulated salinity surge and crop advice.
          </span>
          <span className="text-primary flex items-center gap-1 shrink-0 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            1D Advection-Dispersion Solved
          </span>
        </div>
      )}
    </div>
  );
}

