"use client";

import React, { useState } from "react";
import { Gauge, ShieldCheck, ShieldAlert, ArrowRight, Waves, Droplets, Info } from "lucide-react";

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
  const isBackflowPrevented = headDifference > 0; // River is higher -> gate pushed shut
  const isDraining = headDifference < 0; // Canal is higher -> water pushes gate open

  // Normalized heights for SVG visualization (base 0 = 0m, top 100 = 3m)
  // River WSE baseline scale: 0m -> y=190, 3m -> y=50
  const riverWaterY = Math.max(50, Math.min(190, 190 - (currentRiverWse / 3.0) * 140));
  const canalWaterY = Math.max(50, Math.min(190, 190 - (currentCanalStage / 3.0) * 140));

  // Flap gate rotation angle: 0deg when locked shut (isBackflowPrevented), ~30deg open outward when draining
  const flapAngle = isDraining ? -28 : 0;

  return (
    <div className="bezel-shell p-1 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-transparent border border-cyan-500/30 shadow-2xl overflow-hidden">
      <div className="bezel-core p-5 sm:p-6 rounded-[20px] bg-[#071322] space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Physical Mechanics Infographic
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <Gauge className="w-4 h-4 text-primary" />
              <span>How Coastal Polder Flap-Gates Regulate Salinity</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border flex items-center gap-1.5 ${
                isBackflowPrevented
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              }`}
            >
              {isBackflowPrevented ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Gate Locked (Saline Backflow Blocked)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Gate Open (Gravity Drainage Active)</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Infographic SVG Diagram */}
        <div className="relative w-full rounded-2xl bg-[#030912] border border-white/10 p-2 sm:p-4 overflow-hidden">
          {/* Legend Chips */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono z-10 pointer-events-none">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Exterior Tidal River (Passur/Shibsa)</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Interior Polder Canal (Bajua/Pankhali)</span>
            </div>
          </div>

          <svg
            viewBox="0 0 600 240"
            className="w-full h-auto max-h-[300px] select-none"
            aria-label="Polder Sluice Gate Cross Section Diagram"
          >
            <defs>
              {/* River Saline Water Gradient */}
              <linearGradient id="riverWater" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#081320" stopOpacity="0.9" />
              </linearGradient>

              {/* Canal Fresh Water Gradient */}
              <linearGradient id="canalWater" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#081320" stopOpacity="0.9" />
              </linearGradient>

              {/* Embankment Dyke Fill */}
              <linearGradient id="dykeFill" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>

              {/* Arrow Marker */}
              <marker id="arrowDrain" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
              </marker>
              <marker id="arrowBlock" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#f43f5e" />
              </marker>
            </defs>

            {/* Ground Bed Layer */}
            <rect x="0" y="200" width="600" height="40" fill="#0b131f" />
            <line x1="0" y1="200" x2="600" y2="200" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

            {/* Left Water (Tidal River) */}
            <rect x="0" y={riverWaterY} width="220" height={200 - riverWaterY} fill="url(#riverWater)" />
            <line x1="0" y1={riverWaterY} x2="220" y2={riverWaterY} stroke="#f43f5e" strokeWidth="2.5" />
            {/* Wave markers on river */}
            <path
              d={`M 10 ${riverWaterY + 4} Q 25 ${riverWaterY - 2} 40 ${riverWaterY + 4} T 70 ${riverWaterY + 4} T 100 ${riverWaterY + 4} T 130 ${riverWaterY + 4}`}
              fill="none"
              stroke="#fb7185"
              strokeWidth="1.5"
              opacity="0.8"
            />

            {/* Right Water (Interior Polder Canal) */}
            <rect x="380" y={canalWaterY} width="220" height={200 - canalWaterY} fill="url(#canalWater)" />
            <line x1="380" y1={canalWaterY} x2="600" y2={canalWaterY} stroke="#06b6d4" strokeWidth="2.5" />
            {/* Wave markers on canal */}
            <path
              d={`M 400 ${canalWaterY + 4} Q 415 ${canalWaterY - 2} 430 ${canalWaterY + 4} T 460 ${canalWaterY + 4} T 490 ${canalWaterY + 4} T 520 ${canalWaterY + 4}`}
              fill="none"
              stroke="#67e8f9"
              strokeWidth="1.5"
              opacity="0.8"
            />

            {/* Center Polder Earthen Embankment (Dyke) */}
            {/* Trapezoidal Dyke Profile */}
            <polygon
              points="200,200 240,70 360,70 400,200"
              fill="url(#dykeFill)"
              stroke="#475569"
              strokeWidth="2"
            />

            {/* Culvert / Sluice Barrel (Pipe through the dyke) */}
            <rect x="220" y="150" width="160" height="40" fill="#020617" stroke="#64748b" strokeWidth="2.5" />
            <line x1="220" y1="170" x2="380" y2="170" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

            {/* Water flowing inside the culvert */}
            {isDraining ? (
              <>
                <rect x="220" y="155" width="160" height="30" fill="#06b6d4" opacity="0.35" />
                {/* Outward Flow Vector Arrow */}
                <line x1="360" y1="170" x2="235" y2="170" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowDrain)" />
                <text x="300" y="142" textAnchor="middle" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  Drainage Flow →
                </text>
              </>
            ) : (
              <>
                <rect x="220" y="155" width="20" height="30" fill="#f43f5e" opacity="0.4" />
                {/* Reverse Pressure Arrow pushed back */}
                <line x1="190" y1="170" x2="215" y2="170" stroke="#f43f5e" strokeWidth="3" markerEnd="url(#arrowBlock)" />
                <text x="300" y="142" textAnchor="middle" fill="#f87171" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  Blocked Backpressure ⊣
                </text>
              </>
            )}

            {/* Flap Gate on the River Side (x=220, y=150 to 190) */}
            {/* Hinge at (220, 150) */}
            <circle cx="220" cy="150" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
            {/* Flap leaf rotating around (220, 150) */}
            <g transform={`rotate(${flapAngle}, 220, 150)`}>
              <rect x="217" y="150" width="6" height="42" rx="2" fill={isBackflowPrevented ? "#f43f5e" : "#10b981"} stroke="#ffffff" strokeWidth="1.2" />
            </g>

            {/* Embankment Labels */}
            <text x="300" y="95" textAnchor="middle" fill="#f1f5f9" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              Coastal Polder Dyke (Embankment)
            </text>
            <text x="300" y="110" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              Polder 31 / 32 earthen barrier
            </text>

            {/* River Stage Measure Tag */}
            <text x="110" y={riverWaterY - 8} textAnchor="middle" fill="#fda4af" fontSize="11" fontFamily="monospace" fontWeight="bold">
              River: {currentRiverWse.toFixed(2)} m PWD
            </text>

            {/* Canal Stage Measure Tag */}
            <text x="490" y={canalWaterY - 8} textAnchor="middle" fill="#67e8f9" fontSize="11" fontFamily="monospace" fontWeight="bold">
              Canal: {currentCanalStage.toFixed(2)} m PWD
            </text>

            {/* Delta-H Indicator Bar */}
            <line x1="290" y1={riverWaterY} x2="310" y2={riverWaterY} stroke="#fda4af" strokeWidth="1.5" />
            <line x1="290" y1={canalWaterY} x2="310" y2={canalWaterY} stroke="#67e8f9" strokeWidth="1.5" />
            <line x1="300" y1={riverWaterY} x2="300" y2={canalWaterY} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
            <text x="300" y={(riverWaterY + canalWaterY) / 2 + 4} textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">
              Δh = {headDifference > 0 ? "+" : ""}{headDifference.toFixed(2)}m
            </text>
          </svg>
        </div>

        {/* Interactive Controls & Explanatory Footnote */}
        {interactive && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Tidal River Stage (Low/High Tide):</span>
                <span className="font-mono text-rose-400 font-bold tabular-nums">{currentRiverWse.toFixed(2)} m PWD</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="2.50"
                step="0.05"
                value={currentRiverWse}
                onChange={(e) => setCurrentRiverWse(parseFloat(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>0.50m (Low Tide Ebb)</span>
                <span>1.85m (Mean Tide)</span>
                <span>2.50m (Spring Surge)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Internal Canal Water Level:</span>
                <span className="font-mono text-cyan-400 font-bold tabular-nums">{currentCanalStage.toFixed(2)} m PWD</span>
              </div>
              <input
                type="range"
                min="0.80"
                max="2.00"
                step="0.05"
                value={currentCanalStage}
                onChange={(e) => setCurrentCanalStage(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>0.80m (Drawn Down)</span>
                <span>1.30m (Target Storage)</span>
                <span>2.00m (Monsoon Full)</span>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p>
            <strong className="text-white">Rule of the Flap Gate:</strong> Because sea tide rises twice daily, river stage periodically exceeds the polder canal. The flap gate operates strictly via gravity differential ($\Delta h$). No motorized pumps are needed; high tides push the flap tight against the seal, keeping out ocean salt, while low tides allow interior freshwater to flush safely into the bay.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PolderSluiceInfographic;
