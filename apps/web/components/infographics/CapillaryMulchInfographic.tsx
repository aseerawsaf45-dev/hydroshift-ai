"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Thermometer,
  Droplets,
  Activity,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Sliders,
  Sparkles,
  Calculator,
} from "lucide-react";

export function CapillaryMulchInfographic({ lang = "en" }: { lang?: "en" | "bn" }) {
  // Simulator State Parameters
  const [mulchTonsHa, setMulchTonsHa] = useState<number>(5.0); // 0 to 8 tons/ha
  const [ambientTempC, setAmbientTempC] = useState<number>(34); // 26°C to 42°C
  const [daysElapsed, setDaysElapsed] = useState<number>(30); // 1 to 75 days post-harvest
  const [waterTableDepthM, setWaterTableDepthM] = useState<number>(1.0); // 0.6m to 1.8m
  const [gwSalinityDsM, setGwSalinityDsM] = useState<number>(12.0); // 4 to 18 dS/m

  // Preset Scenarios
  const setPreset = (mulch: number, temp: number, days: number, depth: number, gwEc: number) => {
    setMulchTonsHa(mulch);
    setAmbientTempC(temp);
    setDaysElapsed(days);
    setWaterTableDepthM(depth);
    setGwSalinityDsM(gwEc);
  };

  // Soil Physics Simulation Model (Based on BARI / IRRI coastal polder research)
  const sim = useMemo(() => {
    // 1. Evaporative suppression factor based on rice straw mulch biomass
    // η_mulch = 1 - exp(-0.48 * mulchTonsHa)
    const mulchEffectiveness = 1 - Math.exp(-0.48 * mulchTonsHa); // 0 at 0 t/ha, ~0.65 at 5 t/ha, ~0.90 at 8 t/ha
    const albedoReflectionPct = Math.min(75, Math.round(18 + mulchEffectiveness * 55)); // 18% bare to 73% at full mulch

    // 2. Potential Evapotranspiration (E0, mm/day) via Hargreaves-Samani approximation
    const potentialEvapMmDay = 2.4 + (ambientTempC - 20) * 0.18; // ~3.5mm at 26C, ~5.6mm at 34C, ~6.8mm at 40C
    const actualEvapMmDay = potentialEvapMmDay * (1 - mulchEffectiveness * 0.72);

    // 3. Soil Surface Temperature (°C)
    const soilSurfaceTempC = Math.round(
      ambientTempC + (mulchTonsHa === 0 ? 11 : Math.max(-4, 6 - mulchTonsHa * 2.2))
    );

    // 4. Upward Capillary Saline Water Flux (q_cap, mm/day)
    // Decreases strongly with water table depth (z^-2.2) and with mulch vapor barrier
    const baseCapillaryFluxMmDay = (3.8 / Math.pow(waterTableDepthM, 1.85)) * (actualEvapMmDay / 5.0);
    const capillaryFluxMmDay = Math.max(0.08, baseCapillaryFluxMmDay * (1 - mulchEffectiveness * 0.85));

    // 5. Daily Salt Deposition Rate (g/m²/day) into the 0-15cm topsoil
    // 1 dS/m ≈ 640 mg/L = 0.64 kg/m³ = 0.64 g/L = 0.64 g / (mm * m²)
    const dailySaltAccumGramsM2 = capillaryFluxMmDay * (gwSalinityDsM * 0.64);
    const totalSaltAccumKgHa = (dailySaltAccumGramsM2 * daysElapsed * 10).toFixed(1);

    // 6. Resulting Root-Zone Salinity (ECe in dS/m at 0-15cm depth)
    // Bulk density of Dacope clay loam ~1.35 g/cm³, 15cm layer = 202.5 kg soil/m²
    // Initial post-Aman soil salinity ECe ~ 1.5 dS/m
    const initialSoilEc = 1.5;
    const addedSoilEc = (dailySaltAccumGramsM2 * daysElapsed) / 18.5;
    const currentRootZoneEc = Math.min(22.0, Number((initialSoilEc + addedSoilEc).toFixed(2)));

    // 7. Volumetric Soil Moisture (θ, %) in the 0-15cm seedbed
    // Initial residual moisture post-Aman ~ 44% (saturation ~48%)
    // Drops via evaporation and crop uptake
    const dailyMoistureLossPct = (actualEvapMmDay / 150) * 100;
    const currentMoisturePct = Math.max(
      6.5,
      Number((44 - dailyMoistureLossPct * (daysElapsed * 0.42)).toFixed(1))
    );

    // 8. Crop Viability Thresholds
    const sunflowerTolerance = 4.8; // dS/m
    const mungbeanTolerance = 3.5; // dS/m
    const isMungbeanSafe = currentRootZoneEc <= mungbeanTolerance && currentMoisturePct >= 18;
    const isSunflowerSafe = currentRootZoneEc <= sunflowerTolerance && currentMoisturePct >= 14;

    // 9. Depth Profile Data Curve (0cm, 10cm, 20cm, 40cm, 70cm, 100cm)
    const depthProfile = [
      { depth: 0, label: "Surface (0cm)", ec: Number((currentRootZoneEc * 1.35).toFixed(1)), moisture: Number((currentMoisturePct * 0.7).toFixed(1)) },
      { depth: 10, label: "Seedbed (10cm)", ec: currentRootZoneEc, moisture: currentMoisturePct },
      { depth: 25, label: "Root Zone (25cm)", ec: Number((currentRootZoneEc * 0.75 + 1.2).toFixed(1)), moisture: Number((currentMoisturePct * 1.15).toFixed(1)) },
      { depth: 50, label: "Mid Profile (50cm)", ec: Number((currentRootZoneEc * 0.45 + gwSalinityDsM * 0.4).toFixed(1)), moisture: Number((Math.min(48, currentMoisturePct * 1.35)).toFixed(1)) },
      { depth: 80, label: "Capillary Fringe (80cm)", ec: Number((gwSalinityDsM * 0.85).toFixed(1)), moisture: 44.5 },
      { depth: 100, label: "Water Table (100cm)", ec: gwSalinityDsM, moisture: 48.0 },
    ];

    // 10. Time Series Simulation Projection (Day 0 to Day 70 in 10-day increments)
    const timeSeries = [0, 10, 20, 30, 45, 60, 75].map((d) => {
      const addedEc = (dailySaltAccumGramsM2 * d) / 18.5;
      const ec = Math.min(22.0, Number((initialSoilEc + addedEc).toFixed(1)));
      const moisture = Math.max(6.0, Number((44 - (actualEvapMmDay / 150) * 100 * (d * 0.42)).toFixed(1)));
      return { day: d, ec, moisture };
    });

    return {
      mulchEffectiveness,
      albedoReflectionPct,
      potentialEvapMmDay: potentialEvapMmDay.toFixed(2),
      actualEvapMmDay: actualEvapMmDay.toFixed(2),
      soilSurfaceTempC,
      capillaryFluxMmDay: capillaryFluxMmDay.toFixed(2),
      dailySaltAccumGramsM2: dailySaltAccumGramsM2.toFixed(2),
      totalSaltAccumKgHa,
      currentRootZoneEc,
      currentMoisturePct,
      isMungbeanSafe,
      isSunflowerSafe,
      sunflowerTolerance,
      mungbeanTolerance,
      depthProfile,
      timeSeries,
    };
  }, [mulchTonsHa, ambientTempC, daysElapsed, waterTableDepthM, gwSalinityDsM]);

  return (
    <div className="w-full rounded-2xl bg-[#0b121d] border border-white/10 shadow-2xl overflow-hidden font-sans">
      {/* 1. Header & Live Indicator */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/[0.01]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              Soil Physics Numerical Simulation Model
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            <span>Capillary Evaporation & Salt Accumulation Simulator</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Quantitative 1D hydrodynamic soil water model calculating vapor pressure deficit, upward capillary flux, and root-zone salinity over time.
          </p>
        </div>

        {/* Viability Status Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium tracking-tight border flex items-center gap-2 ${
              sim.currentRootZoneEc <= 3.5
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : sim.currentRootZoneEc <= 5.0
                ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                : "bg-rose-500/10 text-rose-300 border-rose-500/30"
            }`}
          >
            {sim.currentRootZoneEc <= 3.5 ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>GERMINATION OPTIMAL (ECe: {sim.currentRootZoneEc} dS/m)</span>
              </>
            ) : sim.currentRootZoneEc <= 5.0 ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>MARGINAL STRESS (ECe: {sim.currentRootZoneEc} dS/m)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>TOXIC OSMOTIC SHOCK (ECe: {sim.currentRootZoneEc} dS/m)</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* 2. One-Click Parameter Presets */}
      <div className="px-4 py-2.5 bg-black/30 border-b border-white/5 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-mono text-muted-foreground mr-1 flex items-center gap-1">
          <Sliders className="w-3.5 h-3.5 text-primary" />
          <span>Simulation Presets:</span>
        </span>
        <button
          onClick={() => setPreset(5.0, 34, 30, 1.0, 12.0)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
            mulchTonsHa === 5.0 && ambientTempC === 34 && daysElapsed === 30
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : "bg-white/[0.03] text-muted-foreground hover:text-white border-white/5"
          }`}
        >
          Rice Straw Mulch (5 t/ha, Day 30)
        </button>
        <button
          onClick={() => setPreset(0.0, 34, 30, 1.0, 12.0)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
            mulchTonsHa === 0.0 && ambientTempC === 34 && daysElapsed === 30
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
              : "bg-white/[0.03] text-muted-foreground hover:text-white border-white/5"
          }`}
        >
          Bare Soil Fallow (0 t/ha, Day 30)
        </button>
        <button
          onClick={() => setPreset(0.0, 38, 50, 0.8, 14.0)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
            mulchTonsHa === 0.0 && ambientTempC === 38 && daysElapsed === 50
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
              : "bg-white/[0.03] text-muted-foreground hover:text-white border-white/5"
          }`}
        >
          Extreme Chaitra Heatwave (Bare, Day 50)
        </button>
        <button
          onClick={() => setPreset(6.0, 38, 50, 0.8, 14.0)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
            mulchTonsHa === 6.0 && ambientTempC === 38 && daysElapsed === 50
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : "bg-white/[0.03] text-muted-foreground hover:text-white border-white/5"
          }`}
        >
          Heavy Mulch Defense (6 t/ha, Day 50)
        </button>
      </div>

      {/* 3. Primary Telemetry Metrics HUD (Calculated Numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 border-b border-white/10 bg-white/[0.015]">
        <div className="p-3 sm:p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block flex items-center justify-center gap-1">
            <Activity className="w-3 h-3 text-primary" />
            <span>Root-Zone Salinity (ECe)</span>
          </span>
          <div
            className={`text-2xl font-bold font-mono mt-0.5 tabular-nums ${
              sim.currentRootZoneEc <= 3.5
                ? "text-emerald-400"
                : sim.currentRootZoneEc <= 5.0
                ? "text-amber-400"
                : "text-rose-400"
            }`}
          >
            {sim.currentRootZoneEc} <span className="text-xs font-normal text-muted-foreground">dS/m</span>
          </div>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            Initial: 1.5 dS/m (+{(sim.currentRootZoneEc - 1.5).toFixed(1)} dS/m salt)
          </span>
        </div>

        <div className="p-3 sm:p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block flex items-center justify-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-400" />
            <span>Seedbed Moisture (θ)</span>
          </span>
          <div
            className={`text-2xl font-bold font-mono mt-0.5 tabular-nums ${
              sim.currentMoisturePct >= 20 ? "text-cyan-400" : "text-rose-400"
            }`}
          >
            {sim.currentMoisturePct}% <span className="text-xs font-normal text-muted-foreground">v/v</span>
          </div>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            Wilting point: 12% | Field cap: 42%
          </span>
        </div>

        <div className="p-3 sm:p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3 text-amber-400" />
            <span>Upward Capillary Flux (q)</span>
          </span>
          <div className="text-2xl font-bold font-mono text-white mt-0.5 tabular-nums">
            {sim.capillaryFluxMmDay} <span className="text-xs font-normal text-muted-foreground">mm/day</span>
          </div>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            Salt flux: {sim.dailySaltAccumGramsM2} g/m²/day
          </span>
        </div>

        <div className="p-3 sm:p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block flex items-center justify-center gap-1">
            <Thermometer className="w-3 h-3 text-rose-400" />
            <span>Surface Soil Temp</span>
          </span>
          <div
            className={`text-2xl font-bold font-mono mt-0.5 tabular-nums ${
              sim.soilSurfaceTempC <= 30 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {sim.soilSurfaceTempC}°C
          </div>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            Albedo reflection: {sim.albedoReflectionPct}%
          </span>
        </div>
      </div>

      {/* 4. Graphical Numerical Simulation Charts */}
      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#08101a]">
        {/* Left: 1D Depth Profile Graph (Depth vs ECe & Moisture) */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Soil Depth Profile at Day {daysElapsed}</span>
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Depth z (0 to -100cm)</span>
          </div>

          <div className="relative w-full h-[220px]">
            <svg viewBox="0 0 360 200" className="w-full h-full select-none text-[9px] font-mono">
              {/* Grid Lines */}
              <line x1="45" y1="20" x2="340" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="45" y1="65" x2="340" y2="65" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="45" y1="110" x2="340" y2="110" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="45" y1="155" x2="340" y2="155" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

              {/* Y-Axis: Depth from 0 to -100cm */}
              <line x1="45" y1="15" x2="45" y2="175" stroke="#475569" strokeWidth="1.2" />
              <text x="40" y="22" textAnchor="end" fill="#94a3b8">0cm</text>
              <text x="40" y="67" textAnchor="end" fill="#94a3b8">-25cm</text>
              <text x="40" y="112" textAnchor="end" fill="#94a3b8">-50cm</text>
              <text x="40" y="157" textAnchor="end" fill="#94a3b8">-90cm</text>

              {/* X-Axis: ECe Salinity (0 to 20 dS/m) */}
              <line x1="45" y1="175" x2="340" y2="175" stroke="#475569" strokeWidth="1.2" />
              <text x="45" y="188" textAnchor="middle" fill="#64748b">0</text>
              <text x="118" y="188" textAnchor="middle" fill="#64748b">5</text>
              <text x="192" y="188" textAnchor="middle" fill="#64748b">10</text>
              <text x="266" y="188" textAnchor="middle" fill="#64748b">15</text>
              <text x="335" y="188" textAnchor="middle" fill="#64748b">20 dS/m</text>

              {/* Crop Limits (Vertical Threshold Lines) */}
              {/* Mungbean limit: 3.5 dS/m -> x = 45 + (3.5 / 20) * 295 = 96.6 */}
              <line x1="96.6" y1="15" x2="96.6" y2="175" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              <text x="96.6" y="12" textAnchor="middle" fill="#10b981" fontSize="8">Mungbean (3.5)</text>

              {/* Sunflower limit: 4.8 dS/m -> x = 45 + (4.8 / 20) * 295 = 115.8 */}
              <line x1="115.8" y1="15" x2="115.8" y2="175" stroke="#eab308" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              <text x="115.8" y="24" textAnchor="middle" fill="#eab308" fontSize="8">Sunflower (4.8)</text>

              {/* Simulated ECe Depth Curve Points */}
              {/* Scale: x = 45 + (ec / 20) * 295, y = 20 + (depth / 100) * 140 */}
              {(() => {
                const points = sim.depthProfile.map((p) => {
                  const x = 45 + (Math.min(20, p.ec) / 20) * 295;
                  const y = 20 + (p.depth / 100) * 140;
                  return `${x},${y}`;
                }).join(" ");

                return (
                  <>
                    <polyline
                      fill="none"
                      stroke={sim.currentRootZoneEc <= 4.8 ? "#10b981" : "#ef4444"}
                      strokeWidth="2.5"
                      points={points}
                    />
                    {sim.depthProfile.map((p, idx) => {
                      const x = 45 + (Math.min(20, p.ec) / 20) * 295;
                      const y = 20 + (p.depth / 100) * 140;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="3"
                          fill={sim.currentRootZoneEc <= 4.8 ? "#34d399" : "#f87171"}
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1 border-t border-white/5">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${sim.currentRootZoneEc <= 4.8 ? "bg-emerald-400" : "bg-rose-500"}`} />
              <span>Simulated Soil Salinity (ECe)</span>
            </span>
            <span className="text-white font-bold tabular-nums">0cm ECe: {(sim.currentRootZoneEc * 1.35).toFixed(1)} dS/m</span>
          </div>
        </div>

        {/* Right: Time-Series Salinity Trajectory (Days 0 to 75) */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>75-Day Dry Season Salinity Trajectory</span>
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Days After Aman Harvest</span>
          </div>

          <div className="relative w-full h-[220px]">
            <svg viewBox="0 0 360 200" className="w-full h-full select-none text-[9px] font-mono">
              {/* Y-Axis: ECe 0 to 20 dS/m */}
              <line x1="45" y1="15" x2="45" y2="175" stroke="#475569" strokeWidth="1.2" />
              <text x="40" y="20" textAnchor="end" fill="#94a3b8">20</text>
              <text x="40" y="60" textAnchor="end" fill="#94a3b8">15</text>
              <text x="40" y="100" textAnchor="end" fill="#94a3b8">10</text>
              <text x="40" y="140" textAnchor="end" fill="#94a3b8">5</text>
              <text x="40" y="175" textAnchor="end" fill="#94a3b8">0</text>

              {/* X-Axis: Days 0 to 75 */}
              <line x1="45" y1="175" x2="340" y2="175" stroke="#475569" strokeWidth="1.2" />
              <text x="45" y="188" textAnchor="middle" fill="#64748b">0d</text>
              <text x="104" y="188" textAnchor="middle" fill="#64748b">15d</text>
              <text x="163" y="188" textAnchor="middle" fill="#64748b">30d</text>
              <text x="222" y="188" textAnchor="middle" fill="#64748b">45d</text>
              <text x="281" y="188" textAnchor="middle" fill="#64748b">60d</text>
              <text x="335" y="188" textAnchor="middle" fill="#64748b">75d</text>

              {/* Threshold Lines */}
              {/* Sunflower: 4.8 dS/m -> y = 175 - (4.8 / 20) * 155 = 137.8 */}
              <line x1="45" y1="137.8" x2="340" y2="137.8" stroke="#eab308" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <text x="335" y="134" textAnchor="end" fill="#eab308" fontSize="8">Sunflower Threshold (4.8 dS/m)</text>

              {/* Mungbean: 3.5 dS/m -> y = 175 - (3.5 / 20) * 155 = 147.8 */}
              <line x1="45" y1="147.8" x2="340" y2="147.8" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <text x="335" y="145" textAnchor="end" fill="#10b981" fontSize="8">Mungbean Threshold (3.5 dS/m)</text>

              {/* Current Day Vertical Marker */}
              {(() => {
                const curX = 45 + (daysElapsed / 75) * 290;
                return (
                  <g>
                    <line x1={curX} y1="15" x2={curX} y2="175" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="2 2" />
                    <text x={curX} y="12" textAnchor="middle" fill="#38bdf8" fontWeight="bold">Day {daysElapsed}</text>
                  </g>
                );
              })()}

              {/* Time Series Polyline */}
              {(() => {
                const points = sim.timeSeries.map((t) => {
                  const x = 45 + (t.day / 75) * 290;
                  const y = 175 - (Math.min(20, t.ec) / 20) * 155;
                  return `${x},${y}`;
                }).join(" ");

                return (
                  <>
                    <polyline
                      fill="none"
                      stroke={sim.currentRootZoneEc <= 4.8 ? "#34d399" : "#f43f5e"}
                      strokeWidth="2.5"
                      points={points}
                    />
                    {sim.timeSeries.map((t, idx) => {
                      const x = 45 + (t.day / 75) * 290;
                      const y = 175 - (Math.min(20, t.ec) / 20) * 155;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="3"
                          fill={t.ec <= 4.8 ? "#10b981" : "#ef4444"}
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1 border-t border-white/5">
            <span className="text-white">Cumulative Salt Accumulation:</span>
            <span className="text-amber-400 font-bold tabular-nums">{sim.totalSaltAccumKgHa} kg salt / hectare</span>
          </div>
        </div>
      </div>

      {/* 5. Parameter Adjustment Control Sliders */}
      <div className="p-4 sm:p-5 bg-black/25 space-y-4 border-t border-white/10">
        <span className="text-xs font-semibold text-white uppercase tracking-wider block font-mono">
          Adjust Hydraulic & Climate Simulation Parameters
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {/* Mulch Rate Slider */}
          <div className="p-3.5 rounded-xl bg-[#0f1725] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Mulch Biomass:</span>
              <span className="font-mono text-emerald-400 font-bold tabular-nums">
                {mulchTonsHa.toFixed(1)} t/ha
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="8.0"
              step="0.5"
              value={mulchTonsHa}
              onChange={(e) => setMulchTonsHa(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>0 t/ha (Bare)</span>
              <span>4.0 t/ha</span>
              <span>8.0 t/ha (Heavy)</span>
            </div>
          </div>

          {/* Days Elapsed Slider */}
          <div className="p-3.5 rounded-xl bg-[#0f1725] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Timeline (Days Elapsed):</span>
              <span className="font-mono text-primary font-bold tabular-nums">
                Day {daysElapsed}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="75"
              step="5"
              value={daysElapsed}
              onChange={(e) => setDaysElapsed(parseInt(e.target.value))}
              className="w-full accent-primary h-2 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>Day 5 (Nov)</span>
              <span>Day 35 (Jan)</span>
              <span>Day 75 (Mar)</span>
            </div>
          </div>

          {/* Ambient Temperature Slider */}
          <div className="p-3.5 rounded-xl bg-[#0f1725] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Ambient Dry Season Temp:</span>
              <span className="font-mono text-rose-400 font-bold tabular-nums">
                {ambientTempC}°C
              </span>
            </div>
            <input
              type="range"
              min="24"
              max="42"
              step="1"
              value={ambientTempC}
              onChange={(e) => setAmbientTempC(parseInt(e.target.value))}
              className="w-full accent-rose-500 h-2 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>24°C (Mild)</span>
              <span>34°C (Normal)</span>
              <span>42°C (Heatwave)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs pt-1">
          {/* Water Table Depth */}
          <div className="p-3.5 rounded-xl bg-[#0f1725] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Shallow Water Table Depth:</span>
              <span className="font-mono text-cyan-400 font-bold tabular-nums">
                {waterTableDepthM.toFixed(1)} m below surface
              </span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.8"
              step="0.1"
              value={waterTableDepthM}
              onChange={(e) => setWaterTableDepthM(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-2 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>0.6m (High Tidal Seepage)</span>
              <span>1.0m (Average)</span>
              <span>1.8m (Deep)</span>
            </div>
          </div>

          {/* Groundwater Salinity */}
          <div className="p-3.5 rounded-xl bg-[#0f1725] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Groundwater Aquifer Salinity:</span>
              <span className="font-mono text-amber-400 font-bold tabular-nums">
                {gwSalinityDsM.toFixed(1)} dS/m
              </span>
            </div>
            <input
              type="range"
              min="4.0"
              max="20.0"
              step="1.0"
              value={gwSalinityDsM}
              onChange={(e) => setGwSalinityDsM(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>4.0 dS/m (Moderate)</span>
              <span>12.0 dS/m (Dacope Avg)</span>
              <span>20.0 dS/m (Hyper-Saline)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Scientific Formulation Summary */}
      <div className="p-4 sm:p-5 bg-white/[0.015] border-t border-white/10 flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
        <Calculator className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Mathematical Model Basis:</strong> Upward capillary flux is governed by Richards equation: <code className="text-primary font-mono font-bold">q = −K(ψ)(dψ/dz + 1)</code>. In bare soils under high vapor pressure deficit (E₀ = {sim.potentialEvapMmDay} mm/day), continuous soil macropores siphon saline groundwater directly into the top 15cm seedbed, precipitating {sim.totalSaltAccumKgHa} kg/ha of toxic salt by Day {daysElapsed}. Adding 5 t/ha rice straw mulch imposes a physical vapor resistance layer, reducing evaporative suction by over 60% and keeping root-zone salinity at {sim.currentRootZoneEc} dS/m (safely below the sunflower threshold of 4.8 dS/m).
        </div>
      </div>
    </div>
  );
}

export default CapillaryMulchInfographic;
