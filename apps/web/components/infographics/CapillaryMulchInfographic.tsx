"use client";

import React, { useState } from "react";
import {
  Sun,
  ShieldCheck,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Layers,
  Info,
  Droplets,
  Thermometer,
  Sprout,
  Activity,
  CheckCircle2,
} from "lucide-react";

export function CapillaryMulchInfographic({ lang = "en" }: { lang?: "en" | "bn" }) {
  const [activeMode, setActiveMode] = useState<"mulched" | "bare" | "split">("mulched");

  return (
    <div className="w-full rounded-2xl bg-[#0b121d] border border-white/10 shadow-2xl overflow-hidden transition-all">
      {/* 1. Header & Mode Switcher */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/[0.01]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
              Soil Physics &amp; Agronomic Mechanics
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span>
              {lang === "en"
                ? "Capillary Salt Dynamics: Bare Soil vs. Rice Straw Mulch"
                : "মাটির লবণাক্ততা বিজ্ঞান: অনাবৃত জমি বনাম ধানের খড়ের জাবড়া"}
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            {lang === "en"
              ? "Cross-section of the coastal root zone showing how organic mulch breaks capillary suction and protects dry-season crops."
              : "উপকূলীয় মাটির স্তরবিন্যাস: কীভাবে জৈব জাবড়া মাটির নিচের লবণাক্ত পানি ওপরে ওঠা রোধ করে এবং শুষ্ক মৌসুমে ফসল বাঁচায়।"}
          </p>
        </div>

        {/* Comparison Mode Toggles */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center text-xs self-start md:self-center gap-1">
          <button
            onClick={() => setActiveMode("mulched")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeMode === "mulched"
                ? "bg-emerald-500 text-black font-semibold shadow-md shadow-emerald-500/20"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === "en" ? "Rice Straw Mulch" : "ধানের খড় (সুরক্ষিত)"}</span>
          </button>
          <button
            onClick={() => setActiveMode("bare")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeMode === "bare"
                ? "bg-rose-500 text-white font-semibold shadow-md shadow-rose-500/20"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{lang === "en" ? "Bare Soil (High Salt)" : "অনাবৃত জমি (লবণাক্ত)"}</span>
          </button>
          <button
            onClick={() => setActiveMode("split")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all hidden sm:flex items-center gap-1.5 ${
              activeMode === "split"
                ? "bg-primary text-black font-semibold shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{lang === "en" ? "Split View" : "তুলনামূলক দৃশ্য"}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Soil Stratigraphy Physical SVG */}
      <div className="relative w-full bg-[#050b14] p-2 sm:p-5 overflow-hidden">
        <svg
          viewBox="0 0 780 395"
          className="w-full h-auto select-none font-sans"
          aria-label="Soil Capillary Salinity Dynamics Cross Section"
        >
          <defs>
            {/* Sun Radial Glow */}
            <radialGradient id="sunRealistic" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
            </radialGradient>

            {/* Moist Fertile Rootzone Gradient (Protected) */}
            <linearGradient id="moistLoamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#182333" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Dry Crusted Rootzone Gradient (Bare/Damaged) */}
            <linearGradient id="dryCrustedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="35%" stopColor="#291811" />
              <stop offset="100%" stopColor="#181313" />
            </linearGradient>

            {/* Deep Saline Aquifer Gradient */}
            <linearGradient id="salineGroundwaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#991b1b" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#450a0a" stopOpacity="0.95" />
            </linearGradient>

            {/* Straw Mulch Fiber Pattern */}
            <pattern id="strawFibers" width="24" height="12" patternUnits="userSpaceOnUse">
              <line x1="2" y1="4" x2="18" y2="4" stroke="#fef08a" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="8" y1="8" x2="22" y2="8" stroke="#fde047" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="0" y1="11" x2="14" y2="11" stroke="#eab308" strokeWidth="1.2" strokeLinecap="round" />
            </pattern>

            {/* Salt Crystals Pattern */}
            <pattern id="saltCrystals" width="16" height="10" patternUnits="userSpaceOnUse">
              <rect x="2" y="2" width="3" height="3" fill="#ffffff" rx="0.5" />
              <rect x="9" y="5" width="2.5" height="2.5" fill="#f8fafc" rx="0.5" />
              <polygon points="12,1 14,3 12,5 10,3" fill="#ffffff" />
            </pattern>

            {/* Markers */}
            <marker id="arrowRiseRed" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" />
            </marker>
            <marker id="arrowVaporLoss" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#f59e0b" />
            </marker>
            <marker id="arrowShieldReflect" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#eab308" />
            </marker>
          </defs>

          {/* Depth Stratigraphy Axis on Left (x = 10 to 65) */}
          <line x1="65" y1="130" x2="65" y2="365" stroke="#334155" strokeWidth="1.5" />
          {[
            { depth: "0 cm", label: "Surface", y: 135 },
            { depth: "-15 cm", label: "Seedbed", y: 185 },
            { depth: "-45 cm", label: "Root Zone", y: 245 },
            { depth: "-90 cm", label: "Water Table", y: 305 },
          ].map((d, i) => (
            <g key={i}>
              <line x1="60" y1={d.y} x2="70" y2={d.y} stroke="#64748b" strokeWidth="1.5" />
              <text x="55" y={d.y - 2} textAnchor="end" fill="#94a3b8" fontSize="9" fontFamily="monospace" fontWeight="600">
                {d.depth}
              </text>
              <text x="55" y={d.y + 8} textAnchor="end" fill="#64748b" fontSize="8" fontFamily="sans-serif">
                {d.label}
              </text>
            </g>
          ))}

          {/* =================================================================== */}
          {/* CASE 1: FULL SINGLE VIEW (MULCHED OR BARE) */}
          {/* =================================================================== */}
          {activeMode !== "split" && (
            <g transform="translate(85, 0)">
              {/* Sun & Atmosphere */}
              <circle cx="335" cy="34" r="28" fill="url(#sunRealistic)" />
              <circle cx="335" cy="34" r="16" fill="#fef08a" />
              <text x="335" y="70" textAnchor="middle" fill="#fef08a" fontSize="11" fontWeight="bold">
                Dry Season Tropical Sun (Chaitra–Baishakh 34°C–38°C)
              </text>
              <text x="335" y="83" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                High Atmospheric Evaporative Demand (E₀ ≈ 5.4 mm/day)
              </text>

              {activeMode === "mulched" ? (
                /* --- PROTECTED WITH MULCH --- */
                <>
                  {/* Solar Reflection Waves */}
                  <path d="M 230 65 L 195 95 L 235 106" fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arrowShieldReflect)" />
                  <path d="M 440 65 L 475 95 L 435 106" fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arrowShieldReflect)" />
                  <text x="335" y="104" textAnchor="middle" fill="#fef08a" fontSize="10" fontWeight="bold">
                    Straw Mulch Reflects 65% of Solar Heat (Albedo Barrier)
                  </text>

                  {/* Golden Straw Mulch Layer (Depth: 0 to +5cm above soil) */}
                  <rect x="0" y="126" width="670" height="16" fill="#ca8a04" stroke="#eab308" strokeWidth="1.5" rx="3" />
                  <rect x="0" y="126" width="670" height="16" fill="url(#strawFibers)" />
                  <text x="335" y="138" textAnchor="middle" fill="#422006" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    RICE STRAW MULCH BLANKET (5–6 tons/ha dry weight)
                  </text>

                  {/* Moist Fertile Topsoil Layer (Depth: 0 to -70cm) */}
                  <rect x="0" y="142" width="670" height="153" fill="url(#moistLoamGrad)" stroke="#334155" strokeWidth="1.5" />

                  {/* Thriving Seedling Plants with Deep Healthy White Roots */}
                  {[120, 260, 400, 540].map((px) => (
                    <g key={px} transform={`translate(${px}, 126)`}>
                      {/* Seedling Foliage */}
                      <path d="M 0 -2 Q -12 -16 0 -20 Q 12 -16 0 -2" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
                      <circle cx="0" cy="-2" r="3" fill="#84cc16" />
                      {/* Stem */}
                      <line x1="0" y1="-2" x2="0" y2="16" stroke="#22c55e" strokeWidth="2" />
                      {/* Branching White Root Network */}
                      <path d="M 0 16 Q -15 45 -10 82" fill="none" stroke="#f8fafc" strokeWidth="1.8" />
                      <path d="M 0 16 Q 15 45 12 88" fill="none" stroke="#f8fafc" strokeWidth="1.8" />
                      <path d="M 0 30 Q -25 55 -20 72" fill="none" stroke="#e2e8f0" strokeWidth="1.2" />
                      <path d="M 0 30 Q 25 55 20 75" fill="none" stroke="#e2e8f0" strokeWidth="1.2" />
                      <circle cx="-10" cy="82" r="2" fill="#86efac" />
                      <circle cx="12" cy="88" r="2" fill="#86efac" />
                    </g>
                  ))}

                  {/* Soil Moisture Molecules & Capillary Break Indicators */}
                  <g transform="translate(335, 222)">
                    <rect x="-170" y="-14" width="340" height="28" rx="6" fill="#0c1524" stroke="#10b981" strokeWidth="1.2" />
                    <text x="0" y="4" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">
                      Capillary Break: Soil Moisture Retained (38% v/v)
                    </text>
                  </g>
                  <text x="335" y="258" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                    Root Zone Salinity Safe: ECe = 1.6–2.2 dS/m (Vigorous Growth)
                  </text>

                  {/* Saline Sub-surface Water Table (-90cm to -120cm) */}
                  <rect x="0" y="295" width="670" height="70" fill="url(#salineGroundwaterGrad)" stroke="#dc2626" strokeWidth="1.5" />
                  <text x="335" y="335" textAnchor="middle" fill="#fca5a5" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    Shallow Saline Groundwater Trapped Below (-90 cm depth) • ECw: 10–14 dS/m
                  </text>
                </>
              ) : (
                /* --- BARE FALLOW SOIL (CAPILLARY SALINITY DISASTER) --- */
                <>
                  {/* Intense Sun Heat Rays Baking Bare Soil */}
                  <line x1="280" y1="58" x2="190" y2="124" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 3" />
                  <line x1="335" y1="64" x2="335" y2="124" stroke="#ef4444" strokeWidth="2.5" />
                  <line x1="390" y1="58" x2="480" y2="124" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 3" />
                  <text x="335" y="104" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="bold">
                    Intense Surface Heat (Soil Temp: 48°C) Triggers Upward Capillary Suction
                  </text>

                  {/* White Salt Crust on Surface */}
                  <rect x="0" y="126" width="670" height="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <rect x="0" y="126" width="670" height="14" fill="url(#saltCrystals)" opacity="0.8" />
                  <text x="335" y="137" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    WHITE TOXIC SALT CRUST (NaCl Efflorescence • ECe &gt; 14 dS/m)
                  </text>

                  {/* Dry Desiccated Rootzone Layer */}
                  <rect x="0" y="140" width="670" height="155" fill="url(#dryCrustedGrad)" stroke="#b91c1c" strokeWidth="1.5" />

                  {/* Soil Shrinkage Cracks */}
                  {[90, 210, 320, 460, 580].map((cx) => (
                    <path
                      key={cx}
                      d={`M ${cx} 140 L ${cx + 4} 170 L ${cx - 3} 200 L ${cx + 2} 230`}
                      fill="none"
                      stroke="#0f0707"
                      strokeWidth="2.5"
                    />
                  ))}

                  {/* Dying/Stunted Seedlings with Burnt Brown Roots */}
                  {[150, 380, 510].map((px) => (
                    <g key={px} transform={`translate(${px}, 126)`}>
                      {/* Wilted Yellow/Brown Leaf */}
                      <path d="M 0 0 Q -8 -10 -14 -6 Q -8 0 0 0" fill="#a16207" />
                      {/* Short burnt stunted taproot */}
                      <line x1="0" y1="0" x2="-2" y2="28" stroke="#78350f" strokeWidth="2" />
                      <circle cx="-2" cy="28" r="2.5" fill="#451a03" />
                    </g>
                  ))}

                  {/* Upward Capillary Saline Suction Arrows */}
                  {[120, 250, 360, 480, 600].map((ax) => (
                    <g key={ax}>
                      <line
                        x1={ax}
                        y1="290"
                        x2={ax}
                        y2="155"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                        strokeDasharray="6 3"
                        markerEnd="url(#arrowRiseRed)"
                      />
                    </g>
                  ))}

                  {/* Evaporation Plumes Rising into Air */}
                  {[180, 335, 490].map((vx) => (
                    <path
                      key={vx}
                      d={`M ${vx} 122 Q ${vx - 8} 100 ${vx} 80 T ${vx} 60`}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      markerEnd="url(#arrowVaporLoss)"
                    />
                  ))}

                  {/* Warning Callout Box in Rootzone */}
                  <g transform="translate(335, 222)">
                    <rect x="-190" y="-14" width="380" height="28" rx="6" fill="#1c0707" stroke="#ef4444" strokeWidth="1.2" />
                    <text x="0" y="4" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="bold">
                      Continuous Capillary Wicking: Saline Water Pulled to Surface
                    </text>
                  </g>
                  <text x="335" y="258" textAnchor="middle" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    Osmotic Root Desiccation • Seedling Mortality 80%–100%
                  </text>

                  {/* Saline Sub-surface Water Table */}
                  <rect x="0" y="295" width="670" height="70" fill="url(#salineGroundwaterGrad)" stroke="#dc2626" strokeWidth="1.5" />
                  <text x="335" y="335" textAnchor="middle" fill="#fca5a5" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    Shallow Saline Water Table Being Drawn Upward by Evaporative Vacuum
                  </text>
                </>
              )}
            </g>
          )}

          {/* =================================================================== */}
          {/* CASE 2: SIDE-BY-SIDE SPLIT SCREEN COMPARISON VIEW */}
          {/* =================================================================== */}
          {activeMode === "split" && (
            <g transform="translate(85, 0)">
              {/* Left Half: Mulched (Width 325) */}
              <g>
                <text x="160" y="30" textAnchor="middle" fill="#34d399" fontSize="12" fontWeight="bold">
                  WITH RICE STRAW MULCH (SAFE)
                </text>
                {/* Mulch Blanket */}
                <rect x="0" y="60" width="320" height="14" fill="#ca8a04" stroke="#eab308" strokeWidth="1.5" rx="3" />
                <rect x="0" y="60" width="320" height="14" fill="url(#strawFibers)" />
                {/* Moist Soil */}
                <rect x="0" y="74" width="320" height="221" fill="url(#moistLoamGrad)" stroke="#334155" strokeWidth="1.5" />
                {/* Plants */}
                {[70, 160, 250].map((px) => (
                  <g key={px} transform={`translate(${px}, 62)`}>
                    <path d="M 0 -2 Q -8 -14 0 -18 Q 8 -14 0 -2" fill="#22c55e" />
                    <line x1="0" y1="-2" x2="0" y2="10" stroke="#22c55e" strokeWidth="1.5" />
                    <path d="M 0 10 Q -10 35 -6 65" fill="none" stroke="#f8fafc" strokeWidth="1.5" />
                    <path d="M 0 10 Q 10 35 8 70" fill="none" stroke="#f8fafc" strokeWidth="1.5" />
                  </g>
                ))}
                {/* Safe Banner */}
                <g transform="translate(160, 195)">
                  <rect x="-120" y="-12" width="240" height="24" rx="4" fill="#062217" stroke="#10b981" strokeWidth="1" />
                  <text x="0" y="4" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">
                    Moist Soil • ECe &lt; 2.5 dS/m
                  </text>
                </g>
                {/* Aquifer */}
                <rect x="0" y="295" width="320" height="70" fill="url(#salineGroundwaterGrad)" stroke="#dc2626" strokeWidth="1.5" />
                <text x="160" y="335" textAnchor="middle" fill="#fca5a5" fontSize="10" fontFamily="monospace">
                  Saline Water Held Down (-90cm)
                </text>
              </g>

              {/* Divider Axis */}
              <line x1="335" y1="15" x2="335" y2="365" stroke="#475569" strokeWidth="2" strokeDasharray="5 4" />

              {/* Right Half: Bare Fallow Soil (Width 325) */}
              <g transform="translate(350, 0)">
                <text x="160" y="30" textAnchor="middle" fill="#f87171" fontSize="12" fontWeight="bold">
                  BARE FALLOW SOIL (HIGH SALT)
                </text>
                {/* Salt Crust */}
                <rect x="0" y="60" width="320" height="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <rect x="0" y="60" width="320" height="12" fill="url(#saltCrystals)" opacity="0.8" />
                {/* Dry Soil */}
                <rect x="0" y="72" width="320" height="223" fill="url(#dryCrustedGrad)" stroke="#b91c1c" strokeWidth="1.5" />
                {/* Rising Saline Arrows */}
                {[60, 160, 260].map((ax) => (
                  <line
                    key={ax}
                    x1={ax}
                    y1="270"
                    x2={ax}
                    y2="85"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    markerEnd="url(#arrowRiseRed)"
                  />
                ))}
                {/* Hazard Banner */}
                <g transform="translate(160, 195)">
                  <rect x="-130" y="-12" width="260" height="24" rx="4" fill="#240707" stroke="#ef4444" strokeWidth="1" />
                  <text x="0" y="4" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold">
                    Salt Crust • ECe &gt; 12 dS/m
                  </text>
                </g>
                {/* Aquifer */}
                <rect x="0" y="295" width="320" height="70" fill="url(#salineGroundwaterGrad)" stroke="#dc2626" strokeWidth="1.5" />
                <text x="160" y="335" textAnchor="middle" fill="#fca5a5" fontSize="10" fontFamily="monospace">
                  Continuous Capillary Suction
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* 3. Three Agronomic HUD Telemetry Readouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 border-t border-b border-white/10 bg-white/[0.01]">
        <div className="p-3 sm:p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block flex items-center justify-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>Soil Surface Heat / Temperature</span>
          </span>
          <div
            className={`text-xl font-bold font-mono mt-0.5 tabular-nums ${
              activeMode === "mulched" ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {activeMode === "mulched" ? "24°C – 28°C" : "44°C – 48°C"}
          </div>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            {activeMode === "mulched"
              ? "Straw albedo reflects 65% of solar radiation"
              : "Direct solar baking drives intense vapor pressure deficit"}
          </span>
        </div>

        <div className="p-3 sm:p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block flex items-center justify-center gap-1">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span>Root-Zone Salinity (ECe at 0–15 cm)</span>
          </span>
          <div
            className={`text-xl font-bold font-mono mt-0.5 tabular-nums ${
              activeMode === "mulched" ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {activeMode === "mulched" ? "1.6 – 2.4 dS/m" : "12.0 – 16.5 dS/m"}
          </div>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            {activeMode === "mulched"
              ? "Germination Safe (Below sunflower & mungbean limits)"
              : "Toxic Osmotic Zone (100% seedling emergence failure)"}
          </span>
        </div>

        <div className="p-3 sm:p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block flex items-center justify-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>Volumetric Soil Moisture Retention</span>
          </span>
          <div
            className={`text-xl font-bold font-mono mt-0.5 tabular-nums ${
              activeMode === "mulched" ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {activeMode === "mulched" ? "36% – 42% v/v" : "6% – 10% v/v"}
          </div>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            {activeMode === "mulched"
              ? "Moisture preserved for 35–45 days without irrigation"
              : "Desiccated clay shrinkage cracks pull groundwater"}
          </span>
        </div>
      </div>

      {/* 4. Detailed Soil Science Guidance Callout */}
      <div className="p-4 sm:p-5 bg-white/[0.015] flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Agronomic Soil Science of Capillary Salt Prevention:</strong> In Khulna polders (e.g. Dacope Polders 31 &amp; 32), the groundwater table sits at just 0.8–1.2m depth and contains high salinity (8–14 dS/m) due to tidal estuary seepage. When farmland is left bare after the T. Aman harvest, intense tropical solar radiation heats the clay surface, causing rapid evaporation. This acts like a hydraulic siphon, drawing saline water upward through soil micropores via capillary tension. As the water evaporates into the air, dissolved salt precipitates into a toxic white crust (ECe &gt; 12 dS/m).
          <span className="block mt-1.5 text-white/90">
            <strong>The Solution (Zero-Tillage Straw Mulching):</strong> Spreading 5–6 tons/ha of dry rice straw immediately after harvest cuts surface evaporation by over 60%, breaks the upward capillary continuum, and keeps soil cool and moist. Farmers can dibble sunflower (BARI Surjamukhi-2) or mungbean (BARI Mung-6) directly into the moist soil without plowing, utilizing residual monsoon moisture and eliminating the need for saline river water irrigation.
          </span>
        </div>
      </div>
    </div>
  );
}

export default CapillaryMulchInfographic;
