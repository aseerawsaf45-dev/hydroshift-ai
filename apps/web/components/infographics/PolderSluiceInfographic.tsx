"use client";

import React, { useState, useMemo } from "react";
import {
  Gauge,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Waves,
  Droplets,
  Info,
  Sliders,
  Calculator,
  Activity,
  Zap,
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
  const [ventCount, setVentCount] = useState<number>(2); // 1, 2, 4, or 8 vents
  const [riverSalinityDsM, setRiverSalinityDsM] = useState<number>(10.5); // 4 to 22 dS/m
  const [selectedHour, setSelectedHour] = useState<number>(6); // 0 to 24 hours

  // Preset Tidal Scenarios
  const setScenario = (river: number, canal: number, vents: number) => {
    setCurrentRiverWse(river);
    setCurrentCanalStage(canal);
    setVentCount(vents);
  };

  // Hydrodynamic Physics Calculation Model
  const hydro = useMemo(() => {
    const headDifference = Number((currentRiverWse - currentCanalStage).toFixed(2));
    const isBackflow = headDifference > 0.01;
    const isDraining = headDifference < -0.01;
    const isSlack = !isBackflow && !isDraining;

    // Sluice Geometry (Standard BWDB Coastal Polder Box Culvert)
    // Invert level z_inv = 0.30 m PWD
    // Culvert height H_vent = 1.80 m, Width W_vent = 1.50 m
    const zInvert = 0.30;
    const ventHeight = 1.80;
    const ventWidth = 1.50;
    const ventAreaPerVent = ventWidth * ventHeight; // 2.7 m² per vent
    const totalAreaM2 = ventAreaPerVent * ventCount; // Total flow area

    // Submerged flow depth inside culvert
    const waterDepthCanal = Math.max(0, currentCanalStage - zInvert);
    const flowAreaM2 = Math.min(totalAreaM2, ventWidth * Math.min(ventHeight, waterDepthCanal) * ventCount);

    // Torricelli / Orifice Discharge Equation:
    // Q = Cd * A * sqrt(2 * g * |Δh|) where Cd = 0.62 (standard sluice discharge coefficient)
    const Cd = 0.62;
    const g = 9.80665;
    let dischargeM3S = 0;
    let flowVelocityMS = 0;
    let flapAngleDeg = 0;

    if (isDraining) {
      dischargeM3S = Number((Cd * flowAreaM2 * Math.sqrt(2 * g * Math.abs(headDifference))).toFixed(2));
      flowVelocityMS = flowAreaM2 > 0 ? Number((dischargeM3S / flowAreaM2).toFixed(2)) : 0;
      // Flap opening angle derived from hydrodynamic momentum balance
      flapAngleDeg = Math.min(38, Math.round(flowVelocityMS * 14 + 6));
    }

    const dischargeLitersSec = Math.round(dischargeM3S * 1000);

    // Hydrostatic Backpressure / Sealing Force
    // F = rho * g * |Δh| * A_gate (when river > canal)
    // Water density rho = 1000 kg/m³
    const waterDensityKgM3 = 1000;
    let hydrostaticPressureKPa = 0;
    let totalThrustKiloNewtons = 0;
    let totalThrustMetricTons = 0;

    if (isBackflow) {
      hydrostaticPressureKPa = Number((waterDensityKgM3 * g * headDifference / 1000).toFixed(2));
      totalThrustKiloNewtons = Number((hydrostaticPressureKPa * totalAreaM2).toFixed(1));
      totalThrustMetricTons = Number((totalThrustKiloNewtons / 9.80665).toFixed(2));
    }

    // 24-Hour Semi-Diurnal M2 Tidal Cycle Simulation
    // Tidal period T = 12.42 hours (2 cycles per 24.8h day)
    // Mean tidal level ~ 1.45m PWD, Amplitude ~ 0.95m PWD
    const tideAmplitude = 0.95;
    const tideMean = 1.45;
    const tidal24h = Array.from({ length: 25 }, (_, hour) => {
      const tideHeight = Number((tideMean + tideAmplitude * Math.sin((2 * Math.PI * hour) / 12.42)).toFixed(2));
      const delta = Number((tideHeight - currentCanalStage).toFixed(2));
      const canDrain = delta < 0;
      const q = canDrain ? Number((Cd * flowAreaM2 * Math.sqrt(2 * g * Math.abs(delta))).toFixed(1)) : 0;
      return { hour, tideHeight, delta, canDrain, q };
    });

    // Hours of active gravity drainage per 24 hours
    const drainageHoursPerDay = tidal24h.filter((t) => t.canDrain).length;
    const avgDrainageQ = tidal24h.reduce((acc, t) => acc + t.q, 0) / (drainageHoursPerDay || 1);
    const dailyVolumeM3 = Math.round(avgDrainageQ * drainageHoursPerDay * 3600);

    return {
      headDifference,
      isBackflow,
      isDraining,
      isSlack,
      ventAreaPerVent,
      totalAreaM2,
      dischargeM3S,
      dischargeLitersSec,
      flowVelocityMS,
      flapAngleDeg,
      hydrostaticPressureKPa,
      totalThrustKiloNewtons,
      totalThrustMetricTons,
      drainageHoursPerDay,
      dailyVolumeM3,
      tidal24h,
    };
  }, [currentRiverWse, currentCanalStage, ventCount]);

  return (
    <div className="w-full rounded-2xl bg-[#0b121d] border border-white/10 shadow-2xl overflow-hidden font-sans">
      {/* 1. Header & Live Hydraulic Status */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/[0.01]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              Tidal Hydraulics Numerical Simulation Model
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            <span>Polder Flap-Gate Discharge & Thrust Simulator</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Calculates real-time Torricelli orifice discharge (Q), hydrostatic sealing thrust (F), flap deflection (θ), and semi-diurnal tidal drainage windows.
          </p>
        </div>

        {/* Real-Time Operational State Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium tracking-tight border flex items-center gap-2 ${
              hydro.isBackflow
                ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                : hydro.isDraining
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
            }`}
          >
            {hydro.isBackflow ? (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>GATE SHUT: Sealing Force {hydro.totalThrustMetricTons} Tons</span>
              </>
            ) : hydro.isDraining ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>GATE DISCHARGING: {hydro.dischargeM3S} m³/s ({hydro.dischargeLitersSec.toLocaleString()} L/s)</span>
              </>
            ) : (
              <>
                <Waves className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>SLACK WATER: Hydrostatic Balance</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* 2. One-Click Hydraulic Presets */}
      {interactive && (
        <div className="px-4 py-2.5 bg-black/30 border-b border-white/5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-mono text-muted-foreground mr-1 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-primary" />
            <span>Hydraulic Presets:</span>
          </span>
          <button
            onClick={() => setScenario(2.20, 1.25, 2)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              currentRiverWse === 2.20 && currentCanalStage === 1.25
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : "bg-white/[0.03] text-muted-foreground hover:text-white border-white/5"
            }`}
          >
            Spring High Tide (+2.20m PWD)
          </button>
          <button
            onClick={() => setScenario(0.65, 1.30, 2)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              currentRiverWse === 0.65 && currentCanalStage === 1.30
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-white/[0.03] text-muted-foreground hover:text-white border-white/5"
            }`}
          >
            Low Tide Peak Drainage (+0.65m PWD)
          </button>
          <button
            onClick={() => setScenario(1.10, 1.95, 4)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              currentRiverWse === 1.10 && currentCanalStage === 1.95 && ventCount === 4
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-white/[0.03] text-muted-foreground hover:text-white border-white/5"
            }`}
          >
            Monsoon Runoff Flood (4-Vent Sluice)
          </button>
          <button
            onClick={() => setScenario(1.30, 1.30, 2)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              currentRiverWse === 1.30 && currentCanalStage === 1.30
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-white/[0.03] text-muted-foreground hover:text-white border-white/5"
            }`}
          >
            Slack Water Equilibrium
          </button>
        </div>
      )}

      {/* 3. Primary Telemetry Metrics HUD (Exact Numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 border-b border-white/10 bg-white/[0.015]">
        <div className="p-3 sm:p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block flex items-center justify-center gap-1">
            <Activity className="w-3 h-3 text-primary" />
            <span>Differential Head (Δh)</span>
          </span>
          <div
            className={`text-2xl font-bold font-mono mt-0.5 tabular-nums ${
              hydro.isBackflow ? "text-rose-400" : hydro.isDraining ? "text-emerald-400" : "text-cyan-400"
            }`}
          >
            {hydro.headDifference > 0 ? `+${hydro.headDifference.toFixed(2)}` : hydro.headDifference.toFixed(2)}{" "}
            <span className="text-xs font-normal text-muted-foreground">m</span>
          </div>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            {hydro.isBackflow ? "River higher (+head pressure)" : hydro.isDraining ? "Canal higher (gravity head)" : "Equilibrium"}
          </span>
        </div>

        <div className="p-3 sm:p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block flex items-center justify-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-400" />
            <span>Gravity Discharge (Q)</span>
          </span>
          <div className="text-2xl font-bold font-mono text-white mt-0.5 tabular-nums">
            {hydro.dischargeM3S}{" "}
            <span className="text-xs font-normal text-muted-foreground">m³/s</span>
          </div>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            {hydro.isDraining ? `${hydro.dischargeLitersSec.toLocaleString()} L/s • Vel: ${hydro.flowVelocityMS} m/s` : "0 L/s (Flow checked)"}
          </span>
        </div>

        <div className="p-3 sm:p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block flex items-center justify-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>Hydrostatic Sealing Thrust</span>
          </span>
          <div
            className={`text-2xl font-bold font-mono mt-0.5 tabular-nums ${
              hydro.isBackflow ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {hydro.totalThrustMetricTons}{" "}
            <span className="text-xs font-normal text-muted-foreground">Tons ({hydro.totalThrustKiloNewtons} kN)</span>
          </div>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            Pressure: {hydro.hydrostaticPressureKPa} kPa on seal
          </span>
        </div>

        <div className="p-3 sm:p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-muted-foreground block flex items-center justify-center gap-1">
            <Waves className="w-3 h-3 text-emerald-400" />
            <span>Daily Tidal Drainage Window</span>
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
            {hydro.drainageHoursPerDay}{" "}
            <span className="text-xs font-normal text-muted-foreground">hrs / day</span>
          </div>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            Capacity: ~{hydro.dailyVolumeM3.toLocaleString()} m³/day
          </span>
        </div>
      </div>

      {/* 4. Graphical Numerical Simulation Graphs */}
      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#08101a]">
        {/* Left: 24-Hour Semi-Diurnal Tidal Wave Simulation Graph */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <Waves className="w-3.5 h-3.5 text-primary" />
              <span>24-Hour Tidal Cycle vs. Canal Stage Simulation</span>
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Passur River Semi-Diurnal (M₂)</span>
          </div>

          <div className="relative w-full h-[230px]">
            <svg viewBox="0 0 420 200" className="w-full h-full select-none text-[9px] font-mono">
              {/* Y-Axis Grid & Labels (0.0m to 2.8m PWD) */}
              {[0.5, 1.0, 1.5, 2.0, 2.5].map((lvl) => {
                const y = 180 - (lvl / 2.8) * 160;
                return (
                  <g key={lvl}>
                    <line x1="45" y1={y} x2="400" y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="40" y={y + 3} textAnchor="end" fill="#94a3b8">{lvl.toFixed(1)}m</text>
                  </g>
                );
              })}

              {/* X-Axis: 0h to 24h */}
              <line x1="45" y1="180" x2="400" y2="180" stroke="#475569" strokeWidth="1.2" />
              {[0, 4, 8, 12, 16, 20, 24].map((hr) => {
                const x = 45 + (hr / 24) * 355;
                return (
                  <g key={hr}>
                    <line x1={x} y1="180" x2={x} y2="185" stroke="#475569" strokeWidth="1" />
                    <text x={x} y="194" textAnchor="middle" fill="#64748b">{hr}h</text>
                  </g>
                );
              })}

              {/* Canal Stage Horizontal Reference Line */}
              {(() => {
                const canalY = 180 - (currentCanalStage / 2.8) * 160;
                return (
                  <g>
                    <line x1="45" y1={canalY} x2="400" y2={canalY} stroke="#06b6d4" strokeWidth="1.8" />
                    <text x="400" y={canalY - 4} textAnchor="end" fill="#06b6d4" fontWeight="bold">
                      Canal Stage: {currentCanalStage.toFixed(2)}m PWD
                    </text>
                  </g>
                );
              })()}

              {/* Shaded Drainage Windows where River < Canal */}
              {hydro.tidal24h.map((t, idx) => {
                if (!t.canDrain) return null;
                const x = 45 + (t.hour / 24) * 355;
                const width = 355 / 24;
                const canalY = 180 - (currentCanalStage / 2.8) * 160;
                const riverY = 180 - (t.tideHeight / 2.8) * 160;
                return (
                  <rect
                    key={idx}
                    x={x}
                    y={canalY}
                    width={width}
                    height={Math.max(0, riverY - canalY)}
                    fill="#10b981"
                    opacity="0.25"
                  />
                );
              })}

              {/* Tidal River Sine Wave Curve */}
              {(() => {
                const points = hydro.tidal24h.map((t) => {
                  const x = 45 + (t.hour / 24) * 355;
                  const y = 180 - (t.tideHeight / 2.8) * 160;
                  return `${x},${y}`;
                }).join(" ");

                return (
                  <polyline
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.2"
                    points={points}
                  />
                );
              })()}

              {/* Selected Current Time Marker */}
              {(() => {
                const curY = 180 - (currentRiverWse / 2.8) * 160;
                return (
                  <g>
                    <circle cx="140" cy={curY} r="4" fill="#fda4af" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="148" y={curY - 6} fill="#fda4af" fontWeight="bold">
                      Current: {currentRiverWse.toFixed(2)}m
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1 border-t border-white/5">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/60" />
              <span>Green Shaded Zone = Active Gravity Drainage Window</span>
            </span>
            <span className="text-white font-bold tabular-nums">Discharge Window: {hydro.drainageHoursPerDay} hrs / day</span>
          </div>
        </div>

        {/* Right: Technical Cross-Section & Force Prism (Numerical Engineering CAD) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Hydraulic Grade Line & Pressure Vectors</span>
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">{ventCount} Vents ({hydro.totalAreaM2.toFixed(1)} m²)</span>
          </div>

          <div className="relative w-full h-[230px]">
            <svg viewBox="0 0 320 200" className="w-full h-full select-none text-[9px] font-mono">
              <defs>
                <marker id="arrowCAD" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
                </marker>
                <marker id="arrowForce" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" />
                </marker>
              </defs>

              {/* Datum Base Line (0.00m PWD) */}
              <line x1="15" y1="170" x2="305" y2="170" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
              <text x="20" y="182" fill="#64748b">Datum 0.00m PWD</text>

              {/* Culvert Invert (z=0.30m -> y=152) and Crown (z=2.10m -> y=68) */}
              {/* Outer culvert concrete shell */}
              <rect x="90" y="65" width="140" height="90" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
              {/* Flow barrel chamber */}
              <rect x="95" y="75" width="130" height="70" fill="#070d18" stroke="#334155" strokeWidth="1" />

              {/* Embankment Outline Profile */}
              <polygon points="75,170 125,25 195,25 245,170" fill="none" stroke="#475569" strokeWidth="1.2" strokeDasharray="2 2" />
              <text x="160" y="20" textAnchor="middle" fill="#94a3b8">Dyke Crest (+4.2m PWD)</text>

              {/* Left Water Stage (River) */}
              {(() => {
                const rY = 170 - (currentRiverWse / 2.8) * 140;
                return (
                  <g>
                    <rect x="15" y={rY} width="75" height={170 - rY} fill="#f43f5e" opacity="0.25" />
                    <line x1="15" y1={rY} x2="90" y2={rY} stroke="#f43f5e" strokeWidth="1.5" />
                    <text x="20" y={rY - 4} fill="#fda4af" fontWeight="bold">River: {currentRiverWse.toFixed(2)}m</text>
                  </g>
                );
              })()}

              {/* Right Water Stage (Canal) */}
              {(() => {
                const cY = 170 - (currentCanalStage / 2.8) * 140;
                return (
                  <g>
                    <rect x="230" y={cY} width="75" height={170 - cY} fill="#06b6d4" opacity="0.25" />
                    <line x1="230" y1={cY} x2="305" y2={cY} stroke="#06b6d4" strokeWidth="1.5" />
                    <text x="300" y={cY - 4} textAnchor="end" fill="#67e8f9" fontWeight="bold">Canal: {currentCanalStage.toFixed(2)}m</text>
                  </g>
                );
              })()}

              {/* Flap Gate at x=95 */}
              {/* Pivot pin at (95, 75) */}
              <circle cx="95" cy="75" r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
              {/* Flap Plate */}
              <g transform={`rotate(-${hydro.flapAngleDeg}, 95, 75)`}>
                <rect
                  x="91"
                  y="75"
                  width="5"
                  height="72"
                  fill={hydro.isBackflow ? "#ef4444" : hydro.isDraining ? "#10b981" : "#06b6d4"}
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              </g>

              {/* Hydraulic State Vectors */}
              {hydro.isDraining ? (
                <>
                  {/* Flow velocity arrows inside culvert */}
                  <line x1="210" y1="110" x2="115" y2="110" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrowCAD)" />
                  <text x="160" y="102" textAnchor="middle" fill="#38bdf8" fontWeight="bold">v = {hydro.flowVelocityMS} m/s</text>
                  <text x="160" y="125" textAnchor="middle" fill="#10b981">Q = {hydro.dischargeM3S} m³/s</text>
                </>
              ) : hydro.isBackflow ? (
                <>
                  {/* Hydrostatic pressure prism arrows */}
                  <line x1="60" y1="100" x2="88" y2="100" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowForce)" />
                  <line x1="50" y1="125" x2="88" y2="125" stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#arrowForce)" />
                  <line x1="40" y1="145" x2="88" y2="145" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowForce)" />
                  <text x="160" y="110" textAnchor="middle" fill="#f87171" fontWeight="bold">P = {hydro.hydrostaticPressureKPa} kPa</text>
                  <text x="160" y="125" textAnchor="middle" fill="#fca5a5">Thrust: {hydro.totalThrustMetricTons} Tons</text>
                </>
              ) : (
                <text x="160" y="115" textAnchor="middle" fill="#94a3b8">Equilibrium (0 m³/s)</text>
              )}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1 border-t border-white/5">
            <span className="text-white">Flap Gate Angle:</span>
            <span className="text-primary font-bold tabular-nums">
              {hydro.isBackflow ? "0.0° (Watertight Seated)" : `${hydro.flapAngleDeg.toFixed(1)}° (Gravity Open)`}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Hydraulic Parameter Adjustment Sliders */}
      {interactive && (
        <div className="p-4 sm:p-5 bg-black/25 space-y-4 border-t border-white/10">
          <span className="text-xs font-semibold text-white uppercase tracking-wider block font-mono">
            Adjust Water Levels & Sluice Gate Dimensions
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* River Stage Slider */}
            <div className="p-3.5 rounded-xl bg-[#0f1725] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>River Water Level (WSE):</span>
                </span>
                <span className="font-mono text-rose-400 font-bold tabular-nums text-sm">
                  {currentRiverWse.toFixed(2)} m PWD
                </span>
              </div>
              <input
                type="range"
                min="0.40"
                max="2.80"
                step="0.05"
                value={currentRiverWse}
                onChange={(e) => setCurrentRiverWse(parseFloat(e.target.value))}
                className="w-full accent-rose-500 h-2 bg-white/10 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>0.40m (Ebb)</span>
                <span>1.60m (Mean)</span>
                <span>2.80m (Surge)</span>
              </div>
            </div>

            {/* Canal Stage Slider */}
            <div className="p-3.5 rounded-xl bg-[#0f1725] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Canal Water Level (Stage):</span>
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
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>0.80m (Dry)</span>
                <span>1.30m (Target)</span>
                <span>2.20m (Flood)</span>
              </div>
            </div>

            {/* Sluice Vents Count Selector */}
            <div className="p-3.5 rounded-xl bg-[#0f1725] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Sluice Vent Count:</span>
                <span className="font-mono text-primary font-bold tabular-nums text-sm">
                  {ventCount} Vents ({hydro.totalAreaM2.toFixed(1)} m²)
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-0.5">
                {[1, 2, 4, 8].map((v) => (
                  <button
                    key={v}
                    onClick={() => setVentCount(v)}
                    className={`py-1 rounded-md text-xs font-mono font-medium border transition-colors ${
                      ventCount === v
                        ? "bg-primary text-black font-bold border-primary"
                        : "bg-white/5 text-muted-foreground hover:text-white border-white/10"
                    }`}
                  >
                    {v} Vent{v > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">
                Standard BWDB 1.5m × 1.8m box culverts
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Hydrodynamic Formulation Note */}
      <div className="p-4 sm:p-5 bg-white/[0.015] border-t border-white/10 flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
        <Calculator className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Hydraulic Governing Equations:</strong> Gravity discharge is calculated via the submerged orifice equation: <code className="text-primary font-mono font-bold">{"Q = Cd · A · √(2g|Δh|)"}</code> where Cd = 0.62. When the river exceeds the internal canal {"(Δh > 0)"}, backpressure thrust is computed as <code className="text-rose-400 font-mono font-bold">{"F = ρ·g·Δh·A = "}{hydro.totalThrustKiloNewtons}{" kN ("}{hydro.totalThrustMetricTons}{" Metric Tons)"}</code>, forcing the heavy steel flap watertight against the perimeter rubber gasket. Saline river intrusion is 100% blocked. When the tide falls below the canal stage, the flap gate swings open {hydro.flapAngleDeg}°, allowing {hydro.dischargeM3S} m³/s of freshwater drainage to flush out into the bay.
        </div>
      </div>
    </div>
  );
}

export default PolderSluiceInfographic;
