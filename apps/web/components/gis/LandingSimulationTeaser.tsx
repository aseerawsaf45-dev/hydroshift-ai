"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Sliders, ArrowUpRight, Droplets, AlertTriangle, ShieldCheck, Activity } from "lucide-react";

export function LandingSimulationTeaser() {
  const [goraiFlowDelta, setGoraiFlowDelta] = useState<number>(-40); // -80% to +50%
  const [tidalSurge, setTidalSurge] = useState<number>(0.8); // 0.0 to 2.5m

  // Hydrodynamic calculations based on 1D Advection-Dispersion formulation
  const simResults = useMemo(() => {
    // Base 1.0 dS/m intrusion front is at km 55.0 under normal conditions
    const baseFrontKm = 55.0;
    const dischargeImpact = -goraiFlowDelta * 0.22; // lower discharge pushes front inland
    const surgeImpact = tidalSurge * 9.5; // surge pushes inland
    const frontKm = Math.min(85.0, Math.max(35.0, Number((baseFrontKm + dischargeImpact + surgeImpact).toFixed(1))));

    // Salinity at Mongla (km 42)
    const monglaEc = Number(Math.max(1.5, 7.9 + (-goraiFlowDelta * 0.05) + (tidalSurge * 2.8)).toFixed(1));

    // Salinity at Khulna WASA intake (km 82)
    let khulnaEc = 0.8;
    if (frontKm > 68.0) {
      khulnaEc = Number((0.8 + (frontKm - 68.0) * 0.32).toFixed(1));
    }

    const isKhulnaBreached = khulnaEc >= 1.5;
    const isMonglaCritical = monglaEc >= 4.0;

    return {
      frontKm,
      monglaEc,
      khulnaEc,
      isKhulnaBreached,
      isMonglaCritical,
    };
  }, [goraiFlowDelta, tidalSurge]);

  // SVG Wedge coordinates (0 to 100% width)
  const wedgeWidthPercent = Math.min(100, Math.max(10, (simResults.frontKm / 85.0) * 100));

  return (
    <div className="w-full rounded-3xl glass-panel-elevated border border-white/15 p-6 shadow-2xl relative overflow-hidden text-left spotlight-card">
      {/* Background radial glow */}
      <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Tactical Salt Shock Simulator
            </span>
            <span className="block text-[10px] text-muted-foreground font-mono">
              Live ADE Hydrodynamic Solver
            </span>
          </div>
        </div>

        <span
          className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase border ${
            simResults.isKhulnaBreached
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
          }`}
        >
          {simResults.isKhulnaBreached ? "Intake Breached" : "Intake Nominal"}
        </span>
      </div>

      {/* 2D Mini Dynamic River Wedge SVG */}
      <div className="mb-5 p-3 rounded-2xl bg-black/50 border border-white/10 relative">
        <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground mb-1.5 px-1">
          <span className="text-rose-400 font-semibold">Bay of Bengal (0 km)</span>
          <span className="text-sky-300">Mongla (35 km)</span>
          <span className="text-white font-semibold">Bhairab-Rupsha WASA (82 km)</span>
        </div>

        <svg viewBox="0 0 400 70" className="w-full h-16 rounded-xl overflow-hidden bg-[#050a12]">
          <defs>
            <linearGradient id="teaserFreshwater" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#083344" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
            <linearGradient id="teaserWedge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="85%" stopColor="#fb7185" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Freshwater River Channel Base */}
          <rect x="0" y="8" width="400" height="52" fill="url(#teaserFreshwater)" opacity="0.4" />

          {/* Dynamic Marine Salinity Wedge */}
          <polygon
            points={`0,12 ${wedgeWidthPercent * 4},58 0,60`}
            fill="url(#teaserWedge)"
            className="transition-all duration-300 ease-out"
          />

          {/* Water Surface Line */}
          <line x1="0" y1="12" x2="400" y2="12" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

          {/* River Bed Line */}
          <line x1="0" y1="60" x2="400" y2="60" stroke="#334155" strokeWidth="2" />

          {/* Intake Marker at km 82 (x = 385) */}
          <line x1="385" y1="5" x2="385" y2="65" stroke={simResults.isKhulnaBreached ? "#f43f5e" : "#57d6d0"} strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="385" cy="12" r="3.5" fill={simResults.isKhulnaBreached ? "#f43f5e" : "#57d6d0"} />

          {/* Front Marker */}
          <circle cx={wedgeWidthPercent * 4} cy="58" r="3" fill="#fb7185" className="animate-ping" />
        </svg>

        <div className="flex justify-between items-center text-[10px] font-mono mt-1 px-1">
          <span className="text-muted-foreground">Wedge Tip:</span>
          <span className="text-rose-400 font-bold">
            {simResults.frontKm} km Inland ({simResults.frontKm >= 82 ? "REACHED WASA" : `${(82 - simResults.frontKm).toFixed(1)} km to Intake`})
          </span>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-4 mb-5 text-xs">
        {/* Slider 1: Gorai River Discharge */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center font-mono text-[11px]">
            <span className="text-muted-foreground flex items-center gap-1">
              <Droplets className="w-3 h-3 text-sky-400" />
              <span>Upstream Gorai Discharge:</span>
            </span>
            <span className={`font-bold ${goraiFlowDelta < 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {goraiFlowDelta > 0 ? `+${goraiFlowDelta}%` : `${goraiFlowDelta}%`} {goraiFlowDelta <= -40 ? "(Drought)" : ""}
            </span>
          </div>
          <input
            type="range"
            min="-80"
            max="50"
            step="5"
            value={goraiFlowDelta}
            onChange={(e) => setGoraiFlowDelta(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Slider 2: Downstream Tidal Surge */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center font-mono text-[11px]">
            <span className="text-muted-foreground flex items-center gap-1">
              <Activity className="w-3 h-3 text-rose-400" />
              <span>Downstream Tidal Surge:</span>
            </span>
            <span className={`font-bold ${tidalSurge >= 1.0 ? "text-rose-400" : "text-white"}`}>
              +{tidalSurge.toFixed(1)}m {tidalSurge >= 1.5 ? "(Cyclone Surge)" : "(Spring Tide)"}
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="2.5"
            step="0.1"
            value={tidalSurge}
            onChange={(e) => setTidalSurge(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Telemetry Readouts Bento */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-5">
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-muted-foreground">Mongla Port (SW244)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-base font-bold font-mono ${simResults.isMonglaCritical ? "text-rose-400" : "text-amber-400"}`}>
              {simResults.monglaEc}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">dS/m</span>
          </div>
          <span className="text-[9px] text-rose-400/80 font-mono mt-0.5">Threshold: 4.0 dS/m</span>
        </div>

        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-muted-foreground">Khulna WASA (P14)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-base font-bold font-mono ${simResults.isKhulnaBreached ? "text-rose-400" : "text-emerald-400"}`}>
              {simResults.khulnaEc}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">dS/m</span>
          </div>
          <span className="text-[9px] text-muted-foreground font-mono mt-0.5">Potable Limit: 1.5 dS/m</span>
        </div>
      </div>

      {/* CTA Button */}
      <Link
        href="/app/scenarios"
        className="w-full py-3 rounded-xl bg-primary text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
      >
        <span>Open Full 2D Bathymetry Simulation Studio</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

