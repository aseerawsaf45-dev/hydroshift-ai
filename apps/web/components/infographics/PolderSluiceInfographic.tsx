"use client";

import React, { useState } from "react";
import {
  Gauge,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Waves,
  Droplets,
  Info,
  RotateCcw,
  Sparkles,
  Layers,
} from "lucide-react";

interface PolderSluiceInfographicProps {
  riverWse?: number; // e.g. 1.85 m PWD
  canalStage?: number; // e.g. 1.30 m PWD
  interactive?: boolean;
}

export function PolderSluiceInfographic({
  riverWse = 1.85,
  canalStage = 1.30,
  interactive = true,
}: PolderSluiceInfographicProps) {
  const [currentRiverWse, setCurrentRiverWse] = useState(riverWse);
  const [currentCanalStage, setCurrentCanalStage] = useState(canalStage);

  const headDifference = currentRiverWse - currentCanalStage;
  const isBackflowPrevented = headDifference > 0.02; // River is higher -> gate pushed shut
  const isDraining = headDifference < -0.02; // Canal is higher -> water pushes gate open
  const isEquilibrium = !isBackflowPrevented && !isDraining;

  // Normalized heights for SVG visualization
  // SVG Height: 320px
  // Invert level (culvert floor): y = 230 (Elevation 0.30m PWD)
  // Culvert roof: y = 175 (Elevation 1.10m PWD)
  // Ground bed: y = 250 (Elevation 0.00m PWD Datum)
  // Crest of Dyke: y = 55 (Elevation 4.20m PWD)
  // Scale mapping: 0.00m PWD -> y = 250, 3.00m PWD -> y = 60 (approx 63.3 px per meter)
  const elevationToY = (elevationM: number) => {
    const clamped = Math.max(0.1, Math.min(2.8, elevationM));
    return 250 - clamped * 63.3;
  };

  const riverWaterY = elevationToY(currentRiverWse);
  const canalWaterY = elevationToY(currentCanalStage);

  // Dynamic Flap gate rotation angle:
  // 0deg = closed tight against 5deg angled seat
  // When draining, rotates outward (negative rotation around top hinge)
  const flapAngle = isDraining ? Math.min(28, Math.abs(headDifference) * 35 + 10) : 0;

  // Quick Preset Scenarios
  const applyScenario = (river: number, canal: number) => {
    setCurrentRiverWse(river);
    setCurrentCanalStage(canal);
  };

  return (
    <div className="w-full rounded-2xl bg-[#0b121d] border border-white/10 shadow-2xl overflow-hidden transition-all">
      {/* 1. Header & Live Telemetry Pill */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/[0.01]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              Hydro-Mechanical Infrastructure Schematic
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            <span>How Coastal Polder Flap-Gates Regulate Salinity</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Physical cross-section of automatic gravity flap gate separating tidal river surge from interior polder freshwater reservoirs.
          </p>
        </div>

        {/* Real-time Status Telemetry */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium tracking-tight border flex items-center gap-2 transition-all ${
              isBackflowPrevented
                ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                : isDraining
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
            }`}
          >
            {isBackflowPrevented ? (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>GATE CLOSED: Saline Backflow Blocked</span>
              </>
            ) : isDraining ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>GATE OPEN: Gravity Drainage Active</span>
              </>
            ) : (
              <>
                <Waves className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>SLACK WATER: Neutral Equilibrium</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* 2. Interactive Preset Scenarios Bar (if interactive) */}
      {interactive && (
        <div className="px-4 py-2.5 bg-black/30 border-b border-white/5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-mono text-muted-foreground mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Preset tidal phases:</span>
          </span>
          <button
            onClick={() => applyScenario(2.2, 1.2)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              currentRiverWse === 2.2 && currentCanalStage === 1.2
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : "bg-white/[0.03] text-muted-foreground hover:text-white hover:bg-white/[0.08] border-white/5"
            }`}
          >
            Spring High Tide (Gate Locked)
          </button>
          <button
            onClick={() => applyScenario(0.7, 1.3)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              currentRiverWse === 0.7 && currentCanalStage === 1.3
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-white/[0.03] text-muted-foreground hover:text-white hover:bg-white/[0.08] border-white/5"
            }`}
          >
            Low Tide Ebb (Fresh Drainage)
          </button>
          <button
            onClick={() => applyScenario(1.3, 1.3)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              currentRiverWse === 1.3 && currentCanalStage === 1.3
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-white/[0.03] text-muted-foreground hover:text-white hover:bg-white/[0.08] border-white/5"
            }`}
          >
            Slack Water Equilibrium
          </button>
          <button
            onClick={() => applyScenario(1.1, 1.9)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              currentRiverWse === 1.1 && currentCanalStage === 1.9
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-white/[0.03] text-muted-foreground hover:text-white hover:bg-white/[0.08] border-white/5"
            }`}
          >
            Monsoon Runoff Surge
          </button>
        </div>
      )}

      {/* 3. Main SVG Physical Cross-Section Blueprint */}
      <div className="relative w-full bg-[#050b14] p-2 sm:p-4 overflow-hidden">
        {/* Exterior / Interior Environment Labels */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-mono pointer-events-none z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0c1524]/90 backdrop-blur-md border border-rose-500/30 text-rose-300 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <div>
              <span className="font-semibold block text-[11px]">Exterior Tidal River (Passur/Shibsa)</span>
              <span className="text-[10px] text-muted-foreground font-mono">Saline Water Body (EC &gt; 8.0 dS/m)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0c1524]/90 backdrop-blur-md border border-cyan-500/30 text-cyan-300 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <div className="text-right">
              <span className="font-semibold block text-[11px]">Interior Polder Canal (Bajua/Pankhali)</span>
              <span className="text-[10px] text-muted-foreground font-mono">Freshwater Storage (EC 0.8–1.8 dS/m)</span>
            </div>
          </div>
        </div>

        <svg
          viewBox="0 0 760 310"
          className="w-full h-auto select-none font-sans"
          aria-label="Coastal Polder Flap Gate Hydraulic Cross Section"
        >
          <defs>
            {/* Saline River Water Gradient */}
            <linearGradient id="riverSalineWater" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#be123c" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#0a121e" stopOpacity="0.95" />
            </linearGradient>

            {/* Fresh Canal Water Gradient */}
            <linearGradient id="canalFreshWater" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#0891b2" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#0a121e" stopOpacity="0.95" />
            </linearGradient>

            {/* Concrete Sluice Gradient */}
            <linearGradient id="concreteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Embankment Earthen Fill Gradient */}
            <linearGradient id="embankmentFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="40%" stopColor="#162030" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Revetment Block Pattern */}
            <pattern id="revetmentBlocks" width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="11" height="11" fill="none" stroke="#475569" strokeWidth="0.8" opacity="0.4" />
            </pattern>

            {/* Markers */}
            <marker id="arrowPressure" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#f43f5e" />
            </marker>
            <marker id="arrowDrainage" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
            </marker>
            <marker id="dimensionTick" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <line x1="0" y1="5" x2="10" y2="5" stroke="#94a3b8" strokeWidth="1.5" />
            </marker>
          </defs>

          {/* 1. Geological Substratum & PWD Datum Line */}
          <rect x="0" y="250" width="760" height="60" fill="#090f18" />
          <line x1="0" y1="250" x2="760" y2="250" stroke="#334155" strokeWidth="1.5" strokeDasharray="5 3" />
          <text x="12" y="266" fill="#64748b" fontSize="10" fontFamily="monospace">
            0.00 m PWD (Public Works Datum / Mean Sea Level)
          </text>

          {/* 2. Left Tidal River Water (Saline) */}
          <rect x="0" y={riverWaterY} width="270" height={250 - riverWaterY} fill="url(#riverSalineWater)" />
          <line x1="0" y1={riverWaterY} x2="270" y2={riverWaterY} stroke="#f43f5e" strokeWidth="2.5" />
          {/* Surface Ripples */}
          <path
            d={`M 15 ${riverWaterY + 3} Q 35 ${riverWaterY - 3} 55 ${riverWaterY + 3} T 95 ${riverWaterY + 3} T 135 ${riverWaterY + 3} T 175 ${riverWaterY + 3} T 215 ${riverWaterY + 3}`}
            fill="none"
            stroke="#fb7185"
            strokeWidth="1.2"
            opacity="0.8"
          />

          {/* 3. Right Interior Canal Water (Freshwater) */}
          <rect x="490" y={canalWaterY} width="270" height={250 - canalWaterY} fill="url(#canalFreshWater)" />
          <line x1="490" y1={canalWaterY} x2="760" y2={canalWaterY} stroke="#06b6d4" strokeWidth="2.5" />
          {/* Surface Ripples */}
          <path
            d={`M 510 ${canalWaterY + 3} Q 530 ${canalWaterY - 3} 550 ${canalWaterY + 3} T 590 ${canalWaterY + 3} T 630 ${canalWaterY + 3} T 670 ${canalWaterY + 3} T 710 ${canalWaterY + 3}`}
            fill="none"
            stroke="#67e8f9"
            strokeWidth="1.2"
            opacity="0.8"
          />

          {/* 4. Coastal Polder Dyke (Embankment) */}
          {/* Profile: Crest from x=330 to x=430 at y=55 (+4.20m PWD). River slope: 1:3 down to (240, 250). Canal slope: 1:2 down to (520, 250). */}
          <polygon
            points="240,250 330,55 430,55 520,250"
            fill="url(#embankmentFill)"
            stroke="#475569"
            strokeWidth="2"
          />
          {/* Revetment layer on river slope */}
          <polygon
            points="240,250 258,250 342,60 330,55"
            fill="url(#revetmentBlocks)"
          />

          {/* Crown Embankment Roadway */}
          <rect x="330" y="55" width="100" height="7" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <line x1="335" y1="58.5" x2="425" y2="58.5" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3" />

          {/* Dyke Crest Label */}
          <text x="380" y="44" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">
            Polder Dyke Crest (+4.20m PWD)
          </text>
          <text x="380" y="80" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
            Polders 31 &amp; 32 Embankment
          </text>

          {/* 5. Reinforced Concrete Sluice Culvert Barrel */}
          {/* Culvert outer shell: x=265 to x=495, y=175 to y=235 */}
          <rect x="265" y="175" width="230" height="60" fill="url(#concreteGrad)" stroke="#64748b" strokeWidth="2" rx="2" />
          {/* Culvert inner barrel (flow chamber): x=270 to x=490, y=182 to y=228 */}
          <rect x="270" y="182" width="220" height="46" fill="#040811" stroke="#334155" strokeWidth="1" />

          {/* Water inside culvert */}
          {isDraining ? (
            <>
              {/* Freshwater flowing outwards to river */}
              <rect x="270" y="184" width="220" height="44" fill="#06b6d4" opacity="0.3" />
              {/* Animated/Dashed Flow Streamlines */}
              <line x1="470" y1="198" x2="285" y2="198" stroke="#10b981" strokeWidth="2.5" strokeDasharray="8 4" markerEnd="url(#arrowDrainage)" />
              <line x1="460" y1="212" x2="295" y2="212" stroke="#10b981" strokeWidth="2.5" strokeDasharray="8 4" markerEnd="url(#arrowDrainage)" />
              <text x="380" y="170" textAnchor="middle" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">
                Gravity Flushing Flow (Outward)
              </text>
            </>
          ) : isBackflowPrevented ? (
            <>
              {/* Saline hydrostatic pressure blocking culvert */}
              <rect x="270" y="184" width="25" height="44" fill="#f43f5e" opacity="0.4" />
              {/* Force Vectors pushing Flap Gate tight */}
              <line x1="225" y1="196" x2="262" y2="196" stroke="#f43f5e" strokeWidth="2.5" markerEnd="url(#arrowPressure)" />
              <line x1="225" y1="214" x2="262" y2="214" stroke="#f43f5e" strokeWidth="2.5" markerEnd="url(#arrowPressure)" />
              <text x="380" y="170" textAnchor="middle" fill="#f87171" fontSize="10" fontFamily="monospace" fontWeight="bold">
                Hydrostatic Backpressure Lock (Watertight)
              </text>
            </>
          ) : (
            <text x="380" y="170" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              Hydrostatic Equilibrium (No Flow)
            </text>
          )}

          {/* 6. Automatic Flap Gate Mechanism on River Outfall Face */}
          {/* Seating Collar on river headwall (x=270, y=178 to 232) */}
          <rect x="265" y="178" width="6" height="54" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.2" />
          {/* Hinge Pin at (268, 180) */}
          <circle cx="268" cy="180" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="268" cy="180" r="2" fill="#000000" />

          {/* Flap Gate Leaf */}
          {/* When closed: sits vertically at x=262, y=179 to 234. When open: rotates about (268, 180) by flapAngle */}
          <g transform={`rotate(-${flapAngle}, 268, 180)`} className="transition-transform duration-500 ease-out">
            <rect
              x="261"
              y="180"
              width="7"
              height="53"
              rx="2"
              fill={isBackflowPrevented ? "#f43f5e" : isDraining ? "#10b981" : "#06b6d4"}
              stroke="#ffffff"
              strokeWidth="1.4"
            />
            {/* Rubber Sealing Gasket strip on inside */}
            <rect x="267" y="184" width="2" height="46" fill="#111827" />
          </g>

          {/* 7. Staff Gauges (Elevation Rulers) */}
          {/* River Staff Gauge at x=35 */}
          <rect x="35" y="80" width="10" height="170" fill="#0f172a" stroke="#475569" strokeWidth="1" />
          {[0.5, 1.0, 1.5, 2.0, 2.5].map((lvl) => {
            const y = elevationToY(lvl);
            return (
              <g key={`rg-${lvl}`}>
                <line x1="35" y1={y} x2="45" y2={y} stroke="#94a3b8" strokeWidth="1" />
                <text x="30" y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                  {lvl.toFixed(1)}m
                </text>
              </g>
            );
          })}

          {/* Canal Staff Gauge at x=715 */}
          <rect x="715" y="80" width="10" height="170" fill="#0f172a" stroke="#475569" strokeWidth="1" />
          {[0.5, 1.0, 1.5, 2.0, 2.5].map((lvl) => {
            const y = elevationToY(lvl);
            return (
              <g key={`cg-${lvl}`}>
                <line x1="715" y1={y} x2="725" y2={y} stroke="#94a3b8" strokeWidth="1" />
                <text x="730" y={y + 3} textAnchor="start" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                  {lvl.toFixed(1)}m
                </text>
              </g>
            );
          })}

          {/* 8. Water Stage Elevation Readouts */}
          {/* River Tag */}
          <g transform={`translate(140, ${riverWaterY - 12})`}>
            <rect x="-65" y="-14" width="130" height="20" rx="4" fill="#0c1524" stroke="#f43f5e" strokeWidth="1" />
            <text x="0" y="0" textAnchor="middle" fill="#fda4af" fontSize="10" fontFamily="monospace" fontWeight="bold" dominantBaseline="middle">
              River: {currentRiverWse.toFixed(2)} m PWD
            </text>
          </g>

          {/* Canal Tag */}
          <g transform={`translate(615, ${canalWaterY - 12})`}>
            <rect x="-65" y="-14" width="130" height="20" rx="4" fill="#0c1524" stroke="#06b6d4" strokeWidth="1" />
            <text x="0" y="0" textAnchor="middle" fill="#67e8f9" fontSize="10" fontFamily="monospace" fontWeight="bold" dominantBaseline="middle">
              Canal: {currentCanalStage.toFixed(2)} m PWD
            </text>
          </g>

          {/* 9. Differential Head (Δh) Measurement Dimension Line */}
          {/* Placed neatly between x=370 to x=390 without colliding with text */}
          <g transform="translate(380, 105)">
            <rect x="-60" y="-12" width="120" height="24" rx="6" fill="#030712" stroke="#e2e8f0" strokeWidth="1" />
            <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
              Δh = {headDifference > 0 ? "+" : ""}{headDifference.toFixed(2)} m
            </text>
          </g>
        </svg>
      </div>

      {/* 4. Three Hydraulic Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 border-t border-b border-white/10 bg-white/[0.01]">
        <div className="p-3 sm:p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block">
            Differential Hydraulic Head (Δh)
          </span>
          <div className="text-xl font-bold font-mono text-white mt-0.5 tabular-nums">
            {headDifference > 0 ? `+${headDifference.toFixed(2)}` : headDifference.toFixed(2)} m
          </div>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            {headDifference > 0 ? "River higher (positive head)" : headDifference < 0 ? "Canal higher (negative head)" : "Zero differential"}
          </span>
        </div>

        <div className="p-3 sm:p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block">
            Flap Gate Mechanical State
          </span>
          <div
            className={`text-xl font-bold font-mono mt-0.5 ${
              isBackflowPrevented ? "text-rose-400" : isDraining ? "text-emerald-400" : "text-cyan-400"
            }`}
          >
            {isBackflowPrevented ? "0° SEATED (SHUT)" : isDraining ? `${flapAngle.toFixed(0)}° OPEN (FLUSHING)` : "NEUTRAL"}
          </div>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            {isBackflowPrevented ? "Rubber perimeter seal engaged" : isDraining ? "Gravity-driven outward swing" : "Equilibrium state"}
          </span>
        </div>

        <div className="p-3 sm:p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block">
            Saline Intrusion Barrier Protection
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
            {isBackflowPrevented ? "100% BLOCKED" : "DRAINAGE SAFE"}
          </div>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            {isBackflowPrevented ? "Zero tidal river backflow" : "Interior freshwater discharging"}
          </span>
        </div>
      </div>

      {/* 5. Fine-Tuning Range Sliders (Interactive Mode) */}
      {interactive && (
        <div className="p-4 sm:p-5 bg-black/20 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* River Slider */}
            <div className="p-3.5 rounded-xl bg-[#0f1725] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Tidal River Stage (Low / High Tide):</span>
                </span>
                <span className="font-mono text-rose-400 font-bold tabular-nums text-sm">
                  {currentRiverWse.toFixed(2)} m PWD
                </span>
              </div>
              <input
                type="range"
                min="0.50"
                max="2.50"
                step="0.05"
                value={currentRiverWse}
                onChange={(e) => setCurrentRiverWse(parseFloat(e.target.value))}
                className="w-full accent-rose-500 h-2 bg-white/10 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground pt-0.5">
                <span>0.50m (Low Ebb)</span>
                <span>1.85m (Mean Tide)</span>
                <span>2.50m (Spring Surge)</span>
              </div>
            </div>

            {/* Canal Slider */}
            <div className="p-3.5 rounded-xl bg-[#0f1725] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Internal Canal Water Level:</span>
                </span>
                <span className="font-mono text-cyan-400 font-bold tabular-nums text-sm">
                  {currentCanalStage.toFixed(2)} m PWD
                </span>
              </div>
              <input
                type="range"
                min="0.80"
                max="2.20"
                step="0.05"
                value={currentCanalStage}
                onChange={(e) => setCurrentCanalStage(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-white/10 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground pt-0.5">
                <span>0.80m (Drawn Down)</span>
                <span>1.30m (Target Storage)</span>
                <span>2.20m (Monsoon Runoff)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Mechanical Physics Guidance Box */}
      <div className="p-4 sm:p-5 bg-white/[0.015] border-t border-white/10 flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Physical Mechanics of Coastal Sluice Flap Gates:</strong> Coastal polders in Khulna (Polders 31, 32, and 30) experience semi-diurnal tides rising and falling twice daily. The flap gate operates automatically through hydrostatic pressure differential (Δh = h_river − h_canal). When the tidal river rises above the canal (Δh &gt; 0), hydrostatic backpressure presses the heavy flap firmly against the rubber perimeter seal, preventing saline estuary water from poisoning freshwater canals. When the river recedes below the canal at low tide (Δh &lt; 0), interior hydrostatic head pushes the flap outward, allowing trapped monsoon runoff and canal drainage to flush freely into the Bay of Bengal without requiring motorized pumps.
        </div>
      </div>
    </div>
  );
}

export default PolderSluiceInfographic;
